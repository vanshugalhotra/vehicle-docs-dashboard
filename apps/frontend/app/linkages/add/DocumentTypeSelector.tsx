"use client";

import React from "react";
import { EntitySelector } from "@/components/ui/EntitySelector/EntitySelector";
import { apiRoutes } from "@/lib/apiRoutes";
import { DocumentTypeResponse } from "@/lib/types/document-type.types";

interface DocumentTypeSelectorProps {
  onSelect?: (documentType: DocumentTypeResponse | null) => void;
}

export default function DocumentTypeSelector({ onSelect }: DocumentTypeSelectorProps) {
  return (
    <EntitySelector<DocumentTypeResponse>
      label="Document"
      endpoint={apiRoutes.document_types.list}
      placeholder="Select a document..."
      variant="simple"
      simpleValue={(d) => d.name}
      onSelect={onSelect}
      transformOption={(data) =>
        data.map((d) => ({
          label: d.name,
          value: d.id,
        }))
      }
    />
  );
}