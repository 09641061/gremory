import { LogoutButton } from "@/contexts/iam/interfaces/components/logout-button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      <LogoutButton />
    </div>
  );
}
