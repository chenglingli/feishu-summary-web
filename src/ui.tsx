import { Alert, Tag } from "antd";
import { ApiError } from "./api/client";
const labels: Record<string, string> = {
  valid: "已授权",
  not_connected: "未授权",
  needs_reauth: "需重新授权",
  removed: "已撤销",
  enabled: "运行中",
  paused: "已暂停",
  disabled: "已停用",
  not_enabled: "未启用",
  queued: "排队中",
  collecting: "读取消息",
  summarizing: "生成总结",
  ready_to_send: "等待发送",
  sending: "发送中",
  succeeded: "执行成功",
  retry_wait: "等待重试",
  failed: "失败",
  cancelled: "已取消",
  missed: "已错过",
  delivery_unknown: "送达待确认",
  unknown: "未知",
  complete: "完整",
  partial: "部分",
  no_data: "无消息",
  not_started: "未发送",
  delivered: "已送达",
  manual: "手动",
  scheduled: "定时",
};
export function label(value: string) {
  return labels[value] ?? value;
}
export function Status({ value }: { value: string }) {
  return (
    <Tag
      color={
        ["succeeded", "valid", "delivered", "enabled"].includes(value)
          ? "green"
          : ["failed", "needs_reauth", "delivery_unknown"].includes(value)
            ? "volcano"
            : "default"
      }
    >
      {label(value)}
    </Tag>
  );
}
export function date(value?: string | null) {
  return value
    ? new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        dateStyle: "short",
        timeStyle: "medium",
        hour12: false,
      }).format(new Date(value))
    : "—";
}
export function ErrorNotice({ error }: { error: unknown }) {
  return error ? (
    <Alert
      showIcon
      type="error"
      message={error instanceof Error ? error.message : "请求失败"}
      description={
        error instanceof ApiError && error.requestId
          ? `请求编号：${error.requestId}`
          : undefined
      }
    />
  ) : null;
}
