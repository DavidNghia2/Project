import { MockAuthService } from './mockAuthService';
import type { IAuthService } from './types';

let activeAuthService: IAuthService | null = null;

/**
 * Single factory entry point for authentication operations.
 * Future Supabase integration only swaps MockAuthService for SupabaseAuthService here.
 */
export function getAuthService(): IAuthService {
  if (!activeAuthService) {
    activeAuthService = new MockAuthService();
  }
  return activeAuthService;
}

export const authService: IAuthService = getAuthService();
