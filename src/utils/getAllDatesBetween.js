export default function getAllDatesBetween(startDate, endDate) {
  // Parse input strings as Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // If start > end, return empty array (or you could swap them if you prefer)
  if (start > end) {
    return [];
  }

  const dates = [];
  let current = new Date(start);

  while (current <= end) {
    // Format current date as "YYYY-MM-DD"
    const year  = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day   = String(current.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return dates;
}