
const { getSupabaseAdmin } = require("./dist/server/lib/supabase-client");

(async () => {
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
        .select("*");

    if (memberError) {
      console.log("\\nSBU MEMBERS");
      console.log("----------------------------------------");
      console.log("ERROR:", memberError.message);
    } else {
      console.log("\\nSBU MEMBERS");
      console.log("----------------------------------------");
      console.log("Count:", members.length);
    }

    const adminUsers = users.users.filter(u =>
      (u.email || "").toLowerCase().includes("admin")
    );

    console.log("\\nADMIN-LIKE USERS");
    console.log("----------------------------------------");
    adminUsers.forEach(u => {
      console.log(
        JSON.stringify({
          id: u.id,
          email: u.email,
          created_at: u.created_at
        })
      );
    });

  } catch (e) {
    console.error("\\nERROR");
    console.error("----------------------------------------");
    console.error(e.message);
    process.exit(1);
  }
})();
