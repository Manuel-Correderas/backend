// models/Propiedad.js
export default class Propiedad {
  constructor(id, direccion, propietarioId, inquilinoId = null, vencimiento = null, estado = 'disponible') {
    this.id = id;
    this.direccion = direccion;
    this.propietarioId = propietarioId;
    this.inquilinoId = inquilinoId;
    this.vencimiento = vencimiento;
    this.estado = estado;
  }
}