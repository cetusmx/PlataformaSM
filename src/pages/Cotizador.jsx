import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

export const Cotizador = () => {
  return (
    <Card className="text-center">
      <Card.Header>
        <h2>Cotizador</h2>
      </Card.Header>
      <Card.Body>
        <label className="mb-2">Ingresa Costo</label>
        <input
          type="text"
          className="form-control pxt-5"
          placeholder="Ingresa costo en factura del proveedor"
          aria-label="Username"
          aria-describedby="basic-addon1"
        />
        <label className="mt-3 mb-2">Familia</label>
        <select className="form-select">
          <option selected>-- Seleccionar familia --</option>
          <option value="1">Sello U</option>
          <option value="2">Oring</option>
          <option value="3">Limpiador</option>
        </select>
        
      </Card.Body>
      <Card.Footer className="text-muted">
        <Button type="submit">Calcular</Button>
      </Card.Footer>
    </Card>
  );
};
