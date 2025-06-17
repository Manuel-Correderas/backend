// Archivo: routes/tareas.js
import express from 'express';
import { readFile, writeFile } from 'fs/promises';
const router = express.Router();

const DB_FILE = './db/tareas.json';

const leerTareas = async () => {
  try {
    return JSON.parse(await readFile(DB_FILE, 'utf-8'));
  } catch {
    return [];
  }
};

const escribirTareas = async tareas => {
  await writeFile(DB_FILE, JSON.stringify(tareas, null, 2));
};

// Mostrar lista de tareas
router.get('/', async (req, res) => {
  const tareas = await leerTareas();
  res.render('tareas/lista', { tareas });
});

// Formulario nueva tarea
router.get('/nueva', (req, res) => {
  res.render('tareas/nueva');
});

// Crear tarea
router.post('/nueva', async (req, res) => {
  const { titulo, descripcion, area, prioridad, estado, asignadoA, fecha } = req.body;
  const tareas = await leerTareas();
  const nuevaTarea = {
    id: Date.now(),
    titulo,
    descripcion,
    area,
    prioridad,
    estado,
    asignadoA,
    fecha
  };
  tareas.push(nuevaTarea);
  await escribirTareas(tareas);
  res.redirect('/tareas');
});

// Editar tarea
router.get('/:id/editar', async (req, res) => {
  const tareas = await leerTareas();
  const tarea = tareas.find(t => t.id === parseInt(req.params.id));
  if (!tarea) return res.status(404).send('Tarea no encontrada');
  res.render('tareas/editar', { tarea });
});

// Actualizar tarea
router.post('/:id/editar', async (req, res) => {
  const tareas = await leerTareas();
  const idx = tareas.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).send('Tarea no encontrada');
  tareas[idx] = { ...tareas[idx], ...req.body };
  await escribirTareas(tareas);
  res.redirect('/tareas');
});

// Eliminar tarea
router.post('/:id/eliminar', async (req, res) => {
  const tareas = await leerTareas();
  const nuevas = tareas.filter(t => t.id !== parseInt(req.params.id));
  await escribirTareas(nuevas);
  res.redirect('/tareas');
});

export default router;
