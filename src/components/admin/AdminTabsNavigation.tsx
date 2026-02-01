import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package,
  Upload,
  Edit,
  Users,
  ShoppingCart,
  Mail
} from 'lucide-react';

interface AdminTabsNavigationProps {
  activeTab: string;
  adminStats?: {
    new_registrations?: number;
    pending_orders?: number;
    unread_contact_forms?: number;
  };
}

export const AdminTabsNavigation: React.FC<AdminTabsNavigationProps> = ({ 
  activeTab, 
  adminStats 
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex justify-center">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-1 text-muted-foreground shadow-lg border border-slate-200 dark:border-slate-700">
          <TabsTrigger 
            value="overview" 
            onClick={() => navigate("/admin/dashboard")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Package className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            onClick={() => navigate("/admin/products")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Package className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            onClick={() => navigate("/admin")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
            {(adminStats?.new_registrations || 0) > 0 && (
              <Badge className="ml-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">{adminStats.new_registrations}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            onClick={() => navigate("/admin")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Package className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Categories</span>
            <span className="sm:hidden">Cat.</span>
          </TabsTrigger>
          <TabsTrigger 
            value="orders" 
            onClick={() => navigate("/admin")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Orders
            {(adminStats?.pending_orders || 0) > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{adminStats.pending_orders}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="pending-reviews" 
            onClick={() => navigate("/admin")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Edit className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">Reviews</span>
            <span className="lg:hidden">Rev.</span>
          </TabsTrigger>
          <TabsTrigger 
            value="contact-forms" 
            onClick={() => navigate("/admin")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">Contacts</span>
            <span className="lg:hidden">Con.</span>
            {(adminStats?.unread_contact_forms || 0) > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{adminStats.unread_contact_forms}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="blogs" 
            onClick={() => navigate("/admin/blogs")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Edit className="w-4 h-4 mr-2" />
            Blogs
          </TabsTrigger>
          <TabsTrigger 
            value="faqs" 
            onClick={() => navigate("/admin")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Package className="w-4 h-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger 
            value="hero-images" 
            onClick={() => navigate("/admin")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">Hero Images</span>
            <span className="lg:hidden">Hero</span>
          </TabsTrigger>
          <TabsTrigger 
            value="newsletter" 
            onClick={() => navigate("/admin")} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:border-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50 mx-0.5"
          >
            <Mail className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">Newsletter</span>
            <span className="lg:hidden">News</span>
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
};