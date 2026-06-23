gateway_invitations is the onboarding authorization authority.

member_invitations and accept_member_invitation remain the canonical membership authorities.

Do not migrate authority from member_invitations to gateway_invitations.

Do not replace accept_member_invitation.

Do not create a new membership activation path.

Required flow:

Token
→ gateway_invitations
→ Authorization
→ member_invitations
→ accept_member_invitation
→ Membership Activation
