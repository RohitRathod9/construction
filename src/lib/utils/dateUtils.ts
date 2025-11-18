
/**
 * Calculates the number of hours between two time strings (HH:mm).
 * @param {string} startTime - The start time in HH:mm format.
 * @param {string} endTime - The end time in HH:mm format.
 * @returns {number} The total hours worked.
 */
export const calculateHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  let diffMinutes = endTotalMinutes - startTotalMinutes;
  if (diffMinutes < 0) { // Handles overnight work
    diffMinutes += 24 * 60;
  }

  return diffMinutes / 60;
};

/**
 * Formats a JavaScript Date object or a Firestore Timestamp into a string (e.g., YYYY-MM-DD).
 */
export const formatDate = (date) => {
    if (!date) return '';
    // Firestore Timestamps have a toDate() method
    const d = date.toDate ? date.toDate() : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
