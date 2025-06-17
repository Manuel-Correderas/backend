export default class Inquilino {
  constructor(id, nombre, apellido, email, telefono, usuario, contrasena) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.telefono = telefono;
    this.usuario = usuario;
    this.contrasena = contrasena;
    this.rol = "inquilino";
    this.turnos = [];
  }
}
