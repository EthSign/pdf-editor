import React from "react";
import { createPortal } from "react-dom";
import { PDFEditorConnector } from "../PDFEditorConnector";
import { PageIndicator } from "./PageIndicator";
import { Search } from "./Search";
import { TitleBar } from "./TitleBar";
import { WidgetContext } from "./WidgetContext";

export const WidgetRoot: React.FC<{
  connector: PDFEditorConnector;
  mainSlot: HTMLDivElement;
  sidebarSlot: HTMLElement;
  mobileMode?: boolean;
}> = (props) => {
  const { connector, mainSlot, sidebarSlot, mobileMode } = props;

  return (
    <WidgetContext.Provider value={{ connector }}>
      <div>
        {createPortal(
          <>
            {!mobileMode && <TitleBar />}
            <PageIndicator />
          </>,
          mainSlot,
        )}

        {createPortal(<Search />, sidebarSlot)}
      </div>
    </WidgetContext.Provider>
  );
};
