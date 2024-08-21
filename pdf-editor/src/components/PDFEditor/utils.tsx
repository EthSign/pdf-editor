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
  wait: number
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
