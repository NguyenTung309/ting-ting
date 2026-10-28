import { AccountPanel } from "@/components/auth/AccountPanel";
import { AccountShell } from "@/components/auth/AccountShell";

export default function ProfilePage() {
  return <AccountShell active="profile"><AccountPanel mode="profile" /></AccountShell>;
}
