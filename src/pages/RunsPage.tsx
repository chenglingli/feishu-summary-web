import { useEffect, useState, useRef } from "react";
import { Button, Card, Input, Select, Space, Table, Typography } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { dateRange } from "../api/dateRange";
import type { Page, Run } from "../api/types";
import { date, ErrorNotice, label, Status } from "../ui";

export default function RunsPage({ admin = false }: { admin?: boolean }) {
  const [searchParams] = useSearchParams();
  const requestVersion = useRef(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateThrough, setDateThrough] = useState("");
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [data, setData] = useState<Page<Run>>(),
    [page, setPage] = useState(1),
    [status, setStatus] = useState<string>(),
    [kind, setKind] = useState<string>(),
    [coverage, setCoverage] = useState<string>(),
    [delivery, setDelivery] = useState<string>(),
    [userId, setUserId] = useState(searchParams.get("user_id") ?? ""),
    [error, setError] = useState<unknown>(),
    [loading, setLoading] = useState(false);
  const root = admin ? "/admin/runs" : "/runs";
  useEffect(() => {
    setUserId(searchParams.get("user_id") ?? "");
    setPage(1);
  }, [searchParams]);
  async function load() {
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set("execution_status", status);
      if (kind) params.set("kind", kind);
      if (coverage) params.set("coverage_status", coverage);
      if (delivery) params.set("delivery_status", delivery);
      if (admin && userId) params.set("user_id", userId);
      if (range) {
        params.set("from", range.from);
        params.set("to", range.to);
      }
      const result = await api<Page<Run>>(
        `/api/${admin ? "admin" : "me"}/runs?${params}`,
      );
      if (version === requestVersion.current) {
        setData(result);
        setError(undefined);
      }
    } catch (e) {
      if (version === requestVersion.current) setError(e);
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    return () => {
      requestVersion.current += 1;
    };
  }, [page, status, kind, coverage, delivery, userId, admin, range]);
  useEffect(() => {
    if (
      !data?.items.some((x) =>
        [
          "queued",
          "collecting",
          "summarizing",
          "sending",
          "ready_to_send",
          "retry_wait",
        ].includes(x.execution_status),
      )
    )
      return;
    const id = window.setInterval(() => {
      void load();
    }, 10000);
    return () => clearInterval(id);
  }, [data, page, status, kind, coverage, delivery, userId, admin, range]);
  const columns = [
    ...(admin
      ? [
          {
            title: "用户",
            key: "user",
            render: (_: unknown, row: Run) => (
              <>
                {row.user.name}
                <div className="muted small">{row.user.open_id}</div>
              </>
            ),
          },
        ]
      : []),
    {
      title: "计划时间",
      dataIndex: "scheduled_at",
      render: (v: string, row: Run) => (
        <Link to={`${root}/${row.run_id}`}>{date(v)}</Link>
      ),
    },
    { title: "类型", dataIndex: "kind", render: label },
    ...(
      ["execution_status", "coverage_status", "delivery_status"] as const
    ).map((key, i) => ({
      title: ["执行", "消息覆盖", "报告送达"][i],
      dataIndex: key,
      render: (v: string) => <Status value={v} />,
    })),
    {
      title: "耗时",
      dataIndex: "duration_ms",
      render: (v: number | null) =>
        v === null ? "—" : `${Math.round(v / 1000)} 秒`,
    },
  ];
  const select = (
    placeholder: string,
    values: string[],
    value: string | undefined,
    setter: (s: string | undefined) => void,
  ) => (
    <Select
      allowClear
      placeholder={placeholder}
      value={value}
      style={{ minWidth: 125 }}
      options={values.map((value) => ({ value, label: label(value) }))}
      onChange={(v) => {
        setter(v);
        setPage(1);
      }}
    />
  );
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">{admin ? "管理后台" : "我的助理"}</div>
        <Typography.Title level={2}>任务执行记录</Typography.Title>
        <p className="muted">
          默认最近 7 天，可选择最多 30 天 ·
          北京时间。执行、消息覆盖和送达状态分别记录。
        </p>
      </div>
      <ErrorNotice error={error} />
      <Card>
        <Space wrap className="filters">
          <Input
            type="date"
            aria-label="开始日期"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            type="date"
            aria-label="结束日期"
            value={dateThrough}
            onChange={(e) => setDateThrough(e.target.value)}
          />
          <Button
            onClick={() => {
              try {
                setRange(dateRange(dateFrom, dateThrough));
                setPage(1);
                setError(undefined);
              } catch (e) {
                setError(e);
              }
            }}
          >
            查询日期
          </Button>
          <Button
            onClick={() => {
              setRange(null);
              setDateFrom("");
              setDateThrough("");
              setPage(1);
            }}
          >
            最近 7 天
          </Button>
          {select(
            "执行状态",
            [
              "queued",
              "collecting",
              "summarizing",
              "succeeded",
              "failed",
              "cancelled",
              "missed",
              "needs_reauth",
              "delivery_unknown",
            ],
            status,
            setStatus,
          )}
          {select("任务类型", ["manual", "scheduled"], kind, setKind)}
          {select(
            "覆盖状态",
            ["unknown", "complete", "partial", "no_data"],
            coverage,
            setCoverage,
          )}
          {select(
            "送达状态",
            [
              "not_started",
              "sending",
              "delivered",
              "partial",
              "failed",
              "unknown",
            ],
            delivery,
            setDelivery,
          )}
          {admin && (
            <Input.Search
              aria-label="按用户 ID 筛选"
              placeholder="用户 ID"
              allowClear
              onSearch={(v) => {
                setUserId(v);
                setPage(1);
              }}
            />
          )}
          <Button onClick={load}>刷新</Button>
        </Space>
        <Table
          rowKey="run_id"
          columns={columns}
          dataSource={data?.items}
          loading={loading}
          scroll={{ x: 850 }}
          pagination={{
            current: page,
            pageSize: 20,
            total: data?.total,
            showSizeChanger: false,
            onChange: setPage,
          }}
          locale={{ emptyText: "当前筛选条件下暂无任务" }}
        />
      </Card>
    </>
  );
}
