"use client";

import React, { useState, useEffect, useTransition } from "react";
import styles from "./page.module.css";
import {
  ShipIcon,
  CompassIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
  MapPinIcon,
  LifebuoyIcon,
  CheckIcon,
  CrossIcon,
  RefreshIcon,
  ScaleIcon,
  InfoIcon,
} from "./components/Icons";

interface FactorAnalysis {
  factor: string;
  impact: string;
  description: string;
}

interface ProcessedFeatures {
  pclass: number;
  pclass_name: string;
  sex: string;
  age: number;
  fare: number;
  embarked: string;
  family_size: number;
  is_alone: boolean;
  sibsp: number;
  parch: number;
}

interface PredictionResult {
  survived: boolean;
  prediction_label: string;
  survival_probability: number;
  non_survival_probability: number;
  survival_percentage: number;
  non_survival_percentage: number;
  input_features: ProcessedFeatures;
  factors: FactorAnalysis[];
  source?: string;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  pclass: number;
  sex: string;
  age: number;
  fare: number;
  embarked: string;
  sibsp: number;
  parch: number;
}

const DEFAULT_PRESETS: Preset[] = [
  {
    id: "first-class-noble",
    name: "Lady Duff-Gordon",
    description: "Prominent British couturière in First Class with rapid boat deck access.",
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
    name: "Col. Archibald Gracie",
    description: "1st Class historian who assisted women into lifeboats; survived on collapsible B.",
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
    name: "Lawrence Beesley",
    description: "English science master traveling alone; boarded starboard Lifeboat 13.",
    pclass: 2,
    sex: "male",
    age: 34,
    fare: 13.00,
    embarked: "Southampton",
    sibsp: 0,
    parch: 0
  },
  {
    id: "second-class-child",
    name: "Eva Hart (Age 7)",
    description: "Second Class child accompanied by parents emigrating to Canada.",
    pclass: 2,
    sex: "female",
    age: 7,
    fare: 26.25,
    embarked: "Southampton",
    sibsp: 0,
    parch: 2
  },
  {
    id: "third-class-emigrant",
    name: "Olaus Abelseth",
    description: "Norwegian farmer berthed in steerage with cousins; faced barrier gates.",
    pclass: 3,
    sex: "male",
    age: 25,
    fare: 7.65,
    embarked: "Southampton",
    sibsp: 0,
    parch: 0
  },
  {
    id: "third-class-large-family",
    name: "Sage Family Youth",
    description: "14-year-old child of a large 11-member emigrant steerage household.",
    pclass: 3,
    sex: "female",
    age: 14,
    fare: 69.55,
    embarked: "Southampton",
    sibsp: 5,
    parch: 2
  }
];

const HISTORICAL_BENCHMARKS = [
  { category: "First Class Passengers", survival_rate: 62.5, note: "Top-deck cabin proximity & prioritized evacuation" },
  { category: "Second Class Passengers", survival_rate: 41.5, note: "Strict adherence to female/child priority boarding" },
  { category: "Third Class Passengers", survival_rate: 24.5, note: "Lower steerage labyrinths & language barriers" },
  { category: "All Female Passengers", survival_rate: 74.2, note: "Rigid enforcement of 'women and children first'" },
  { category: "All Male Passengers", survival_rate: 18.9, note: "Prevented from entering port-side lifeboats" }
];

export default function Home() {
  const [pclass, setPclass] = useState<number>(3);
  const [sex, setSex] = useState<string>("male");
  const [age, setAge] = useState<number>(28);
  const [fare, setFare] = useState<number>(14.45);
  const [embarked, setEmbarked] = useState<string>("Southampton");
  const [sibsp, setSibsp] = useState<number>(0);
  const [parch, setParch] = useState<number>(0);

  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Compute live derived features
  const familySize = sibsp + parch + 1;
  const isAlone = familySize === 1;

  async function executePrediction(params: {
    pclass: number;
    sex: string;
    age: number;
    fare: number;
    embarked: string;
    sibsp: number;
    parch: number;
  }) {
    setLoading(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        if (data.source === "fastapi") {
          setBackendOnline(true);
        }
      }
    } catch (err) {
      console.error("Prediction request error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Run initial prediction on mount
  useEffect(() => {
    executePrediction({
      pclass: 3,
      sex: "male",
      age: 28,
      fare: 14.45,
      embarked: "Southampton",
      sibsp: 0,
      parch: 0,
    });
  }, []);

  function handlePresetSelect(preset: Preset) {
    setActivePreset(preset.id);
    startTransition(() => {
      setPclass(preset.pclass);
      setSex(preset.sex);
      setAge(preset.age);
      setFare(preset.fare);
      setEmbarked(preset.embarked);
      setSibsp(preset.sibsp);
      setParch(preset.parch);
    });

    executePrediction({
      pclass: preset.pclass,
      sex: preset.sex,
      age: preset.age,
      fare: preset.fare,
      embarked: preset.embarked,
      sibsp: preset.sibsp,
      parch: preset.parch,
    });
  }

  function handleReset() {
    setActivePreset(null);
    setPclass(3);
    setSex("male");
    setAge(28);
    setFare(14.45);
    setEmbarked("Southampton");
    setSibsp(0);
    setParch(0);

    executePrediction({
      pclass: 3,
      sex: "male",
      age: 28,
      fare: 14.45,
      embarked: "Southampton",
      sibsp: 0,
      parch: 0,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActivePreset(null);
    executePrediction({
      pclass,
      sex,
      age,
      fare,
      embarked,
      sibsp,
      parch,
    });
  }

  return (
    <div className={styles.main}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <ShipIcon size={24} />
            </div>
            <div className={styles.brandTitles}>
              <h1>RMS Titanic</h1>
              <p>Passenger Manifest & Survival Risk Appraisal Engine</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.statusIndicator}>
              <span className={styles.pulseDot} />
              <span>{backendOnline ? "Predictive Service Active" : "Operational Fallback Active"}</span>
            </div>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
              title="Reset to default passenger record"
            >
              <RefreshIcon size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Historical Manifests Strip */}
      <section className={styles.presetsSection}>
        <div className={styles.container}>
          <div className={styles.presetsHeader}>
            <span className={styles.presetsTitle}>Historical Passenger Manifests</span>
            <span className={styles.presetsHint}>Select a documented 1912 passenger to test immediate appraisal</span>
          </div>

          <div className={styles.presetsGrid}>
            {DEFAULT_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`${styles.presetCard} ${isSelected ? styles.presetCardActive : ""}`}
                >
                  <span className={styles.presetName}>{preset.name}</span>
                  <span className={styles.presetDesc}>{preset.description}</span>
                  <div className={styles.presetTags}>
                    <span className={styles.presetTag}>
                      {preset.pclass === 1 ? "1st Class" : preset.pclass === 2 ? "2nd Class" : "3rd Class"}
                    </span>
                    <span className={styles.presetTag}>£{preset.fare.toFixed(2)}</span>
                    <span className={styles.presetTag}>{preset.sex === "female" ? "F" : "M"} / {preset.age}y</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Analysis Workspace */}
      <main className={styles.container}>
        <div className={styles.mainLayout}>
          {/* Left Column: Form Controls */}
          <form className={styles.panel} onSubmit={handleSubmit}>
            <div className={styles.panelTitle}>
              <span>Passenger Manifest Parameters</span>
              <LifebuoyIcon size={20} color="var(--accent-gold)" />
            </div>

            {/* Travel & Accommodations */}
            <div className={styles.panelSection}>
              <div className={styles.sectionLabel}>
                <TicketIcon size={16} />
                <span>Travel & Cabin Class</span>
              </div>

              {/* Class Selector */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>Passenger Class (Pclass)</span>
                  <span className={styles.formHelper}>Deck elevation & lifeboat proximity</span>
                </label>
                <div className={styles.classGrid}>
                  {[
                    { id: 1, name: "1st Class", sub: "Promenades & Boat Deck" },
                    { id: 2, name: "2nd Class", sub: "Mid-Deck Cabins" },
                    { id: 3, name: "3rd Class", sub: "Lower Steerage Berths" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.classButton} ${pclass === item.id ? styles.classButtonActive : ""}`}
                      onClick={() => {
                        setPclass(item.id);
                        setActivePreset(null);
                      }}
                    >
                      <span className={styles.className}>{item.name}</span>
                      <span className={styles.classSub}>{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.row2}>
                {/* Ticket Fare */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="ticket-fare">
                    <span>Ticket Fare (£)</span>
                    <span className={styles.formHelper}>1912 GBP</span>
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currencyPrefix}>£</span>
                    <input
                      id="ticket-fare"
                      type="number"
                      step="0.05"
                      min="0"
                      max="600"
                      value={fare}
                      onChange={(e) => {
                        setFare(Math.max(0, parseFloat(e.target.value) || 0));
                        setActivePreset(null);
                      }}
                      className={`${styles.textInput} ${styles.textInputWithPrefix}`}
                    />
                  </div>
                  <div className={styles.farePresets}>
                    {[
                      { label: "£7.25 (Steerage)", val: 7.25 },
                      { label: "£13.00 (2nd)", val: 13.00 },
                      { label: "£53.00 (1st)", val: 53.00 },
                      { label: "£86.50 (Suite)", val: 86.50 },
                    ].map((chip) => (
                      <button
                        key={chip.val}
                        type="button"
                        className={styles.fareChip}
                        onClick={() => {
                          setFare(chip.val);
                          setActivePreset(null);
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Embarkation Port */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="embarkation-port">
                    <span>Port of Embarkation</span>
                    <span className={styles.formHelper}>Boarding Location</span>
                  </label>
                  <select
                    id="embarkation-port"
                    value={embarked}
                    onChange={(e) => {
                      setEmbarked(e.target.value);
                      setActivePreset(null);
                    }}
                    className={styles.selectInput}
                  >
                    <option value="Southampton">Southampton, England (S)</option>
                    <option value="Cherbourg">Cherbourg, France (C)</option>
                    <option value="Queenstown">Queenstown, Ireland (Q)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Demographics & Family */}
            <div className={styles.panelSection}>
              <div className={styles.sectionLabel}>
                <UserIcon size={16} />
                <span>Demographics & Family Aboard</span>
              </div>

              <div className={styles.row2}>
                {/* Gender Toggle */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>Biological Sex</span>
                    <span className={styles.formHelper}>Protocol priority</span>
                  </label>
                  <div className={styles.genderGrid}>
                    <button
                      type="button"
                      className={`${styles.genderButton} ${sex === "female" ? styles.genderButtonActive : ""}`}
                      onClick={() => {
                        setSex("female");
                        setActivePreset(null);
                      }}
                    >
                      <UserIcon size={16} />
                      <span>Female</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.genderButton} ${sex === "male" ? styles.genderButtonActive : ""}`}
                      onClick={() => {
                        setSex("male");
                        setActivePreset(null);
                      }}
                    >
                      <UserIcon size={16} />
                      <span>Male</span>
                    </button>
                  </div>
                </div>

                {/* Age Slider & Direct Input */}
                <div className={styles.formGroup}>
                  <div className={styles.sliderHeader}>
                    <label className={styles.formLabel} htmlFor="age-slider">
                      <span>Age (Years)</span>
                    </label>
                    <span className={styles.sliderValueBadge}>{age} yrs</span>
                  </div>
                  <input
                    id="age-slider"
                    type="range"
                    min="1"
                    max="80"
                    step="1"
                    value={age}
                    onChange={(e) => {
                      setAge(parseInt(e.target.value, 10));
                      setActivePreset(null);
                    }}
                    className={styles.rangeSlider}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    <span>Infant (1)</span>
                    <span>Median (28)</span>
                    <span>Senior (80)</span>
                  </div>
                </div>
              </div>

              {/* Family Counts */}
              <div className={styles.row2}>
                {/* Siblings / Spouse */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>Siblings / Spouse (SibSp)</span>
                    <span className={styles.formHelper}>Lateral relatives</span>
                  </label>
                  <div className={styles.stepperContainer}>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      disabled={sibsp <= 0}
                      onClick={() => {
                        setSibsp(Math.max(0, sibsp - 1));
                        setActivePreset(null);
                      }}
                    >
                      -
                    </button>
                    <div className={styles.stepperValue}>{sibsp}</div>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      disabled={sibsp >= 10}
                      onClick={() => {
                        setSibsp(Math.min(10, sibsp + 1));
                        setActivePreset(null);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Parents / Children */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>Parents / Children (Parch)</span>
                    <span className={styles.formHelper}>Generational relatives</span>
                  </label>
                  <div className={styles.stepperContainer}>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      disabled={parch <= 0}
                      onClick={() => {
                        setParch(Math.max(0, parch - 1));
                        setActivePreset(null);
                      }}
                    >
                      -
                    </button>
                    <div className={styles.stepperValue}>{parch}</div>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      disabled={parch >= 10}
                      onClick={() => {
                        setParch(Math.min(10, parch + 1));
                        setActivePreset(null);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Derived Features Calculation Strip */}
              <div className={styles.derivedBadge}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <UsersIcon size={16} />
                  <span>Calculated Family Size: <span className={styles.derivedStrong}>{familySize} person(s)</span></span>
                </div>
                <div>
                  <span>Traveling Alone: <span className={styles.derivedStrong}>{isAlone ? "Yes (Solo)" : "No"}</span></span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span>Calculating Estimation...</span>
              ) : (
                <>
                  <CompassIcon size={18} />
                  <span>Appraise Survival Likelihood</span>
                </>
              )}
            </button>
          </form>

          {/* Right Column: Prediction Outcomes & Evidence */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <span>Actuarial Survival Appraisal</span>
              <ScaleIcon size={20} color="var(--accent-gold)" />
            </div>

            {result ? (
              <>
                {/* Primary Outcome Banner */}
                <div
                  className={`${styles.outcomeCard} ${
                    result.survived ? styles.outcomeSurvived : styles.outcomePerished
                  }`}
                >
                  <div className={styles.outcomeHeader}>
                    <div
                      className={`${styles.outcomeStatusBadge} ${
                        result.survived ? styles.badgeSurvived : styles.badgePerished
                      }`}
                    >
                      {result.survived ? <CheckIcon size={16} /> : <CrossIcon size={16} />}
                      <span>{result.prediction_label}</span>
                    </div>

                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      Random Forest Classification
                    </span>
                  </div>

                  <div className={styles.probabilityDisplay}>
                    <span
                      className={`${styles.probLarge} ${
                        result.survived ? styles.colorSurvived : styles.colorPerished
                      }`}
                    >
                      {result.survival_percentage}%
                    </span>
                    <span className={styles.probLabel}>Estimated Survival Probability</span>
                  </div>

                  {/* Dual Distribution Bar */}
                  <div className={styles.probBarsContainer}>
                    <div className={styles.probBarTrack}>
                      <div
                        className={styles.probBarFillSurvived}
                        style={{ width: `${result.survival_percentage}%` }}
                      />
                      <div
                        className={styles.probBarFillPerished}
                        style={{ width: `${result.non_survival_percentage}%` }}
                      />
                    </div>
                    <div className={styles.probStatsRow}>
                      <span style={{ color: "var(--survival-green)", fontWeight: 600 }}>
                        Survival: {result.survival_percentage}%
                      </span>
                      <span style={{ color: "var(--peril-red)", fontWeight: 600 }}>
                        Non-Survival: {result.non_survival_percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evacuation Factor Attribution */}
                <div className={styles.panelSection}>
                  <div className={styles.sectionLabel}>
                    <InfoIcon size={16} />
                    <span>Contributing Evacuation Factors</span>
                  </div>

                  <div className={styles.factorsList}>
                    {result.factors.map((item, idx) => (
                      <div key={idx} className={styles.factorItem}>
                        <div className={styles.factorHeader}>
                          <span className={styles.factorTitle}>{item.factor}</span>
                          <span
                            className={`${styles.factorBadge} ${
                              item.impact === "positive"
                                ? styles.factorPositive
                                : item.impact === "negative"
                                ? styles.factorNegative
                                : styles.factorNeutral
                            }`}
                          >
                            {item.impact === "positive" ? "Favorable Impact" : item.impact === "negative" ? "Adverse Risk" : "Neutral Influence"}
                          </span>
                        </div>
                        <p className={styles.factorDesc}>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Processed Features Ledger Table */}
                <div className={styles.panelSection}>
                  <div className={styles.sectionLabel}>
                    <MapPinIcon size={16} />
                    <span>Processed Model Feature Vector</span>
                  </div>

                  <table className={styles.ledgerTable}>
                    <thead>
                      <tr>
                        <th>Model Feature</th>
                        <th>Processed Value</th>
                        <th>Encoded Dimension</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Passenger Class (Pclass)</td>
                        <td>{result.input_features.pclass_name}</td>
                        <td><span className={styles.codeBadge}>Pclass = {result.input_features.pclass}</span></td>
                      </tr>
                      <tr>
                        <td>Gender Dimension</td>
                        <td>{result.input_features.sex}</td>
                        <td><span className={styles.codeBadge}>Sex_Encoded = {result.input_features.sex === "Male" ? 1 : 0}</span></td>
                      </tr>
                      <tr>
                        <td>Passenger Age</td>
                        <td>{result.input_features.age} years</td>
                        <td><span className={styles.codeBadge}>Age = {result.input_features.age.toFixed(1)}</span></td>
                      </tr>
                      <tr>
                        <td>Ticket Fare</td>
                        <td>£{result.input_features.fare.toFixed(2)}</td>
                        <td><span className={styles.codeBadge}>Fare = {result.input_features.fare.toFixed(2)}</span></td>
                      </tr>
                      <tr>
                        <td>Port of Embarkation</td>
                        <td>{result.input_features.embarked}</td>
                        <td>
                          <span className={styles.codeBadge}>
                            Embarked_Encoded = {result.input_features.embarked === "Cherbourg" ? 0 : result.input_features.embarked === "Queenstown" ? 1 : 2}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Engineered Family Size</td>
                        <td>{result.input_features.family_size} person(s)</td>
                        <td><span className={styles.codeBadge}>FamilySize = {result.input_features.family_size}</span></td>
                      </tr>
                      <tr>
                        <td>Solo Travel Metric</td>
                        <td>{result.input_features.is_alone ? "Solo (True)" : "Accompanied (False)"}</td>
                        <td><span className={styles.codeBadge}>IsAlone = {result.input_features.is_alone ? 1 : 0}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <CompassIcon size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                <p>Loading historical prediction engine...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Historical Disaster Benchmarks Strip */}
      <section className={styles.benchmarkSection}>
        <div className={styles.container}>
          <div className={styles.sectionLabel}>
            <ScaleIcon size={16} />
            <span>1912 Maiden Voyage Disaster Reference Benchmarks</span>
          </div>

          <div className={styles.benchmarkGrid}>
            {HISTORICAL_BENCHMARKS.map((item, idx) => (
              <div key={idx} className={styles.benchmarkCard}>
                <span className={styles.benchmarkCategory}>{item.category}</span>
                <span className={styles.benchmarkRate}>{item.survival_rate}%</span>
                <p className={styles.benchmarkNote}>{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <div>
            <span>RMS Titanic Historical Estimation Suite © 1912–2026.</span>
            <span style={{ marginLeft: "12px", color: "var(--text-muted)" }}>
              Data compiled from Board of Trade inquiries & passenger manifests.
            </span>
          </div>

          <div className={styles.footerBadges}>
            <span className={styles.footerBadge}>Next.js App Router</span>
            <span className={styles.footerBadge}>FastAPI Python Backend</span>
            <span className={styles.footerBadge}>Random Forest Ensemble</span>
            <span className={styles.footerBadge}>Vercel Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
