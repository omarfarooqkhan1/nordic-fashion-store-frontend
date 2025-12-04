import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFaqs } from '@/hooks/useFaqs';
import FaqForm from './FaqForm';
import { deleteFaq } from '@/api/admin';
import { useAuth } from '@/contexts/AuthContext';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminFaqs: React.FC = () => {
  const { faqs, isLoading, isError, mutate } = useFaqs();
  const { token } = useAuth();
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<any | null>(null);


  const handleAdd = () => {
    setEditingFaq(null);
    setShowForm(true);
  };
  const handleEdit = (faq: any) => {
    setEditingFaq(faq);
    setShowForm(true);
  };
  const deleteFaqMutation = useMutationWithToast({
    mutationFn: (faqId: number) => deleteFaq(faqId, token!),
    onSuccess: (_data, faqId) => {
      setFaqToDelete(null);
      mutate((prevFaqs: any[] = []) => prevFaqs.filter(faq => faq.id !== faqId), false);
    },
    onSuccessMessage: 'FAQ deleted successfully',
    onErrorMessage: 'Failed to delete FAQ',
  });

  const handleSave = (faq?: any) => {
    setShowForm(false);
    if (faq) {
      mutate((prevFaqs: any[] = []) => {
        const exists = prevFaqs.some(f => f.id === faq.id);
        if (exists) {
          // Update
          return prevFaqs.map(f => (f.id === faq.id ? faq : f));
        } else {
          // Add
          return [...prevFaqs, faq];
        }
      }, false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleDelete = (faq: any) => {
    setFaqToDelete(faq);
  };

  const confirmDelete = () => {
    if (faqToDelete) {
      deleteFaqMutation.mutate(faqToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage FAQs</h2>
        <Button onClick={handleAdd}>Add FAQ</Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</CardTitle>
          </CardHeader>
          <CardContent>
            <FaqForm onSave={handleSave} editingFaq={editingFaq} onCancel={handleCancel} />
          </CardContent>
        </Card>
      )}
      <div className="space-y-4">
        {isLoading && <div>Loading FAQs...</div>}
        {isError && <div>Failed to load FAQs.</div>}
        {faqs && Array.isArray(faqs) && faqs.map((faq: any) => (
          <Card key={faq.id}>
            <CardContent className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{faq.question}</div>
                <div className="text-muted-foreground text-sm">{faq.answer}</div>
              </div>
              <div className="flex gap-2">
                 <Button size="sm" variant="outline" onClick={() => handleEdit(faq)}>Edit</Button>
                 <Button size="sm" variant="destructive" onClick={() => handleDelete(faq)}>Delete</Button>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!faqToDelete} onOpenChange={() => setFaqToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the FAQ "{faqToDelete?.question}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFaqs;
