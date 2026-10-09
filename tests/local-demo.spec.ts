import { expect, test } from "@playwright/test";
// Requires the explicitly enabled local demo backend and runner; never runs against production.
test("employee settings, manual task, second-user isolation, admin visibility", async ({
  browser,
}) => {
  const a = await browser.newContext();
  const page = await a.newPage();
  await page.goto("/");
  await expect(page.getByText("本地演示模式", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "使用飞书登录" })).toHaveCount(0);
  await page.getByRole("link", { name: "员工 A 演示" }).click();
  await expect(
    page.getByRole("heading", { name: "把一天的沟通，整理清楚。" }),
  ).toBeVisible();
  if (page.url().startsWith("https://")) {
    const cookie = (await a.cookies()).find(
      (value) => value.name === "__Host-session",
    );
    expect(cookie).toMatchObject({
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
    });
  }
  await page.getByLabel("每日总结时间").fill("20:15");
  await page.getByRole("button", { name: "保存时间" }).click();
  await expect(page.getByLabel("每日总结时间")).toHaveValue("20:15");
  await page.getByRole("button", { name: "立即总结" }).click();
  await expect(page.getByRole("heading", { name: "任务详情" })).toBeVisible();
  await expect(page.getByText("演示任务完成，未向飞书发送消息")).toBeVisible({
    timeout: 30000,
  });
  const taskPath = new URL(page.url()).pathname;
  const b = await browser.newContext();
  const other = await b.newPage();
  await other.goto("/auth/dev/login/demo-b");
  await other.goto(taskPath);
  await expect(other.getByText("任务不存在")).toBeVisible();
  await other.goto("/admin/users");
  await expect(other.getByText("无访问权限")).toBeVisible();
  const admin = await browser.newContext();
  const monitor = await admin.newPage();
  await monitor.goto("/auth/dev/login/demo-admin");
  await expect(
    monitor.getByRole("heading", { name: "已接入用户" }),
  ).toBeVisible();
  await expect(
    monitor.getByRole("cell", { name: /演示用户 demo-a/ }),
  ).toBeVisible();
  await expect(
    monitor.getByRole("cell", { name: /演示用户 demo-b/ }),
  ).toBeVisible();
  await expect(
    monitor.getByText(/任务服务运行正常|任务服务需要检查/),
  ).toBeVisible();
  await monitor.getByRole("link", { name: "查看任务" }).first().click();
  await expect(monitor.getByLabel("按用户 ID 筛选")).not.toHaveValue("");
  await expect(monitor.getByLabel("开始日期")).toBeVisible();
  await expect(monitor.getByLabel("结束日期")).toBeVisible();
  await monitor.goto("/admin" + taskPath);
  await expect(
    monitor.getByText("演示任务完成，未向飞书发送消息"),
  ).toBeVisible();
  await page.screenshot({
    path: "/private/tmp/feishu-summary-task.png",
    fullPage: true,
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "把一天的沟通，整理清楚。" }),
  ).toBeVisible();
  await page.screenshot({
    path: "/private/tmp/feishu-summary-settings.png",
    fullPage: true,
  });
  await a.close();
  await b.close();
  await admin.close();
});
