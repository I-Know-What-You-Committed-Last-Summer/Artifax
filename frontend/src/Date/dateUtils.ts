/**
 * Get current date formatted for South African timezone
 * Returns format: "Mon, DD MMM YYYY" (day of week instead of "Today")
 */
export const getCurrentDateSAST = (): string => {
  const now = new Date();
  
  // Format to South African timezone (SAST - UTC+2)
  const saftDate = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' }));
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = saftDate.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[saftDate.getMonth()];
  const year = saftDate.getFullYear();
  const dayOfWeek = dayNames[saftDate.getDay()];
  
  return `${dayOfWeek}, ${day} ${month} ${year}`;
};
