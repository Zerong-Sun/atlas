import type { Tradition } from "@atlas/shared-types";
import { MOCK_LIBRARY_ENTRIES } from "../mock/data";
import { invokeFunctionGet } from "../supabase";
import { EDGE, useMockApi } from "./shared";

export interface LibraryEntry {
  id: string;
  slug: string;
  labelZh: string;
  tradition: Tradition;
  definitionZh: string;
}

type LibraryApiResponse = {
  concepts?: Array<{
    id: string;
    slug?: string;
    label_zh: string;
    tradition: Tradition;
    definition_zh?: string;
  }>;
};

function mapLibraryResponse(data: LibraryApiResponse): LibraryEntry[] {
  return (data.concepts ?? []).map((c) => ({
    id: c.id,
    slug: c.slug ?? c.id,
    labelZh: c.label_zh,
    tradition: c.tradition,
    definitionZh: c.definition_zh ?? "",
  }));
}

function filterMockLibrary(opts?: { tradition?: Tradition; query?: string }): LibraryEntry[] {
  let items = [...MOCK_LIBRARY_ENTRIES];
  if (opts?.tradition) items = items.filter((e) => e.tradition === opts.tradition);
  if (opts?.query) {
    const q = opts.query.toLowerCase();
    items = items.filter(
      (e) => e.labelZh.includes(opts.query!) || e.definitionZh.toLowerCase().includes(q),
    );
  }
  return items;
}

export async function listLibrary(opts?: {
  tradition?: Tradition;
  query?: string;
}): Promise<LibraryEntry[]> {
  if (useMockApi()) {
    return filterMockLibrary(opts);
  }
  const params: Record<string, string> = {};
  if (opts?.tradition) params.tradition = opts.tradition;
  if (opts?.query) params.q = opts.query;
  const data = await invokeFunctionGet<LibraryApiResponse>(EDGE.libraryList, params);
  const mapped = data ? mapLibraryResponse(data) : [];
  if (mapped.length > 0) return mapped;
  return filterMockLibrary(opts);
}

export { listLibrary as browseLibrary };
