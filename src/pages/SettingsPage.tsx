import { useEffect, useState } from "react";
import { Alert, Button, Card, Input, Modal, Space, Typography } from "antd";
import { ClockCircleOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { Settings } from "../api/types";
import { date, ErrorNotice, Status } from "../ui";
import { useSession } from "../auth/session";

export default function SettingsPage() {
  const session = useSession(),
    navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(),
    [time, setTime] = useState("19:00"),
    [error, setError] = useState<unknown>(),
    [busy, setBusy] = useState(false);
  async function load() {
    const value = await api<Settings>("/api/me/settings");
    setSettings(value);
    setTime(value.daily_time);
  }
  useEffect(() => {
    void load().catch(setError);
  }, []);
  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(undefined);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  function auth() {
    return action(async () => {
      const data = await api<{ authorization_url: string }>(
        "/auth/feishu/start",
        { method: "POST" },
      );
      window.location.assign(data.authorization_url);
    });
  }
  function transition(name: string) {
    return action(() => api(`/api/me/${name}`, { method: "POST" }));
  }
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">你的每日工作回顾</div>
        <Typography.Title level={2}>把一天的沟通，整理清楚。</Typography.Title>
        <Typography.Paragraph type="secondary">
          在你选定的时间，回顾过去 24 小时的私聊、群内 @你，以及你发出的消息。
        </Typography.Paragraph>
      </div>
      <ErrorNotice error={error} />
      {session.demo && (
        <Alert
          type="warning"
          showIcon
          message="本地演示环境"
          description="此模式使用假身份和演示任务，不读取真实聊天，也不发送飞书消息。"
        />
      )}
      <div className="settings-grid">
        <Card
          title={
            <>
              <ClockCircleOutlined /> 每日总结
            </>
          }
          loading={!settings && !error}
        >
          <p className="muted">总结时间 · 北京时间（Asia/Shanghai）</p>
          <div className="time-setting">
            <Input
              aria-label="每日总结时间"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Button
              disabled={!settings || busy || !time}
              onClick={() =>
                action(() =>
                  api("/api/me/settings", {
                    method: "PATCH",
                    body: JSON.stringify({ daily_time: time }),
                  }),
                )
              }
            >
              保存时间
            </Button>
          </div>
          <p>
            助理状态：
            <Status value={settings?.enabled_status ?? "not_enabled"} />
          </p>
          <p className="muted">下次执行：{date(settings?.next_run_at)}</p>
          <Space wrap>
            <Button
              type="primary"
              disabled={busy || settings?.authorization !== "valid"}
              onClick={() =>
                transition(
                  settings?.enabled_status === "paused" ? "resume" : "enable",
                )
              }
            >
              启用 / 恢复
            </Button>
            <Button
              disabled={busy || settings?.enabled_status !== "enabled"}
              onClick={() => transition("pause")}
            >
              暂停
            </Button>
            <Button
              icon={<ThunderboltOutlined />}
              disabled={
                busy ||
                settings?.authorization !== "valid" ||
                settings?.enabled_status === "disabled"
              }
              onClick={() =>
                action(async () => {
                  const result = await api<{ run_id: string }>("/api/me/runs", {
                    method: "POST",
                    headers: { "Idempotency-Key": crypto.randomUUID() },
                  });
                  navigate(`/runs/${result.run_id}`);
                })
              }
            >
              立即总结
            </Button>
          </Space>
        </Card>
        <Card title="飞书消息授权" loading={!settings && !error}>
          <p>
            <Status value={settings?.authorization ?? "not_connected"} />
          </p>
          <p className="muted">
            登录网页与授权读取消息是两个独立步骤。只有你主动授权后，助理才会处理你的消息。
          </p>
          <Button onClick={auth} disabled={busy || session.demo}>
            授权 / 重新授权
          </Button>
          <hr />
          <p className="muted">
            停用将删除本地保存的飞书凭证，并取消待执行任务。之后需要重新授权。
          </p>
          <Button
            danger
            disabled={
              busy || !settings || settings.authorization === "not_connected"
            }
            onClick={() =>
              Modal.confirm({
                title: "停用个人助理？",
                content: "已在发送中的请求无法撤回，执行记录仍可查看。",
                okText: "停用",
                cancelText: "取消",
                onOk: () => transition("disable"),
              })
            }
          >
            停用并删除凭证
          </Button>
        </Card>
      </div>
      <Card className="scope-card">
        <Typography.Text strong>消息范围与隐私</Typography.Text>
        <p className="muted">
          总结只发给你本人。管理员可以查看授权状态和执行结果，不能查看你的聊天正文或总结内容。部分消息读取失败时，会明确标记覆盖不完整。
        </p>
      </Card>
    </>
  );
}
