import { Suspense } from "react";
import { AuthForm } from "@/contexts/iam/interfaces/components/auth-form";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";
import { normalizeAuthReturnPath } from "@/contexts/iam/domain/model/valueobjects/auth-return-path";

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({ searchParams }: LoginPageProps) {
  const next = (await searchParams).next;
  const returnTo = normalizeAuthReturnPath(Array.isArray(next) ? next[0] : next);
  return <AuthForm returnTo={returnTo} />;
}
