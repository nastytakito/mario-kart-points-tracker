"use client";

import { RefObject, useEffect, useRef } from "react";

export function useResetFormOnSuccess(
  formRef: RefObject<HTMLFormElement | null>,
  pending: boolean,
  hasError: boolean
) {
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !hasError) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, hasError, formRef]);
}
