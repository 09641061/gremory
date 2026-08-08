"use client";

import { useActionState, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Calendar, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { createAppointmentAction } from "../actions/create-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "../actions/create-appointment.action";
import { MemberResponse } from "../models/member-response";
import { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { useSelectorMenu } from "@/contexts/business/interfaces/components/use-selector-menu";
import { cn } from "@/lib/utils";
import {
  calculateAppointmentTimes,
  generateAppointmentTimeSlots,
  getAppointmentDuration,
} from "@/contexts/scheduling/application/services/appointment-time.service";

interface AppointmentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  establishmentId: string;
  services: DetailedServiceDTO[];
  members: MemberResponse[];
  customers: CustomerResponse[];
  onSuccess: () => void;
}

const initialActionState: ActionState<Appointment> = {
  status: "idle",
  data: null,
  error: null,
  fieldErrors: null,
};

type DropdownOption = {
  value: string;
  label: string;
  description?: string;
};

type PopupPlacement = "top" | "bottom";

function useAdaptivePopup(isOpen: boolean, anchorRef: React.RefObject<HTMLElement | null>) {
  const [placement, setPlacement] = useState<PopupPlacement>("bottom");
  const [maxHeight, setMaxHeight] = useState(256);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      if (!anchorRect) return;

      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - anchorRect.bottom;
      const spaceAbove = anchorRect.top;
      const shouldOpenUp = spaceBelow < 240 && spaceAbove > spaceBelow;

      setPlacement(shouldOpenUp ? "top" : "bottom");
      setMaxHeight(Math.max(160, Math.min(320, shouldOpenUp ? spaceAbove - 16 : spaceBelow - 16)));
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);

    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [anchorRef, isOpen]);

  return { placement, maxHeight };
}

interface DropdownFieldProps {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

function DropdownField({
  id,
  name,
  placeholder,
  value,
  options,
  onChange,
}: DropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { placement, maxHeight } = useAdaptivePopup(isOpen, buttonRef);

  useSelectorMenu(isOpen, setIsOpen, selectorRef);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={selectorRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-border bg-transparent px-3 text-left text-sm text-foreground transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-muted/30",
          isOpen && "border-ring bg-card shadow-sm"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 z-50 w-full",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_20px_45px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="overflow-y-auto p-2" style={{ maxHeight }}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                      "hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none",
                      isSelected && "bg-primary/10 ring-1 ring-primary/15"
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{option.label}</div>
                      {option.description && (
                        <div className="truncate text-xs text-muted-foreground">{option.description}</div>
                      )}
                    </div>
                    {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DateFieldProps {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function parseDateInput(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(month: Date) {
  const firstDay = startOfMonth(month);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days: Array<Date | null> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function DateField({ id, name, placeholder, value, onChange }: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(parseDateInput(value) ?? new Date()));
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { placement, maxHeight } = useAdaptivePopup(isOpen, buttonRef);

  useSelectorMenu(isOpen, setIsOpen, selectorRef);

  const selectedDate = parseDateInput(value);
  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div ref={selectorRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        ref={buttonRef}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          if (!isOpen) {
            setVisibleMonth(startOfMonth(parseDateInput(value) ?? new Date()));
          }
          setIsOpen((open) => !open);
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-border bg-transparent px-3 text-left text-sm text-foreground transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-muted/30",
          isOpen && "border-ring bg-card shadow-sm"
        )}
      >
        <span className={cn("truncate", !selectedDate && "text-muted-foreground")}>
          {selectedDate
            ? selectedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : placeholder}
        </span>
        <Calendar className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 z-50 w-[19rem]",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_20px_45px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="text-sm font-medium text-foreground">{monthLabel}</div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="p-2" style={{ maxHeight }}>
              <div className="grid grid-cols-7 gap-1 px-1 pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {weekDays.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-9" />;
                  }

                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={formatDateInput(day)}
                      type="button"
                      onClick={() => {
                        onChange(formatDateInput(day));
                        setIsOpen(false);
                      }}
                      className={cn(
                        "h-9 rounded-xl text-sm transition-colors",
                        "hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none",
                        isToday && !isSelected && "bg-primary/5 text-primary",
                        isSelected && "bg-primary text-primary-foreground shadow-sm"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppointmentFormModal({
  isOpen,
  onOpenChange,
  establishmentId,
  services,
  members,
  customers,
  onSuccess,
}: AppointmentFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    createAppointmentAction,
    initialActionState
  );

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const timeSlots = generateAppointmentTimeSlots();

  const serviceOptions = services.map((service) => ({
    value: service.id,
    label: service.name,
    description: `$${service.price.toFixed(2)} - ${service.durationMinutes} min`,
  }));

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
    description: customer.email || customer.phone || "Customer",
  }));

  const employeeOptions = members.map((member) => ({
    value: member.userId,
    label: member.name,
    description: member.role,
  }));

  const timeOptions = timeSlots.map((slot) => {
    const [h, m] = slot.split(":").map(Number);
    const formatted = h! > 12 ? `${h! - 12}:${String(m!).padStart(2, "0")} PM` : h === 12 ? `12:${String(m!).padStart(2, "0")} PM` : `${h}:${String(m!).padStart(2, "0")} AM`;
    return {
      value: slot,
      label: formatted,
    };
  });

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  const { startsAt, endsAt, formattedEnd } = calculateAppointmentTimes(
    startDate,
    startTime,
    getAppointmentDuration(services, selectedServiceId),
  );

  return (
    <>
      <ErrorAlert title="Scheduling Failed" message={state.error ?? undefined} />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="establishmentId" value={establishmentId} />
            <input type="hidden" name="startsAt" value={startsAt} />
            <input type="hidden" name="endsAt" value={endsAt} />
            
            <DialogHeader>
              <DialogTitle>New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule a new appointment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="create-title">Appointment Title</Label>
              <Input
                id="create-title"
                name="title"
                placeholder="e.g. Haircut & Beard Trim"
                required
                defaultValue=""
              />
              {state.fieldErrors?.title && (
                <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-service">Service</Label>
              <DropdownField
                id="create-service"
                name="serviceId"
                placeholder="Select a service..."
                value={selectedServiceId}
                onChange={setSelectedServiceId}
                options={serviceOptions}
              />
              {state.fieldErrors?.serviceId && (
                <p className="text-xs text-destructive">{state.fieldErrors.serviceId[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-customer">Customer</Label>
              <DropdownField
                id="create-customer"
                name="customerId"
                placeholder="Select a customer..."
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                options={customerOptions}
              />
              {state.fieldErrors?.customerId && (
                <p className="text-xs text-destructive">{state.fieldErrors.customerId[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-employee">Employee / Specialist</Label>
              <DropdownField
                id="create-employee"
                name="employeeId"
                placeholder="Select an employee..."
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
                options={employeeOptions}
              />
              {state.fieldErrors?.employeeId && (
                <p className="text-xs text-destructive">{state.fieldErrors.employeeId[0]}</p>
              )}
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-startDate">Start Date</Label>
                <DateField
                  id="create-startDate"
                  name="startDate"
                  placeholder="dd/mm/aaaa"
                  value={startDate}
                  onChange={setStartDate}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-startTime">Start Time</Label>
                <DropdownField
                  id="create-startTime"
                  name="startTime"
                  placeholder="Select time..."
                  value={startTime}
                  onChange={setStartTime}
                  options={timeOptions}
                />
              </div>
            </div>

            {startsAt && endsAt && (
              <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculated End Time</p>
                <p className="text-sm font-medium text-foreground">{formattedEnd}</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !startsAt || !endsAt}>
                {isPending ? "Scheduling..." : "Create Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
