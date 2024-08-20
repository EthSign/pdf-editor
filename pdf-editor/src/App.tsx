import "./App.css";
import { PDFEditor } from "./components/PDFEditor";
import { usePDFEditorConnector } from "./components/PDFEditor/PDFEditorConnector";

import React, { useMemo, useRef, useState } from "react";

export interface PDFEditor {
  viewerUrl: string;
}

const AnnotationEditorType = {
  DISABLE: -1,
  NONE: 0,
  FREETEXT: 3,
  DATE: 27,
  HIGHLIGHT: 9,
  STAMP: 13,
  INK: 15,
};

export const App: React.FC<any> = props => {
  const connector = usePDFEditorConnector({ viewerUrl: "/web/viewer.html" });

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

  return (
    <div className="size-full flex">
      <div className="w-[300px] p-8">
        <button
          draggable
          onDragStart={event => {
            event.dataTransfer.setData(
              "data",
              JSON.stringify({
                bitmapFile: img,
                mode: AnnotationEditorType.FREETEXT,
              })
            );
          }}
          className="border px-4 py-2"
          onClick={() => {
            if (!connector) return;
            connector.pdfViewer.annotationEditorUIManager.annotationTempData = {
              mode: AnnotationEditorType.FREETEXT,
            };
          }}
        >
          文字工具
        </button>
        <button
          draggable
          onDragStart={event => {
            event.dataTransfer.setData(
              "data",
              JSON.stringify({
                mode: AnnotationEditorType.DATE,
              })
            );
          }}
          className="border px-4 py-2"
          onClick={() => {
            if (!editorReady) return;
            appRef.current.pdfViewer.annotationEditorUIManager.annotationTempData =
              {
                mode: AnnotationEditorType.DATE,
              };
          }}
        >
          日期工具
        </button>
        <button
          draggable
          onDragStart={event => {
            event.dataTransfer.setData(
              "data",
              JSON.stringify({
                bitmapFile: img,
                mode: AnnotationEditorType.STAMP,
              })
            );
          }}
          className="border px-4 py-2"
          onClick={() => {
            if (!editorReady) return;
            appRef.current.pdfViewer.annotationEditorUIManager.annotationTempData =
              {
                mode: AnnotationEditorType.STAMP,
                bitmapFile: img,
              };
          }}
        >
          图片工具
        </button>
        <button
          className="border px-4 py-2"
          onClick={() => {
            if (!editorReady) return;

            const data = [];
            for (const editor of appRef.current.pdfViewer.annotationEditorUIManager.allEditors.values()) {
              data.push(editor.serialize(false, true));
            }
            setAnnots(data);
            console.log(data);
          }}
        >
          获取注释序列化
        </button>
        <button
          className="border px-4 py-2 "
          onClick={() => {
            if (!editorReady) return;
            appRef.current.pdfViewer.annotationEditorUIManager.addAnnotations(
              annots
            );
          }}
        >
          添加注释
        </button>
        <button
          className="border px-4 py-2 "
          onClick={() => {
            appRef.current.pdfViewer.annotationEditorUIManager.isDraggable =
              true;
          }}
        >
          开启拖动
        </button>
        <button
          className="border px-4 py-2 "
          onClick={() => {
            appRef.current.pdfViewer.annotationEditorUIManager.isDraggable =
              false;
          }}
        >
          关闭拖动
        </button>
      </div>

      <div className="flex-1">
        <PDFEditor connector={connector} />
      </div>
    </div>
  );
};

export default App;
