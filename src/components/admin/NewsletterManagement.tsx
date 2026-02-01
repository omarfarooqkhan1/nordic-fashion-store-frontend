import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Users, 
  UserCheck, 
  UserX, 
  Download, 
  Plus, 
  Search,
  Loader2,
  Trash2,
  TrendingUp,
  Send,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminNewsletterApi, NewsletterSubscription, NewsletterStats } from '@/api/newsletter';

export const NewsletterManagement: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({ email: '', name: '' });
  const [isAddingSubscriber, setIsAddingSubscriber] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Broadcast state
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    subject: '',
    content: '',
    send_to: 'active' as 'all' | 'active' | 'test'
  });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  
  const { toast } = useToast();

  const fetchSubscribers = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await adminNewsletterApi.getSubscribers({
        page,
        limit: 20,
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
      });
      
      setSubscribers(response.subscribers);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch newsletter subscribers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminNewsletterApi.getStats();
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch newsletter statistics',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSubscribers(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sourceFilter]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvData = await adminNewsletterApi.exportSubscribers({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
      });
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Successful',
        description: 'Newsletter subscribers exported to CSV',
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export newsletter subscribers',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingSubscriber(true);
    try {
      await adminNewsletterApi.addSubscriber(newSubscriber);
      toast({
        title: 'Subscriber Added',
        description: 'Newsletter subscriber added successfully',
      });
      setNewSubscriber({ email: '', name: '' });
      setIsAddDialogOpen(false);
      fetchSubscribers(currentPage);
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add subscriber',
        variant: 'destructive',
      });
    } finally {
      setIsAddingSubscriber(false);
    }
  };

  const handleUpdateSubscriber = async (id: number, is_active: boolean) => {
    try {
      await adminNewsletterApi.updateSubscriber(id, { is_active });
      toast({
        title: 'Subscriber Updated',
        description: `Subscriber ${is_active ? 'activated' : 'deactivated'} successfully`,
      });
      fetchSubscribers(currentPage);
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update subscriber',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    try {
      await adminNewsletterApi.deleteSubscriber(id);
      toast({
        title: 'Subscriber Deleted',
        description: 'Newsletter subscriber deleted successfully',
      });
      fetchSubscribers(currentPage);
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscriber',
        variant: 'destructive',
      });
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastData.subject.trim() || !broadcastData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both subject and content fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingBroadcast(true);
    try {
      const result = await adminNewsletterApi.sendBroadcast(broadcastData);
      
      toast({
        title: 'Newsletter Sent!',
        description: `Successfully sent to ${result.recipients_count} subscribers`,
      });
      
      setBroadcastData({ subject: '', content: '', send_to: 'active' });
      setIsBroadcastDialogOpen(false);
      
      // Show additional info if there were failures
      if (result.failed_sends > 0) {
        toast({
          title: 'Partial Success',
          description: `${result.successful_sends} sent successfully, ${result.failed_sends} failed`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send newsletter broadcast',
        variant: 'destructive',
      });
    } finally {
      setIsSendingBroadcast(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
                  <p className="text-2xl font-bold">{stats.total_subscribers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Subscribers</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_subscribers}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive Subscribers</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive_subscribers}</p>
                </div>
                <UserX className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent (30 days)</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.recent_subscribers}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Newsletter Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: 'active' | 'inactive' | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={(value: string) => setSourceFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="checkout">Checkout</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Newsletter
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Newsletter Broadcast</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="broadcast-subject">Subject *</Label>
                      <Input
                        id="broadcast-subject"
                        type="text"
                        value={broadcastData.subject}
                        onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                        placeholder="Newsletter subject line..."
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="broadcast-content">Content *</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2 mb-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const template = `<h1>Welcome to Our Latest Collection</h1>
<p>We're excited to share our newest arrivals with you! This season brings fresh Nordic-inspired designs that blend traditional craftsmanship with modern style.</p>

<h2>Featured Products</h2>
<p>Discover our handpicked selection of premium pieces:</p>
<ul>
<li><strong>Nordic Wool Sweaters</strong> - Crafted from the finest Scandinavian wool</li>
<li><strong>Leather Accessories</strong> - Handmade with attention to detail</li>
<li><strong>Outdoor Essentials</strong> - Built for Nordic adventures</li>
</ul>

<h2>Special Offer</h2>
<p>As a valued subscriber, enjoy <strong>15% off</strong> your next purchase with code <strong>NORDIC15</strong></p>

<p>Thank you for being part of the Nord Flex community!</p>
<p>Best regards,<br>The Nord Flex Team</p>`;
                              setBroadcastData({ ...broadcastData, content: template });
                            }}
                          >
                            📝 Product Announcement
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const template = `<h1>Seasonal Style Guide</h1>
<p>As the seasons change, so does our approach to Nordic fashion. Here's how to style your wardrobe for the months ahead.</p>

<h2>This Season's Trends</h2>
<p>Embrace the Nordic aesthetic with these key pieces:</p>

<h3>🧥 Outerwear Essentials</h3>
<p>Layer up with our premium wool coats and weather-resistant jackets designed for both city and wilderness.</p>

<h3>🧣 Accessories That Matter</h3>
<p>Complete your look with handcrafted scarves, leather gloves, and sustainable accessories.</p>

<h2>Styling Tips</h2>
<p>Our design team shares their favorite ways to mix and match Nordic pieces for any occasion.</p>

<p>Stay stylish and stay warm!</p>`;
                              setBroadcastData({ ...broadcastData, content: template });
                            }}
                          >
                            👗 Style Guide
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const template = `<h1>Behind the Scenes at Nord Flex</h1>
<p>Take a journey with us to discover the craftsmanship and passion behind every Nord Flex piece.</p>

<h2>Our Artisans</h2>
<p>Meet the skilled craftspeople who bring Nordic traditions to life in every stitch, cut, and detail.</p>

<h2>Sustainable Practices</h2>
<p>Learn about our commitment to environmental responsibility and ethical manufacturing processes.</p>

<h2>From Concept to Creation</h2>
<p>Follow the journey of our latest collection from initial sketches to the finished products you love.</p>

<p>We believe in transparency and quality - values that define the Nordic way.</p>`;
                              setBroadcastData({ ...broadcastData, content: template });
                            }}
                          >
                            🏭 Behind the Scenes
                          </Button>
                        </div>
                        <Textarea
                          id="broadcast-content"
                          value={broadcastData.content}
                          onChange={(e) => setBroadcastData({ ...broadcastData, content: e.target.value })}
                          placeholder="Write your newsletter content here using HTML formatting..."
                          rows={12}
                          required
                          className="font-mono text-sm"
                        />
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><strong>HTML Formatting Tips:</strong></p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>• <code>&lt;h1&gt;Main Title&lt;/h1&gt;</code></div>
                            <div>• <code>&lt;h2&gt;Section Title&lt;/h2&gt;</code></div>
                            <div>• <code>&lt;p&gt;Paragraph text&lt;/p&gt;</code></div>
                            <div>• <code>&lt;strong&gt;Bold text&lt;/strong&gt;</code></div>
                            <div>• <code>&lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;</code></div>
                            <div>• <code>&lt;a href="url"&gt;Link&lt;/a&gt;</code></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="broadcast-send-to">Send To</Label>
                      <Select 
                        value={broadcastData.send_to} 
                        onValueChange={(value: 'all' | 'active' | 'test') => 
                          setBroadcastData({ ...broadcastData, send_to: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test">
                            <div className="flex items-center gap-2">
                              <TestTube className="w-4 h-4" />
                              Test (Admin Only)
                            </div>
                          </SelectItem>
                          <SelectItem value="active">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4" />
                              Active Subscribers ({stats?.active_subscribers || 0})
                            </div>
                          </SelectItem>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              All Subscribers ({stats?.total_subscribers || 0})
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsPreviewOpen(true)}
                        disabled={!broadcastData.subject || !broadcastData.content}
                      >
                        👁️ Preview
                      </Button>
                      <Button variant="outline" onClick={() => setIsBroadcastDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendBroadcast} disabled={isSendingBroadcast}>
                        {isSendingBroadcast ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Newsletter
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subscriber
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Newsletter Subscriber</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="add-email">Email Address *</Label>
                      <Input
                        id="add-email"
                        type="email"
                        value={newSubscriber.email}
                        onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                        placeholder="subscriber@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-name">Name (Optional)</Label>
                      <Input
                        id="add-name"
                        type="text"
                        value={newSubscriber.name}
                        onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                        placeholder="Subscriber Name"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSubscriber} disabled={isAddingSubscriber}>
                        {isAddingSubscriber ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Add Subscriber'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading subscribers...
                    </TableCell>
                  </TableRow>
                ) : subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No subscribers found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                          {subscriber.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscriber.subscription_source}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(subscriber.subscribed_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateSubscriber(subscriber.id, !subscriber.is_active)}
                          >
                            {subscriber.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => fetchSubscribers(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchSubscribers(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Newsletter Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Newsletter Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Subject Line:</h3>
              <p className="text-lg">{broadcastData.subject}</p>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 text-sm font-medium">
                Email Preview (Desktop View)
              </div>
              <div className="bg-white">
                <div style={{
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  maxWidth: '600px',
                  margin: '0 auto',
                  backgroundColor: '#ffffff'
                }}>
                  {/* Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    padding: '40px 30px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>
                      🏔️ NORD FLEX
                    </div>
                    <p style={{
                      color: '#ecf0f1',
                      fontSize: '14px',
                      margin: '0',
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                    }}>
                      Premium Nordic Fashion & Lifestyle
                    </p>
                  </div>
                  
                  {/* Content */}
                  <div style={{ padding: '40px 30px' }}>
                    <div style={{
                      fontSize: '18px',
                      color: '#2c3e50',
                      marginBottom: '25px',
                      fontWeight: '500'
                    }}>
                      Hello Nordic Fashion Enthusiast,
                    </div>
                    
                    <div style={{
                      color: '#34495e',
                      lineHeight: '1.7',
                      fontSize: '16px'
                    }}>
                      <div dangerouslySetInnerHTML={{ __html: broadcastData.content }} />
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div style={{
                    textAlign: 'center',
                    padding: '30px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <a href="#" style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #d4af37 0%, #b8941f 100%)',
                      color: '#ffffff',
                      padding: '16px 32px',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '16px',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Shop Our Collection
                    </a>
                  </div>
                  
                  {/* Footer */}
                  <div style={{
                    backgroundColor: '#2c3e50',
                    color: '#ecf0f1',
                    padding: '40px 30px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      marginBottom: '15px'
                    }}>
                      NORD FLEX
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#bdc3c7',
                      marginBottom: '25px',
                      lineHeight: '1.5'
                    }}>
                      Discover premium Nordic fashion and accessories crafted for the modern adventurer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};