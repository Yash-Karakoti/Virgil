/** @format */

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";
import {
  getReports,
  getReportById,
  createReport,
} from "../reports.controller";
import { reportService } from "../../services/reports.service";

jest.mock("../../services/reports.service", () => ({
  reportService: {
    getReports: jest.fn(),
    getReportById: jest.fn(),
    createReport: jest.fn(),
  },
}));

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
}

const validBody = {
  title: "Pothole on MG Road",
  description: "Deep pothole near the bus stop causing slow traffic.",
  image: "data:image/jpeg;base64,Zm9v",
  location: [28.6139, 77.209],
  category: "ROAD_ISSUE",
};

describe("reports.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getReports", () => {
    test("returns list of reports", async () => {
      (reportService.getReports as jest.Mock).mockResolvedValue([
        { id: "r1", title: "Issue" },
      ]);

      const res = mockRes();
      await getReports({} as Request, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data).toHaveLength(1);
    });

    test("returns 500 on service failure", async () => {
      (reportService.getReports as jest.Mock).mockRejectedValue(
        new Error("db down")
      );

      const res = mockRes();
      await getReports({} as Request, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getReportById", () => {
    test("returns 404 when report does not exist", async () => {
      (reportService.getReportById as jest.Mock).mockResolvedValue(null);

      const req = { params: { reportId: "missing" } } as unknown as Request;
      const res = mockRes();

      await getReportById(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("returns report when found", async () => {
      (reportService.getReportById as jest.Mock).mockResolvedValue({
        id: "r1",
        title: "Found",
      });

      const req = { params: { reportId: "r1" } } as unknown as Request;
      const res = mockRes();

      await getReportById(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.title).toBe("Found");
    });
  });

  describe("createReport", () => {
    test("returns 401 when user is not authenticated", async () => {
      const req = { body: validBody } as Request;
      const res = mockRes();

      await createReport(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(reportService.createReport).not.toHaveBeenCalled();
    });

    test("returns 400 on validation error", async () => {
      const req = {
        user: { id: "u1" },
        body: { ...validBody, location: [0, 0] },
      } as Request;
      const res = mockRes();

      await createReport(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("returns 201 for new report", async () => {
      (reportService.createReport as jest.Mock).mockResolvedValue({
        isDuplicate: false,
        report: { id: "r-new", title: validBody.title },
        merged: false,
      });

      const req = { user: { id: "u1" }, body: validBody } as Request;
      const res = mockRes();

      await createReport(req, res, jest.fn());

      expect(reportService.createReport).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json.mock.calls[0][0].data.deduplication.isDuplicate).toBe(
        false
      );
    });

    test("returns 201 with deduplication payload when merged", async () => {
      (reportService.createReport as jest.Mock).mockResolvedValue({
        isDuplicate: true,
        report: { id: "r-dup" },
        originalReport: { id: "r-original" },
        merged: true,
      });

      const req = { user: { id: "u1" }, body: validBody } as Request;
      const res = mockRes();

      await createReport(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json.mock.calls[0][0].data.deduplication.isDuplicate).toBe(true);
      expect(res.json.mock.calls[0][0].data.deduplication.merged).toBe(true);
    });
  });
});