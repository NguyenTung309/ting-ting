export type TrendKind = "base" | "hybrid";

export type TrendProfile = {
  key: string;
  slug: string;
  kind: TrendKind;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  strengths: string[];
  watchouts: string[];
  harmonyReason: string;
  frictionReason: string;
  conversationPrompts: string[];
  dimensionKeys: string[];
  status: "draft" | "published";
  sortOrder: number;
  updatedAt?: string;
  personalityCode?: string;
  characterId?: string;
  sunAsset?: string;
  moonAsset?: string;
};

export type PublicTestResult = {
  tttCode: string;
  testSlug: string;
  version: number;
  submittedAt: string;
  resultKey: string;
  title: string;
  tagline: string;
  summary: string;
  icon: string;
  scores?: Record<string, number>;
  score?: number;
  strengths: string[];
  watchouts: string[];
  suggestions: string[];
  conversationPrompt: string;
  formulaVersion?: number;
  imageChoice?: "SUN" | "MOON";
  characterAsset?: string;
  personalityCode?: string;
  characterId?: string;
  adjustedScores?: Record<string, number>;
};

export type ResultLookupResponse = PublicTestResult;

export type CompatibilityDimension = {
  key: string;
  label: string;
  difference: number;
  scoreA: number;
  scoreB: number;
  trend?: TrendProfile;
};

export type CompatibilityResult = {
  score: number;
  personA: PublicTestResult;
  personB: PublicTestResult;
  closeDimensions: CompatibilityDimension[];
  distantDimensions: CompatibilityDimension[];
  suggestions: string[];
  prompts: string[];
  sharedDimensions?: CompatibilityDimension[];
  differentDimensions?: CompatibilityDimension[];
};

export type CompatibilityCompareRequest = {
  codeA: string;
  codeB: string;
};
