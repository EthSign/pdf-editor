import { PDFViewerApp } from "../types";

export function convertDomRectToPdfRect(pageView: any, rect: DOMRect) {
  const viewport = pageView.viewport;
  const canvasRect = pageView.canvas.getBoundingClientRect();

  const relativeX1 = rect.left - canvasRect.left;
  const relativeY1 = rect.top - canvasRect.top;
  const relativeX2 = rect.right - canvasRect.left;
  const relativeY2 = rect.bottom - canvasRect.top;

  const [pdfX1, pdfY1] = viewport.convertToPdfPoint(relativeX1, relativeY1);
  const [pdfX2, pdfY2] = viewport.convertToPdfPoint(relativeX2, relativeY2);

  return [pdfX1, pdfY1, pdfX2, pdfY2];
}

export async function locateKeywords(
  pdfViewerApp: PDFViewerApp,
  keywords: string,
) {
  const rects: { pageIndex: number; rect: number[] }[] = [];

  const pages = pdfViewerApp.pagesCount;

  for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
    try {
      const pageView = pdfViewerApp.pdfViewer.getPageView(pageIndex);

      const textContent = await pageView.pdfPage.getTextContent();

      textContent.items.forEach((item: any) => {
        const text = item.str;
        const startIndex = text.indexOf(keywords);

        const { width, height } = item

        if (startIndex !== -1) {
          const transform = item.transform;

          const x1 = transform[4] + startIndex * (width / text.length);
          const y1 = transform[5];
          const x2 = x1 + keywords.length * (width / text.length);
          const y2 = y1 + height;

          const rect = [x1, y1, x2, y2];

          rects.push({ pageIndex, rect });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  return rects;
}
