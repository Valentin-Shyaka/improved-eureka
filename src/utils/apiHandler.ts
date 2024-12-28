
import axios, { type AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T> {
  data: T | null;
  error: {
    message: string;
    status?: number;
  } | null;
}

export const apiHandler = async <T>(
  apiCallback: () => Promise<AxiosResponse<T>>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<T>> => {
  try {
    if (setLoading) setLoading(true);

    
    const response = await apiCallback();
    return {
      data: response.data,
      error: null,
    };
  } catch (error) {
    
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response);
      return {
        data: null,
        error: {
          message: error.response?.data?.message || error.message || "Unknown error occurred",
          status: error.response?.status,
        },
      };
    }

  
    console.error("Unexpected Error:", error);
    return {
      data: null,
      error: {
        message: (error as Error).message || "An unexpected error occurred",
      },
    };
  } finally {
    if (setLoading) setLoading(false);
  }
};


 
