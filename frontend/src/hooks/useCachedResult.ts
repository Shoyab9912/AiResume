import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";


export function useCachedResult<T>(key: QueryKey) {
  const queryClient = useQueryClient();

  const { data: result } = useQuery<T | null>({
    queryKey: key,
    queryFn: () => Promise.resolve(null),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 40,
    enabled: false,
  });

  const clearResult = () => queryClient.removeQueries({ queryKey: key });

  return { result, clearResult };
}