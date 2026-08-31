type CustomerFormValues = {
  docType: string;
  docNumber: string;
  name: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
};

type CustomerIdentityFields = Pick<
  CustomerFormValues,
  "name" | "email" | "phoneCountryCode" | "phoneNumber"
> & {
  dni: string | null;
  ruc: string | null;
  foreignResidentCard: string | null;
  passport: string | null;
};

export function toCustomerIdentityFields(values: CustomerFormValues): CustomerIdentityFields {
  return {
    dni: values.docType === "dni" ? values.docNumber : null,
    ruc: values.docType === "ruc" ? values.docNumber : null,
    foreignResidentCard:
      values.docType === "foreign_resident_card" ? values.docNumber : null,
    passport: values.docType === "passport" ? values.docNumber : null,
    name: values.name,
    phoneCountryCode: values.phoneCountryCode,
    phoneNumber: values.phoneNumber,
    email: values.email,
  };
}

export function toUpdateCustomerCommand(values: CustomerFormValues, id: string) {
  return { id, ...toCustomerIdentityFields(values) };
}
