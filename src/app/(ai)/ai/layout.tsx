export default function Layout({ children }: { children: React.ReactNode }) {
	return <main className="w-full h-[calc(100vh-4rem)]">{children}</main>;
}
