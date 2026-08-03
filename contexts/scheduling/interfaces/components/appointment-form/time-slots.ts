export function generateTimeSlots() {
  const slots: string[] = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 21 && minute > 0) break;
      const hStr = String(hour).padStart(2, "0");
      const mStr = String(minute).padStart(2, "0");
      slots.push(`${hStr}:${mStr}`);
    }
  }
  return slots;
}
