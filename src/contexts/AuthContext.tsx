
import React, { createContext, useState, useContext, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup?: (
    name: string,
    email: string,
    password: string,
    role?: string,
    phone?: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Check for existing Supabase session
  React.useEffect(() => {
    const getUserSession = async () => {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const profileUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email || "",
          email: session.user.email || "",
          role: session.user.user_metadata?.role || "student",
          avatar: session.user.user_metadata?.avatar || "",
          phone: session.user.user_metadata?.phone || "",
        };
        setUser(profileUser);
      }
      setIsLoading(false);
    };
    getUserSession();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email || "",
          email: session.user.email || "",
          role: session.user.user_metadata?.role || "student",
          avatar: session.user.user_metadata?.avatar || "",
          phone: session.user.user_metadata?.phone || "",
        };
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      setIsLoading(false);
      return;
    }
    const sessionUser = data.user;
    if (sessionUser) {
      const profileUser: User = {
        id: sessionUser.id,
        name: sessionUser.user_metadata?.name || sessionUser.email || "",
        email: sessionUser.email || "",
        role: sessionUser.user_metadata?.role || "student",
        avatar: sessionUser.user_metadata?.avatar || "",
        phone: sessionUser.user_metadata?.phone || "",
      };
      setUser(profileUser);
      toast({
        title: "Login successful",
        description: `Welcome back, ${profileUser.name}!`,
      });
    }
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password: string, role: string = "student", phone?: string) => {
    try {
      setIsLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            phone
          }
        }
      });
      
      if (authError) throw new Error(authError.message);
      
      // Wait for the auth state to refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
