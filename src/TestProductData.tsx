import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from './api/products';

const TestProductData = () => {
  const { id } = useParams();

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['test-product', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID provided');
      const data = await fetchProductById(id);
      console.log('[TestProductData] Raw product data:', data);
      console.log('[TestProductData] Product structure:', {
        hasVariants: !!data.variants,
        variantsType: Array.isArray(data.variants) ? 'array' : typeof data.variants,
        variantsCount: Array.isArray(data.variants) ? data.variants.length : 'N/A',
        variants: data.variants
      });
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (!product) return <div>No product found</div>;

  return (
    <div>
      <h1>Product Data Test</h1>
      <p>Product ID: {product.id}</p>
      <p>Product Name: {product.name}</p>
      <p>Has variants: {product.variants ? 'Yes' : 'No'}</p>
      <p>Variants type: {Array.isArray(product.variants) ? 'array' : typeof product.variants}</p>
      {product.variants && (
        <div>
          <p>Variants count: {product.variants.length}</p>
          <ul>
            {product.variants.map((variant: any, index: number) => (
              <li key={index}>
                Variant {index + 1}: {variant.color} - {variant.size} (ID: {variant.id})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestProductData;