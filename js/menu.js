// Recuperar usuario de localStorage
  let usuario = localStorage.getItem("usuarioLogeado");

  if (usuario) {
    document.getElementById("nombreUsuario").textContent = usuario;
  } else {
    document.getElementById("nombreUsuario").textContent = "Invitado";
  }