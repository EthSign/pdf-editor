import { Change, diffChars } from "diff";
import { PDFDocument, PDFPage } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";
import { withResolvers } from "./misc";

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
          // strBuf.push("\n");
        }
      }

      pageContents[pageIndex] = strBuf.join("");
    });

    promises.push(promise);
  }

  await Promise.all(promises);

  return pageContents;
}

export async function extractPageText(page: pdfjs.PDFPageProxy) {
  const textContent = await page.getTextContent();

  const strBuf: string[] = [];

  for (const textItem of textContent.items) {
    const { str, hasEOL } = textItem as any;
    strBuf.push(str);

    if (hasEOL) {
      // strBuf.push("\n");
    }
  }

  const text = strBuf.join("");

  return text;
}

export async function extractPageImages(page: pdfjs.PDFPageProxy) {
  const { argsArray, fnArray } = await page.getOperatorList();

  const images = fnArray
    .map((fn, index) => [fn, argsArray[index]])
    .filter(([fn]) => fn === pdfjs.OPS.paintImageXObject)
    .map(([, args]) => {
      const objectId = args[0];

      const { promise, reject, resolve } = withResolvers();

      try {
        page.objs.get(objectId, (objectData: any) => {
          resolve({
            imageName: objectId,
            imageData: objectData,
          });
        });
      } catch (error) {
        reject(new Error("Extract image failed", { cause: error }));
      }

      return promise;
    });

  return Promise.all(images);
}

export async function diffPDF(oldPDF: PDFData, newPDF: PDFData) {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.mjs";
  }

  const [oldPDFDoc, newPDFDoc] = await Promise.all([
    getDocument(oldPDF),
    getDocument(newPDF),
  ]);

  const pageCount = Math.min(oldPDFDoc.numPages, newPDFDoc.numPages);

  let consistent = true;

  const pageDiffPromises: Promise<any>[] = [];

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const { promise, resolve } = withResolvers();

    pageDiffPromises.push(promise);

    (async () => {
      const extractPageContents = async (page: pdfjs.PDFPageProxy) => {
        const [text, images] = await Promise.all([
          extractPageText(page),
          extractPageImages(page),
        ]);
        return { text, images };
      };

      const [oldPage, newPage] = await Promise.all([
        oldPDFDoc.getPage(pageIndex + 1).then(extractPageContents),
        newPDFDoc.getPage(pageIndex + 1).then(extractPageContents),
      ]);

      const textDiffs = diffChars(oldPage.text, newPage.text);
      const imageDiffs = diffImages(oldPage.images, newPage.images);

      const textConsistent =
        textDiffs.length === 1 && !textDiffs[0].added && !textDiffs[0].removed;

      const imageConsistent = !imageDiffs;

      if (consistent && (!textConsistent || !imageConsistent)) {
        consistent = false;
      }

      resolve({
        pageIndex,
        textConsistent,
        imageConsistent,
        textDiffs,
        imageDiffs,
      });
    })();
  }

  const pageDiffs = await Promise.all(pageDiffPromises).then((pages: any) =>
    pages.filter((page: any) => !page.textConsistent || !page.imageConsistent),
  );

  return {
    consistent,
    diffs: pageDiffs,
  };
}

export async function getSubject(pdf: string | ArrayBuffer | Uint8Array) {
  const pdfDoc = await PDFDocument.load(pdf);

  return pdfDoc.getSubject();
}

function diffImages(imagesA: any, imagesB: any) {
  if (!imagesA.length && !imagesB.length) {
    return false;
  }

  if (imagesA.length !== imagesB.length) return true;

  function buildImageMap(images: any) {
    const imageMap = new Map();

    images.map((data: any) => {
      const { imageName, imageData } = data;
      imageMap.set(imageName, imageData);
    });

    return imageMap;
  }

  const imagesMapB = buildImageMap(imagesB);

  for (const image of imagesA) {
    const { imageName, imageData: imageAData } = image;

    const imageBData = imagesMapB.get(imageName);

    if (!imageBData) return true;

    const compareKeys = ["width", "height", "dataLen"];

    return compareKeys.some((key) => imageAData[key] !== imageBData[key]);
  }
}
