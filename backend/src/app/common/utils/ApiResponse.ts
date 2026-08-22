import type { Response } from "express";

/**
 * Standardised API response helper — static methods that call
 * res.status().json() with a consistent { success, message, data } shape.
 */
export class ApiResponse {
  static ok<T>(res: Response, message: string, data?: T): void {
    res.status(200).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static created<T>(res: Response, message: string, data?: T): void {
    res.status(201).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static noContent(res: Response): void {
    res.status(204).end();
  }
}
