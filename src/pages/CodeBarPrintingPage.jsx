import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const CodeBarPrintingPage = (props) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <div>
        <button
          id="boton-print"
          type="button"
          className="btn btn-outline-secondary"
          onClick={handlePrint}
        >
          Imprimir códigos
        </button>
      </div>

      {props.partidas.map((val, key) => {
        return <div ref={componentRef}>{val.barcode}</div>;
      })}
    </>
  );
};

export default CodeBarPrintingPage;
