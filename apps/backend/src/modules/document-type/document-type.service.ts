import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { mapDocumentTypeToResponse } from './document-type.mapper';
import { DocumentTypeResponse } from 'src/common/types';
import { Prisma } from '@prisma/client';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { PaginatedDocumentTypeResponseDto } from './dto/document-type-response.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';
import { DocumentTypeValidationService } from './validation/document-type-validation.service';
import { AuditService } from '../audit/audit.service';
import { AuditEntity, AuditAction } from 'src/common/types/audit.types';

@Injectable()
export class DocumentTypesService {
  private readonly entity = 'DocumentType';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly validationService: DocumentTypeValidationService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateDocumentTypeDto): Promise<DocumentTypeResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'create',
      additional: { dto },
    };
    this.logger.logInfo(`Creating document type`, ctx);

    try {
      await this.validationService.validateCreate(dto.name);

      const documentType = await this.prisma.documentType.create({
        data: { name: dto.name },
      });
      this.logger.logInfo(`Document type created`, {
        ...ctx,
        additional: { id: documentType.id },
      });
      // audit
      await this.auditService.record<typeof documentType>({
        entityType: AuditEntity.DOCUMENT_TYPE,
        entityId: documentType.id,
        action: AuditAction.CREATE,
        actorUserId: null,
        oldRecord: null,
        newRecord: documentType,
      });
      return mapDocumentTypeToResponse(documentType);
    } catch (error) {
      this.logger.logError('Failed to create document type', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async findAll(
    query: QueryOptionsDto,
  ): Promise<PaginatedDocumentTypeResponseDto> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findAll',
      additional: { query },
    };
    this.logger.logDebug(`Fetching document types`, ctx);

    try {
      const queryArgs = buildQueryArgs<
        DocumentTypeResponse,
        Prisma.DocumentTypeWhereInput
      >(query, ['name']);

      const [documentTypes, total] = await Promise.all([
        this.prisma.documentType.findMany({
          where: queryArgs.where,
          skip: queryArgs.skip,
          take: queryArgs.take,
          orderBy: queryArgs.orderBy,
        }),
        this.prisma.documentType.count({ where: queryArgs.where }),
      ]);

      this.logger.logInfo(
        `Fetched ${documentTypes.length} of ${total} document types`,
        ctx,
      );

      return { items: documentTypes.map(mapDocumentTypeToResponse), total };
    } catch (error) {
      this.logger.logError('Failed to fetch document types', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async findOne(id: string): Promise<DocumentTypeResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'findOne',
      additional: { id },
    };
    this.logger.logInfo(`Fetching document type by id`, ctx);

    try {
      const documentType = await this.prisma.documentType.findUnique({
        where: { id },
      });
      if (!documentType) {
        this.logger.logWarn(`Document type not found`, ctx);
        throw new NotFoundException(`Document type with id "${id}" not found`);
      }

      return mapDocumentTypeToResponse(documentType);
    } catch (error) {
      this.logger.logError('Failed to fetch document type', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateDocumentTypeDto,
  ): Promise<DocumentTypeResponse> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'update',
      additional: { id, dto },
    };
    this.logger.logInfo(`Updating document type`, ctx);

    try {
      const documentType = await this.validationService.validateUpdate(
        id,
        dto.name,
      );

      const updated = await this.prisma.documentType.update({
        where: { id },
        data: { name: dto.name ?? documentType.name },
      });

      this.logger.logInfo(`Document type updated`, {
        ...ctx,
        additional: { id: updated.id },
      });
      // audit
      await this.auditService.record<typeof updated>({
        entityType: AuditEntity.DOCUMENT_TYPE,
        entityId: updated.id,
        action: AuditAction.UPDATE,
        actorUserId: null,
        oldRecord: documentType,
        newRecord: updated,
      });
      return mapDocumentTypeToResponse(updated);
    } catch (error) {
      this.logger.logError('Failed to update document type', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'remove',
      additional: { id },
    };
    this.logger.logInfo(`Deleting document type`, ctx);

    try {
      const documentType = await this.prisma.documentType.findUnique({
        where: { id },
      });
      if (!documentType) {
        this.logger.logWarn(`Delete failed, document type not found`, ctx);
        throw new NotFoundException(`Document type with id "${id}" not found`);
      }

      const linkedDocuments = await this.prisma.vehicleDocument.count({
        where: { documentTypeId: id },
      });
      if (linkedDocuments > 0) {
        this.logger.logWarn(`Cannot delete, linked vehicle documents exist`, {
          ...ctx,
          additional: { linkedDocuments },
        });
        throw new ConflictException(
          `Cannot delete document type "${documentType.name}" because ${linkedDocuments} vehicle document(s) are linked to it`,
        );
      }

      await this.prisma.documentType.delete({ where: { id } });
      this.logger.logInfo(`Document type deleted`, ctx);
      // audit
      await this.auditService.record<typeof documentType>({
        entityType: AuditEntity.DOCUMENT_TYPE,
        entityId: documentType.id,
        action: AuditAction.DELETE,
        actorUserId: null,
        oldRecord: documentType,
        newRecord: null,
      });
      return { success: true };
    } catch (error) {
      this.logger.logError('Failed to delete document type', {
        ...ctx,
        additional: { error },
      });
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, this.entity);
      throw error;
    }
  }
}
