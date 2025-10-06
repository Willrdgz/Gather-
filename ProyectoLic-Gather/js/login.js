const btnLogin = document.getElementById('btnLogin');

    btnLogin.addEventListener('click', () => {
      const user = document.getElementById('usuario').value.trim();
      const pass = document.getElementById('contrasena').value;

      if (!user || !pass) {
        alert('Por favor ingresa tu usuario y contraseña');
        return;
      }

      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      const valido = usuarios.find(u => u.usuario === user && u.contraseña === pass);

      if (valido) {
        localStorage.setItem('usuarioActual', JSON.stringify({ usuario: user }));
        window.location.href = 'pages/menu.html';
      } else {
        alert('Datos incorrectos. (cuentan mayusculas).');
      }
    });