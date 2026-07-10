import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return new NextResponse(null, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { image: true },
  });

  const match = product?.image?.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!match) return new NextResponse(null, { status: 404 });

  const buf = Buffer.from(match[2], "base64");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "private, max-age=300",
    },
  });
}
