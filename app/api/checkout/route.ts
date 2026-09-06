import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY. Add a free test key from dashboard.stripe.com/test/apikeys." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });
  const { productName, amountCents, currency = "usd" } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: productName || "Item" },
          unit_amount: amountCents || 500,
        },
        quantity: 1,
      },
    ],
    success_url: `${req.nextUrl.origin}/builder?paid=1`,
    cancel_url: `${req.nextUrl.origin}/builder?paid=0`,
  });

  return NextResponse.json({ url: session.url });
}
