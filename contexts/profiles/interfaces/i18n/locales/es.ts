import type { ProfilesDictionary } from "../index";

export const es: ProfilesDictionary = {
  sidebarProfile: {
    profile: "Perfil",
    upgradePlan: "Mejorar plan",
    invoices: "Facturas",
    logOut: "Cerrar sesión",
    signingOut: "Cerrando sesión...",
  },
  preferences: {
    title: "Preferencias",
    description: "Elige tu idioma y tema preferidos.",
    language: "Idioma",
    theme: "Tema",
    languages: {
      es: "Español",
      en: "Inglés",
    },
    themes: {
      light: "Claro",
      dark: "Oscuro",
    },
    errorTitle: "No se pudieron actualizar las preferencias",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
  },
  profile: {
    pageTitle: "Perfil",
    pageDescription: "Gestiona tu foto de perfil y nombre de usuario.",
    pageLoading: "Cargando perfil...",
    photoTitle: "Foto de perfil",
    photoDescription: "Haz clic en la foto para subir una nueva.",
    usernameTitle: "Nombre de usuario",
    usernameHint: "Solo letras (A-Z, a-z), {min} a {max} caracteres.",
    usernameMinLength: "El nombre de usuario debe tener al menos {min} caracteres.",
    uploadImage: "Subir imagen",
    errorTitle: "No se pudo actualizar el perfil",
    save: "Guardar",
    saving: "Guardando...",
    cancel: "Cancelar",
  },
};
