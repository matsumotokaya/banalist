import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { likeStorage } from '../utils/likeStorage';
import { templateKeys } from './useTemplates';
import type { TemplateRecord } from '../types/template';

export const likeKeys = {
  all: ['likes'] as const,
  userLikes: () => [...likeKeys.all, 'user'] as const,
};

export function useUserLikes(userId: string | undefined) {
  return useQuery({
    queryKey: likeKeys.userLikes(),
    queryFn: () => likeStorage.getUserLikes(),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => likeStorage.toggleLike(templateId),

    onMutate: async (templateId: string) => {
      await queryClient.cancelQueries({ queryKey: likeKeys.userLikes() });
      await queryClient.cancelQueries({ queryKey: templateKeys.lists() });

      const previousLikes = queryClient.getQueryData<string[]>(likeKeys.userLikes());
      const previousTemplates = queryClient.getQueryData<TemplateRecord[]>(templateKeys.lists());

      const isCurrentlyLiked = previousLikes?.includes(templateId) ?? false;

      // Optimistically update user likes
      queryClient.setQueryData<string[]>(likeKeys.userLikes(), (old) => {
        if (!old) return isCurrentlyLiked ? [] : [templateId];
        return isCurrentlyLiked
          ? old.filter((id) => id !== templateId)
          : [...old, templateId];
      });

      // Optimistically update template like count
      queryClient.setQueryData<TemplateRecord[]>(templateKeys.lists(), (old) => {
        if (!old) return old;
        return old.map((t) => {
          if (t.id !== templateId) return t;
          return {
            ...t,
            likeCount: (t.likeCount ?? 0) + (isCurrentlyLiked ? -1 : 1),
          };
        });
      });

      return { previousLikes, previousTemplates };
    },

    onError: (_err, _templateId, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(likeKeys.userLikes(), context.previousLikes);
      }
      if (context?.previousTemplates) {
        queryClient.setQueryData(templateKeys.lists(), context.previousTemplates);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: likeKeys.userLikes() });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}
