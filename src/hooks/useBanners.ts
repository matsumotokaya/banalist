import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerStorage } from '../utils/bannerStorage';
import type { Banner, CanvasElement, Template } from '../types/template';

// Query keys
export const bannerKeys = {
  all: ['banners'] as const,
  lists: () => [...bannerKeys.all, 'list'] as const,
  list: (userId: string) => [...bannerKeys.lists(), userId] as const,
  details: () => [...bannerKeys.all, 'detail'] as const,
  detail: (id: string) => [...bannerKeys.details(), id] as const,
};

// Get all banners
export function useBanners() {
  return useQuery({
    queryKey: bannerKeys.lists(),
    queryFn: async () => {
      const banners = await bannerStorage.getAll(false); // Disable old cache, use React Query cache
      return banners;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single banner by ID
export function useBanner(id: string | undefined) {
  return useQuery({
    queryKey: bannerKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const banner = await bannerStorage.getById(id, false); // Disable old cache
      return banner;
    },
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000,
  });
}

// Create new banner
export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; template: Template }) => {
      const banner = await bannerStorage.create(params.name, params.template);
      return banner;
    },
    onSuccess: () => {
      // Invalidate banner list to refetch
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

// Update banner
export function useUpdateBanner(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Banner>) => {
      await bannerStorage.update(id, updates);
      return updates;
    },
    // Optimistic update
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: bannerKeys.detail(id) });

      // Snapshot previous value
      const previousBanner = queryClient.getQueryData<Banner>(bannerKeys.detail(id));

      // Optimistically update to the new value
      if (previousBanner) {
        queryClient.setQueryData<Banner>(bannerKeys.detail(id), {
          ...previousBanner,
          ...updates,
        });
      }

      return { previousBanner };
    },
    // On error, rollback to previous value
    onError: (err, variables, context) => {
      if (context?.previousBanner) {
        queryClient.setQueryData(bannerKeys.detail(id), context.previousBanner);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

// Batch save (elements, canvas color, thumbnail)
export function useBatchSaveBanner(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      elements?: CanvasElement[];
      canvasColor?: string;
      thumbnailDataURL?: string;
    }) => {
      await bannerStorage.batchSave(id, updates);
      return updates;
    },
    // Optimistic update
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.detail(id) });
      const previousBanner = queryClient.getQueryData<Banner>(bannerKeys.detail(id));

      if (previousBanner) {
        const optimisticBanner: Banner = {
          ...previousBanner,
          ...(updates.elements && { elements: updates.elements }),
          ...(updates.canvasColor && { canvasColor: updates.canvasColor }),
          ...(updates.thumbnailDataURL && { thumbnailDataURL: updates.thumbnailDataURL }),
        };
        queryClient.setQueryData<Banner>(bannerKeys.detail(id), optimisticBanner);
      }

      return { previousBanner };
    },
    onError: (err, variables, context) => {
      if (context?.previousBanner) {
        queryClient.setQueryData(bannerKeys.detail(id), context.previousBanner);
      }
    },
    onSettled: () => {
      // Don't invalidate immediately to avoid refetch during editing
      // The cache will be updated optimistically
    },
  });
}

// Delete banner
export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await bannerStorage.delete(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: bannerKeys.detail(deletedId) });
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

// Duplicate banner
export function useDuplicateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const duplicated = await bannerStorage.duplicate(id);
      return duplicated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

// Update banner name
export function useUpdateBannerName(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newName: string) => {
      await bannerStorage.updateName(id, newName);
      return newName;
    },
    onMutate: async (newName) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.detail(id) });
      const previousBanner = queryClient.getQueryData<Banner>(bannerKeys.detail(id));

      if (previousBanner) {
        queryClient.setQueryData<Banner>(bannerKeys.detail(id), {
          ...previousBanner,
          name: newName,
        });
      }

      return { previousBanner };
    },
    onError: (err, variables, context) => {
      if (context?.previousBanner) {
        queryClient.setQueryData(bannerKeys.detail(id), context.previousBanner);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

// Update plan type (admin only)
export function useUpdateBannerPlanType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planType: 'free' | 'premium') => {
      await bannerStorage.updatePlanType(id, planType);
      return planType;
    },
    onMutate: async (planType) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.detail(id) });
      const previousBanner = queryClient.getQueryData<Banner>(bannerKeys.detail(id));

      if (previousBanner) {
        queryClient.setQueryData<Banner>(bannerKeys.detail(id), {
          ...previousBanner,
          planType,
        });
      }

      return { previousBanner };
    },
    onError: (err, variables, context) => {
      if (context?.previousBanner) {
        queryClient.setQueryData(bannerKeys.detail(id), context.previousBanner);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}

// Update public status
export function useUpdateBannerIsPublic(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isPublic: boolean) => {
      await bannerStorage.updateIsPublic(id, isPublic);
      return isPublic;
    },
    onMutate: async (isPublic) => {
      await queryClient.cancelQueries({ queryKey: bannerKeys.detail(id) });
      const previousBanner = queryClient.getQueryData<Banner>(bannerKeys.detail(id));

      if (previousBanner) {
        queryClient.setQueryData<Banner>(bannerKeys.detail(id), {
          ...previousBanner,
          isPublic,
        });
      }

      return { previousBanner };
    },
    onError: (err, variables, context) => {
      if (context?.previousBanner) {
        queryClient.setQueryData(bannerKeys.detail(id), context.previousBanner);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bannerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bannerKeys.lists() });
    },
  });
}
