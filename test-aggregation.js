// Test script to verify groupTransactionsByCategory logic
import { groupTransactionsByCategory, formatCurrency, formatWholeNumber } from './frontend/src/lib/transaction-aggregates'

const mockTransactions: {
  id: string
  category_id: string
  category_name?: string
  amount: number
}[] = [
  { id: '1', category_id: 'uuid1', category_name: 'Food', amount: 50 },
  { id: '2', category_id: 'uuid1', category_name: 'Food', amount: 30 },
  { id: '3', category_id: 'uuid2', category_name: 'Transport', amount: 100 },
]

console.log('Testing aggregation logic...')
console.log('Input:', mockTransactions)
const result = groupTransactionsByCategory(mockTransactions)
console.log('Output:', result)
console.log('Test passed:', result.length === 2)
