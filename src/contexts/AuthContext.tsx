
import React, { createContext, useState, useContext, ReactNode } from "react";
import { AuthContextType, User } from "../types/auth";
import { useToast } from "@/components/ui/use-toast";

// Import the Supabase client from the Lovable environment
// @ts-expect-error This import is managed by the Lovable Supabase integration
import { supabase } from "@/lib/supabaseClient";

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
        // fetch user profile if you have a profiles table, here we'll just set basic info
        const profileUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email || "",
          email: session.user.email || "",
          role: session.user.user_metadata?.role || "student",
          avatar: session.user.user_metadata?.avatar || "",
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
      };
      setUser(profileUser);
      toast({
        title: "Login successful",
        description: `Welcome back, ${profileUser.name}!`,
      });
    }
    setIsLoading(false);
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string = "student"
  ) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
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
      };
      setUser(profileUser);
      toast({
        title: "Signup successful",
        description: "Account created! Please check your email for a confirmation link if applicable.",
      });
    }
    setIsLoading(false);
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

