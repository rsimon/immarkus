// Helper
export const removeEmpty = (value: string | string[]): string | string[] => {
  if (Array.isArray(value)) {
    // Remove empty values
    const filtered = value.filter(Boolean);
    if (filtered.length > 1) {
      return filtered;
    } else {
      return filtered[0];
    }
  } else {
    return value;
  }
}
