import { useState } from "react";
import "./App.css";
import { PDFEditor } from "./components/PDFEditor";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="w-screen h-screen">
      <PDFEditor viewerUrl="/web/viewer.html" />
    </div>
  );
}

export default App;
