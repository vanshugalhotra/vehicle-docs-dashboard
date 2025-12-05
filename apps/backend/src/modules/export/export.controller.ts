import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { ExportType, EXPORT_WHITELIST } from './export.config';
import { AuthGuard } from '../auth/auth.gaurd';
import { Response } from 'express';

@ApiTags('Exports')
@UseGuards(AuthGuard)
@Controller({ path: 'export', version: '1' })
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get(':type')
  @ApiQuery({
    name: 'asFile',
    required: false,
    type: Boolean,
    description: 'Set true to download as XLSX, otherwise returns JSON',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Export data fetched or file downloaded successfully',
  })
  @ApiResponse({ status: 400, description: 'Unsupported export type' })
  async export(
    @Param('type') type: string,
    @Query('asFile') asFile: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!EXPORT_WHITELIST.includes(type as ExportType)) {
      throw new BadRequestException(`Unsupported export type "${type}"`);
    }

    const downloadFile = asFile === 'true';

    const result = await this.exportService.export(
      type as ExportType,
      downloadFile,
    );

    if (downloadFile) {
      if (!('buffer' in result)) {
        throw new BadRequestException('Failed to generate Excel file');
      }

      // Convert ArrayBuffer to Node.js Buffer
      const buffer = Buffer.from(result.buffer);

      // Set headers for download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.filename}"`,
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());

      return res.send(buffer);
    }

    // Return JSON if not downloading file
    return result;
  }
}
