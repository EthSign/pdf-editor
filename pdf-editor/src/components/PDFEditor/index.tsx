import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { PDFEditorProps } from "./types";

export const PDFEditor: React.FC<PDFEditorProps> = props => {
  const { connector } = props;

  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    connector.disconnect();
  }, []);

  return (
    <div className="size-full">
      <iframe
        className={clsx({ visible: editorReady, invisible: !editorReady })}
        src={connector.viewerUrl}
        width="100%"
        height="100%"
        onLoad={async event => {
          await connector.connect(event.target as HTMLIFrameElement);
          setEditorReady(true);
        }}
      />
    </div>
  );
};