   // Capturar el submit del formulario
    document.getElementById("loginForm").addEventListener("submit", function(event) {
      event.preventDefault(); // Evita que la página se recargue

      // Obtener valores
      let usuario = document.getElementById("usuario").value;
      let password = document.getElementById("password").value;
      let repassword = document.getElementById("repassword").value;

      // Validar que las contraseñas coincidan
      if (password !== repassword) {
        alert("Las contraseñas no coinciden ❌");
        return;
      }

      // Guardar usuario en localStorage
      localStorage.setItem("usuarioLogeado", usuario);

      // Redirigir al menú
      window.location.href = "../pages/menu.html";
    });

       // Iniciar sesion 
    document.getElementById("IniciarSesion").addEventListener("submit", function(event) {
      event.preventDefault(); // Evita que la página se recargue

      // Obtener valores
      let usuario = document.getElementById("usuario").value;
      let password = document.getElementById("password").value;
  
      // Validar que las contraseñas coincidan
      if (password !== repassword) {
        alert("Las contraseñas no coinciden ❌");
        return;
      }

      // Guardar usuario en localStorage
      localStorage.setItem("usuarioLogeado", usuario);

      // Redirigir al menú
      window.location.href = "../pages/menu.html";
    });
  
  
  
  
 