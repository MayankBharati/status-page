import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/status/(.*)',
  '/api/status/(.*)',
  '/api/websocket',
]);

export default clerkMiddleware(async (auth, req) => {
  // Temporarily disable auth protection for testing
  // IMPORTANT: Remove this line when you have Clerk set up!
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_YOUR_PUBLISHABLE_KEY') {
    console.warn('⚠️  Auth disabled - Using placeholder Clerk keys. Set up Clerk for production!');
    return;
  }
  
  if (!isPublicRoute(req) && isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 
 
 