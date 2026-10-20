/**
 * Landing copy. The illustrations (chat mockup, agenda board, weekly summary)
 * keep their literals inside their components: they are product decoration, not
 * translatable content.
 */
export const es = {
  landing: {
    nav: {
      brand: "Takodu",
      howItWorks: "Cómo funciona",
      features: "Funciones",
      pricing: "Precios",
      questions: "Preguntas",
      login: "Ingresar",
      startFree: "Probar gratis",
      menu: "Menú de navegación",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      language: "Idioma",
    },
    hero: {
      eyebrow: "Para barberías, spas y consultorios en Lima",
      title: "Tu agenda se llena sola por WhatsApp.",
      description:
        "Takodu responde a tus clientes a cualquier hora, agenda sus citas y les recuerda llegar. Tú solo atiendes.",
      primaryCta: "Probar gratis",
      secondaryCta: "Ver cómo funciona",
      chat: {
        business: "Barbería · Sede Miraflores",
        status: "responde al instante",
        clientMessage: "Hola, ¿hay espacio mañana para corte?",
        assistantMessage:
          "¡Hola Bruno! Mañana sábado tengo libre con Carla a estas horas:",
        userSelection: "15:30",
        assistantConfirmation:
          "Listo. Corte clásico el sábado 3 a las 15:30 con Carla. Te escribo una hora antes.",
        newBookingLabel: "Nueva cita por WhatsApp",
        newBookingClient: "Bruno Díaz",
        newBookingDetail: "Sáb 3 oct · 15:30 · Carla",
      },
      verticals: {
        barberias: "Barberías",
        spas: "Spas y estética",
        nails: "Uñas y pestañas",
        consultorios: "Consultorios",
      },
    },
    howItWorks: {
      eyebrow: "Cómo funciona",
      title: "Listo en una tarde, sin cambiar cómo trabajas.",
      steps: [
        {
          title: "Conecta tu WhatsApp",
          description:
            "El asistente responde desde el número que tus clientes ya conocen.",
        },
        {
          title: "Carga servicios y equipo",
          description:
            "Precio, duración y quién atiende cada servicio. Tu equipo recibe una invitación por correo.",
        },
        {
          title: "Deja que agende por ti",
          description:
            "Solo ofrece horarios libres, confirma y recuerda. Tú lo ves todo en tu calendario.",
        },
      ],
    },
    owner: {
      agenda: {
        eyebrow: "Para el dueño",
        title: "Tu día en una sola pantalla.",
        description:
          "Una columna por especialista, la hora actual marcada y cada cita con su estado. Arrastra para mover; si el horario está ocupado, la cita vuelve a su lugar.",
      },
      reminders: {
        eyebrow: "Menos sillas vacías",
        title: "Recordatorios que sí se responden.",
        description:
          "Cada cliente recibe un recordatorio el día anterior. Quien no confirma aparece en una lista, y con un toque se lo vuelves a enviar.",
        listTitle: "Mañana sin confirmar",
        pendingCount: "4",
        resendAll: "Reenviar a todas",
      },
      reports: {
        eyebrow: "Reportes",
        title: "Sabes cómo va tu negocio, en palabras.",
        description:
          "Un resumen semanal escrito por IA: cuánto llenaste, cuánto se agendó fuera de horario y a qué hora te piden más.",
        summaryTitle: "Resumen de la semana",
        summaryBody:
          "Llenaste el 82 % de tu agenda. El asistente agendó 23 citas fuera de horario, S/ 1,240.00 que antes se perdían.",
        summaryCaption: "Ejemplo con datos de una barbería de prueba",
      },
    },
    pricing: {
      eyebrow: "Precios",
      title: "Paga por el tamaño de tu negocio.",
      plans: {
        inicial: {
          name: "Inicial",
          price: "S/ 79",
          period: "al mes",
          features: ["1 sede", "Hasta 3 personas", "500 conversaciones con IA al mes"],
          cta: "Elegir Inicial",
        },
        negocio: {
          name: "Negocio",
          badge: "El más elegido",
          price: "S/ 149",
          period: "al mes",
          features: [
            "1 sede",
            "Hasta 10 personas",
            "2,000 conversaciones con IA al mes",
            "Reportes con resumen de IA",
          ],
          cta: "Probar gratis",
        },
        multisede: {
          name: "Multisede",
          price: "S/ 299",
          period: "al mes",
          features: [
            "Hasta 5 sedes",
            "Personas sin límite",
            "6,000 conversaciones con IA al mes",
            "Reportes por sede",
          ],
          cta: "Hablar con nosotros",
        },
      },
    },
    faq: {
      eyebrow: "Preguntas",
      title: "Lo que más nos preguntan.",
      items: [
        {
          question: "¿Qué pasa si dos clientes piden la misma hora?",
          answer:
            "El asistente solo ofrece horarios libres. Si alguien mueve una cita a un horario ocupado, la cita vuelve a su lugar y se avisa.",
        },
        {
          question: "¿Mi equipo puede ver su agenda en el celular?",
          answer:
            "Sí. Cada especialista entra desde su teléfono y ve solo su propia agenda, con los cambios sincronizados al instante.",
        },
        {
          question: "¿Se sincroniza con Google Calendar?",
          answer:
            "Sí. Conectas tu calendario una vez y cada cita agendada aparece automáticamente, en ambos sentidos.",
        },
        {
          question: "¿Puedo manejar varias sedes?",
          answer:
            "Sí, en el plan Multisede. Manejas hasta 5 sedes con su propio equipo, sus servicios y sus reportes.",
        },
      ],
    },
    finalCta: {
      title: "Deja que tu agenda trabaje mientras tú atiendes.",
      cta: "Probar gratis",
    },
  },
} as const;
