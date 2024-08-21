import React, { useEffect, useState } from "react";
import { useWidgetContext } from "./WidgetContext";

export const TitleBar: React.FC = () => {
  const { viewerApp } = useWidgetContext();

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
