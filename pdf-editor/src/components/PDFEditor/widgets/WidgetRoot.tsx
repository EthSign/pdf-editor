import React from "react";
import { createPortal } from "react-dom";
import { PageIndicator } from "./PageIndicator";
import { TitleBar } from "./TitleBar";

export const WidgetRoot: React.FC<{
  viewerApp: any;
  mainSlot: HTMLDivElement;
}> = props => {
  const { viewerApp, mainSlot } = props;

  return (
    <div>
      {createPortal(
        <>
          <TitleBar viewerApp={viewerApp} />
          <PageIndicator viewerApp={viewerApp} />
        </>,
        mainSlot
      )}
    </div>
  );
};
