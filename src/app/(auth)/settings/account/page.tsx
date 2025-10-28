"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import { LogOut, User, Lock } from "lucide-react";

export default function AccountPage() {
    const { data: session, isPending } = useSession();
    const [email, setEmail] = useState(session?.user?.email || "");
    const [fullName, setFullName] = useState(session?.user?.name || "");
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

    const handleAccountUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // TODO: Implement full name change API call
            console.log("Changing full name to:", fullName);
            alert("Full name change functionality to be implemented");
        } catch (error) {
            console.error("Error changing full name:", error);
            alert("Error changing full name. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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
            // TODO: Implement password change API call
            console.log("Changing password");
            alert("Password change functionality to be implemented");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
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
        <div className="space-y-6 px-12">
            {/* Profile Header */}
            <div className="flex flex-col items-start">
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600">Manage your account information and security settings</p>
            </div>

            {/* Full Name Change Form */}
            <Card className="p-6 border-0 shadow-none">
                <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold">Update Account Details</h2>
                </div>
                <form onSubmit={handleAccountUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <Input
                            id="full-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="max-w-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your new email address"
                            className="max-w-md"
                            required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={isLoading || (email === session?.user?.email && fullName === session?.user?.name)}
                    >
                        {isLoading ? "Updating..." : "Save"}
                    </Button>
                </form>
            </Card>

            {/* Password Change Form */}
            <Card className="p-6 border-0 shadow-none">
                <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            className="max-w-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                            className="max-w-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            className="max-w-md"
                            required
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                    >
                        {isLoading ? "Updating..." : "Save"}
                    </Button>
                </form>
            </Card>

            {/* Logout Section */}
            <Card className="p-6 border-0 shadow-none">
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
