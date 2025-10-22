"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/hooks/use-user-data";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Database, Users, FolderOpen, Crown } from "lucide-react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
  isInternal: boolean;
  status?: "In Development" | "Testing";
  image?: string;
}

interface ProjectGroup {
  name: string;
  key: string;
  projects: Project[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  createdAt: Date;
}

type TabType = 'projects' | 'accounts';

export default function AdminPage() {
    // All hooks must be declared at the top, before any conditional returns
    const { userData, isLoading } = useUserData();
    const [activeTab, setActiveTab] = useState<TabType>('projects');
    const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/admin/projects');
            if (response.ok) {
                const data = await response.json();
                setProjectGroups(data.projectGroups);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsDataLoading(false);
        }
    };

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
        fetchProjects();
        fetchUsers();
    }, []);
    
    console.log("User Data:", userData);
    
    // Handle loading state
    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <h1>Loading...</h1>
            </div>
        );
    }

    // Check if user is admin (after loading is complete)
    if (userData?.role !== "admin") {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600">You must be an admin to access this page.</p>
            </div>
        );
    }

    const saveProjects = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectGroups })
            });
            
            if (response.ok) {
                alert('Projects saved successfully!');
            } else {
                alert('Failed to save projects');
            }
        } catch (error) {
            console.error('Error saving projects:', error);
            alert('Error saving projects');
        } finally {
            setIsSaving(false);
        }
    };

    const addProject = (groupIndex: number) => {
        const newProject: Project = {
            title: "New Project",
            description: "Project description",
            tags: ["Tag1"],
            href: "https://example.com",
            isInternal: true,
            image: "/file.svg"
        };

        const updatedGroups = [...projectGroups];
        updatedGroups[groupIndex].projects.push(newProject);
        setProjectGroups(updatedGroups);
        setEditingId(`${groupIndex}-${updatedGroups[groupIndex].projects.length - 1}`);
    };

    const deleteProject = (groupIndex: number, projectIndex: number) => {
        if (confirm('Are you sure you want to delete this project?')) {
            const updatedGroups = [...projectGroups];
            updatedGroups[groupIndex].projects.splice(projectIndex, 1);
            setProjectGroups(updatedGroups);
        }
    };

    const updateProject = (groupIndex: number, projectIndex: number, field: keyof Project, value: any) => {
        const updatedGroups = [...projectGroups];
        (updatedGroups[groupIndex].projects[projectIndex] as any)[field] = value;
        setProjectGroups(updatedGroups);
    };

    const updateProjectTags = (groupIndex: number, projectIndex: number, tagsString: string) => {
        const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
        updateProject(groupIndex, projectIndex, 'tags', tags);
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
                    user.id === userId ? { ...user, role: newRole } : user
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

    if (isDataLoading || isUsersLoading) {
        return (
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 px-12">
            {/* Admin Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage projects and user accounts</p>
                </div>
                {activeTab === 'projects' && (
                    <Button 
                        onClick={saveProjects} 
                        disabled={isSaving}
                        className="flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save All Changes'}
                    </Button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'projects'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <FolderOpen className="w-4 h-4" />
                        Project Management
                    </button>
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'accounts'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Account Management
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'projects' && (
                <Card className="p-6 border-0 shadow-none">
                    <div className="flex items-center gap-2 mb-6">
                        <Database className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-semibold">Projects Management</h2>
                    </div>

                    {projectGroups.map((group, groupIndex) => (
                        <div key={group.key} className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                                <Button
                                    onClick={() => addProject(groupIndex)}
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Project
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {group.projects.map((project, projectIndex) => {
                                    const isEditing = editingId === `${groupIndex}-${projectIndex}`;
                                    
                                    return (
                                        <div key={projectIndex} className="border rounded-lg p-4 bg-gray-50">
                                            {isEditing ? (
                                                // Edit Mode
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Button
                                                            onClick={() => setEditingId(null)}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => setEditingId(null)}
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    
                                                    <Input
                                                        value={project.title}
                                                        onChange={(e) => updateProject(groupIndex, projectIndex, 'title', e.target.value)}
                                                        placeholder="Project Title"
                                                    />
                                                    <Input
                                                        value={project.description}
                                                        onChange={(e) => updateProject(groupIndex, projectIndex, 'description', e.target.value)}
                                                        placeholder="Project Description"
                                                    />
                                                    <Input
                                                        value={project.tags.join(', ')}
                                                        onChange={(e) => updateProjectTags(groupIndex, projectIndex, e.target.value)}
                                                        placeholder="Tags (comma separated)"
                                                    />
                                                    <Input
                                                        value={project.href}
                                                        onChange={(e) => updateProject(groupIndex, projectIndex, 'href', e.target.value)}
                                                        placeholder="Project URL"
                                                    />
                                                    <Input
                                                        value={project.image || ''}
                                                        onChange={(e) => updateProject(groupIndex, projectIndex, 'image', e.target.value)}
                                                        placeholder="Image path"
                                                    />
                                                    <div className="flex items-center gap-4">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={project.isInternal}
                                                                onChange={(e) => updateProject(groupIndex, projectIndex, 'isInternal', e.target.checked)}
                                                            />
                                                            Internal Project
                                                        </label>
                                                        {group.key === 'ongoingProjects' && (
                                                            <select
                                                                value={project.status || ''}
                                                                onChange={(e) => updateProject(groupIndex, projectIndex, 'status', e.target.value)}
                                                                className="px-3 py-1 border rounded"
                                                            >
                                                                <option value="">No Status</option>
                                                                <option value="In Development">In Development</option>
                                                                <option value="Testing">Testing</option>
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                // View Mode
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-lg">{project.title}</h4>
                                                        <p className="text-gray-600 mb-2">{project.description}</p>
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {project.tags.map((tag, tagIndex) => (
                                                                <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="text-sm text-gray-500 space-y-1">
                                                            <div>URL: {project.href}</div>
                                                            <div>Internal: {project.isInternal ? 'Yes' : 'No'}</div>
                                                            {project.status && <div>Status: {project.status}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <Button
                                                            onClick={() => setEditingId(`${groupIndex}-${projectIndex}`)}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => deleteProject(groupIndex, projectIndex)}
                                                            size="sm"
                                                            variant="destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </Card>
            )}

            {activeTab === 'accounts' && (
                <Card className="p-6 border-0 shadow-none">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-semibold">Account Management</h2>
                        <Badge variant="secondary" className="ml-2">
                            {users.length} users
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {users.map((user) => {
                            const isEditingUser = editingUserId === user.id;
                            const isCurrentUser = user.id === userData?.id;
                            
                            return (
                                <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
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
                                                        <Badge variant="outline" className="text-xs">
                                                            You
                                                        </Badge>
                                                    )}
                                                    {user.role === 'admin' && (
                                                        <Crown className="w-4 h-4 text-yellow-500" />
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-2">{user.email}</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>Role:</span>
                                                    {isEditingUser ? (
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => {
                                                                const newRole = e.target.value;
                                                                setUsers(users.map(u => 
                                                                    u.id === user.id ? { ...u, role: newRole } : u
                                                                ));
                                                            }}
                                                            className="px-2 py-1 border rounded text-sm"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    ) : (
                                                        <Badge 
                                                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {user.role}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            {isEditingUser ? (
                                                <>
                                                    <Button
                                                        onClick={() => updateUserRole(user.id, user.role)}
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setEditingUserId(null);
                                                            fetchUsers(); // Refresh to reset any unsaved changes
                                                        }}
                                                        size="sm"
                                                        variant="ghost"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        onClick={() => setEditingUserId(user.id)}
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
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
}
