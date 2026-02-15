import { createAuthenticatedClient } from "../lib/supabase-member-client";

export async function executeGovernanceRpc(
  user: any,
  rpcName: string,
  params: Record<string, any> = {}
) {
  if (!user?.is_super_admin) {
    throw new Error("Unauthorized governance execution");
  }

  const supabase = createAuthenticatedClient(user.token, "meh");

  const { data, error } = await supabase.rpc(rpcName, {
    ...params,
    p_sbu_id: user.sbu_id
  });

  if (error) {
    throw error;
  }

  return data;
}
