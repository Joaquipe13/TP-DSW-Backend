import { Request, Response, NextFunction } from 'express';
import { CoursePurchaseRecord } from './coursePurchaseRecord.entity.js';
import { orm } from '../../shared/orm.js';

const em = orm.em;

em.getRepository(CoursePurchaseRecord);
function sanitizeCoursePurchaseRecordInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { totalAmount, course, member } = req.body;
  // Validación de tipos
  try {
    if (totalAmount !== Number) {
      req.body.totalAmount = parseInt(totalAmount);
    }
  } catch (error) {
    return res.status(400).send({ message: 'Invalid totalAmount' });
  }

  try {
    if (course !== Number) {
      req.body.course = parseInt(course);
    }
  } catch (error) {
    return res.status(400).send({ message: 'Invalid course' });
  }
  try {
    if (member !== Number) {
      req.body.member = parseInt(member);
    }
  } catch (error) {
    return res.status(400).send({ message: 'Invalid member' });
  }

  // Creación de objeto con propiedades válidas
  req.body.sanitizedInput = {
    totalAmount: req.body.totalAmount,
    course: req.body.course,
    member: req.body.member,
  };

  // Eliminación de propiedades undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const coursePurchaseRecords = await em.find(
      CoursePurchaseRecord,
      {},
      { populate: ['course', 'member'] }
    );
    res.json({
      message: 'found all coursePurchaseRecords',
      data: coursePurchaseRecords,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const coursePurchaseRecord = await em.findOneOrFail(
      CoursePurchaseRecord,
      { id },
      { populate: ['course', 'member'] }
    );
    res.status(200).json({
      message: 'found coursePurchaseRecord',
      data: coursePurchaseRecord,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const coursePurchaseRecord = em.create(
      CoursePurchaseRecord,
      req.body.sanitizedInput
    );
    await em.flush();
    res.status(201).json({
      message: 'CoursePurchaseRecord created',
      data: coursePurchaseRecord,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const coursePurchaseRecordToUpdate = await em.findOneOrFail(
      CoursePurchaseRecord,
      { id }
    );
    em.assign(coursePurchaseRecordToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({
      message: 'CoursePurchaseRecord updated',
      data: coursePurchaseRecordToUpdate,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const coursePurchaseRecord = em.getReference(CoursePurchaseRecord, id);
    await em.removeAndFlush(coursePurchaseRecord);
    res.status(204).json({ message: 'CoursePurchaseRecord deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
  //res.status(500).json({ message: 'Not implemented' });
}

export {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeCoursePurchaseRecordInput,
};