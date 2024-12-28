import { useQuery, UseQueryOptions } from '@tanstack/vue-query';
import { apiHandler } from '@/utils/apiHandler';
import { AxiosResponse, AxiosError } from 'axios';

export const useHandledQuery = <T>(
  queryKey: any[],
  apiCallback: () => Promise<AxiosResponse<T>>,
  options?: Omit<UseQueryOptions<T, AxiosError>, 'queryKey' | 'queryFn'>
) => {
  const wrappedQueryFn = async () => {
    const { data, error } = await apiHandler(apiCallback);

    if (error) {
      const axiosError: AxiosError = {
        isAxiosError: true,
        config: {},
        message: error.message,
        name: "AxiosError",
        code: error.status?.toString(),
        response: {
          status: error.status!,
          data: error.message,
        },
        request: {},
        toJSON: () => ({ message: error.message, status: error.status }),
      };
      throw axiosError;
    }

    return data!;
  };

  return useQuery<T, AxiosError>({
    queryKey,
    queryFn: wrappedQueryFn,
    ...options,
  });
};
