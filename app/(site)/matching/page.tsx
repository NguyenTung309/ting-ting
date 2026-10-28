import { redirect } from "next/navigation";

export const metadata = { title: "Matching", description: "Khám phá những người có cùng tần số." };
export default function MatchingPage() { redirect("/speed-dating"); }
