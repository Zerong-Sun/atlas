import type { QuestionInput, ReadingReport } from "@atlas/shared-types";
import { buildMockReading, MOCK_READING_HISTORY } from "../mock/data";
import { appendReadingHistory, getReadingHistory } from "../storage";
import { invokeFunction, invokeFunctionGet } from "../supabase";
import { delay, EDGE, useMockApi } from "./shared";

type ListReadingsResponse = {
  readings?: ReadingReport[];
};

export async function createReading(input: QuestionInput): Promise<ReadingReport> {
  if (useMockApi()) {
    await delay(800);
    const report = buildMockReading(input.text, input.traditions);
    await appendReadingHistory(report);
    return report;
  }
  const data = await invokeFunction<ReadingReport>(EDGE.createReading, {
    text: input.text,
    category: input.category,
    traditions: input.traditions,
  });
  const report = data ?? buildMockReading(input.text, input.traditions);
  await appendReadingHistory(report);
  return report;
}

export async function listReadings(): Promise<ReadingReport[]> {
  if (useMockApi()) {
    const local = await getReadingHistory();
    return local.length > 0 ? local : [...MOCK_READING_HISTORY];
  }
  const data = await invokeFunctionGet<ListReadingsResponse>(EDGE.listReadings);
  if (data?.readings?.length) return data.readings;
  const local = await getReadingHistory();
  return local.length > 0 ? local : [...MOCK_READING_HISTORY];
}
