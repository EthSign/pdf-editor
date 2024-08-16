import React, { useMemo, useRef, useState } from "react";
import { getViewerInstance } from "./utils";

export interface PDFEditor {
  viewerUrl: string;
}

export const PDFEditor: React.FC<PDFEditor> = props => {
  const { viewerUrl } = props;

  const iframeUrl = useMemo(() => {
    return viewerUrl;
  }, []);

  const appRef = useRef<any>(null);

  const [editorReady, setEditorReady] = useState(false);

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
