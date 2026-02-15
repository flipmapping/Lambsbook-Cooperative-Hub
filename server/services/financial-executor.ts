import { createAuthenticatedClient } from "../lib/supabase-member-client";

interface UserContext {
  id: string;
  sbu_id: string;
  role: string;
  is_super_admin: boolean;
  token: string;
}

export async function executeFinancialRpc(
  user: UserContext,
  rpcName: string,
  params: Record<string, any>
) {
  if (!user?.sbu_id) {
    throw new Error("Missing SBU binding");
  }

  const supabase = createAuthenticatedClient(user.token, "meh");

  // Always inject SBU from server context
  const finalParams = {
    ...params,
    p_sbu_id: user.sbu_id
  };

  const { data, error } = await supabase.rpc(rpcName, finalParams);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
