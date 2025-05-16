"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMedrecRoutes = void 0;
const express_1 = require("express");
const medrecController_1 = __importDefault(require("../controllers/medrecController"));
const router = (0, express_1.Router)();
const medrecController = new medrecController_1.default();
function setMedrecRoutes(app) {
    app.post('/medrec', medrecController.createRecord.bind(medrecController));
    app.get('/medrec/:id', medrecController.getRecord.bind(medrecController));
    app.put('/medrec/:id', medrecController.updateRecord.bind(medrecController));
}
exports.setMedrecRoutes = setMedrecRoutes;
