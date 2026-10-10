import { expect, it } from "vitest";
import { dateRange } from "./dateRange";
it("includes the full selected last day in Beijing time", () => {
  expect(dateRange("2026-10-09", "2026-10-09")).toEqual({
    from: "2026-10-08T16:00:00.000Z",
    to: "2026-10-09T16:00:00.000Z",
  });
});
it("allows thirty days but rejects thirty one and reversed ranges", () => {
  expect(() => dateRange("2026-10-01", "2026-10-30")).not.toThrow();
  expect(() => dateRange("2026-10-01", "2026-10-31")).toThrow();
  expect(() => dateRange("2026-10-09", "2026-10-08")).toThrow();
});
