"use client";

import { useState } from "react";
import ChatBot from "@/components/ai/chatbot";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Header, Starters } from "@/components/ai/empty-state";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { MarketingMessage } from "../../../api/chat/marketing/route";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// Define Bahasa Malaysia conversation starters for audience analysis
const marketingStarters = [
	"Bila waktu terbaik untuk menyiarkan iklan kepada wanita muda di Portal Berita?",
	"Apakah hari dan masa yang paling sesuai untuk mencapai audiens lelaki 25-34 tahun?",
	"Analisis traffic tertinggi untuk semua kumpulan umur di RTMKlik?",
	"Waktu puncak penggunaan RTMKlik untuk kandungan hiburan?",
];

// Define form data interface
interface MarketingFormData {
	productName: string;
	description: string;
	ageRange: string;
	gender: string;
	preferredDay: string;
	platform: string;
}

// Marketing Analysis Form Component (moved outside to prevent re-renders)
interface MarketingAnalysisFormProps {
	formData: MarketingFormData;
	onInputChange: (field: keyof MarketingFormData, value: string) => void;
}

const MarketingAnalysisForm: React.FC<MarketingAnalysisFormProps> = ({
	formData,
	onInputChange,
}) => (
	<div className="space-y-4">
		<div className="space-y-2">
			<Label htmlFor="productName">Nama Produk/Perkhidmatan <span className="text-red-500">*</span></Label>
			<Input
				id="productName"
				placeholder="Masukkan nama produk atau perkhidmatan"
				value={formData.productName}
				onChange={(e) => onInputChange("productName", e.target.value)}
			/>
		</div>

		<div className="space-y-2">
			<Label htmlFor="description">Huraian</Label>
			<Textarea
				id="description"
				placeholder="Berikan huraian ringkas tentang produk atau perkhidmatan anda"
				value={formData.description}
				onChange={(e) => onInputChange("description", e.target.value)}
				rows={3}
			/>
		</div>

		<div className="space-y-2">
			<Label htmlFor="ageRange">Julat Umur Sasaran</Label>
			<Select
				value={formData.ageRange}
				onValueChange={(value) => onInputChange("ageRange", value)}
			>
				<SelectTrigger>
					<SelectValue placeholder="Pilih julat umur" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="18-24">18-24</SelectItem>
					<SelectItem value="25-34">25-34</SelectItem>
					<SelectItem value="35-44">35-44</SelectItem>
					<SelectItem value="45-54">45-54</SelectItem>
					<SelectItem value="55+">55+</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<div className="space-y-2">
			<Label htmlFor="gender">Jantina</Label>
			<Select
				value={formData.gender}
				onValueChange={(value) => onInputChange("gender", value)}
			>
				<SelectTrigger>
					<SelectValue placeholder="Pilih jantina" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">Semua</SelectItem>
					<SelectItem value="male">Lelaki</SelectItem>
					<SelectItem value="female">Perempuan</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<div className="space-y-2">
			<Label htmlFor="preferredDay">Hari Diingini</Label>
			<Select
				value={formData.preferredDay}
				onValueChange={(value) => onInputChange("preferredDay", value)}
			>
				<SelectTrigger>
					<SelectValue placeholder="Pilih hari" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="monday">Isnin</SelectItem>
					<SelectItem value="tuesday">Selasa</SelectItem>
					<SelectItem value="wednesday">Rabu</SelectItem>
					<SelectItem value="thursday">Khamis</SelectItem>
					<SelectItem value="friday">Jumaat</SelectItem>
					<SelectItem value="saturday">Sabtu</SelectItem>
					<SelectItem value="sunday">Ahad</SelectItem>
					<SelectItem value="weekdays">Hari Bekerja (Isnin-Jumaat)</SelectItem>
					<SelectItem value="weekends">Hujung Minggu (Sabtu-Ahad)</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<div className="space-y-2">
			<Label htmlFor="platform">Platform</Label>
			<Select
				value={formData.platform}
				onValueChange={(value) => onInputChange("platform", value)}
			>
				<SelectTrigger>
					<SelectValue placeholder="Pilih platform" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="rtmklik">RTMKlik</SelectItem>
					<SelectItem value="portal-berita">Portal Berita</SelectItem>
					<SelectItem value="both">Kedua-duanya</SelectItem>
				</SelectContent>
			</Select>
		</div>
	</div>
);

export default function AIPage() {
	const [input, setInput] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState<MarketingFormData>({
		productName: "",
		description: "",
		ageRange: "",
		gender: "",
		preferredDay: "",
		platform: "",
	});
	const chatHook = useChat<MarketingMessage>({
		transport: new DefaultChatTransport({
			api: "/api/chat/marketing",
		}),
	});

	const handleSubmit = (message: PromptInputMessage) => {
		const hasText = Boolean(message.text);
		const hasAttachments = Boolean(message.files?.length);

		if (!(hasText || hasAttachments)) {
			return;
		}

		chatHook.sendMessage(
			{
				text: message.text || "Sent with attachments",
				files: message.files,
			},
			{
				body: {},
			}
		);
		setInput("");
	};

	// Form handlers
	const handleInputChange = (field: keyof MarketingFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleFormSubmit = () => {
		// Construct marketing query based on form data
		let query = `Saya ingin analisis pemasaran untuk`;

		if (formData.productName) {
			query += ` produk "${formData.productName}"`;
		} else {
			query += ` produk/perkhidmatan`;
		}

		if (formData.description) {
			query += ` (${formData.description})`;
		}

		const conditions = [];
		if (formData.ageRange) conditions.push(`umur ${formData.ageRange}`);
		if (formData.gender && formData.gender !== "all")
			conditions.push(
				`jantina ${
					formData.gender === "male"
						? "lelaki"
						: formData.gender === "female"
						? "perempuan"
						: ""
				}`
			);
		if (formData.preferredDay) {
			if (formData.preferredDay === "weekdays") {
				conditions.push("hari bekerja (Isnin-Jumaat)");
			} else if (formData.preferredDay === "weekends") {
				conditions.push("hujung minggu (Sabtu-Ahad)");
			} else {
				conditions.push(`hari ${formData.preferredDay}`);
			}
		}
		if (formData.platform) {
			if (formData.platform === "rtmklik") {
				conditions.push("platform RTMKlik");
			} else if (formData.platform === "portal-berita") {
				conditions.push("Portal Berita");
			} else if (formData.platform === "both") {
				conditions.push("kedua-duanya RTMKlik dan Portal Berita");
			}
		}

		if (conditions.length > 0) {
			query += ` untuk ${conditions.join(", ")}`;
		}

		query += ". Apakah masa yang paling sesuai dan strategi pemasaran yang disyorkan?";

		// Set the input with constructed query and send message
		setInput(query);

		// Close modal
		setShowModal(false);

		// Reset form
		setFormData({
			productName: "",
			description: "",
			ageRange: "",
			gender: "",
			preferredDay: "",
			platform: "",
		});

		// Send the message and clear input
		setTimeout(() => {
			chatHook.sendMessage(
				{
					text: query,
				},
				{
					body: {},
				}
			);
			// Clear the input after sending
			setInput("");
		}, 100);
	};

	return (
		<>
			{/* <ChatBot<ExampleMessage> this also can */}
			<ChatBot
				chatHook={chatHook}
				onSubmit={handleSubmit}
				input={input}
				onInputChange={setInput}
				sidebar={true}
				header={
					<Header
						title="Ask me anything about RTM Marketing"
						description="Get insights about social media trends and conversations"
					/>
				}
				starters={<Starters starters={marketingStarters} />}
				actionButtons={[
					{
						id: "marketing-analysis",
						label: "Marketing Analysis",
						onClick: () => setShowModal(true),
						variant: "outline" as const,
						tooltip: "Fill form for marketing analysis",
					},
					{
						id: "clear-chat",
						label: "Clear",
						onClick: () =>
							chatHook.messages.length > 0 && chatHook.setMessages([]),
						disabled: chatHook.messages.length === 0,
						variant: "destructive" as const,
						tooltip: "Clear all messages",
					},
				]}
				toolMessageComponents={
					{
						// "data-latestTopic": (message, part) => <LatestTopic message={message} part={part} />,
						// "data-cardUI": (message, part) => (
						// 	<CardUI message={message} part={part} />
						// ),
					}
				}
			/>

			{/* Marketing Analysis Modal */}
			<Dialog open={showModal} onOpenChange={setShowModal}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Analisis Pemasaran</DialogTitle>
						<DialogDescription>
							Isi borang untuk mendapatkan analisis pemasaran yang disesuaikan
							untuk produk atau perkhidmatan anda.
						</DialogDescription>
					</DialogHeader>
					<MarketingAnalysisForm
						formData={formData}
						onInputChange={handleInputChange}
					/>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowModal(false)}>
							Batal
						</Button>
						<Button
							onClick={handleFormSubmit}
							disabled={!formData.productName.trim()}
						>
							Hantar Analisis
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
