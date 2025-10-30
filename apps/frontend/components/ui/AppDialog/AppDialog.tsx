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
  title?: ReactNode;
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
    <Transition show={open} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
      >
        {/* Overlay - Separate transition for instant appearance */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-0"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-overlay" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Dialog Panel */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
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
                    {typeof title === "string" ? (
                      <AppText size="heading3" className={componentTokens.text.primary}>
                        {title}
                      </AppText>
                    ) : (
                      title
                    )}
                  </DialogTitle>
                )}

                {/* Content */}
                <div className={componentTokens.dialog.content}>{children}</div>

                {/* Footer */}
                {footer && <div className={componentTokens.dialog.footer}>{footer}</div>}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};