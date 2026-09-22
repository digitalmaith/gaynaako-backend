// src/abonnements/plans.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PlanRepository } from './repositories/plan.repository';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly planRepository: PlanRepository) {}

  listActifs() {
    return this.planRepository.findAllActifs();
  }

  async getById(id: string) {
    const plan = await this.planRepository.findById(id);
    if (!plan) throw new NotFoundException('Plan introuvable');
    return plan;
  }

  async create(dto: CreatePlanDto) {
    const existing = await this.planRepository.findByNom(dto.nom);
    if (existing) throw new ConflictException('Un plan avec ce nom existe déjà');
    return this.planRepository.create(dto);
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.getById(id);
    return this.planRepository.update(id, dto);
  }

  async setFonctionnalite(id: string, cle: string, valeur: string) {
    await this.getById(id);
    return this.planRepository.setFonctionnalite(id, cle, valeur);
  }

  async removeFonctionnalite(id: string, cle: string) {
    await this.getById(id);
    return this.planRepository.removeFonctionnalite(id, cle);
  }
}
