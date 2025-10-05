"use client";
import { Plus, MoreHorizontal, Star, MessageCircle } from "lucide-react";
import { useState } from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Chat {
	id: string;
	title: string;
	isFavourite: boolean;
}

// Mock chat data
const initialChats: Chat[] = [
	{ id: "1", title: "Project Planning Discussion", isFavourite: true },
	{ id: "2", title: "Code Review Feedback", isFavourite: false },
	{ id: "3", title: "Architecture Brainstorm", isFavourite: true },
	{ id: "4", title: "Bug Debugging Session", isFavourite: false },
	{ id: "5", title: "Feature Implementation", isFavourite: false },
];

export function AppSidebar() {
	const [chats, setChats] = useState<Chat[]>(initialChats);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingTitle, setEditingTitle] = useState("");

	const favouriteChats = chats.filter((chat) => chat.isFavourite);
	const regularChats = chats.filter((chat) => !chat.isFavourite);

	const addNewChat = () => {
		const newChat: Chat = {
			id: Date.now().toString(),
			title: `New Chat ${chats.length + 1}`,
			isFavourite: false,
		};
		setChats([newChat, ...chats]);
	};

	const renameChat = (id: string) => {
		if (editingTitle.trim()) {
			setChats(
				chats.map((chat) =>
					chat.id === id ? { ...chat, title: editingTitle.trim() } : chat
				)
			);
		}
		setEditingId(null);
		setEditingTitle("");
	};

	const deleteChat = (id: string) => {
		setChats(chats.filter((chat) => chat.id !== id));
	};

	const toggleFavourite = (id: string) => {
		setChats(
			chats.map((chat) =>
				chat.id === id ? { ...chat, isFavourite: !chat.isFavourite } : chat
			)
		);
	};

	const startEditing = (id: string, currentTitle: string) => {
		setEditingId(id);
		setEditingTitle(currentTitle);
	};

	const renderChatItem = (chat: Chat) => (
		<SidebarMenuItem key={chat.id}>
			{editingId === chat.id ? (
				<div className="flex w-full items-center gap-2 p-2">
					<input
						type="text"
						value={editingTitle}
						onChange={(e) => setEditingTitle(e.target.value)}
						onBlur={() => renameChat(chat.id)}
						onKeyDown={(e) => {
							if (e.key === "Enter") renameChat(chat.id);
							if (e.key === "Escape") {
								setEditingId(null);
								setEditingTitle("");
							}
						}}
						className="flex-1 bg-background border rounded px-2 py-1 text-sm"
						autoFocus
					/>
				</div>
			) : (
				<>
					<SidebarMenuButton asChild>
						<a href={`#chat-${chat.id}`}>
							{chat.isFavourite ? <Star className="fill-yellow-500 text-yellow-500" /> : <MessageCircle />}
							<span>{chat.title}</span>
						</a>
					</SidebarMenuButton>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuAction>
								<MoreHorizontal />
							</SidebarMenuAction>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="right" align="start">
							<DropdownMenuItem
								onClick={() => startEditing(chat.id, chat.title)}
							>
								<span>Rename</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => toggleFavourite(chat.id)}>
								<span>
									{chat.isFavourite
										? "Remove from Favourites"
										: "Add to Favourites"}
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => deleteChat(chat.id)}>
								<span>Delete</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			)}
		</SidebarMenuItem>
	);

	return (
		<Sidebar className="mt-16">
			<SidebarContent>
				{favouriteChats.length > 0 && (
					<SidebarGroup>
						<SidebarGroupLabel>Favourites</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>{favouriteChats.map(renderChatItem)}</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}

				<SidebarGroup>
					<SidebarGroupLabel>Chats</SidebarGroupLabel>
					<SidebarGroupAction onClick={addNewChat}>
						<Plus /> <span className="sr-only">Add New Chat</span>
					</SidebarGroupAction>
					<SidebarGroupContent>
						<SidebarMenu>{regularChats.map(renderChatItem)}</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
