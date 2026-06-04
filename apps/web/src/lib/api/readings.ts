import type { QuestionInput, ReadingReport } from "@atlas/shared-types";
import { appendReadingHistory, getReadingHistory } from "../storage";
import { buildMockReading, MOCK_READING_HISTORY } from "../mock/data";
import { callEdge, EDGE_PATHS, useMockApi } from "./client";

type ListReadingsResponse = {
  readings?: ReadingReport[];
};

export async function createReading(input: QuestionInput): Promise<ReadingReport> {
  if (useMockApi()) {
    await delay(800);
    const report = buildMockReading(input.text, input.traditions);
    appendReadingHistory(report);
    return report;
  }
  const data = await callEdge<ReadingReport>(EDGE_PATHS.createReading, {
    body: input as unknown as Record<string, unknown>,
  });
  const report = data ?? buildMockReading(input.text, input.traditions);
  appendReadingHistory(report);
  return report;
}

export async function listReadings(): Promise<ReadingReport[]> {
  if (useMockApi()) {
    const local = getReadingHistory();
    return local.length > 0 ? local : [...MOCK_READING_HISTORY];
  }
  const data = await callEdge<ListReadingsResponse>(EDGE_PATHS.listReadings, { method: "GET" });
  if (data?.readings?.length) return data.readings;

  const local = getReadingHistory();
  return local.length > 0 ? local : [...MOCK_READING_HISTORY];
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
