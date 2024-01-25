document.addEventListener('DOMContentLoaded', function() {
  obtenerTareas();
});

async function obtenerTareas() {
try {
  const response = await fetch('/obtener-tareas');
  const tareas = await response.json();

  const todoColumn = document.getElementById('todoColumn');
  const doingColumn = document.getElementById('doingColumn');
  const doneColumn = document.getElementById('doneColumn');
  
  // Limpiar columnas antes de agregar tareas
  todoColumn.innerHTML = '';
  doingColumn.innerHTML = '';
  doneColumn.innerHTML = '';

  // Iterar sobre las tareas y agregar a la columna correspondiente
  tareas.forEach(tarea => {
      const fila = document.createElement('tr');
      const celda = document.createElement('td');
      celda.classList.add('tarea');
      
      // Verificar el estado de la tarea y asignar a la columna correspondiente
      switch (tarea.estado) {
          case 'TO DO':
              todoColumn.appendChild(fila);
              break;
          case 'DOING':
              doingColumn.appendChild(fila);
              break;
          case 'DONE':
              doneColumn.appendChild(fila);
              break;
          default:
              break;
      }
      
      const nombreEditable = document.createElement('div');
      nombreEditable.contentEditable = true;
      nombreEditable.dataset.id = tarea.id; // Añade el atributo data-id
      nombreEditable.innerHTML = `<p>${tarea.nombre}(ID: ${tarea.id})</p>
                          <div class="singtar">
                             <table class="movement">
                                <tr>
                                   <td><button class="todobutton" onclick="actualizarEstado(${tarea.id}, 'TO DO')">TO DO</button></td>
                                   <td><button class="doingbutton" onclick="actualizarEstado(${tarea.id}, 'DOING')">DOING</button></td>
                                   <td><button class="donebutton" onclick="actualizarEstado(${tarea.id}, 'DONE')">DONE</button></td>
                                </tr>
                                <tr>
                                  <td colspan="3"><button class="guardarbutton" onclick="guardarCambios(${tarea.id})">Guardar</button></td>
                                </tr>
                             </table>
                          <button class="elim-sing" onclick="eliminarTarea(${tarea.id})">Eliminar</button>
                          </div>`;

      celda.appendChild(nombreEditable);
      fila.appendChild(celda);
  });
} catch (error) {
   console.error('Error al obtener tareas:', error);
}
}
async function actualizarTarea(id, nuevoNombre) {
  try {
    const response = await fetch(`/actualizar-tarea/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nuevoNombre }),
    });
    
    console.log(id);
    const result = await response.json(); //Aqui falla
    if (!result.success) {
      console.error('Error al actualizar tarea:', result.error);
    }
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
  }
}



async function guardarCambios(id) {
  try {
    const tareaEditable = document.querySelector(`[contenteditable][data-id="${id}"]`);
    const nuevoNombre = tareaEditable.textContent.trim();
    const contenidoHTML = tareaEditable.innerHTML;
    const response = await fetch(`/actualizar-tarea/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nuevoNombre, contenidoHTML }),
    });

     // Agrega este console.log para verificar la respuesta del servidor
     console.log(response);

     const result = await response.json();

     if (result.success) {
        obtenerTareas();
     } else {
        console.error('Error al guardar cambios:', result.error);
     }
  } catch (error) {
     console.error('Error al guardar cambios:', error);
  }
}

async function actualizarEstado(id, estado) {
  try {
    const response = await fetch(`/actualizar-estado/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nuevoEstado: estado }), // Cambiar 'nuevoEstado' a 'estado'
    });
    
    const result = await response.json();
    
    if (result.success) {
      obtenerTareas(); // Actualizar la lista de tareas después de la actualización
    } else {
      console.error('Error al actualizar estado de la tarea:', result.error);
    }
  } catch (error) {
    console.error('Error al actualizar estado de la tarea:', error);
  }
}




async function eliminarTarea(id) {
  try {
    const response = await fetch(`/eliminar-tarea/${id}`, { method: 'POST' });
    const result = await response.json();

    if (result.success) {
      obtenerTareas();
    } else {
      console.error('Error al eliminar tarea:', result.error);
    }
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
  }
}

async function eliminarTodasLasTareas() {
  try {
    const response = await fetch('/eliminar-todas', { method: 'POST' });
    const result = await response.json();

    if (result.success) {
      obtenerTareas();
    } else {
      console.error('Error al eliminar todas las tareas:', result.error);
    }
  } catch (error) {
    console.error('Error al eliminar todas las tareas:', error);
  }
}

function downloadPDF() {
  const table = document.getElementById("tareasContenedor");

  html2pdf()
      .set({
          margin: 1,
          filename: 'document.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 3, letterRendering: true },
          jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' }
      })
      .from(table)
      .save()
      .catch(err => console.log(err));
}
obtenerTareas();