import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://zjauotvmydvqyyfgkuzk.supabase.co'
const supabasePublishableKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYXVvdHZteWR2cXl5ZmdrdXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NTkyNDIsImV4cCI6MjA3NDMzNTI0Mn0.OnzzLFhPRSlRoB2f1Rp0o-mWeUo3f9exuNcWsN79CeE'
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})