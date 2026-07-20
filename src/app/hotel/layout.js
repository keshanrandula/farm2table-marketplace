import HotelSidebar from "@/components/HotelSidebar";

export default function HotelLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <HotelSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
