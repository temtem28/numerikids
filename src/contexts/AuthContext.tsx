import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ChildProfile, ParentProfile } from '@/types/database.types';
import { getDeviceInfo, getDeviceId, getIPAddress } from '@/utils/deviceDetection';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  parentProfile: ParentProfile | null;
  currentChild: ChildProfile | null;
  activeChild: ChildProfile | null; // Alias for currentChild
  childProfiles: ChildProfile[];
  children: ChildProfile[]; // Alias for childProfiles
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  selectChild: (childId: string) => void;
  /** Après création d’un enfant : fusionne `optimistic` si le SELECT RLS renvoie une liste vide ou sans cet id. */
  refreshChildProfiles: (optimistic?: ChildProfile | null) => Promise<void>;
  refreshParentProfile: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);

  useEffect(() => {
    let activityInterval: ReturnType<typeof setInterval> | null = null;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadParentProfile(currentUser.id);
        loadChildProfiles(currentUser.id);
        trackSession(currentUser.id, session!.access_token);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadParentProfile(currentUser.id);
        loadChildProfiles(currentUser.id);
        if (_event === 'SIGNED_IN') {
          trackSession(currentUser.id, session!.access_token);
          checkForNewLocationAlert(currentUser.id);
        }
      } else {
        setParentProfile(null);
        setChildProfiles([]);
        setCurrentChild(null);
      }
    });

    activityInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        updateSessionActivity(session.user.id);
      }
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      if (activityInterval) clearInterval(activityInterval);
    };
  }, []);

  const trackSession = async (userId: string, sessionToken: string) => {
    // Session tracking is optional - skip if table doesn't exist
    try {
      const deviceInfo = getDeviceInfo();
      const deviceId = getDeviceId();
      let ipAddress = 'Unknown';
      let locationData: any = { country_name: 'Unknown', city: 'Unknown' };

      try {
        ipAddress = await getIPAddress();
        const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`, { 
          signal: AbortSignal.timeout(3000) 
        });
        if (locationResponse.ok) {
          locationData = await locationResponse.json();
        }
      } catch (locError) {
        // Location fetch failed, use defaults
      }

      // Try to track session but don't fail if table doesn't exist
      const sessionData = {
        user_id: userId,
        session_token: sessionToken,
        device_id: deviceId,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        browser_version: deviceInfo.browserVersion,
        os: deviceInfo.os,
        os_version: deviceInfo.osVersion,
        ip_address: ipAddress,
        country: locationData.country_name || 'Unknown',
        city: locationData.city || 'Unknown',
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        is_current: true,
        last_activity: new Date().toISOString(),
      };

      // Check if active_sessions table exists (the correct table name)
      const { error: checkError } = await supabase
        .from('active_sessions')
        .select('id')
        .limit(1);

      if (!checkError) {
        await supabase
          .from('active_sessions')
          .update({ is_current: false })
          .eq('user_id', userId);

        await supabase
          .from('active_sessions')
          .upsert(sessionData, { onConflict: 'session_token' });
      }
    } catch (error) {
      // Session tracking is optional, don't fail the login
      console.debug('Session tracking skipped');
    }
  };


  const updateSessionActivity = async (userId: string) => {
    // Optional - don't fail if table doesn't exist
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('active_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', session.access_token)
        .eq('user_id', userId);
    } catch (error) {
      // Silent fail - session activity tracking is optional
    }
  };

  const checkForNewLocationAlert = async (userId: string) => {
    // Optional feature - don't fail login if it doesn't work
    try {
      let ipAddress = 'Unknown';
      let locationData: any = { country_name: 'Unknown', city: 'Unknown' };

      try {
        ipAddress = await getIPAddress();
        const locationResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
          signal: AbortSignal.timeout(3000)
        });
        if (locationResponse.ok) {
          locationData = await locationResponse.json();
        }
      } catch (locError) {
        return; // Skip alert if we can't get location
      }

      // Check if active_sessions table exists
      const { data: existingSessions, error } = await supabase
        .from('active_sessions')
        .select('country, city')
        .eq('user_id', userId)
        .eq('country', locationData.country_name)
        .eq('city', locationData.city)
        .limit(1);

      if (error) return; // Table doesn't exist, skip

      if (!existingSessions || existingSessions.length === 0) {
        const deviceInfo = getDeviceInfo();
        
        await supabase.from('login_alerts').insert({
          user_id: userId,
          alert_type: 'new_location',
          ip_address: ipAddress,
          location: `${locationData.city}, ${locationData.country_name}`,
          device_info: `${deviceInfo.browser} on ${deviceInfo.os}`,
        });
      }
    } catch (error) {
      // Silent fail - location alerts are optional
    }
  };



  const loadParentProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setParentProfile(data);
      } else if (!error) {
        const { data: fallback } = await supabase
          .from('parent_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        if (fallback) setParentProfile(fallback);
      } else if (error && error.code !== 'PGRST116') {
        // Only log errors that aren't about missing rows
        console.error('Error loading parent profile:', error);
      }
    } catch (error) {
      console.error('Error loading parent profile:', error);
    }
  };


  const loadChildProfiles = async (authUserId: string) => {
    // Aligné sur les policies RLS courantes : parent_id = auth.uid()
    const parentId = authUserId;
    // Query the 'children' table (not 'child_profiles')
    let { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    // Compatibilité: certaines bases n'ont pas la colonne is_active.
    if (error) {
      const fallback = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (!error && data) {
      setChildProfiles(data);
      
      const savedChildId = localStorage.getItem('selectedChildId');
      const childToSelect = savedChildId 
        ? data.find(c => c.id === savedChildId) || data[0]
        : data[0];
      
      if (childToSelect) {
        setCurrentChild(childToSelect);
      } else {
        setCurrentChild(null);
      }
    } else if (error) {
      console.error('Error loading child profiles:', error);
    }
  };


  const refreshParentProfile = async () => {
    if (user) {
      await loadParentProfile(user.id);
    }
  };


  const refreshChildProfiles = async (optimistic?: ChildProfile | null) => {
    if (!user) return;
    await loadChildProfiles(user.id);
    if (!optimistic?.id) return;
    setChildProfiles((prev) => {
      if (prev.some((c) => c.id === optimistic.id)) return prev;
      return [optimistic, ...prev];
    });
    setCurrentChild((cur) => {
      const savedId = localStorage.getItem('selectedChildId');
      if (savedId === optimistic.id) return optimistic;
      return cur ?? optimistic;
    });
  };

  const selectChild = (childId: string) => {
    const child = childProfiles.find(c => c.id === childId);
    if (child) {
      setCurrentChild(child);
      localStorage.setItem('selectedChildId', childId);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Sign up with user metadata - the trigger will handle profile creation
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName
        }
      }
    });
    
    if (error) throw error;
    
    // Return the data so the caller can verify setup
    return { data, error: null };
  };


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Try to mark current session as revoked (optional - don't fail if table doesn't exist)
      if (session && user) {
        try {
          await supabase
            .from('active_sessions')
            .update({ revoked_at: new Date().toISOString() })
            .eq('session_token', session.access_token)
            .eq('user_id', user.id);
        } catch (e) {
          // Session tracking table may not exist, continue with signout
        }
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setParentProfile(null);
      setCurrentChild(null);
      setChildProfiles([]);
      localStorage.removeItem('selectedChildId');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear local state even if there's an error
      setParentProfile(null);
      setCurrentChild(null);
      setChildProfiles([]);
      localStorage.removeItem('selectedChildId');
    }
  };




  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      parentProfile,
      currentChild,
      activeChild: currentChild, // Alias
      childProfiles,
      children: childProfiles, // Alias
      signUp, 
      signIn, 
      signOut, 
      resetPassword,
      selectChild,
      refreshChildProfiles,
      refreshParentProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
