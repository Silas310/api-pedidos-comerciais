import AppError from './AppError';


function errorMiddleware(error, req, res, next) {
  console.error(error);

  if(error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  return res.status(500).json({
    error: 'Erro interno do servidor',
  });
}