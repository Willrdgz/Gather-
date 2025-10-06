//defincion de variables 
const Usuario = document.getElementById("UsuarioNew");
const contraseña = document.getElementById("ContraseñaNew1");
const confirmacion = document.getElementById("ContraseñaNew2");
const btnIngresar = document.getElementById("btnIngresar");

    btnIngresar.addEventListener('click', () => {
      const user = document.getElementById('UsuarioNew').value.trim();
      const pass1 = document.getElementById('ContraseñaNew1').value;
      const pass2 = document.getElementById('ContraseñaNew2').value;

      const regla = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

      if (!user || !pass1 || !pass2) {
        alert('Por favor completa todos los campos');
        return;
      }

      if (pass1 !== pass2) {
        alert('Las contraseñas no coinciden');
        return;
      }

      if (!regla.test(pass1)) {
        alert('La contraseña no cumple los requisitos');
        return;
      }

      let lista = JSON.parse(localStorage.getItem('usuarios')) || [];

      if (lista.some(u => u.usuario === user)) {
        alert('Ese usuario ya existe');
        return;
      }

      lista.push({ usuario: user, contraseña: pass1 });
      localStorage.setItem('usuarios', JSON.stringify(lista));

      localStorage.setItem(`usuarioActual`, JSON.stringify({usuario: user}));

      alert('Cuenta creada con éxito');
      window.location.href = '../index.html';
    });



//funcion de validación de contraseña//
function validación(){
    const pass1 = contraseña.value;
    const pass2  = confirmacion.value;
    if(pass1 == ""){
        alert("No ha ingresado ninguna contraseña, Por favor ingrese una contraseña");
    }

    else if(pass1 != pass2){
        alert("Las contraseñas no son coincidentes");
    }

    else if(pass1 == pass2){
       validaciónde();
       //Agregar funcion que deje el campo en blanco
       
    }

};

btnIngresar.addEventListener("click", validación);

function cargardatos() {
    //constantes
    let usuario = Usuario.value; 
    let key = confirmacion.value;
    localStorage.setItem(usuario, JSON.stringify({"nombre": usuario, "llave": key}))
}

function validaciónde(){
    let usuario = Usuario.value;
    let datos = localStorage.getItem(usuario);
    showUsuario.textContent = usuario;
    console.log(`usuario: ${usuario}`);
    const nombre = JSON.parse(datos);

    if(localStorage.key(usuario) === usuario)
    {
        alert("usuario ya ocupado")
    }
    if (localStorage.key(usuario) != usuario){
        const pass2  = confirmacion.value;
        let expresion =  /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,}$/

        if(expresion.test(pass2)){
            alert("usuario creado con exito");
            cargardatos();
        location.href = "menu.html";
        }
        else {alert("La contraseña no cumple los requisitos minimos");
        }
    }
}


