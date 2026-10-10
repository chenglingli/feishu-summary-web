const phases: Record<number, string> = {
  1: "搜索消息",
  2: "等待最新消息索引复查",
  3: "复查最近消息",
  4: "读取消息正文",
  5: "读取会话与话题上下文",
  6: "采集完成",
};

export default function CollectionStatus({
  counts = {},
  collecting,
}: {
  counts?: Record<string, number>;
  collecting: boolean;
}) {
  if (!Object.keys(counts).length)
    return <span>尚无采集计数记录{collecting ? "，等待执行器上报" : ""}</span>;
  const count = (key: string) =>
    counts[key] === undefined ? "—" : String(counts[key]);
  return (
    <div aria-label="消息采集进度">
      {collecting && <div>当前步骤：{phases[counts.phase] ?? "采集中"}</div>}
      <div>已发现消息（去重）：{count("unique")} 条</div>
      <div>正文读取成功：{count("body_read")} 条</div>
      <div>
        正文处理进度：{count("body_attempted")} / {count("body_total")} 条
      </div>
      <div>可总结的目标文本：{count("parsed")} 条</div>
      <div>补充上下文：{count("context")} 条</div>
      <div>
        搜索分页：{count("search_pages")} 页 · 上下文分页：
        {count("history_pages")} 页
      </div>
      <div className="small muted">
        {collecting
          ? "约每 10 秒刷新；搜索期间总数仍会增加，可总结文本数量在采集结束后确定。"
          : "— 表示该任务未记录此项，不能视为 0。"}
      </div>
    </div>
  );
}
