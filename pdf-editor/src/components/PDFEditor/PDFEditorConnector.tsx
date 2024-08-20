import { createRoot } from "react-dom/client";
import { getViewerInstance } from "./utils";
import { WidgetRoot } from "./widgets/WidgetRoot";
import cssPatch from "./patch.css?inline";
import { useRef } from "react";

export class PDFEditorConnector {
  viewerUrl: string;

  eventBus: any;

  constructor(params: { viewerUrl: string }) {
    this.viewerUrl = params.viewerUrl;
  }

  async connect(pdfViewerIframe: HTMLIFrameElement) {
    const contentWindow = pdfViewerIframe.contentWindow;
    if (!contentWindow) throw new Error();

    const { PDFViewerApplication } = getViewerInstance(pdfViewerIframe);

    /* ------------------------------- patch style ------------------------------ */
    const style = contentWindow.document.createElement("style");
    style.innerText = cssPatch;
    contentWindow.document.head.appendChild(style);

    /* ---------------------------- mount WidgetRoot ---------------------------- */
    const rootEl = contentWindow.document.createElement("div");

    const mainContainerEl = contentWindow.document.getElementById(
      "mainContainer"
    ) as HTMLDivElement;

    const widgetRoot = createRoot(rootEl!);

    widgetRoot.render(
      <WidgetRoot viewerApp={PDFViewerApplication} mainSlot={mainContainerEl} />
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
