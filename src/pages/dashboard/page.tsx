"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import TableauDashboard from '@/components/TableauDashboard';
import Header from '@/components/Header';

export default function DashboardPage() {
  const params = useParams();
  const userId = parseInt(params?.userId as string);
  
  // In a real app, you'd get the current user's ID from authentication context
  const currentUserId = userId; // For demo purposes, assume they're accessing their own dashboard

  if (!userId || isNaN(userId)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-xl font-bold text-red-600 mb-4">Invalid User ID</h1>
              <p className="text-muted-foreground">Please provide a valid user ID to access the dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <TableauDashboard userId={userId} currentUserId={currentUserId} />
      </div>
    </div>
  );
}