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

  const executionParams = {
    ...params,
    p_sbu_id: user.sbu_id
  };

  const { data, error } = await supabase.rpc(rpcName, executionParams);

  if (error) {
    throw error;
  }

  // Governance Audit Log (Application Layer)
  console.log(
    JSON.stringify({
      type: "GOVERNANCE_ACTION",
      timestamp: new Date().toISOString(),
      executed_by: user.id,
      sbu_id: user.sbu_id,
      rpc: rpcName,
      params: executionParams
    })
  );

  return data;
}
