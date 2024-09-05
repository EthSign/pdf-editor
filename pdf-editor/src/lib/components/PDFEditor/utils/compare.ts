import { Change, diffChars } from "diff";
import { PDFDocument } from "pdf-lib";
import * as pdfjs from "pdfjs-dist";
import type { DocumentInitParameters } from "pdfjs-dist/types/src/display/api";
import { withResolvers } from "./misc";

type PDFData = DocumentInitParameters["data"];

interface ImageObject {
  width: number;
  height: number;
  dataLen: number;
  data: unknown;
  bitmap: ImageBitmap;
  [index: string]: unknown;
}

interface PDFImage {
  imageName: string;
  imageData: ImageObject;
}

interface PageDiff {
  pageIndex: number;
  textConsistent: boolean;
  imageConsistent: boolean;
  textDiffs: Change[];
  imageDiffs: boolean;
}

export async function getDocument(data: PDFData) {
  return pdfjs.getDocument({ data }).promise;
}

/* ------------------------------- extractors ------------------------------ */

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

export async function extractTextContent(doc: pdfjs.PDFDocumentProxy) {
  const pageCount = doc.numPages;

  const pageContentsPromises = Array.from({ length: pageCount }).map(
    (_, index) => doc.getPage(index + 1).then(extractPageText),
  );
  const pageContents = await Promise.all(pageContentsPromises);

  return pageContents;
}

export async function extractPageImages(page: pdfjs.PDFPageProxy) {
  const { argsArray, fnArray } = await page.getOperatorList();

  const images = fnArray
    .map((fn, index) => [fn, argsArray[index]])
    .filter(([fn]) => fn === pdfjs.OPS.paintImageXObject)
    .map(([, args]) => {
      const objectId = args[0];

      const { promise, reject, resolve } = withResolvers<PDFImage>();

      try {
        page.objs.get(objectId, (objectData: ImageObject) => {
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

  const pageDiffPromises: Promise<PageDiff>[] = [];

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const { promise, resolve } = withResolvers<PageDiff>();

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

      const textDiffs = diffTexts(oldPage.text, newPage.text);
      const imageDiffs = diffImages(oldPage.images, newPage.images);
      console.log(oldPage, newPage, "diff");

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

  const diffs = await Promise.all(pageDiffPromises).then((pages) =>
    pages.filter((page) => !page.textConsistent || !page.imageConsistent),
  );

  oldPDFDoc.destroy();
  newPDFDoc.destroy();

  return { consistent, diffs };
}

export async function getSubject(pdf: string | ArrayBuffer | Uint8Array) {
  const pdfDoc = await PDFDocument.load(pdf);

  return pdfDoc.getSubject();
}

/* ------------------------------ content diffs ----------------------------- */

function diffTexts(textA: string, textB: string) {
  return diffChars(textA, textB);
}

function diffImages(imagesA: PDFImage[], imagesB: PDFImage[]) {
  if (!imagesA.length && !imagesB.length) {
    return false;
  }

  if (imagesA.length !== imagesB.length) return true;

  function buildImageMap(images: PDFImage[]) {
    const imageMap = new Map();

    images.map((data) => {
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
    const hasDiff = compareKeys.some(
      (key) => imageAData[key] !== imageBData[key],
    );

    if (hasDiff) return true;
  }

  return false;
}
