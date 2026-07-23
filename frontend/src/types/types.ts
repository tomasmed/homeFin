// Domain types - core business entities
export interface Account {
  id: string
  name: string
  institution: string
  account_type: 'checking' | 'savings' | 'credit' | 'investment'
  currency: string
}

export interface Transaction {
  id: string
  date: string
  amount: number | string
  description: string
  merchant_name?: string
  category_name?: string
  category_id?: string
  account_id?: string
  statement_id?: string | null
  notes? : string
}

export interface Statement {
  id: string
  account_id: string
  filename: string
  upload_date: string
  period_start_date?: string | null
  period_end_date?: string | null
  transaction_count: number
}

// API response types
export interface AccountsResponse {
  accounts: Account[]
}

export interface StatementsResponse {
  statements: Statement[]
}

export interface TransactionCategoryAggregatesArray {
  categories: Array<{
    category_id: string
    category_name: string
    color_hex: string
    total: number
    count: number
    average: number
  }>
}

export interface Category {
  id: string
  name: string
  parent_id: string | null
  icon_slug: string
  color_hex: string
}

// Form types for category creation
export interface CategoryFormData {
  name: string
  icon_slug: string
  color_hex?: string
}

// Query hook types
export interface UseAccountsResult {
  data: { accounts: Account[] } | undefined
  isLoading: boolean
  error: Error | null
}

export interface UseTransactionsByAccountReturn {
  transactions: Array<Transaction>
  isLoading: boolean
  error: Error | null
}

