"use client";

import { Appointment } from "../../../domain/model/entities/appointment";
import { AppointmentStatus } from "../../../domain/model/valueobjects/appointment-status";
import { cn } from "@/lib/utils";

interface AppointmentBlockProps {
  appointment: Appointment;
  onClick: () => void;
}

export function AppointmentBlock({ appointment, onClick }: AppointmentBlockProps) {
  const starts = new Date(appointment.startsAt);
  const ends = new Date(appointment.endsAt);
  
  // Calculate relative height or styling (default block size is fine for simple calendar,
  // we add visual indicators based on status)
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;

  const formattedTime = `${starts.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} - ${ends.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-2 text-left cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
        isCancelled
          ? "border-destructive/20 bg-destructive/5 text-destructive/80 opacity-60"
          : "border-primary/20 bg-primary/5 text-primary"
      )}
    >
      <p className="text-xs font-bold truncate leading-snug">{appointment.title}</p>
      <p className="text-[10px] font-medium opacity-80 mt-0.5">{formattedTime}</p>
    </div>
  );
}
