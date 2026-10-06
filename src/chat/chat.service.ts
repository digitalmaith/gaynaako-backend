import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';

/** Corps d'erreur renvoyé par le chatbot */
type ChatbotErrorBody = {
  success?: boolean;
  error?: string;
  message?: string;
  detail?: string;
  [key: string]: unknown;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly chatbotUrl: string;
  private readonly internalToken?: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.chatbotUrl =
      this.config.get<string>('CHATBOT_URL') ?? 'http://localhost:3002';
    this.internalToken = this.config.get<string>('CHATBOT_INTERNAL_TOKEN');

    this.logger.log(`Chatbot URL : ${this.chatbotUrl}`);
    if (this.internalToken) {
      this.logger.log('Chatbot : token interne activé');
    }
  }

  async sendMessage(dto: SendMessageDto, userId: string) {
    return this.proxyToChatbot('/api/chat', {
      message: dto.message,
      session_id: dto.session_id,
      user_id: userId,
    });
  }

  async createSession(dto: CreateSessionDto, userId: string) {
    return this.proxyToChatbot('/api/chat/session', {
      user_id: userId,
      title: dto.title,
    });
  }

  async getHistory(sessionId: string, limit?: number) {
    return this.proxyToChatbot(
      `/api/chat/session/${sessionId}/history`,
      null,
      'GET',
      limit ? { limit } : undefined,
    );
  }

  async getUserSessions(userId: string) {
    return this.proxyToChatbot(`/api/chat/sessions/${userId}`, null, 'GET');
  }

  async deleteSession(sessionId: string) {
    return this.proxyToChatbot(
      `/api/chat/session/${sessionId}`,
      null,
      'DELETE',
    );
  }

  async health() {
    return this.proxyToChatbot('/api/chat/health', null, 'GET');
  }

  private async proxyToChatbot<T = Record<string, unknown>>(
    path: string,
    body: unknown,
    method: 'POST' | 'GET' | 'DELETE' = 'POST',
    params?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.chatbotUrl}${path}`;
    const headers: Record<string, string> = {};

    if (this.internalToken) {
      headers['X-Internal-Token'] = this.internalToken;
    }

    try {
      const request$ =
        method === 'GET'
          ? this.http.get(url, { headers, params })
          : method === 'DELETE'
            ? this.http.delete(url, { headers })
            : this.http.post(url, body, { headers });

      const { data } = await firstValueFrom(request$);
      return data as T;
    } catch (err) {
      const axiosErr = err as AxiosError;

      if (
        axiosErr.code === 'ECONNREFUSED' ||
        axiosErr.code === 'ENOTFOUND' ||
        axiosErr.code === 'ETIMEDOUT' ||
        axiosErr.code === 'ECONNABORTED'
      ) {
        this.logger.error(`Chatbot inaccessible (${url}) : ${axiosErr.code}`);
        throw new ServiceUnavailableException({
          success: false,
          error: 'Le service IA est temporairement indisponible.',
          code: 'CHATBOT_UNAVAILABLE',
        });
      }

      if (axiosErr.response) {
        const status = axiosErr.response.status;
        const errorBody = axiosErr.response.data as ChatbotErrorBody;

        this.logger.warn(
          `Chatbot a répondu ${status} : ${JSON.stringify(errorBody)}`,
        );

        throw new HttpException(errorBody, status);
      }

      this.logger.error(`Erreur proxy chatbot : ${axiosErr.message}`);
      throw new ServiceUnavailableException({
        success: false,
        error: 'Erreur de communication avec le service IA.',
      });
    }
  }
}
