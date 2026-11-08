import { redirect } from "next/navigation";

import { CreateProfileForm } from "@/contexts/profiles/interfaces/components/profile/create-profile-form";
import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";

export default async function CreateProfilePage() {
  if (await getMyProfileServerQuery()) {
    redirect("/");
  }

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <CreateProfileForm />
    </main>
  );
}
