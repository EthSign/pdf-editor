import { PDFEditorConnector } from "./PDFEditorConnector";

export interface PDFEditorInstance {}

export interface PDFEditorProps {
  className?: string;
  connector: PDFEditorConnector;
  title?: string;
  onReady?: (connector: PDFEditorConnector) => void;
}

export type PDFViewerApp = any;

export enum AnnotationEditorType {
  NONE = 0,
  FREETEXT = 3,
  DATE = 27,
  STAMP = 13,
}
export interface PDFViewerParams {
  // 原版 pdf.js viewer 参数
  disableworker?: boolean;
  textLayer?: "off" | "visible" | "shadow" | "hover";
  locale?: string;
  disableAutoFetch?: boolean;
  disableFontFace?: boolean;
  disableHistory?: boolean;
  disableRange?: boolean;
  disableStream?: boolean;
  verbosity?: number;
  enableAltText?: boolean;
  enableGuessAltText?: boolean;
  enableUpdatedAddImage?: boolean;
  highlightEditorColors?: string;
  maxCanvasPixels?: number;
  spreadModeOnLoad?: number;
  supportsCaretBrowsingMode?: boolean;

  // 扩展参数
  disableDragOpen?: boolean;

  [index: string]: string | number | boolean | undefined;
}

export type Annotation = any;
