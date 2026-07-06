export const site = {
  name: "Debasish Lenka",
  domain: "debasishlenka.in",
  description:
    "Personal site — story, photography, engineering work, lab experiments, and writing.",
} as const;

// Primary nav. Order here drives the header nav and footer sitemap.
export const primaryNav = [
  { label: "Home", href: "/" },
  { label: "Photography", href: "/photography" },
  { label: "Work", href: "/work" },
  { label: "Lab", href: "/lab" },
  { label: "Blog", href: "/blog" },
] as const;
