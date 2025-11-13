import { injectable } from 'inversify';
import { AppDataSource } from '../config/database';
import { Annotation } from '../entities/Annotation';
import { User } from '../entities/User';
import { Document } from '../entities/Document';
import { IAnnotationService, CreateAnnotationDTO, UpdateAnnotationDTO } from '../interfaces/IAnnotationService';

@injectable()
export class AnnotationService implements IAnnotationService {
  private readonly annotationRepository = AppDataSource.getRepository(Annotation);
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly documentRepository = AppDataSource.getRepository(Document);

  async create(annotationData: CreateAnnotationDTO): Promise<Annotation> {
    const user = await this.userRepository.findOne({
      where: { id: annotationData.userId },
    });

    const document = await this.documentRepository.findOne({
      where: { id: annotationData.documentId },
    });

    if (!user || !document) {
      throw new Error('User or document not found');
    }

    const annotation = this.annotationRepository.create({
      user,
      document,
      content: annotationData.content,
      isPrivate: annotationData.isPrivate ?? true,
      metadata: annotationData.metadata,
    });

    return this.annotationRepository.save(annotation);
  }

  async update(id: string, userId: string, annotationData: UpdateAnnotationDTO): Promise<Annotation> {
    const annotation = await this.annotationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!annotation) {
      throw new Error('Annotation not found');
    }

    if (annotation.user.id !== userId) {
      throw new Error('Not authorized to update this annotation');
    }

    if (annotationData.content !== undefined) {
      annotation.content = annotationData.content;
    }

    if (annotationData.isPrivate !== undefined) {
      annotation.isPrivate = annotationData.isPrivate;
    }

    if (annotationData.metadata !== undefined) {
      annotation.metadata = annotationData.metadata;
    }

    return this.annotationRepository.save(annotation);
  }

  async delete(id: string, userId: string): Promise<void> {
    const annotation = await this.annotationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!annotation) {
      throw new Error('Annotation not found');
    }

    if (annotation.user.id !== userId) {
      throw new Error('Not authorized to delete this annotation');
    }

    await this.annotationRepository.delete(id);
  }

  async findByDocument(documentId: string, userId?: string): Promise<Annotation[]> {
    const queryBuilder = this.annotationRepository
      .createQueryBuilder('annotation')
      .leftJoinAndSelect('annotation.user', 'user')
      .leftJoinAndSelect('annotation.document', 'document')
      .where('document.id = :documentId', { documentId });

    if (userId) {
      // Show public annotations and user's private annotations
      queryBuilder.andWhere(
        '(annotation.isPrivate = false OR (annotation.isPrivate = true AND user.id = :userId))',
        { userId }
      );
    } else {
      // Show only public annotations
      queryBuilder.andWhere('annotation.isPrivate = false');
    }

    return queryBuilder.orderBy('annotation.createdAt', 'DESC').getMany();
  }

  async findByUser(userId: string): Promise<Annotation[]> {
    return this.annotationRepository.find({
      where: { user: { id: userId } },
      relations: ['document'],
      order: { createdAt: 'DESC' },
    });
  }
}
