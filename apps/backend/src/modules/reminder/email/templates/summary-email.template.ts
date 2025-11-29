import * as fs from 'fs';
import * as path from 'path';
import { SummaryEmailPayload } from 'src/common/types/reminder.types';

const TEMPLATE_PATH = path.join(__dirname, 'summary-email.html');

let cachedTemplate: string | null = null;

/** Load template file once */
function loadTemplate(): string {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  }
  return cachedTemplate;
}

/* ----------------------------------------------------
 * RESOLVER
 * -------------------------------------------------- */
function resolveKey(obj: unknown, key: string): unknown {
  if (typeof obj !== 'object' || obj === null) return undefined;

  const ctx = obj as Record<string, unknown>;
  const parts = key.split('.');

  let current: unknown = ctx;
  for (const part of parts) {
    if (
      typeof current === 'object' &&
      current !== null &&
      Object.prototype.hasOwnProperty.call(current, part)
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/* ----------------------------------------------------
 * TEMPLATE RENDERER
 * -------------------------------------------------- */
function render(template: string, context: Record<string, unknown>): string {
  let output = template;

  // Handle {{#if var}}
  output = output.replace(
    /{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g,
    (match: string, rawKey: string, inner: string) => {
      const key = String(rawKey).trim();
      const value = resolveKey(context, key);
      return value ? inner : '';
    },
  );

  // Handle {{#each list}}
  output = output.replace(
    /{{#each ([^}]+)}}([\s\S]*?){{\/each}}/g,
    (match: string, rawKey: string, block: string) => {
      const key = String(rawKey).trim();
      const list = resolveKey(context, key);

      if (!Array.isArray(list) || list.length === 0) return '';

      return list
        .map((item) => {
          const merged: Record<string, unknown> = {
            ...context,
            ...(item as Record<string, unknown>),
          };
          return render(block, merged);
        })
        .join('');
    },
  );

  // Simple {{var}}
  output = output.replace(/{{([^}]+)}}/g, (match: string, rawKey: string) => {
    const key = String(rawKey).trim();
    const value = resolveKey(context, key);

    if (value === null || value === undefined) return '';

    // Proper object handling
    if (typeof value === 'object') {
      // Use JSON.stringify for objects to get meaningful output
      return JSON.stringify(value);
    }
    return String(value as Exclude<typeof value, object>);
  });

  return output;
}

/* ----------------------------------------------------
 * COLOR RULES BY OFFSET DAYS
 * -------------------------------------------------- */
function getColor(offset: number): { color: string; colorText: string } {
  // expired
  if (offset < 0) return { color: '#dc2626', colorText: '#b91c1c' };

  // 1–3 = orange
  if (offset >= 1 && offset <= 3)
    return { color: '#ea580c', colorText: '#c2410c' };

  // 4–7 = orange/yellow
  if (offset >= 4 && offset <= 7)
    return { color: '#ca8a04', colorText: '#854d0e' };

  // 8–30 = blue
  if (offset > 7 && offset <= 30)
    return { color: '#0284c7', colorText: '#075985' };

  // >30 = green
  return { color: '#16a34a', colorText: '#166534' };
}

/* ----------------------------------------------------
 * TRANSFORM PAYLOAD → TEMPLATE MODEL
 * -------------------------------------------------- */
function transformPayload(payload: SummaryEmailPayload[]) {
  return payload.map((group) => {
    const offsetDays = group.items.length > 0 ? group.items[0].offsetDays : 0;

    const colorConfig = getColor(offsetDays);

    const items = group.items.map((it) => {
      const expiry = new Date(it.expiryDate);

      const expiryDateFormatted = expiry.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const today = new Date();
      const diff = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      const expiryStatus =
        diff < 0
          ? `Expired ${Math.abs(diff)} days ago`
          : diff === 0
            ? 'Expires today'
            : `In ${diff} days`;

      return {
        ...it,
        expiryDateFormatted,
        expiryStatus,
        colorText: colorConfig.colorText,
      };
    });

    return {
      configName: group.configName,
      offsetDays,
      count: items.length,
      color: colorConfig.color,
      colorText: colorConfig.colorText,
      items,
    };
  });
}

/* ----------------------------------------------------
 * MAIN EXPORT
 * -------------------------------------------------- */
export function renderSummaryEmailHtml(
  payload: SummaryEmailPayload[],
  opts?: { preface?: string },
): string {
  const template = loadTemplate();
  const groups = transformPayload(payload);

  const context: Record<string, unknown> = {
    appTitle: 'YASH GROUP DASHBOARD',
    date: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    preface: opts?.preface ?? null,
    groups,
  };

  return render(template, context);
}
