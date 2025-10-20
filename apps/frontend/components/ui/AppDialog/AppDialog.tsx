"use client";
import React, { FC, ReactNode, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "../AppText";

interface AppDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = componentTokens.dialog.sizes;

export const AppDialog: FC<AppDialogProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          {/* Overlay */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={componentTokens.dialog.overlay} />
          </TransitionChild>

          {/* Trick for vertical centering */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          {/* Dialog Panel */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className={clsx(componentTokens.dialog.panel, sizeClasses[size])}>
              {/* Title */}
              {title && (
                <DialogTitle as="div" className={componentTokens.dialog.header}>
                  <AppText className={componentTokens.text.primary}>{title}</AppText>
                </DialogTitle>
              )}

              {/* Content */}
              <div className={componentTokens.dialog.content}>{children}</div>

              {/* Footer */}
              {footer && <div className={componentTokens.dialog.footer}>{footer}</div>}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};