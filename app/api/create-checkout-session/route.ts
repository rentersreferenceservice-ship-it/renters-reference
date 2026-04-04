import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    console.log("STRIPE KEY PRESENT:", !!key, "STARTS WITH:", key?.slice(0, 7));
    const stripe = new Stripe(key!);
    const { landlordId, bizName, address, phone, email, website } = await req.json();
    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Renters Reference — Verified Business Listing",
              description: "Annual verified badge, contact info displayed on your profile.",
            },
            unit_amount: 2999,
            recurring: { interval: "year" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        landlord_id: landlordId,
        biz_name: bizName,
        address,
        phone,
        email,
        website: website ?? "",
      },
      success_url: `${origin}/?payment=success&landlord_id=${landlordId}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe session error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
