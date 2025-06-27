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
exports.ListFilteredParticipantsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
class ListFilteredParticipantsService {
    constructor() {
        const envDomains = process.env.ALLOWED_EMAIL_DOMAINS || '';
        this.allowedDomains = envDomains.split(',').map(d => d.trim());
    }
    execute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ event_id, onlyStudents, onlyFatec, onlyExternal, onlyPresent }) {
            const where = {
                eventId: event_id
            };
            if (onlyPresent) {
                where.isPresent = true;
            }
            const orFilters = [];
            if (onlyStudents) {
                orFilters.push({
                    NOT: {
                        ra: null
                    }
                });
            }
            if (onlyFatec) {
                orFilters.push(...this.allowedDomains.map(domain => ({
                    email: {
                        endsWith: domain
                    }
                })));
            }
            if (onlyExternal) {
                orFilters.push({
                    AND: [
                        { ra: null },
                        {
                            NOT: {
                                OR: this.allowedDomains.map(domain => ({
                                    email: {
                                        endsWith: domain
                                    }
                                }))
                            }
                        }
                    ]
                });
            }
            if (orFilters.length > 0) {
                where.OR = orFilters;
            }
            let participants = yield prisma_1.default.participant.findMany({
                where
            });
            const getGroupScore = (p) => {
                const isStudent = !!p.ra;
                const isFatec = this.allowedDomains.some(domain => p.email.endsWith(domain));
                if (isStudent)
                    return 0;
                if (isFatec)
                    return 1;
                return 2;
            };
            participants.sort((a, b) => {
                const groupDiff = getGroupScore(a) - getGroupScore(b);
                if (groupDiff !== 0)
                    return groupDiff;
                return a.name.localeCompare(b.name);
            });
            return {
                data: participants,
                message: 'Filtered participants retrieved successfully.'
            };
        });
    }
}
exports.ListFilteredParticipantsService = ListFilteredParticipantsService;
