import { useAuth, useUser } from "@clerk/expo";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

import { api } from "../../convex/_generated/api";

/**
 * Syncs the Clerk user to Convex and returns the Convex user record.
 *
 * Call this hook once in the root layout or auth layout. It:
 * 1. Waits for Clerk auth to load
 * 2. If signed in, calls `users.createOrUpdateFromClerk` to upsert the user
 * 3. Returns the Convex user record via `users.getCurrent` reactive query
 *
 * The Convex user record is the source of truth for role, onboarding status,
 * and profile data. Clerk handles authentication; Convex handles user data.
 */
export function useConvexUser() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const createOrUpdate = useMutation(api.users.createOrUpdateFromClerk);
  const convexUser = useQuery(api.users.getCurrent);
  const [syncedClerkId, setSyncedClerkId] = useState<string | null>(null);

  useEffect(() => {
    // Only sync when Clerk is loaded and user is signed in
    if (!isLoaded || !isSignedIn || !clerkUser) return;

    // Avoid re-syncing for the same Clerk user ID
    if (syncedClerkId === clerkUser.id) return;

    createOrUpdate({
      clerkId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      name: clerkUser.fullName ?? undefined,
      imageUrl: clerkUser.imageUrl ?? undefined,
    }).then(() => {
      setSyncedClerkId(clerkUser.id);
    });
  }, [isLoaded, isSignedIn, clerkUser, createOrUpdate, syncedClerkId]);

  return {
    /** The Convex user record (reactive — auto-updates on changes). */
    convexUser,
    /** Whether Clerk auth state has finished loading. */
    isAuthLoaded: isLoaded,
    /** Whether the Clerk→Convex sync has completed. */
    isSynced: syncedClerkId === clerkUser?.id,
  };
}
