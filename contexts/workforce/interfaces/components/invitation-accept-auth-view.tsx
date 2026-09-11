"use client";

import { AuthForm } from "@/contexts/iam/interfaces/components/auth-form";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

export function InvitationAcceptAuthView({
  organizationName,
  invitedEmail,
  returnTo,
}: {
  organizationName: string;
  invitedEmail: string;
  returnTo: string;
}) {
  const { t, translate } = useI18n();

  return (
    <AuthForm
      returnTo={returnTo}
      initialEmail={invitedEmail}
      lockEmail
      hideGoogle
      heading={translate("auth.invitationWelcomeTitle", { organization: organizationName })}
      description={t.auth.invitationWelcomeDescription}
      submitLabel={t.auth.registerAndAcceptInvitation}
    />
  );
}
