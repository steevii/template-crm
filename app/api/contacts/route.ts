import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB_ID = process.env.NOTION_CRM_DB_ID!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToContact(page: any) {
  const p = page.properties ?? {};
  const knownKeys = ["Name", "Company", "Stage"];
  const fields: Record<string, string> = {};
  for (const [key, val] of Object.entries(p)) {
    if (knownKeys.includes(key)) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields[key] = (val as any)?.rich_text?.[0]?.plain_text ?? "";
  }
  return {
    id: page.id,
    name: p.Name?.title?.[0]?.plain_text ?? "",
    company: p.Company?.rich_text?.[0]?.plain_text ?? "",
    stage: p.Stage?.select?.name ?? "",
    fields,
  };
}

export async function GET() {
  try {
    const res = await notion.databases.query({
      database_id: DB_ID,
      sorts: [{ timestamp: "created_time", direction: "ascending" }],
    });
    return NextResponse.json(res.results.map(pageToContact));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, company, stage } = await req.json();
    const page = await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: {
        Name:    { title: [{ text: { content: name ?? "Sans nom" } }] },
        Company: { rich_text: [{ text: { content: company ?? "" } }] },
        Stage:   { select: { name: stage } },
      } as never,
    });
    return NextResponse.json(pageToContact(page));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
