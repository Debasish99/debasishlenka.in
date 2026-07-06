# Adding Lab projects

Edit `content/lab/experiments.json` — each entry is one project card + detail page at `/lab/<slug>`.

```json
{
  "slug": "my-project",
  "title": "My Project",
  "status": "ongoing",       // "ongoing" | "planned" | "done"
  "summary": "One sentence for the card on /lab.",
  "tags": ["Tech", "Stack", "Tags"],
  "coverImage": "/lab-images/my-project.jpg",   // or null
  "video": "https://www.youtube.com/embed/VIDEO_ID",  // must be an /embed/ URL, or null
  "links": [
    { "label": "View source", "url": "https://github.com/..." },
    { "label": "Live demo", "url": "https://..." }
  ],
  "body": [
    "First paragraph of the full write-up.",
    "Second paragraph.",
    "As many as you want — each string is one paragraph."
  ]
}
```

For cover images: drop image files into `public/lab-images/` and reference them as `/lab-images/filename.jpg` in `coverImage`.

For video: use the YouTube "embed" URL format specifically (Share → Embed → copy the `src` from the iframe, looks like `https://www.youtube.com/embed/xxxxxxxxxxx`), not the regular watch URL.
