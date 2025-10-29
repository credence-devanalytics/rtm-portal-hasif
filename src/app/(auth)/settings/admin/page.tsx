"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/hooks/use-user-data";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Users, Crown } from "lucide-react";

type Role = "user" | "admin" | "superadmin";

interface User {
    id?: string;
    name: string;
    email: string;
    role: Role;
    image?: string;
    createdAt: Date;
    permissions?: string[];
}

export default function AdminPage() {
    // All hooks must be declared at the top, before any conditional returns
    const { userData, isLoading } = useUserData();
    const [users, setUsers] = useState<User[]>([]);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingUserData, setEditingUserData] = useState<{ name: string; email: string; role: string; permissions: string[] } | null>(null);

    const socmedPages = [
        {name:'SocMed Account', key:'SocMedAcc'},
        {name:'SocMed Sentiment', key:'SocMedSent'},
    ];
    const tvPages = [
        {name:'RTMClick', key:'RTMClick'},
        {name:'MyTV', key:'MyTV'},
        {name:'ASTRO', key:'ASTRO'},
        {name:'UnifiTV', key:'UnifiTV'},
        {name:'Warta Berita', key:'Berita'},
        {name:'Marketing', key:'Marketing'}
    ];

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsUsersLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    console.log("User Data:", userData);

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }
    
    // Check if user is admin (after loading is complete)
    if (!["admin", "superadmin"].includes(userData?.role)) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600">You must be an admin to access this page.</p>
            </div>
        );
    }

    const addUser = () => {
        const newUser: User = {
            name: "Full Name",
            email: "mail@example.com",
            role: "user",
            createdAt: new Date(),
            permissions: [],
        };

        const updatedUsers = [...users];
        updatedUsers.push(newUser);
        setUsers(updatedUsers);
        setEditingUserId(newUser.id);
        setEditingUserData({ 
            name: newUser.name, 
            email: newUser.email, 
            role: newUser.role,
            permissions: newUser.permissions || []
        });
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });
            
            if (response.ok) {
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, role: newRole as Role } : user
                ));
                setEditingUserId(null);
                alert('User role updated successfully!');
            } else {
                alert('Failed to update user role');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Error updating user role');
        }
    };

    const deleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const response = await fetch('/api/admin/users', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });
                
                if (response.ok) {
                    setUsers(users.filter(user => user.id !== userId));
                    alert('User deleted successfully!');
                } else {
                    const errorData = await response.json();
                    alert(errorData.error || 'Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
            }
        }
    };

    const saveUserEdit = async (userId: string) => {
        if (!editingUserData) return;

        try {
            setIsSaving(true);
            
            const isNewUser = userId === undefined;
            const url = '/api/admin/users';
            const method = isNewUser ? 'POST' : 'PUT';
            
            const requestData = {
                ...(isNewUser ? {} : { userId }),
                name: editingUserData.name,
                email: editingUserData.email,
                role: editingUserData.role,
                permissions: editingUserData.permissions
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                const data = await response.json();
                
                if (isNewUser) {
                    // Replace the temporary user with the actual created user
                    setUsers(users.map(user => 
                        user.id === userId ? {
                            ...data.user,
                            createdAt: new Date(data.user.createdAt)
                        } : user
                    ));
                    
                    // Show password information for new users
                    if (data.temporaryPassword) {
                        alert(`${data.message}\n\nTemporary Password: ${data.temporaryPassword}\n\nPlease save this password and share it with the user. They should change it after first login.`);
                    } else {
                        alert(data.message || 'User created successfully!');
                    }
                } else {
                    // Update existing user in local state
                    setUsers(users.map(user => 
                        user.id === userId 
                            ? { 
                                ...user, 
                                name: editingUserData.name, 
                                email: editingUserData.email,
                                role: editingUserData.role as Role,
                                permissions: editingUserData.permissions
                            }
                            : user
                    ));
                    alert(data.message || 'User updated successfully!');
                }
                
                setEditingUserId(null);
                setEditingUserData(null);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to save user');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user');
        } finally {
            setIsSaving(false);
        }
    };

    const cancelUserEdit = () => {
        setEditingUserId(null);
        setEditingUserData(null);
        // If it was a new user that was being added, remove it
        setUsers(users.filter(user => !user.id.startsWith('new-')));
    };

    const startEditUser = (user: User) => {
        setEditingUserId(user.id);
        setEditingUserData({ 
            name: user.name, 
            email: user.email, 
            role: user.role,
            permissions: user.permissions || []
        });
    };

    return (
        <div className="space-y-6 px-12">
            {/* Admin Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage projects and user accounts</p>
                </div>
            </div>

            {/* Account Management Content */}
            <Card className="p-6 border-0 shadow-none">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-semibold">Account Management</h2>
                        <Badge variant="secondary" className="ml-2">
                            {users.length} users
                        </Badge>
                    </div>
                    <Button
                        onClick={() => addUser()}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add User
                    </Button>
                </div>
                {users.map((user) => {
                    const isEditingUser = editingUserId === user.id;
                    const isCurrentUser = user.id === userData?.id;
                    
                    return (
                        <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                            {isEditingUser ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Button
                                            onClick={() => saveUserEdit(user.id)}
                                            size="sm"
                                            variant="outline"
                                            disabled={isSaving || !editingUserData?.name || !editingUserData?.email}
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button
                                            onClick={cancelUserEdit}
                                            size="sm"
                                            variant="ghost"
                                            disabled={isSaving}
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            value={editingUserData?.name || ''}
                                            onChange={(e) => setEditingUserData(prev => 
                                                prev ? { ...prev, name: e.target.value } : { name: e.target.value, email: '', role: 'user', permissions: [] }
                                            )}
                                            placeholder="User Name"
                                        />
                                        <Input
                                            value={editingUserData?.email || ''}
                                            onChange={(e) => setEditingUserData(prev => 
                                                prev ? { ...prev, email: e.target.value } : { name: '', email: e.target.value, role: 'user', permissions: [] }
                                            )}
                                            placeholder="User Email"
                                            type="email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                        <select
                                            value={editingUserData?.role || 'user'}
                                            onChange={(e) => setEditingUserData(prev => 
                                                prev ? { ...prev, role: e.target.value } : { name: '', email: '', role: e.target.value, permissions: [] }
                                            )}
                                            className="px-3 py-2 border rounded-md text-sm w-full"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">SocMed Access Permissions</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {socmedPages.map((page) => (
                                                <label key={page.key} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingUserData?.permissions.includes(page.key) || false}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setEditingUserData(prev => {
                                                                if (!prev) return { name: '', email: '', role: 'user', permissions: [page.key] };
                                                                const newPermissions = isChecked
                                                                    ? [...prev.permissions, page.key]
                                                                    : prev.permissions.filter(p => p !== page.key);
                                                                return { ...prev, permissions: newPermissions };
                                                            });
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{page.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Multiplatform Access Permissions</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {tvPages.map((page) => (
                                                <label key={page.key} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingUserData?.permissions.includes(page.key) || false}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setEditingUserData(prev => {
                                                                if (!prev) return { name: '', email: '', role: 'user', permissions: [page.key] };
                                                                const newPermissions = isChecked
                                                                    ? [...prev.permissions, page.key]
                                                                    : prev.permissions.filter(p => p !== page.key);
                                                                return { ...prev, permissions: newPermissions };
                                                            });
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">{page.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <span className="text-blue-600 font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-lg">{user.name}</h4>
                                                {isCurrentUser && (
                                                    <Badge className="text-xs">
                                                        You
                                                    </Badge>
                                                )}
                                                {user.role === 'admin' && (
                                                    <Crown className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-2">{user.email}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <span>Role:</span>
                                                <Badge 
                                                    variant={user.role === 'superadmin' ? 'default' : user.role === 'admin' ? 'default' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {user.role}
                                                </Badge>
                                            </div>
                                            <div className="mb-2">
                                                <span className="text-sm text-gray-500">Access:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {user.permissions && user.permissions.length > 0 ? (
                                                        user.permissions.map((permission) => (
                                                            <Badge key={permission} variant="outline" className="text-xs">
                                                                {permission}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No access assigned</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Joined: {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            onClick={() => startEditUser(user)}
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        {!isCurrentUser && (
                                            <Button
                                                onClick={() => deleteUser(user.id)}
                                                size="sm"
                                                variant="destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </Card>
        </div>
    );
}
