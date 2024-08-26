import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  AnnotationEditorType,
  PDFEditor,
} from "./lib/components/PDFEditor/PDFEditor";
import { usePDFEditorConnector } from "./lib/components/PDFEditor/PDFEditorConnector";

import { useEffect, useState } from "react";

export interface PDFEditor {
  viewerUrl: string;
}

function App() {
  const connector = usePDFEditorConnector({
    viewerUrl: "/pdf-viewer/web/viewer.html",
    viewerParams: { disableHistory: true, disableDragOpen: true },
  });

  const [annots, setAnnots] = useState<any[]>([
    {
      annotationType: 3,
      color: [0, 0, 0],
      fontSize: 10,
      value: "dcwxdwd",
      pageIndex: 0,
      rect: [86.4, 750.90625, 136.02187500000002, 770.8],
      rotation: 0,
      structTreeParentId: null,
      id: null,
      editorId: "pdfjs_internal_editor_0",
    },
    {
      annotationType: 13,
      bitmapId: "image_c974f109-cdaf-44bb-84f8-1745e7165416_0",
      pageIndex: 0,
      rect: [63, 607.78125, 144.028125, 688.8],
      rotation: 0,
      isSvg: false,
      structTreeParentId: null,
      bitmapUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAAAAXNSR0IArs4c6QAABOJJREFUeF7tm+F10zAQx/9KM4CYgLJBPEHpBNCvkDzaCSgTQCeATtD0EXh8AyYgTGBvQJkA8RVoTE+y++ImjuX4znb6pK+Rz9Ivf0l3p7NCaI0JqMYWggEEiAwiCBADRAYCDCaCEgNEBgIMJoISA0QGAgwmghIDRAYCDCaCEgNEBgIMJoIS7xvE+Fhr/MMICqMB8HCxgF6e42AAswB+IkWCIZJoagwDg8YmOldiPNaPARwAeApgVHNGyUBhvrjGZfTRJDWfZeveGcR4oo+R4gUAgsjREiicR+/NlMNYHRutQ7TKU7hAiv06A/Xuq3AF4KxNmK1BjI/1Pv7hglF5m7kqTLGHs2hqCKpoawVipr7PSIsHhejMyDipMsWraGa+SL5LHGI81i8BvJOchIftN9HMnHn026qLKMR4rF/fjOrNViPjf0gMpBjEngHM/xIRkCIQM/eFDpH+tRTH0QdzyTkwdoj2FL5G3Poh4k/FYIiI89TmhzjRP8R8QH9QVT3n0cwcVnXy/Z0VYk9OYr+5k+vzwbB4DSwQbeLgD/axB/IFZSIRPzR1etGyfsSRxNgaIjnQA4Uni9TGvnUTB36TVaAsjfPvUpC7VMjq+BnZ2OssmpnGLlgtiFmq6uVNJEDJA1nFEcA9HEZTl52Jn+kRBvjGDJJFjd4QrdsCvBaH58K1AsBcSyIgGfbGSohWfdc260L5PvlWAlAQZOOTeiPEzOf71or6Nijw7j/HrsghHjQ5YEoh9hWgkCIPo5mZb7vM1kLsO0ABkHMofN327mYFYrYHUtgme/rmJCr2wCp1sC9t90KCeumbHV+FONFvkeK0avAsvzcEKKDI4rQoqbvAeVVkU4CYpfB/sACqMsIEUBykO/CuMp917VVDEeJYkzPLdftWjpEZYCsgAUMrdF0a7RZidv9LEGWbEMCWQFL4uZKPvIWYTPRFmoKiErkmDLA1kEDBJbIQs5j4lxy98lBO6p1Cp7YbrtsjKbFry1gcxLGmkO6z1ITKYmGx92WGRUECX6KZOVqGSMlJutrkby0t4bKBC4O0yzpXouSpnNhIoKqRc1sz9LKHoavn2dyUDRwkvA6bvHAQ+3AvonDiGyHcHiCuKKrbW8UhHuRKTKv+TPHfdxWiwkmA2FQdKaYBYlOIQBL2xOYQTa7EWOzGzneQu7onLjnbVKJb7Sr4Atmm385DfK5PofB2m7mzPbO7ELPl7EqB28kjllHfXYjuYLEOd1u5xPsGUWUujoXY9ZLeVSXmzraF6L5moiXNXe/it23uKsQhHhWvByb6FGlHBwx9MgF89yPueingQDyRvGlACtPovXFh33LrfG+sQ7Hrvq4072rdvTOd1OR8d7Osuwbj+/5MhdmKWH2q14XrvpOU7HfnCrW8FmesqfiRCitDWyVwtPyV1uaqsABynYBWqmur6xPpEotCwrZqc/qs+wVOoo+rnwJXQsx8SDpsaHl3m6ToCrDbA4/y0ue7w/CCmD+UVUnQPilx6dMVovL30k1linMM8W5TEWgtiLcwXRE6ZX4O7uUyd5/4XlbBy3lsBbHgnDugdCU5url5e9g/OXmOSOE3FBL8xTz6VO9D88YQPYd4r7sFiAx/b4AYIDIQYDARlBggMhBgMBGUGCAyEGAwEZQYIDIQYDARlBggMhBgMBGUyADxP/d6/de9me32AAAAAElFTkSuQmCC",
      eidtorId: "pdfjs_internal_editor_1",
    },
  ]);

  const img =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAQ3SURBVHgB7ZtfUhpBEMa/BfO+OYHkBHFP4HqC8JxoiSdQTxA8gXoCoWKsvGlOAJ4AcgLJCbJ5jcCme3aXP7ICCzOzC/avCrFYqBo+vp6e6Z4FBEEQBEEQBEEQBEEQhOLjoEB0aq6LPvZoVHslYHc4hDt5vVRCMAR+I0QXO+h6jSBAAchdxM6h69PTPj2q9NhDNrolB+3hAE3vLugiJ3ITsXPk1shRx/SvDz106dtce9+CBixjXUTlPAc3JGAFJnDQo78XNsW0JiLNdxWa726gz3nzcdBAmcRsBD0YxoqIsfvuyX0ubMKuDHHu3QYPMEgJhiEBT+mpZV1AJpoy7mkMX2EQoyLGg79C/tRNCmksnONB11Es6hTaF9CMERHj5csNikiImvc9aEIj2kVUWXiATi5z4HIEtNvxdGZt/XPiIKcksjxuvNTShlYRVSY2tYjWi9/54p5BE1rCWRUO/pF4ZbUWrGAz4LD+oKOIsYMV4QU0bf4/DUPagXDlhT0dQi8O+AtG2TQEZ3ud0wSHNbuxjjXJ5MS4VHVKn6oZdxwLWMYBOUVVZzqfXf6hWtArpBY3Lj0nqmULZ13+5SwLyKhS1xAHAHTWEF08kyHWZKGI7D4S8F6t+2zMdykCJhgRkqYkrMnccI7XfC1ryWKOgFPj0h3aO3i/Tki/6sSiCshod2Q/c0V9ilQnFlnASTQ6sk1j+Llq72ZGRJWBo21bBTZYUcAEQ1mbRW0uWx2fDecBrcc2REDGUNb2OZFSQn1aZmcz5cS4hP8EG2gQcBJDjozgCnk01l7a5Wkn9i2VrzQLyBhyZARHZh8dcuVx2uWRE+P+bwumMSDgJEYdyaTUI0dOdBwcwzSGBWSMOpKhLmJsuImXMNoT/4FJLAg4iYU50kuWQpET+4Z7wZYFZCzMkaP8kYSzD1PkIGCC4dCuJmGd1BM/whQhWf8Zp5TZ5r+PF7e3QRsZUF8iXGou5x/Qh364xtmORHTInroLqmPUUbmF73LwiKw4alNQQ374nE+icN6ckn7xGKBq/BjJ1jPEvoi4LtGpXiRn+oTVqCRzopnV/dvATcL5F4SVSZyY26HxLSCIRHyHBwir0lMixsXGNoTsOOiOlzghNWqEVXgci/gODUCydGbKaE/3WI6oKRPiEnngqB8x0/6ZBr8fhjnunWnM1BE8mW2ZHrpcyPQhLCY6DNUrpVw4gYT1YtiFcfdvRkR1wcE5hNeJ2gOjuxBSCxBx51/7rQpbA9+lNdGDfrWKQ1XmOkTINC5e3ua28KQsJZoqvetSCrfg2uEJ9W0aL19eWE9UqpdVs0frDTQbBc+BfO/LXfoBp2xntqPuFjdnfLwFuFMZ4poEvJp33C6TiAlxY/yMPr2/lWEe3eLbXCTe+O1rEgtaAXf1QuxiU3Hwl4sJ1N5tez/M32guCIIgCIIgCIIgCIKQif86/a+K+cQ/iwAAAABJRU5ErkJggg==";
  useEffect(() => {
    if (!connector.eventBus) return;
    connector.eventBus.on("annotationEditorSelected", (event: any) => {
      console.log("annotationeditorselected", event);
    });
  }, [connector.eventBus]);

  return (
    <div>
      <div className="w-screen h-screen flex">
        <div className="w-[300px] border-r">
          <h1 className="h-[50px] flex items-center px-4 border-b">功能测试</h1>

          <div className="flex mt-4 flex-col [&>button]:text-left [&>button]:w-full [&>button]:h-full [&>button]:px-4 [&>button]:py-2 [&>button:hover]:bg-gray-300">
            <button
              onClick={async () => {
                const pdfDoc = await PDFDocument.create();
                const timesRomanFont = await pdfDoc.embedFont(
                  StandardFonts.TimesRoman,
                );

                const page = pdfDoc.addPage();
                const { height } = page.getSize();
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
              }}
            >
              原地创建 PDF
            </button>

            <button
              onClick={() => {
                connector.addEmptyPage();
              }}
            >
              添加空白页
            </button>

            <button
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  "data",
                  JSON.stringify({
                    bitmapFile: img,
                    mode: AnnotationEditorType.FREETEXT,
                  }),
                );
              }}
              onClick={() => {
                if (!connector) return;
                connector.setAnnotationEditorType(
                  AnnotationEditorType.FREETEXT,
                );
              }}
            >
              文字工具
            </button>
            <button
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  "data",
                  JSON.stringify({
                    mode: AnnotationEditorType.DATE,
                  }),
                );
              }}
              onClick={() => {
                if (!connector.app) return;
                connector.setAnnotationEditorType(AnnotationEditorType.DATE);
              }}
            >
              日期工具
            </button>
            <button
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  "data",
                  JSON.stringify({
                    bitmapFile: img,
                    mode: AnnotationEditorType.STAMP,
                  }),
                );
              }}
              onClick={() => {
                if (!connector.app) return;
                connector.setAnnotationEditorType(AnnotationEditorType.STAMP, {
                  bitmapFile: img,
                });
              }}
            >
              图片工具
            </button>
            <button
              onClick={() => {
                if (!connector.app) return;
                const annots = connector.getAllAnnotations();
                console.log(annots);

                setAnnots(annots);
              }}
            >
              获取注释序列化
            </button>
            <button
              onClick={() => {
                if (!connector.app) return;
                connector.setAnnotations(annots);
              }}
            >
              添加注释
            </button>
            <button
              onClick={() => {
                connector.app.pdfViewer.annotationEditorUIManager.isDraggable =
                  true;
              }}
            >
              开启拖动
            </button>
            <button
              onClick={() => {
                connector.app.pdfViewer.annotationEditorUIManager.isDraggable =
                  false;
              }}
            >
              关闭拖动
            </button>
          </div>
        </div>

        <PDFEditor className="flex-1 overflow-hidden" connector={connector} />
      </div>
    </div>
  );
}

export default App;
