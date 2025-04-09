'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export default function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { toast } = useToast();
  const redirectAttemptedRef = useRef(false);

  useEffect(() => {
    console.log("Auth listener mounted, current pathname:", pathname);
    
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        // Only handle SIGNED_IN events
        if (event === 'SIGNED_IN') {
          // Skip if we've already attempted a redirect recently
          if (redirectAttemptedRef.current) {
            console.log("Skipping redirect - already attempted recently");
            return;
          }
          
          // Set flag to prevent multiple redirects
          redirectAttemptedRef.current = true;
          setTimeout(() => {
            redirectAttemptedRef.current = false;
          }, 5000);
          
          if (session?.user) {
            console.log("User signed in:", session.user.email);
            
            // Skip redirect if already on select-role or complete-profile
            if (pathname === '/select-role' || pathname === '/complete-profile') {
              console.log("Already on onboarding page, skipping redirect");
              return;
            }
            
            // Always redirect to role selection after login for new sessions
            console.log("Redirecting to /select-role...");
            router.push('/select-role');
            
            // Show toast notification
            toast({
              title: "Welcome!",
              description: "Please select your role to get started."
            });
          }
        }
      }
    );

    return () => {
      console.log("Auth listener unmounting");
      subscription.unsubscribe();
    };
  }, [router, pathname, supabase, toast]);

  return null;
} 