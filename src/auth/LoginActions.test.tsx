import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LoginActions } from "./LoginActions";
afterEach(cleanup);
it("demo offers local identities without a real OAuth link", () => {
  render(
    <LoginActions
      options={{
        demo: true,
        feishu_enabled: false,
        accounts: [
          { label: "员工 A 演示", login_url: "/auth/dev/login/demo-a" },
        ],
      }}
    />,
  );
  expect(screen.getByRole("link", { name: "员工 A 演示" })).toHaveAttribute(
    "href",
    "/auth/dev/login/demo-a",
  );
  expect(screen.queryByRole("link", { name: "使用飞书登录" })).toBeNull();
});
it("unconfigured real login is never a clickable OAuth redirect", () => {
  render(
    <LoginActions
      options={{ demo: false, feishu_enabled: false, accounts: [] }}
    />,
  );
  expect(screen.getByText("飞书登录尚未配置，请联系管理员。")).toBeVisible();
  expect(screen.queryByRole("link")).toBeNull();
});
