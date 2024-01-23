async function obtenerTareas() {
  try {
    const response = await fetch('/obtener-tareas');
    const tareas = await response.json();

    const contenedor = document.getElementById('tareasContenedor');
    contenedor.innerHTML = '';
     const tabla = document.createElement('table');
     tabla.style.border = '1px solid black';
     tabla.style.width = '100%';

     const encabezado = document.createElement('tr');
     encabezado.innerHTML = '<th>TO DO</th><th>DOING</th><th>DONE</th>';
     tabla.appendChild(encabezado);

     tareas.forEach(tarea => {
        const filaToDo = document.createElement('tr');
        const celdaToDo = document.createElement('td');
        celdaToDo.classList.add('tarea');
        const nombreEditable = document.createElement('div');
        nombreEditable.contentEditable = true;
        nombreEditable.dataset.id = tarea.id; // Añade el atributo data-id
        nombreEditable.innerHTML = `<p>${tarea.nombre}(ID: ${tarea.id})</p>
        <div class="singtar" data-estado="${tarea.estado}">
        <table class="movement">
          <tr>
            <td><button class="todobutton" onclick="cambiarEstado(${tarea.id}, 'TO DO')">TO DO</button></td>
            <td><button class="doingbutton" onclick="cambiarEstado(${tarea.id}, 'DOING')">DOING</button></td>
            <td><button class="donebutton" onclick="cambiarEstado(${tarea.id}, 'DONE')">DONE</button></td>
          </tr>
          <tr>
            <td colspan="3"><button class="guardarbutton" onclick="guardarCambios(${tarea.id})">Guardar</button></td>
          </tr>
        </table>
        <button class="elim-sing" onclick="eliminarTarea(${tarea.id})">Eliminar</button>
      </div>`;

        celdaToDo.appendChild(nombreEditable);
        filaToDo.appendChild(celdaToDo);
        tabla.appendChild(filaToDo);

        // Agrega el evento blur para actualizar la tarea cuando se pierde el foco
        nombreEditable.addEventListener('blur', async () => {
          const nuevoNombre = nombreEditable.textContent.trim();
          const contenidoHTML = nombreEditable.innerHTML;
          await actualizarTarea(tarea.id, nuevoNombre, contenidoHTML);
          obtenerTareas();
        });
     });

     contenedor.appendChild(tabla);
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

async function cambiarEstado(id, nuevoEstado) {
  try {
    const response = await fetch(`/actualizar-estado/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nuevoEstado }),
    });

    const result = await response.json();

    if (result.success) {
      obtenerTareas();
    } else {
      console.error('Error al cambiar estado de la tarea:', result.error);
    }
  } catch (error) {
    console.error('Error al cambiar estado de la tarea:', error);
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



obtenerTareas();