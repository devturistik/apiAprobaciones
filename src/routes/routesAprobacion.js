// src/routes/routesOrdenes.js
import express from "express";
import SolicitudController from "../controllers/solicitudController.js";
import requiredToken from "../middlewares/authApiMiddleware.js";

const router = express.Router();
const solicitudController = new SolicitudController();


// Ruta para procesar la creación de orden dada una solicitud
router.post("/api/v1/aprovals/solicitud",requiredToken, solicitudController.createSolicitud);

export default router;
