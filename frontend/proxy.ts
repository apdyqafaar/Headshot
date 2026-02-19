import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.PUBLIC_URL || "http://localhost:8000/api/v1";
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  // current page
  const { pathname } = request.nextUrl;

  // tokens
  const accessToken = request.cookies.get("accessToken");
  const refreshToken = request.cookies.get("refreshToken");

  // is user authenticated
  const isAuthenticated = !!(accessToken?.value || refreshToken?.value);

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  if (accessToken) {
    return NextResponse.next();
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (isDashboard) {
    if (accessToken) {
      return NextResponse.next();
    }

    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (refreshToken) {
      try {
        const refreshTokenResponse = await fetch(
          `${API_URL}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `refreshToken=${refreshToken.value}`,
            },
          },
        );

        if (refreshTokenResponse.ok) {
          const setCookie = refreshTokenResponse.headers.get("set-cookie");

          if (setCookie) {
            const response = NextResponse.next();

            setCookie.split(",").forEach((cookie) => {
              const [nameValue] = cookie.trim().split(";");
              const [name, value] = nameValue.split("=");
              if (name && value) {
                response.cookies.set(name.trim(), value.trim(), {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax" as const,
                  path: "/",
                  maxAge:
                    name.trim() === "accessToken"
                      ? 15 * 60 * 1000
                      : 7 * 24 * 60 * 60 * 1000,
                });
              }
            });

            return response;
          }
        }
      } catch (error) {
        console.log("Next js proxy error", error);
      }
    }
    // if refresh failed
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
