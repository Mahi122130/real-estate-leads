export interface DayContent {
  day: number;
  title: string;
  description: string;
  videoUrl: string; // Embed URL (YouTube, Vimeo, etc.)
  documentUrl: string; // Secure PDF/Document link sent via WhatsApp/Telegram
  isUnlockedDefault: boolean;
}

export const DAYS_CONFIG: DayContent[] = [
  {
    day: 1,
    title: "Day 1: Introduction to Real Estate Mastery",
    description: "Discover the foundational strategies to scale your portfolio.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Swap this out easily later
    documentUrl: "https://example.com/docs/day-1-guide.pdf",
    isUnlockedDefault: true,
  },
  {
    day: 2,
    title: "Day 2: Finding Undervalued Properties",
    description: "Learn how to spot hidden gems in competitive markets.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    documentUrl: "https://example.com/docs/day-2-guide.pdf",
    isUnlockedDefault: false,
  },
  {
    day: 3,
    title: "Day 3: Advanced Negotiation Tactics",
    description: "Close deals with confidence and maximize profit margins.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    documentUrl: "https://example.com/docs/day-3-guide.pdf",
    isUnlockedDefault: false,
  },
  {
    day: 4,
    title: "Day 4: Financing & Capital Raising",
    description: "Structuring creative funding for your real estate acquisitions.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    documentUrl: "https://example.com/docs/day-4-guide.pdf",
    isUnlockedDefault: false,
  },
  {
    day: 5,
    title: "Day 5: Property Evaluation & Inspection",
    description: "Avoid costly mistakes by auditing structural integrity.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    documentUrl: "https://example.com/docs/day-5-guide.pdf",
    isUnlockedDefault: false,
  },
  {
    day: 6,
    title: "Day 6: Scaling & Automation",
    description: "Building systems that run your real estate business on autopilot.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    documentUrl: "https://example.com/docs/day-6-guide.pdf",
    isUnlockedDefault: false,
  },
  {
    day: 7,
    title: "Day 7: Closing Your First Major Deal",
    description: "The complete roadmap from offer to ownership.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    documentUrl: "https://example.com/docs/day-7-guide.pdf",
    isUnlockedDefault: false,
  },
];