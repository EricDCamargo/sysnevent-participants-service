"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_codes_1 = require("http-status-codes");
const routes_1 = require("./routes");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((req, res, next) => {
    console.log('\n--- [MICROSERVIÇO PARTICIPANTES] Requisição recebida ---');
    console.log(`[METHOD] ${req.method}`);
    console.log(`[URL] ${req.url}`); // <- importante
    console.log(`[ORIGINAL URL] ${req.originalUrl}`); // <- também ajuda
    console.log('[HEADERS]', req.headers);
    console.log('[BODY]', req.body);
    console.log('--------------------------------------------------\n');
    const originalSend = res.send;
    res.send = function (body) {
        // Log da response ao enviar
        console.log('\n--- [MICROSERVIÇO PARTICIPANTES] Resposta enviada ---');
        console.log(`[STATUS] ${res.statusCode}`);
        console.log('[HEADERS]', res.getHeaders());
        console.log('[BODY]', body);
        console.log('--------------------------------------------------\n');
        return originalSend.call(this, body);
    };
    next();
});
app.use(routes_1.router);
app.use((err, req, res, next) => {
    if (err instanceof Error) {
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            error: err.message
        });
    }
    return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        messege: 'Internal server error'
    });
});
app.listen(process.env.PORT, () => console.log('Server online na porta', process.env.PORT));
