import { PDFDocument, setTextRenderingMode } from "pdf-lib";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import cssPatch from "./patch.css?inline";
import { AnnotationEditorType, PDFViewerApp, PDFViewerParams } from "./types";
import { getViewerInstance } from "./utils";
import { WidgetRoot } from "./widgets/WidgetRoot";

export class PDFEditorConnector {
  viewerUrl: string;

  eventBus!: any;

  iframeWindow!: Window;

  app: PDFViewerApp;

  mobileMode: boolean = false;

  constructor(params: {
    viewerUrl: string;
    viewerParams?: PDFViewerParams;
    mobileMode?: boolean;
  }) {
    const { viewerUrl, viewerParams, mobileMode } = params;

    const defaultParams: PDFViewerParams = {
      locale: "en_US",
      disableHistory: true,
      disableDragOpen: true,
    };

    if (mobileMode) {
      this.mobileMode = true;
      defaultParams.textLayer = "off";
    }

    const [path, search] = viewerUrl.split("#");

    const searchParams = new URLSearchParams(search);

    Object.entries(Object.assign(defaultParams, viewerParams))
      .filter(([, value]) => value !== undefined)
      .forEach(([key, value]) => {
        searchParams.set(key, value!.toString());
      });

    const url = [path, searchParams.toString()].join("#");

    this.viewerUrl = url;
  }

  setAnnotationEditorType(
    type: AnnotationEditorType,
    data?: { bitmapFile: string },
  ) {
    this.app.pdfViewer.annotationEditorUIManager.annotationTempData = {
      mode: type,
      ...(data || {}),
    };
  }

  getAllAnnotations() {
    const data = [];
    for (const editor of this.app.pdfViewer.annotationEditorUIManager.allEditors.values()) {
      const serialized = editor.serialize(false, true);
      if (serialized) data.push(serialized);
    }
    return data;
  }

  setAnnotations(annotations: any[]) {
    this.app.pdfViewer.annotationEditorUIManager.addAnnotations(annotations);
  }

  removeAnnotationById(id: string) {
    this.app.pdfViewer.annotationEditorUIManager.removeEditorById(id);
  }

  getAnnotationById(id: string) {
    if (!id) return null;
    return this.app.pdfViewer.annotationEditorUIManager?.getEditor(id);
  }

  async addEmptyPage() {
    if (!this.app.pdfDocument) return;

    const currentPDFData = await this.app.pdfDocument.getData();
    const blob = new Blob([currentPDFData], { type: "application/pdf" });

    const newDoc = await PDFDocument.load(await blob.arrayBuffer());
    newDoc.addPage();
    const newDocBytes = await newDoc.save();

    const newBlob = new Blob([newDocBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(newBlob);
    await this.open(url);

    // TODO: jump to last page
  }

  open(url: string) {
    return this.app.open({ url });
  }

  async connect(pdfViewerIframe: HTMLIFrameElement) {
    const contentWindow = pdfViewerIframe.contentWindow;
    if (!contentWindow) throw new Error();
    this.iframeWindow = contentWindow;

    const { PDFViewerApplication } = getViewerInstance(pdfViewerIframe);
    this.app = PDFViewerApplication;
    this.eventBus = PDFViewerApplication.eventBus;

    /* ------------------------- reset default UI state ------------------------- */
    if (!this.mobileMode) {
      PDFViewerApplication.pdfSidebar.open();
    }

    /* ------------------------------- patch style ------------------------------ */
    const style = contentWindow.document.createElement("style");
    style.innerText = cssPatch;
    contentWindow.document.head.appendChild(style);
    if (this.mobileMode) {
      const outerContainerEl =
        contentWindow.document.querySelector("#outerContainer");
      if (outerContainerEl) {
        outerContainerEl.classList.add("mobileMode");
      }
    }

    /* ---------------------------- mount WidgetRoot ---------------------------- */
    const rootEl = contentWindow.document.createElement("div");

    const mainContainerEl = contentWindow.document.getElementById(
      "mainContainer",
    ) as HTMLDivElement;

    const sidebarContentEl = contentWindow.document.getElementById(
      "sidebarContent",
    ) as HTMLDivElement;

    const widgetRoot = createRoot(rootEl!);

    widgetRoot.render(
      <WidgetRoot
        connector={this}
        mainSlot={mainContainerEl}
        sidebarSlot={sidebarContentEl}
      />,
    );

    contentWindow.document.body.appendChild(rootEl!);

    /* ----------------------------- patch shortcuts ---------------------------- */
    PDFViewerApplication._keydownInterceptor = (
      evt: KeyboardEvent,
      next: () => void,
    ) => {
      const keyCodeMap: Record<string, number> = {
        f: 70,
        s: 83,
        o: 79,
        r: 82,
        h: 72,
        F4: 115,
      };

      const modifierValue =
        (evt.ctrlKey ? 1 : 0) |
        (evt.altKey ? 2 : 0) |
        (evt.shiftKey ? 4 : 0) |
        (evt.metaKey ? 8 : 0);

      const disabledShortcut = [
        // ctrl or cmd
        [1, "f"], // find
        [8, "f"], // find
        [1, "s"], // download
        [8, "s"], // download
        [1, "o"], // open file
        [8, "o"], // open file

        // ctrl + alt or cmd + option
        [3, "g"], // focus input#pageNumber field
        [10, "g"], // focus input#pageNumber field

        // no modifier
        [0, "s"], // switch select tool
        [0, "h"], // switch hand tool
        [0, "r"], // rotate
        [0, "F4"], // toggle sidebar
      ];

      const isDisabledShortcut = disabledShortcut.some((shortcut) => {
        const [modifier, key] = shortcut;

        const keyCode = keyCodeMap[key];

        if (!modifier && !modifierValue && keyCode === evt.keyCode) {
          return true;
        }

        if (modifier === modifierValue && keyCode === evt.keyCode) {
          return true;
        }

        return false;
      });

      if (isDisabledShortcut) {
        return;
      }

      next();
    };
  }

  disconnect() {}
}

export const usePDFEditorConnector = (
  params: ConstructorParameters<typeof PDFEditorConnector>["0"],
) => {
  const connectorRef = useRef<PDFEditorConnector>(
    new PDFEditorConnector(params),
  );

  return connectorRef.current;
};
