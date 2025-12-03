"use server";

import { NextResponse } from "next/server";

const RPC_TARGET =
  process.env.SEPOLIA_RPC_URL ?? process.env.NEXT_PUBLIC_SEPOLIA_PROVIDER_URL;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  if (!RPC_TARGET) {
    return NextResponse.json(
      { error: "RPC target is not configured" },
      {
        status: 500,
        headers: CORS_HEADERS,
      },
    );
  }

  const payload = await request.text();

  try {
    const upstreamResponse = await fetch(RPC_TARGET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      cache: "no-store",
    });

    const responseBody = await upstreamResponse.text();

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type":
          upstreamResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("[starknet-rpc] Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to reach Starknet RPC" },
      {
        status: 502,
        headers: CORS_HEADERS,
      },
    );
  }
}


