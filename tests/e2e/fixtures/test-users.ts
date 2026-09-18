export const TEST_USERS = {
  OWNER: {
    id: "11111111-1111-1111-1111-111111111111",
    email: "owner@test.local",
    role: "owner",
    organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    establishmentId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    description: "Usuario Administrador/Dueño con organización y sede configurada",
  },
  STAFF: {
    id: "22222222-2222-2222-2222-222222222222",
    email: "staff@test.local",
    role: "staff",
    organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    establishmentId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    description: "Usuario Empleado con permisos restringidos",
  },
} as const;

export const TEST_OTP_CODE = "123456";
