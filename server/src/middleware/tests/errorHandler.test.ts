import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import { RouteNotFoundError, globalErrorHandler } from "../errorHandler";
import createError from "http-errors";

describe("Error Handler Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn() as NextFunction;
  });

  describe("RouteNotFoundError", () => {
    it("should pass 404 error to next middleware", () => {
      RouteNotFoundError(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          message: "Route not found",
        })
      );
    });
  });

  describe("GlobalErrorHandler", () => {
    it("should handle errors with status code", () => {
      const testError = createError(400, "Bad Request");
      globalErrorHandler(
        testError,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: "Bad Request",
      });
    });

    it("should default to 500 for errors without status", () => {
      const testError = new Error("Test error");
      globalErrorHandler(
        testError,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: "Test error",
      });
    });
  });
});
