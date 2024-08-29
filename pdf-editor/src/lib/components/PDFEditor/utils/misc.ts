import { useRef } from "react";

export const getViewerInstance = (pdfIframe: HTMLIFrameElement) => {
  if (
    !pdfIframe.contentWindow ||
    pdfIframe.contentWindow.document.readyState !== "complete"
  ) {
    throw new Error("页面尚未加载完成");
  }

  const { PDFViewerApplication, PDFViewerApplicationOptions } =
    pdfIframe.contentWindow as any;

  return { PDFViewerApplication, PDFViewerApplicationOptions };
};

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export class EventHelper {
  constructor(
    public eventBus: any,
    public listeners: Record<string, (...args: any[]) => void>,
  ) {}

  mount() {
    for (let event in this.listeners) {
      const handler = this.listeners[event];
      this.eventBus.on(event, handler);
    }
  }

  unmount() {
    for (let event in this.listeners) {
      const handler = this.listeners[event];
      this.eventBus.off(event, handler);
    }
  }
}

export const useDelayedToggle = (params: {
  open: () => void;
  close: () => void;
  duration: number;
}) => {
  const { duration } = params;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const delayedClose = () => {
    timerRef.current = setTimeout(() => {
      params.close();
    }, duration);
  };

  const open = () => {
    clearTimer();
    params.open();
    delayedClose();
  };

  const close = () => {
    clearTimer();
    params.close();
  };

  const pause = () => {
    clearTimer();
  };

  const resume = () => {
    clearTimer();
    delayedClose();
  };

  return {
    open,
    close,
    pause,
    resume,
  };
};
