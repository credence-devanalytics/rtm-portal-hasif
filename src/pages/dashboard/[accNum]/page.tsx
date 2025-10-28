"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import TableauDashboard from '@/components/TableauDashboard';
import Header from '@/components/Header';

export default function AccountDashboardPage() {
  const params = useParams();
  const userId = parseInt(params?.userId as string);
  const accNum = params?.accNum as string;
  
  // In a real app, you'd get the current user's ID from authentication context
  const currentUserId = userId; // For demo purposes, assume they're accessing their own dashboard

  if (!userId || isNaN(userId) || !accNum) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h1 className="text-xl font-bold text-red-600 mb-4">Invalid Parameters</h1>
              <p className="text-muted-foreground">
                Please provide a valid user ID and account number to access the dashboard.
              </p>
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Dashboard for Account: {accNum}</h1>
          <p className="text-muted-foreground">User ID: {userId}</p>
        </div>
        <TableauDashboard userId={userId} currentUserId={currentUserId} />
      </div>
    </div>
  );
}