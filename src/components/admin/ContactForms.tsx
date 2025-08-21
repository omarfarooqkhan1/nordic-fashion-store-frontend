import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  Eye, 
  Reply, 
  Trash2,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/common';
import api from '@/api/axios';

interface ContactForm {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

const ContactForms: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<ContactForm | null>(null);
  const [isViewingContact, setIsViewingContact] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact forms
  const { data: contactForms = [], isLoading, error } = useQuery({
    queryKey: ['admin-contact-forms'],
    queryFn: async () => {
      const response = await api.get('/admin/contact-forms');
      return response.data;
    },
  });

  // Update contact status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await api.put(`/admin/contact-forms/${id}`, { status, admin_notes: notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-forms'] });
      toast({
        title: 'Status updated',
        description: 'Contact form status has been updated successfully',
        className: 'bg-green-500 text-white',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating status',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  // Delete contact form mutation
  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/contact-forms/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-forms'] });
      toast({
        title: 'Contact form deleted',
        description: 'Contact form has been deleted successfully',
        className: 'bg-green-500 text-white',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting contact form',
        description: error.message || 'Failed to delete contact form',
        variant: 'destructive',
      });
    },
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this contact form submission?')) {
      deleteContactMutation.mutate(id);
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;

    try {
      // Send reply email (this would be implemented in the backend)
      await api.post(`/admin/contact-forms/${selectedContact.id}/reply`, {
        message: replyMessage,
      });

      // Update status to replied
      updateStatusMutation.mutate({ 
        id: selectedContact.id, 
        status: 'replied',
        notes: `Admin replied: ${replyMessage}`
      });

      setReplyMessage('');
      setIsReplying(false);
      setIsViewingContact(false);
      setSelectedContact(null);

      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent successfully',
        className: 'bg-green-500 text-white',
      });
    } catch (error: any) {
      toast({
        title: 'Error sending reply',
        description: error.message || 'Failed to send reply',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-500', icon: <Clock className="h-3 w-3" /> },
      read: { color: 'bg-yellow-500', icon: <Eye className="h-3 w-3" /> },
      replied: { color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
      closed: { color: 'bg-gray-500', icon: <CheckCircle className="h-3 w-3" /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading contact forms..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading contact forms: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Forms</h2>
          <p className="text-muted-foreground">
            Manage customer inquiries and contact form submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {contactForms.length} total submissions
          </Badge>
        </div>
      </div>

      {/* Contact Forms List */}
      <div className="space-y-4">
        {contactForms.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No contact form submissions yet</p>
              <p className="text-sm">New submissions will appear here</p>
            </CardContent>
          </Card>
        ) : (
          contactForms.map((contact: ContactForm) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                                         <div className="flex items-center gap-3 mb-2">
                       <div className="flex items-center gap-2">
                         <User className="h-4 w-4 text-muted-foreground" />
                         <span className="font-medium">
                           {contact.firstName} {contact.lastName}
                         </span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Mail className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">
                           {contact.email}
                         </span>
                       </div>
                       {getStatusBadge(contact.status)}
                     </div>
                     
                     <div className="flex items-center gap-3 mb-2">
                       <div className="flex items-center gap-2">
                         <MessageSquare className="h-4 w-4 text-muted-foreground" />
                         <span className="font-medium">{contact.subject}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Calendar className="h-4 w-4 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">
                           {formatDate(contact.created_at)}
                         </span>
                       </div>
                     </div>

                     <div className="bg-muted/50 p-3 rounded-md">
                       <p className="text-sm text-muted-foreground line-clamp-3">
                         {contact.message}
                       </p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Contact Form Details</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Name</label>
                              <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Email</label>
                              <p className="font-medium">{contact.email}</p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Subject</label>
                            <p className="font-medium">{contact.subject}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Message</label>
                            <p className="whitespace-pre-wrap bg-muted p-3 rounded-md">
                              {contact.message}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                              <p className="text-sm">{formatDate(contact.created_at)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Status</label>
                              <div className="mt-1">{getStatusBadge(contact.status)}</div>
                            </div>
                          </div>

                          {contact.admin_notes && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                              <p className="text-sm bg-muted p-3 rounded-md">{contact.admin_notes}</p>
                            </div>
                          )}

                          <Separator />

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsReplying(true);
                                  setReplyMessage('');
                                }}
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(contact.id, 'read')}
                                disabled={contact.status === 'read'}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Read
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(contact.id, 'closed')}
                                disabled={contact.status === 'closed'}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Close
                              </Button>
                            </div>

                            {isReplying && (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium">Reply Message</label>
                                  <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded-md"
                                    rows={4}
                                    placeholder="Type your reply message..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleReply} size="sm">
                                    Send Reply
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsReplying(false)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactForms;
