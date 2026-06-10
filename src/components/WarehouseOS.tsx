import React, { useState } from 'react';
import { 
  Package, Search, Download, Printer, FileSpreadsheet, PlusCircle, 
  MapPin, RefreshCw, Calendar, CheckSquare, Edit, Trash2, ShieldCheck, Tag
} from 'lucide-react';

interface WarehouseOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function WarehouseOS({ dbState, onRefresh, onNotify, userRole }: WarehouseOSProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState<'All' | 'FIFO' | 'FEFO'>('All');
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any>(null);

  // Stock Adjustment details
  const [adjForm, setAdjForm] = useState({
    materialId: '',
    lotNumber: '',
    qtyAdjustment: 0,
    reason: 'Cycle Count Variances'
  });

  // Attached files state
  const [attachedFiles, setAttachedFiles] = useState<{name: string, date: string}[]>([
    { name: 'ISO_22716_WMS_TempLog.pdf', date: '2026-06-08' },
    { name: 'Cycle_Count_Q2_Audit.xlsx', date: '2026-06-05' }
  ]);
  const [newFile, setNewFile] = useState<any>(null);

  // Simulated lots (Raw materials + packaging materials lots)
  const [inventoryLots, setInventoryLots] = useState([
    { id: 'LOT-NIA-2601', materialName: 'Niacinamide (Vitamin B3)', code: 'RAW-NIA-01', lotNo: 'RM240501-A', location: 'A-01-01', expiryDate: '2026-12-31', receiveDate: '2026-01-10', stockLevel: 38, minStock: 20, unit: 'kg', cost: 450, status: 'Released' },
    { id: 'LOT-NIA-2602', materialName: 'Niacinamide (Vitamin B3)', code: 'RAW-NIA-01', lotNo: 'RM240501-B', location: 'A-01-02', expiryDate: '2027-06-30', receiveDate: '2026-02-15', stockLevel: 25, minStock: 20, unit: 'kg', cost: 450, status: 'Released' },
    { id: 'LOT-GLY-2601', materialName: 'Glycerin (Organic Pure)', code: 'RAW-GLY-01', lotNo: 'RM240602', location: 'A-02-01', expiryDate: '2026-09-15', receiveDate: '2026-03-01', stockLevel: 30, minStock: 50, unit: 'kg', cost: 120, status: 'Released' },
    { id: 'LOT-GLY-2602', materialName: 'Glycerin (Organic Pure)', code: 'RAW-GLY-01', lotNo: 'RM240603', location: 'A-02-02', expiryDate: '2028-01-01', receiveDate: '2026-05-10', stockLevel: 45, minStock: 50, unit: 'kg', cost: 120, status: 'Released' },
    { id: 'LOT-HA-01', materialName: 'Hyaluronic Acid 1%', code: 'RAW-HYA-02', lotNo: 'RM240710', location: 'B-01-01', expiryDate: '2027-02-10', receiveDate: '2026-04-10', stockLevel: 100, minStock: 80, unit: 'Liters', cost: 950, status: 'Released' },
    { id: 'LOT-HA-02', materialName: 'Hyaluronic Acid 1%', code: 'RAW-HYA-02', lotNo: 'RM240715', location: 'B-01-02', expiryDate: '2027-11-20', receiveDate: '2026-05-01', stockLevel: 10, minStock: 80, unit: 'Liters', cost: 950, status: 'Quarantine' },
    { id: 'LOT-BOT-01', materialName: 'Amethyst Luxury Glass Bottle (50ml)', code: 'PKG-BOT-10', lotNo: 'PK241101', location: 'C-01-01', expiryDate: '2029-12-31', receiveDate: '2026-05-20', stockLevel: 5200, minStock: 2000, unit: 'pcs', cost: 22, status: 'Released' },
    { id: 'LOT-CAP-01', materialName: 'Electroplated Golden Pump Cap', code: 'PKG-CAP-11', lotNo: 'PK241102', location: 'C-02-01', expiryDate: '2029-12-31', receiveDate: '2026-05-22', stockLevel: 1800, minStock: 2000, unit: 'pcs', cost: 8, status: 'Released' }
  ]);

  // FIFO/FEFO suggests engine logic
  const [fefoCheckResult, setFefoCheckResult] = useState<{materialId: string, name: string, suggestedLots: any[]} | null>(null);

  const filterLots = inventoryLots.filter(lot => {
    const matchesSearch = lot.materialName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lot.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lot.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLoc = locationFilter === 'All' ? true : lot.location.startsWith(locationFilter);
    return matchesSearch && matchesLoc;
  });

  const handleRunFEFOAllocation = (materialCode: string) => {
    // FEFO: First Expired First Out
    const matchingLots = inventoryLots.filter(l => l.code === materialCode);
    if (matchingLots.length === 0) {
      onNotify('ไม่พบรายการวัตถุดิบและล็อตในสต็อกปัจจุบัน', 'warning');
      return;
    }
    // Sort by Expiry date ascending
    const sortedLots = [...matchingLots].sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    
    setFefoCheckResult({
      materialId: materialCode,
      name: matchingLots[0].materialName,
      suggestedLots: sortedLots
    });
    onNotify(`คำนวนลำดับสิทธิ์เบิกจ่ายโมเดล FEFO สำหรับ ${matchingLots[0].materialName} เสร็จสมบูรณ์แล้ว`, 'info');
  };

  const handleStockAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot) return;
    
    setInventoryLots(prev => prev.map(lot => {
      if (lot.id === selectedLot.id) {
        const newStock = Math.max(0, lot.stockLevel + Number(adjForm.qtyAdjustment));
        return { ...lot, stockLevel: newStock };
      }
      return lot;
    }));

    onNotify(`ปรับปรุงยอดสต็อกทางบัญชี Lot: ${selectedLot.lotNo} เป็นจำนวน ${selectedLot.stockLevel + Number(adjForm.qtyAdjustment)} เรียบร้อยแล้ว`, 'info');
    setShowAdjModal(false);
    setSelectedLot(null);
  };

  const exportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Item Name,Item Code,Lot Number,Location Bin,Expiry Date,Receive Date,Stock Level,Min Stock,Unit,Cost (THB),Status\n";
    filterLots.forEach(lot => {
      csvContent += `"${lot.materialName}","${lot.code}","${lot.lotNo}","${lot.location}","${lot.expiryDate}","${lot.receiveDate}",${lot.stockLevel},${lot.minStock},"${lot.unit}",${lot.cost},"${lot.status}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IDEVA_WMS_Lots_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('ดาวน์โหลด Excel สรุปยอดคลัง (Lot-balanced CSV) เรียบร้อยแล้ว', 'info');
  };

  const printSheet = () => {
    const printContent = `
      <html>
        <head>
          <title>Warehouse Inventory & Location Sheet - IDEVA OS</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 11px; text-align: left; }
            th { background-color: #f5f5f7; }
          </style>
        </head>
        <body>
          <h1>IDEVA OS: รายการตรวจนับคลังสินค้า (Location Bin Inventory Sheet)</h1>
          <p>พิมพ์เมื่อ: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Material Details</th>
                <th>Lot Number</th>
                <th>Location Bin</th>
                <th>Receive Date</th>
                <th>Expiry Date</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filterLots.map(l => `
                <tr>
                  <td>${l.code}</td>
                  <td>${l.materialName}</td>
                  <td>${l.lotNo}</td>
                  <td>${l.location}</td>
                  <td>${l.receiveDate}</td>
                  <td>${l.expiryDate}</td>
                  <td>${l.stockLevel}</td>
                  <td>${l.unit}</td>
                  <td>${l.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="wms-module-root">
      
      {/* KPI Cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">มูลค่าเคมี & แพ็คเกจรวม</p>
            <p className="text-xl font-bold font-mono text-slate-800">
              ฿{inventoryLots.reduce((sum, l) => sum + (l.stockLevel * l.cost), 0).toLocaleString()}
            </p>
            <span className="text-[9px] text-green-500 font-bold">✓ ตรวจรับถูกต้องครบถ้วน</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Package className="h-5 w-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">จำนวน LOT ที่ควบคุมสต็อก</p>
            <p className="text-xl font-bold font-mono text-slate-800">{inventoryLots.length} ล็อต</p>
            <span className="text-[9px] text-[#FF9500] font-bold">รอตรวจแล็บ (Quarantine): {inventoryLots.filter(l=>l.status === 'Quarantine').length} ล็อต</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Calendar className="h-5 w-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">รายการสารสกัดขาด (Shortage)</p>
            <p className="text-xl font-bold font-mono text-red-600">
              {inventoryLots.filter(l => l.stockLevel < l.minStock && l.unit !== 'pcs').length} รายการ
            </p>
            <span className="text-[9px] text-red-500 font-bold">⚠️ ทริกเกอร์สร้าง PR อัตโนมัติ</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Tag className="h-5 w-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">กลุ่มโลเคชั่นจัดเก็บ</p>
            <p className="text-xl font-bold font-mono text-slate-800">Zone A, B, C</p>
            <span className="text-[9px] text-green-500 font-bold">ระบบ Location-Control ทำงานปกติ</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><MapPin className="h-5 w-5" /></div>
        </div>
      </div>

      {/* FEFO Queue Calculator Widget */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-1 text-[9px] rounded-full uppercase tracking-wider font-mono">
            FEFO Lot Selector Engine (First Expired First Out)
          </span>
          <h4 className="font-bold text-lg text-white">เครื่องคำนวนสิทธิ์สลัดคิวเบิกจ่าย FEFO</h4>
          <p className="text-slate-400 text-xs max-w-xl">
            สแกนหรือเลือกรหัสเคมีภัณฑ์เพื่อคำนวนล็อตจัดเก็บที่ใกล้สิ้นอายุ (EXP) ดึงขึ้นจ่ายระบบก่อนเป็นอันดับแรก แทนเพื่อรักษาความเสถียรวัตถุดิบและมาตรฐาน ISO 22716
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleRunFEFOAllocation('RAW-NIA-01')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
          >
            วิเคราะห์ FEFO: Niacinamide
          </button>
          <button
            type="button"
            onClick={() => handleRunFEFOAllocation('RAW-GLY-01')}
            className="px-4 py-2 bg-[#FF9500] hover:bg-[#e08400] text-slate-950 font-bold text-xs rounded-xl"
          >
            วิเคราะห์ FEFO: Glycerin
          </button>
        </div>
      </div>

      {/* FEFO results display */}
      {fefoCheckResult && (
        <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl space-y-3 animate-fade-in text-xs">
          <div className="flex justify-between items-center border-b border-indigo-150 pb-2">
            <span className="font-bold text-indigo-900 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
              ลำดับการเบิกจ่ายตาม FEFO สำหรับ: {fefoCheckResult.name} ({fefoCheckResult.materialId})
            </span>
            <button type="button" onClick={() => setFefoCheckResult(null)} className="text-indigo-600 font-bold">ปิดหน้าต่าง [X]</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {fefoCheckResult.suggestedLots.map((lot, idx) => (
              <div 
                key={lot.id} 
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  idx === 0 
                    ? 'bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-amber-400' 
                    : 'bg-white border-indigo-100 text-indigo-950'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-500">คิวสิทธิ์ลำดับ {idx + 1}</span>
                    {idx === 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">จ่ายด่วนหลัก</span>}
                  </div>
                  <p className="font-bold text-xs">Lot No: {lot.lotNo}</p>
                  <p className="font-mono text-[10px] text-slate-500">Location: Bin {lot.location}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/50 space-y-1 text-[10px]">
                  <p>วันหมดอายุ (EXP): <strong className="text-red-600">{lot.expiryDate}</strong></p>
                  <p>วันรับเข้าคลัง: {lot.receiveDate}</p>
                  <p>ยอดปัจจุบัน: <strong>{lot.stockLevel} {lot.unit}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main DataTable list */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Toolbar Header of Table */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">ตารางรายงานคงคลังแบบคุมระบุล็อค (Location & Expiry WMS DataTables)</h3>
              <p className="text-[11px] text-slate-400">ควบคุมตำแหน่งทางกายภาพชั้นวารสาร บันทึกรับเข้าเคมี ติ๊กอนุมัติจ่ายหรืออัดลบสต็อกที่คลาดเคลื่อน</p>
            </div>
          </div>

          {/* Action buttons list */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={exportExcel}
              className="p-1 px-3 bg-green-600 text-white text-[11px] font-bold rounded-lg hover:bg-green-700 flex items-center gap-1 transition-all"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
            </button>
            <button
              type="button"
              onClick={printSheet}
              className="p-1 px-3 bg-[#0071E3] text-white text-[11px] font-bold rounded-lg hover:bg-[#147ce5] flex items-center gap-1 transition-all"
            >
              <Printer className="h-3.5 w-3.5" /> Print Sheet
            </button>
          </div>
        </div>

        {/* Global search and column-level filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาวัตถุดิบ / ล็อตบรรจุ..."
              className="w-full bg-slate-50 border border-slate-200 p-2 pl-8 rounded-lg outline-none text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500 text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div>
            <select
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none text-xs text-slate-600"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="All">ทุกโซนรับคลัง (All Zones)</option>
              <option value="A">คลังเคมีสระคู A (Zone A)</option>
              <option value="B">คลังสารสกัดชีวภาพ B (Zone B)</option>
              <option value="C">คลังวัสดุขวดแก้วกล่องบรรจุ C (Zone C)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold bg-slate-50 border border-slate-200 p-1 px-2 rounded-lg">
            <span>เกณฑ์การเบิกสลัดใบ:</span>
            <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">FEFO (First Expired First Out)</span>
            <span className="text-slate-400">คัดเลือกตาม GMP แน่นหนา</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">รหัสวัตถุดิบ</th>
                <th className="p-3 min-w-[180px]">ชื่อกลุ่มอุปกรณ์หรือเคมีสกัด</th>
                <th className="p-3">รหัสล็อต (Lot No.)</th>
                <th className="p-3">ตำแหน่งเก็บ (Bin)</th>
                <th className="p-3">วันรับเข้า (Receive)</th>
                <th className="p-3">วันหมดอายุ (EXP)</th>
                <th className="p-3 text-right">ยอดคงคลั่ง</th>
                <th className="p-3 text-center">หน่วยนับ</th>
                <th className="p-3 text-center">สถานะแล็บ</th>
                <th className="p-3 text-center w-32">คำสั่งชดเชย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filterLots.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 font-semibold">ไม่พบข้อมูลตรงกับตัวกรองสต็อกค้นหา</td>
                </tr>
              ) : (
                filterLots.map((lot, idx) => {
                  const isLow = lot.stockLevel < lot.minStock;
                  return (
                    <tr key={lot.id} className={`hover:bg-slate-50/50 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}>
                      <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold select-all text-slate-900 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 inline-block my-1.5">{lot.code}</td>
                      <td className="p-3 font-bold text-slate-950">{lot.materialName}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700 select-all">{lot.lotNo}</td>
                      <td className="p-3 font-mono font-semibold text-slate-600">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-indigo-500" /> {lot.location}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{lot.receiveDate}</td>
                      <td className="p-3 font-mono">
                        <span className={`font-semibold ${new Date(lot.expiryDate).getTime() < Date.now() + (30*24*60*60*1000) ? 'text-red-500 font-bold' : 'text-slate-600'}`}>{lot.expiryDate}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        <span className={isLow ? 'text-red-600 bg-red-100/50 px-1 py-0.5 rounded' : ''}>
                          {lot.stockLevel.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-400 font-semibold">{lot.unit}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          lot.status === 'Released' ? 'bg-green-150 text-green-700' :
                          lot.status === 'Quarantine' ? 'bg-slate-100 text-slate-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {lot.status === 'Released' ? 'Stock OK' : 
                          lot.status === 'Quarantine' ? 'Quarantine' : lot.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLot(lot);
                              setAdjForm(prev => ({ ...prev, materialId: lot.code, lotNumber: lot.lotNo }));
                              setShowAdjModal(true);
                            }}
                            className="p-1 px-2.5 bg-yellow-500 text-slate-950 rounded-lg hover:border-slate-800 flex items-center gap-1 transition-all text-[10px] font-bold"
                            title="ส่องประมวลนับและปรับปรุงสต็อก (Edit Stock)"
                          >
                            <Edit className="h-3 w-3" /> แก้ไขยอด
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attach File & Audit tracker inside page footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* Simulated file attachments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-900 flex items-center gap-1">ไฟล์รายงาน WMS แนบประกบ (SOP Attached Files)</h4>
          <div className="space-y-2">
            {attachedFiles.map((file, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                <span className="font-mono text-slate-700 font-medium">{file.name}</span>
                <span className="text-[10px] text-slate-400">แนบเมื่อ: {file.date}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 flex gap-2">
            <input 
              type="file" 
              id="wms-file-upload" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const fName = e.target.files[0].name;
                  setAttachedFiles(prev => [...prev, { name: fName, date: new Date().toISOString().slice(0,10) }]);
                  onNotify(`อัพโหลดแนบไฟล์ ${fName} ทะเบียนสระเรียบร้อยแล้ว`, 'info');
                }
              }}
            />
            <label 
              htmlFor="wms-file-upload" 
              className="px-4 py-2 bg-[#0071E3] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors inline-block"
            >
              แนบไฟล์เอกสารคลังสินค้า +
            </label>
          </div>
        </div>

        {/* Audit Log on Screen */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-900">ประวัติบันทึกการทำงานคลัง (WMS Audit Log Trail)</h4>
          <div className="space-y-2 max-h-[140px] overflow-y-auto font-mono text-[9px] text-slate-500">
            <div className="border-b border-slate-100 pb-1.5">
              <span className="bg-slate-100 text-slate-800 px-1 py-0.2 rounded font-bold mr-1">PHYSICAL-CHECK</span>
              <strong>[10:15:30] สมพร คลังสินค้า</strong> ตีรายงานนับกระปุกแก้วในชั้น C-01-01 ได้ครบ 5,200 ชิ้น สมบูรณ์
            </div>
            <div className="border-b border-slate-100 pb-1.5 font-sans-code">
              <span className="bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold mr-1">FEFO-AUTO</span>
              <strong>[09:20:00] Web-Scheduler</strong> ดึงจัดระดับ FEFO จานสูบส้ม Rose Lot เกรด 2601 ให้กับแผนกชั่งสูตรรวดเร็วสองขั้นตอน
            </div>
          </div>
        </div>

      </div>

      {/* Adjust Stock Level Modal */}
      {showAdjModal && selectedLot && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-center items-center p-3 animate-fade-in" id="adj-stock-modal">
          <div className="bg-white border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">บันทึกตรวจนับ / ชดเชยยอดสต็อก</h4>
              <p className="text-[10px] text-slate-400">ควบคุมและประมวลตาม SOP-WMS-22716</p>
            </div>
            <div className="text-xs space-y-2.5">
              <p>ชื่อรายการ: <strong>{selectedLot.materialName}</strong></p>
              <p>รหัสล็อตในสต็อก: <strong className="text-indigo-600 font-mono">{selectedLot.lotNo}</strong></p>
              <p>ยอดปัจจุบันในบัญชีหลัก: <strong>{selectedLot.stockLevel} {selectedLot.unit}</strong></p>
              
              <form onSubmit={handleStockAdjSubmit} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">ระบุจำนวนปรับยอด (ชดเชยค่าบวก/ลบ)</label>
                  <input
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-mono rounded"
                    value={adjForm.qtyAdjustment}
                    onChange={(e) => setAdjForm(prev => ({ ...prev, qtyAdjustment: Number(e.target.value) }))}
                    required
                  />
                  <span className="text-[9px] text-slate-400">* ใส่ติดลบ (เช่น -5) หรือเป็นบวก (เช่น 12) ตามผลนับจริงคลัง</span>
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold block">เหตุผลการระบุรายการชดเชย</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 p-2 text-xs rounded"
                    value={adjForm.reason}
                    onChange={(e) => setAdjForm(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-xs"
                  >
                    อนุมัติปรับยอด ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAdjModal(false); setSelectedLot(null); }}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-slate-800 border py-2 rounded-lg font-bold text-xs"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
