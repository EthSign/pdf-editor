import "./App.css";
import { PDFEditor } from "./components/PDFEditor";

function App() {
  return (
    <div>
      <div className="w-screen h-screen">
        <PDFEditor viewerUrl="/web/viewer.html" />
      </div>
    </div>
  );
}

export default App;
