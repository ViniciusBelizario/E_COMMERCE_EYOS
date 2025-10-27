// src/middlewares/adminOnly.js
module.exports = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Não autenticado." });
  if (req.user.tipo !== "administrador") {
    return res.status(403).json({ error: "Apenas administradores podem realizar esta ação." });
  }
  next();
};
