const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;
const TAREAS_FILE = 'tareas.json';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//leer el archivo
app.get('/obtener-tareas', async (req, res) => {
  try {
    const tareas = await leerArchivo();
    res.json(tareas);
  } catch (err) {
    console.error('Error al obtener tareas:', err);
    res.status(500).send('Error al obtener tareas');
  }
});

// eliminar la tarea de forma individual
app.post('/eliminar-tarea/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  try {
    const tareas = await leerArchivo();

    const nuevasTareas = tareas.filter(tarea => tarea.id !== taskId);

    await escribirArchivo(nuevasTareas);

    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar tarea:', err);
    res.status(500).json({ success: false, error: 'Error al eliminar tarea' });
  }
});

//agregar una nueva tarea
app.post('/', async (req, res) => {
  const tarea = { id: Date.now(), nombre: req.body.tarea, estado: "TO DO" }; // Añadir estado "TO DO"

  try {
    const tareas = await leerArchivo();

    tareas.push(tarea);

    await escribirArchivo(tareas);

    res.redirect('/');
  } catch (err) {
    console.error('Error al procesar la solicitud:', err);
    res.status(500).send('Error al procesar la solicitud');
  }
});

//cambiar el estado de la tarea (TO DO, DOING o DONE)
app.post('/actualizar-estado/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const nuevoEstado = req.body.nuevoEstado;

  try {
    const data = await fs.readFile(TAREAS_FILE, 'utf-8');
    const tareas = JSON.parse(data);

    const tarea = tareas.find(t => t.id === taskId);

    if (!tarea) {
      res.status(404).json({ success: false, error: 'Tarea no encontrada' });
      return;
    }

    tarea.estado = nuevoEstado;

    await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2), 'utf-8');

    res.json({ success: true, tareas });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

//eliminar todas las tareas simultáneamente
app.post('/eliminar-todas', async (req, res) => {
  try {
    await escribirArchivo([]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar todas las tareas:', err);
    res.status(500).json({ success: false, error: 'Error al eliminar todas las tareas' });
  }
});

// Cambiar el nombre de la tarea
app.post('/actualizar-tarea/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const nuevoNombre = req.body.nuevoNombre;

  try {
    const data = await fs.readFile(TAREAS_FILE, 'utf-8');
    const tareas = JSON.parse(data);

    const tarea = tareas.find(t => t.id === taskId);

    if (!tarea) {
      res.status(404).json({ success: false, error: 'Tarea no encontrada' });
      return;
    }
    //hubo problemas para la gestión de nombre en el guardado, aquí se gestiona
    let agarrarNombre = nuevoNombre.split("TO DO");
    if (agarrarNombre[0].includes(`(ID`)) {
      let aux = agarrarNombre[0].split("(ID");
      agarrarNombre[0] = aux[0];
      console.log(agarrarNombre[0].length);

    }
    tarea.nombre = agarrarNombre[0].trim();
    await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2), 'utf-8');

    res.json({ success: true, tareas });
  } catch (err) {
    console.error('Error al actualizar tarea:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

async function escribirArchivo(tareas) {
  await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2), 'utf-8');
}

async function leerArchivo() {
  try {
    const data = await fs.readFile(TAREAS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
