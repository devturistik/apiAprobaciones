import SolicitudRepository from "../adapters/repository/solicitudRepository.js";
import graphClient from "../config/graph.js"; // Importación con ES Modules

class SolicitudService {
  constructor() {
    this.solicitudRepository = new SolicitudRepository(); // Repositorio que maneja la persistencia
  }

  async procesarSolicitud({ codigo, sistema }) {
    try {
      if (!codigo || !sistema) {
        throw new Error("Faltan parámetros obligatorios: codigo o sistema.");
      }

      switch (sistema) {
        case "OC": {
          const ordenCompra = await this.solicitudRepository.obtenerOrdenCompra(codigo);
          if (!ordenCompra) {
            throw new Error(`No se encontró la orden de compra con código ${codigo}.`);
          }

          console.log("Orden de compra obtenida:", ordenCompra);

          const flujoAprobacion = await this.solicitudRepository.obtenerFlujoAprobacion(ordenCompra);
          console.log("Flujo de aprobación recibido:", flujoAprobacion);

          if (!flujoAprobacion.length) {
            throw new Error("No se encontró flujo de aprobación para esta orden de compra.");
          }

          const historialIds = [];
          for (const aprobador of flujoAprobacion) {
            console.log("Aprobador actual:", aprobador);

            const idHistorial = await this.solicitudRepository.insertarHistorialAprobacion({
              idOrdenCompra: ordenCompra.id_orden,
              codigoOrdenCompra: ordenCompra.codigo,
              aprobadorId: aprobador.id,
              nivelAprobacion: aprobador.nivel,
            });

            console.log(`Historial insertado con ID: ${idHistorial}`);
            historialIds.push(idHistorial);
            console.log(typeof aprobador.nivel);
            // Enviar correo al primer aprobador y salir del bucle
            if (aprobador.nivel == 1) {
              console.log(aprobador);
              await enviarCorreoAprobador(aprobador.correo,ordenCompra);
                // Enviar mensaje a Teams
           break;
              
            }
          }

          const nivelMaximo = Math.max(...flujoAprobacion.map((aprobador) => aprobador.nivel));

          await this.solicitudRepository.actualizarNivelOrdenCompra(ordenCompra.id_orden, nivelMaximo);
          console.log(`Nivel máximo actualizado para la orden de compra ${ordenCompra.id_orden}: ${nivelMaximo}`);

          return {
            message: "Solicitud procesada exitosamente.",
            data: {
              ordenCompra,
              flujoAprobacion,
              historial: historialIds,
            },
          };
        }

        default:
          throw new Error(`El sistema ${sistema} no es soportado.`);
      }
    } catch (error) {
      console.error("Error en procesarSolicitud:", error);
      throw error;
    }
  }
}

// Función para enviar correo al aprobador
async function enviarCorreoAprobador(correo, ordenCompra) {
  try {
    // Crear HTML para el correo
    const detallesOrdenHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h1 style="text-align: center; color: #4CAF50;">Aprobación de Solicitud</h1>
        <p style="font-size: 16px; color: #333;">Hola,</p>
        <p style="font-size: 16px; color: #333;">
          Por favor, revise los detalles de la Orden de Compra y proceda con la aprobación en el sistema.
        </p>
        <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #eee; border-radius: 8px; margin: 20px 0;">
          <h2 style="text-align: center; color: #333;">Detalles de la Orden</h2>
          <p><strong>Solicitante:</strong> ${ordenCompra.solicitante}</p>
          <p><strong>Código:</strong> ${ordenCompra.codigo}</p>
          <p><strong>Monto:</strong> ${ordenCompra.monto} ${ordenCompra.moneda}</p>
          <p><strong>Fecha:</strong> ${ordenCompra.fecha}</p>
        </div>
        <p style="font-size: 16px; color: #333; text-align: center;">
          <a href="https://sistema-ejemplo.com" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Revisar en el Sistema</a>
        </p>
        <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">
          Este mensaje ha sido enviado automáticamente, por favor no responder.
        </p>
      </div>
    `;

    const response = await graphClient.api('/users/notificacionoc@turistik.com/sendMail').post({
      message: {
        subject: 'Aprobación de Solicitud',
        body: {
          contentType: 'HTML',
          content: detallesOrdenHTML, // Agregar contenido HTML
        },
        toRecipients: [
          {
            emailAddress: {
              address: "santelizelvis@gmail.com", // Correo del aprobador
            },
          },
        ],
      },
      saveToSentItems: "true", // Guarda el correo en "Elementos enviados"
    });
// codigo para
    console.log('Correo enviado:', response);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
  }
}





export default SolicitudService;
