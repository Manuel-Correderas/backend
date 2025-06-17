// main.js
import './db.js'; // inicializa la conexión
import { Empleado } from './db.js'; // modelo Mongoose

import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Corregir __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true
    }
  });

  // Abre directamente el navegador con el servidor backend
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  // Asegurar carpeta de uploads
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Ejecutar servidor
  const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';
  spawn(nodeCmd, ['index.js'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  // Crear ventana
  createWindow();
});

app.on('window-all-closed', () => app.quit());
