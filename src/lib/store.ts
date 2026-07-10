import { prisma } from "@/lib/prisma";

export interface StoreSettings {
  storeName: string;
  tagline: string | null;
  whatsapp: string | null;
  email: string | null;
  about: string | null;
}

const DEFAULTS: StoreSettings = {
  storeName: "Infinity Aura",
  tagline: "Quality products & services, across industries",
  whatsapp: null,
  email: null,
  about: null,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const row = await prisma.storeSetting.findUnique({ where: { id: "store" } });
    if (!row) return DEFAULTS;
    return {
      storeName: row.storeName || DEFAULTS.storeName,
      tagline: row.tagline ?? DEFAULTS.tagline,
      whatsapp: row.whatsapp,
      email: row.email,
      about: row.about,
    };
  } catch {
    return DEFAULTS;
  }
}

export function waLink(whatsapp: string, text: string): string {
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
