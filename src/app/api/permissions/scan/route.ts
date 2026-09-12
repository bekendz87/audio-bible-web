import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const file = await readFile(path.join(process.cwd(), "data", "api-permissions.json"), "utf8");
    return NextResponse.json(JSON.parse(file));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
