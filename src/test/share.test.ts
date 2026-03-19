import { describe, it, expect, vi } from "vitest";
import { buildLandingUrl } from "../lib/share";

// Mock import.meta.env
vi.mock("../lib/share", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    getSystemBaseUrl: () => "https://akwantuo.com",
  };
});

describe("buildLandingUrl", () => {
  it("should return URL with slug if provided", () => {
    const url = buildLandingUrl({ slug: "moses-tours" });
    expect(url).toBe("http://localhost:3000/moses-tours");
  });

  it("should return URL with slugified display name if slug is missing", () => {
    const url = buildLandingUrl({ displayName: "Moses Tours" });
    expect(url).toBe("http://localhost:3000/moses-tours");
  });

  it("should fallback to 'tour' if both slug and display name are missing", () => {
    const url = buildLandingUrl({});
    expect(url).toBe("http://localhost:3000/tour");
  });

  it("should handle empty or whitespace display names", () => {
    const url = buildLandingUrl({ displayName: "   " });
    expect(url).toBe("http://localhost:3000/tour");
  });
});
