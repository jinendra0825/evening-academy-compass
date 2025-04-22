
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNotificationsForUser, notifications } from "@/services/mockData";
import { useEffect, useState } from "react";

interface TopBarProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

export const TopBar = ({ setSidebarOpen, sidebarOpen }: TopBarProps) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      const userNotifications = getNotificationsForUser(user.id);
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  }, [user]);
  
  const userInitials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2 md:hidden"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            <h1 className="text-xl font-semibold text-sms-blue hidden md:block">
              Evening Academy
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user && getNotificationsForUser(user.id).length > 0 ? (
                    getNotificationsForUser(user.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((notification) => (
                        <DropdownMenuItem key={notification.id} className="py-3 px-4 cursor-pointer">
                          <div className="flex flex-col">
                            <div className="font-medium flex items-center justify-between">
                              {notification.title}
                              {!notification.read && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full ml-2">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notification.date).toLocaleString()}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                  ) : (
                    <div className="py-4 px-4 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="py-2 flex justify-center">
                    <Button variant="ghost" className="text-sm w-full">
                      View all notifications
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <p>{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs font-medium text-primary capitalize">
                        {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
