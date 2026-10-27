export interface StrategyOpportunity {
  id: string;
  title: string;
  description: string;
  sectors: string | null;
  country: string | null;
  source_name: string | null;
  url: string | null;
  quality_score: number | null;
  budget_range: string | null;
  score_pertinence: number;
  priority_score: number;
  urgency: {
    deadline: string | null;
    daysRemaining: number | null;
    urgencyLevel: string;
    timeframe: string;
    label: string;
  };
  impactScore: number;
  feasibilityScore: number;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  actionAdvice: string;
  criteres_match?: unknown;
}

export interface StrategyResponse {
  success: boolean;
  user: {
    id: string;
    nom: string | null;
    email: string;
    role: string;
    details: unknown;
  };
  synthesis: {
    profilNom: string;
    role: string;
    statutMarche: string;
    tauxCouvertureMarche: string;
    conseilCle: string;
  };
  prioritiesMatrix: {
    quickWins: StrategyOpportunity[];
    strategicBets: StrategyOpportunity[];
    safeBets: StrategyOpportunity[];
    counts: {
      quickWins: number;
      strategicBets: number;
      safeBets: number;
    };
  };
  roadmap: {
    thisWeek: { label: string; count: number; items: StrategyOpportunity[] };
    next2Weeks: { label: string; count: number; items: StrategyOpportunity[] };
    ongoing: { label: string; count: number; items: StrategyOpportunity[] };
  };
  topAdaptedOpportunities: StrategyOpportunity[];
  gapAnalysis: {
    profileStrengthKeywords: string[];
    topMarketDemands: Array<{
      skill: string;
      demandCount: number;
      relevance: string;
      tip: string;
    }>;
    actionableRecommendations: Array<{
      category: string;
      title: string;
      description: string;
      priority: string;
    }>;
  };
  generatedAt: string;
}
