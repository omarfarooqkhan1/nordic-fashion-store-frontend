import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsletterUnsubscribe = () => {
  const { email } = useParams<{ email: string }>();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_unsubscribed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!email) {
        setStatus('error');
        setMessage('Invalid email address');
        return;
      }

      try {
        const response = await fetch(`/api/newsletter/unsubscribe/${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          if (data.message.includes('already unsubscribed')) {
            setStatus('already_unsubscribed');
          } else {
            setStatus('success');
          }
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to unsubscribe');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    handleUnsubscribe();
  }, [email]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
      case 'already_unsubscribed':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      default:
        return <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'already_unsubscribed':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-blue-700';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Successfully Unsubscribed!';
      case 'already_unsubscribed':
        return 'Already Unsubscribed';
      case 'error':
        return 'Unsubscribe Failed';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-leather-50 to-leather-100 dark:from-leather-900 dark:to-leather-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="text-2xl font-bold text-leather-800 dark:text-leather-200 mb-2">
              🏔️ NORD FLEX
            </div>
            <p className="text-sm text-muted-foreground">Premium Nordic Fashion & Accessories</p>
          </div>
          <CardTitle className={`text-xl ${getStatusColor()}`}>
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {getStatusIcon()}
          
          <div className="space-y-2">
            <p className="text-muted-foreground">{message}</p>
            {email && (
              <p className="text-sm text-muted-foreground">
                Email: <span className="font-medium">{decodeURIComponent(email)}</span>
              </p>
            )}
          </div>

          {status === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                You will no longer receive newsletter emails from us. 
                You can always resubscribe by visiting our website.
              </p>
            </div>
          )}

          {status === 'already_unsubscribed' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You were already unsubscribed from our newsletter. 
                If you want to resubscribe, please visit our website.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                If you continue to have issues, please contact us at support@nordflex.store
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link to="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterUnsubscribe;