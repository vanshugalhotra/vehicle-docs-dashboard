import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AuditLogItem } from "./AuditLogItem";
import { AuditAction, AuditEntity } from "@/lib/types/audit.types";

const meta: Meta<typeof AuditLogItem> = {
  title: "Audit/AuditLogItem",
  component: AuditLogItem,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AuditLogItem>;

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
  id: "log_123",
  entityType: AuditEntity.VEHICLE,
  entityId: "vehicle_456",
  action: AuditAction.UPDATE,
  actor: {
    id: "user_789",
    label: "John Doe",
  },
  summary: "Vehicle location updated",
  timestamp: {
    date: new Date(),
    relative: "2 hours ago",
    absolute: "2024-01-15 14:30:00",
  },
  ...overrides,
});

export const Default: Story = {
  args: {
    log: createLog(),
  },
};

export const WithChanges: Story = {
  args: {
    log: createLog({
      context: {
        event: "vehicle.location_changed",
        changes: [
          {
            field: "locationId",
            from: "Warehouse A",
            to: "Service Center",
          },
          {
            field: "status",
            from: "Available",
            to: "In Service",
          },
        ],
      },
    }),
  },
};

export const WithRelated: Story = {
  args: {
    log: createLog({
      action: AuditAction.CREATE,
      summary: "New vehicle added to fleet",
      context: {
        event: "vehicle.created",
        related: {
          driverId: "DRV-001",
          ownerId: "OWN-456",
          licensePlate: "ABC-123",
        },
      },
    }),
  },
};

export const WithChangesAndRelated: Story = {
  args: {
    log: createLog({
      context: {
        event: "vehicle.driver_assigned",
        changes: [
          {
            field: "driverId",
            from: null,
            to: "DRV-789",
          },
        ],
        related: {
          driverName: "Michael Chen",
          driverPhone: "+1 234-567-8900",
        },
      },
    }),
  },
};

export const DeletedItem: Story = {
  args: {
    log: createLog({
      action: AuditAction.DELETE,
      summary: "Vehicle removed from fleet",
      context: {
        event: "vehicle.deleted",
      },
    }),
  },
};

export const ExpandedByDefault: Story = {
  args: {
    log: createLog({
      context: {
        event: "vehicle.updated",
        changes: [
          {
            field: "licensePlate",
            from: "OLD-123",
            to: "NEW-456",
          },
        ],
      },
    }),
    defaultExpanded: true,
  },
};

export const NoExpandableContent: Story = {
  args: {
    log: createLog({
      context: undefined,
    }),
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <AuditLogItem
        log={createLog({
          action: AuditAction.CREATE,
          summary: "New user account created",
          entityType: AuditEntity.USER,
        })}
      />
      <AuditLogItem
        log={createLog({
          action: AuditAction.UPDATE,
          summary: "Document renewed",
          entityType: AuditEntity.VEHICLE_DOCUMENT,
        })}
      />
      <AuditLogItem
        log={createLog({
          action: AuditAction.DELETE,
          summary: "Location removed",
          entityType: AuditEntity.LOCATION,
        })}
      />
    </div>
  ),
};
