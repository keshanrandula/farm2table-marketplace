"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [payoutsHistory, setPayoutsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.role !== "admin") {
            router.push("/login");
            return;
          }
          setAdminUser(u);
          fetchPayouts();
        } catch (e) {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  async function fetchPayouts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts");
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
        setDrivers(data.data.driverBalances);
        setPayoutsHistory(data.data.payoutsHistory);
      }
    } catch (err) {
      console.error("Error fetching payouts:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleProcessPayout = async (recipientId, recipientName, role, amount) => {
    if (!confirm(`ඔබට ${recipientName} වෙත Rs. ${amount.toLocaleString()} Payout එක තහවුරු කිරීමට අවශ්‍ය බව ස්ථිරද?`)) return;
    setProcessingId(recipientId);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId,
          recipientName,
          role,
          amount,
          notes: `${role === 'driver' ? 'Driver Delivery Fee' : 'Farmer Sales Net'} Bank Settlement`
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Payout transaction successfully recorded!");
        fetchPayouts();
      } else {
        alert(data.error || "Failed to process payout");
      }
    } catch (err) {
      alert("Error processing payout");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-8 rounded-3xl shadow-xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider">
            Finance & Commission Management
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Automated Payouts & Commission Tracker</h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Platform එකේ 5% කොමිස් මුදල වෙන්කර තබා ගොවීන්ට සහ ඩ්‍රයිවර්ලාට හිමි ශේෂයන් ගෙවීම් පාලනය කරන්න.
          </p>
        </div>

        {/* Revenue Summary Grid */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-bold uppercase">Total Platform GMV</span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Rs. {(summary.totalGrossGMV || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600 font-bold">Gross Order Volume</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-bold uppercase">Platform Net Commission (5%)</span>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                Rs. {(summary.platformCommissionEarned || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">Earned Platform Revenue</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-bold uppercase">Net Farmer Payable</span>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">
                Rs. {(summary.netFarmerPayable || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">95% Net Crop Revenue</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-1">
              <span className="text-xs text-gray-400 font-bold uppercase">Total Logistics Fees</span>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">
                Rs. {(summary.totalDeliveryFees || 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">Driver Delivery Charges</p>
            </div>
          </div>
        )}

        {/* Drivers Delivery Settlements */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
            <span>🚛 Driver Logistics Settlements</span>
            <span className="text-xs text-gray-500 font-normal">Registered Drivers: {drivers.length}</span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-gray-500 font-bold">Loading Driver Settlements...</div>
          ) : drivers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 dark:bg-gray-900 rounded-2xl">
              තවම කිසිදු ඩ්‍රයිවර් කෙනෙකුට බෙදාහැරීම් සිදුකර නොමැත. (No driver delivery records found)
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                    <th className="py-3 px-4">Driver Partner</th>
                    <th className="py-3 px-4 text-center">Completed Deliveries</th>
                    <th className="py-3 px-4">Delivery Fees Earned</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-semibold">
                  {drivers.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40">
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">🧑‍✈️ {d.name}</td>
                      <td className="py-3.5 px-4 text-center">{d.completedDeliveries} Orders</td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {(d.totalDeliveryFees || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleProcessPayout(d.id, d.name, "driver", d.totalDeliveryFees)}
                          disabled={processingId === d.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
                        >
                          {processingId === d.id ? "Processing..." : "✅ Mark Payout Paid"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payouts History Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
            📄 Recent Settlement History
          </h3>

          {payoutsHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 dark:bg-gray-900 rounded-2xl">
              තවම කිසිදු Payout Settlement එකක් සිදුකර නොමැත. (No payout transactions recorded)
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 uppercase font-bold bg-gray-50 dark:bg-gray-900/50">
                    <th className="py-3 px-4">Tx Reference</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                  {payoutsHistory.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">{p.transactionRef}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{p.recipientName}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-extrabold">{p.role}</td>
                      <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        Rs. {(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black px-2.5 py-0.5 rounded-full uppercase text-[10px]">
                          PAID & SETTLED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
