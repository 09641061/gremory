import { MagicLinkVerification } from '@/contexts/iam/interfaces/components/magic-link-verification'

export default async function VerifyMagicLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return <MagicLinkVerification token={token ?? ''} />
}
