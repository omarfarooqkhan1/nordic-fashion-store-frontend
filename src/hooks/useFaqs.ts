import useSWR from 'swr';
import { getAllFaqs } from '@/api/admin';
import { useAuth } from '@/contexts/AuthContext';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export function useFaqs() {
  const { token } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<Faq[]>(
    token ? ['faqs', token] : null,
    () => getAllFaqs(token!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    faqs: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
