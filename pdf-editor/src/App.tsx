import "./App.css";
import { PDFEditor } from "./components/PDFEditor";
import { usePDFEditorConnector } from "./components/PDFEditor/PDFEditorConnector";

function App() {
  const connector = usePDFEditorConnector({ viewerUrl: "/web/viewer.html" });

  return (
    <div>
      <div className="w-screen h-screen flex">
        <div className="w-[300px] border-r">
          <h1 className="h-[50px] flex items-center px-4 border-b">功能测试</h1>
        </div>

        <PDFEditor connector={connector} />
      </div>
    </div>
  );
}

export default App;
