// import { NextResponse, NextRequest } from "next/server";
// export { default } from "next-auth/middleware";
// import { getToken } from "next-auth/jwt";
// // This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {
//   const token = await getToken({ req: request });
//   const url = request.nextUrl;

//   if (
//     token &&
//     (url.pathname.startsWith("/sign-in") ||
//       url.pathname.startsWith("/sign-up") ||
//       url.pathname.startsWith("/verify") ||
//       url.pathname.startsWith("/"))
//   ) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }
//   if (!token && url.pathname.startsWith("/dashboard")) {
//     return NextResponse.redirect(new URL("/sign-in", request.url));
//   }
// return NextResponse.next()
// }

// export const config = {
//   matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*", "/verify/:path*"],
// };


import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // 1. Manage CORS for API routes
  if (url.pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res;
  }

  // 2. Redirect logged-in users away from Auth pages & Home
  if (token && 
      (url.pathname.startsWith('/sign-in') || 
       url.pathname.startsWith('/sign-up') || 
       url.pathname === '/') // Added this back so Home redirects to Dashboard
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Protect Dashboard (Redirect non-logged-in users to Sign-in)
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Added '/' to matcher so the middleware actually runs on the homepage
  matcher: ['/sign-in', '/sign-up', '/', '/dashboard/:path*', '/api/:path*'],
};