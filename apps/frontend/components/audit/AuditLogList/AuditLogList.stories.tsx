import type { Meta, StoryObj } from "@storybook/react";
import { AuditLogList } from "./AuditLogList";
import { AuditAction, AuditEntity } from "@/lib/types/audit.types";

const meta: Meta<typeof AuditLogList> = {
  title: "Audit/AuditLogList",
  component: AuditLogList,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AuditLogList>;

type AuditLogMock = {
  id: string;
  entityType: AuditEntity;
  entityId: string;
  action: AuditAction;
  actor: { id: string; label: string };
  summary: string;
  timestamp: { date: Date; relative: string; absolute: string };
  context?: Record<string, unknown> | undefined;
};

const createLog = (overrides?: Partial<AuditLogMock>): AuditLogMock => ({
  id: `log_${Math.random().toString(36).substr(2, 9)}`,
  entityType: AuditEntity.VEHICLE,
  entityId: `vehicle_${Math.random().toString(36).substr(2, 9)}`,
  action: AuditAction.UPDATE,
  actor: {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    label: "John Doe",
  },
  summary: "Vehicle location updated",
  timestamp: {
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    relative: "2 hours ago",
    absolute: new Date().toISOString().replace("T", " ").substring(0, 19),
  },
  ...overrides,
});

// Helper to generate multiple logs
const generateLogs = (
  count: number,
  overrides?: Partial<AuditLogMock>[]
): AuditLogMock[] => {
  return Array.from({ length: count }, (_, i) => {
    const baseLog = createLog();
    const customOverrides = overrides && overrides[i] ? overrides[i] : {};

    return {
      ...baseLog,
      timestamp: {
        ...baseLog.timestamp,
        relative: `${i + 1} ${i === 0 ? "hour" : "hours"} ago`,
      },
      ...customOverrides,
    };
  });
};

export const Default: Story = {
  args: {
    logs: generateLogs(3),
  },
};

export const SingleItem: Story = {
  args: {
    logs: generateLogs(1, [
      {
        action: AuditAction.CREATE,
        summary: "New vehicle added to fleet",
        context: {
          event: "vehicle.created",
          related: {
            licensePlate: "ABC-123",
            chassisNumber: "CHS-456789",
          },
        },
      },
    ]),
  },
};

export const ManyItems: Story = {
  args: {
    logs: generateLogs(8, [
      {
        action: AuditAction.CREATE,
        summary: "New vehicle added",
      },
      {
        action: AuditAction.UPDATE,
        summary: "Driver assigned",
        context: {
          event: "vehicle.driver_assigned",
          changes: [{ field: "driverId", from: null, to: "DRV-789" }],
        },
      },
      {
        action: AuditAction.UPDATE,
        summary: "Document renewed",
        entityType: AuditEntity.VEHICLE_DOCUMENT,
      },
      {
        action: AuditAction.DELETE,
        summary: "Location removed",
        entityType: AuditEntity.LOCATION,
      },
      {
        action: AuditAction.UPDATE,
        summary: "User email updated",
        entityType: AuditEntity.USER,
      },
      {
        action: AuditAction.CREATE,
        summary: "New driver registered",
        entityType: AuditEntity.DRIVER,
      },
      {
        action: AuditAction.UPDATE,
        summary: "Owner details updated",
        entityType: AuditEntity.OWNER,
      },
      {
        action: AuditAction.DELETE,
        summary: "Document type removed",
        entityType: AuditEntity.DOCUMENT_TYPE,
      },
    ]),
  },
};

export const LoadingState: Story = {
  args: {
    logs: [],
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    logs: [],
  },
};

export const MixedContent: Story = {
  args: {
    logs: generateLogs(5, [
      {
        action: AuditAction.CREATE,
        summary: "Vehicle created",
        context: {
          event: "vehicle.created",
          related: { licensePlate: "XYZ-789" },
        },
      },
      {
        action: AuditAction.UPDATE,
        summary: "Location changed",
        context: {
          event: "vehicle.location_changed",
          changes: [{ field: "locationId", from: "WH-001", to: "WH-002" }],
        },
      },
      {
        summary: "Simple update without details",
      },
      {
        action: AuditAction.UPDATE,
        summary: "Multiple changes",
        context: {
          event: "vehicle.updated",
          changes: [
            { field: "status", from: "IDLE", to: "ACTIVE" },
            { field: "mileage", from: "15000", to: "15250" },
          ],
          related: { driverName: "Alex Johnson" },
          meta: { ip: "192.168.1.1" },
        },
      },
      {
        action: AuditAction.DELETE,
        summary: "Document removed",
        entityType: AuditEntity.VEHICLE_DOCUMENT,
      },
    ]),
  },
};
