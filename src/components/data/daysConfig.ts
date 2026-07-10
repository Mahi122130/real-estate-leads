export interface DayConfig {
  day: number;
  title: string;
  description: string;
  videoUrl: string;
  documentUrl: string;
  isUnlockedDefault: boolean;
}

export const DAYS_CONFIG: DayConfig[] = [
  { day: 1, title: "Masterclass Day 1", description: "Introduction to Real Estate Investing", videoUrl: "", documentUrl: "", isUnlockedDefault: true },
  { day: 2, title: "Masterclass Day 2", description: "Finding Off-Market Deals", videoUrl: "", documentUrl: "", isUnlockedDefault: false },
  { day: 3, title: "Masterclass Day 3", description: "Financing Strategies", videoUrl: "", documentUrl: "", isUnlockedDefault: false },
  { day: 4, title: "Masterclass Day 4", description: "Negotiation Tactics", videoUrl: "", documentUrl: "", isUnlockedDefault: false },
  { day: 5, title: "Masterclass Day 5", description: "Property Management Basics", videoUrl: "", documentUrl: "", isUnlockedDefault: false },
  { day: 6, title: "Masterclass Day 6", description: "Scaling Your Portfolio", videoUrl: "", documentUrl: "", isUnlockedDefault: false },
  { day: 7, title: "Masterclass Day 7", description: "Exit Strategies & Next Steps", videoUrl: "", documentUrl: "", isUnlockedDefault: false },
];