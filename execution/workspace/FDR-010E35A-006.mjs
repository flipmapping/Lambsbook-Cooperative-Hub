
import { getSupabaseAdmin } from "../../dist/server/lib/supabase-client.js";

try {

    const supabase = getSupabaseAdmin();

    const { data: users, error: userError } =
        await supabase.auth.admin.listUsers();

    if (userError) throw userError;

    console.log("\\nAUTH USERS");
    console.log("----------------------------------------");
    console.log("Count:", users.users.length);

    const { data: members, error: memberError } =
        await supabase
            .schema("core")
            .from("sbu_members")
            .select("id,user_id,sbu_id,role");

    console.log("\\nSBU MEMBERS");
    console.log("----------------------------------------");

    if (memberError) {
        console.log(memberError.message);
    } else {
        console.log("Count:", members.length);
    }

    console.log("\\nADMIN USERS");
    console.log("----------------------------------------");

    for (const u of users.users) {

        const email = (u.email || "").toLowerCase();

        if (
            email.includes("admin") ||
            email.includes("founder")
        ) {
            console.log(JSON.stringify({
                id: u.id,
                email: u.email
            }));
        }
    }

}
catch (e) {

    console.log("\\nERROR");
    console.log("----------------------------------------");
    console.log(e.stack || e.message);

    process.exit(1);

}
