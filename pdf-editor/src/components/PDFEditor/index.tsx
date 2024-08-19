import React, { useEffect, useMemo, useRef, useState } from "react";
import { getViewerInstance } from "./utils";
import cssPatch from "./patch.css?inline";
import clsx from "clsx";
import { createRoot } from "react-dom/client";

export interface PDFEditor {
  viewerUrl: string;
}

export type PDFViewerApp = any;

export const PDFEditor: React.FC<PDFEditor> = props => {
  const { viewerUrl } = props;

  const iframeUrl = useMemo(() => {
    return viewerUrl + "";
  }, []);

  const appRef = useRef<PDFViewerApp>(null);

  const [editorReady, setEditorReady] = useState(false);

  const initPdfViewer = (app: PDFViewerApp) => {
    app.eventBus.on("documentloaded", () => {});

    appRef.current = app;

    setEditorReady(true);
  };

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
          className={clsx({ visible: editorReady, invisible: !editorReady })}
          src={iframeUrl}
          width="100%"
          height="100%"
          onLoad={event => {
            const iframeEl = event.target as HTMLIFrameElement;

            const contentWindow = iframeEl.contentWindow;
            if (!contentWindow) throw new Error();

            /* ------------------------------- patch style ------------------------------ */
            const style = contentWindow.document.createElement("style");
            style.innerText = cssPatch;
            contentWindow.document.head.appendChild(style);

            /* ---------------------------- mount widgetRoot ---------------------------- */
            const rootEl = contentWindow.document.createElement("div");
            const widgetRoot = createRoot(rootEl!);
            widgetRoot.render(<WidgetRoot />);
            contentWindow.document.body.appendChild(rootEl!);

            /* -------------------------- create viewer bridge -------------------------- */
            const { PDFViewerApplication } = getViewerInstance(iframeEl);
            initPdfViewer(PDFViewerApplication);
          }}
        />
      </div>
    </div>
  );
};

export const WidgetRoot: React.FC = () => {
  useEffect(() => {
    console.log("location is here", location.href);
  });

  return <div className="size-full bg-red-50">Fuck</div>;
};
