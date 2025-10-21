import { toast } from "sonner";

/**
 * toastUtils — centralized helper for Sonner toasts
 * keeps toast usage consistent across the app
 */
export const toastUtils = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  promise: <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),
};
