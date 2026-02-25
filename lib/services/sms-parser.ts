import { GoogleGenerativeAI } from "@google/generative-ai";

interface ParsedTransaction {
  amount: number;
  date: Date;
  merchant: string;
  category: string;
  type: "debit" | "credit" | "transfer" | "fee";
  confidence: number;
  rawText: string;
}

const client = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

/**
 * Parse SMS messages containing financial transactions
 * Uses Gemini to intelligently extract and categorize transaction data
 */
export async function parseSMSTransaction(
  smsText: string
): Promise<ParsedTransaction> {
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `You are a financial transaction parser. Extract transaction details from SMS messages.
Return a JSON object with these fields:
- amount: number (absolute value)
- date: ISO 8601 date string
- merchant: string (name of merchant/bank)
- category: string (choose from: groceries, utilities, entertainment, transportation, dining, shopping, healthcare, insurance, fees, salary, transfer, other)
- type: string (one of: debit, credit, transfer, fee)
- confidence: number (0-1, how confident you are in the parse)

Be strict about date parsing - use context clues. If no date, use today.
Categorize intelligently based on merchant and amount patterns.`;

  const userPrompt = `Parse this SMS: "${smsText}"`;

  try {
    const response = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const text =
      response.content.parts[0].type === "text"
        ? response.content.parts[0].text
        : "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      amount: Math.abs(parsed.amount),
      date: new Date(parsed.date),
      merchant: parsed.merchant || "Unknown",
      category: parsed.category || "other",
      type: parsed.type || "debit",
      confidence: Math.min(Math.max(parsed.confidence || 0.8, 0), 1),
      rawText: smsText,
    };
  } catch (error) {
    console.error("[v0] SMS parsing error:", error);
    // Fallback: basic regex parsing
    return fallbackParseSMS(smsText);
  }
}

/**
 * Fallback SMS parser using regex patterns
 * Used when AI parsing fails
 */
function fallbackParseSMS(smsText: string): ParsedTransaction {
  const amountMatch = smsText.match(/[\$£€]?\s*(\d+[.,]\d{2})/);
  const amount = amountMatch
    ? parseFloat(amountMatch[1].replace(",", ""))
    : 0;

  const isCredit =
    smsText.toLowerCase().includes("credit") ||
    smsText.toLowerCase().includes("deposited") ||
    smsText.toLowerCase().includes("received");
  const isFee =
    smsText.toLowerCase().includes("fee") ||
    smsText.toLowerCase().includes("charge");
  const isTransfer =
    smsText.toLowerCase().includes("transfer") ||
    smsText.toLowerCase().includes("sent to");

  let type: "debit" | "credit" | "transfer" | "fee" = "debit";
  if (isFee) type = "fee";
  else if (isTransfer) type = "transfer";
  else if (isCredit) type = "credit";

  const merchantMatch = smsText.match(/at\s+([A-Za-z0-9\s]+?)(?:\.|,|$)/i);
  const merchant = merchantMatch
    ? merchantMatch[1].trim()
    : smsText.substring(0, 30);

  return {
    amount,
    date: new Date(),
    merchant,
    category: "other",
    type,
    confidence: 0.5,
    rawText: smsText,
  };
}

/**
 * Batch parse multiple SMS messages
 */
export async function parseSMSBatch(
  smsMessages: string[]
): Promise<ParsedTransaction[]> {
  return Promise.all(smsMessages.map((sms) => parseSMSTransaction(sms)));
}
