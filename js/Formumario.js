
// Encuesta de Satisfacción - Funcionalidades JavaScript (versión corregida)
// ========================================================
// Notas:
// - Inserciones nuevas (preguntas, texto, imagen, video) se agregan AL FINAL de la sección activa.
// - “Añadir texto” ahora coloca el bloque en la sección seleccionada.
// - Se corrigieron operadores lógicos (||), regex de YouTube, duplicación de funciones y varios pequeños bugs.

// =================== VARIABLES GLOBALES ===================
let preguntaEditando = null;
let totalPreguntas = 8;
let modalInicializado = false;

// =================== INICIALIZACIÓN ===================
document.addEventListener('DOMContentLoaded', function () {
    initializeStarRating();
    initializeQuestionControls();
    initializeMoveFunctionality();
    initializeSectionMovement();
    initializeFormValidation();
    initializeVisualEffects();
    initializeModals();
    initializeHeaderEditing();
    initializeSidebarActions();
  // Inicializar el select de secciones al cargar
    actualizarSelectSeccionesConNuevaOpcion();

    console.log('Encuesta de Satisfacción - JavaScript cargado correctamente');
});

// =================== SISTEMA DE ESTRELLAS ===================
function initializeStarRating() {
    document.querySelectorAll('.dark-question').forEach(q => initializeStarRatingForQuestion(q));
}

function initializeStarRatingForQuestion(pregunta) {
    const stars = pregunta.querySelectorAll('.dark-stars .star');
    const inputHidden = pregunta.querySelector('input[type="hidden"]');
         if (!stars.length || !inputHidden) return; // FIX: verificar ambos
         stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.getAttribute('data-rating'));
      inputHidden.value = rating;
      // Quitar selección previa
      stars.forEach(s => s.classList.remove('selected'));
      // Resaltar hasta la estrella clickeada
      stars.forEach(s => {
        if (parseInt(s.getAttribute('data-rating')) <= rating) {
          s.classList.add('selected');
        }
      });
    });

    // Hover
    star.addEventListener('mouseover', () => {
      const hoverValue = parseInt(star.getAttribute('data-rating'));
      stars.forEach(s => {
        s.classList.toggle('hover', parseInt(s.getAttribute('data-rating')) <= hoverValue);
      });
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
  });
}

// =================== PESTAÑAS SUPERIORES ===================
document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab-link');
  const sections = document.querySelectorAll('.tab-section');
  tabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.style.display = 'none');
      this.classList.add('active');
      const targetId = 'tab-' + this.getAttribute('data-tab');
      const el = document.getElementById(targetId);
      if (el) el.style.display = 'block';
    });
  });
});

// =================== CONFIGURACIÓN DE COLORES ===================
document.addEventListener("DOMContentLoaded", function () {
  const btnAplicar = document.getElementById("btnAplicarColores");
  const colorFondo = document.getElementById("colorFondo");
  const colorPreguntas = document.getElementById("colorPreguntas");
  if (btnAplicar) {
    btnAplicar.addEventListener("click", function () {
      const fondo = colorFondo?.value || '';
      const preguntas = colorPreguntas?.value || '';
      document.body.style.backgroundColor = fondo;
      document.querySelectorAll(".question, .dark-question").forEach(q => {
        q.style.backgroundColor = preguntas;
      });
      alert("🎨 Colores aplicados correctamente");
    });
  }
});

// =================== BARRA LATERAL: ACCIONES RÁPIDAS ===================
function initializeSidebarActions() {
  // Delegación global
  document.addEventListener('click', function (e) {
    // Añadir imagen
    if (e.target.closest('.bi-card-image')) {
      e.preventDefault();
      e.stopPropagation();
      const nuevaImagen = crearBloqueImagen();
      insertarEnSeccionActiva(nuevaImagen);
    }
    // Añadir video
    if (e.target.closest('.bi-play-btn')) {
      e.preventDefault();
      e.stopPropagation();
      const nuevoVideo = crearBloqueVideo();
      insertarEnSeccionActiva(nuevoVideo);
    }
    // Añadir texto (modal)
    if (e.target.closest('.bi-fonts')) {
      e.preventDefault();
      e.stopPropagation();
      mostrarModalAñadirTexto();
    }
    // Añadir pregunta (modal)
    if (e.target.closest('.bi-plus-circle')) {
      e.preventDefault();
      e.stopPropagation();
      mostrarModalNuevaPregunta();
    }
    // Importar preguntas JSON
    if (e.target.closest('.bi-file-earmark-plus')) {
      e.preventDefault();
      e.stopPropagation();
      const inputImport = document.getElementById('importPreguntasInput');
      if (inputImport) inputImport.click();
    }
  });

  // Manejar carga del archivo
  const inputImport = document.getElementById('importPreguntasInput');
  if (inputImport) {
    inputImport.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const preguntas = JSON.parse(e.target.result);
          if (!Array.isArray(preguntas)) {
            showAlert('El archivo no tiene formato válido (debe ser un arreglo JSON)', 'warning');
            return;
          }
          preguntas.forEach((p, i) => {
            const texto = p.texto || `Pregunta ${i + 1}`;
            const tipo = p.tipo || 'texto';
            const obligatoria = !!p.obligatoria;
            const opciones = Array.isArray(p.opciones) ? p.opciones : [];
            const nuevaPregunta = crearEstructuraPregunta(Date.now() + i, texto, tipo, obligatoria, opciones);
            const container = document.getElementById('secciones-container');
            const seccion = document.querySelector('.movable-section') || container; // FIX: usar fallback correcto
            seccion.appendChild(nuevaPregunta);
            reinicializarControlesPregunta(nuevaPregunta);
          });
          showAlert('Preguntas importadas correctamente', 'success');
          inputImport.value = '';
        } catch (error) {
          console.error('Error al importar:', error);
          showAlert('Error: el archivo no es un JSON válido', 'warning');
        }
      };
      reader.readAsText(file);
    });
  }
}

// =================== EDITOR DE TEXTO: MODAL AÑADIR ===================
function mostrarModalAñadirTexto() {
  const existingModal = document.getElementById('añadirTextoModal');
  if (existingModal && existingModal.classList.contains('show')) return;
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div class="modal fade" id="añadirTextoModal" tabindex="-1" aria-labelledby="añadirTextoModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="añadirTextoModalLabel">Añadir Texto Informativo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="editor-toolbar mb-3 p-2 border rounded">
              <div class="btn-group btn-group-sm me-2" role="group">
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComando('bold')" title="Negrita">
                  <i class="bi bi-type-bold"></i>
                </button>
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComando('italic')" title="Cursiva">
                  <i class="bi bi-type-italic"></i>
                </button>
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComando('underline')" title="Subrayado">
                  <i class="bi bi-type-underline"></i>
                </button>
              </div>
              <div class="btn-group btn-group-sm me-2" role="group">
                <button type="button" class="btn btn-outline-secondary" onclick="cambiarAlineacion('left')" title="Alinear izquierda">
                  <i class="bi bi-text-left"></i>
                </button>
                <button type="button" class="btn btn-outline-secondary" onclick="cambiarAlineacion('center')" title="Alinear centro">
                  <i class="bi bi-text-center"></i>
                </button>
                <button type="button" class="btn btn-outline-secondary" onclick="cambiarAlineacion('right')" title="Alinear derecha">
                  <i class="bi bi-text-right"></i>
                </button>
              </div>
              <div class="btn-group btn-group-sm me-2" role="group">
                <select class="form-select form-select-sm" onchange="cambiarTamañoFuente(this.value)" title="Tamaño de fuente">
                  <option value="">Tamaño</option>
                  <option value="1">Pequeño</option>
                  <option value="3" selected>Normal</option>
                  <option value="5">Grande</option>
                  <option value="7">Muy Grande</option>
                </select>
              </div>
              <div class="btn-group btn-group-sm me-2" role="group">
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComando('insertUnorderedList')" title="Lista con viñetas">
                  <i class="bi bi-list-ul"></i>
                </button>
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComando('insertOrderedList')" title="Lista numerada">
                  <i class="bi bi-list-ol"></i>
                </button>
              </div>
              <div class="btn-group btn-group-sm" role="group">
                <input type="color" class="form-control form-control-color" id="editorColor" onchange="cambiarColorTexto(this.value)" title="Color del texto" value="#000000">
              </div>
            </div>

            <div class="mb-3">
              <label for="textoContenido" class="form-label">Texto:</label>
              <div class="editor-container border rounded">
                <div id="editorTexto" class="form-control" contenteditable="true" style="min-height: 200px; max-height: 400px; overflow-y: auto; padding: 12px;" oninput="actualizarVistaPrevia()">
                  Escriba su texto aquí...
                </div>
              </div>
            </div>

            <div class="vista-previa-container mt-3">
              <label class="form-label">Vista previa:</label>
              <div id="vistaPreviaTexto" class="border rounded p-3 bg-light" style="min-height: 80px; max-height: 150px; overflow-y: auto;"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="crearBloqueTextoConFormato()">Insertar Texto</button>
          </div>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = new bootstrap.Modal(document.getElementById('añadirTextoModal'));
  modal.show();
  actualizarVistaPrevia();
}

// ===== Editor simple para el modal Añadir =====
function ejecutarComando(comando, valor = null) {
  const editor = document.getElementById('editorTexto');
  if (!editor) return;
  editor.focus();
  document.execCommand(comando, false, valor);
  actualizarVistaPrevia();
}
function cambiarAlineacion(alineacion) {
  ejecutarComando('justify' + alineacion.charAt(0).toUpperCase() + alineacion.slice(1));
}
function cambiarTamañoFuente(tamaño) {
  if (tamaño) ejecutarComando('fontSize', tamaño);
}
function cambiarColorTexto(color) { ejecutarComando('foreColor', color); }
function actualizarVistaPrevia() {
  const editor = document.getElementById('editorTexto');
  const vistaPrevia = document.getElementById('vistaPreviaTexto');
  if (editor && vistaPrevia) vistaPrevia.innerHTML = editor.innerHTML;
}

// ===== Crear bloque de texto con formato (al FINAL de la sección activa) =====
function crearBloqueTextoConFormato() {
  const editor = document.getElementById('editorTexto');
  if (!editor) return;
  const contenido = editor.innerHTML.trim();
  if (!contenido || contenido === '<br>' || contenido === 'Escriba su texto aquí...') {
    showAlert('Por favor, ingrese el texto', 'warning');
    return;
  }
  const bloqueTexto = crearEstructuraTextoConFormato(contenido);
  insertarEnSeccionActiva(bloqueTexto); // FIX: usar sección activa y al FINAL
  reinicializarControlesTexto(bloqueTexto);
  const modal = bootstrap.Modal.getInstance(document.getElementById('añadirTextoModal'));
  if (modal) modal.hide();
  showAlert('Texto con formato añadido correctamente', 'success');
}

function crearEstructuraTextoConFormato(contenido) {
  const div = document.createElement('div');
  div.className = 'dark-text-block movable-text';
  div.setAttribute('data-text-id', 'text-' + Date.now());
  div.innerHTML = `
    <div class="text-header">
      <div class="move-controls">
        <i class="bi bi-arrow-up move-text-up" title="Mover texto arriba"></i>
        <i class="bi bi-arrow-down move-text-down" title="Mover texto abajo"></i>
      </div>
      <div class="text-content">
        <div class="text-block-content formatted-content">${contenido}</div>
      </div>
    </div>
    <div class="text-controls">
      <div class="controls-left">
        <i class="bi bi-pencil control-icon" title="Editar texto"></i>
        <i class="bi bi-trash control-icon" title="Eliminar texto"></i>
      </div>
    </div>`;
  return div;
}

function reinicializarControlesTexto(textBlock) {
  const moveUp = textBlock.querySelector('.move-text-up');
  const moveDown = textBlock.querySelector('.move-text-down');
  const editIcon = textBlock.querySelector('.bi-pencil');
  const trashIcon = textBlock.querySelector('.bi-trash');

  if (moveUp) {
    const newMoveUp = moveUp.cloneNode(true);
    moveUp.parentNode.replaceChild(newMoveUp, moveUp);
    newMoveUp.addEventListener('click', function (e) {
      e.stopPropagation();
      const section = textBlock.parentElement;
      const prevElement = textBlock.previousElementSibling;
      if (prevElement && (
        prevElement.classList.contains('movable-text') ||
        prevElement.classList.contains('dark-question') ||
        prevElement.classList.contains('dark-section')
      )) {
        section.insertBefore(textBlock, prevElement);
        showAlert('Texto movido arriba', 'info');
      }
    });
  }
  if (moveDown) {
    const newMoveDown = moveDown.cloneNode(true);
    moveDown.parentNode.replaceChild(newMoveDown, moveDown);
    newMoveDown.addEventListener('click', function (e) {
      e.stopPropagation();
      const section = textBlock.parentElement;
      const nextElement = textBlock.nextElementSibling;
      if (nextElement && (
        nextElement.classList.contains('movable-text') ||
        nextElement.classList.contains('dark-question') ||
        nextElement.classList.contains('dark-section')
      )) {
        section.insertBefore(nextElement, textBlock);
        showAlert('Texto movido abajo', 'info');
      }
    });
  }
  if (editIcon) {
    const newEditIcon = editIcon.cloneNode(true);
    editIcon.parentNode.replaceChild(newEditIcon, editIcon);
    newEditIcon.addEventListener('click', function (e) {
      e.stopPropagation();
      const textContent = textBlock.querySelector('.text-block-content');
      editarTextoModal(textContent, 'Texto informativo');
    });
  }
  if (trashIcon) {
    const newTrashIcon = trashIcon.cloneNode(true);
    trashIcon.parentNode.replaceChild(newTrashIcon, trashIcon);
    newTrashIcon.addEventListener('click', function (e) {
      e.stopPropagation();
      textBlock.style.transform = 'translateX(-100%)';
      textBlock.style.opacity = '0';
      setTimeout(() => {
        if (confirm('¿Está seguro de que desea eliminar este texto?')) {
          textBlock.remove();
          showAlert('Texto eliminado', 'success');
        } else {
          textBlock.style.transform = '';
          textBlock.style.opacity = '1';
        }
      }, 300);
    });
  }
}

// =================== EDITAR TEXTO EXISTENTE ===================
function editarTextoConEditor(element, tipoTexto) {
  const contenidoActual = element.innerHTML;
  const modalHtml = `
    <div class="modal fade" id="editarTextoModal" tabindex="-1" aria-labelledby="editarTextoModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editarTextoModalLabel">Editar ${tipoTexto}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="editor-toolbar mb-3 p-2 border rounded">
              <div class="btn-group btn-group-sm me-2" role="group">
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComandoEdicion('bold')" title="Negrita"><i class="bi bi-type-bold"></i></button>
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComandoEdicion('italic')" title="Cursiva"><i class="bi bi-type-italic"></i></button>
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComandoEdicion('underline')" title="Subrayado"><i class="bi bi-type-underline"></i></button>
              </div>
              <div class="btn-group btn-group-sm me-2" role="group">
                <button type="button" class="btn btn-outline-secondary" onclick="cambiarAlineacionEdicion('left')" title="Alinear izquierda"><i class="bi bi-text-left"></i></button>
                <button type="button" class="btn btn-outline-secondary" onclick="cambiarAlineacionEdicion('center')" title="Alinear centro"><i class="bi bi-text-center"></i></button>
                <button type="button" class="btn btn-outline-secondary" onclick="cambiarAlineacionEdicion('right')" title="Alinear derecha"><i class="bi bi-text-right"></i></button>
              </div>
              <div class="btn-group btn-group-sm me-2" role="group">
                <select class="form-select form-select-sm" onchange="cambiarTamañoFuenteEdicion(this.value)" title="Tamaño de fuente">
                  <option value="">Tamaño</option>
                  <option value="1">Pequeño</option>
                  <option value="3" selected>Normal</option>
                  <option value="5">Grande</option>
                  <option value="7">Muy Grande</option>
                </select>
              </div>
              <div class="btn-group btn-group-sm me-2" role="group">
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComandoEdicion('insertUnorderedList')" title="Lista con viñetas"><i class="bi bi-list-ul"></i></button>
                <button type="button" class="btn btn-outline-secondary" onclick="ejecutarComandoEdicion('insertOrderedList')" title="Lista numerada"><i class="bi bi-list-ol"></i></button>
              </div>
              <div class="btn-group btn-group-sm" role="group">
                <input type="color" class="form-control form-control-color" id="editorColorEdicion" onchange="cambiarColorTextoEdicion(this.value)" title="Color del texto" value="#000000">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Texto:</label>
              <div class="editor-container border rounded">
                <div id="editorTextoEdicion" class="form-control" contenteditable="true" style="min-height: 200px; max-height: 400px; overflow-y: auto; padding: 12px;" oninput="actualizarVistaPreviaEdicion()">${contenidoActual}</div>
              </div>
            </div>
            <div class="vista-previa-container mt-3">
              <label class="form-label">Vista previa:</label>
              <div id="vistaPreviaTextoEdicion" class="border rounded p-3 bg-light" style="min-height: 80px; max-height: 150px; overflow-y: auto;">${contenidoActual}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="guardarTextoEditadoConFormato()">Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>`;

  const existingModal = document.getElementById('editarTextoModal');
  if (existingModal) existingModal.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  window.elementoEditando = element;
  const modal = new bootstrap.Modal(document.getElementById('editarTextoModal'));
  modal.show();
}

function ejecutarComandoEdicion(comando, valor = null) {
  const editor = document.getElementById('editorTextoEdicion');
  if (!editor) return;
  editor.focus();
  document.execCommand(comando, false, valor);
  actualizarVistaPreviaEdicion();
}
function cambiarAlineacionEdicion(alineacion) {
  ejecutarComandoEdicion('justify' + alineacion.charAt(0).toUpperCase() + alineacion.slice(1));
}
function cambiarTamañoFuenteEdicion(tamaño) { if (tamaño) ejecutarComandoEdicion('fontSize', tamaño); }
function cambiarColorTextoEdicion(color) { ejecutarComandoEdicion('foreColor', color); }
function actualizarVistaPreviaEdicion() {
  const editor = document.getElementById('editorTextoEdicion');
  const vistaPrevia = document.getElementById('vistaPreviaTextoEdicion');
  if (editor && vistaPrevia) vistaPrevia.innerHTML = editor.innerHTML;
}
function guardarTextoEditadoConFormato() {
  if (!window.elementoEditando) return;
  const editor = document.getElementById('editorTextoEdicion');
  if (!editor) return;
  const nuevoTexto = editor.innerHTML.trim();
  if (nuevoTexto) {
    window.elementoEditando.innerHTML = nuevoTexto; // funciona para contenido con y sin formato
    showAlert('Texto actualizado correctamente', 'success');
  }
  const modal = bootstrap.Modal.getInstance(document.getElementById('editarTextoModal'));
  if (modal) modal.hide();
  window.elementoEditando = null;
}

// Editor simple de texto plano como fallback
function editarTextoModal(element, tipoTexto) {
  if (
    element.classList.contains('text-block-content') ||
    element.classList.contains('formatted-content') ||
    (element.innerHTML.includes('<') && element.innerHTML.includes('>'))
  ) {
    editarTextoConEditor(element, tipoTexto);
    return;
  }

  const modalHtml = `
    <div class="modal fade" id="editarTextoModal" tabindex="-1" aria-labelledby="editarTextoModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editarTextoModalLabel">Editar ${tipoTexto}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <textarea class="form-control" id="textoEditado" rows="${tipoTexto.includes('Descripción') ? 3 : 2}">${element.textContent}</textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="guardarTextoEditado()">Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>`;

  const existingModal = document.getElementById('editarTextoModal');
  if (existingModal) existingModal.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  window.elementoEditando = element;
  const modal = new bootstrap.Modal(document.getElementById('editarTextoModal'));
  modal.show();
}
function guardarTextoEditado() {
  if (!window.elementoEditando) return;
  const textarea = document.getElementById('textoEditado');
  if (!textarea) return;
  const nuevoTexto = textarea.value.trim();
  if (nuevoTexto) {
    window.elementoEditando.textContent = nuevoTexto;
    showAlert('Texto actualizado correctamente', 'success');
  }
  const modal = bootstrap.Modal.getInstance(document.getElementById('editarTextoModal'));
  if (modal) modal.hide();
  window.elementoEditando = null;
}

// =================== SECCIONES ===================
function mostrarModalNuevaSeccion() {
  const modalHtml = `
    <div class="modal fade" id="nuevaSeccionModal" tabindex="-1" aria-labelledby="nuevaSeccionModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="nuevaSeccionModalLabel">Crear Nueva Sección</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="nombreSeccion" class="form-label">Nombre de la sección:</label>
              <input type="text" class="form-control" id="nombreSeccion" placeholder="Ej: Información Adicional">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="crearNuevaSeccion()">Crear Sección</button>
          </div>
        </div>
      </div>
    </div>`;
  const existingModal = document.getElementById('nuevaSeccionModal');
  if (existingModal) existingModal.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  const modal = new bootstrap.Modal(document.getElementById('nuevaSeccionModal'));
  modal.show();
}

function crearNuevaSeccion() {
  const nombreInput = document.getElementById('nombreSeccion');
  if (!nombreInput) return;
  const nombreSeccion = nombreInput.value.trim();
  if (!nombreSeccion) {
    showAlert('Por favor, ingrese un nombre para la sección', 'warning');
    return;
  }
  const nuevaSeccion = document.createElement('div');
  nuevaSeccion.className = 'dark-section movable-section';
  nuevaSeccion.id = 'section-' + Date.now();
  nuevaSeccion.innerHTML = `
    <div class="section-header d-flex justify-content-between align-items-center mb-3">
      <h4 class="section-title dark-section-title mb-0">${nombreSeccion}</h4>
      <div class="section-controls">
        <i class="bi bi-arrow-up move-section-up control-icon me-2" title="Mover sección arriba"></i>
        <i class="bi bi-arrow-down move-section-down control-icon" title="Mover sección abajo"></i>
      </div>
    </div>`;

  const seccionesContainer = document.getElementById('secciones-container');
  seccionesContainer.appendChild(nuevaSeccion);
  reinicializarControlesSeccion(nuevaSeccion);
  actualizarSelectSeccionesConNuevaOpcion();

  const modal = bootstrap.Modal.getInstance(document.getElementById('nuevaSeccionModal'));
  if (modal) modal.hide();
  showAlert('Sección creada correctamente', 'success');
  updateSectionOrder();
}

function reinicializarControlesSeccion(seccion) {
  const moveUp = seccion.querySelector('.move-section-up');
  const moveDown = seccion.querySelector('.move-section-down');
  if (moveUp) {
    const newMoveUp = moveUp.cloneNode(true);
    moveUp.parentNode.replaceChild(newMoveUp, moveUp);
    newMoveUp.addEventListener('click', function () {
      const container = document.getElementById('secciones-container');
      const prevSection = seccion.previousElementSibling;
      if (prevSection && prevSection.classList.contains('movable-section')) {
        container.insertBefore(seccion, prevSection);
        updateSectionOrder();
        showAlert('Sección movida arriba', 'info');
      }
    });
  }
  if (moveDown) {
    const newMoveDown = moveDown.cloneNode(true);
    moveDown.parentNode.replaceChild(newMoveDown, moveDown);
    newMoveDown.addEventListener('click', function () {
      const container = document.getElementById('secciones-container');
      const nextSection = seccion.nextElementSibling;
      if (nextSection && nextSection.classList.contains('movable-section')) {
        container.insertBefore(nextSection, seccion);
        updateSectionOrder();
        showAlert('Sección movida abajo', 'info');
      }
    });
  }
  const tituloSeccion = seccion.querySelector('.section-title');
  if (tituloSeccion) {
    const editIcon = createEditIcon();
    tituloSeccion.parentNode.insertBefore(editIcon, tituloSeccion.nextSibling);
    editIcon.addEventListener('click', function () {
      editarTextoModal(tituloSeccion, 'Encabezado de sección');
    });
  }
}

function actualizarSelectSeccionesConNuevaOpcion() {
  const select = document.getElementById('nuevaPreguntaSeccion');
  if (!select || select.dataset.updating === "true") return; // FIX
  select.dataset.updating = "true";
  setTimeout(() => delete select.dataset.updating, 300);

  const valorActual = select.value;
  select.innerHTML = '';

  document.querySelectorAll('.movable-section').forEach(seccion => {
    const id = seccion.id;
    const titulo = seccion.querySelector('.section-title')?.textContent || id;
    const option = document.createElement('option');
    option.value = id;
    option.textContent = titulo;
    select.appendChild(option);
  });

  const nuevaOpcion = document.createElement('option');
  nuevaOpcion.value = 'nueva-seccion';
  nuevaOpcion.textContent = '+ Crear nueva sección...';
  nuevaOpcion.style.fontWeight = 'bold';
  nuevaOpcion.style.color = '#007bff';
  select.appendChild(nuevaOpcion);

  if (valorActual && select.querySelector(`option[value="${valorActual}"]`)) {
    select.value = valorActual;
  } else {
    const primeraOpcion = select.querySelector('option:not([value="nueva-seccion"])');
    if (primeraOpcion) select.value = primeraOpcion.value;
  }
}

// =================== EDITAR TÍTULOS/ENCABEZADOS ===================
function initializeHeaderEditing() {
  const titleElement = document.querySelector('.dark-title');
  if (titleElement) {
    const editIcon = createEditIcon();
    titleElement.parentNode.insertBefore(editIcon, titleElement.nextSibling);
    editIcon.addEventListener('click', function () { editarTextoModal(titleElement, 'Título principal'); });
  }
  const descriptionElement = document.querySelector('.dark-description');
  if (descriptionElement) {
    const editIcon = createEditIcon();
    descriptionElement.parentNode.insertBefore(editIcon, descriptionElement.nextSibling);
    editIcon.addEventListener('click', function () { editarTextoModal(descriptionElement, 'Descripción'); });
  }
  document.querySelectorAll('.section-title').forEach(header => {
    const editIcon = createEditIcon();
    header.parentNode.insertBefore(editIcon, header.nextSibling);
    editIcon.addEventListener('click', function () { editarTextoModal(header, 'Encabezado de sección'); });
  });
}
function createEditIcon() {
  const icon = document.createElement('i');
  icon.className = 'bi bi-pencil control-icon ms-2';
  icon.title = 'Editar texto';
  icon.style.cursor = 'pointer';
  icon.style.fontSize = '0.9em';
  icon.style.opacity = '0.7';
  return icon;
}

// =================== MODALES GENERALES ===================
function initializeModals() {
  const preguntaTipo = document.getElementById('preguntaTipo');
  if (preguntaTipo) {
    preguntaTipo.addEventListener('change', function () {
      const cont = document.getElementById('opcionesContainer');
      if (cont) cont.style.display = this.value === 'opciones' ? 'block' : 'none';
    });
  }
  const nuevaPreguntaTipo = document.getElementById('nuevaPreguntaTipo');
  if (nuevaPreguntaTipo) {
    nuevaPreguntaTipo.addEventListener('change', function () {
      const cont = document.getElementById('nuevasOpcionesContainer');
      if (cont) cont.style.display = this.value === 'opciones' ? 'block' : 'none';
    });
  }
}

// =================== PREGUNTAS: CONTROLES ===================
function initializeQuestionControls() {
  document.querySelectorAll('.bi-pencil').forEach(icon => {
    const newIcon = icon.cloneNode(true);
    icon.parentNode.replaceChild(newIcon, icon);
    newIcon.addEventListener('click', function () {
      const questionBlock = this.closest('.dark-question');
      if (questionBlock) editarPregunta(questionBlock);
    });
  });

  document.querySelectorAll('.bi-copy').forEach(icon => {
    const newIcon = icon.cloneNode(true);
    icon.parentNode.replaceChild(newIcon, icon);
    newIcon.addEventListener('click', function () {
      const questionBlock = this.closest('.dark-question');
      if (questionBlock) duplicarPregunta(questionBlock);
    });
  });

  document.querySelectorAll('.bi-trash').forEach(icon => {
    const newIcon = icon.cloneNode(true);
    icon.parentNode.replaceChild(newIcon, icon);
    newIcon.addEventListener('click', function () {
      const questionBlock = this.closest('.dark-question');
      if (!questionBlock) return;
      questionBlock.style.transform = 'translateX(-100%)';
      questionBlock.style.opacity = '0';
      setTimeout(() => {
        if (confirm('¿Está seguro de que desea eliminar esta pregunta?')) {
          questionBlock.remove();
          showAlert('Pregunta eliminada', 'success');
          updateQuestionOrder();
        } else {
          questionBlock.style.transform = '';
          questionBlock.style.opacity = '1';
        }
      }, 300);
    });
  });

  document.querySelectorAll('.dark-switch').forEach(switchElement => {
    switchElement.addEventListener('change', function () {
      const questionBlock = this.closest('.dark-question');
      const obligatoryText = questionBlock?.querySelector('.obligatory-text');
      if (obligatoryText) obligatoryText.textContent = this.checked ? 'Obligatorio' : 'Opcional';
      if (questionBlock) questionBlock.style.borderLeft = this.checked ? '4px solid #10b981' : '4px solid #404040';
    });
  });
}

// =================== DUPLICAR PREGUNTA ===================
function duplicarPregunta(questionBlock) {
  const label = questionBlock.querySelector('.dark-label');
  const textoPregunta = label ? label.textContent.replace(/\s*\*$/, '') : 'Nueva Pregunta';
  const switchElement = questionBlock.querySelector('.dark-switch');
  const esObligatoria = switchElement ? switchElement.checked : false;
  let tipoPregunta = determinarTipoPregunta(questionBlock);

  totalPreguntas++;
  const nuevaPregunta = crearEstructuraPregunta(totalPreguntas, textoPregunta, tipoPregunta, esObligatoria);
  questionBlock.parentNode.insertBefore(nuevaPregunta, questionBlock.nextSibling);
  reinicializarControlesPregunta(nuevaPregunta);

  const copyIcon = questionBlock.querySelector('.bi-copy');
  if (copyIcon) {
    copyIcon.style.color = '#10b981';
    copyIcon.style.transform = 'scale(1.3)';
    setTimeout(() => { copyIcon.style.color = ''; copyIcon.style.transform = ''; }, 500);
  }
  showAlert('Pregunta duplicada correctamente', 'success');
  updateQuestionOrder();
}

// =================== REINICIALIZAR CONTROLES PREGUNTA ===================
function reinicializarControlesPregunta(questionBlock) {
  const editIcon = questionBlock.querySelector('.bi-pencil');
  const copyIcon = questionBlock.querySelector('.bi-copy');
  const trashIcon = questionBlock.querySelector('.bi-trash');
  const switchElement = questionBlock.querySelector('.dark-switch');
  const moveUp = questionBlock.querySelector('.move-up');
  const moveDown = questionBlock.querySelector('.move-down');

  if (editIcon) {
    const newEditIcon = editIcon.cloneNode(true);
    editIcon.parentNode.replaceChild(newEditIcon, editIcon);
    newEditIcon.addEventListener('click', function () { editarPregunta(questionBlock); });
  }
  if (copyIcon) {
    const newCopyIcon = copyIcon.cloneNode(true);
    copyIcon.parentNode.replaceChild(newCopyIcon, copyIcon);
    newCopyIcon.addEventListener('click', function () { duplicarPregunta(questionBlock); });
  }
  if (trashIcon) {
    const newTrashIcon = trashIcon.cloneNode(true);
    trashIcon.parentNode.replaceChild(newTrashIcon, trashIcon);
    newTrashIcon.addEventListener('click', function () {
      questionBlock.style.transform = 'translateX(-100%)';
      questionBlock.style.opacity = '0';
      setTimeout(() => {
        if (confirm('¿Eliminar esta pregunta?')) {
          questionBlock.remove();
          showAlert('Pregunta eliminada', 'success');
          updateQuestionOrder();
        } else {
          questionBlock.style.transform = '';
          questionBlock.style.opacity = '1';
        }
      }, 300);
    });
  }
  if (switchElement) {
    switchElement.addEventListener('change', function () {
      const obligatoryText = questionBlock.querySelector('.obligatory-text');
      if (obligatoryText) obligatoryText.textContent = this.checked ? 'Obligatorio' : 'Opcional';
      questionBlock.style.borderLeft = this.checked ? '4px solid #10b981' : '4px solid #404040';
    });
  }
  if (moveUp) {
    const newMoveUp = moveUp.cloneNode(true);
    moveUp.parentNode.replaceChild(newMoveUp, moveUp);
    newMoveUp.addEventListener('click', function () {
      const section = questionBlock.parentElement;
      const prevQuestion = questionBlock.previousElementSibling;
      if (prevQuestion && prevQuestion.classList.contains('dark-question')) {
        section.insertBefore(questionBlock, prevQuestion);
        updateQuestionOrder();
        showAlert('Pregunta movida arriba', 'info');
      }
    });
  }
  if (moveDown) {
    const newMoveDown = moveDown.cloneNode(true);
    moveDown.parentNode.replaceChild(newMoveDown, moveDown);
    newMoveDown.addEventListener('click', function () {
      const section = questionBlock.parentElement;
      const nextQuestion = questionBlock.nextElementSibling;
      if (nextQuestion && nextQuestion.classList.contains('dark-question')) {
        section.insertBefore(nextQuestion, questionBlock);
        updateQuestionOrder();
        showAlert('Pregunta movida abajo', 'info');
      }
    });
  }
  if (questionBlock.querySelector('.dark-stars')) {
    initializeStarRatingForQuestion(questionBlock);
  }
  if (questionBlock.querySelector('.dark-rating-btn')) {
    initializeRatingButtonsForQuestion(questionBlock);
  }
}

function initializeRatingButtonsForQuestion(questionBlock) {
  const ratingBtns = questionBlock.querySelectorAll('.dark-rating-btn');
  ratingBtns.forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('mouseenter', function () { this.style.transform = 'translateY(-2px) scale(1.05)'; });
    newBtn.addEventListener('mouseleave', function () {
      if (!this.previousElementSibling?.checked) this.style.transform = '';
    });
  });
}

// =================== EDITAR PREGUNTA ===================
function editarPregunta(questionBlock) {
  preguntaEditando = questionBlock;
  const label = questionBlock.querySelector('.dark-label');
  const switchElement = questionBlock.querySelector('.dark-switch');
  const txt = document.getElementById('preguntaTexto');
  const chk = document.getElementById('preguntaObligatoria');
  if (txt) txt.value = label ? label.textContent.replace(/\s*\*$/, '') : '';
  if (chk) chk.checked = switchElement ? switchElement.checked : false;

  let tipoPregunta = determinarTipoPregunta(questionBlock);
  const tipoSel = document.getElementById('preguntaTipo');
  if (tipoSel) tipoSel.value = tipoPregunta;
  const cont = document.getElementById('opcionesContainer');
  if (cont) cont.style.display = tipoPregunta === 'opciones' ? 'block' : 'none';

  const opcionesLista = document.getElementById('opcionesLista');
  if (opcionesLista) {
    opcionesLista.innerHTML = '';
    if (tipoPregunta === 'opciones') {
      const opciones = questionBlock.querySelectorAll('.dark-radio-label');
      if (opciones.length > 0) {
        opciones.forEach((opcion, index) => {
          const div = document.createElement('div');
          div.className = 'input-group mb-2';
          div.innerHTML = `
            <input type="text" class="form-control opcion-input" placeholder="Opción ${index + 1}" value="${opcion.textContent}">
            <button type="button" class="btn btn-outline-danger" onclick="eliminarOpcion(this)">×</button>`;
          opcionesLista.appendChild(div);
        });
      } else {
        for (let i = 0; i < 2; i++) {
          const div = document.createElement('div');
          div.className = 'input-group mb-2';
          div.innerHTML = `
            <input type="text" class="form-control opcion-input" placeholder="Opción ${i + 1}">
            <button type="button" class="btn btn-outline-danger" onclick="eliminarOpcion(this)">×</button>`;
          opcionesLista.appendChild(div);
        }
      }
    }
  }

  new bootstrap.Modal(document.getElementById('editarPreguntaModal')).show();
}

function guardarCambiosPregunta() {
  if (!preguntaEditando) {
    showAlert('No hay pregunta seleccionada para editar', 'warning');
    return;
  }
  const nuevoTexto = document.getElementById('preguntaTexto')?.value.trim();
  const esObligatoria = document.getElementById('preguntaObligatoria')?.checked || false;
  const tipoPregunta = document.getElementById('preguntaTipo')?.value || 'texto';

  if (!nuevoTexto) {
    showAlert('Por favor, ingrese el texto de la pregunta', 'warning');
    return;
  }

  let opciones = [];
  if (tipoPregunta === 'opciones') {
    const opcionesInputs = document.querySelectorAll('#opcionesLista .opcion-input');
    opcionesInputs.forEach(input => { if (input.value.trim()) opciones.push(input.value.trim()); });
    if (opciones.length < 2) {
      showAlert('Debe ingresar al menos 2 opciones', 'warning');
      return;
    }
  }

  const nuevaPregunta = crearEstructuraPregunta(
    preguntaEditando.getAttribute('data-question-id'),
    nuevoTexto,
    tipoPregunta,
    esObligatoria,
    opciones
  );

  preguntaEditando.parentNode.replaceChild(nuevaPregunta, preguntaEditando);
  reinicializarControlesPregunta(nuevaPregunta);
  const modal = bootstrap.Modal.getInstance(document.getElementById('editarPreguntaModal'));
  if (modal) modal.hide();
  showAlert('Pregunta actualizada correctamente', 'success');
}

function determinarTipoPregunta(questionBlock) {
  if (questionBlock.querySelector('.dark-stars')) return 'estrellas';
  if (questionBlock.querySelector('.rating-scale')) return 'escala';
  if (questionBlock.querySelector('.dark-radio-group')) return 'opciones';
  if (questionBlock.querySelector('input[type="email"]')) return 'email';
  if (questionBlock.querySelector('textarea')) return 'texto';
  if (questionBlock.querySelector('input[type="text"]')) return 'texto';
  return 'texto';
}

// =================== NUEVA PREGUNTA ===================
function mostrarModalNuevaPregunta() {
  const txt = document.getElementById('nuevaPreguntaTexto');
  const chk = document.getElementById('nuevaPreguntaObligatoria');
  const tipo = document.getElementById('nuevaPreguntaTipo');
  const cont = document.getElementById('nuevasOpcionesContainer');
  const lista = document.getElementById('nuevasOpcionesLista');

  if (txt) txt.value = '';
  if (chk) chk.checked = false;
  if (tipo) tipo.value = 'texto';
  if (cont) cont.style.display = 'none';
  if (lista) {
    lista.innerHTML = `
      <div class="input-group mb-2">
        <input type="text" class="form-control nueva-opcion-input" placeholder="Opción 1">
        <button type="button" class="btn btn-outline-danger" onclick="eliminarNuevaOpcion(this)">×</button>
      </div>
      <div class="input-group mb-2">
        <input type="text" class="form-control nueva-opcion-input" placeholder="Opción 2">
        <button type="button" class="btn btn-outline-danger" onclick="eliminarNuevaOpcion(this)">×</button>
      </div>`;
  }

  const modalElement = document.getElementById('nuevaPreguntaModal');
  if (!modalElement) return;
  if (!modalElement.classList.contains('show')) actualizarSelectSeccionesConNuevaOpcion();
  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.show();
}

function crearNuevaPregunta() {
  const texto = document.getElementById('nuevaPreguntaTexto')?.value.trim();
  const tipo = document.getElementById('nuevaPreguntaTipo')?.value || 'texto';
  const seccionId = document.getElementById('nuevaPreguntaSeccion')?.value;
  const esObligatoria = document.getElementById('nuevaPreguntaObligatoria')?.checked || false;

  if (!texto) { showAlert('Por favor, ingrese el texto de la pregunta', 'warning'); return; }
  if (!seccionId || seccionId === 'nueva-seccion') { // FIX
    showAlert('Por favor, seleccione una sección válida', 'warning');
    return;
  }

  let opciones = [];
  if (tipo === 'opciones') {
    const opcionesInputs = document.querySelectorAll('#nuevasOpcionesLista .nueva-opcion-input');
    opcionesInputs.forEach(input => { if (input.value.trim()) opciones.push(input.value.trim()); });
    if (opciones.length < 2) { showAlert('Debe ingresar al menos 2 opciones', 'warning'); return; }
  }

  totalPreguntas++;
  const nuevaPregunta = crearEstructuraPregunta(totalPreguntas, texto, tipo, esObligatoria, opciones);
  insertarEnSeccionActiva(nuevaPregunta); // FIX: insertar al final de la sección activa

  reinicializarControlesPregunta(nuevaPregunta);
  const modal = bootstrap.Modal.getInstance(document.getElementById('nuevaPreguntaModal'));
  if (modal) modal.hide();
  showAlert('Nueva pregunta creada correctamente', 'success');
  updateQuestionOrder();
}

// =================== ESTRUCTURA DE PREGUNTA ===================
function crearEstructuraPregunta(id, texto, tipo, obligatoria, opciones = []) {
  const div = document.createElement('div');
  div.className = 'dark-question';
  div.setAttribute('data-question-id', id);
  let contenido = '';

  switch (tipo) {
    case 'texto':
      contenido = `
        <div class="row g-2">
          <div class="col-12">
            <label class="form-label dark-label">${texto} ${obligatoria ? '*' : ''}</label>
            <textarea class="form-control dark-textarea" rows="3" placeholder="Escriba su respuesta..."></textarea>
          </div>
        </div>`;
      break;
    case 'email':
      contenido = `
        <div class="row g-2">
          <div class="col-md-12">
            <input type="email" class="form-control dark-input" placeholder="${texto} ${obligatoria ? '*' : ''}">
          </div>
        </div>`;
      break;
    case 'estrellas':
      contenido = `
        <div class="row g-2">
          <div class="col-md-12">
            <label class="form-label dark-label">${texto} ${obligatoria ? '*' : ''}</label>
            <div class="star-rating dark-stars">
              <span class="star" data-rating="1">★</span>
              <span class="star" data-rating="2">★</span>
              <span class="star" data-rating="3">★</span>
              <span class="star" data-rating="4">★</span>
              <span class="star" data-rating="5">★</span>
            </div>
            <div class="rating-labels dark-labels">
              <small>Muy insatisfecho</small>
              <small>Muy satisfecho</small>
            </div>
            <input type="hidden" id="calificacion_${id}" name="calificacion_${id}">
          </div>
        </div>`;
      break;
    case 'escala':
      contenido = `
        <div class="row g-2">
          <div class="col-md-12">
            <label class="form-label dark-label">${texto} ${obligatoria ? '*' : ''}</label>
            <div class="rating-scale">
              <div class="scale-labels">
                <span>Mala</span>
                <span>Excelente</span>
              </div>
              <div class="btn-group w-100" role="group">
                ${[1,2,3,4,5].map(num => `
                  <input type="radio" class="btn-check" name="pregunta_${id}" id="pregunta_${id}_${num}" value="${num}" ${obligatoria ? 'required' : ''}>
                  <label class="btn dark-rating-btn" for="pregunta_${id}_${num}">${num}</label>
                `).join('')}
              </div>
            </div>
          </div>
        </div>`;
      break;
    case 'opciones':
      const opcionesHTML = opciones.map((opcion, index) => `
        <div class="form-check">
          <input class="form-check-input dark-radio" type="radio" name="pregunta_${id}" id="pregunta_${id}_opcion_${index + 1}" value="${opcion}">
          <label class="form-check-label dark-radio-label" for="pregunta_${id}_opcion_${index + 1}">${opcion}</label>
        </div>`).join('');
      contenido = `
        <div class="row g-2">
          <div class="col-12">
            <label class="form-label dark-label">${texto} ${obligatoria ? '*' : ''}</label>
            <div class="dark-radio-group">${opcionesHTML}</div>
          </div>
        </div>`;
      break;
    default:
      contenido = `
        <div class="row g-2">
          <div class="col-12">
            <label class="form-label dark-label">${texto} ${obligatoria ? '*' : ''}</label>
            <textarea class="form-control dark-textarea" rows="3" placeholder="Escriba su respuesta..."></textarea>
          </div>
        </div>`;
  }

  div.innerHTML = `
    <div class="question-header">
      <div class="move-controls">
        <i class="bi bi-arrow-up move-up" title="Mover pregunta arriba"></i>
        <i class="bi bi-arrow-down move-down" title="Mover pregunta abajo"></i>
      </div>
      <div class="question-content">${contenido}</div>
    </div>
    <div class="question-controls">
      <div class="controls-left">
        <i class="bi bi-pencil control-icon" title="Editar pregunta"></i>
        <i class="bi bi-copy control-icon" title="Duplicar pregunta"></i>
        <i class="bi bi-trash control-icon" title="Eliminar pregunta"></i>
      </div>
      <div class="controls-right">
        <span class="obligatory-text">${obligatoria ? 'Obligatorio' : 'Opcional'}</span>
        <div class="form-check form-switch">
          <input class="form-check-input dark-switch" type="checkbox" role="switch" ${obligatoria ? 'checked' : ''}>
        </div>
      </div>
    </div>`;
  return div;
}

// =================== AUXILIARES (OPCIONES) ===================
function agregarOpcion() {
  const opcionesLista = document.getElementById('opcionesLista');
  const count = (opcionesLista?.children.length || 0) + 1;
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <input type="text" class="form-control opcion-input" placeholder="Opción ${count}">
    <button type="button" class="btn btn-outline-danger" onclick="eliminarOpcion(this)">×</button>`;
  opcionesLista?.appendChild(div);
}
function eliminarOpcion(button) {
  const lista = document.getElementById('opcionesLista');
  if (lista && lista.children.length > 1) button.parentElement.remove();
}
function agregarNuevaOpcion() {
  const opcionesLista = document.getElementById('nuevasOpcionesLista');
  const count = (opcionesLista?.children.length || 0) + 1;
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <input type="text" class="form-control nueva-opcion-input" placeholder="Opción ${count}">
    <button type="button" class="btn btn-outline-danger" onclick="eliminarNuevaOpcion(this)">×</button>`;
  opcionesLista?.appendChild(div);
}
function eliminarNuevaOpcion(button) {
  const lista = document.getElementById('nuevasOpcionesLista');
  if (lista && lista.children.length > 1) button.parentElement.remove();
}

// =================== MOVIMIENTO (BOTONES + DnD) ===================
function initializeMoveFunctionality() {
  document.querySelectorAll('.move-up').forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener('click', function () {
      const questionBlock = this.closest('.dark-question');
      const section = questionBlock?.parentElement;
      const prevQuestion = questionBlock?.previousElementSibling;
      if (questionBlock && prevQuestion && prevQuestion.classList.contains('dark-question')) {
        section.insertBefore(questionBlock, prevQuestion);
        updateQuestionOrder();
        showAlert('Pregunta movida arriba', 'info');
      }
    });
  });
  document.querySelectorAll('.move-down').forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener('click', function () {
      const questionBlock = this.closest('.dark-question');
      const section = questionBlock?.parentElement;
      const nextQuestion = questionBlock?.nextElementSibling;
      if (questionBlock && nextQuestion && nextQuestion.classList.contains('dark-question')) {
        section.insertBefore(nextQuestion, questionBlock);
        updateQuestionOrder();
        showAlert('Pregunta movida abajo', 'info');
      }
    });
  });
  initializeDragAndDrop();
}

function initializeSectionMovement() {
  document.querySelectorAll('.move-section-up').forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener('click', function () {
      const section = this.closest('.movable-section');
      const container = document.getElementById('secciones-container');
      const prevSection = section?.previousElementSibling;
      if (section && prevSection && prevSection.classList.contains('movable-section')) {
        container.insertBefore(section, prevSection);
        updateSectionOrder();
        showAlert('Sección movida arriba', 'info');
      }
    });
  });
  document.querySelectorAll('.move-section-down').forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    newButton.addEventListener('click', function () {
      const section = this.closest('.movable-section');
      const container = document.getElementById('secciones-container');
      const nextSection = section?.nextElementSibling;
      if (section && nextSection && nextSection.classList.contains('movable-section')) {
        container.insertBefore(nextSection, section);
        updateSectionOrder();
        showAlert('Sección movida abajo', 'info');
      }
    });
  });
  initializeSectionDragAndDrop();
}

function initializeDragAndDrop() {
  const questions = document.querySelectorAll('.dark-question');
  let draggedQuestion = null;
  questions.forEach(question => {
    question.setAttribute('draggable', 'true');
    question.addEventListener('dragstart', function (e) {
      draggedQuestion = this;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    question.addEventListener('dragend', function () {
      this.classList.remove('dragging');
      draggedQuestion = null;
    });
    question.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    question.addEventListener('dragenter', function (e) {
      e.preventDefault();
      this.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
    });
    question.addEventListener('dragleave', function () { this.style.backgroundColor = ''; });
    question.addEventListener('drop', function (e) {
      e.preventDefault();
      this.style.backgroundColor = '';
      if (draggedQuestion && draggedQuestion !== this) {
        const section = this.parentElement;
        const rect = this.getBoundingClientRect();
        section.insertBefore(
          draggedQuestion,
          e.clientY < rect.top + rect.height / 2 ? this : this.nextElementSibling
        );
        updateQuestionOrder();
        showAlert('Pregunta reordenada', 'success');
      }
    });
  });
}

function initializeSectionDragAndDrop() {
  const sections = document.querySelectorAll('.movable-section');
  let draggedSection = null;
  sections.forEach(section => {
    section.setAttribute('draggable', 'true');
    section.addEventListener('dragstart', function (e) {
      draggedSection = this;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    section.addEventListener('dragend', function () {
      this.classList.remove('dragging');
      draggedSection = null;
    });
    section.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    section.addEventListener('dragenter', function (e) {
      e.preventDefault();
      this.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
    });
    section.addEventListener('dragleave', function () { this.style.backgroundColor = ''; });
    section.addEventListener('drop', function (e) {
      e.preventDefault();
      this.style.backgroundColor = '';
      if (draggedSection && draggedSection !== this) {
        const container = document.getElementById('secciones-container');
        const rect = this.getBoundingClientRect();
        container.insertBefore(
          draggedSection,
          e.clientY < rect.top + rect.height / 2 ? this : this.nextElementSibling
        );
        updateSectionOrder();
        showAlert('Sección reordenada', 'success');
      }
    });
  });
}

function updateQuestionOrder() {
  const sections = document.querySelectorAll('.dark-section');
  let globalOrder = 1;
  sections.forEach(section => {
    section.querySelectorAll('.dark-question').forEach(question => {
      question.setAttribute('data-order', globalOrder++);
    });
  });
}
function updateSectionOrder() {
  document.querySelectorAll('.movable-section').forEach((section, index) => {
    section.setAttribute('data-section-order', index + 1);
  });
}

// =================== VALIDACIÓN FORMULARIO ===================
function initializeFormValidation() {
  const form = document.getElementById('encuestaForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const calificacionInput = document.getElementById('calificacionGeneral');
    if (!calificacionInput || !calificacionInput.value) {
      showAlert('Por favor, seleccione una calificación general', 'warning');
      const starsElement = document.querySelector('.dark-stars');
      if (starsElement) highlightElement(starsElement.closest('.dark-question'));
      return;
    }

    let isValid = true;
    document.querySelectorAll('.dark-switch:checked').forEach(switchElement => {
      const questionBlock = switchElement.closest('.dark-question');
      let hasValue = false;
      questionBlock.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(input => {
        if (input.value.trim()) hasValue = true;
      });
      questionBlock.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio.checked) hasValue = true;
      });
      if (questionBlock.querySelector('.dark-stars')) {
        const starInput = questionBlock.querySelector('input[type="hidden"]');
        if (starInput && starInput.value) hasValue = true;
      }
      if (!hasValue) { isValid = false; highlightElement(questionBlock); }
    });

    if (!isValid) { showAlert('Por favor, complete todos los campos obligatorios', 'warning'); return; }

    showAlert('¡Encuesta enviada con éxito! Gracias por su feedback.', 'success');
    setTimeout(() => {
      this.reset();
      document.querySelectorAll('.star').forEach(star => { star.classList.remove('selected', 'hover'); });
      document.querySelectorAll('input[type="hidden"]').forEach(input => { if (input.id.includes('calificacion')) input.value = ''; });
      resetFormVisuals();
    }, 2000);
  });
}

function initializeVisualEffects() {
  document.querySelectorAll('.dark-question').forEach((question, index) => {
    question.style.animationDelay = `${index * 0.1}s`;
  });
  document.querySelectorAll('.dark-rating-btn').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('mouseenter', function () { this.style.transform = 'translateY(-2px) scale(1.05)'; });
    newBtn.addEventListener('mouseleave', function () { if (!this.previousElementSibling?.checked) this.style.transform = ''; });
  });
}

function highlightElement(element) {
  if (!element) return;
  element.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.3)';
  element.style.borderColor = '#ef4444';
  setTimeout(() => { element.style.boxShadow = ''; element.style.borderColor = ''; }, 3000);
}
function resetFormVisuals() {
  document.querySelectorAll('.dark-question').forEach(question => { question.style.borderLeft = '4px solid #404040'; });
  document.querySelectorAll('.obligatory-text').forEach(text => {
    const switchElement = text.closest('.controls-right')?.querySelector('.dark-switch');
    if (switchElement?.checked) text.textContent = 'Obligatorio';
  });
}
function showAlert(message, type) {
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) existingAlert.remove();
  const alert = document.createElement('div');
  alert.className = `custom-alert alert alert-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'} alert-dismissible fade show`;
  alert.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: none; border-radius: 8px; font-weight: 500;`;
  alert.innerHTML = `
    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

// =================== LISTENER PARA SELECT DE SECCIONES ===================
document.addEventListener('DOMContentLoaded', function () {
  const selectSeccion = document.getElementById('nuevaPreguntaSeccion');
  if (selectSeccion && !selectSeccion.dataset.listenerAdded) {
    selectSeccion.dataset.listenerAdded = "true";
    selectSeccion.addEventListener('change', function () {
      if (this.value === 'nueva-seccion') {
        mostrarModalNuevaSeccion();
        setTimeout(() => {
          const primeraOpcion = this.querySelector('option:not([value="nueva-seccion"])');
          if (primeraOpcion) this.value = primeraOpcion.value;
        }, 100);
      }
    });
  }
});

// =================== INSERCIÓN EN SECCIÓN ACTIVA (AL FINAL) ===================
function insertarEnSeccionActiva(bloque) {
  const select = document.getElementById('nuevaPreguntaSeccion');
  const seccionId = select?.value;
  let seccion = (seccionId && seccionId !== 'nueva-seccion') ? document.getElementById(seccionId) : null;

  if (!seccion) {
    const secciones = document.querySelectorAll('.movable-section');
    seccion = secciones.length ? secciones[secciones.length - 1] : null;
  }
  const container = document.getElementById('secciones-container');
  const destino = seccion || container;
  destino.appendChild(bloque); // SIEMPRE al final
}

// =================== VIDEO/IMAGEN ===================
function convertirEnlaceVideo(url) {
  // Acepta: https://www.youtube.com/watch?v=ID  |  https://youtu.be/ID
  const m = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]{6,})/i);
  return (m && m[1]) ? `https://www.youtube.com/embed/${m[1]}` : null; // FIX regex
}

function crearBloqueImagen() {
  const div = document.createElement('div');
  div.className = 'dark-question';
  div.setAttribute('data-question-id', 'img-' + Date.now());
  div.innerHTML = `
    <div class="question-header">
      <div class="move-controls">
        <i class="bi bi-arrow-up move-up" title="Mover imagen arriba"></i>
        <i class="bi bi-arrow-down move-down" title="Mover imagen abajo"></i>
      </div>
      <div class="question-content text-center">
        <label class="form-label dark-label editable-label" contenteditable="true">Imagen</label>
        <div class="mb-2">
          <button type="button" class="btn btn-outline-primary btn-sm seleccionar-imagen-btn">Seleccionar imagen</button>
          <input type="file" accept="image/*" style="display:none;" class="input-imagen">
        </div>
        <img class="img-fluid rounded mx-auto d-block vista-imagen" style="max-width: 100%; display: none;">
      </div>
    </div>
    <div class="question-controls">
      <div class="controls-left">
        <i class="bi bi-trash control-icon text-danger" title="Eliminar imagen"></i>
      </div>
    </div>`;

  const input = div.querySelector('.input-imagen');
  const preview = div.querySelector('.vista-imagen');
  const button = div.querySelector('.seleccionar-imagen-btn');
  const trashIcon = div.querySelector('.bi-trash');

  button.addEventListener('click', () => input.click());
  input.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
  trashIcon.addEventListener('click', () => { if (confirm('¿Deseas eliminar esta imagen?')) div.remove(); });
  reinicializarControlesPregunta(div);
  return div;
}

function crearBloqueVideo() {
  const div = document.createElement('div');
  div.className = 'dark-question';
  div.setAttribute('data-question-id', 'vid-' + Date.now());
  div.innerHTML = `
    <div class="question-header">
      <div class="move-controls">
        <i class="bi bi-arrow-up move-up" title="Mover video arriba"></i>
        <i class="bi bi-arrow-down move-down" title="Mover video abajo"></i>
      </div>
      <div class="question-content text-center">
        <label class="form-label dark-label">Video</label>
        <input type="url" class="form-control mb-2" placeholder="Pega el enlace del video (YouTube)">
        <iframe class="rounded mx-auto d-block" style="width:100%; max-width:560px; height:315px; display:none;" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
    <div class="question-controls">
      <div class="controls-left">
        <i class="bi bi-trash control-icon text-danger" title="Eliminar video"></i>
      </div>
    </div>`;

  const input = div.querySelector('input[type="url"]');
  const iframe = div.querySelector('iframe');
  const trashIcon = div.querySelector('.bi-trash');

  input.addEventListener('input', function () {
    const url = this.value.trim();
    const embedUrl = convertirEnlaceVideo(url);
    if (embedUrl) { iframe.src = embedUrl; iframe.style.display = 'block'; }
    else { iframe.style.display = 'none'; }
  });
  trashIcon.addEventListener('click', () => { if (confirm('¿Deseas eliminar este video?')) div.remove(); });
  reinicializarControlesPregunta(div);
  return div;
}

// ========== EXPORTAR FORMULARIO A JSON ==========
document.addEventListener('DOMContentLoaded', function() {
  const btnExportar = document.getElementById('btnExportar');
  if (!btnExportar) return;

  btnExportar.addEventListener('click', function() {
    // Recorre todas las preguntas del formulario
    const preguntas = [];
    document.querySelectorAll('.dark-question').forEach(q => {
      const textoPregunta = q.querySelector('label') ? q.querySelector('label').textContent.trim() : "Pregunta sin título";
      const tipo = q.getAttribute('data-tipo') || 'texto';
      const obligatoria = q.querySelector('input[type="checkbox"]') ? q.querySelector('input[type="checkbox"]').checked : false;

      // Si tiene opciones (tipo multiple choice, etc.)
      const opciones = [];
      q.querySelectorAll('option').forEach(opt => opciones.push(opt.textContent));

      preguntas.push({
        texto: textoPregunta,
        tipo: tipo,
        obligatoria: obligatoria,
        opciones: opciones.length > 0 ? opciones : undefined
      });
    });

    // Crea un objeto con toda la información
    const formulario = {
      titulo: document.querySelector('.form-title')?.textContent.trim() || 'Formulario sin título',
      descripcion: document.querySelector('.form-description')?.textContent.trim() || '',
      preguntas: preguntas
    };

    // Convierte a JSON
    const jsonData = JSON.stringify(formulario, null, 2);

    // Crea un archivo y lo descarga
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formulario.titulo.replace(/\s+/g, '_') || 'formulario'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
});

