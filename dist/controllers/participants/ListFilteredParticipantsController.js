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
exports.ListFilteredParticipantsController = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = require("../../errors/AppError");
const ListFilteredParticipantsService_1 = require("../../services/participants/ListFilteredParticipantsService");
const axios_1 = __importDefault(require("axios"));
class ListFilteredParticipantsController {
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { event_id, onlyStudents, onlyFatec, onlyExternal, onlyPresent } = req.query;
            if (!event_id) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: 'Parameter "event_id" is required.'
                });
            }
            try {
                try {
                    yield axios_1.default.get(`${process.env.EVENT_SERVICE_URL}/events/details`, {
                        params: { event_id },
                        headers: { Authorization: req.headers.authorization || '' }
                    });
                }
                catch (err) {
                    // Se retornar 404 do Event Service, repassamos
                    const status = ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) === http_status_codes_1.StatusCodes.NOT_FOUND
                        ? http_status_codes_1.StatusCodes.NOT_FOUND
                        : http_status_codes_1.StatusCodes.BAD_GATEWAY;
                    throw new AppError_1.AppError(((_c = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || 'Event not found.', status);
                }
                const service = new ListFilteredParticipantsService_1.ListFilteredParticipantsService();
                const result = yield service.execute({
                    event_id: event_id,
                    onlyStudents: onlyStudents === 'true',
                    onlyFatec: onlyFatec === 'true',
                    onlyExternal: onlyExternal === 'true',
                    onlyPresent: onlyPresent === 'true'
                });
                return res.status(http_status_codes_1.StatusCodes.OK).json(result);
            }
            catch (error) {
                if (error instanceof AppError_1.AppError) {
                    return res.status(error.statusCode).json({ error: error.message });
                }
                return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                    error: 'Failed to fetch filtered participants.'
                });
            }
        });
    }
}
exports.ListFilteredParticipantsController = ListFilteredParticipantsController;
