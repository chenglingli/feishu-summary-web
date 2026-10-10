import { useEffect, useState } from "react";
import { Alert } from "antd";
import { api } from "../api/client";
import type { Health } from "../api/types";

export default function HealthStatus() {
  const [health, setHealth] = useState<Health>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await api<Health>("/api/admin/health");
        if (active) {
          setHealth(result);
          setFailed(false);
        }
      } catch {
        if (active) {
          setHealth(undefined);
          setFailed(true);
        }
      }
    }
    void load();
    // Monitoring polling must not extend the administrator's idle session.
    const timer = setInterval(() => void load(), 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  if (failed)
    return (
      <Alert
        type="warning"
        showIcon
        message="无法获取运行状态，请刷新页面重试"
      />
    );
  if (!health) return null;
  return (
    <Alert
      showIcon
      type={
        health.status === "ok" && !health.maintenance ? "success" : "warning"
      }
      message={
        health.maintenance
          ? "系统处于维护模式"
          : health.status === "ok"
            ? "任务服务运行正常"
            : "任务服务需要检查"
      }
      description={`最近心跳：${health.runner_lag_seconds === null ? "尚未收到" : `${health.runner_lag_seconds} 秒前`} · 排队 ${health.queued} · 超过10分钟 ${health.overdue} · 24小时内送达不确定 ${health.delivery_unknown_24h}`}
    />
  );
}
