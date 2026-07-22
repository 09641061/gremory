import React from "react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription plan, payment methods, and invoice history.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-semibold mb-2">Billing Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          The navigation Sidebar is active and fully connected.
        </p>
      </div>
    </div>
  );
}
