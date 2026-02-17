import { getUserClient } from "../supabaseClients";

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
