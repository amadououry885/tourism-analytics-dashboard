import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export const useApi = () => {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = async (
    endpoint: string,
    options?: RequestInit,
    successMessage?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(endpoint, options);
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
};
