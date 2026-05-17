import { prisma } from "@/lib/prisma";

interface CreateProductInput {
  slug: string;
  name: string;
  description?: string;
  locale?: string;
  currency?: string;
  price: number;
  stripe_price_id?: string;
  image_url?: string;
}

interface UpdateProductInput {
  slug?: string;
  name?: string;
  description?: string;
  locale?: string;
  currency?: string;
  price?: number;
  stripe_price_id?: string;
  image_url?: string;
  active?: boolean;
}

export async function createProduct(data: CreateProductInput) {
  return prisma.product.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      locale: data.locale || "en",
      currency: data.currency || "usd",
      price: data.price,
      stripe_price_id: data.stripe_price_id,
      image_url: data.image_url,
    },
  });
}

export async function listProducts() {
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { created_at: "desc" },
  });
}

export async function listAllProducts() {
  return prisma.product.findMany({
    orderBy: { created_at: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug },
  });
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}
