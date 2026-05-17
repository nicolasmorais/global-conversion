import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { listTemplates, upsertTemplate, resetTemplatesToDefaults } from "@/services/email-template.service";
import { sendTestEmail } from "@/services/email.service";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const templates = await listTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("[EmailTemplates GET] Erro:", error);
    return NextResponse.json({ error: "Erro ao listar templates" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.type || !body.locale || !body.subject || !body.html) {
      return NextResponse.json(
        { error: "type, locale, subject e html são obrigatórios" },
        { status: 400 }
      );
    }

    const template = await upsertTemplate(body.type, body.locale, {
      subject: body.subject,
      html: body.html,
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("[EmailTemplates PUT] Erro:", error);
    return NextResponse.json({ error: "Erro ao salvar template" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!verifyToken(token)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    if (body.action === "reset") {
      const results = await resetTemplatesToDefaults(body.locale);
      return NextResponse.json({ success: true, results });
    }

    if (!body.to || !body.type) {
      return NextResponse.json(
        { error: "to e type são obrigatórios" },
        { status: 400 }
      );
    }

    const success = await sendTestEmail(body.to, body.type, body.locale || "en");

    if (success) {
      return NextResponse.json({ success: true, message: "Email de teste enviado" });
    } else {
      return NextResponse.json(
        { error: "Erro ao enviar email de teste" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[EmailTemplates POST] Erro:", error);
    return NextResponse.json({ error: "Erro ao enviar email de teste" }, { status: 500 });
  }
}
