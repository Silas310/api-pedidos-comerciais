class AppError extends Error {
  // Essa classe é responsável por criar erros personalizados
  // que podem ser lançados durante a execução da aplicação
  constructor(message, statusCode = 500) { // Construtor usa mensagem e erro 500 padrao pare erros internos
    super(message);
    this.name = this.constructor.name; // Define o nome do erro como o nome da classe instanciada
    this.statusCode = statusCode; // Define o código de status HTTP do erro
    this.isOperational = true; // Define que o erro é operacional, ou seja, esperado e tratado
    Error.captureStackTrace(this, this.constructor); // Captura a stack trace do erro para facilitar o debug
  }
}


export default AppError;