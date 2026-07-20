import DriverSidebar from "@/components/DriverSidebar";

export default function DriverLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <DriverSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
