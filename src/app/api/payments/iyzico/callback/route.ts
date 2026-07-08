import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { retrieveCheckoutForm } from "@/lib/payments/iyzico";

export const dynamic = "force-dynamic";

/**
 * iyzico posts the checkout-form token here when the customer finishes paying.
 * The result is NEVER trusted from the redirect alone — we verify the token
 * against iyzico's API server-side, then update the order accordingly and
 * send the customer to the confirmation page.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");
  return handleCallback(request, token);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  return handleCallback(request, token);
}

async function handleCallback(request: NextRequest, token: string) {
  const origin = request.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${origin}/cart`, 303);
  }

  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, payment_status")
    .eq("payment_reference", token)
    .maybeSingle();

  if (!order) {
    return NextResponse.redirect(`${origin}/cart`, 303);
  }

  // Already settled (double callback) — just show the confirmation.
  if (order.payment_status === "paid") {
    return NextResponse.redirect(
      `${origin}/checkout/confirmation?order=${order.order_number}`,
      303
    );
  }

  const result = await retrieveCheckoutForm(token);
  const paid = result.status === "success" && result.paymentStatus === "SUCCESS";

  await supabase
    .from("orders")
    .update({
      payment_status: paid ? "paid" : "failed",
      status: paid ? "processing" : "pending",
      payment_reference: result.paymentId ?? token,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  const destination = paid
    ? `${origin}/checkout/confirmation?order=${order.order_number}`
    : `${origin}/checkout/confirmation?order=${order.order_number}&payment=failed`;

  return NextResponse.redirect(destination, 303);
}
