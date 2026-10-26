import { Suspense } from "react";
import { AuthForm } from "@/contexts/iam/interfaces/components/auth-form";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import {
  normalizeAuthIntent,
  normalizeAuthReturnPath,
} from "@/contexts/iam/domain/model/valueobjects/auth-return-path";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    intent?: string | string[];
  }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginPageContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next;
  const intent = params.intent;
  const returnTo = normalizeAuthReturnPath(Array.isArray(next) ? next[0] : next);
  return (
    <AuthForm
      returnTo={returnTo}
      intent={normalizeAuthIntent(Array.isArray(intent) ? intent[0] : intent)}
    />
  );
}
