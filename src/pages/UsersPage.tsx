import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Page, User } from "../api/types";
import { date, ErrorNotice, label, Status } from "../ui";
export default function UsersPage() {
  const [data, setData] = useState<Page<User>>(),
    [page, setPage] = useState(1),
    [q, setQ] = useState(""),
    [auth, setAuth] = useState<string>("valid"),
    [enabled, setEnabled] = useState<string>(),
    [error, setError] = useState<unknown>(),
    [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    try {
      const query = new URLSearchParams({ q, page: String(page) });
      if (auth) query.set("auth_status", auth);
      if (enabled) query.set("enabled_status", enabled);
      setData(await api(`/api/admin/users?${query}`));
      setError(undefined);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [page, q, auth, enabled]);
  return (
    <>
      <div className="page-heading">
        <div className="eyebrow">管理后台</div>
        <Typography.Title level={2}>已接入用户</Typography.Title>
        <p className="muted">查看个人授权与计划配置。此入口仅提供查询。</p>
      </div>
      <ErrorNotice error={error} />
      <Alert
        showIcon
        type="info"
        message="授权状态基于最近一次检查，飞书侧撤销可能尚未同步。"
      />
      <Card>
        <Space wrap className="filters">
          <Input.Search
            aria-label="搜索用户"
            placeholder="姓名 / open_id"
            allowClear
            onSearch={(v) => {
              setQ(v);
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="授权状态"
            value={auth}
            style={{ width: 150 }}
            onChange={(v) => {
              setAuth(v);
              setPage(1);
            }}
            options={["valid", "needs_reauth", "removed"].map((value) => ({
              value,
              label: label(value),
            }))}
          />
          <Select
            allowClear
            placeholder="启用状态"
            value={enabled}
            style={{ width: 150 }}
            onChange={(v) => {
              setEnabled(v);
              setPage(1);
            }}
            options={["not_enabled", "enabled", "paused", "disabled"].map(
              (value) => ({ value, label: label(value) }),
            )}
          />
          <Button onClick={load}>刷新</Button>
        </Space>
        <Table
          rowKey="user_id"
          loading={loading}
          dataSource={data?.items}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            total: data?.total,
            pageSize: 20,
            showSizeChanger: false,
            onChange: setPage,
          }}
          columns={[
            {
              title: "任务",
              render: (_, user) => (
                <Link
                  to={`/admin/runs?user_id=${encodeURIComponent(user.user_id)}`}
                >
                  查看任务
                </Link>
              ),
            },
            {
              title: "用户",
              render: (_, u) => (
                <>
                  {u.name}
                  <div className="small muted">{u.open_id}</div>
                  <Typography.Text className="small" copyable>
                    {u.user_id}
                  </Typography.Text>
                </>
              ),
            },
            {
              title: "授权",
              dataIndex: "auth_status",
              render: (v) => <Status value={v} />,
            },
            {
              title: "助理状态",
              dataIndex: "enabled_status",
              render: (v) => <Status value={v} />,
            },
            { title: "每日时间", dataIndex: "daily_time" },
            { title: "下次执行", dataIndex: "next_run_at", render: date },
            {
              title: "首次授权",
              dataIndex: "first_authorized_at",
              render: date,
            },
            {
              title: "最近授权",
              dataIndex: "last_authorized_at",
              render: date,
            },
            { title: "最近检查", dataIndex: "auth_checked_at", render: date },
            {
              title: "最近结果",
              dataIndex: "latest_run_result",
              render: (v) => (v ? <Status value={v} /> : "—"),
            },
          ]}
        />
      </Card>
    </>
  );
}
