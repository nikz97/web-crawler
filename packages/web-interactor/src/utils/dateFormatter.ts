export function formatDateForDatePicker(
  dateInput: string | Date,
): [string, string] {
  const date = new Date(dateInput);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const formattedDate = date.toLocaleDateString("en-US", options);
  const dayOfMonth = date.getDate().toString();

  return [formattedDate, dayOfMonth];
}

export function formatDateForInput(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const isoString = date.toISOString();
  return isoString.split("T")[0] ?? "";
}
