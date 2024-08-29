import { useEffect, useState } from "react";
import { useWidgetContext } from "./WidgetContext";

export const TitleBar = (props: { title?: string }) => {
  const { viewerApp } = useWidgetContext();

  const [title, setTitle] = useState(props.title);

  const bus = viewerApp.eventBus;

  useEffect(() => {
    const onDocumentLoaded = () => {
      if (props.title) return;
      const title = viewerApp._docFilename;

      setTitle(title);
    };

    bus.on("documentloaded", onDocumentLoaded);

    return () => {
      bus.off("documentloaded", onDocumentLoaded);
    };
  }, [props.title]);

  return <div className="widget-title-wrapper">{title}</div>;
};
