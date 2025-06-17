// db.js
import mongoose from 'mongoose';

// URI de conexión: usar variable de entorno o fallback local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mi_crud';

// Conectar a MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log(`🔌 Conectado a MongoDB en ${MONGODB_URI}`);
});

// Definición del modelo Persona
const empleadoSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  dni: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, required: true },
  foto: { type: String }, // ruta o URL
});

const Empleado = mongoose.model('Empleado', empleadoSchema);

export { db, Empleado };


///
