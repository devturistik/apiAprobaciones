// src/routes/routes.js
import express from "express";
import routesAprobacion from "./routesAprobacion.js";

const router = express.Router();

// Redirección de la raíz a /dashboard
router.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// Renderizado de /dashboard
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

router.use(routesAprobacion);

export default router;
