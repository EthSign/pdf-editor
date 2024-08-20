import React, { useEffect, useMemo, useRef, useState } from "react";

export interface PDFEditor {
  viewerUrl: string;
}

const getViewerInstance = (pdfIframe: HTMLIFrameElement) => {
  if (
    !pdfIframe.contentWindow ||
    pdfIframe.contentWindow.document.readyState !== "complete"
  ) {
    throw new Error("页面尚未加载完成");
  }

  const { PDFViewerApplication, PDFViewerApplicationOptions } =
    pdfIframe.contentWindow as any;

  return { PDFViewerApplication, PDFViewerApplicationOptions };
};

const createPdfViewer = (
  containerElement: HTMLDivElement,
  params: { onDocumentLoaded?: (app: any) => void }
) => {
  const { onDocumentLoaded } = params;

  const iframe = document.createElement("iframe");
  iframe.src = `./viewer.html`;
  iframe.width = "100%";
  iframe.height = "100%";

  iframe.onload = () => {
    const { PDFViewerApplication } = getViewerInstance(iframe);

    PDFViewerApplication.eventBus.on("documentloaded", () => {
      onDocumentLoaded?.(PDFViewerApplication);
    });
  };

  if (containerElement) {
    containerElement.appendChild(iframe);
  }
};

export const PDFEditor: React.FC<PDFEditor> = props => {
  const { viewerUrl } = props;

  const iframeUrl = useMemo(() => {
    return viewerUrl;
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const initd = useRef(false);

  const appRef = useRef<any>(null);

  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    if (initd.current) return;
    initd.current = true;

    if (!containerRef.current) return;

    createPdfViewer(containerRef.current, {});
  }, []);

  return (
    <div className="size-full flex">
      <div className="w-[300px] p-8">
        <button
          className="border px-4 py-2"
          onClick={() => {
            if (!editorReady) return;

            appRef.current.eventBus.dispatch("switchannotationeditormode", {
              mode: 3,
            });
          }}
        >
          文字工具
        </button>
      </div>

      <div className="flex-1">
        <iframe
          src={iframeUrl}
          width="100%"
          height="100%"
          onLoad={event => {
            const { PDFViewerApplication } = getViewerInstance(
              event.target as HTMLIFrameElement
            );

            appRef.current = PDFViewerApplication;

            setEditorReady(true);
            PDFViewerApplication.eventBus.on("documentloaded", () => {});
          }}
        />
      </div>
    </div>
  );
};
