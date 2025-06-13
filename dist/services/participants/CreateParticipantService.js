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
exports.CreateParticipantService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const AppError_1 = require("../../errors/AppError");
const http_status_codes_1 = require("http-status-codes");
const axios_1 = __importDefault(require("axios"));
class CreateParticipantService {
    execute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ eventId, name, email, course, semester, ra }) {
            const rawDomains = process.env.ALLOWED_EMAIL_DOMAINS || '';
            const allowedDomains = rawDomains
                .split(',')
                .map(domain => domain.trim().toLowerCase());
            let eventData;
            try {
                const response = yield axios_1.default.get(`${process.env.EVENT_SERVICE_URL}/details`, {
                    params: { event_id: eventId }
                });
                if (response.status !== http_status_codes_1.StatusCodes.OK) {
                    throw new AppError_1.AppError('Evento não encontrado', http_status_codes_1.StatusCodes.NOT_FOUND);
                }
                eventData = response.data.data;
            }
            catch (error) {
                throw new AppError_1.AppError('Evento não encontrado', http_status_codes_1.StatusCodes.NOT_FOUND);
            }
            if (eventData.isRestricted) {
                const emailIsValid = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
                if (!emailIsValid) {
                    throw new AppError_1.AppError('Este evento é restrito a emails institucionais.', http_status_codes_1.StatusCodes.FORBIDDEN);
                }
            }
            // Check if there's already a registration for this event with the same email or RA
            const existing = yield prisma_1.default.participant.findFirst({
                where: {
                    eventId,
                    OR: [
                        { email },
                        { ra: ra !== null && ra !== void 0 ? ra : '' } // use empty string if ra is undefined to avoid null issues because a participant can register without RA, a non fatec student
                    ]
                }
            });
            if (existing) {
                throw new AppError_1.AppError('Você já está inscrito neste evento!', http_status_codes_1.StatusCodes.CONFLICT);
            }
            // Check current number of participants in the event
            const participantsCount = yield prisma_1.default.participant.count({
                where: { eventId }
            });
            if (participantsCount >= eventData.maxParticipants) {
                throw new AppError_1.AppError('A quantidade máxima de participantes para este evento já foi atingida.', http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            const participant = yield prisma_1.default.participant.create({
                data: {
                    eventId,
                    name,
                    email,
                    course,
                    semester,
                    ra,
                    isPresent: false
                }
            });
            yield axios_1.default.patch(`${process.env.EVENT_SERVICE_URL}/update-participant-count`, {
                eventId,
                action: 'increment'
            });
            return {
                data: participant,
                message: 'Partcipante inscrito com sucesso!'
            };
        });
    }
}
exports.CreateParticipantService = CreateParticipantService;
