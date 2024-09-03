import { Change, diffChars } from "diff";
import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

type PDFData = string | number[] | ArrayBuffer | TypedArray | undefined;

export async function getDocument(
  /**
   * -
   * Binary PDF data.
   * Use TypedArrays (Uint8Array) to improve the memory usage. If PDF data is
   * BASE64-encoded, use `atob()` to convert it to a binary string first.
   *
   * NOTE: If TypedArrays are used they will generally be transferred to the
   * worker-thread. This will help reduce main-thread memory usage, however
   * it will take ownership of the TypedArrays.
   */
  data: string | number[] | ArrayBuffer | TypedArray | undefined,
) {
  let resolveDoc!: (...args: any[]) => void;
  const pdfBDoc = new Promise<pdfjs.PDFDocumentProxy>(
    (resolve) => (resolveDoc = resolve),
  );

  const loadingTask = pdfjs.getDocument({
    data,
  });

  resolveDoc(loadingTask.promise);

  return pdfBDoc;
}

export async function extractTextContent(doc: pdfjs.PDFDocumentProxy) {
  const pageContents: string[] = [];

  const pageCount = doc.numPages;

  const promises = [];

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const page = await doc.getPage(pageIndex + 1);

    const promise = page.getTextContent().then((textContent) => {
      const strBuf: string[] = [];

      for (const textItem of textContent.items) {
        const { str, hasEOL } = textItem as any;
        strBuf.push(str);
        if (hasEOL) {
          strBuf.push("\n");
        }
      }

      pageContents[pageIndex] = strBuf.join("");
    });

    promises.push(promise);
  }

  await Promise.all(promises);

  return pageContents;
}

export async function diffPDF(
  oldPDF: PDFData,
  newPDF: PDFData,
) {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.mjs"
  }

  const [pdfTextA, pdfTextB] = await Promise.all([
    getDocument(oldPDF).then(extractTextContent),
    getDocument(newPDF).then(extractTextContent),
  ]);

  let consistent = true;
  const diffs: { pageIndex: number; consistent: boolean; changes: Change[] }[] =
    [];

  const minPageCount = pdfTextA.length;

  for (let pageIndex = 0; pageIndex < minPageCount; pageIndex++) {
    const pageA = pdfTextA[pageIndex] ?? "";
    const pageB = pdfTextB[pageIndex] ?? "";

    const changes = diffChars(pageA, pageB);

    const pageConsistent =
      changes.length === 1 && !changes[0].added && !changes[0].removed;

    if (!pageConsistent) {
      if (consistent) consistent = false;
      diffs.push({ pageIndex, consistent: pageConsistent, changes });
    }
  }

  return {
    consistent,
    diffs,
  };
}

export async function getSubject(pdf: string | ArrayBuffer | Uint8Array) {
  const pdfDoc = await PDFDocument.load(pdf);

  return pdfDoc.getSubject();
}
