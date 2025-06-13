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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateParticipantController = void 0;
const http_status_codes_1 = require("http-status-codes");
const client_1 = require("@prisma/client");
const CreateParticipantService_1 = require("../../services/participants/CreateParticipantService");
const AppError_1 = require("../../errors/AppError");
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
