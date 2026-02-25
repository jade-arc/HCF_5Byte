import { NextRequest, NextResponse } from 'next/server';
import {
  createApiKey,
  getUserApiKeys,
  deleteApiKey,
  updateApiKeyStatus,
} from '@/lib/services/api-key-manager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/keys/manage
 * Get all API keys for the authenticated user
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

    const keys = await getUserApiKeys(userId);

    return NextResponse.json({
      success: true,
      keys,
      count: keys.length,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/keys/manage
 * Create a new API key
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
    const { name, provider, key } = body;

    if (!name || !provider || !key) {
      return NextResponse.json(
        { error: 'Missing required fields: name, provider, key' },
        { status: 400 }
      );
    }

    if (!['gemini', 'openai', 'groq'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be: gemini, openai, or groq' },
        { status: 400 }
      );
    }

    const newKey = await createApiKey(userId, {
      name,
      provider,
      key,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'API key created successfully',
        key: newKey,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating API key:', error);

    if (error.message?.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'API key name already exists for this user' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create API key', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/keys/manage?id={keyId}
 * Update API key status
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
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'Missing key ID parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (isActive === undefined) {
      return NextResponse.json(
        { error: 'Missing isActive field' },
        { status: 400 }
      );
    }

    await updateApiKeyStatus(userId, keyId, isActive);

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully',
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/keys/manage?id={keyId}
 * Delete an API key
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
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'Missing key ID parameter' },
        { status: 400 }
      );
    }

    await deleteApiKey(userId, keyId);

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key', details: String(error) },
      { status: 500 }
    );
  }
}
