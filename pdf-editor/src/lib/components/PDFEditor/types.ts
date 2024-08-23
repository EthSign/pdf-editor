import { PDFEditorConnector } from "./PDFEditorConnector";

export interface PDFEditorInstance { }

export interface PDFEditorProps {
  className?: string;
  connector: PDFEditorConnector;
}

export type PDFViewerApp = any;

export enum AnnotationEditorType {
  NONE = 0,
  FREETEXT = 3,
  DATE = 27,
  STAMP = 13,
}
export interface PDFViewerParams {
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
  [index: string]: string | number | boolean | undefined;
}
