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
class CreateParticipantService {
    execute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ eventId, name, email, course, semester, ra }) {
            const participant = yield prisma_1.default.participant.create({
                data: Object.assign(Object.assign({ eventId,
                    name,
                    email,
                    course,
                    semester }, ((ra === null || ra === void 0 ? void 0 : ra.trim()) && { ra: ra.trim() })), { isPresent: false })
            });
            return {
                data: participant,
                message: 'Partcipante inscrito com sucesso!'
            };
        });
    }
}
exports.CreateParticipantService = CreateParticipantService;
