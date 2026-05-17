import { prisma } from "@/lib/prisma";

interface CreateShippingInput {
  country: string;
  price: number;
  days_min: number;
  days_max: number;
}

interface UpdateShippingInput {
  price?: number;
  days_min?: number;
  days_max?: number;
  active?: boolean;
}

export async function createShipping(data: CreateShippingInput) {
  return prisma.shipping.create({
    data: {
      country: data.country.toUpperCase(),
      price: data.price,
      days_min: data.days_min,
      days_max: data.days_max,
    },
  });
}

export async function listShippings() {
  return prisma.shipping.findMany({
    orderBy: { country: "asc" },
  });
}

export async function listActiveShippings() {
  return prisma.shipping.findMany({
    where: { active: true },
    orderBy: { country: "asc" },
  });
}

export async function getShippingByCountry(country: string) {
  return prisma.shipping.findUnique({
    where: { country: country.toUpperCase() },
  });
}

export async function getShippingById(id: string) {
  return prisma.shipping.findUnique({
    where: { id },
  });
}

export async function updateShipping(id: string, data: UpdateShippingInput) {
  return prisma.shipping.update({
    where: { id },
    data,
  });
}

export async function deleteShipping(id: string) {
  return prisma.shipping.delete({
    where: { id },
  });
}
