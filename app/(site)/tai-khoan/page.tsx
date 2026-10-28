import { AccountPanel } from "@/components/auth/AccountPanel";
import { AccountShell } from "@/components/auth/AccountShell";

export default function AccountPage() {
  return <AccountShell active="home"><AccountPanel /></AccountShell>;
}
