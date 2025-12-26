import axios from "axios";
import { NextResponse } from "next/server";

// GET /api/check-poh?wallet=0x...   OR   ?address=0x...
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Accept both ?wallet= and ?address= (Intract uses "address")
    let wallet =
      (searchParams.get("wallet") ||
        searchParams.get("address") ||
        "").toLowerCase();

    // Basic sanity check (do not hard validate length — Linea PoH accepts variable formats)
    if (!wallet || !wallet.startsWith("0x")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing wallet address."
        },
        { status: 200 } // keep 200 so Intract doesn't treat as task API failure
      );
    }

    const pohUrl = `https://poh-api.linea.build/poh/v2/${wallet}`;

    let resp;
    try {
      resp = await axios.get(pohUrl, { timeout: 8000 });
    } catch (error) {
      console.error("Linea PoH API Error:", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to reach Linea PoH service. Please try again shortly."
        },
        { status: 200 }
      );
    }

    const data = resp.data;

    // Handle ALL current Linea PoH API response styles:
    // 1) true / false
    // 2) { verified: true }
    // 3) { isVerified: true }
    // 4) { status: "VERIFIED" }
    let isVerified = false;

    if (typeof data === "boolean") {
      isVerified = data;
    } else if (data && typeof data === "object") {
      if (typeof data.verified === "boolean") {
        isVerified = data.verified;
      } else if (typeof data.isVerified === "boolean") {
        isVerified = data.isVerified;
      } else if (
        typeof data.status === "string" &&
        data.status.toUpperCase() === "VERIFIED"
      ) {
        isVerified = true;
      }
    }

    if (isVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Wallet is PoH verified on Linea.",
          data: {
            verified: true,
            source: "linea_poh_api",
            raw: data
          }
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet is NOT PoH verified on Linea. Complete the Linea PoH flow first.",
          data: {
            verified: false,
            source: "linea_poh_api",
            raw: data
          }
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("Unexpected API error:", err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected server error. Please try again."
      },
      { status: 200 }
    );
  }
}
