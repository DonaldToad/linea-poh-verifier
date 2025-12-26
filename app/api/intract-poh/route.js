import axios from "axios";
import { NextResponse } from "next/server";

// GET /api/intract-poh?address=0x...
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const wallet = (searchParams.get("address") || "").toLowerCase();

    if (!wallet || !wallet.startsWith("0x")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid wallet address"
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const pohUrl = `https://poh-api.linea.build/poh/v2/${wallet}`;

    let resp;
    try {
      resp = await axios.get(pohUrl, { timeout: 8000 });
    } catch (error) {
      console.error("Linea PoH API Error (Intract):", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          message: "Linea PoH service unavailable"
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const data = resp.data;

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
          message: "Wallet is PoH verified on Linea."
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Wallet is NOT PoH verified on Linea. Complete the Linea PoH flow first."
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
    }
  } catch (err) {
    console.error("Unexpected Intract PoH error:", err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected server error. Please try again."
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
