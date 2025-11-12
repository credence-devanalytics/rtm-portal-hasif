"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import { LogOut, User, Lock } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

export default function AccountPage() {
    const { data: session, isPending } = useSession();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (isPending) {
        return (
        <div className="h-screen flex flex-col items-center justify-center">
            <h1>Loading...</h1>
        </div>
        );
    }



    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            alert("New passwords don't match!");
            return;
        }
        
        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long!");
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch('/api/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Password updated successfully!');
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                alert(data.error || 'Failed to update password');
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Error changing password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        signOut();
    };
    
    return (
        <div className="space-y-4 px-12">
            {/* Profile Header */}
            <div className="flex flex-col items-start">
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600">Manage your account information and security settings</p>
            </div>

            {/* Account Details Display */}
            <Card className="p-6 border-0 shadow-none">
                <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold">Account Details</h2>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <div className="text-gray-900 font-medium">
                                {session?.user?.name || 'Not specified'}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="text-gray-900 font-medium">
                                {session?.user?.email || 'Not specified'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <div className="text-gray-900 font-medium capitalize">
                                {(session?.user as any)?.role || 'Not specified'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Position
                            </label>
                            <div className="text-gray-900 font-medium">
                                {(session?.user as any)?.position || 'Not specified'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Task Role
                            </label>
                            <div className="text-gray-900 font-medium">
                                {(session?.user as any)?.taskRole || 'Not specified'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                System ID
                            </label>
                            <div className="text-gray-900 font-medium">
                                {(session?.user as any)?.systemId || 'Not assigned'}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            
            {/* Contact Section */}
            <Card className="px-6 py-4 border-0 shadow-none">
                <div className="flex flex-col items-start gap-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
                        <p className="text-gray-600">Got issues with your account?</p>
                    </div>
                    <Button 
                        onClick={() => window.location.href = '/contact'}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Contact Support
                    </Button>
                </div>
            </Card>

            {/* Logout Section */}
            <Card className="px-6 py-4 border-0 shadow-none">
                <div className="flex flex-col items-start gap-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Log Out</h2>
                        <p className="text-gray-600">Log out of your account on this device</p>
                    </div>
                    <Button 
                        onClick={handleLogout}
                        variant="destructive"
                        className="flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </Button>
                </div>
            </Card>
        </div>
    );
}
