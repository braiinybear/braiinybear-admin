// lib/cors.ts
import { NextResponse } from "next/server";

export function withCors(response: NextResponse, request?: Request) {
  // Allowed origins
  const allowedOrigins = [
    // "http://localhost:5173",
    // "http://localhost:3000",
    "https://www.braiinybear.org",

  ];

  // Get the origin from the request
  const origin = request?.headers.get("origin");

  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    // For same-origin requests or if origin is missing
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}
