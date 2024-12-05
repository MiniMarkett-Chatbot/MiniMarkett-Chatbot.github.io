   // Mantener un historial de respuestas para evitar duplicados
   let history = [];

   // Manejamos la acción de enviar un mensaje
   function sendMessage() {
       const userInput = document.getElementById('user-input').value;
       if (userInput.trim() === '') return;

       // Mostrar el mensaje del usuario
       const chatBox = document.getElementById('chat-box');
       const userMessage = document.createElement('div');
       userMessage.classList.add('message', 'user-message');
       userMessage.textContent = userInput;
       chatBox.appendChild(userMessage);

       // Limpiar la entrada de texto
       document.getElementById('user-input').value = '';

       // Respuestas personalizadas (sin importar cuántos caracteres extra tenga)
       if (userInput.toLowerCase().startsWith('hola')) {
           const botMessage = document.createElement('div');
           botMessage.classList.add('message', 'bot-message');
           botMessage.textContent = '¡Hola! ¿En qué puedo ayudarte hoy?';
           chatBox.appendChild(botMessage);
       } else if (userInput.toLowerCase().startsWith('adios')) {
           const botMessage = document.createElement('div');
           botMessage.classList.add('message', 'bot-message');
           botMessage.textContent = '¡Hasta luego!';
           chatBox.appendChild(botMessage);

           // Desactivar el campo de entrada
           document.getElementById('user-input').disabled = true;
           document.getElementById('user-input').value = 'Has terminado esta conversación';

           // Desactivar el botón
           document.querySelector('button').disabled = true;
       } else {
           // Enviar el mensaje al servidor Flask
           fetch('https://minimarkett-bot.onrender.com/chat', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ mensaje: userInput })
           })
           .then(response => response.json())
           .then(data => {
               // Verificar si hay productos
               if (data.error) {
                   const botMessage = document.createElement('div');
                   botMessage.classList.add('message', 'bot-message');
                   botMessage.textContent = data.error;
                   chatBox.appendChild(botMessage);
               } else {
                   let responseText = '';
                   let allProductsText = ''; // Variable para almacenar todos los productos en un solo mensaje

                   responseText = "Productos en base a tu busqueda:";

                   // Concatenar la respuesta personalizada
                   allProductsText += `<strong>${responseText}</strong><br><br>`;

                   // Limitar a 10 productos sin repeticiones
                   let uniqueProducts = new Set();
                   let productCount = 0;

                   // Ordenar los productos de mayor a menor precio
                   const sortedProducts = data.sort((a, b) => b.precio - a.precio);

                   sortedProducts.forEach(product => {
                       if (!uniqueProducts.has(product.producto) && productCount < 10) {
                           uniqueProducts.add(product.producto);
                           allProductsText += 
                               `<div class="product-item">
                                   <strong>Producto:</strong> ${product.producto} <br>
                                   <strong>Precio:</strong> ${product.precio} C$ <br>
                               </div>`;
                           productCount++;
                       }
                   });

                   // Crear un solo mensaje con todos los productos
                   const botMessage = document.createElement('div');
                   botMessage.classList.add('message', 'bot-message');
                   botMessage.innerHTML = allProductsText;
                   chatBox.appendChild(botMessage);
               }

               // Desplazar al fondo
               chatBox.scrollTop = chatBox.scrollHeight;
           })
           .catch(error => {
               const botMessage = document.createElement('div');
               botMessage.classList.add('message', 'bot-message');
               botMessage.textContent = 'Lo siento, hubo un error al procesar tu solicitud.';
               chatBox.appendChild(botMessage);
           });
       }
       
       // Desplazar al fondo
       chatBox.scrollTop = chatBox.scrollHeight;
   }

   // Hacer que al presionar "Enter" se envíe el mensaje
   document.getElementById('user-input').addEventListener('keydown', function (e) {
       if (e.key === 'Enter') {
           sendMessage();
       }
   });