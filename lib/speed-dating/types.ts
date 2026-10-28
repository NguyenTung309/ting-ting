export const SPEED_DATING_ACTIONS = ["viewed", "opened", "passed", "hello_started"] as const;
export type SpeedDatingExposureAction = typeof SPEED_DATING_ACTIONS[number];

export type SpeedDatingStatus = "draft" | "active" | "paused" | "suspended";
export type AgeBand = "18-24" | "25-34" | "35-44" | "45-plus";

export type SpeedDatingPreferences = {
  minAge?: number;
  maxAge?: number;
  regions?: string[];
};

export type SpeedDatingProfileInput = {
  dateOfBirth: string;
  alias: string;
  region?: string;
  bio?: string;
  motto?: string;
  interests?: string[];
  preferences?: SpeedDatingPreferences;
  enabled: boolean;
};

export type SpeedDatingProfileRecord = {
  id: string;
  publicId: string;
  userId: string;
  userStatus: "active" | "suspended" | "deleted";
  dateOfBirth: string | null;
  alias: string;
  ageBand: AgeBand | null;
  region: string | null;
  bio: string | null;
  motto: string | null;
  interests: string[];
  preferences: SpeedDatingPreferences;
  enabled: boolean;
  status: SpeedDatingStatus;
  personalityCode: string | null;
  characterId: string | null;
  quizResultId: string | null;
  quizFormulaVersion: number | null;
  scores: Record<string, number>;
  lastSeenAt: string | null;
  updatedAt: string | null;
};

export type ProfileExposureRecord = {
  viewerId: string;
  candidateId: string;
  action: SpeedDatingExposureAction;
  shownAt: string;
  cooldownUntil: string | null;
};

export type DiscoveryCandidate = SpeedDatingProfileRecord & {
  financialSimilarity: number;
};

export type DiscoveryProfile = {
  publicId: string;
  alias: string;
  ageBand: AgeBand | null;
  region: string | null;
  bio: string | null;
  motto: string | null;
  interests: string[];
  characterId: string;
  personalityCode: string;
  financialSimilarity: number;
};

export type DiscoveryBatch = {
  batchId: string;
  generatedAt: string;
  profiles: DiscoveryProfile[];
};
