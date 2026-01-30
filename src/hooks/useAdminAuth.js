'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth(requiredRole = null) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('adminToken');
      setIsAuthenticated(!!token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Role check (opcional). O JWT no projeto contém role, mas não decodificamos aqui.
    // Mantemos apenas a assinatura para compatibilidade com o inpacta-site.
    if (requiredRole) {
      // Se quiser validar role no client, adicionar decodificação JWT aqui.
    }
  }, [isAuthenticated, isLoading, requiredRole, router]);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('adminToken');
    } finally {
      router.push('/admin/login?loggedOut=1');
    }
  }, [router]);

  return {
    user: null,
    isLoading,
    isAuthenticated,
    logout,
  };
}

export function useApiRequest() {
  const router = useRouter();

  const apiRequest = useCallback(async (url, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

    const headers = new Headers(options.headers || {});
    if (token && !headers.has('Authorization') && !headers.has('authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      try {
        localStorage.removeItem('adminToken');
      } finally {
        router.push('/admin/login');
      }
    }

    return response;
  }, [router]);

  return { apiRequest };
}
