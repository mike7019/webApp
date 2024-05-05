$(document).ready(function(){
   
    $('#paymentForm').submit(function(e){
      e.preventDefault(); // Detener el envío del formulario
     
      
      // Mostrar la alerta de éxito
      Swal.fire({
        title: "Good job!",
        text: "Data saved successfully.!",
        icon: "success"
      });
      
      // Limpiar todos los campos del formulario
      $('#paymentForm')[0].reset();
    });
  });