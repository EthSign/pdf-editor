import { createContext, useContext } from "react";

const widgetContext = createContext({});

export const useWidgetContext = () => {
  const context = useContext(widgetContext);
  return context;
};


