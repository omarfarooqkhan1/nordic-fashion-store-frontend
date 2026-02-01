import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common';
import { 
  Users, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Ban,
  Check
} from 'lucide-react';

import {
  getAllUsers,
  type AdminUser,
} from '@/api/admin';

const UserManagement: React.FC = () => {
  const { token } = useAuth();

  // State management - only for viewing
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const usersPerPage = 10;

  // Fetch users query - read-only
  const { 
    data: usersData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-users', currentPage, searchTerm, filterRole, filterStatus],
    queryFn: () => getAllUsers(
      token!,
      currentPage,
      usersPerPage,
      searchTerm,
      filterRole === 'all' ? '' : filterRole,
      filterStatus === 'all' ? '' : filterStatus
    ),
    enabled: !!token,
  });

  const totalPages = usersData ? Math.ceil(usersData.total / usersPerPage) : 0;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading users: {(error as Error).message}</p>
          <Button 
            onClick={() => refetch()} 
            className="mt-4"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6" />
        <h1 className="text-2xl font-bold">User Management (Read-Only)</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users ({usersData?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersData?.users && usersData.users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Orders</th>
                    <th className="text-left py-3 px-4">Total Spent</th>
                    <th className="text-left py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.name}
                              {user.user_type === 'guest' && (
                                <Badge variant="outline" className="text-xs">Guest</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <User className="w-3 h-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            user.status === 'active' ? 'default' : 
                            user.status === 'banned' ? 'destructive' : 
                            user.status === 'guest' ? 'secondary' : 'secondary'
                          }
                        >
                          {user.status === 'active' && <Check className="w-3 h-3 mr-1" />}
                          {user.status === 'banned' && <Ban className="w-3 h-3 mr-1" />}
                          {user.status === 'guest' && <User className="w-3 h-3 mr-1" />}
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                          {user.orders_count || 0}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          ${user.total_spent || 0}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;