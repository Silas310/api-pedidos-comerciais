import  AppError from './AppError.js';


class ValidationError extends AppError {
  // Classe responsável por criar erros de validação personalizados
  // validação de dados de entrada, como campos obrigatórios, formatos inválidos, etc.
  constructor(message) {
    super(message, 400); // Chama o construtor da classe pai com a mensagem e o código de status 400 (Bad Request)
  }
}


export default ValidationError;