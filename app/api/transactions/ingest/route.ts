import { NextRequest, NextResponse } from "next/server";
import { parseSMSTransaction } from "@/lib/services/sms-parser";
import { saveTransaction } from "@/lib/supabase";

// Prevent static generation for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/transactions/ingest
 * Ingest SMS messages and parse transactions
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, smsMessages } = await request.json();

    if (!userId || !smsMessages || !Array.isArray(smsMessages)) {
      return NextResponse.json(
        { error: "Missing userId or smsMessages array" },
        { status: 400 }
      );
    }

    const results = [];

    for (const sms of smsMessages) {
      try {
        // Parse SMS using Gemini
        const parsed = await parseSMSTransaction(sms);

        // Save to database
        const saved = await saveTransaction(userId, {
          raw_sms_text: sms,
          parsed_amount: parsed.amount,
          parsed_date: parsed.date.toISOString(),
          merchant_name: parsed.merchant,
          category: parsed.category,
          transaction_type: parsed.type,
          confidence_score: parsed.confidence,
        });

        results.push({
          sms,
          parsed,
          saved: true,
          data: saved,
        });
      } catch (error) {
        results.push({
          sms,
          saved: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      ingested: smsMessages.length,
      successful: results.filter((r) => r.saved).length,
      failed: results.filter((r) => !r.saved).length,
      results,
    });
  } catch (error) {
    console.error("[v0] Transaction ingestion error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to ingest transactions",
      },
      { status: 500 }
    );
  }
}
