import { getUserClient } from '../lib/supabaseClients'

export async function postTransaction(
  jwt: string,
  payload: {
    sbu_id: string
    transaction_type: string
    amount: number
    description?: string
  }
) {
  const supabase = getUserClient(jwt)

  const { data, error } = await supabase.rpc('post_transaction', {
    p_sbu_id: payload.sbu_id,
    p_transaction_type: payload.transaction_type,
    p_amount: payload.amount,
    p_description: payload.description ?? null,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function closeFinancialPeriod(
  jwt: string,
  sbu_id: string
) {
  const supabase = getUserClient(jwt)

  const { data, error } = await supabase.rpc('close_financial_period', {
    p_sbu_id: sbu_id,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
