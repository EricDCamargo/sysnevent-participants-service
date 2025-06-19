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
exports.CreateParticipantController = void 0;
const http_status_codes_1 = require("http-status-codes");
const client_1 = require("@prisma/client");
const CreateParticipantService_1 = require("../../services/participants/CreateParticipantService");
const AppError_1 = require("../../errors/AppError");
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../../prisma"));
const SendEmailService_1 = require("../../services/email/SendEmailService");
const utils_1 = require("../../utils/utils");
class CreateParticipantController {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { eventId, name, email, course, semester, ra } = req.body;
            // Basic validations for required fields
            if (!eventId || !name || !email) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: 'Required fields: eventId, name, email'
                });
            }
            if (!(0, utils_1.isValidEmail)(email)) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: 'E-mail inválido'
                });
            }
            // enum´s validations
            let validatedCourse = undefined;
            if (course) {
                const upperCourse = course.toUpperCase();
                if (!(upperCourse in client_1.Course)) {
                    return res
                        .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                        .json({ error: 'Invalid course' });
                }
                validatedCourse = client_1.Course[upperCourse];
            }
            let validatedSemester = undefined;
            if (semester) {
                const upperSemester = semester.toUpperCase();
                if (!(upperSemester in client_1.Semester)) {
                    return res
                        .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                        .json({ error: 'Invalid semester' });
                }
                validatedSemester = client_1.Semester[upperSemester];
            }
            // Busca dados do evento
            let eventData;
            try {
                const response = yield axios_1.default.get(`${process.env.EVENT_SERVICE_URL}/details`, { params: { event_id: eventId } });
                if (response.status !== http_status_codes_1.StatusCodes.OK) {
                    return res
                        .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                        .json({ error: 'Evento não encontrado' });
                }
                eventData = response.data.data;
            }
            catch (error) {
                return res
                    .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .json({ error: 'Evento não encontrado' });
            }
            // Validação de domínio de email se evento for restrito
            if (eventData.isRestricted) {
                const rawDomains = process.env.ALLOWED_EMAIL_DOMAINS || '';
                const allowedDomains = rawDomains
                    .split(',')
                    .map(domain => domain.trim().toLowerCase());
                const emailIsValid = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
                if (!emailIsValid) {
                    return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                        error: 'Este evento é restrito a emails institucionais.'
                    });
                }
            }
            // Verifica se já existe inscrição para este evento com o mesmo email ou RA
            const existing = yield prisma_1.default.participant.findFirst({
                where: {
                    eventId,
                    OR: [{ email }, { ra: ra !== null && ra !== void 0 ? ra : '' }]
                }
            });
            if (existing) {
                return res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
                    error: 'Você já está inscrito neste evento!'
                });
            }
            // Verifica limite de participantes
            const participantsCount = yield prisma_1.default.participant.count({
                where: { eventId }
            });
            if (participantsCount >= eventData.maxParticipants) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: 'A quantidade máxima de participantes para este evento já foi atingida.'
                });
            }
            try {
                const service = new CreateParticipantService_1.CreateParticipantService();
                const result = yield service.execute({
                    eventId,
                    name,
                    email,
                    course: validatedCourse,
                    semester: validatedSemester,
                    ra
                });
                // Atualiza contador de participantes no serviço de eventos
                yield axios_1.default.patch(`${process.env.EVENT_SERVICE_URL}/update-participant-count`, {
                    eventId,
                    action: 'increment'
                });
                // Formata data e hora do evento
                const { date } = (0, utils_1.formatDateTime)(eventData.startDate);
                const { time } = (0, utils_1.formatDateTime)(eventData.startTime);
                // Define local
                const local = eventData.location === 'OUTROS'
                    ? eventData.customLocation
                    : eventData.location;
                // Monta corpo do e-mail
                const emailBody = `
Olá ${name},

Parabéns, você se inscreveu com sucesso no evento: ${eventData.name}

Data: ${date} / Horário: ${time}
Local: ${local}
Palestrante: ${eventData.speakerName}
Descrição: ${eventData.description}

Se precisar de mais informações, entre em contato com a organização.

Atenciosamente,
Equipe SysNevent
      `.trim();
                // Define o assunto do e-mail
                const subject = 'Inscrição realizada com sucesso!';
                // Dispara email de confirmação
                yield (0, SendEmailService_1.sendEmail)({
                    to: email,
                    subject,
                    emailBody
                });
                return res.status(http_status_codes_1.StatusCodes.CREATED).json(result);
            }
            catch (error) {
                if (error instanceof AppError_1.AppError) {
                    return res.status(error.statusCode).json({ error: error.message });
                }
                return res
                    .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ error: 'Internal server error when registering participant' });
            }
        });
    }
}
exports.CreateParticipantController = CreateParticipantController;
