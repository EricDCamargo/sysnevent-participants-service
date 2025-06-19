"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateTime = formatDateTime;
exports.isValidEmail = isValidEmail;
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function formatDateTime(datetime) {
    const dateObj = new Date(datetime);
    const date = dateObj.toLocaleDateString('pt-BR');
    const time = dateObj.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    return { date, time };
}
