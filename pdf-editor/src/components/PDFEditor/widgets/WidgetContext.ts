import { createContext, useContext } from "react";
import { PDFEditorConnector } from "../PDFEditorConnector";

export const WidgetContext = createContext<{
  connector?: PDFEditorConnector;
}>({});

export const useWidgetContext = () => {
  const { connector } = useContext(WidgetContext);

  const { app } = connector!;

  return { connector: connector!, viewerApp: app };
};
