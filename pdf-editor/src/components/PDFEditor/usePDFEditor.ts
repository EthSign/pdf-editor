import { useEffect, useRef } from "react"

export type PDFViewerApp = any;

export class PDFEditor {
  private appInstance: any

  constructor() { }

  mount() { }
}

export const usePDFEditor = (params: {
  container: HTMLDivElement
}) => {

  const pdfEditorRef = useRef<PDFEditor>(new PDFEditor())

  const { container } = params

  useEffect(() => {
    const iframeElement = document.createElement('iframe')

    return () => { }
  })

  return {

  }
}

