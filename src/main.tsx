import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Alert,
  Button,
  ConfigProvider,
  Layout,
  Menu,
  Result,
  Spin,
  Typography,
} from "antd";
import zhCN from "antd/locale/zh_CN";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { api, ApiError, setCsrfToken } from "./api/client";
import type { SessionInfo } from "./api/types";
import { SessionContext } from "./auth/session";
import SettingsPage from "./pages/SettingsPage";
import RunsPage from "./pages/RunsPage";
import RunDetailPage from "./pages/RunDetailPage";
import UsersPage from "./pages/UsersPage";
import "./style.css";

function App() {
  const [session, setSession] = useState<SessionInfo | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const location = useLocation();
  useEffect(() => {
    api<SessionInfo>("/api/session")
      .then((value) => {
        setSession(value);
        setCsrfToken(value.csrf_token);
      })
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) setError(e.message);
      })
      .finally(() => setLoading(false));
    const expire = () => setSession(null);
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, []);
  useEffect(() => {
    if (!session) return;
    let last = 0;
    const activity = () => {
      if (Date.now() - last < 60000) return;
      last = Date.now();
      void api("/api/session/activity", { method: "POST" }).catch(() => {});
    };
    window.addEventListener("pointerdown", activity);
    window.addEventListener("keydown", activity);
    return () => {
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
    };
  }, [session]);
  if (loading)
    return (
      <div className="loading">
        <Spin size="large" />
      </div>
    );
  if (!session)
    return (
      <main className="login">
        <div className="brand">◈ 会话回顾</div>
        <div className="eyebrow">FEISHU PERSONAL ASSISTANT</div>
        <Typography.Title>
          让重要的事，
          <br />
          留在一天的最后。
        </Typography.Title>
        <p>
          每天一份属于你的沟通回顾。
          <br />
          要点、决定和待办，集中送达飞书。
        </p>
        {error && <Alert type="error" message={error} />}
        <Button size="large" type="primary" href="/auth/login/start">
          使用飞书登录
        </Button>
        <p className="muted small">
          仅限公司已开放的员工使用。登录后可独立授权消息访问。
        </p>
      </main>
    );
  const denied = (
    <Result
      status="403"
      title="无访问权限"
      subTitle="请联系应用管理员确认可用范围。"
    />
  );
  const menu = [
    ...(session.capabilities.personal
      ? [
          { key: "/", label: <Link to="/">个人设置</Link> },
          { key: "/runs", label: <Link to="/runs">我的任务</Link> },
        ]
      : []),
    ...(session.capabilities.admin
      ? [
          {
            key: "/admin/users",
            label: <Link to="/admin/users">授权用户</Link>,
          },
          { key: "/admin/runs", label: <Link to="/admin/runs">任务监控</Link> },
        ]
      : []),
  ];
  return (
    <SessionContext.Provider value={session}>
      <Layout className="app">
        <Layout.Header>
          <Link className="brand" to="/">
            ◈ 会话回顾
          </Link>
          <div className="account">
            <span>{session.identity.name}</span>
            <Button
              onClick={async () => {
                try {
                  await api("/api/logout", { method: "POST" });
                  setSession(null);
                  setCsrfToken("");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "退出失败");
                }
              }}
            >
              退出登录
            </Button>
          </div>
        </Layout.Header>
        <div className="body">
          <aside>
            <Menu
              selectedKeys={[
                location.pathname.startsWith("/admin/runs")
                  ? "/admin/runs"
                  : location.pathname.startsWith("/runs")
                    ? "/runs"
                    : location.pathname,
              ]}
              items={menu}
            />
            <div className="sidebar-note">
              个人信息 · 仅本人可见
              <br />
              所有时间以北京时间显示
            </div>
          </aside>
          <Layout.Content>
            {error && <Alert type="error" message={error} />}
            <Routes>
              <Route
                path="/"
                element={
                  session.capabilities.personal ? (
                    <SettingsPage />
                  ) : (
                    <Navigate to="/admin/users" replace />
                  )
                }
              />
              <Route
                path="/runs"
                element={session.capabilities.personal ? <RunsPage /> : denied}
              />
              <Route
                path="/runs/:id"
                element={
                  session.capabilities.personal ? <RunDetailPage /> : denied
                }
              />
              <Route
                path="/admin/users"
                element={session.capabilities.admin ? <UsersPage /> : denied}
              />
              <Route
                path="/admin/runs"
                element={
                  session.capabilities.admin ? <RunsPage admin /> : denied
                }
              />
              <Route
                path="/admin/runs/:id"
                element={
                  session.capabilities.admin ? <RunDetailPage admin /> : denied
                }
              />
              <Route
                path="*"
                element={<Result status="404" title="页面不存在" />}
              />
            </Routes>
          </Layout.Content>
        </div>
      </Layout>
    </SessionContext.Provider>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#365bcc",
          borderRadius: 10,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          colorBgLayout: "#f4f6fa",
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
