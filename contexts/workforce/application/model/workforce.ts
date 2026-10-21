export type WorkforceInvitation = Readonly<{
  id: string;
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  email: string;
  status: "PENDING";
  createdAt: string;
  expiresAt: string;
}>;

export type WorkforceInvitationPreview = Readonly<{
  organizationId: string;
  organizationName: string;
  establishmentId: string;
  establishmentName: string;
  maskedEmail: string;
  expiresAt: string;
}>;

export type WorkforceMember = Readonly<{
  id: string;
  organizationId: string;
  establishmentId: string;
  establishmentName: string;
  userId: string;
  email: string;
  joinedAt: string;
}>;

export type AcceptedWorkforceInvitation = Readonly<{
  organizationId: string;
  establishmentId: string;
}>;
