const messageList = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict'
};

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string = messageList[status]) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

export default HttpError;
