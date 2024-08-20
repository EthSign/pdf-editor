import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import "./App.css";
import { PDFEditor } from "./components/PDFEditor";
import { usePDFEditorConnector } from "./components/PDFEditor/PDFEditorConnector";

function App() {
  const connector = usePDFEditorConnector({ viewerUrl: "/web/viewer.html" });

  const buttons = [
    {
      label: "原地创建 pdf",
      handler: async () => {
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 30;
        page.drawText("Creating PDFs in JavaScript is awesome!", {
          x: 50,
          y: height - 4 * fontSize,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0.53, 0.71),
        });

        pdfDoc.addPage();

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        const url = URL.createObjectURL(blob);

        connector.open(url);
      },
    },
    {
      label: "添加空白页",
      handler: () => {
        connector.addEmptyPage();
      },
    },
  ];

  return (
    <div>
      <div className="w-screen h-screen flex">
        <div className="w-[300px] border-r">
          <h1 className="h-[50px] flex items-center px-4 border-b">功能测试</h1>

          <div className="">
            {buttons.map((button, index) => (
              <button
                className="w-full h-full text-left px-4 py-2 mt-4"
                key={index}
                onClick={() => button.handler()}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>

        <PDFEditor connector={connector} />
      </div>
    </div>
  );
}

export default App;
