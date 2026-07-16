import { dojahConfig } from "@/lib/env";

const DOJAH_BASE_URL = dojahConfig.environment === "production"
  ? "https://api.dojah.io"
  : "https://api.dojah.io";

function base64Encode(str: string): string {
  return btoa(str);
}

async function dojahRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${DOJAH_BASE_URL}${endpoint}`;
  const credentials = base64Encode(
    `${dojahConfig.appId}:${dojahConfig.secretKey}`
  );

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Dojah API error: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
    );
  }

  return response.json();
}

export interface DojahVerificationSession {
  entity: {
    id: string;
    type: "individual" | "business";
    verification_type: "document" | "biometric" | "address" | "phone" | "email";
  };
  redirect_url?: string;
  callback_url?: string;
  metadata?: Record<string, string>;
}

export interface DojahVerificationResult {
  entity_id: string;
  status: "pending" | "verified" | "rejected" | "failed";
  verification_type: string;
  data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DojahDocumentVerificationRequest {
  document_type: "passport" | "drivers_license" | "national_id" | "voters_card";
  document_front: string;
  document_back?: string;
  selfie?: string;
  country?: string;
}

export interface DojahBiometricVerificationRequest {
  selfie: string;
  document_type?: string;
  document_number?: string;
}

export interface DojahAddressVerificationRequest {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
}

export async function createDojahVerificationSession(
  params: DojahVerificationSession
): Promise<{ session_id: string; redirect_url: string }> {
  return dojahRequest("/v1/verification/session", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function verifyDojahDocument(
  params: DojahDocumentVerificationRequest
): Promise<DojahVerificationResult> {
  return dojahRequest("/v1/verification/document", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function verifyDojahBiometric(
  params: DojahBiometricVerificationRequest
): Promise<DojahVerificationResult> {
  return dojahRequest("/v1/verification/biometric", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function verifyDojahAddress(
  params: DojahAddressVerificationRequest
): Promise<DojahVerificationResult> {
  return dojahRequest("/v1/verification/address", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getDojahVerificationStatus(
  entityId: string
): Promise<DojahVerificationResult> {
  return dojahRequest(`/v1/verification/status/${entityId}`, {
    method: "GET",
  });
}

export function verifyDojahWebhook(signature: string, payload: string): boolean {
  const expectedSignature = base64Encode(
    `${dojahConfig.appId}:${dojahConfig.secretKey}`
  );
  return signature === expectedSignature;
}