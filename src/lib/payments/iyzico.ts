import "server-only";
import { createHmac, randomBytes } from "crypto";

/**
 * Minimal iyzico client for the hosted Checkout Form (no SDK dependency).
 *
 * Flow:
 *  1. `initializeCheckoutForm` — creates a payment session, returns a hosted
 *     `paymentPageUrl` that the customer is redirected to.
 *  2. iyzico POSTs a `token` to our callback URL when the customer finishes.
 *  3. `retrieveCheckoutForm` — verifies the token server-side and returns the
 *     real payment result; only then is the order marked paid.
 *
 * Auth: IYZWSv2 HMAC-SHA256 signature scheme.
 * The base URL follows the key: sandbox keys hit the sandbox API.
 */

function config() {
  const apiKey = process.env.IYZICO_API_KEY ?? "";
  const secretKey = process.env.IYZICO_SECRET_KEY ?? "";
  const baseUrl =
    process.env.IYZICO_BASE_URL ??
    (apiKey.startsWith("sandbox-")
      ? "https://sandbox-api.iyzipay.com"
      : "https://api.iyzipay.com");
  return { apiKey, secretKey, baseUrl };
}

export function iyzicoConfigured(): boolean {
  const { apiKey, secretKey } = config();
  return Boolean(apiKey && secretKey);
}

async function request<T>(uriPath: string, body: object): Promise<T> {
  const { apiKey, secretKey, baseUrl } = config();
  const requestBody = JSON.stringify(body);
  const randomKey = Date.now().toString() + randomBytes(4).toString("hex");

  const signature = createHmac("sha256", secretKey)
    .update(randomKey + uriPath + requestBody)
    .digest("hex");

  const authorization =
    "IYZWSv2 " +
    Buffer.from(
      `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`
    ).toString("base64");

  const response = await fetch(baseUrl + uriPath, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "x-iyzi-rnd": randomKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: requestBody,
    cache: "no-store",
  });

  return (await response.json()) as T;
}

export interface CheckoutFormInitParams {
  conversationId: string;
  basketId: string;
  /** Sum of basket item prices */
  price: string;
  /** Final charged amount (items + shipping) */
  paidPrice: string;
  currency: "TRY" | "USD";
  callbackUrl: string;
  locale: "tr" | "en";
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    identityNumber: string;
    address: string;
    city: string;
    country: string;
    ip: string;
  };
  address: {
    contactName: string;
    city: string;
    country: string;
    addressLine: string;
    zipCode?: string;
  };
  basketItems: { id: string; name: string; category: string; price: string }[];
}

export interface CheckoutFormInitResult {
  status: "success" | "failure";
  errorMessage?: string;
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
}

export async function initializeCheckoutForm(
  params: CheckoutFormInitParams
): Promise<CheckoutFormInitResult> {
  const body = {
    locale: params.locale,
    conversationId: params.conversationId,
    price: params.price,
    paidPrice: params.paidPrice,
    currency: params.currency,
    basketId: params.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: params.buyer.id,
      name: params.buyer.name,
      surname: params.buyer.surname,
      gsmNumber: params.buyer.phone,
      email: params.buyer.email,
      identityNumber: params.buyer.identityNumber,
      registrationAddress: params.buyer.address,
      ip: params.buyer.ip,
      city: params.buyer.city,
      country: params.buyer.country,
    },
    shippingAddress: {
      contactName: params.address.contactName,
      city: params.address.city,
      country: params.address.country,
      address: params.address.addressLine,
      zipCode: params.address.zipCode || undefined,
    },
    billingAddress: {
      contactName: params.address.contactName,
      city: params.address.city,
      country: params.address.country,
      address: params.address.addressLine,
      zipCode: params.address.zipCode || undefined,
    },
    basketItems: params.basketItems.map((item) => ({
      id: item.id,
      name: item.name,
      category1: item.category,
      itemType: "PHYSICAL",
      price: item.price,
    })),
  };

  try {
    return await request<CheckoutFormInitResult>(
      "/payment/iyzipos/checkoutform/initialize/auth/ecom",
      body
    );
  } catch {
    return { status: "failure", errorMessage: "Could not reach the payment provider." };
  }
}

export interface CheckoutFormResult {
  status: "success" | "failure";
  paymentStatus?: "SUCCESS" | "FAILURE" | "INIT_THREEDS" | "CALLBACK_THREEDS";
  paymentId?: string;
  conversationId?: string;
  basketId?: string;
  paidPrice?: number;
  currency?: string;
  errorMessage?: string;
}

export async function retrieveCheckoutForm(token: string): Promise<CheckoutFormResult> {
  try {
    return await request<CheckoutFormResult>(
      "/payment/iyzipos/checkoutform/auth/ecom/detail",
      { locale: "en", token }
    );
  } catch {
    return { status: "failure", errorMessage: "Could not verify the payment." };
  }
}
