class Tarea {
  constructor(id, titulo, descripcion, estado, prioridad, fecha, area, empleadoId, informe = '', finalizada = false) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.estado = estado;
    this.prioridad = prioridad;
    this.fecha = fecha;
    this.area = area;
    this.empleadoId = empleadoId;
    this.informe = informe;
    this.finalizada = finalizada;
  }
}
export default Tarea;	
