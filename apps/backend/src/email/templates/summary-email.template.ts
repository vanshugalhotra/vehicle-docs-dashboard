import * as fs from 'fs';
import * as path from 'path';
import { SummaryEmailPayload } from 'src/common/types/reminder.types';
import { calculateDaysRemaining } from 'src/common/utils/date-utils';

const TEMPLATE_PATH = path.join(__dirname, 'summary-email.html');

let cachedTemplate: string | null = null;

function loadTemplate(): string {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  }
  return cachedTemplate;
}

// ============================================================================
// TYPES
// ============================================================================

interface ColorConfig {
  color: string;
  colorText: string;
  bgColor: string;
}

interface ProcessedItem {
  documentTypeName: string;
  vehicleName: string;
  documentNumber: string;
  expiryDate: Date;
  expiryDateFormatted: string;
  daysRemaining: number;
  expiryStatus: string;
  statusColor: string;
  statusBg: string;
}

interface ProcessedGroup {
  configName: string;
  count: number;
  color: string;
  badgeBg: string;
  items: ProcessedItem[];
}

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

function getColorConfig(daysRemaining: number): ColorConfig {
  if (daysRemaining < 0) {
    return {
      color: '#dc2626',
      colorText: '#b91c1c',
      bgColor: '#fee2e2',
    };
  }
  if (daysRemaining <= 0) {
    return {
      color: '#dc2626',
      colorText: '#b91c1c',
      bgColor: '#fee2e2',
    };
  }
  if (daysRemaining <= 3) {
    return {
      color: '#ea580c',
      colorText: '#c2410c',
      bgColor: '#ffedd5',
    };
  }
  if (daysRemaining <= 7) {
    return {
      color: '#ca8a04',
      colorText: '#854d0e',
      bgColor: '#fef3c7',
    };
  }
  if (daysRemaining <= 30) {
    return {
      color: '#0284c7',
      colorText: '#075985',
      bgColor: '#dbeafe',
    };
  }
  return {
    color: '#16a34a',
    colorText: '#166534',
    bgColor: '#dcfce7',
  };
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatExpiryStatus(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const absDays = Math.abs(daysRemaining);
    return `Expired ${absDays} day${absDays === 1 ? '' : 's'} ago`;
  }
  if (daysRemaining === 0) {
    return 'Expires today';
  }
  if (daysRemaining === 1) {
    return 'Expires tomorrow';
  }
  return `Expires in ${daysRemaining} days`;
}

// ============================================================================
// HTML GENERATION (DYNAMIC PARTS)
// ============================================================================

function generateItemCard(item: ProcessedItem): string {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">${escapeHtml(item.documentTypeName)} – ${escapeHtml(item.vehicleName)}</div>
        <div class="card-date">Expires on: ${escapeHtml(item.expiryDateFormatted)}</div>
      </div>
      <div class="card-footer">
        <div class="doc-number">Document No: ${escapeHtml(item.documentNumber)}</div>
        <div class="expiry-status" style="color: ${item.statusColor}; background: ${item.statusBg};">
          ${escapeHtml(item.expiryStatus)}
        </div>
      </div>
    </div>
  `;
}

function generateGroupSection(group: ProcessedGroup): string {
  if (group.items.length === 0) {
    return '';
  }

  // Sort items by expiry date (soonest first)
  const sortedItems = [...group.items].sort(
    (a, b) => a.daysRemaining - b.daysRemaining,
  );

  const itemsHtml = sortedItems.map((item) => generateItemCard(item)).join('');

  return `
    <div class="section">
      <div class="group-header">
        <div class="group-title-wrapper">
          <span class="group-accent" style="background: ${group.color};"></span>
          <div>
            <span class="group-title">${escapeHtml(group.configName)}</span>
            <span class="group-count">(${group.count})</span>
          </div>
        </div>
      </div>
      <div class="group-content">
        ${itemsHtml}
      </div>
    </div>
  `;
}

function generatePreface(preface?: string): string {
  if (!preface) return '';
  return `<div class="preface">${escapeHtml(preface)}</div>`;
}

function generateCtaButton(dashboardUrl?: string): string {
  if (!dashboardUrl) return '';

  return `
    <div class="cta-container">
      <a href="${escapeHtml(dashboardUrl)}" class="cta-button">
        Go to Dashboard
      </a>
    </div>
  `;
}

function generateGroupsSection(groups: ProcessedGroup[]): string {
  const groupsHtml = groups
    .map((group) => generateGroupSection(group))
    .join('');

  // If no groups have items, show a message
  if (!groupsHtml.trim()) {
    return '<div class="section" style="text-align: center; color: #64748b; padding: 40px 24px;">No reminders scheduled for today.</div>';
  }

  return groupsHtml;
}

// ============================================================================
// TEMPLATE RENDERER
// ============================================================================

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTemplate(
  template: string,
  replacements: Record<string, string>,
): string {
  let result = template;

  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }

  return result;
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function processPayload(payload: SummaryEmailPayload[]): ProcessedGroup[] {
  return (
    payload
      .filter((group) => group.items.length > 0)
      .map((group): ProcessedGroup => {
        // Process and sort items for this group
        const processedItems: ProcessedItem[] = group.items.map((item) => {
          const expiryDate = new Date(item.expiryDate);
          const daysRemaining = calculateDaysRemaining(expiryDate);
          const colorConfig = getColorConfig(daysRemaining);

          return {
            documentTypeName: item.documentTypeName,
            vehicleName: item.vehicleName,
            documentNumber: item.documentNumber,
            expiryDate,
            expiryDateFormatted: formatDate(expiryDate),
            daysRemaining,
            expiryStatus: formatExpiryStatus(daysRemaining),
            statusColor: colorConfig.colorText,
            statusBg: colorConfig.bgColor,
          };
        });

        // Determine group color based on most urgent item
        const mostUrgentItem = [...processedItems].sort(
          (a, b) => a.daysRemaining - b.daysRemaining,
        )[0];
        const groupColorConfig = getColorConfig(
          mostUrgentItem?.daysRemaining || 0,
        );

        return {
          configName: group.configName,
          count: processedItems.length,
          color: groupColorConfig.color,
          badgeBg: groupColorConfig.bgColor,
          items: processedItems,
        };
      })
      // Sort groups: expired first, then by urgency
      .sort((a, b) => {
        const aMinDays = Math.min(...a.items.map((i) => i.daysRemaining));
        const bMinDays = Math.min(...b.items.map((i) => i.daysRemaining));

        // Expired items go first
        if (aMinDays < 0 && bMinDays >= 0) return -1;
        if (aMinDays >= 0 && bMinDays < 0) return 1;

        // Then by urgency (most urgent first)
        return aMinDays - bMinDays;
      })
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export interface RenderOptions {
  preface?: string;
  dashboardUrl?: string;
}

export function renderSummaryEmailHtml(
  payload: SummaryEmailPayload[],
  opts?: RenderOptions,
): string {
  const template = loadTemplate();
  const groups = processPayload(payload);
  const currentDate = formatDate(new Date());

  // Generate dynamic content
  const ctaButtonHtml = generateCtaButton(opts?.dashboardUrl);
  const prefaceHtml = generatePreface(opts?.preface);
  const groupsHtml = generateGroupsSection(groups);

  // Prepare replacements
  const replacements = {
    APP_TITLE: 'YASH GROUP DASHBOARD',
    DATE: currentDate,
    CTA_BUTTON: ctaButtonHtml,
    PREFACE: prefaceHtml,
    GROUPS: groupsHtml,
  };

  // Render template
  return renderTemplate(template, replacements);
}
