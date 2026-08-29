import {Request,RequestHandler,Response,NextFunction} from "express"


const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;