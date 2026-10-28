import { Container } from "@/components/site/Container";

export default function Loading() {
  return <Container className="py-12 sm:py-20"><div className="animate-pulse"><div className="h-4 w-40 rounded-full bg-[#f2e4da]" /><div className="mt-5 h-12 max-w-2xl rounded-2xl bg-[#f2e4da]" /><div className="mt-4 h-5 max-w-xl rounded-full bg-[#f2e4da]" /><div className="mt-10 max-w-5xl rounded-[2rem] border border-[var(--line)] bg-[#fffdf7] p-9"><div className="h-4 w-32 rounded-full bg-[#f2e4da]" /><div className="mt-6 h-5 max-w-2xl rounded-full bg-[#f2e4da]" /><div className="mt-8 grid gap-3"><div className="h-16 rounded-2xl bg-[#f8eee7]" /><div className="h-16 rounded-2xl bg-[#f8eee7]" /><div className="h-16 rounded-2xl bg-[#f8eee7]" /></div></div></div></Container>;
}
