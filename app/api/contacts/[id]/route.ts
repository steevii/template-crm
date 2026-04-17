import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const properties: Record<string, unknown> = {};
    if (data.stage !== undefined)   properties.Stage   = { select: { name: data.stage } };
    if (data.company !== undefined) properties.Company = { rich_text: [{ text: { content: data.company } }] };
    if (data.name !== undefined)    properties.Name    = { title: [{ text: { content: data.name } }] };
    if (data.fields) {
      for (const [key, value] of Object.entries(data.fields)) {
        properties[key] = { rich_text: [{ text: { content: value as string } }] };
      }
    }
    await notion.pages.update({ page_id: params.id, properties: properties as never });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await notion.pages.update({ page_id: params.id, archived: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
