import { PDFDocument } from "pdf-lib";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import cssPatch from "./patch.css?inline";
import { PDFViewerApp } from "./types";
import { getViewerInstance } from "./utils";
import { WidgetRoot } from "./widgets/WidgetRoot";

export class PDFEditorConnector {
  viewerUrl: string;

  eventBus!: any;

  app: PDFViewerApp;

  constructor(params: { viewerUrl: string }) {
    this.viewerUrl = params.viewerUrl;
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

    const { PDFViewerApplication } = getViewerInstance(pdfViewerIframe);
    this.app = PDFViewerApplication;
    this.eventBus = PDFViewerApplication.eventBus;

    /* ------------------------------- patch style ------------------------------ */
    const style = contentWindow.document.createElement("style");
    style.innerText = cssPatch;
    contentWindow.document.head.appendChild(style);

    /* ---------------------------- mount WidgetRoot ---------------------------- */
    const rootEl = contentWindow.document.createElement("div");

    const mainContainerEl = contentWindow.document.getElementById(
      "mainContainer"
    ) as HTMLDivElement;

    const sidebarContentEl = contentWindow.document.getElementById(
      "sidebarContent"
    ) as HTMLDivElement;

    const widgetRoot = createRoot(rootEl!);

    widgetRoot.render(
      <WidgetRoot
        connector={this}
        mainSlot={mainContainerEl}
        sidebarSlot={sidebarContentEl}
      />
    );

    contentWindow.document.body.appendChild(rootEl!);

    // TODO: 禁用 cmd + s 等用不到的快捷键

    // TODO: 禁用本地状态存储 history storage

    // TODO: 禁用 pdf 文件拖入自动打开
  }

  disconnect() {}
}

export const usePDFEditorConnector = (
  params: ConstructorParameters<typeof PDFEditorConnector>["0"]
) => {
  const connectorRef = useRef<PDFEditorConnector>(
    new PDFEditorConnector(params)
  );

  return connectorRef.current;
};
