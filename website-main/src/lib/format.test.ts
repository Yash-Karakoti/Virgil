import { describe, expect, it } from "vitest";
import { initials, shortId, statusMeta } from "./format";
import { ReportStatus } from "@/types/api";

describe("initials", () => {
  it("returns up to two uppercase letters", () => {
    expect(initials("Gaurav Kumar")).toBe("GK");
    expect(initials("Ada")).toBe("A");
  });
});

describe("shortId", () => {
  it("returns last six characters", () => {
    expect(shortId("report-abc123xyz")).toBe("123xyz");
  });
});

describe("statusMeta", () => {
  it("covers every report status", () => {
    for (const status of Object.values(ReportStatus)) {
      expect(statusMeta[status].label).toBeTruthy();
    }
  });
});