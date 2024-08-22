import { PDFEditorConnector } from "./PDFEditorConnector";

export interface PDFEditorInstance {}

export interface PDFEditorProps {
  connector: PDFEditorConnector;
}

export type PDFViewerApp = any;

export enum AnnotationEditorType {
  NONE = 0,
  FREETEXT = 3,
  DATE = 27,
  STAMP = 13,
}
