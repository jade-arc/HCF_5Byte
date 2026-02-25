import { NextRequest, NextResponse } from 'next/server';
import {
  addTransaction,
  addTransactionsBatch,
  getUserTransactions,
  updateTransaction,
  deleteTransaction,
  getSpendingSummary,
} from '@/lib/services/user-transaction-manager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/transactions/manage
 * Get user transactions
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
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    const transactions = await getUserTransactions(userId, {
      limit,
      offset,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      category: category || undefined,
    });

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions/manage
 * Add a transaction or batch of transactions
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: No user ID provided' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if it's a batch operation
    if (Array.isArray(body)) {
      const transactions = await addTransactionsBatch(userId, body);
      return NextResponse.json(
        {
          success: true,
          message: `Added ${transactions.length} transactions`,
          transactions,
        },
        { status: 201 }
      );
    }

    // Single transaction
    const { date, merchant, category, amount, transactionType, description, source } = body;

    if (!date || !merchant || !category || amount === undefined || !transactionType) {
      return NextResponse.json(
        {
          error: 'Missing required fields: date, merchant, category, amount, transactionType',
        },
        { status: 400 }
      );
    }

    const transaction = await addTransaction(userId, {
      date,
      merchant,
      category,
      amount,
      transactionType,
      description,
      source,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction added successfully',
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding transaction:', error);
    return NextResponse.json(
      { error: 'Failed to add transaction', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/transactions/manage?id={transactionId}
 * Update a transaction
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: No user ID provided' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing transaction ID parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const transaction = await updateTransaction(userId, transactionId, body);

    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transactions/manage?id={transactionId}
 * Delete a transaction
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: No user ID provided' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing transaction ID parameter' },
        { status: 400 }
      );
    }

    await deleteTransaction(userId, transactionId);

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction', details: String(error) },
      { status: 500 }
    );
  }
}
