import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
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

    const { bitmapFile } = annotation;

    const imageBytes = await fetch(bitmapFile).then((res) => res.arrayBuffer());

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
  subject?: Record<string, unknown>;
}) {
  const {
    annotations,
    pdf,
    font: fontUrl = "https://sign-public-cdn.s3.us-east-1.amazonaws.com/pdf-editor/NotoSansSC-Regular_240829075104.ttf",
    subject,
  } = params;

  const pdfDoc = await PDFDocument.load(pdf);

  let font: PDFFont;
  if (subject) {
    await pdfDoc.setSubject(JSON.stringify(subject));
  }
  if (fontUrl) {
    try {
      pdfDoc.registerFontkit(fontkit);
      if (typeof fontUrl === "string") {
        const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
        font = await pdfDoc.embedFont(fontBytes);
      } else {
        font = await pdfDoc.embedFont(fontUrl);
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
    if (typeof annotation === "string") {
      annotation = JSON.parse(annotation);
    }
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

export function download(pdfBytes: Uint8Array, filename: string) {
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
