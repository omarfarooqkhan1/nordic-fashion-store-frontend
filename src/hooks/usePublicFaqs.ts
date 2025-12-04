import useSWR from 'swr';
import api from '@/api/axios';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export function usePublicFaqs() {
  const { data, error, isLoading } = useSWR<Faq[]>(
    'public_faqs',
    async () => {
      const response = await api.get('/faqs');
      return response.data.data || response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    faqs: data,
    isLoading,
    isError: !!error,
  };
}