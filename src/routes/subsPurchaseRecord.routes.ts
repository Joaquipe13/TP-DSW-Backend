import { Router } from 'express';
import {
  sanitizedInput,
  findAll,
  findOne,
  add,
} from '../controllers/subsPurchaseRecord.controller.js';

export const subsPurchaseRecordRouter = Router();

subsPurchaseRecordRouter.get('/', findAll);
subsPurchaseRecordRouter.get('/:id', findOne);
subsPurchaseRecordRouter.post('/', sanitizedInput, add);