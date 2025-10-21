"use client";

import { Toaster } from "sonner";
import React from "react";

/**
 * AppToaster — wraps Sonner's Toaster with default styling + positioning
 * Include once (usually in AppLayout or RootLayout)
 */
export const AppToaster = () => {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        duration: 3500,
        style: {
          fontSize: "0.9rem",
          borderRadius: "8px",
        },
      }}
    />
  );
};

export default AppToaster;
