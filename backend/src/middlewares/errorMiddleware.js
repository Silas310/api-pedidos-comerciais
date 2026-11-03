import AppError from '../errors/AppError.js';
import { Sequelize } from 'sequelize';

function errorMiddleware(error, req, res, next) {
  console.error(error);

  if(error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

   if (error instanceof Sequelize.UniqueConstraintError) {
    return res.status(409).json({
      error: 'Conflito de dados',
      details: error.errors.map((err) => err.message),
    });
  }

  if (error instanceof Sequelize.ValidationError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.errors.map((err) => err.message),
    });
  }

  return res.status(500).json({
    error: 'Erro interno do servidor',
  });

}

export default errorMiddleware;