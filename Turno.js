// models/Turno.js
export default class Turno {
  constructor(id, inquilinoId, propiedadId, fecha, comprobante = '', pagado = false) {
    this.id = id;
    this.inquilinoId = inquilinoId;
    this.propiedadId = propiedadId;
    this.fecha = fecha;
    this.comprobante = comprobante;
    this.pagado = pagado;
    this.estado = 'pendiente'; // también puede ser 'aceptado' o 'rechazado'
  }
}
