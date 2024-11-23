// src/controllers/solicitudController.js
import SolicitudService from "../application/solicitudService.js";
class SolicitudController {
  constructor() {
    this.solicitudService = new SolicitudService();
  }


  createSolicitud = async (req, res) => {
    try {
      const { codigo, sistema } = req.body;
  
      if (!codigo || !sistema) {
        throw new Error("Faltan parámetros obligatorios: codigo o sistema.");
      }
  
      // Delegar al servicio
      const resultado = await this.solicitudService.procesarSolicitud({ codigo, sistema });
  
      res.status(200).json({
        message: "Solicitud procesada exitosamente.",
        data: resultado,
      });
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      res.status(400).json({
        message: error.message,
      });
    }
  };
  

}

export default SolicitudController;
