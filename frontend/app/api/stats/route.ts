import { NextResponse } from "next/server";

const HISTORICAL_STATS = {
  total_passengers_crew: 2224,
  total_lost: 1514,
  total_survived: 710,
  overall_survival_rate: 31.6,
  breakdowns: [
    { category: "First Class Passengers", survival_rate: 62.5, note: "High proximity to boat deck and prioritized boarding" },
    { category: "Second Class Passengers", survival_rate: 41.5, note: "Strong women/children priority; low male survival" },
    { category: "Third Class Passengers", survival_rate: 24.5, note: "Difficult navigation from lower decks and language barriers" },
    { category: "All Female Passengers", survival_rate: 74.2, note: "Strict enforcement of 'women & children first' protocol" },
    { category: "All Male Passengers", survival_rate: 18.9, note: "Prevented from boarding port-side lifeboats by officers" }
  ]
};

export async function GET() {
  const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/stats`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Return fallback stats
  }
  return NextResponse.json(HISTORICAL_STATS);
}
