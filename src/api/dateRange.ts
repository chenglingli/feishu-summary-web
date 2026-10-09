/** Calendar dates are Beijing dates, regardless of the browser's local timezone. */
export function dateRange(from: string, through: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(through))
    throw new Error("请选择开始和结束日期");
  const start = new Date(`${from}T00:00:00+08:00`);
  const end = new Date(
    new Date(`${through}T00:00:00+08:00`).getTime() + 86400000,
  );
  const duration = end.getTime() - start.getTime();
  if (!Number.isFinite(duration) || duration <= 0 || duration > 30 * 86400000)
    throw new Error("查询范围须为 1 至 30 天");
  return { from: start.toISOString(), to: end.toISOString() };
}
