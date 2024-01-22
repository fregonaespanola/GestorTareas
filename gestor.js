const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = 8080;
const TAREAS_FILE = 'tareas.json';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para obtener las tareas existentes
app.get('/obtener-tareas', async (req, res) => {
  try {
    const tareas = await leerArchivo();
    res.json(tareas);
  } catch (err) {
    console.error('Error al obtener tareas:', err);
    res.status(500).send('Error al obtener tareas');
  }
});

// Ruta para eliminar una tarea por ID
app.post('/eliminar-tarea/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  try {
    // Lee el archivo
    const tareas = await leerArchivo();

    // Filtra las tareas para excluir la tarea con el ID especificado
    const nuevasTareas = tareas.filter(tarea => tarea.id !== taskId);

    // Escribe en el archivo las tareas actualizadas
    await escribirArchivo(nuevasTareas);

    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar tarea:', err);
    res.status(500).json({ success: false, error: 'Error al eliminar tarea' });
  }
});

app.post('/', async (req, res) => {
  const tarea = { id: Date.now(), nombre: req.body.tarea };

  try {
    // Lee el archivo
    const tareas = await leerArchivo();

    // Agrega la nueva tarea
    tareas.push(tarea);

    // Escribe en el archivo
    await escribirArchivo(tareas);

    res.redirect('/');
  } catch (err) {
    console.error('Error al procesar la solicitud:', err);
    res.status(500).send('Error al procesar la solicitud');
  }
});

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

// Ruta para actualizar una tarea por ID
// Ruta para actualizar una tarea por ID
app.post('/actualizar-tarea/:id', async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const nuevoNombre = req.body.nuevoNombre;
  const contenidoHTML = req.body.contenidoHTML;

  try {
    // Lee el archivo de tareas
    const data = await fs.readFile(TAREAS_FILE, 'utf-8');
    const tareas = JSON.parse(data);

    // Encuentra la tarea con el ID especificado
    const tarea = tareas.find(t => t.id === taskId);

    if (!tarea) {
      res.status(404).json({ success: false, error: 'Tarea no encontrada' });
      return;
    }
    
    let agarrarNombre = nuevoNombre.split("TO DO");  
    if(agarrarNombre[0].includes(`(ID`)){
      let aux = agarrarNombre[0].split("(ID");
      agarrarNombre[0] = aux[0];
      console.log(agarrarNombre[0].length);
      
    }
    tarea.nombre = agarrarNombre[0].trim();
    await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2), 'utf-8');

    // Devuelve las tareas actualizadas en formato JSON válido
    res.json({ success: true, tareas });
  } catch (err) {
    console.error('Error al actualizar tarea:', err);
    // Devuelve una respuesta en formato JSON válido incluso en caso de error
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});




async function escribirArchivo(tareas) {
  await fs.writeFile(TAREAS_FILE, JSON.stringify(tareas, null, 2), 'utf-8');
}

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

