import React, { FC, ReactNode, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import clsx from "clsx";
import { radius, shadow, transition } from "../../tokens/designTokens";

interface AppSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<string, string> = {
  sm: "w-80",
  md: "w-96",
  lg: "w-[500px]",
};

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
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-50"
            leave="ease-in duration-200"
            leaveFrom="opacity-50"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black opacity-50" />
          </TransitionChild>

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-4">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <DialogPanel
                className={clsx(
                  "h-full bg-white flex flex-col",
                  sizeClasses[size],
                  radius.md,
                  shadow.lg,
                  transition.base
                )}
              >
                {title && (
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <DialogTitle as="h3" className="text-lg font-semibold">
                      {title}
                    </DialogTitle>
                    <button
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="p-6 overflow-auto flex-1">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
