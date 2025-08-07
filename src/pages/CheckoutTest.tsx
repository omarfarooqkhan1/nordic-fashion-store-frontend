import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CheckoutTest: React.FC = () => {
  const { items, isLoading, getCartTotal, getCartItemsCount } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  console.log('🧪 CheckoutTest - isLoading:', isLoading, 'items:', items?.length);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/cart')}
        className="mb-6 hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <h1 className="text-3xl font-bold mb-6">Checkout Test Page</h1>
      
      <div className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Loading Status:</strong> {isLoading ? 'Loading...' : 'Loaded'}
          </div>
          <div>
            <strong>Items Count:</strong> {items?.length || 0}
          </div>
          <div>
            <strong>User:</strong> {user?.name || 'Guest'}
          </div>
          <div>
            <strong>Token:</strong> {token ? 'Present' : 'None'}
          </div>
          <div>
            <strong>Cart Total:</strong> €{getCartTotal?.() || 0}
          </div>
          <div>
            <strong>Items Count (fn):</strong> {getCartItemsCount?.() || 0}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Cart Items Detail:</h3>
          {!isLoading && items && items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p><strong>Item {index + 1}:</strong> {item.variant?.product?.name}</p>
                  <p><strong>Size:</strong> {item.variant?.size} | <strong>Color:</strong> {item.variant?.color}</p>
                  <p><strong>Quantity:</strong> {item.quantity} | <strong>Price:</strong> €{item.variant?.product?.price}</p>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <p>Loading cart items...</p>
          ) : (
            <p className="text-red-500">No items in cart</p>
          )}
        </div>

        <div className="mt-6">
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            onClick={() => {
              console.log('🔘 Test button clicked!');
              alert('Checkout test button works! Cart has ' + (items?.length || 0) + ' items');
            }}
          >
            Test Checkout Button (Items: {items?.length || 0})
          </Button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify({
              isLoading,
              itemsLength: items?.length,
              user: user ? { id: user.id, name: user.name, email: user.email } : null,
              hasToken: !!token,
              cartTotal: getCartTotal?.(),
              itemsCount: getCartItemsCount?.()
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CheckoutTest;
