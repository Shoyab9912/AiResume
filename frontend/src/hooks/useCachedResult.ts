import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";

export function useCachedResult<T>(key: QueryKey) {
  const qc = useQueryClient();

  const { data: result } = useQuery<T | null>({
    queryKey: key,
    queryFn: () => Promise.resolve(null),
    enabled: false,
    gcTime: 1000 * 60 * 40,
  });

  const clearResult = () => qc.setQueryData(key, null);

  return { result, clearResult };
}