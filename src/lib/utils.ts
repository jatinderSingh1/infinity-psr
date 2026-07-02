const isSQLite = process.env.DATABASE_URL?.startsWith("file:");

/**
 * Safely coerce a Prisma field to string[].
 * Handles PostgreSQL (String[] → string[]) and SQLite (String → JSON text).
 */
export function asArr(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      return val ? [val] : [];
    }
  }
  return [];
}

/**
 * Serialize a string array for Prisma.
 * PostgreSQL: pass native string[]
 * SQLite: pass JSON-encoded string (the schema column is TEXT)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arrWrite(arr: string[]): any {
  return isSQLite ? JSON.stringify(arr) : arr;
}

/**
 * Returns `{ mode: "insensitive" }` for PostgreSQL full-text.
 * SQLite LIKE is already case-insensitive for ASCII, so no option is needed.
 */
export function searchMode(): { mode: "insensitive" } | object {
  return isSQLite ? {} : { mode: "insensitive" as const };
}
