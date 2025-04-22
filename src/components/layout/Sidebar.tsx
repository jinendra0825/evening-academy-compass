
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Calendar,
  GraduationCap,
  Home,
  Users,
  Book,
  CheckSquare,
  ClipboardList,
  MessageSquare,
  Settings,
  User,
  Bell,
  BookOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const SidebarLink = ({ to, icon: Icon, label }: SidebarLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary",
          isActive ? "bg-primary/5 text-primary font-medium" : "hover:bg-primary/5"
        )
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
};

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user } = useAuth();
  
  // Different navigation menus based on user role
  const adminNav = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/students", icon: Users, label: "Students" },
    { to: "/teachers", icon: GraduationCap, label: "Teachers" },
    { to: "/courses", icon: Book, label: "Courses" },
    { to: "/attendance", icon: CheckSquare, label: "Attendance" },
    { to: "/performance", icon: ClipboardList, label: "Performance" },
    { to: "/schedule", icon: Calendar, label: "Schedule" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/parents", icon: User, label: "Parents" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];
  
  const teacherNav = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/my-courses", icon: Book, label: "My Courses" },
    { to: "/students", icon: Users, label: "Students" },
    { to: "/attendance", icon: CheckSquare, label: "Attendance" },
    { to: "/grades", icon: ClipboardList, label: "Grades" },
    { to: "/schedule", icon: Calendar, label: "Schedule" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];
  
  const studentNav = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/my-courses", icon: Book, label: "My Courses" },
    { to: "/assignments", icon: BookOpen, label: "Assignments" },
    { to: "/grades", icon: ClipboardList, label: "Grades" },
    { to: "/attendance", icon: CheckSquare, label: "Attendance" },
    { to: "/schedule", icon: Calendar, label: "Schedule" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];
  
  const parentNav = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/my-children", icon: Users, label: "My Children" },
    { to: "/performance", icon: ClipboardList, label: "Performance" },
    { to: "/attendance", icon: CheckSquare, label: "Attendance" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];
  
  // Select navigation based on user role
  const getNavItems = () => {
    switch (user?.role) {
      case "admin":
        return adminNav;
      case "teacher":
        return teacherNav;
      case "student":
        return studentNav;
      case "parent":
        return parentNav;
      default:
        return [];
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform duration-300 lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold text-sms-blue">Evening Academy</span>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-1 flex-col gap-1 overflow-auto p-4">
        {user && getNavItems().map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-gray-500 text-center">
          Evening Academy © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
