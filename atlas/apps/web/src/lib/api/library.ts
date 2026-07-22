import type { Tradition } from "@atlas/shared-types";
import { MOCK_LIBRARY_ENTRIES } from "../mock/data";
import { callEdge, EDGE_PATHS, useMockApi } from "./client";

export interface LibraryEntry {
  id: string;
  slug: string;
  labelZh: string;
  tradition: Tradition;
  definitionZh: string;
}

type ConceptRow = {
  id: string;
  slug?: string;
  label_zh?: string;
  labelZh?: string;
  tradition: Tradition;
  definition_zh?: string;
  definitionZh?: string;
};

type LibraryApiResponse = {
  concepts?: ConceptRow[];
};

function mapConcept(c: ConceptRow): LibraryEntry {
  return {
    id: c.id,
    slug: c.slug ?? c.id,
    labelZh: c.label_zh ?? c.labelZh ?? "",
    tradition: c.tradition,
    definitionZh: c.definition_zh ?? c.definitionZh ?? "",
  };
}

export async function browseLibrary(opts?: {
  tradition?: Tradition;
  query?: string;
}): Promise<LibraryEntry[]> {
  if (useMockApi()) {
    let items = [...MOCK_LIBRARY_ENTRIES];
    if (opts?.tradition) items = items.filter((e) => e.tradition === opts.tradition);
    if (opts?.query) {
      const q = opts.query.toLowerCase();
      items = items.filter(
        (e) => e.labelZh.includes(opts.query!) || e.definitionZh.toLowerCase().includes(q)
      );
    }
    return items;
  }
  const query: Record<string, string> = {};
  if (opts?.tradition) query.tradition = opts.tradition;
  if (opts?.query) query.q = opts.query;

  const data = await callEdge<LibraryApiResponse>(EDGE_PATHS.libraryList, {
    method: "GET",
    query,
  });
  const concepts = data?.concepts?.map(mapConcept) ?? [];
  return concepts.length > 0 ? concepts : [...MOCK_LIBRARY_ENTRIES];
}
