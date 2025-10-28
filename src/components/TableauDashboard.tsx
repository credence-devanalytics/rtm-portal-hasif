"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';

// Types based on the Django models
interface User {
  pk: number;
  username: string;
  email: string;
  is_superuser: boolean;
}

interface UserProfile {
  user_id: number;
  acc_type: string;
  compName?: string;
}

interface AccNumDetail {
  acc_num: string;
  dashboard_package: string;
}

interface TableauConfig {
  tableauServer: string;
  tableauUsername: string;
  tableaupackage: string;
  workbookView: string;
  tableauURL: string;
  statusTableau: string;
  ticketID: string;
}

interface TableauDashboardProps {
  userId: number;
  currentUserId?: number;
}

// API client for Tableau trusted tickets
const fetchTableauTrustedTicket = async (username: string): Promise<{ ticket: string; status: string }> => {
  try {
    const response = await fetch('/api/tableau/trusted-ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Could not get trusted ticket:', error);
    return { ticket: '-1', status: 'error' };
  }
};

// API clients for user data
const fetchUser = async (userId: number): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

const fetchUserProfile = async (userId: number): Promise<UserProfile> => {
  const response = await fetch(`/api/userprofiles/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user profile');
  return response.json();
};

const fetchAccNumDetails = async (userEmail: string): Promise<AccNumDetail[]> => {
  const response = await fetch(`/api/accnum-details?email=${encodeURIComponent(userEmail)}`);
  if (!response.ok) throw new Error('Failed to fetch account number details');
  return response.json();
};

export default function TableauDashboard({ userId, currentUserId }: TableauDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableauConfig, setTableauConfig] = useState<TableauConfig | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [accNumDetails, setAccNumDetails] = useState<AccNumDetail[]>([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Security check: Users can only access their own dashboard unless superuser
        if (currentUserId && currentUserId !== userId) {
          // TODO: Check if current user is superuser
          setError('Access denied. You can only access your own dashboard.');
          return;
        }

        // Fetch user data
        const userData = await fetchUser(userId);
        setUser(userData);

        // Fetch user profile
        const userProfileData = await fetchUserProfile(userId);
        setUserProfile(userProfileData);

        // Fetch account number details
        const accDetails = await fetchAccNumDetails(userData.email);
        setAccNumDetails(accDetails);

        // Configure Tableau settings
        const tableauServerUrl = process.env.NEXT_PUBLIC_TABLEAU_SERVER_URL || 'https://tfbi-tableau.tmone.com.my/';
        let tableauUsername = userData.username;
        let tableauPackage: string;
        let workbookView: string;

        if (userData.is_superuser) {
          tableauUsername = 'admin';
          tableauPackage = 'TA';
          workbookView = 'OfficialAdmin3_0-TollfreeAnalyticsDashboard/CallSummary?:showAppBanner=false&:display_count=n&:showVizHome=n&:origin=viz_share_link&:embed=y';
        } else {
          if (accDetails.length > 0) {
            tableauUsername = accDetails[0].acc_num;
            tableauPackage = accDetails[0].dashboard_package;
          } else {
            tableauPackage = 'Standard';
          }
          workbookView = 'OfficialUser5_0_CR-TollfreeAnalyticsDashboard/Dashboard11?:showAppBanner=false&:display_count=n&:showVizHome=n&:origin=viz_share_link&:embed=y';
        }

        // Get Tableau trusted ticket
        const ticketResponse = await fetchTableauTrustedTicket(tableauUsername);
        
        let finalUrl: string;
        let statusTableau: string;

        if (ticketResponse.ticket !== '-1') {
          finalUrl = `${tableauServerUrl}trusted/${ticketResponse.ticket}/views/${workbookView}`;
          statusTableau = 'SSO';
        } else {
          finalUrl = `${tableauServerUrl}views/${workbookView}`;
          statusTableau = 'Direct';
        }

        const config: TableauConfig = {
          tableauServer: tableauServerUrl,
          tableauUsername,
          tableaupackage: tableauPackage,
          workbookView,
          tableauURL: finalUrl,
          statusTableau,
          ticketID: ticketResponse.ticket,
        };

        setTableauConfig(config);
      } catch (err) {
        console.error('Dashboard initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [userId, currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Tableau Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!tableauConfig || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-600 font-medium">Dashboard configuration not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className="bg-card text-card-foreground">
        <CardHeader className="">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Tableau Analytics Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome, {user.username}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={tableauConfig.statusTableau === 'SSO' ? 'default' : 'secondary'}>
                {tableauConfig.statusTableau}
              </Badge>
              {user.is_superuser && (
                <Badge variant="outline">Admin</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User Profile Information */}
      {userProfile && (
        <Card className="bg-card text-card-foreground">
          <CardHeader className="">
            <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <p className="text-sm">{userProfile.acc_type}</p>
              </div>
              {userProfile.compName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="text-sm">{userProfile.compName}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Package</p>
                <p className="text-sm">{tableauConfig.tableaupackage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Numbers */}
      {accNumDetails.length > 0 && (
        <Card className="bg-card text-card-foreground">
          <CardHeader className="">
            <CardTitle className="text-lg font-semibold">Account Numbers</CardTitle>
          </CardHeader>
          <CardContent className="">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {accNumDetails.map((acc, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="font-medium">{acc.acc_num}</p>
                  <p className="text-sm text-muted-foreground">{acc.dashboard_package}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau Embedded Dashboard */}
      <Card className="bg-card text-card-foreground">
        <CardHeader className="">
          <CardTitle className="text-lg font-semibold">Dashboard</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Status: {tableauConfig.statusTableau}</span>
            {tableauConfig.ticketID !== '-1' && (
              <span>• Ticket: {tableauConfig.ticketID.substring(0, 8)}...</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="w-full h-[800px] border rounded-lg overflow-hidden">
            <iframe
              src={tableauConfig.tableauURL}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title="Tableau Dashboard"
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Debug Information (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-card text-card-foreground">
          <CardHeader className="">
            <CardTitle className="text-lg font-semibold">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(
                {
                  tableauServer: tableauConfig.tableauServer,
                  tableauUsername: tableauConfig.tableauUsername,
                  statusTableau: tableauConfig.statusTableau,
                  workbookView: tableauConfig.workbookView,
                  userType: user.is_superuser ? 'admin' : 'user',
                },
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}