import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createProduct, listAllProducts } from "@/services/product.service";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const products = await listAllProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("[Products GET] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao listar produtos" },
      { status: 500 }
    );
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

    if (!body.slug || !body.name || !body.price) {
      return NextResponse.json(
        { error: "slug, name e price são obrigatórios" },
        { status: 400 }
      );
    }

    const product = await createProduct({
      slug: body.slug,
      name: body.name,
      description: body.description,
      locale: body.locale,
      currency: body.currency,
      price: Math.round(body.price),
      stripe_price_id: body.stripe_price_id,
      image_url: body.image_url,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: unknown) {
    if ((error as Record<string, string>)?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um produto com esse slug e idioma" },
        { status: 409 }
      );
    }
    console.error("[Products POST] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
