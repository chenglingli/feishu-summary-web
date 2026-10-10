import { Alert, Button, Space } from "antd";
import type { components } from "../api/generated";
export type LoginOptions = components["schemas"]["LoginOptions"];

export function LoginActions({ options }: { options: LoginOptions | null }) {
  if (!options)
    return (
      <Alert type="warning" message="无法获取登录配置，请刷新页面重试。" />
    );
  if (options.demo)
    return (
      <>
        <Alert
          type="info"
          message="本地演示模式"
          description="选择演示账号进入，不需要飞书登录。不会读取或发送真实消息。"
        />
        <Space wrap>
          {options.accounts.map((account) => (
            <Button
              key={account.login_url}
              type="primary"
              href={account.login_url}
            >
              {account.label}
            </Button>
          ))}
        </Space>
        <p className="muted small">
          不同浏览器的登录状态独立；同一浏览器的标签页共享账号。
        </p>
      </>
    );
  return options.feishu_enabled ? (
    <Button size="large" type="primary" href="/auth/login/start">
      使用飞书登录
    </Button>
  ) : (
    <Alert type="warning" message="飞书登录尚未配置，请联系管理员。" />
  );
}
