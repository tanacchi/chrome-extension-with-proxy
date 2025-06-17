/**
 * Detects the target table with the specified class name
 * @returns The first table element with 'ai-target-table-table' class, or null if not found
 */
export const detectTargetTable = (): HTMLTableElement | null => {
  const targetTable = document.querySelector('table.ai-target-table-table') as HTMLTableElement | null;
  return targetTable;
};

/**
 * Extracts data from the second column of table rows
 * @param table - The table element to extract data from
 * @returns Array of strings from the second column, excluding empty rows
 */
export const extractTableData = (table: HTMLTableElement): string[] => {
  const data: string[] = [];

  // Try to find tbody first, fallback to direct table rows
  const tbody = table.querySelector('tbody');
  const rows = tbody ? tbody.querySelectorAll('tr') : table.querySelectorAll('tr');

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');

    // Check if the row has at least 2 columns
    if (cells.length >= 2) {
      const secondColumnData = cells[1].textContent?.trim() || '';

      // Only include non-empty data
      if (secondColumnData) {
        data.push(secondColumnData);
      }
    }
  });

  return data;
};

/**
 * Main function to detect table and extract data
 * @returns Array of strings from the second column of the detected table, or empty array if no table found
 */
export const detectAndExtractTableData = (): string[] => {
  const table = detectTargetTable();

  if (!table) {
    return [];
  }

  return extractTableData(table);
};
