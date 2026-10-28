import { TREND_PROFILES, characterIdForTrendKey, personalityCodeForTrendKey } from "./catalog";

export type CharacterVariant = { characterId: string; imageChoice: "SUN" | "MOON"; personalityCode: string; asset: string; trendKey: string };

export const CHARACTER_VARIANTS: CharacterVariant[] = TREND_PROFILES.flatMap((profile) => ([("SUN"), ("MOON")] as const).map((imageChoice) => ({
  characterId: characterIdForTrendKey(imageChoice, profile.key),
  imageChoice,
  personalityCode: profile.personalityCode || personalityCodeForTrendKey(profile.key),
  asset: imageChoice === "SUN" ? profile.sunAsset || profile.icon : profile.moonAsset || profile.icon,
  trendKey: profile.key,
})));

export function getCharacterVariant(imageChoice: "SUN" | "MOON", personalityCode: string) {
  return CHARACTER_VARIANTS.find((character) => character.imageChoice === imageChoice && character.personalityCode === personalityCode) || null;
}
