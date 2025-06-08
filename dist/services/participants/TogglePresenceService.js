"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TogglePresenceService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const AppError_1 = require("../../errors/AppError");
const http_status_codes_1 = require("http-status-codes");
class TogglePresenceService {
    execute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ participantId }) {
            const participant = yield prisma_1.default.participant.findUnique({
                where: { id: participantId }
            });
            if (!participant) {
                throw new AppError_1.AppError('Participante do evento não encontrado.', http_status_codes_1.StatusCodes.NOT_FOUND);
            }
            const updated = yield prisma_1.default.participant.update({
                where: { id: participantId },
                data: { isPresent: !participant.isPresent }
            });
            return {
                data: updated,
                message: updated.isPresent
                    ? 'Presença registarda com sucesso.'
                    : 'Presença removida com sucesso.'
            };
        });
    }
}
exports.TogglePresenceService = TogglePresenceService;
