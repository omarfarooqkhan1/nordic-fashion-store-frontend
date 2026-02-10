import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export interface StaticPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export const fetchStaticPages = async (): Promise<StaticPage[]> => {
  const response = await axios.get(`${API_URL}/api/static-pages`);
  return response.data.data;
};

export const fetchStaticPage = async (slug: string): Promise<StaticPage> => {
  const response = await axios.get(`${API_URL}/api/static-pages/${slug}`);
  return response.data.data;
};

export const updateStaticPage = async (
  id: number,
  data: { title: string; content: string },
  token: string
): Promise<StaticPage> => {
  const response = await axios.put(
    `${API_URL}/api/static-pages/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data;
};
