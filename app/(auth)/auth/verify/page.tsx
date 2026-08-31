import { Verify } from "@/contexts/iam/interfaces/components/verify";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string; next?: string }>;
}) {
  return <Verify searchParams={searchParams} />;
}
