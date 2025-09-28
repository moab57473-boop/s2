import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export interface CustomRequest extends ExpressRequest {
  file?: Express.Multer.File;
}

export type Request = CustomRequest;
export type Response = ExpressResponse;

export interface ErrorResponse {
  message: string;
  errors?: unknown[];
}