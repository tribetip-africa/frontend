import { getApiBaseUrl } from "@/lib/platform";
import { requestJson } from "@/lib/api-request";

const API_BASE = getApiBaseUrl();

export type SitemapCreator = {
  username: string;
  updated_at: string;
};

export type SitemapCreatorsResponse = {
  creators: SitemapCreator[];
  page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
};

export async function fetchSitemapCreatorsPage(
  page: number,
  perPage = 500,
): Promise<SitemapCreatorsResponse> {
  const { data } = await requestJson<SitemapCreatorsResponse>(
    `${API_BASE}/sitemap/creators?page=${page}&per_page=${perPage}`,
    {
      cachePolicy: "publicShort",
      headers: { Accept: "application/json" },
    },
  );

  return data;
}

export async function fetchAllSitemapCreators(): Promise<SitemapCreator[]> {
  const creators: SitemapCreator[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetchSitemapCreatorsPage(page);
    creators.push(...response.creators);
    totalPages = response.total_pages;
    page += 1;
  } while (page <= totalPages);

  return creators;
}
