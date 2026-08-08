"use client";

import { useState } from "react";
import { Appointment } from "../../../domain/model/entities/appointment";
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
  const isCancelled = appointment.status === "CANCELLED";
  const isCompleted = appointment.status === "COMPLETED";
  const isNoShow = appointment.status === "NO_SHOW";
  const isInProgress = appointment.status === "IN_PROGRESS";
  
  // R7: Check if appointment time is in the past using a pure state value
  const [now] = useState(() => Date.now());
  const isPast = ends.getTime() < now;

  const formattedTime = `${starts.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} - ${ends.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;

  let statusStyles = "border-primary/20 bg-primary/5 text-primary";
  if (isCancelled) {
    statusStyles = "border-destructive/20 bg-destructive/5 text-destructive/80 opacity-50";
  } else if (isNoShow) {
    statusStyles = "border-gray-400/20 bg-gray-400/5 text-gray-500/80 opacity-60";
  } else if (isCompleted) {
    statusStyles = "border-blue-500/20 bg-blue-500/5 text-blue-600/80 opacity-70";
  } else if (isInProgress) {
    statusStyles = "border-amber-500/30 bg-amber-500/10 text-amber-700 animate-pulse";
  } else if (isPast) {
    statusStyles = "border-muted/30 bg-muted/5 text-muted-foreground opacity-60";
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-2 text-left cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
        statusStyles
      )}
    >
      <p className="text-xs font-bold truncate leading-snug">{appointment.title}</p>
      <p className="text-[10px] font-medium opacity-80 mt-0.5">{formattedTime}</p>
    </div>
  );
}
