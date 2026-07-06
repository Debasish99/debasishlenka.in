import domainsData from "@/content/work/domains.json";

export type Domain = {
  slug: string;
  name: string;
  summary: string;
  keywords: string[];
};

export function getDomains(): Domain[] {
  return domainsData as Domain[];
}
