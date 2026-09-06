import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Writes generated server/*.ts files into app/api/generated/... on disk.
// Only works in local dev — production hosts (Vercel etc.) run on a read-only
// filesystem, so this is intentionally disabled there. In production, use the
// zip download and commit the files through git instead.
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "Auto-activation only works in local dev (npm run dev). Production hosts don't allow writing files at runtime — download the .zip and commit the server files instead.",
      },
      { status: 403 }
    );
  }

  const { files } = await req.json();
  if (!Array.isArray(files)) {
    return NextResponse.json({ error: "files array required." }, { status: 400 });
  }

  const written: string[] = [];
  for (const f of files) {
    if (!f.path?.startsWith("server/")) continue;
    const relative = f.path.replace(/^server\//, "");
    const dest = path.join(process.cwd(), "app", "api", "generated", relative);
    // route handlers need to live at .../generated/<name>/route.ts
    const dir = dest.endsWith("route.ts") ? path.dirname(dest) : path.join(path.dirname(dest), path.basename(dest, path.extname(dest)));
    const finalPath = dest.endsWith("route.ts") ? dest : path.join(dir, "route.ts");
    await fs.mkdir(path.dirname(finalPath), { recursive: true });
    await fs.writeFile(finalPath, f.content, "utf-8");
    written.push(`/api/generated/${path.relative(path.join(process.cwd(), "app", "api", "generated"), path.dirname(finalPath)).replace(/\\/g, "/")}`);
  }

  return NextResponse.json({ written });
}
