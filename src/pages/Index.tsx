
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
    
    // Set the page title
    document.title = "Evening Academy - Student Management System";
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-sms-blue">Evening Academy</span>
          </div>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white flex-grow flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-sms-blue mb-6">
              Evening Academy Student Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A comprehensive solution for managing evening classes, tracking student progress, 
              and facilitating communication between students, teachers, and parents.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-sms-blue">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Student Management",
                description: "Comprehensive student enrollment, profiles, and academic tracking"
              },
              {
                title: "Course Management",
                description: "Create and manage courses, schedules, and teacher assignments"
              },
              {
                title: "Attendance Tracking",
                description: "Record and report attendance for students and teachers"
              },
              {
                title: "Performance Monitoring",
                description: "Track grades and generate individual and group progress reports"
              },
              {
                title: "Communication Tools",
                description: "Built-in messaging for students, teachers, and parents"
              },
              {
                title: "Parent/Guardian Portal",
                description: "Allow parents to view progress and communicate with teachers"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-sms-blue">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sms-blue text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <GraduationCap className="h-6 w-6" />
              <span className="text-lg font-semibold">Evening Academy</span>
            </div>
            <div className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} Evening Academy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
