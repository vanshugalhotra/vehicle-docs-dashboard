import { useState } from "react";

export type FormMode = "modal" | "embedded";

export interface FormStateController<T = unknown> {
  isOpen: boolean; // for modal
  isEditing: boolean; // true if editing existing item
  selectedItem?: T | null; // currently editing object
  openCreate: () => void; // open form for create
  openEdit: (item: T) => void; // open form for editing
  closeForm: () => void; // close modal or deselect embedded form
}

export const useFormStateController = <T = unknown>(
  mode: FormMode = "modal"
): FormStateController<T> => {
  const [isOpen, setIsOpen] = useState(mode === "embedded"); // embedded form always visible
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openCreate = () => {
    setIsEditing(false);
    setSelectedItem(null);
    if (mode === "modal") setIsOpen(true);
  };

  const openEdit = (item: T) => {
    setIsEditing(true);
    setSelectedItem(item);
    if (mode === "modal") setIsOpen(true);
  };

  const closeForm = () => {
    setIsEditing(false);
    setSelectedItem(null);
    if (mode === "modal") setIsOpen(false);
  };

  return {
    isOpen,
    isEditing,
    selectedItem,
    openCreate,
    openEdit,
    closeForm,
  };
};
