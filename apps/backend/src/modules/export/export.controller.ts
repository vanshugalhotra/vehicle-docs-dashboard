import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
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
    @Res() res: Response,
  ) {
    if (!EXPORT_WHITELIST.includes(type as ExportType)) {
      res.status(400).json({ message: `Unsupported export type "${type}"` });
      return;
    }

    const downloadFile = asFile === 'true';

    try {
      const result = await this.exportService.export(
        type as ExportType,
        downloadFile,
      );

      if (downloadFile) {
        if (!('buffer' in result)) {
          res.status(500).json({ message: 'Failed to generate Excel file' });
          return;
        }

        const buffer = Buffer.from(result.buffer);

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${result.filename}"`,
        );
        res.setHeader('Content-Length', buffer.byteLength.toString());

        res.send(buffer);
        return;
      }

      // JSON response for asFile=false
      res.json(result);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res
        .status(500)
        .json({ message: 'Error generating export', error: errorMessage });
    }
  }
}
