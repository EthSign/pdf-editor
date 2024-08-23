import React, { useEffect, useState } from "react";
import { IconLeft, IconRight } from "../icons";
import { useWidgetContext } from "./WidgetContext";

export const PageIndicator: React.FC = () => {
  const { viewerApp } = useWidgetContext();

  const [currentPageInput, setCurrentPageInput] = useState(0);

  const [totalPage, setTotalPage] = useState(0);

  const bus = viewerApp.eventBus;

  useEffect(() => {
    const onPagesLoaded = (data: { pagesCount: number }) => {
      setTotalPage(data.pagesCount);
    };

    const onPageChanging = (data: { pageNumber: number }) => {
      setCurrentPageInput(data.pageNumber);
    };

    bus.on("pagesloaded", onPagesLoaded);
    bus.on("pagechanging", onPageChanging);

    return () => {
      bus.off("pagesloaded", onPagesLoaded);
      bus.off("pagechanging", onPageChanging);
    };
  }, []);

  return (
    <div className="widget-page-indicator-wrapper">
      <div className="widget-page-indicator">
        <IconLeft
          fill="white"
          onClick={() => {
            viewerApp.pdfViewer.previousPage();
          }}
        />

        <div className="widget-page-indicator-pager">
          <input
            type="text"
            value={currentPageInput}
            onChange={(e) => {
              const input = e.target.value;
              if (!/^\d*$/.test(input)) return;

              const page = Number(input);
              if (page < 1 || page > totalPage) return;

              setCurrentPageInput(page);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                viewerApp.pdfViewer.currentPageNumber = currentPageInput;
              }
            }}
          />
          /<div className="">{totalPage}</div>
        </div>

        <IconRight
          fill="white"
          onClick={() => {
            viewerApp.pdfViewer.nextPage();
          }}
        />
      </div>
    </div>
  );
};
