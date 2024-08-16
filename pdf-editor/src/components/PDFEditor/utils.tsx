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
