
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Settings as SettingsIcon,
  Book,
  FileText,
  ListTodo,
  Users,
  MessageSquare,
  CreditCard
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
    { to: "/dashboard", icon: Book, label: "Dashboard" },
    { to: "/my-courses", icon: Book, label: "My Courses" },
    { to: "/assignments", icon: FileText, label: "Assignments" },
    { to: "/grades", icon: ListTodo, label: "Grades" },
    { to: "/attendance", icon: Users, label: "Attendance" },
    { to: "/schedule", icon: CalendarDays, label: "Schedule" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/payment", icon: CreditCard, label: "Payment" },
    { to: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  // For other roles, display same for demo
  const userNav = adminNav;

  // Select navigation based on user role
  const getNavItems = () => {
    // For demo, just always show full nav
    return userNav;
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
          <Book className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold text-sms-blue">Evening Academy</span>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-1 flex-col gap-1 overflow-auto p-4">
        {getNavItems().map((item) => (
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
