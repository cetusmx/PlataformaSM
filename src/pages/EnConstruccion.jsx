import React from 'react'
import "../styles/enconstruccion.css";
import ProgressBar from 'react-bootstrap/ProgressBar';

const EnConstruccion = ({percentage}) => {
  return (
    <>
      <div className="container-construccion">
        <div>
          <h1>EN CONSTRUCCIÓN</h1>
        </div>
        <div style={{paddingTop: "20px"}}>
          <h3>Funcionalidad estará lista pronto</h3>
        </div>
        <div className="barraDiv" >
            <div className='numeroBarra'>{`${percentage}%`}</div>
            
        </div>
        <ProgressBar animated className='barProgress'  now={percentage} />
      </div>
    </>
  )
}

export default EnConstruccion