import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingState } from './LoadingState';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
}

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: T & LazyWrapperProps) {
    const { fallback: propFallback, ...componentProps } = props;
    
    return (
      <Suspense fallback={propFallback || fallback || <LoadingState />}>
        <LazyComponent {...(componentProps as T)} />
      </Suspense>
    );
  };
}

// Lazy load heavy components
export const LazyCustomJacketConfigurator = withLazyLoading(
  () => import('@/pages/CustomJacketConfigurator')
);

export const LazyAdminDashboard = withLazyLoading(
  () => import('@/pages/AdminDashboard')
);

export const LazyAdminProductEdit = withLazyLoading(
  () => import('@/pages/AdminProductEdit')
);

export const LazyAdminBlogManagement = withLazyLoading(
  () => import('@/pages/AdminBlogManagement')
);

export const LazyCheckout = withLazyLoading(
  () => import('@/pages/Checkout')
);

export const LazyProfile = withLazyLoading(
  () => import('@/pages/Profile')
);

export const LazyOrders = withLazyLoading(
  () => import('@/pages/Orders')
);

export const LazyBlogDetail = withLazyLoading(
  () => import('@/pages/BlogDetail')
);

export const LazyBlog = withLazyLoading(
  () => import('@/pages/Blog')
);

