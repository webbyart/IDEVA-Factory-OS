import React, { useState } from 'react';
import { X, Check, FileText } from 'lucide-react';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  customersList?: any[];
  productsList?: any[];
}

export default function QuoteFormModal({
  isOpen,
  onClose,
  onRefresh,
  onNotify,
  customersList = [],
  productsList = []
}: QuoteFormModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [price, setPrice] = useState(150);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      onNotify('กรุณาระบุชื่อลูกค้าในใบเสนอราคา', 'warning');
      return;
    }
    if (!productName.trim()) {
      onNotify('กรุณาระบุกลุ่มสินค้าขวดน้ำหอมที่ต้องการ', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Perform INSERT into Supabase 'quotes' table via the generic API endpoint
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'quotes',
          item: {
            customerName: customerName.trim(),
            productName: productName.trim(),
            quantity: Number(quantity),
            price: Number(price),
            notes: notes.trim(),
            createdAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onNotify(`[SUCCESS] บันทึกและออกใบเสนอราคารหัส ${data.item.id} สำเร็จ! เซฟลงฐานข้อมูลหลักเรียบร้อย`, 'success');
        onRefresh();
        onClose();
        // Reset states
        setCustomerName('');
        setProductName('');
        setQuantity(1000);
        setPrice(150);
        setNotes('');
      } else {
        onNotify(data.error || 'ไม่สามารถบันทึกใบเสนอราคาลงฐานข้อมูลได้', 'error');
      }
    } catch {
      onNotify('ไม่สามารถเชื่อมต่อกับฐานข้อมูลหลักสากลได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        
        {/* Header bar */}
        <div className="bg-[#0B3C5D] text-white p-5 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-300 animate-pulse" />
            <h3 className="font-extrabold text-sm tracking-wide">สร้างและบันทึกใบเสนอราคา (Create Supabase Quote)</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
          
          {/* Customer Selection or Input */}
          <div className="space-y-1.5 animate-slide-in">
            <label className="block text-xs font-black text-slate-700">ชื่อผู้ติดต่อ / แบรนด์ลูกค้า <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ระบุชื่อลูกค้าสากล..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex-1 p-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                required
              />
              {customersList.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) setCustomerName(e.target.value);
                  }}
                  className="p-2.5 border border-slate-200 bg-white rounded-xl text-xs font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">เลือกด่วน...</option>
                  {customersList.map((c: any) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Product Selection or Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700">เลือกชนิดสินค้า / น้ำหอมพรีเมียม <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ระบุรุ่นสินค้า หรือ SKU ฝ่ายวิจัย..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="flex-1 p-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                required
              />
              {productsList.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) setProductName(e.target.value);
                  }}
                  className="p-2.5 border border-slate-200 bg-white rounded-xl text-xs font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">เลือกด่วน...</option>
                  {productsList.map((p: any) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Quantity and Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">จำนวนสั่งซื้อ (ชิ้น/Pcs)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 px-4 text-xs font-mono font-bold rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">ราคาเสนอต่อชิ้น (฿/Unit)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 px-4 text-xs font-mono font-bold rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Total Value Auto Calculation Badge */}
          <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-2xl flex justify-between items-center text-xs">
            <span className="font-bold text-indigo-900">รวมราคาเสนอขายโดยประมาณ:</span>
            <span className="font-mono font-black text-indigo-750 text-sm">
              ฿{(quantity * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700">บันทึกเพิ่มเติม / ข้อตกลงใบเสนอราคา</label>
            <textarea
              rows={3}
              placeholder="เช่น เงื่อนไขการชำระเงินระยะเวลาการส่งมอบ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submits and controls */}
          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันและส่งเข้า Supabase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
