import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";
import { ProfileCard } from "@/contexts/profiles/interfaces/components/profile/profile-card";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageFallback />}>
      <ProfilePageContent />
    </Suspense>
  );
}

export async function ProfilePageContent() {
  const profile = await getMyProfileServerQuery();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-description mt-2">Manage your profile photo and username.</p>
      </div>
      <ProfileCard profile={profile} />
    </div>
  );
}

function ProfilePageFallback() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6" aria-busy="true">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-description mt-2">Loading profile...</p>
      </div>
    </div>
  );
}
