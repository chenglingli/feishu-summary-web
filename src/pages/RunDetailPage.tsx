import { useEffect, useState } from "react";
import { Card, Descriptions, Timeline, Typography, Alert } from "antd";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Run } from "../api/types";
import { date, ErrorNotice, label, Status } from "../ui";
export default function RunDetailPage({ admin = false }: { admin?: boolean }) {
  const { id } = useParams();
  const [run, setRun] = useState<Run>(),
    [error, setError] = useState<unknown>();
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api<Run>(
          `/api/${admin ? "admin" : "me"}/runs/${id}`,
        );
        if (active) {
          setRun(data);
          setError(undefined);
        }
      } catch (e) {
        if (active) setError(e);
      }
    }
    void load();
    const timer = setInterval(() => {
      if (
        !run ||
        [
          "queued",
          "collecting",
          "summarizing",
          "sending",
          "ready_to_send",
          "retry_wait",
        ].includes(run.execution_status)
      )
        void load();
    }, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id, admin, run?.execution_status]);
  return (
    <>
      <div className="page-heading">
        <Typography.Title level={2}>任务详情</Typography.Title>
        <Typography.Text type="secondary" copyable>
          {id}
        </Typography.Text>
      </div>
      <ErrorNotice error={error} />
      {run && (
        <>
          <Card>
            <Descriptions
              column={{ xs: 1, md: 2 }}
              items={[
                { key: "user", label: "用户", children: run.user.name },
                { key: "kind", label: "类型", children: label(run.kind) },
                {
                  key: "execution",
                  label: "执行",
                  children: <Status value={run.execution_status} />,
                },
                {
                  key: "coverage",
                  label: "消息覆盖",
                  children: <Status value={run.coverage_status} />,
                },
                {
                  key: "delivery",
                  label: "报告送达",
                  children: <Status value={run.delivery_status} />,
                },
                {
                  key: "window",
                  label: "统计窗口",
                  children: `${date(run.window_start)} 至 ${date(run.window_end)}（不含）`,
                },
                {
                  key: "count",
                  label: "采集计数",
                  children:
                    Object.entries(run.collection_counts ?? {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ") || "—",
                },
                {
                  key: "retries",
                  label: "重试次数",
                  children: run.retry_count ?? 0,
                },
              ]}
            />
          </Card>
          {run.safe_error && (
            <Alert
              type="warning"
              message={
                run.safe_error === "DEMO_NOT_SENT"
                  ? "演示任务完成，未向飞书发送消息"
                  : `错误分类：${run.safe_error}`
              }
            />
          )}
          {!!run.coverage_issues?.length && (
            <Alert
              type="info"
              message="覆盖说明"
              description={run.coverage_issues.join(" · ")}
            />
          )}
          <Card title="执行时间线">
            <Timeline
              items={run.steps?.map((step, i) => ({
                key: i,
                children: `${date(step.at)} · ${label(step.stage)}`,
              }))}
            />
          </Card>
          <Card title="发送分段">
            {run.delivery_parts?.length ? (
              run.delivery_parts.map((p) => (
                <p key={p.part}>
                  第 {p.part} 段 · <Status value={p.status} />
                </p>
              ))
            ) : (
              <span className="muted">尚无发送记录</span>
            )}
          </Card>
          <p className="muted">
            此页面仅展示运行元数据，不保存或显示聊天正文、模型输入和总结正文。
          </p>
        </>
      )}
    </>
  );
}
