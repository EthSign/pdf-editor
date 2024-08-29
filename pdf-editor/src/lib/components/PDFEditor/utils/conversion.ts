import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  StandardFonts
} from "pdf-lib";
import { Annotation } from "../types";

function getAnnotationPosition(annotation: Annotation) {
  const rect = annotation.rect;
  const x = rect[0];
  const y = rect[3];
  const height = rect[3] - rect[1];
  const width = rect[2] - rect[0];

  return { x, y, height, width };
}

export async function convertTextAnnotation(params: {
  page: PDFPage;
  annotation: Annotation;
  font: PDFFont;
}) {
  const { annotation, font, page } = params;

  const { x, y } = getAnnotationPosition(annotation);

  const { fontSize, color } = annotation;

  try {
    return page.drawText(annotation.value, {
      x: x + 2,
      y: y - fontSize,
      lineHeight: fontSize * 1.5,
      size: fontSize,
      font,
      color: rgb(
        ...(color.map((item: number) => item / 255) as [
          number,
          number,
          number,
        ]),
      ),
    });
  } catch (error) {
    throw new Error("text annotation convert failed", { cause: error });
  }
}

export async function convertImageAnnotation(params: {
  page: PDFPage;
  annotation: Annotation;
}) {
  try {
    const { annotation, page } = params;

    const { height, width, x, y } = getAnnotationPosition(annotation);

    const { bitmapUrl } = annotation;

    const imageBytes = await fetch(bitmapUrl).then((res) => res.arrayBuffer());

    const image = await page.doc.embedPng(imageBytes);

    return page.drawImage(image, {
      x,
      y: y - height,
      width,
      height,
    });
  } catch (error) {
    throw new Error("image annotation convert failed", { cause: error });
  }
}

export const isTextAnnotation = (annotation: Annotation) =>
  [3, 27].includes(annotation.annotationType);

export const isImageAnnotation = (annotation: Annotation) =>
  [13].includes(annotation.annotationType);

export async function convertAnnotationsToContent(params: {
  annotations: Annotation[];
  pdf: string | ArrayBuffer;
  font?: string | ArrayBuffer;
}) {
  const { annotations, pdf } = params;

  const pdfDoc = await PDFDocument.load(pdf);

  let font: PDFFont;

  if (params.font) {
    try {
      pdfDoc.registerFontkit(fontkit);
      if (typeof params.font === "string") {
        const fontBytes = await fetch(params.font).then((res) =>
          res.arrayBuffer(),
        );
        font = await pdfDoc.embedFont(fontBytes);
      } else {
        font = await pdfDoc.embedFont(params.font);
      }
    } catch (error) {
      const wrappedError = new Error(
        "Custom font embed failed, fallback to helvetica",
        { cause: error },
      );
      console.error(wrappedError);
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
  } else {
    font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  }

  const promises: Promise<void>[] = [];

  for (let annotation of annotations) {
    const { pageIndex } = annotation;

    const page = pdfDoc.getPage(pageIndex);

    if (isTextAnnotation(annotation)) {
      promises.push(convertTextAnnotation({ annotation, page, font }));
    }

    if (isImageAnnotation(annotation)) {
      promises.push(convertImageAnnotation({ annotation, page }));
    }
  }

  await Promise.allSettled(promises).then((values) => {
    values.forEach((value) => {
      if (value.status === "rejected") {
        console.error(value.reason);
      }
    });
  });

  return pdfDoc.save();
}

export function pdfBytesToUrl(pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return url;
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const url = pdfBytesToUrl(pdfBytes);

  const a = document.createElement("a");
  if (!a.click) {
    throw new Error('PDF download: "a.click()" is not supported.');
  }

  a.href = url;
  a.target = "_parent";

  if ("download" in a) {
    a.download = filename;
  }

  (document.body || document.documentElement).append(a);
  a.click();
  a.remove();
}
