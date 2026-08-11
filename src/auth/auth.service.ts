import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { Role } from '../generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async register(
    dto: RegisterDto,
    logoFile?: { buffer: Buffer; filename: string },
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email déjà utilisé');

    if (
      (dto.role === Role.PME || dto.role === Role.ONG) &&
      !dto.organizationName
    ) {
      throw new ConflictException("Le nom de l'organisation est requis");
    }

    let logoUrl: string | undefined;
    if (logoFile) {
      logoUrl = await this.cloudinary.uploadLogo(
        logoFile.buffer,
        logoFile.filename,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        organizationName: dto.organizationName,
        logoUrl,
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.generateTokens(user.id, user.email, user.role);
  }

  private generateTokens(sub: string, email: string, role: Role) {
    const payload = { sub, email, role };
    return {
      accessToken: this.jwt.sign(payload),
    };
  }
}
