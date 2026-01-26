// this is general error
export class appError extends Error{
     public readonly statusCode:number;
     public readonly isOperational:boolean;
     public readonly code:string;

     constructor(
        message:string,
        statusCode:number=500,
        code:string="INTERNAL_SERVER_ERROR",
        isOperational:boolean=true
     ){
      super(message);
      this.isOperational=isOperational;
      this.code=code;
      this.statusCode=statusCode;


      Error.captureStackTrace(this, this.constructor);
      Object.setPrototypeOf(this, appError.prototype)
     }
}

// validation errors
export class validationErrors extends appError{
   public readonly errors:Record<string, string>[];


   constructor(
    message:string="Validation error", errors:Record<string, string>[]=[]
   ){
    super(message),
    this.errors=errors,
    Object.setPrototypeOf(this, validationErrors.prototype)
   }
}

// Unauthorized error
export class UnauthorizedError extends appError{

   constructor(message:string="UnAuthorized Access"){
      super(message, 401, "UNAUTHORIZED", true),
      Object.setPrototypeOf(this, UnauthorizedError.prototype)
   }
}

// Forbidden error
export class ForbiddenError extends appError{

   constructor(message:string="Forbidden Access"){
      super(message, 403, "FORBIDDEN", true),
      Object.setPrototypeOf(this,ForbiddenError.prototype)
   }
}

// NotFound error
export class NotFoundError extends appError{

   constructor(message:string="Not Found"){
      super(message, 404, "NOT_FOUND", true),
      Object.setPrototypeOf(this,NotFoundError.prototype)
   }
}

// Conflict error
export class ConflictError extends appError{

   constructor(message:string="Conflict"){
      super(message, 409, "CONFLICT", true),
      Object.setPrototypeOf(this,ConflictError.prototype)
   }
}


// Too Many Requests error
export class TooManyRequestsError extends appError{

   constructor(message:string="Too many requests"){
      super(message, 429, "TOO_MANY_REQUESTS", true),
      Object.setPrototypeOf(this,TooManyRequestsError.prototype)
   }
}


// Insufficient error
export class InsufficientCreditsError extends appError{

   constructor(message:string="Insufficient credits"){
      super(message, 402, "INSUFFICIENT_CREDITS", true),
      Object.setPrototypeOf(this,InsufficientCreditsError.prototype)
   }
}

// External services error
export class ExternalServiceError extends appError{

   constructor(message:string="External services"){
      super(message, 502, "EXTERNAL_SERVICE_ERROR", true),
      Object.setPrototypeOf(this,ExternalServiceError.prototype)
   }
}