import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFaqs } from '@/hooks/useFaqs';
import { createFaq, updateFaq, FaqFormData } from '@/api/admin';
import { useAuth } from '@/contexts/AuthContext';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';

import { Faq } from '@/hooks/useFaqs';
interface FaqFormProps {
  onSave: (faq?: Faq) => void;
  editingFaq?: any;
  onCancel: () => void;
}

const FaqForm: React.FC<FaqFormProps> = ({ onSave, editingFaq, onCancel }) => {
  const { token } = useAuth();
  const [question, setQuestion] = useState(editingFaq?.question || '');
  const [answer, setAnswer] = useState(editingFaq?.answer || '');
  const [order, setOrder] = useState(editingFaq?.order || 0);

  const createFaqMutation = useMutationWithToast({
    mutationFn: (data: FaqFormData) => createFaq(data, token!),
    onSuccess: (faq) => {
      onSave(faq);
    },
    onSuccessMessage: 'FAQ created successfully',
    onErrorMessage: 'Failed to create FAQ',
  });

  const updateFaqMutation = useMutationWithToast({
    mutationFn: (data: { id: number; faqData: FaqFormData }) => updateFaq(data.id, data.faqData, token!),
    onSuccess: (faq) => {
      onSave(faq);
    },
    onSuccessMessage: 'FAQ updated successfully',
    onErrorMessage: 'Failed to update FAQ',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const faqData: FaqFormData = {
      question,
      answer,
      order,
    };

    if (editingFaq) {
      updateFaqMutation.mutate({ id: editingFaq.id, faqData });
    } else {
      createFaqMutation.mutate(faqData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Question</label>
        <Input value={question} onChange={e => setQuestion(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Answer</label>
        <Textarea value={answer} onChange={e => setAnswer(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Order</label>
        <Input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          type="submit"
          disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
        >
          {createFaqMutation.isPending || updateFaqMutation.isPending
            ? 'Saving...'
            : editingFaq ? 'Update' : 'Add'} FAQ
        </Button>
      </div>
    </form>
  );
};

export default FaqForm;
