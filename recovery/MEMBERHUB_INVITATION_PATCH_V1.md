FILE

client/src/pages/MemberHub.tsx

INSERTION_1

Add imports:

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

INSERTION_2

Before:

const acceptInvitationMutation = useMutation({

Insert:

const [inviteModalOpen,setInviteModalOpen]=useState(false);
const [invitedEmail,setInvitedEmail]=useState("");
const [inviteLink,setInviteLink]=useState("");
const [inviteMutationResult,setInviteMutationResult]=useState<any>(null);

const createInvitationMutation = useMutation({
  mutationFn: () =>
    postWithAuth("/api/member/invitations",{
      invitedEmail
    }),
  onSuccess:(data:any)=>{
    setInviteMutationResult(data);
    setInviteLink(
      data?.inviteUrl ||
      data?.invitationUrl ||
      data?.url ||
      data?.link ||
      ""
    );
    toast({title:"Invitation created"});
  },
  onError:(error:Error)=>{
    toast({
      title:"Error",
      description:error.message,
      variant:"destructive"
    });
  }
});

INSERTION_3

Inside Invitations tab CardContent,
before pending invitation rendering block:

<Button
  onClick={()=>setInviteModalOpen(true)}
>
  Generate Invitation
</Button>

INSERTION_4

Inside Invitations tab CardContent,
after invitation rendering block:

<Dialog
  open={inviteModalOpen}
  onOpenChange={setInviteModalOpen}
>
  <DialogContent>
    <div className="space-y-4">

      <Input
        type="email"
        value={invitedEmail}
        onChange={(e)=>setInvitedEmail(e.target.value)}
        placeholder="Invitee email"
      />

      <Button
        onClick={()=>createInvitationMutation.mutate()}
        disabled={createInvitationMutation.isPending}
      >
        Create Invitation
      </Button>

      {inviteLink && (
        <div className="space-y-2">
          <div className="text-xs">
            Invite Link
          </div>

          <div className="break-all text-xs">
            {inviteLink}
          </div>

          <Button
            variant="outline"
            onClick={()=>{
              navigator.clipboard.writeText(inviteLink);
            }}
          >
            Copy Link
          </Button>
        </div>
      )}

    </div>
  </DialogContent>
</Dialog>

BUILD_VERIFICATION

npm run build

RUNTIME_VERIFICATION

1. Login
2. MemberHub
3. Invitations
4. Generate Invitation
5. Enter email
6. Create Invitation
7. Copy Link visible
8. No console errors
