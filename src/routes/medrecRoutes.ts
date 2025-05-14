import { Router } from 'express';
import MedrecController from '../controllers/medrecController';

const router = Router();
const medrecController = new MedrecController();

export function setMedrecRoutes(app: Router) {
    app.post('/medrec', medrecController.createRecord.bind(medrecController));
    app.get('/medrec/:id', medrecController.getRecord.bind(medrecController));
    app.put('/medrec/:id', medrecController.updateRecord.bind(medrecController));
}