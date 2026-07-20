"use client";

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${(order._id || "").toString().substring(0, 8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const subtotal = order.items
    ? order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : order.totalAmount || 0;
  const deliveryFee = order.deliveryFee || 0;
  const discount = order.discountAmount || 0;
  const grandTotal = subtotal + deliveryFee - discount;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        {/* Printable Section */}
        <div id="printable-invoice" className="p-8 md:p-10 space-y-6 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                🌱
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-emerald-950">FARM TO TABLE</h2>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Official B2B Invoice & Receipt</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase">
                {order.paymentStatus === "paid" || order.paymentStatus === "verified" ? "✅ OFFICIAL PAID RECEIPT" : "⏳ INVOICE - PENDING PAYMENT"}
              </span>
              <p className="text-sm font-extrabold text-gray-800">{invoiceNumber}</p>
              <p className="text-xs text-gray-500">Date: {orderDate}</p>
            </div>
          </div>

          {/* Customer & Supplier Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-xs">
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Billed To (Customer)</p>
              <p className="font-extrabold text-sm text-gray-900">{order.buyerName || "Hotel / Commercial Buyer"}</p>
              <p className="text-gray-600 font-medium">📍 Delivery: {order.buyerLocation || "Colombo, Sri Lanka"}</p>
              <p className="text-gray-600 font-medium">Payment Method: <span className="uppercase font-bold">{order.paymentMethod || "COD"}</span></p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Supplier / Platform</p>
              <p className="font-extrabold text-sm text-emerald-800">Farm To Table Sri Lanka Ltd.</p>
              <p className="text-gray-600">No. 14, Agriculture Drive, Kandy</p>
              <p className="text-gray-600">Support: support@farmtotable.lk | 011-2345678</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-emerald-600 text-gray-500 uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-2">Item Description</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-2 text-right">Unit Price (LKR)</th>
                  <th className="py-3 px-2 text-right">Total (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 px-2 font-bold text-gray-900">{item.name}</td>
                      <td className="py-3 px-2 text-center">{item.quantity}</td>
                      <td className="py-3 px-2 text-right">Rs. {(item.price || 0).toLocaleString()}</td>
                      <td className="py-3 px-2 text-right font-bold">Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 px-2 font-bold">Farm Fresh Vegetables / Bulk Produce</td>
                    <td className="py-3 px-2 text-center">1</td>
                    <td className="py-3 px-2 text-right">Rs. {subtotal.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-bold">Rs. {subtotal.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-bold">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span className="font-bold">Rs. {deliveryFee.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied:</span>
                  <span>- Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-emerald-950 pt-2 border-t-2 border-emerald-600">
                <span>Grand Total:</span>
                <span>Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer & Signature Stamp */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <div>
              <p className="font-bold text-emerald-800">Thank you for supporting Sri Lankan Local Farmers!</p>
              <p>Computer generated tax invoice. No physical signature required.</p>
            </div>
            <div className="h-16 w-16 border-2 border-dashed border-emerald-600 rounded-full flex flex-col items-center justify-center rotate-[-12deg] text-emerald-700 font-black p-1 text-[9px] text-center leading-tight">
              <span>FARM TO TABLE</span>
              <span className="text-[7px]">VERIFIED B2B</span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-200 transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
          >
            <span>🖨️ Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Global CSS for Print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
