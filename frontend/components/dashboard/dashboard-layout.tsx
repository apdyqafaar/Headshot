"use client";

import { useLogout } from "@/lib";
import { useUser } from "@/lib/context";
import { getDashboardPath } from "@/lib/utils/role-util";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { GetNavigationConfig } from "@/lib/config/navigation";
import { ThemeToggle } from "../themeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}
const DashboardLayout = ({ children, onLogout }: DashboardLayoutProps) => {
  const { user } = useUser();
  const pathName = usePathname();
  const router = useRouter();
  const { mutate: logout, isPending: isLoggingOut ,isSuccess} = useLogout();

  const userRole = user?.role;
  const navigationItems=GetNavigationConfig(userRole)

  // handle logout
  const handleLogout=()=>{
    logout()
    router.push("/auth/login")
  }
  return (
    <div className="min-h-screen bg-background">
      {/* header */}
      <header className="border-b border-border bg-card ">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 ">
          {/* Logo */}
          <Link
            className="text-lg font-semibold text-foreground"
            href={getDashboardPath(userRole)}
          >
            Headshot Pro build
          </Link>
          {/* right side */}
        <div className=" flex items-center gap-3">
          {/* TODO:theme toggle */}
          <ThemeToggle/>
          <div className="text-right flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {user?.name||"User"}
            </p>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant={"outline"}
              size={"sm"}
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        </div>
        </div>

        
      </header>
      {/* main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* TODO: SIDEBAR */}
          {
            navigationItems.length>0&&(
              <aside className="hidden w-48 shrink-0 md:block">
                <nav className="space-y-1">
                 {
                  navigationItems.map((item)=>{
                    // TODO: active sidebar
                    const Icon=item.icon
                    const isExactMatch=pathName===item.href
                    const isChildRoute=pathName.startsWith(item.href+"/") && !item.href.endsWith("user")  && !item.href.endsWith("admin")
                    const isActive=isExactMatch || isChildRoute
                    return(
                      <Link href={item.href} key={item.name} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive?"bg-primary text-primary-foreground":"text-muted-foreground hover:bg-accent hove:text-foreground"} `}>
                        <Icon className="w-4 h-4"/>
                        <span>{item.name}</span>
                        {
                          item.badge&&(
                          <span
  className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
   "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
     
  }`}
>
  {item.badge}
</span>

                          )
                        }
                      </Link>
                    )
                  })
                 }
                </nav>
                </aside>
            )
          }
           {/* main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
       
        </div>
       
      </div>
    </div>
  );
};

export default DashboardLayout;
