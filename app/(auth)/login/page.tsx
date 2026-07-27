import { AuthForm } from "@/contexts/iam/interfaces/components/auth-form";
import { normalizeAuthReturnPath } from "@/contexts/iam/domain/model/valueobjects/auth-return-path";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = (await searchParams).next;
  const returnTo = normalizeAuthReturnPath(Array.isArray(next) ? next[0] : next);
  return <AuthForm returnTo={returnTo} />;
}
