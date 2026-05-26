import type { Request } from "express";

export interface RequestUserContext {
  id: string;
  token: string;
  sbu_id?: string;
  role?: string;
  is_super_admin?: boolean;
}

export type AuthenticatedRequest = Request & {
  user: RequestUserContext;
  sbu_id?: string;
  isPlatformAdmin?: boolean;
};
