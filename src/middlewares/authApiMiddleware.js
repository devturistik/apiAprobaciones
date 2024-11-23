import jwt from "jsonwebtoken";

// Middleware de autenticación: Verifica y decodifica el token
const requireAuthApi = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  const tokenWithoutBearer = token.startsWith("Bearer ")
    ? token.slice(7)
    : token;

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }
    req.user = user; // Usuario autenticado se almacena en `req.user`
    next();
  });
};

export default requireAuthApi;
