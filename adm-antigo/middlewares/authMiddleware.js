// middlewares/authMiddleware.js
module.exports = (req, res, next) => {
  const token = req.session.token || req.cookies.token;

  // liberar login e estáticos
  const publicPaths = [
    /^\/auth(\/|$)/,
    /^\/css(\/|$)/,
    /^\/js(\/|$)/,
    /^\/images(\/|$)/,
    /^\/favicon\.ico$/,
    /^\/index\.css$/,
    /^\/login\.css$/,
  ];
  if (publicPaths.some((re) => re.test(req.path))) return next();

  // sem token -> login
  if (!token) return res.redirect("/auth/login");

  next();
};
