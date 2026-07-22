import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArchiveInterpretationView } from "@/components/ArchiveInterpretationView";
import { MethodResultActions } from "@/components/MethodResultActions";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import {
  archiveEntryLabel,
  getArchiveEntry,
  hasArchiveInterpretation,
} from "@/lib/archive";
import { colors } from "@/theme/tokens";

export function ArchiveEntryPage() {
  const { id } = useParams<{ id: string }>();
  const entry = id ? getArchiveEntry(id) : null;

  const copilotReport = useMemo(
    () =>
      entry
        ? {
            entryId: entry.id,
            source: entry.source,
            methodId: entry.methodId,
            title: entry.title,
            summary: entry.summary,
            body: entry.body,
            generatedAt: entry.createdAt,
          }
        : null,
    [entry],
  );
  useRegisterMethodCopilotReport(copilotReport);

  if (!entry) {
    return (
      <Page title="占卜记录">
        <p>未找到该条记录</p>
        <Link to="/profile" style={{ color: colors.gold }}>
          返回档案
        </Link>
      </Page>
    );
  }

  return (
    <Page title={entry.title} wide>
      <p className="archive-entry-meta muted">
        {archiveEntryLabel(entry)} · {new Date(entry.createdAt).toLocaleString("zh-CN")}
      </p>

      <MethodResultActions
        label={hasArchiveInterpretation(entry) ? "继续 AI 解析" : "AI 解析报告"}
      />

      <section className="archive-entry-report" aria-label="占卜报告">
        <h3>报告</h3>
        <pre className="archive-entry-body">{entry.body}</pre>
      </section>

      {entry.interpretation && <ArchiveInterpretationView turns={entry.interpretation} />}

      <Link to="/profile" className="archive-entry-back" style={{ color: colors.gold }}>
        返回档案
      </Link>
    </Page>
  );
}
