# API Key & Token Management System

## Overview

The Wealth Platform now supports a complete API key management system, allowing users to:
- Add their own AI provider API keys (Gemini, OpenAI, Groq)
- Manage and disable API keys securely
- Input custom transaction data via manual entry or CSV upload
- Make the platform fully dynamic with user-provided data

## Architecture

### Database Tables

#### `api_keys`
Stores encrypted API key metadata for each user.

```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- name: VARCHAR (user-friendly name)
- key_hash: VARCHAR (SHA-256 hash, never stores actual key)
- provider: VARCHAR ('gemini', 'openai', 'groq')
- is_active: BOOLEAN
- last_used_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `user_transactions`
Stores user-provided transaction data.

```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- date: DATE
- merchant: VARCHAR
- category: VARCHAR
- amount: DECIMAL(12, 2)
- transaction_type: VARCHAR ('income', 'expense', 'transfer')
- description: TEXT (optional)
- source: VARCHAR ('manual', 'csv', 'api', etc.)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `user_data_config`
Stores user preferences for data handling.

```sql
- user_id: UUID (primary key, unique)
- preferred_ai_provider: VARCHAR
- use_custom_api_key: BOOLEAN
- data_retention_days: INT (default 365)
- auto_categorize: BOOLEAN (default true)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Services

#### `api-key-manager.ts`
Manages API key lifecycle operations:
- `hashApiKey()` - Create SHA-256 hash of API key
- `createApiKey()` - Add new key for user
- `getUserApiKeys()` - Retrieve user's API keys
- `deleteApiKey()` - Remove API key
- `updateApiKeyStatus()` - Enable/disable key
- `getActiveApiKey()` - Get active key for provider
- `updateLastUsed()` - Track API key usage
- `getUserDataConfig()` - Get user settings
- `upsertUserDataConfig()` - Create/update settings

#### `user-transaction-manager.ts`
Manages transaction data:
- `addTransaction()` - Add single transaction
- `addTransactionsBatch()` - Batch import transactions
- `getUserTransactions()` - Retrieve with filters
- `updateTransaction()` - Modify transaction
- `deleteTransaction()` - Remove transaction
- `deleteTransactionsInRange()` - Bulk delete
- `getSpendingSummary()` - Category-based analysis

## API Endpoints

### API Key Management

#### `POST /api/keys/manage`
Create a new API key.

**Request:**
```json
{
  "name": "Production Key",
  "provider": "gemini",
  "key": "your-actual-api-key-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key created successfully",
  "key": {
    "id": "key-uuid",
    "name": "Production Key",
    "provider": "gemini",
    "isActive": true,
    "lastUsedAt": null,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### `GET /api/keys/manage`
List all API keys for user.

**Response:**
```json
{
  "success": true,
  "keys": [...],
  "count": 3
}
```

#### `PUT /api/keys/manage?id={keyId}`
Toggle API key active status.

**Request:**
```json
{
  "isActive": false
}
```

#### `DELETE /api/keys/manage?id={keyId}`
Delete an API key.

### Transaction Management

#### `POST /api/transactions/manage`
Add single transaction or batch.

**Single Transaction:**
```json
{
  "date": "2024-01-15",
  "merchant": "Whole Foods",
  "category": "Groceries",
  "amount": 45.50,
  "transactionType": "expense",
  "description": "Weekly shopping"
}
```

**Batch:**
```json
[
  { transaction 1 },
  { transaction 2 },
  ...
]
```

#### `GET /api/transactions/manage`
Retrieve transactions with filtering.

**Query Parameters:**
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `category` - Filter by category

#### `PUT /api/transactions/manage?id={transactionId}`
Update transaction.

#### `DELETE /api/transactions/manage?id={transactionId}`
Delete transaction.

#### `GET /api/transactions/summary`
Get spending summary by category.

**Query Parameters:**
- `startDate` - Optional date filter
- `endDate` - Optional date filter

**Response:**
```json
{
  "success": true,
  "summary": {
    "Groceries": { "spent": 250.50, "income": 0 },
    "Salary": { "spent": 0, "income": 5000 },
    ...
  }
}
```

## User Interface

### `/api-keys` Page
- View all API keys with metadata
- Create new keys with name, provider selection
- Enable/disable keys
- Delete keys
- Shows last used timestamp

### `/data` Page
- **Manual Entry**: Add transactions one at a time
- **CSV Upload**: Bulk import transactions
- Preview before submission
- Remove/edit queued transactions
- Category selection from predefined list

## CSV Format

Required columns: `date`, `merchant`, `amount`, `transaction_type`
Optional columns: `category`, `description`

Example:
```csv
date,merchant,category,amount,transaction_type,description
2024-01-15,Whole Foods,Groceries,45.50,expense,Weekly shopping
2024-01-16,Tech Company,Salary,5000,income,Monthly salary
2024-01-17,Electricity,Utilities,125.00,expense,Electric bill
```

## Security

1. **API Key Hashing**: Keys are hashed with SHA-256 before storage
2. **Row Level Security**: All tables use RLS policies
3. **User Isolation**: Users can only access their own data
4. **Header Authentication**: API endpoints use `x-user-id` header (should be replaced with proper auth tokens in production)
5. **HTTPS Required**: All endpoints require HTTPS in production

## Dynamic Data Flow

1. User creates API key in `/api-keys` page
2. Key is hashed and stored in `api_keys` table
3. User inputs transactions in `/data` page
4. Transactions are stored in `user_transactions` table
5. Dashboard queries user's transactions and API keys
6. AI services use user's API key to analyze real transaction data
7. Risk scoring, portfolio optimization use actual user data

## Integration with Dashboard

The dashboard can be updated to:

```typescript
// Load user's API key
const apiKeys = await getUserApiKeys(userId);
const activeKey = apiKeys.find(k => k.isActive && k.provider === 'gemini');

// Load user's transactions
const transactions = await getUserTransactions(userId, {
  startDate: sixMonthsAgo,
  endDate: today
});

// Use in risk scoring
const riskScore = await scoreUserRisk(userId, transactions, activeKey);

// Use in portfolio optimization
const allocation = await getAssetAllocationForProfile(
  userId,
  transactions,
  activeKey
);
```

## Migration

Run the migration to set up the new tables:

```bash
# Using Supabase CLI
supabase db push

# Or execute SQL directly in Supabase dashboard
# scripts/02-create-api-keys.sql
```

## Future Enhancements

1. **OAuth Integration**: Direct API key validation with providers
2. **Real-time Sync**: Connect to bank APIs for automatic transaction import
3. **Data Privacy**: GDPR compliance with data export/deletion
4. **Advanced Analytics**: ML models trained on user transaction patterns
5. **Webhooks**: Real-time notifications for portfolio changes
6. **API Rate Limiting**: Protect against abuse
7. **Audit Logging**: Track all API key and transaction operations

## Troubleshooting

### API Key Not Being Stored
- Verify provider name is valid: 'gemini', 'openai', or 'groq'
- Check that API key is not empty
- Ensure user is authenticated

### Transactions Not Appearing
- Check CSV format matches expected columns
- Verify date format (YYYY-MM-DD)
- Ensure amount is numeric
- Check transaction_type is: 'income', 'expense', or 'transfer'

### AI Analysis Not Using User Data
- Verify user has API key created and active
- Check `user_transactions` table contains data
- Ensure proper user_id is passed to services
