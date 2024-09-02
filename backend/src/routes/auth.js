import express from 'express';
import passport from 'passport';
import * as authController from '../controller/authController.js';

const router = express.Router();

router.get('/threads/callback', passport.authenticate('threads'), authController.threadsCallback);

export default router;
