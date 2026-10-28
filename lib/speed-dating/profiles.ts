import { z } from "zod";

import { getAgeBand } from "./eligibility";
import type { SpeedDatingProfileInput } from "./types";

const preferencesSchema = z.object({
  minAge: z.number().int().min(18).max(100).optional(),
  maxAge: z.number().int().min(18).max(100).optional(),
  regions: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
}).refine((value) => value.minAge === undefined || value.maxAge === undefined || value.minAge <= value.maxAge, { message: "Khoảng tuổi không hợp lệ.", path: ["maxAge"] });

export const speedDatingProfileSchema = z.object({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh không hợp lệ."),
  alias: z.string().trim().min(2).max(40),
  region: z.string().trim().max(80).optional().default(""),
  bio: z.string().trim().max(500).optional().default(""),
  motto: z.string().trim().max(160).optional().default(""),
  interests: z.array(z.string().trim().min(1).max(40)).max(8).optional().default([]),
  preferences: preferencesSchema.optional().default({}),
  enabled: z.boolean(),
});

export type ValidatedSpeedDatingProfileInput = z.infer<typeof speedDatingProfileSchema>;

type ProfileFields = {
  birthDate: string;
  alias: string;
  region?: string;
  bio?: string;
  motto?: string;
  interests: Array<{ value: string }>;
  preferences: SpeedDatingProfileInput["preferences"];
  ageBand?: ReturnType<typeof getAgeBand>;
  enabled: boolean;
  status: "active" | "draft";
  characterId?: string;
  personalityCode?: string;
  quizResult?: number;
};

export function validateProfileInput(value: unknown) {
  return speedDatingProfileSchema.safeParse(value);
}

export function profileFields(input: SpeedDatingProfileInput, result?: { id: string; personalityCode?: string; characterId?: string }): ProfileFields {
  const ageBand = getAgeBand(input.dateOfBirth);
  const fields = {
    birthDate: new Date(`${input.dateOfBirth}T00:00:00.000Z`).toISOString(),
    alias: input.alias,
    region: input.region || undefined,
    bio: input.bio || undefined,
    motto: input.motto || undefined,
    interests: input.interests?.map((value) => ({ value })) || [],
    preferences: input.preferences || {},
    ageBand: ageBand || undefined,
    enabled: input.enabled,
    status: (input.enabled ? "active" : "draft") as "active" | "draft",
  };
  return result ? { ...fields, characterId: result.characterId, personalityCode: result.personalityCode, quizResult: Number(result.id) } : fields;
}

export function interestsFromCmsRecord(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object" && "value" in item && typeof item.value === "string") return [item.value];
    return [];
  });
}
