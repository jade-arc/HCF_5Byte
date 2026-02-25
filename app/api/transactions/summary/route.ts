import { NextRequest, NextResponse } from 'next/server';
import { getSpendingSummary } from '@/lib/services/user-transaction-manager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/transactions/summary
 * Get spending summary by category
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: No user ID provided' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const summary = await getSpendingSummary(userId, startDate || undefined, endDate || undefined);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Error fetching spending summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending summary', details: String(error) },
      { status: 500 }
    );
  }
}
