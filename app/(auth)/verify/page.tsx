import { VerifyForm } from "@/contexts/iam/interfaces/components/verify-form";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return <VerifyForm email={params.email ?? "email@example.com"} />;
}
