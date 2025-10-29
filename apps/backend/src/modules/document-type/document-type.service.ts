import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { mapDocumentTypeToResponse } from './document-type.mapper';
import { DocumentTypeResponse } from 'src/common/types';
import { Prisma } from '@prisma/client';
import { QueryOptionsDto } from 'src/common/dto/query-options.dto';
import { PaginatedDocumentTypeResponseDto } from './dto/document-type-response.dto';
import { buildQueryArgs } from 'src/common/utils/query-builder';

@Injectable()
export class DocumentTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateDocumentTypeDto): Promise<DocumentTypeResponse> {
    const name = dto.name.trim();
    this.logger.info(`Creating document type: ${name}`);
    try {
      const existing = await this.prisma.documentType.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });
      if (existing) {
        this.logger.warn(
          `Document type creation failed, already exists: ${name}`,
        );
        throw new ConflictException(
          `Document type with name "${name}" already exists`,
        );
      }

      const documentType = await this.prisma.documentType.create({
        data: { name: name },
      });
      this.logger.info(`Document type created: ${documentType.id}`);
      return mapDocumentTypeToResponse(documentType);
    } catch (error) {
      handlePrismaError(error, 'DocumentType');
    }
  }

  /**
   * Fetch all document types with pagination, search, sorting, and filters.
   */
  async findAll(
    query: QueryOptionsDto,
  ): Promise<PaginatedDocumentTypeResponseDto> {
    this.logger.debug(
      `Fetching document types with params: ${JSON.stringify(query, null, 2)}`,
    );

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

      this.logger.info(
        `Fetched ${documentTypes.length} of ${total} document types`,
      );

      return {
        items: documentTypes.map(mapDocumentTypeToResponse),
        total,
      };
    } catch (error) {
      handlePrismaError(error, 'DocumentType');
    }
  }

  async findOne(id: string): Promise<DocumentTypeResponse> {
    this.logger.info(`Fetching document type by id: ${id}`);
    try {
      const documentType = await this.prisma.documentType.findUnique({
        where: { id },
      });
      if (!documentType) {
        this.logger.warn(`Document type not found: ${id}`);
        throw new NotFoundException(`Document type with id ${id} not found`);
      }
      return mapDocumentTypeToResponse(documentType);
    } catch (error) {
      handlePrismaError(error, 'DocumentType');
    }
  }

  async update(
    id: string,
    dto: UpdateDocumentTypeDto,
  ): Promise<DocumentTypeResponse> {
    this.logger.info(`Updating document type: ${id}`);
    try {
      const documentType = await this.prisma.documentType.findUnique({
        where: { id },
      });
      if (!documentType) {
        this.logger.warn(`Update failed, document type not found: ${id}`);
        throw new NotFoundException(`Document type with id ${id} not found`);
      }

      if (dto.name && dto.name !== documentType.name) {
        const existing = await this.prisma.documentType.findFirst({
          where: { name: { equals: dto.name, mode: 'insensitive' } },
        });
        if (existing) {
          this.logger.warn(
            `Update failed, duplicate document type name: ${dto.name}`,
          );
          throw new ConflictException(
            `Document type with name "${dto.name}" already exists`,
          );
        }
      }

      const updated = await this.prisma.documentType.update({
        where: { id },
        data: { name: dto.name ?? documentType.name },
      });
      this.logger.info(`Document type updated: ${updated.id}`);
      return mapDocumentTypeToResponse(updated);
    } catch (error) {
      handlePrismaError(error, 'DocumentType');
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    this.logger.info(`Deleting document type: ${id}`);
    try {
      const documentType = await this.prisma.documentType.findUnique({
        where: { id },
      });
      if (!documentType) {
        this.logger.warn(`Delete failed, document type not found: ${id}`);
        throw new NotFoundException(`Document type with id ${id} not found`);
      }

      // Prevent deletion if any vehicle document is linked
      const linkedDocuments = await this.prisma.vehicleDocument.count({
        where: { documentTypeId: id },
      });
      if (linkedDocuments > 0) {
        this.logger.warn(
          `Delete failed, document type has ${linkedDocuments} linked vehicle document(s): ${id}`,
        );
        throw new BadRequestException(
          `Cannot delete document type "${documentType.name}" because ${linkedDocuments} vehicle document(s) are linked to it`,
        );
      }

      await this.prisma.documentType.delete({ where: { id } });
      this.logger.info(`Document type deleted: ${id}`);
      return { success: true };
    } catch (error) {
      handlePrismaError(error, 'DocumentType');
    }
  }
}
