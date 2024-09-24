import { Request, Response, NextFunction } from 'express';
import { File } from '../file/file.entity.js';
import { orm } from '../../shared/orm.js';

const em = orm.em;

function sanitizeUserInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    type: req.body.type,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined)
      delete req.body.sanitizedInput[key];
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const files = await em.find(File, {});
    res.status(200).json({ message: 'found all files', data: files });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const file = await em.findOneOrFail(File, { id });
    res.status(200).json({ message: 'found file', data: file });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const file = em.create(File, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'file added', data: file });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const fileToUpdate = await em.findOneOrFail(File, { id });
    em.assign(fileToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'file updated', data: fileToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const unit = em.getReference(File, id);
    await em.removeAndFlush(unit);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeUserInput, findAll, findOne, add, update, remove };