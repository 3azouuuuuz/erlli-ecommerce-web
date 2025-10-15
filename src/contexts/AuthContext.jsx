import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const fetchProfileAndSubscription = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileError) {
        setProfile(null);
      } else {
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('profile_id', user.id)
          .single();
        if (subscriptionError) {
          profileData.subscription = { plan_name: 'free', price: 0.00, status: 'active' };
        } else {
          profileData.subscription = subscriptionData;
        }
        setProfile({ ...profileData });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndSubscription();
  }, [user]);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
        // Removed: navigate('/auth/login'); // Allow public access to pages like index
      }
    });
    return () => authListener?.subscription?.unsubscribe();
  }, [navigate]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('Attempting login with email:', email); // Debug log
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(), // Normalize email
        password
      });
      
      console.log('Supabase login response:', { data, error }); // Debug log
      if (error) {
        console.error('Supabase auth error details:', error);
        if (error.message.includes('Email not confirmed')) {
          alert("Please check your email and confirm your account before signing in.");
        } else if (error.message.includes('Invalid login credentials')) {
          alert("Invalid email or password. Double-check your credentials and try again.");
        } else if (error.message.includes('User not found')) {
          alert("User not found. Please sign up first.");
        } else {
          alert(`Login failed: ${error.message}`);
        }
        setLoading(false);
        return false;
      }
      
      if (!data?.user) {
        console.warn('No user in login response:', data);
        alert("No user found. Please try again.");
        setLoading(false);
        return false;
      }
      
      console.log('Login successful, user:', data.user.id);
      setUser(data.user);
      
      // Fetch user profile to determine role and other fields
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      
      console.log('Profile fetch response:', { profileData, profileError });
      
      if (profileError || !profileData) {
        console.error('Profile error:', profileError);
        alert("Unable to fetch user profile. Please try again.");
        setLoading(false);
        return false;
      }
      
      // Set profile with full data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', data.user.id)
        .single();
      if (subscriptionError) {
        profileData.subscription = { plan_name: 'free', price: 0.00, status: 'active' };
      } else {
        profileData.subscription = subscriptionData;
      }
      setProfile({ ...profileData });
      
      // Navigate based on role
      const targetRoute = profileData.role === "vendor" ? "/vendor" : "/";
      navigate(targetRoute);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Unexpected login error:', err);
      alert("An unexpected error occurred. Please try again.");
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
      alert("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfileAndSubscription();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};