import axios from "axios";
import { NextResponse } from "next/server";

// GET /api/check-poh?wallet=0x...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = (searchParams.get("wallet") || "").toLowerCase();

    if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing wallet address."
        },
        { status: 400 }
      );
    }

    const pohUrl = `https://poh-api.linea.build/poh/v2/${wallet}`;

    let resp;
    try {
      resp = await axios.get(pohUrl, { timeout: 8000 });
    } catch (error) {
      console.error("Error calling Linea PoH API:", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          message: "Error contacting Linea PoH API. Please try again later."
        },
        { status: 502 }
      );
    }

    const data = resp.data || {};
    const isVerified = !!data.verified;

    if (isVerified) {
      return NextResponse.json({
        success: true,
        message: "Wallet is PoH verified on Linea.",
        data: {
          verified: true,
          source: "linea_poh_api",
          raw: data
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message:
          "Wallet is NOT PoH verified on Linea. Complete the Linea PoH flow first.",
        data: {
          verified: false,
          source: "linea_poh_api",
          raw: data
        }
      });
    }
  } catch (err) {
    console.error("Unexpected error in check-poh route:", err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected server error."
      },
      { status: 500 }
    );
  }
}
