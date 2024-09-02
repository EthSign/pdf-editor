import { useEffect, useState } from "react";
import { useWidgetContext } from "./WidgetContext";
import { Events } from "../utils/eventbus";

export const TitleBar = () => {
  const { viewerApp, connector } = useWidgetContext();

  const [filename, setFilename] = useState();
  const [title, setTitle] = useState("");

  const bus = viewerApp.eventBus;

  useEffect(() => {
    const onDocumentLoaded = () => {
      const title = viewerApp._docFilename;
      setFilename(title);
    };

    const onTitleUpdate = (title: string) => {
      setTitle(title);
    };

    bus.on("documentloaded", onDocumentLoaded);
    connector._eventBus.on(Events.updateTitle, onTitleUpdate);

    return () => {
      bus.off("documentloaded", onDocumentLoaded);
      connector._eventBus.off(Events.updateTitle, onTitleUpdate);
    };
  }, []);

  return <div className="widget-title-wrapper">{title || filename}</div>;
};
