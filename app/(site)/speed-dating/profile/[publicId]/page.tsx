import { Container } from "@/components/site/Container";
import { SpeedDatingProfileDetail } from "@/components/speed-dating/SpeedDatingProfileDetail";

export const metadata = { title: "Hồ sơ cùng tần số" };

export default async function SpeedDatingProfilePage({ params }: { params: Promise<{ publicId: string }> }) { const { publicId } = await params; return <Container className="py-12 sm:py-20"><SpeedDatingProfileDetail publicId={publicId} /></Container>; }
