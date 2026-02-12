# Product Translation Guide

This guide explains how to use the automatic product translation feature in the Nordic Fashion Store.

## Overview

The application uses the **MyMemory Translation API** (free, no API key required) to automatically translate product names and descriptions into Nordic languages (Swedish, Norwegian, Danish, Finnish, Icelandic).

## Features

- ✅ Free translation API (no authentication required)
- ✅ Automatic caching to reduce API calls
- ✅ Support for all Nordic languages
- ✅ Graceful fallback to original text if translation fails
- ✅ Loading states for better UX

## Supported Languages

- English (en) - Source language
- Swedish (sv)
- Norwegian (no)
- Danish (da)
- Finnish (fi)
- Icelandic (is)

## Usage

### 1. Using the Hook (Recommended)

For single products:

```tsx
import { useProductTranslation } from '@/hooks/useProductTranslation';

function ProductDetail({ product }) {
  const { name, description, isTranslating } = useProductTranslation(product);
  
  return (
    <div>
      {isTranslating && <span>Translating...</span>}
      <h1>{name}</h1>
      <p>{description}</p>
    </div>
  );
}
```

For multiple products:

```tsx
import { useProductsTranslation } from '@/hooks/useProductTranslation';

function ProductList({ products }) {
  const { translatedProducts, isTranslating } = useProductsTranslation(products);
  
  return (
    <div>
      {isTranslating && <span>Translating products...</span>}
      {translatedProducts.map((product, index) => (
        <div key={index}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Using the Wrapper Component

For product cards:

```tsx
import { TranslatedProductCard } from '@/components/products';

function ProductGrid({ products }) {
  return (
    <div className="grid">
      {products.map(product => (
        <TranslatedProductCard 
          key={product.id} 
          product={product} 
        />
      ))}
    </div>
  );
}
```

### 3. Using the Render Prop Component

For custom rendering:

```tsx
import { TranslatedProductInfo } from '@/components/products';

function CustomProductView({ product }) {
  return (
    <TranslatedProductInfo product={product}>
      {({ name, description, isTranslating }) => (
        <div>
          {isTranslating && <Spinner />}
          <h1 className="text-2xl">{name}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
      )}
    </TranslatedProductInfo>
  );
}
```

### 4. Direct API Usage

For advanced use cases:

```tsx
import { translateText, translateProduct } from '@/services/translationService';

// Translate single text
const translatedText = await translateText('Hello World', 'sv');

// Translate product
const translatedProduct = await translateProduct(
  { name: 'Leather Jacket', description: 'Premium quality' },
  'sv'
);
```

## Implementation in Pages

### Homepage

```tsx
// In Index.tsx
import { useProductsTranslation } from '@/hooks/useProductTranslation';

const { translatedProducts } = useProductsTranslation(featuredProducts);
```

### Products Page

```tsx
// In Products.tsx
import { TranslatedProductCard } from '@/components/products';

{products.map(product => (
  <TranslatedProductCard key={product.id} product={product} />
))}
```

### Product Details Page

```tsx
// In ProductDetail.tsx
import { useProductTranslation } from '@/hooks/useProductTranslation';

const { name, description } = useProductTranslation(product);
```

### Cart Page

```tsx
// In Cart.tsx
{items.map(item => {
  const { name } = useProductTranslation(item.product);
  return <div>{name}</div>;
})}
```

### Checkout Page

```tsx
// In Checkout.tsx
{items.map(item => {
  const { name } = useProductTranslation(item.product);
  return <div>{name}</div>;
})}
```

## Caching

Translations are automatically cached in memory to:
- Reduce API calls
- Improve performance
- Provide instant translations for repeated content

Cache is cleared when:
- User refreshes the page
- Application is restarted

## API Limits

MyMemory Translation API free tier:
- 10,000 words/day
- No authentication required
- Rate limit: ~100 requests/minute

## Fallback Behavior

If translation fails:
1. Original English text is displayed
2. Error is logged to console
3. No error message shown to user
4. Application continues to work normally

## Performance Tips

1. **Use batch translation** for multiple products
2. **Translations are cached** - switching languages is instant after first load
3. **Lazy load translations** - only translate visible products
4. **Debounce language changes** - avoid rapid API calls

## Troubleshooting

### Translations not working?

1. Check browser console for errors
2. Verify internet connection
3. Check if API is accessible: https://api.mymemory.translated.net/
4. Clear cache: `clearTranslationCache()`

### Slow translations?

1. Use batch translation for multiple products
2. Implement pagination to reduce products per page
3. Consider pre-translating popular products server-side

### Wrong translations?

1. MyMemory uses machine translation - quality may vary
2. Consider adding manual translations for important products
3. Report issues to improve translation quality

## Future Enhancements

- [ ] Server-side translation caching
- [ ] Database storage for translations
- [ ] Admin panel for manual translation overrides
- [ ] Translation quality feedback system
- [ ] Support for more languages
- [ ] Offline translation support

## Alternative APIs

If you need better quality or higher limits, consider:

1. **Google Translate API** (paid, high quality)
2. **DeepL API** (paid, excellent quality)
3. **LibreTranslate** (self-hosted, free)
4. **Azure Translator** (paid, enterprise-grade)

## License

Translation service is part of the Nordic Fashion Store application.
MyMemory Translation API is provided by Translated SRL.
