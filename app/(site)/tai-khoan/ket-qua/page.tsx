import { AccountPanel } from "@/components/auth/AccountPanel";
import { AccountShell } from "@/components/auth/AccountShell";

export default function AccountResultsPage() {
  return <AccountShell active="results"><AccountPanel mode="results" /></AccountShell>;
}
