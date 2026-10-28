import "server-only";

import type { AppRecordClient } from "@/lib/app-database";
import {
  filterFinanceAnalyticsRows,
  toFinanceAnalyticsRow,
  type FinanceAnalyticsRow,
  type ResultAnalyticsFilters,
} from "@/lib/tests/result-analytics";

export async function findAllTestSubmissions(records: AppRecordClient) {
  const firstPage = await records.find({ collection: "test-submissions", sort: "-submittedAt", limit: 500, page: 1, overrideAccess: true });
  const submissions = [...firstPage.docs];
  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const next = await records.find({ collection: "test-submissions", sort: "-submittedAt", limit: 500, page, overrideAccess: true });
    submissions.push(...next.docs);
  }
  return submissions;
}

export function financeRowsForFilters(submissions: Record<string, unknown>[], filters: ResultAnalyticsFilters): FinanceAnalyticsRow[] {
  return filterFinanceAnalyticsRows(submissions.map(toFinanceAnalyticsRow), filters);
}
