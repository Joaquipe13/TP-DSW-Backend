import { Router } from 'express';
import {
  sanitizedInput,
  findAll,
  findOne,
  add,
  remove,
} from '../controllers/topic.controller.js';

export const topicRouter = Router();

topicRouter.get('/', findAll);
topicRouter.get('/:id', findOne);
topicRouter.post('/', sanitizedInput, add);
topicRouter.delete('/:id', remove);
