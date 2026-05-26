import { supabase } from "../lib/supabase";

export async function fetchTotalEarnings(): Promise<number> {
  const { data, error } = await supabase.from("earnings").select("amount");

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  const total = data.reduce((sum, row) => {
    return sum + Number(row.amount);
  }, 0);

  return total;
}
