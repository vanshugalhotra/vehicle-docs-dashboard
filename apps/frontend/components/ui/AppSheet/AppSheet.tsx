"use client";
import React, { FC, ReactNode, Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";

interface AppSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = componentTokens.sheet.sizes;

export const AppSheet: FC<AppSheetProps> = ({
  open,
  onClose,
  title,
  children,
  size = "md",
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-hidden"
        onClose={onClose}
      >
        <div className="absolute inset-0 overflow-hidden">
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
            <div className={componentTokens.sheet.overlay} />
          </TransitionChild>

          {/* Sheet Panel */}
          <div className={componentTokens.sheet.container}>
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <DialogPanel className={clsx(componentTokens.sheet.panel, sizeClasses[size])}>
                {title && (
                  <div className={componentTokens.sheet.header}>
                    <DialogTitle as="h3" className={componentTokens.text.primary}>
                      {title}
                    </DialogTitle>
                    <button
                      onClick={onClose}
                      className={componentTokens.sheet.close}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className={componentTokens.sheet.content}>
                  {children}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};