import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import CollectionStatus from "./CollectionStatus";
afterEach(cleanup);
it("distinguishes discovered messages from completed body reads", () => {
  render(
    <CollectionStatus
      collecting
      counts={{
        phase: 4,
        unique: 80,
        body_read: 24,
        body_attempted: 25,
        body_total: 80,
      }}
    />,
  );
  expect(screen.getByText("当前步骤：读取消息正文")).toBeVisible();
  expect(screen.getByText("已发现消息（去重）：80 条")).toBeVisible();
  expect(screen.getByText("正文读取成功：24 条")).toBeVisible();
  expect(screen.getByText("正文处理进度：25 / 80 条")).toBeVisible();
  expect(screen.getByText("可总结的目标文本：— 条")).toBeVisible();
});
it("does not misrepresent missing historical counts as zero", () => {
  render(<CollectionStatus collecting={false} counts={{}} />);
  expect(screen.getByText("尚无采集计数记录")).toBeVisible();
  expect(screen.queryByText(/0 条/)).toBeNull();
});
