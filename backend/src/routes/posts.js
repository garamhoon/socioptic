import express from 'express';
import * as postsController from '../controller/postsController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/threads', isAuthenticated, postsController.getThreadsPosts);

export default router;
