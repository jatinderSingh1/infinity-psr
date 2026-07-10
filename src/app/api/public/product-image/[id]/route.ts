import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: serves images only for products visible in the online store
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { image: true, isPublic: true, isActive: true },
  });

  if (!product?.isPublic || !product.isActive) return new NextResponse(null, { status: 404 });

  const match = product.image?.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!match) return new NextResponse(null, { status: 404 });

  const buf = Buffer.from(match[2], "base64");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "public, max-age=600",
    },
  });
}
