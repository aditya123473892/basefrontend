// frontend/components/AuthGuard.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const hasRedirected = useRef(false);

  // Compute authentication based on actual state values
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Separate effect specifically for handling redirects after login
  useEffect(() => {
    if (!isClient || isLoading) return;

    console.log('🔒 AuthGuard Redirect Effect:', {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      pathname,
      hasRedirected: hasRedirected.current,
      userEmail: user?.email
    });

    const publicRoutes = ['/', '/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If authenticated and on a public route, redirect to dashboard
    if (isAuthenticated && isPublicRoute && !hasRedirected.current) {
      console.log('🚀 TRIGGERING REDIRECT TO DASHBOARD');
      hasRedirected.current = true;

      // Use Next.js router for proper navigation
      router.push('/dashboard');
      return;
    }

    // If not authenticated and NOT on a public route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      console.log('🚫 Not authenticated, redirecting to login');
      router.push('/signup');
      return;
    }

    // Reset redirect flag when user logs out
    if (!isAuthenticated && hasRedirected.current) {
      hasRedirected.current = false;
    }
  }, [isClient, isLoading, isAuthenticated, user, token, pathname, router]);

  // Show loading while checking auth on client side
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // If authenticated on public route, show loading while redirecting
  const publicRoutes = ['/', '/login', '/signup'];
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    console.log('⏳ Showing redirect loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-xl">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  // Render children
  return <>{children}</>;
}
