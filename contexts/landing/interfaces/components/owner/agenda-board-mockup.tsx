"use client";

import {
  CheckCircle2Icon,
  CheckIcon,
  CircleDashedIcon,
  PlayIcon,
} from "lucide-react";

type AgendaCard = {
  client: string;
  service: string;
  status: "confirmed" | "moving" | "done" | "pending";
};

type AgendaColumn = {
  name: string;
  offset?: boolean;
  cards: AgendaCard[];
};

const COLUMNS: AgendaColumn[] = [
  {
    name: "Carla",
    cards: [
      { client: "Jorge Salas", service: "Corte clásico", status: "confirmed" },
      { client: "Andrés Quispe", service: "Corte + barba", status: "moving" },
      { client: "Renzo Paredes", service: "Corte clásico", status: "done" },
    ],
  },
  {
    name: "Diego",
    offset: true,
    cards: [
      { client: "Piero Castillo", service: "Corte clásico", status: "confirmed" },
      { client: "Sebastián Ríos", service: "Corte + tinte", status: "done" },
    ],
  },
  {
    name: "Mariana",
    cards: [
      { client: "Valeria Chávez", service: "Limpieza facial", status: "confirmed" },
      { client: "Patricia León", service: "Manicure gel", status: "pending" },
    ],
  },
];

const STATUS_STYLES: Record<AgendaCard["status"], string> = {
  confirmed: "bg-muted/70 text-foreground",
  moving: "bg-warning/10 text-foreground",
  done: "bg-success/10 text-foreground",
  pending: "bg-card text-foreground ring-1 ring-primary/50",
};

function StatusIcon({ status }: { status: AgendaCard["status"] }) {
  if (status === "moving") {
    return <PlayIcon className="size-4 shrink-0 text-warning" />;
  }
  if (status === "done") {
    return <CheckIcon className="size-4 shrink-0 text-success" />;
  }
  if (status === "pending") {
    return <CircleDashedIcon className="size-4 shrink-0 text-muted-foreground/60" />;
  }
  return <CheckCircle2Icon className="size-4 shrink-0 text-muted-foreground/60" />;
}

/** Illustrative board: product decoration, not translatable content. */
export function AgendaBoardMockup() {
  return (
    <div className="rounded-2xl bg-muted/60 p-5 shadow-xs">
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <div key={column.name}>
            <p className="mb-2.5 text-sm font-bold text-foreground">{column.name}</p>
            <div className={`space-y-2 ${column.offset ? "pt-6" : ""}`}>
              {column.cards.map((card) => (
                <div
                  key={card.client}
                  className={`rounded-xl px-3 py-2.5 ${STATUS_STYLES[card.status]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">
                      {card.client}
                    </p>
                    <StatusIcon status={card.status} />
                  </div>
                  <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                    {card.service}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
