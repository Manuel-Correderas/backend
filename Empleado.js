export default class Empleado {
  constructor(id, nombre, apellido, dni, telefono, email, foto, usuario, contrasena, rol = "empleado") {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.telefono = telefono;
    this.email = email;
    this.foto = foto;
    this.usuario = usuario;
    this.contrasena = contrasena;
    this.rol = rol;
  }
}
