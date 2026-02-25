import crypto from 'crypto';
import { getSupabase } from '@/lib/supabase';

interface ApiKeyConfig {
  name: string;
  provider: 'gemini' | 'openai' | 'groq';
  key: string;
}

interface StoredApiKey {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

/**
 * Hash an API key for secure storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Create a new API key for the user
 */
export async function createApiKey(
  userId: string,
  config: ApiKeyConfig
): Promise<StoredApiKey> {
  const supabase = getSupabase();
  const keyHash = hashApiKey(config.key);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name: config.name,
      key_hash: keyHash,
      provider: config.provider,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create API key: ${error.message}`);

  return {
    id: data.id,
    name: data.name,
    provider: data.provider,
    isActive: data.is_active,
    lastUsedAt: data.last_used_at,
    createdAt: data.created_at,
  };
}

/**
 * Get all API keys for the user (hash only, not the actual key)
 */
export async function getUserApiKeys(userId: string): Promise<StoredApiKey[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, provider, is_active, last_used_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch API keys: ${error.message}`);

  return (data || []).map((key) => ({
    id: key.id,
    name: key.name,
    provider: key.provider,
    isActive: key.is_active,
    lastUsedAt: key.last_used_at,
    createdAt: key.created_at,
  }));
}

/**
 * Delete an API key
 */
export async function deleteApiKey(userId: string, keyId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to delete API key: ${error.message}`);
}

/**
 * Update API key active status
 */
export async function updateApiKeyStatus(
  userId: string,
  keyId: string,
  isActive: boolean
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: isActive })
    .eq('id', keyId)
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to update API key: ${error.message}`);
}

/**
 * Get the active API key for a provider
 */
export async function getActiveApiKey(
  userId: string,
  provider: string
): Promise<string | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('api_keys')
    .select('key_hash')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  // Note: This returns the hash, not the actual key. The actual key should be stored
  // in environment variables or retrieved from secure session after verification.
  return data.key_hash;
}

/**
 * Update last used timestamp for an API key
 */
export async function updateLastUsed(keyId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyId);

  if (error) console.error('Failed to update last_used_at:', error);
}

/**
 * Get user data configuration
 */
export async function getUserDataConfig(userId: string) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_data_config')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is expected for new users
    throw new Error(`Failed to fetch user config: ${error.message}`);
  }

  return data || null;
}

/**
 * Create or update user data configuration
 */
export async function upsertUserDataConfig(
  userId: string,
  config: Partial<{
    preferred_ai_provider: string;
    use_custom_api_key: boolean;
    data_retention_days: number;
    auto_categorize: boolean;
  }>
) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_data_config')
    .upsert(
      {
        user_id: userId,
        ...config,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw new Error(`Failed to save user config: ${error.message}`);

  return data;
}
