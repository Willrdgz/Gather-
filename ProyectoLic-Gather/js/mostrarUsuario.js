const showUsuario = document.getElementById("userName");

document.addEventListener("DOMContentLoaded", () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if(usuarioActual && usuarioActual.usuario){
        showUsuario.textContent = usuarioActual.usuario;
        console.log(usuarioActual);
    }else{
        //window.location.href = "pages/menu.html"
    }
});