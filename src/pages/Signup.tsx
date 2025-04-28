
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { UserRole } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";

const ROLES: Array<{label: string, value: UserRole}> = [
  { label: "Student", value: "student" },
  { label: "Parent", value: "parent" },
  { label: "Teacher", value: "teacher" },
  // Do not allow admin self-signup for now
];

// Create a phone validation schema
const phoneSchema = z.string()
  .min(10, "Phone number must have at least 10 digits")
  .max(15, "Phone number is too long")
  .regex(/^\+?[0-9\s-()]+$/, "Invalid phone number format");

const Signup = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { signup, isAuthenticated, isLoading } = useAuth();

  const validatePhone = () => {
    try {
      phoneSchema.parse(phone);
      setPhoneError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPhoneError(error.errors[0].message);
      } else {
        setPhoneError("Invalid phone number");
      }
      return false;
    }
  };

  const validatePasswordMatch = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (!validatePasswordMatch()) {
      return;
    }

    // Validate phone number
    if (!validatePhone()) {
      return;
    }

    // All validations passed
    if (signup) {
      try {
        await signup(name, email, password, role, phone);
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
      } catch (error) {
        console.error("Signup error:", error);
        toast({
          title: "Signup failed",
          description: error instanceof Error ? error.message : "An error occurred during signup",
          variant: "destructive",
        });
      }
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            <GraduationCap className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up to enroll as student, parent, or teacher.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {phoneError && (
                <p className="text-sm text-destructive">{phoneError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                onBlur={validatePasswordMatch}
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="w-full border rounded-md px-3 py-2 text-base bg-background"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Sign up"}
            </Button>
            <div className="mt-4 text-sm text-center text-muted-foreground">
              <span>Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
