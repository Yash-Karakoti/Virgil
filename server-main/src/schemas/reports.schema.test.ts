/** @format */

import { describe, expect, test } from "@jest/globals";
import { CreateReportSchema, NearbyIssuesSchema } from "./reports.schema";

describe("CreateReportSchema", () => {
  const base = {
    title: "Pothole on Main Road",
    description: "Large pothole causing traffic slowdown near the market.",
    image: "data:image/jpeg;base64,abc",
    location: [28.6139, 77.209] as [number, number],
    category: "ROAD_ISSUE" as const,
  };

  test("accepts valid report", () => {
    expect(CreateReportSchema.safeParse(base).success).toBe(true);
  });

  test("rejects missing title", () => {
    const { title: _, ...rest } = base;
    expect(CreateReportSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects missing geolocation placeholder", () => {
    expect(
      CreateReportSchema.safeParse({ ...base, location: [0, 0] }).success
    ).toBe(false);
  });

  test("rejects invalid category", () => {
    expect(
      CreateReportSchema.safeParse({ ...base, category: "ALIEN_INVASION" })
        .success
    ).toBe(false);
  });

  test("accepts all report categories", () => {
    for (const category of [
      "ROAD_ISSUE",
      "GARBAGE",
      "STREET_LIGHT",
      "WATER_LEAK",
      "NOISE_COMPLAINT",
      "OTHER",
    ] as const) {
      expect(CreateReportSchema.safeParse({ ...base, category }).success).toBe(
        true
      );
    }
  });
});

describe("NearbyIssuesSchema", () => {
  test("applies default radius", () => {
    const parsed = NearbyIssuesSchema.parse({ lat: 28.61, lng: 77.2 });
    expect(parsed.radius).toBe(5);
  });

  test("rejects out-of-range coordinates", () => {
    expect(
      NearbyIssuesSchema.safeParse({ lat: 120, lng: 77.2 }).success
    ).toBe(false);
    expect(
      NearbyIssuesSchema.safeParse({ lat: 28.61, lng: 200 }).success
    ).toBe(false);
  });

  test("enforces radius bounds", () => {
    expect(
      NearbyIssuesSchema.safeParse({ lat: 28.61, lng: 77.2, radius: 0.05 })
        .success
    ).toBe(false);
    expect(
      NearbyIssuesSchema.safeParse({ lat: 28.61, lng: 77.2, radius: 150 })
        .success
    ).toBe(false);
  });
});