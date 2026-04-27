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
  amount: number
  description: string
  merchant_name?: string
  category_name?: string
  category_id?: string
  account_id?: string
  notes? : string
}

// API response types
export interface AccountsResponse {
  accounts: Account[]
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

