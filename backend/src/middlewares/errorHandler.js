

function errorMiddleware(error, req, res, next) {
  console.error("Erro na API:", error.message);

  // Por enquanto, erros lançados pelo serviço retornam 400.
  // Depois podemos diferenciar validações, recursos inexistentes
  // e erros internos com códigos específicos.
  return res.status(400).json({
    error: error.message,
  });
}

export default errorMiddleware;
