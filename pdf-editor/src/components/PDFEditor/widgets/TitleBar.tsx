import React, { useState, useEffect } from "react";
import { PDFViewerApp } from "../types";


export const TitleBar: React.FC<{ viewerApp: PDFViewerApp; }> = props => {
  const { viewerApp } = props;

  const [title, setTitle] = useState("");

  const bus = viewerApp.eventBus;

  useEffect(() => {
    const onDocumentLoaded = () => {
      const title = viewerApp._docFilename;

      setTitle(title);
    };

    bus.on("documentloaded", onDocumentLoaded);

    return () => {
      bus.off("documentloaded", onDocumentLoaded);
    };
  }, []);

  return <div className="widget-title-wrapper">{title}</div>;
};
