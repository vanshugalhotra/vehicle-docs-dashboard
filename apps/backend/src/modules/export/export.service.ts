import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService, LogContext } from 'src/common/logger/logger.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { EXPORT_CONFIGS, ExportType } from './export.config';
import { prepareExportPayload } from './export.mapper';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';

type PrismaModel = {
  findMany: (args?: { include?: Record<string, boolean> }) => Promise<any[]>;
};

@Injectable()
export class ExportService {
  private readonly entity = 'Export';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Fetch and map export data.
   * @param type Export type
   * @param asFile If true, generates Excel buffer for download
   */
  async export(
    type: ExportType,
    asFile = false,
  ): Promise<
    | {
        filename: string;
        sheetName: string;
        records: Record<string, unknown>[];
      }
    | { filename: string; buffer: ArrayBuffer }
  > {
    const ctx: LogContext = {
      entity: this.entity,
      action: 'export',
      additional: { type },
    };

    this.logger.logInfo('Processing export request', ctx);

    try {
      // Get export config
      const config = EXPORT_CONFIGS[type];
      if (!config)
        throw new BadRequestException(`Unsupported export type "${type}"`);

      // Get Prisma model
      const prismaModel = this.prisma[config.model] as PrismaModel;
      if (!prismaModel || typeof prismaModel.findMany !== 'function') {
        throw new BadRequestException(
          `Prisma model not found for type "${type}"`,
        );
      }

      // Fetch data
      const data = await prismaModel.findMany({ include: config.include });

      // Map to export format
      const mapped = prepareExportPayload(type, data);

      // If asFile=true, generate Excel buffer
      if (asFile) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(mapped.sheetName);

        if (mapped.records.length > 0) {
          // Add header row
          sheet.addRow(Object.keys(mapped.records[0]));
          // Add data rows
          mapped.records.forEach((record) =>
            sheet.addRow(Object.values(record)),
          );
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return {
          filename: mapped.filename + '.xlsx',
          buffer: buffer as ArrayBuffer,
        };
      }

      return mapped;
    } catch (err: unknown) {
      const error = err as Error;
      this.logger.logError('Error processing export', {
        ...ctx,
        additional: { error },
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, this.entity);
      }
      throw error;
    }
  }
}
