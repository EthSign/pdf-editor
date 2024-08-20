import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { IconLeft, IconRight } from "./icons";
import cssPatch from "./patch.css?inline";
import { getViewerInstance } from "./utils";

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
    // TODO: 禁用 cmd + s 等用不到的快捷键

    // TODO: 禁用本地状态存储 history storage

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

            const { PDFViewerApplication } = getViewerInstance(iframeEl);

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
              <WidgetRoot
                viewerApp={PDFViewerApplication}
                mainSlot={mainContainerEl}
              />
            );

            contentWindow.document.body.appendChild(rootEl!);

            /* -------------------------- create viewer bridge -------------------------- */
            initPdfViewer(PDFViewerApplication);
          }}
        />
      </div>
    </div>
  );
};

export const WidgetRoot: React.FC<{
  viewerApp: any;
  mainSlot: HTMLDivElement;
}> = props => {
  const { viewerApp, mainSlot } = props;

  const [currentPageInput, setCurrentPageInput] = useState(0);

  const [totalPage, setTotalPage] = useState(0);

  const [title, setTitle] = useState("");

  const bus = viewerApp.eventBus;

  useEffect(() => {
    const onPagesLoaded = (data: { pagesCount: number }) => {
      setTotalPage(data.pagesCount);
    };

    const onPageChanging = (data: { pageNumber: number }) => {
      setCurrentPageInput(data.pageNumber);
    };

    const onDocumentLoaded = () => {
      const title = viewerApp._docFilename;

      setTitle(title);
    };

    bus.on("documentloaded", onDocumentLoaded);

    bus.on("pagesloaded", onPagesLoaded);
    bus.on("pagechanging", onPageChanging);

    return () => {
      bus.off("pagesloaded", onPagesLoaded);
      bus.off("pagechanging", onPageChanging);
    };
  }, []);

  return (
    <div>
      {createPortal(
        <div className="widget-title-wrapper">{title}</div>,
        mainSlot
      )}

      {createPortal(
        <div className="widget-page-indicator-wrapper">
          <div className="widget-page-indicator">
            <IconLeft
              onClick={() => {
                viewerApp.pdfViewer.previousPage();
              }}
            />

            <div className="widget-page-indicator-pager">
              <input
                type="text"
                value={currentPageInput}
                onChange={e => {
                  const input = e.target.value;
                  if (!/^\d*$/.test(input)) return;

                  const page = Number(input);
                  if (page < 1 || page > totalPage) return;

                  setCurrentPageInput(page);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    viewerApp.pdfViewer.currentPageNumber = currentPageInput;
                  }
                }}
              />
              /<div className="">{totalPage}</div>
            </div>

            <IconRight
              onClick={() => {
                viewerApp.pdfViewer.nextPage();
              }}
            />
          </div>
        </div>,
        mainSlot
      )}
    </div>
  );
};
