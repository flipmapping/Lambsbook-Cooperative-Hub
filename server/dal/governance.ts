import { getUserClient } from "../lib/supabaseClients";

interface ManageSBUMemberParams {
  sbu_id: string;
  user_id: string;
  role?: "owner" | "admin" | "finance" | "member";
  action: string;
}

export async function manageSBUMember(
  jwt: string,
  params: ManageSBUMemberParams
) {
  const supabase = getUserClient(jwt);

  const { data, error } = await supabase.rpc("manage_sbu_member", {
    p_sbu_id: params.sbu_id,
    p_user_id: params.user_id,
    p_role: params.role ?? null,
    p_action: params.action,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

interface TransferOwnershipParams {
  sbu_id: string;
  new_owner_user_id: string;
}

export async function transferSBUOwnership(
  jwt: string,
  params: TransferOwnershipParams
) {
  const supabase = getUserClient(jwt);

  const { data, error } = await supabase.rpc("transfer_sbu_ownership", {
    p_sbu_id: params.sbu_id,
    p_new_owner_user_id: params.new_owner_user_id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

interface SetSBUStatusParams {
  sbu_id: string;
  status: string;
}

export async function setSBUStatus(
  jwt: string,
  params: SetSBUStatusParams
) {
  const supabase = getUserClient(jwt);

  const { data, error } = await supabase.rpc("set_sbu_status", {
    p_sbu_id: params.sbu_id,
    p_status: params.status,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
