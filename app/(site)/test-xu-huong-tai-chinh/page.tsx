import { TestRunner } from "@/components/tests/TestRunner";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { getPublishedTest } from "@/lib/tests/data";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  path: "/test-xu-huong-tai-chinh",
  title: "Test xu hướng tài chính trong tình yêu",
  description: "Khám phá cách bạn thường nhìn và tương tác với tiền bạc.",
});

export const dynamic = "force-dynamic";

export default async function FinanceTestPage() {
  const [test, settings] = await Promise.all([getPublishedTest("finance-trend"), getPublicSiteSettings()]);
  if (!test) return null;

  return <div className="ttt-test-page"><TestRunner test={test} settings={settings} /></div>;
}
