
import React, { createContext, useState, useContext, ReactNode } from "react";
import { AuthContextType, User, UserRole } from "../types/auth";
import { useToast } from "@/components/ui/use-toast";

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@academy.com",
    password: "admin123",
    role: "admin" as UserRole,
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=1a365d&color=fff",
  },
  {
    id: "2",
    name: "Teacher User",
    email: "teacher@academy.com",
    password: "teacher123",
    role: "teacher" as UserRole,
    avatar: "https://ui-avatars.com/api/?name=Teacher+User&background=7e3af2&color=fff",
  },
  {
    id: "3",
    name: "Student User",
    email: "student@academy.com",
    password: "student123",
    role: "student" as UserRole,
    avatar: "https://ui-avatars.com/api/?name=Student+User&background=0694a2&color=fff",
  },
  {
    id: "4",
    name: "Parent User",
    email: "parent@academy.com",
    password: "parent123",
    role: "parent" as UserRole,
    avatar: "https://ui-avatars.com/api/?name=Parent+User&background=8b5cf6&color=fff",
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Check for existing session
  React.useEffect(() => {
    const storedUser = localStorage.getItem("smsUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("smsUser");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const matchedUser = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );
      
      if (matchedUser) {
        // Create user without password
        const { password: _, ...userWithoutPassword } = matchedUser;
        setUser(userWithoutPassword);
        localStorage.setItem("smsUser", JSON.stringify(userWithoutPassword));
        toast({
          title: "Login successful",
          description: `Welcome back, ${userWithoutPassword.name}!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An error occurred during login",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smsUser");
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
