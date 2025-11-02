"use client";

import React from "react";
import { EntitySelector } from "@/components/ui/EntitySelector/EntitySelector";
import { apiRoutes } from "@/lib/apiRoutes";
import { DocumentTypeResponse } from "@/lib/types/document-type.types";

export default function DocumentTypeSelector() {
  return (
    <EntitySelector<DocumentTypeResponse>
      label="Document"
      endpoint={apiRoutes.document_types.list}
      placeholder="Select a document..."
      variant="simple"
      simpleValue={(d) => d.name}
      transformOption={(data) =>
        data.map((d) => ({
          label: d.name,
          value: d.id,
        }))
      }
    />
  );
}