import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";
import { ProfileCard } from "@/contexts/profiles/interfaces/components/profile/profile-card";
import { ProfilePreferencesCard } from "@/contexts/profiles/interfaces/components/profile/profile-preferences-card";
import { getServerLocale } from "@/contexts/shared/infrastructure/i18n/server";
import { getProfilesDictionary } from "@/contexts/profiles/interfaces/i18n";

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

  const locale = await getServerLocale();
  const dict = getProfilesDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">{dict.profile.pageTitle}</h1>
        <p className="page-description mt-2">{dict.profile.pageDescription}</p>
      </div>
      <ProfileCard profile={profile} />
      <ProfilePreferencesCard profile={profile} />
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
