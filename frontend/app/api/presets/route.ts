import { NextResponse } from "next/server";

const HISTORICAL_PRESETS = [
  {
    id: "first-class-noble",
    name: "Lady Duff-Gordon (1st Class)",
    description: "Prominent British fashion designer traveling in a luxury stateroom with immediate lifeboat access.",
    pclass: 1,
    sex: "female",
    age: 48,
    fare: 86.50,
    embarked: "Cherbourg",
    sibsp: 1,
    parch: 0
  },
  {
    id: "first-class-gentleman",
    name: "Col. Archibald Gracie (1st Class)",
    description: "American historian and writer who assisted women into lifeboats before being washed into the freezing ocean.",
    pclass: 1,
    sex: "male",
    age: 53,
    fare: 52.00,
    embarked: "Southampton",
    sibsp: 0,
    parch: 0
  },
  {
    id: "second-class-teacher",
    name: "Lawrence Beesley (2nd Class)",
    description: "English science master traveling alone, boarded Lifeboat 13 on the starboard side.",
    pclass: 2,
    sex: "male",
    age: 34,
    fare: 13.00,
    embarked: "Southampton",
    sibsp: 0,
    parch: 0
  },
  {
    id: "second-class-mother",
    name: "Eva Hart & Mother (2nd Class)",
    description: "Seven-year-old child traveling with parents emigrating to Winnipeg, Canada.",
    pclass: 2,
    sex: "female",
    age: 7,
    fare: 26.25,
    embarked: "Southampton",
    sibsp: 0,
    parch: 2
  },
  {
    id: "third-class-laborer",
    name: "Olaus Abelseth (3rd Class)",
    description: "25-year-old Norwegian farmer traveling with cousins, faced barriers reaching the upper decks.",
    pclass: 3,
    sex: "male",
    age: 25,
    fare: 7.65,
    embarked: "Southampton",
    sibsp: 0,
    parch: 0
  },
  {
    id: "third-class-family",
    name: "Sage Family Child (3rd Class)",
    description: "Member of a large 11-person emigrant family berthed deep in steerage.",
    pclass: 3,
    sex: "female",
    age: 14,
    fare: 69.55,
    embarked: "Southampton",
    sibsp: 5,
    parch: 2
  }
];

export async function GET() {
  const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${backendUrl}/api/presets`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Return fallback presets
  }
  return NextResponse.json(HISTORICAL_PRESETS);
}
