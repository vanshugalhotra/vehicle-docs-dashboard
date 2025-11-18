import { useRef } from "react";

export function useEditFocus() {
  const formRef = useRef<HTMLDivElement>(null);

  const focusForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 40);
  };

  return { formRef, focusForm };
}
