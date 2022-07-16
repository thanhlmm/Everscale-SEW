export abstract class AppError extends Error {}

export class NotSupportOnProdEnvError extends AppError {
  message = 'Not support on prod env'
}

export class NotSupportTypeError extends AppError {
  message = 'Not support type'
}

export class ConnectionNotSelectedError extends AppError {
  message = 'Connection not selected'
}
