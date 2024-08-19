import "./App.css";
import { PDFEditor } from "./components/PDFEditor";

function App() {
  return (
    <div className="w-screen h-screen">
      <PDFEditor viewerUrl="/web/viewer.html" />
    </div>
  );
}

export default App;
