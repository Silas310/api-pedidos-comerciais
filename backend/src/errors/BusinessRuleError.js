import AppError from './AppError.js';


class BusinessRuleError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}


export default BusinessRuleError;