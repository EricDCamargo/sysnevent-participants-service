"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = isAuthenticated;
exports.isCoordinator = isCoordinator;
exports.isAdmin = isAdmin;
const jsonwebtoken_1 = require("jsonwebtoken");
const http_status_codes_1 = require("http-status-codes");
const types_1 = require("../@types/types");
function isAuthenticated(req, res, next) {
    const authToken = req.headers.authorization;
    if (!authToken) {
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ error: 'Token não encontrado!' })
            .end();
    }
    const [, token] = authToken.split(' ');
    try {
        const { sub, role } = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
        req.user_id = sub;
        req.user_role = role;
        return next();
    }
    catch (err) {
        return res
            .status(http_status_codes_1.StatusCodes.UNAUTHORIZED)
            .json({ error: 'Token invalido ou expirado!' })
            .end();
    }
}
function isCoordinator(req, res, next) {
    if (req.user_role !== types_1.Role.COORDINATOR && req.user_role !== types_1.Role.ADMIN) {
        return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ error: 'Permisão negada!' });
    }
    return next();
}
function isAdmin(req, res, next) {
    if (req.user_role !== types_1.Role.ADMIN) {
        return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ error: 'Permisão negada!' });
    }
    return next();
}
