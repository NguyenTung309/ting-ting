export type ResultJourneySettings = {
  compare: {
    title: string;
    description: string;
    ctaLabel: string;
  };
  matching: {
    title: string;
    description: string;
    ctaLabel: string;
  };
};

export type PublicSiteSettings = {
  siteName: string;
  description: string;
  resultJourney: ResultJourneySettings;
};

export const defaultSiteSettings: PublicSiteSettings = {
  siteName: "Tình Tính Ting Ting",
  description: "Một không gian nhẹ nhàng để khám phá xu hướng tài chính, sự tương thích và những câu chuyện đáng nhớ.",
  resultJourney: {
    compare: {
      title: "So sánh với nửa kia",
      description: "Nhập mã TTT của hai bạn để nhìn thấy những điểm cùng tần số và những nơi cần lắng nghe kỹ hơn.",
      ctaLabel: "So sánh với nửa kia",
    },
    matching: {
      title: "Khám phá người có tính cách tương tự bạn",
      description: "Tìm những người có cùng tần số để bắt đầu một cuộc trò chuyện mới, nếu bạn muốn mở rộng kết nối.",
      ctaLabel: "Khám phá người tương tự",
    },
  },
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function mapResultJourney(value: unknown): ResultJourneySettings {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const compare = source.compare && typeof source.compare === "object" ? source.compare as Record<string, unknown> : {};
  const matching = source.matching && typeof source.matching === "object" ? source.matching as Record<string, unknown> : {};

  return {
    compare: {
      title: text(compare.title, defaultSiteSettings.resultJourney.compare.title),
      description: text(compare.description, defaultSiteSettings.resultJourney.compare.description),
      ctaLabel: text(compare.ctaLabel, defaultSiteSettings.resultJourney.compare.ctaLabel),
    },
    matching: {
      title: text(matching.title, defaultSiteSettings.resultJourney.matching.title),
      description: text(matching.description, defaultSiteSettings.resultJourney.matching.description),
      ctaLabel: text(matching.ctaLabel, defaultSiteSettings.resultJourney.matching.ctaLabel),
    },
  };
}

export function mapPublicSiteSettings(value: Record<string, unknown> | null | undefined): PublicSiteSettings {
  return {
    siteName: text(value?.siteName, defaultSiteSettings.siteName),
    description: text(value?.description, defaultSiteSettings.description),
    resultJourney: mapResultJourney(value?.resultJourney),
  };
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  return defaultSiteSettings;
}
