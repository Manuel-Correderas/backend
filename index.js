// index.js COMPLETO Y CORREGIDO (ARREGLADO VER, EDITAR Y BORRAR USUARIOS)
import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Usuario from './Usuario.js';
import Empleado from './Empleado.js';
import Tarea from './Tarea.js';
import Propietario from './Propietario.js';
import Inquilino from './Inquilino.js';
import Propiedad from './Propiedad.js';
import Turno from './Turno.js';
import methodOverride from 'method-override';

const app = express();
const PORT = process.env.PORT || 3000;

const DB_EMPLEADOS = './empleados.json';
const DB_USUARIOS = './usuarios.json';
const DB_TAREAS = './tareas.json';
const DB_PROPIETARIOS = './propietarios.json';
const DB_INQUILINOS = './inquilinos.json';
const DB_PROPIEDADES = './propiedades.json';
const DB_TURNOS = './turnos.json';

///
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.set('view engine', 'pug');
app.set('views', './views');

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `foto-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

app.use('/public', express.static(path.join(process.cwd(), 'public')));

const leerJSON = async (file) => {
  try {
    return JSON.parse(await readFile(file, 'utf-8'));
  } catch {
    return [];
  }
};
const escribirJSON = async (file, data) => {
  await writeFile(file, JSON.stringify(data, null, 2));
};

// Inicio y login
app.get('/', (_, res) => res.redirect('/inicio'));
app.get('/inicio', (_, res) => res.render('inicio'));

app.get('/login', (req, res) => {
  const { rol } = req.query;
  res.render('login', { rol });
});

app.post('/login', async (req, res) => {
  const { usuario, contrasena, rol } = req.body;
  const usuarios = await leerJSON(DB_USUARIOS);
  const user = usuarios.find(u => u.usuario === usuario && u.contrasena === contrasena && u.rol === rol);

  if (!user) return res.status(401).render('errorLogin', { mensaje: 'Credenciales incorrectas' });

  if (rol === 'administrador') return res.redirect('/admin');
  if (rol === 'empleado') return res.redirect(`/empleado/${user.id}/dashboard`);
  if (rol === 'propietario') return res.redirect(`/propietario/${user.id}/dashboard`);
  if (rol === 'inquilino') return res.redirect(`/inquilino/${user.id}/dashboard`);
  res.redirect('/');
});

// Admin dashboard
app.get('/admin', async (_, res) => {
  const usuarios = await leerJSON(DB_USUARIOS);
  res.render('adminDashboard', { usuarios });
});

// CRUD Usuarios
app.get('/usuarios', async (_, res) => {
  const usuarios = await leerJSON(DB_USUARIOS);
  res.render('listaUsuarios', { usuarios });
});

app.get('/usuarios/nuevo', (_, res) => res.render('nuevaEmpleado'));

app.post('/usuarios/nuevo', upload.single('foto'), async (req, res) => {
  const { nombre, apellido, dni, telefono, email, usuario, contrasena, rol } = req.body;
  const foto = req.file ? `/public/uploads/${req.file.filename}` : '';

  const usuarios = await leerJSON(DB_USUARIOS);
  if (usuarios.find(u => u.usuario === usuario)) {
    return res.status(400).render('errorEmpleado', { mensaje: 'Usuario ya existe' });
  }

  const nuevoId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
  usuarios.push(new Usuario(nuevoId, nombre, apellido, dni, telefono, email, foto, usuario, contrasena, rol));
  await escribirJSON(DB_USUARIOS, usuarios);
  res.redirect('/usuarios');
});

app.get('/usuarios/:id', async (req, res) => {
  const usuarios = await leerJSON(DB_USUARIOS);
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id));
  if (!usuario) return res.status(404).render('error', { mensaje: 'Usuario no encontrado' });
  res.render('usuarios', { usuario });
});

app.get('/usuarios/:id/editar', async (req, res) => {
  const usuarios = await leerJSON(DB_USUARIOS);
  const usuario = usuarios.find(u => u.id === parseInt(req.params.id));
  if (!usuario) return res.status(404).render('error', { mensaje: 'Usuario no encontrado' });
  res.render('editarUsuario', { usuario });
});

app.put('/usuarios/:id', upload.single('foto'), async (req, res) => {
  const { nombre, apellido, dni, telefono, email, usuario, contrasena, rol } = req.body;
  const usuarios = await leerJSON(DB_USUARIOS);
  const id = parseInt(req.params.id);
  const idx = usuarios.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).render('error', { mensaje: 'Usuario no encontrado' });

  const foto = req.file ? `/public/uploads/${req.file.filename}` : usuarios[idx].foto;
  usuarios[idx] = { ...usuarios[idx], nombre, apellido, dni, telefono, email, foto, usuario, contrasena, rol };
  await escribirJSON(DB_USUARIOS, usuarios);
  res.redirect('/usuarios');
});

app.delete('/usuarios/:id', async (req, res) => {
  const usuarios = await leerJSON(DB_USUARIOS);
  const nuevos = usuarios.filter(u => u.id !== parseInt(req.params.id));
  await escribirJSON(DB_USUARIOS, nuevos);
  res.redirect('/usuarios');
});

// CRUD Empleados
app.get('/empleados', async (_, res) => {
  const empleados = await leerJSON(DB_EMPLEADOS);
  const soloEmpleados = empleados.filter(e => e.rol === 'empleado');
  res.render('listaEmpleado', { empleados: soloEmpleados });
});


app.get('/empleados/nuevo', (_, res) => res.render('nuevaEmpleado'));

app.post('/empleados/nuevo', upload.single('foto'), async (req, res) => {
  const { nombre, apellido, dni, telefono, email, usuario, contrasena, rol } = req.body;
  const foto = req.file ? `/public/uploads/${req.file.filename}` : '';

  const empleados = await leerJSON(DB_EMPLEADOS);
  const nuevoId = empleados.length ? Math.max(...empleados.map(e => e.id)) + 1 : 1;
  empleados.push(new Empleado(nuevoId, nombre, apellido, dni, telefono, email, foto, usuario, contrasena, rol));
  await escribirJSON(DB_EMPLEADOS, empleados);
  res.redirect('/empleados');
});

app.get('/empleados/:id', async (req, res) => {
  const empleados = await leerJSON(DB_EMPLEADOS);
  const empleado = empleados.find(e => e.id === parseInt(req.params.id));
  if (!empleado) return res.status(404).render('error', { mensaje: 'Empleado no encontrado' });
  res.render('empleado', { empleado });
});

app.get('/empleados/:id/editar', async (req, res) => {
  const empleados = await leerJSON(DB_EMPLEADOS);
  const empleado = empleados.find(e => e.id === parseInt(req.params.id));
  if (!empleado) return res.status(404).render('error', { mensaje: 'Empleado no encontrado' });
  res.render('editarEmpleado', { empleado });
});

app.put('/empleados/:id', upload.single('foto'), async (req, res) => {
  const { nombre, apellido, dni, telefono, email, usuario, contrasena, rol } = req.body;
  const empleados = await leerJSON(DB_EMPLEADOS);
  const id = parseInt(req.params.id);
  const idx = empleados.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).render('error', { mensaje: 'Empleado no encontrado' });

  empleados[idx] = { ...empleados[idx], nombre, apellido, dni, telefono, email, foto: req.file ? `/public/uploads/${req.file.filename}` : empleados[idx].foto, usuario, contrasena, rol };
  await escribirJSON(DB_EMPLEADOS, empleados);
  res.redirect('/empleados');
});

app.delete('/empleados/:id', async (req, res) => {
  const empleados = await leerJSON(DB_EMPLEADOS);
  const nuevos = empleados.filter(e => e.id !== parseInt(req.params.id));
  await escribirJSON(DB_EMPLEADOS, nuevos);
  res.redirect('/empleados');
});

// TAREAS

app.get('/tareas', async (_, res) => {
  const tareas = await leerJSON(DB_TAREAS);
  const usuarios = await leerJSON(DB_EMPLEADOS);
  const empleados = usuarios.filter(u => u.rol === 'empleado');
  res.render('listaTareas', { tareas, empleados });
});
app.delete('/tareas/:id', async (req, res) => {
  const tareas = await leerJSON(DB_TAREAS);
  const nuevas = tareas.filter(t => t.id !== parseInt(req.params.id));
  await escribirJSON(DB_TAREAS, nuevas);
  res.redirect('/tareas');
});

app.get('/tareas/nueva', async (_, res) => {
  const usuarios = await leerJSON(DB_EMPLEADOS);
  const empleados = usuarios.filter(u => u.rol === 'empleado');
  res.render('nuevaTarea', { empleados });
});

app.post('/tareas/nueva', async (req, res) => {
  const { titulo, descripcion, estado, prioridad, fecha, area, empleadoId } = req.body;
  const tareas = await leerJSON(DB_TAREAS);
  const nueva = new Tarea(Date.now(), titulo, descripcion, estado, prioridad, fecha, area, parseInt(empleadoId));
  tareas.push(nueva);
  await escribirJSON(tareas);
  res.redirect('/tareas');
});

app.get('/empleado/:id/dashboard', async (req, res) => {
  const usuarios = await leerJSON(DB_EMPLEADOS);
  const empleado = usuarios.find(e => e.id === parseInt(req.params.id));
  if (!empleado) return res.status(404).render('error', { mensaje: 'Empleado no encontrado' });
  res.render('dashboardEmpleado', { empleado });
});

app.get('/empleado/:id/tareas', async (req, res) => {
  const tareas = await leerJSON(DB_TAREAS);
  const usuarios = await leerJSON(DB_EMPLEADOS);
  const empleado = usuarios.find(u => u.id === parseInt(req.params.id));
  if (!empleado) return res.status(404).render('error', { mensaje: 'Empleado no encontrado' });
  const tareasAsignadas = tareas.filter(t => t.empleadoId === empleado.id);
  res.render('tareasEmpleado', { tareas: tareasAsignadas, empleado });
});

app.get('/empleado/:id/tareas/:tid', async (req, res) => {
  const tareas = await leerJSON(DB_TAREAS);
  const usuarios = await leerJSON(DB_EMPLEADOS);
  const tarea = tareas.find(t => t.id === parseInt(req.params.tid));
  const empleado = usuarios.find(u => u.id === parseInt(req.params.id));
  if (!tarea || !empleado) return res.status(404).render('error', { mensaje: 'Tarea o empleado no encontrada' });
  res.render('informeTarea', { tarea, empleado });
});

app.put('/empleado/:id/tareas/:tid', async (req, res) => {
  const tareas = await leerJSON(DB_TAREAS);
  const idx = tareas.findIndex(t => t.id === parseInt(req.params.tid));
  if (idx === -1) return res.status(404).render('error', { mensaje: 'Tarea no encontrada' });
  tareas[idx].informe = req.body.informe;
  tareas[idx].finalizada = true;
  tareas[idx].estado = 'finalizada';
  await escribirTareas(tareas);
  res.redirect(`/empleado/${req.params.id}/tareas`);
});
//Propietario-Inquilino-Turnos
app.get('/propietario/:id/dashboard', async (req, res) => {
  const { id } = req.params;
  const turnos = await leerJSON(DB_TURNOS);
  const propiedades = await leerJSON(DB_PROPIEDADES);
  const propias = propiedades.filter(p => p.propietarioId === parseInt(id));
  const solicitudes = turnos.filter(t => propias.some(p => p.id === t.propiedadId));
  res.render('dashboardPropietario', { id, solicitudes });
});
//
app.put('/empleado/:id/asignar-turno/:turnoId', async (req, res) => {
  const turnos = await leerJSON(DB_TURNOS);
  const idx = turnos.findIndex(t => t.id === parseInt(req.params.turnoId));
  if (idx === -1) return res.status(404).send('Turno no encontrado');

  turnos[idx].empleadoId = parseInt(req.params.id);
  await escribirJSON(DB_TURNOS, turnos);
  res.redirect(`/empleado/${req.params.id}/dashboard`);
});




app.get('/propietario/:id/propiedades', async (req, res) => {
  const propiedades = await leerJSON(DB_PROPIEDADES);
  const propias = propiedades.filter(p => p.propietarioId === parseInt(req.params.id));
  res.render('listaPropiedades', { propiedades: propias, id: req.params.id });
});

app.get('/propietario/:id/propiedades/nueva', (req, res) => {
  res.render('nuevaPropiedad', { id: req.params.id });
});

app.post('/propietario/:id/propiedades', upload.single('foto'), async (req, res) => {
  const { direccion, dias, horaDesde, horaHasta } = req.body;
  const propiedades = await leerJSON(DB_PROPIEDADES);
  const nuevoId = propiedades.length ? Math.max(...propiedades.map(p => p.id)) + 1 : 1;
  const nueva = new Propiedad(nuevoId, direccion, parseInt(req.params.id));
  nueva.diasDisponibles = dias; // ej. ['Lunes','Miércoles']
  nueva.horaDesde = horaDesde;
  nueva.horaHasta = horaHasta;
  nueva.foto = req.file ? `/public/uploads/${req.file.filename}` : '';
  propiedades.push(nueva);
  await escribirJSON(DB_PROPIEDADES, propiedades);
  res.redirect(`/propietario/${req.params.id}/propiedades`);
});

app.get('/inquilino/:id/dashboard', async (req, res) => {
  const { id } = req.params;
  res.render('dashboardInquilino', { id });
});

app.get('/inquilino/:id/solicitar-turno', async (req, res) => {
  const propiedades = await leerJSON(DB_PROPIEDADES);
  const disponibles = propiedades.filter(p => p.estado === 'disponible');
  res.render('solicitarTurno', { propiedades: disponibles, id: req.params.id });
});

app.post('/inquilino/:id/solicitar-turno', async (req, res) => {
  const { propiedadId, fecha, hora } = req.body;
  ///
  const propiedades = await leerJSON(DB_PROPIEDADES);
  const inquilinos = await leerJSON(DB_USUARIOS);
  const propiedad = propiedades.find(p => p.id === parseInt(propiedadId));
  const inquilino = inquilinos.find(i => i.id === parseInt(req.params.id) && i.rol === 'inquilino');

  if (!propiedad || !inquilino) {
    return res.status(400).send("Propiedad o inquilino inválido");
  }
  ///
  const turnos = await leerJSON(DB_TURNOS);
  const nuevoId = turnos.length ? Math.max(...turnos.map(t => t.id)) + 1 : 1;
  ///
  const nuevoTurno = new Turno(nuevoId, parseInt(req.params.id), parseInt(propiedadId), `${fecha} ${hora}`);
  turnos.push(nuevoTurno);
  await escribirJSON(DB_TURNOS, turnos);
  res.redirect(`/inquilino/${req.params.id}/dashboard`);
});

// 
app.post('/turnos/:id/aceptar', async (req, res) => {
  const turnos = await leerJSON(DB_TURNOS);
  const id = parseInt(req.params.id);
  const idx = turnos.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).send('Turno no encontrado');
  turnos[idx].estado = 'aceptado';
  await escribirJSON(DB_TURNOS, turnos);
  res.redirect('back');
});
//
app.put('/propietario/:id/turno/:turnoId/aceptar', async (req, res) => {
  const turnos = await leerJSON(DB_TURNOS);
  const idx = turnos.findIndex(t => t.id === parseInt(req.params.turnoId));
  if (idx === -1) return res.status(404).send('Turno no encontrado');
  turnos[idx].estado = 'pendiente';
  await escribirJSON(DB_TURNOS, turnos);
  res.redirect(`/propietario/${req.params.id}/dashboard`);
});
///
app.get('/empleado/:id/dashboard', async (req, res) => {
  const { id } = req.params;
  const empleado = (await leerJSON(DB_EMPLEADOS)).find(e => e.id === parseInt(id));
  if (!empleado) return res.status(404).render('error', { mensaje: 'Empleado no encontrado' });

  const turnos = await leerJSON(DB_TURNOS);
  const pendientes = turnos.filter(t => t.estado === 'pendiente' || (t.estado === 'aceptado' && !t.empleadoId));

  res.render('dashboardEmpleado', { empleado, turnos: pendientes });
});



app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
