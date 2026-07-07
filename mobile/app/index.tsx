import { Redirect } from 'expo-router';
import { useAppStore } from '@/store/AppStore';

// The mandatory first-run onboarding wizard collects everything the site's
// registration form otherwise asks for — so by the time someone taps
// "Register" on an event card, there's nothing left to fill in.
export default function Index() {
  const { hasOnboarded } = useAppStore();
  return <Redirect href={hasOnboarded ? '/(tabs)/events' : '/onboarding'} />;
}
