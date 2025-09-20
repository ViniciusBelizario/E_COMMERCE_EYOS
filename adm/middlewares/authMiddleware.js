module.exports = (req, res, next) => {
    const token = req.session.token || req.cookies.token; // Verifica o token na sessão ou cookie

    // Permitir acesso livre à página de login
    if (req.path.startsWith("/auth/login") || req.path.startsWith("/public")) {
        return next();
    }

    // Se não tiver token, redireciona para a tela de login
    if (!token) {
        return res.redirect("/auth/login");
    }

    // Se já está logado e tentar acessar o login, redireciona para o dashboard
    if (req.path === "/auth/login" && token) {
        return res.redirect("/");
    }

    next();
};
