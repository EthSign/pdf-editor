import React, { useEffect, useState } from "react";
import { IconLeft, IconRight } from "../icons";
import { EventHelper } from "../utils";
import { useDelayedToggle } from "../utils/misc";
import { useWidgetContext } from "./WidgetContext";

export const PageIndicator: React.FC = () => {
  const { viewerApp } = useWidgetContext();

  const [currentPageInput, setCurrentPageInput] = useState(0);

  const [totalPage, setTotalPage] = useState(0);

  const [visible, setVisible] = useState(false);

  const bus = viewerApp.eventBus;

  const indicatorToggle = useDelayedToggle({
    open: () => setVisible(true),
    close: () => setVisible(false),
    duration: 5000,
  });

  useEffect(() => {
    const helper = new EventHelper(bus, {
      pagesloaded: (data: { pagesCount: number }) => {
        setCurrentPageInput(viewerApp.pdfViewer?.currentPageNumber ?? 1);
        setTotalPage(data.pagesCount);
        indicatorToggle.open();
      },

      pagechanging: (data: { pageNumber: number }) => {
        setCurrentPageInput(data.pageNumber);
      },

      updateviewarea: () => {
        indicatorToggle.open();
      },
    });

    helper.mount();

    return () => {
      indicatorToggle.close();
      helper.unmount();
    };
  }, []);

  return (
    <div
      className="widget-page-indicator-wrapper"
      data-visible={visible}
      onMouseEnter={() => {
        indicatorToggle.pause();
      }}
      onMouseLeave={() => {
        indicatorToggle.resume();
      }}
    >
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
            style={{
              width: (currentPageInput.toString().length ?? 1) + "ch",
            }}
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
