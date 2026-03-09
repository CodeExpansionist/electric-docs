import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "page-views.json");

function readViews(): Record<string, number> {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeViews(views: Record<string, number>) {
  fs.writeFileSync(filePath, JSON.stringify(views, null, 2));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const productId = body.productId;

  if (!productId || typeof productId !== "string" || !/^\d{5,10}$/.test(productId)) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const views = readViews();

  if (!(productId in views) && Object.keys(views).length >= 10000) {
    return NextResponse.json({ error: "View limit reached" }, { status: 429 });
  }

  views[productId] = (views[productId] || 0) + 1;
  writeViews(views);

  return NextResponse.json({ productId, views: views[productId] });
}

export async function GET() {
  const views = readViews();
  return NextResponse.json(views);
}
