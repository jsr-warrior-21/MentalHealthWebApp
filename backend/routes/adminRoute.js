 import express from 'express'
 import {addDoctor,allDoctors,loginAdmin,appointmentsAdmin, appointmentCancel,adminDashboard } from '../controllers/adminController.js'
 import upload from '../middleware/multer.js'
 import authAdmin from '../middleware/authAdmin.js'
import { changeAvailability } from '../controllers/doctorController.js';

const admintRouter = express.Router();

admintRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor);
admintRouter.post('/login',loginAdmin);
admintRouter.post('/all-doctors',authAdmin,allDoctors);
admintRouter.post('/change-availability',authAdmin,changeAvailability);
admintRouter.get('/appointments',authAdmin,appointmentsAdmin)
admintRouter.post('/cancel-appointment',authAdmin,appointmentCancel)
admintRouter.get('/dashboard',authAdmin,adminDashboard)
export default admintRouter;
