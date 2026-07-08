import { useEffect, useRef, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '@/store/AppStore';
import { useAuth } from '@/store/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// The mandatory first-run onboarding wizard collects everything the site's
// registration form otherwise asks for — so by the time someone taps
// "Register" on an event card, there's nothing left to fill in.
export default function Index() {
  const { hasOnboarded, completeOnboarding } = useAppStore();
  const { status, session } = useAuth();
  const [hydrating, setHydrating] = useState(isSupabaseConfigured);
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    if (status !== 'signed-in' || !session) {
      setHydrating(false);
      return;
    }
    if (hydratedFor.current === session.user.id) {
      setHydrating(false);
      return;
    }
    let cancelled = false;
    const client = supabase;
    setHydrating(true);
    client
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        hydratedFor.current = session.user.id;
        // Returning users whose profile already has the two required
        // fields skip the wizard entirely; anyone else (new sign-in,
        // partial profile) proceeds to onboarding as usual.
        if (data?.full_name && data?.nid_number) {
          completeOnboarding({
            fullName: data.full_name,
            phone: data.phone ?? '',
            idType: data.id_type ?? 'nid',
            idNumber: data.nid_number,
            instagramHandle: data.instagram_handle ?? '',
            otherSocial: data.other_social_handle ?? '',
            gender: data.gender ?? 'male',
            photoUri: null,
            idDocumentUri: null,
          });
        }
        setHydrating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, session, completeOnboarding]);

  if (!isSupabaseConfigured) {
    return <Redirect href={hasOnboarded ? '/(tabs)/events' : '/onboarding'} />;
  }

  if (status === 'loading' || hydrating) return null;
  if (status !== 'signed-in') return <Redirect href="/sign-in" />;
  return <Redirect href={hasOnboarded ? '/(tabs)/events' : '/onboarding'} />;
}
