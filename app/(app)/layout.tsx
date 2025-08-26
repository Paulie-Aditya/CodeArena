import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        <Sidebar />
        <main className="min-h-[70vh] flex-1">{children}</main>
      </div>
    </div>
  );
}
