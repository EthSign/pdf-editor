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
  title?: string;
}> = (props) => {
  const { connector, mainSlot, sidebarSlot, title } = props;

  if (connector.mobileMode) return null;
  return (
    <WidgetContext.Provider value={{ connector }}>
      <div>
        {createPortal(
          <>
            <TitleBar title={title} />
            <PageIndicator />
          </>,
          mainSlot,
        )}

        {createPortal(<Search />, sidebarSlot)}
      </div>
    </WidgetContext.Provider>
  );
};
