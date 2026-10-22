export const en = {
  landing: {
    nav: {
      brand: "Takodu",
      howItWorks: "How it works",
      features: "Features",
      pricing: "Pricing",
      questions: "FAQ",
      login: "Sign in",
      menu: "Navigation menu",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      language: "Language",
    },
    hero: {
      eyebrow: "For barbershops, spas and clinics in Lima",
      title: "Your calendar fills itself over WhatsApp.",
      description:
        "Takodu answers your customers at any hour, books their appointments and reminds them to show up. You only take care of them.",
      primaryCta: "Get started",
      secondaryCta: "See how it works",
      chat: {
        business: "Barbershop · Miraflores branch",
        status: "replies instantly",
        clientMessage: "Hi, is there room tomorrow for a haircut?",
        assistantMessage:
          "Hi Bruno! On Saturday I have openings with Carla at these times:",
        userSelection: "15:30",
        assistantConfirmation:
          "All set. Classic cut on Saturday 3rd at 3:30 PM with Carla. I'll remind you an hour before.",
        newBookingLabel: "New booking over WhatsApp",
        newBookingClient: "Bruno Díaz",
        newBookingDetail: "Sat Oct 3rd · 15:30 · Carla",
      },
      verticals: {
        barberias: "Barbershops",
        spas: "Spas & aesthetics",
        nails: "Nails & lashes",
        consultorios: "Clinics",
      },
    },
    howItWorks: {
      eyebrow: "How it works",
      title: "Ready in one afternoon, without changing how you work.",
      steps: [
        {
          title: "Connect your WhatsApp",
          description:
            "The assistant replies from the number your customers already know.",
        },
        {
          title: "Load services and staff",
          description:
            "Price, duration and who handles each service. Your team gets an invitation by email.",
        },
        {
          title: "Let it book for you",
          description:
            "It only offers free slots, confirms and reminds. You see everything in your calendar.",
        },
      ],
    },
    owner: {
      agenda: {
        eyebrow: "For the owner",
        title: "Your whole day on one screen.",
        description:
          "One column per specialist, the current time marked and every appointment with its status. Drag to move it; if the slot is taken, the appointment goes back to its place.",
      },
      reminders: {
        eyebrow: "Fewer empty chairs",
        title: "Reminders people actually answer.",
        description:
          "Every customer gets a reminder the day before. Whoever does not confirm shows up in a list, and with one tap you send it again.",
        listTitle: "Tomorrow, not confirmed",
        pendingCount: "4",
        resendAll: "Resend to all",
      },
      reports: {
        eyebrow: "Reports",
        title: "Know how your business is doing, in plain words.",
        description:
          "A weekly summary written by AI: how full you were, how much was booked outside working hours and when people ask the most.",
        summaryTitle: "Weekly summary",
        summaryBody:
          "You filled 82% of your calendar. The assistant booked 23 appointments outside working hours, S/ 1,240.00 that used to be lost.",
        summaryCaption: "Example with data from a sample barbershop",
      },
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Pay for the size of your business.",
      plans: {
        inicial: {
          name: "Starter",
          price: "S/ 79",
          period: "per month",
          features: ["1 branch", "Up to 3 people", "500 AI conversations per month"],
          cta: "Choose Starter",
        },
        negocio: {
          name: "Business",
          badge: "Most chosen",
          price: "S/ 149",
          period: "per month",
          features: [
            "1 branch",
            "Up to 10 people",
            "2,000 AI conversations per month",
            "Reports with an AI summary",
          ],
          cta: "Choose Business",
        },
        multisede: {
          name: "Multi-branch",
          price: "S/ 299",
          period: "per month",
          features: [
            "Up to 5 branches",
            "Unlimited people",
            "6,000 AI conversations per month",
            "Reports per branch",
          ],
          cta: "Choose Multi-branch",
        },
      },
    },
    faq: {
      eyebrow: "FAQ",
      title: "What people ask us the most.",
      items: [
        {
          question: "What happens if two customers want the same time?",
          answer:
            "The assistant only offers free slots. If someone moves an appointment to a taken slot, it goes back to its place and you get notified.",
        },
        {
          question: "Can my team see their calendar on mobile?",
          answer:
            "Yes. Every specialist signs in from their phone and sees only their own schedule, synced in real time.",
        },
        {
          question: "Does it sync with Google Calendar?",
          answer:
            "Yes. You connect your calendar once and every booked appointment shows up automatically, in both directions.",
        },
        {
          question: "Can I manage several branches?",
          answer:
            "Yes, on the Multi-branch plan. You manage up to 5 branches with their own team, services and reports.",
        },
      ],
    },
    finalCta: {
      title: "Let your calendar work while you take care of your customers.",
      cta: "Get started",
    },
  },
} as const;
