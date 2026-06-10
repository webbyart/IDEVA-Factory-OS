import React, { useState } from 'react';
import { 
  Plus, ArrowDownLeft, ArrowUpRight, Clipboard, Calendar, AlertTriangle, 
  Trash2, ShieldCheck, CheckCheck, Inbox, Search, Clock, RotateCcw,
  FileText, Upload, Check, X, Sparkles, Filter, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';

interface ChemicalStockOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function ChemicalStockOS({ dbState, onRefresh, onNotify, userRole }: ChemicalStockOSProps) {
  // Navigation & filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Raw Material' | 'Packaging'>('All');
  const [stockSafetyFilter, setStockSafetyFilter] = useState<'All' | 'Safety Low'>('All');
  
  // Custom Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Tabs inside ChemicalStockOS
  const [activeStockSubTab, setActiveStockSubTab] = useState<'inventory' | 'coa_hub'>('inventory');

  // Forms states
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  
  // COA Viewer Modal State
  const [selectedLotForCOA, setSelectedLotForCOA] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Edit variables inside COA
  const [editPurity, setEditPurity] = useState('');
  const [editTester, setEditTester] = useState('');
  const [editRefrac, setEditRefrac] = useState('');
  const [editMoisture, setEditMoisture] = useState('');

  // Receive Stock state
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [lotNumber, setLotNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [scalingDb, setScalingDb] = useState(false);

  // Filter materials that are chemicals / raw materials
  const unfilteredMaterials = dbState.materials || [];
  
  // Apply Search, Category and Safety Low filters
  const materials = unfilteredMaterials.filter((m: any) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' ? true : m.category === categoryFilter;
    const matchesSafety = stockSafetyFilter === 'All' ? true : m.stockLevel < m.minStock;
    return matchesSearch && matchesCategory && matchesSafety;
  });

  // Pagination Slice
  const totalItems = materials.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedMaterials = materials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper inside search to reset page
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: 'All' | 'Raw Material' | 'Packaging') => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const handleSafetyChange = (val: 'All' | 'Safety Low') => {
    setStockSafetyFilter(val);
    setCurrentPage(1);
  };

  // Calculate stats
  const totalStockItems = unfilteredMaterials.length;
  const lowStockItems = unfilteredMaterials.filter((m: any) => m.stockLevel < m.minStock).length;
  const goodsReceipts = dbState.goodsReceipts || [];
  const totalReceipts = goodsReceipts.length;

  // COA Count helpers
  const verifiedCOAs = goodsReceipts.filter((gr: any) => gr.coaDocument?.status === 'Verified').length;
  const outstandingCOAs = goodsReceipts.length - verifiedCOAs;

  // Trigger Database Inflation to Industrial Scale (250+ materials, 120 formulas)
  const handleScaleDatabase = async () => {
    setScalingDb(true);
    try {
      const res = await fetch('/api/state/scale-industrial', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onNotify("🔌 นำเข้าระบบฐานข้อมูลเครื่องจักรกลั่นอุตสาหกรรม (250 Raw Substances, 120 Formulas & COAs) สำเร็จ!", "info");
        onRefresh();
      } else {
        onNotify("เกิดข้อผิดพลาดในการสเกลระบบ", "error");
      }
    } catch {
      onNotify("เชื่อมต่อเซิร์ฟเวอร์เพื่อสเกลสารสูตรไม่สำเร็จ", "error");
    } finally {
      setScalingDb(false);
    }
  };

  // Handle Receiving Raw Materials (รับเข้า)
  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || quantity <= 0 || !lotNumber || !expiryDate) {
      onNotify("กรุณากรอกข้อมูลการรับเข้าสารเคมีให้ครบถ้วนและถูกต้อง", "warning");
      return;
    }

    const material = unfilteredMaterials.find((m: any) => m.id === selectedMaterialId);
    if (!material) return;

    setLoading(true);
    try {
      // Create goods receipt structure with prefilled coaDocument placeholders
      const lotPurity = (98.5 + Math.random() * 1.4).toFixed(2);
      const lotRefractive = (1.450 + Math.random() * 0.03).toFixed(4);
      const lotMoisture = (0.005 + Math.random() * 0.015).toFixed(3);

      const newGR = {
        id: `grn-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
        poId: 'Direct-Procure',
        supplierId: 'supp-1', // Default premium Grass supplier
        materialId: selectedMaterialId,
        quantityReceived: Number(quantity),
        lotNumber,
        expiryDate,
        status: 'QC Approved', 
        createdAt: new Date().toISOString().split('T')[0],
        coaDocument: {
          fileName: `COA-${lotNumber}-${material.code}.pdf`,
          fileSize: '142 KB',
          uploadedAt: `${new Date().toISOString().replace('T',' ').substring(0,19)}`,
          purityPercentage: Number(lotPurity),
          testedDate: new Date().toISOString().split('T')[0],
          certifiedBy: 'Chief QC Lab Auditor',
          status: 'Pending Verification', // Needs manual approve click
          parameters: [
            { name: `องค์ประกอบสารสกัดสำคัญ (${material.name.split(' ')[0]})`, value: `${lotPurity}%`, expected: '>= 98.00%', passed: true },
            { name: 'ปริมาณมวลน้ำเจือปนสัมบูรณ์ (Moisture)', value: `${lotMoisture}%`, expected: '<= 0.030%', passed: true },
            { name: 'สเปกตรัมดัชนีหักเหของไอระเหย (Refractive Index)', value: `${lotRefractive}`, expected: '1.440 - 1.485', passed: true },
            { name: 'สแกนโลหะหนักรวม ICP-MS (Heavy Metals)', value: '< 1.0 ppm', expected: '<= 2.0 ppm', passed: true }
          ]
        }
      };

      const grResponse = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'goodsReceipts', item: newGR })
      });

      // Update material stock Level
      const updatedMaterial = {
        ...material,
        stockLevel: material.stockLevel + Number(quantity)
      };

      const matResponse = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'materials', item: updatedMaterial })
      });

      const resGR = await grResponse.json();
      const resMat = await matResponse.json();

      if (resGR.success && resMat.success) {
        onNotify(`ทำรายการรับเข้าสารหอม ${material.name} จำนวน ${quantity} ${material.unit} พร้อมเตรียมประวัติและเอกสาร COA รอตรวจคุณลักษณะสำเร็จ!`, "info");
        setShowReceiveModal(false);
        // Reset states
        setSelectedMaterialId('');
        setQuantity(0);
        setLotNumber('');
        setExpiryDate('');
        setNotes('');
        onRefresh();
      } else {
        onNotify("เกิดปัญหาในการปรับปรุงคลังสินค้าต้นน้ำ", "error");
      }
    } catch {
      onNotify("เชื่อมต่อเซิร์ฟเวอร์คลังสารเหลวไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Issuing / Deducting Stock (เบิกจ่าย)
  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId || quantity <= 0) {
      onNotify("กรุณาระบุสารดิบและปริมาณการเบิกจ่ายให้ถูกต้อง", "warning");
      return;
    }

    const material = unfilteredMaterials.find((m: any) => m.id === selectedMaterialId);
    if (!material) return;

    if (material.stockLevel < quantity) {
      onNotify(`ยอดคงคลังวัสดุไม่เพียงพอ! ปัจจุบันคงเหลือเพียง ${material.stockLevel} ${material.unit}`, "error");
      return;
    }

    setLoading(true);
    try {
      const updatedMaterial = {
        ...material,
        stockLevel: Math.max(0, Number((material.stockLevel - quantity).toFixed(2)))
      };

      const matResponse = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'materials', item: updatedMaterial })
      });

      const resMat = await matResponse.json();

      if (resMat.success) {
        onNotify(`ทำเบิกจ่ายส่วนผสมน้ำหอม ${material.name} จำนวน ${quantity} ${material.unit} ออกไปปรุงบ่มสำเร็จ!`, "info");
        setShowIssueModal(false);
        setSelectedMaterialId('');
        setQuantity(0);
        onRefresh();
      } else {
        onNotify("เกิดความผิดพลาดระหว่างปรับลดยอดสต็อกสารเคมี", "error");
      }
    } catch {
      onNotify("ไม่สามารถซิงค์การเบิกจ่ายกับเซิร์ฟเวอร์หลัก", "error");
    } finally {
      setLoading(false);
    }
  };

  // Check if ingredient lot is expired
  const isExpired = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    return expiry < today;
  };

  // Check if ingredient is nearing expiration (within 6 months)
  const isNearingExpiry = (dateStr: string) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 180;
  };

  // Open COA details dialog
  const handleOpenCOA = (lot: any) => {
    setSelectedLotForCOA(lot);
    // Prefill edit values
    setEditPurity(lot.coaDocument?.purityPercentage?.toString() || '99.5');
    setEditTester(lot.coaDocument?.certifiedBy || 'Chief Lab Inspector');
    setEditRefrac(lot.coaDocument?.parameters?.find((p: any) => p.name.includes('Refractive'))?.value || '1.4650');
    setEditMoisture(lot.coaDocument?.parameters?.find((p: any) => p.name.includes('Moisture'))?.value || '0.01%');
  };

  // Verify and Approve COA Status
  const handleVerifyCOA = async (status: 'Verified' | 'Rejected') => {
    if (!selectedLotForCOA) return;
    setLoading(true);

    try {
      const updatedLot = {
        ...selectedLotForCOA,
        coaDocument: {
          ...selectedLotForCOA.coaDocument,
          purityPercentage: Number(editPurity),
          certifiedBy: editTester,
          status,
          uploadedAt: new Date().toISOString().replace('T',' ').substring(0,19),
          parameters: [
            { name: `องค์ประกอบความบริสุทธิ์ของสารหอม`, value: `${editPurity}%`, expected: '>= 98.00%', passed: Number(editPurity) >= 98.0 },
            { name: 'ปริมาณความชื้นและสารเจือเจือสัมบูรณ์ (Moisture)', value: editMoisture.endsWith('%') ? editMoisture : `${editMoisture}%`, expected: '<= 0.030%', passed: true },
            { name: 'สเปกตรัมดัชนีหักเหของไอระเหย (Refractive Index)', value: editRefrac, expected: '1.440 - 1.485', passed: true },
            { name: 'สแกนโลหะหนักละออง ICP-MS (Heavy Metals)', value: '< 1.0 ppm', expected: '<= 2.0 ppm', passed: true }
          ]
        }
      };

      const res = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'goodsReceipts', item: updatedLot })
      });

      const data = await res.json();
      if (data.success) {
        onNotify(`อนุมัติและอัปเดตผลตรวจรับรองเอกสาร COA ของล็อต ${selectedLotForCOA.lotNumber} เป็น [${status}] สำเร็จ!`, "info");
        setSelectedLotForCOA(null);
        onRefresh();
      } else {
        onNotify("ปรับเปลี่ยนข้อมูล COA ตกลงล้มเหลว", "error");
      }
    } catch {
      onNotify("ปฏิเสธการเชื่อมต่อเซิร์ฟเวอร์ควบคุมคุณภาพ", "error");
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop simulator for COA file upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      simulateCOAUpload(files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateCOAUpload(files[0].name);
    }
  };

  const simulateCOAUpload = (fileName: string) => {
    setUploadProgress(10);
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setUploadProgress(null);
            // Simulate AI extraction values
            const randomPurity = (99.1 + Math.random() * 0.7).toFixed(2);
            setEditPurity(randomPurity);
            setEditTester("AI OCR Extraction - " + userRole);
            setEditRefrac("1.4" + Math.floor(600 + Math.random() * 120));
            setEditMoisture("0.0" + Math.floor(10 + Math.random() * 20) + "%");
            onNotify(`AI อ่านเอกสาร ${fileName} และสแกนพบความบริสุทธิ์ ${randomPurity}% พร้อมข้อมูลเคมี GC-MS สมบูรณ์! กรุณาตรวจสอบแล้วกด อนุมัติ`, "info");
          }, 600);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="chemical-stock-os-view">
      {/* 1. SCALE DATABASE CALL TO ACTION CARD (If DB is in startup scale) */}
      {totalStockItems < 50 && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-9 border border-indigo-950 p-6 rounded-3xl text-white shadow-lg space-y-4 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-15 select-none pointer-events-none transform translate-y-4">
            <Sparkles className="h-64 w-64 text-indigo-400 rotate-12" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  🔬 ERP Industrial Scaling Ready
                </span>
                <span className="text-[10px] text-indigo-200">| v1.0.4 stable</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">เปิดโหมดทดสอบกระบวนการผลิต "สูตรและสารหอมเคมีระดับล้านรายการ"</h3>
              <p className="text-xs text-indigo-200 leading-relaxed">
                ตามความต้องการของคุณระบบรองรับ สูตรผสมน้ำหอม (BOM Formula) และ สารประกอบ/วัตถุดิบเคมีหอม (Chemical Substances) จำนวนมาก 
                ท่านสามารถกดสเกลขยายระบบเป็น <span className="underline font-bold text-white">วัตถุดิบ 250 รายการ และสูตรปรุงผสม 120 ชุดอพาร์ตเมนต์</span> พร้อมฟีดจำลองใบวิเคราะห์คุณภาพ COA สารพอร์ตรานัธยมได้ทันที
              </p>
            </div>
            
            <button
              onClick={handleScaleDatabase}
              disabled={scalingDb}
              className="bg-white hover:bg-neutral-100 text-indigo-950 font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-md transition-all shrink-0 flex items-center gap-2 duration-150 active:scale-95"
            >
              {scalingDb ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin text-indigo-900" />
                  กำลังขยายฐานวัตถุดิบ...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-indigo-700" />
                  🔌 กดสเกลสสาร 250+ และสูตร 100+
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 2. HEADER BLOCK WITH SUB-TABS */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                <Clipboard className="h-5 w-5" />
              </span>
              <h2 className="font-bold text-lg text-[#1D1D1F] tracking-tight">Chemical Stock OS & Quality Directory</h2>
            </div>
            <p className="text-xs text-[#86868B]">
              คลังคุมสต็อกสารสกัดระดับโมเลกุลน้ำหอม และ ทะเบียนเก็บประวัติใบวิเคราะห์คุณภาพ Certificate of Analysis (COA) รายล็อตนำเข้า
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setShowReceiveModal(true);
                setShowIssueModal(false);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <ArrowDownLeft className="h-4 w-4" /> รับเข้าคลังเคมีล็อตใหม่ + COA
            </button>
            <button
              onClick={() => {
                setShowIssueModal(true);
                setShowReceiveModal(false);
              }}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <ArrowUpRight className="h-4 w-4" /> เบิกจ่ายปรุงสูตร
            </button>
          </div>
        </div>

        {/* SUBTAB TOGGLE (Cupertino tab selector) */}
        <div className="flex justify-between items-center pt-2 border-t border-[#F5F5F7]">
          <div className="flex bg-[#E8E8ED]/80 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveStockSubTab('inventory')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeStockSubTab === 'inventory' ? 'bg-white text-indigo-950 shadow-xs' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            >
              <Inbox className="h-3.5 w-3.5" />
              สรุปคลังเคมีภัณฑ์ดิบ ({totalStockItems})
            </button>
            <button
              onClick={() => setActiveStockSubTab('coa_hub')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeStockSubTab === 'coa_hub' ? 'bg-white text-indigo-950 shadow-xs' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
            >
              <FileText className="h-3.5 w-3.5" />
              ศูนย์รวมเอกสาร COA ({verifiedCOAs}/{totalReceipts})
              {outstandingCOAs > 0 && (
                <span className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-full text-[9px]">
                  ขาด {outstandingCOAs}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="text-[#86868B]">สถานะคลัง:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> คลังได้เกรดมาตรฐาน Cosmetics GMP (ISO 22716)
            </span>
          </div>
        </div>
      </div>

      {/* 3. MODAL / FORM RECEIVE (เมื่อกด รับเข้า) */}
      {showReceiveModal && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-150 shadow-xl space-y-5 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-sky-500"></div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">
                  ลงบันทึกรับสต็อกสารหอมนำเข้า
                </h3>
                <p className="text-[11px] text-[#86868B]">จัดเตรียมประวัติชันสูตร Certificate of Analysis (COA) ประจำเลของค์ประกอบ</p>
              </div>
            </div>
            <button 
              onClick={() => setShowReceiveModal(false)} 
              className="text-[#86868B] hover:text-[#1D1D1F] p-1.5 hover:bg-[#F5F5F7] rounded-lg transition-colors text-xs font-semibold"
            >
              ยกเลิก ✕
            </button>
          </div>

          <form onSubmit={handleReceiveStock} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              
              {/* Material Dropdown Selection */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 block">โปรดเลือกสารเคมี / ขวดบรรจุห่อ <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-sans"
                    required
                  >
                    <option value="">-- กรุณาเลือกเคมี/วัสดุรับเข้าตาราง --</option>
                    {unfilteredMaterials.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        [{m.code}] {m.name} ({m.stockLevel.toLocaleString()} {m.unit} คงรักษาอยู่)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">จำนวนสุทธิรับเข้า <span className="text-rose-500">*</span></label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="0.0"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-mono font-bold"
                    required
                  />
                  <span className="absolute right-3 font-semibold text-slate-400 font-sans">
                    {selectedMaterialId ? unfilteredMaterials.find((m: any) => m.id === selectedMaterialId)?.unit : 'หน่วย'}
                  </span>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">วันหมดอายุ / เสื่อมกลิ่นหอม <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-mono font-semibold"
                  required
                />
                
                {/* Expiry presets */}
                <div className="flex gap-1.5 mt-1 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 6);
                      setExpiryDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold"
                  >
                    +6 เดือน
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setExpiryDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold"
                  >
                    +1 ปี
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 2);
                      setExpiryDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold"
                  >
                    +2 ปี
                  </button>
                </div>
              </div>

              {/* Lot Number with auto generator */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 block">เลขอัญประกาศควบคุมล็อต (Lot Number) <span className="text-rose-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => {
                      const randCode = 'LOT-' + Date.now().toString().slice(-4) + '-' + Math.floor(100 + Math.random() * 900);
                      setLotNumber(randCode);
                    }}
                    className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100"
                  >
                    🪄 สุ่มรหัสล็อตด่วน
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="เช่น LOT-COA-MYS-77B"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all font-mono font-bold uppercase"
                  required
                />
              </div>

              {/* Notes / Sub-Storage direction */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 block">ข้อความกำกับเพิ่มเติมประจำล็อตและการจัดเก็บ</label>
                <input
                  type="text"
                  placeholder="ระบุพาร์ทแช่ตู้เย็น ตู้นิรภัย 04, หรือคลังย่อยที่ประเมิน..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>

            </div>

            {/* Quick Summary Preview in Form */}
            {selectedMaterialId && quantity > 0 && (
              <div className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 flex items-center justify-between text-[11px] text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-bold">✓ สรุปยอด</span>
                  <span>เตรียมโอนสต็อกสสารหอมของคลัง <strong>{unfilteredMaterials.find((m: any) => m.id === selectedMaterialId)?.name}</strong> เข้าสู่ระบบออดิตล่วงหน้า</span>
                </div>
                <span className="font-mono font-extrabold text-indigo-700 text-xs text-right">
                  +{quantity} {unfilteredMaterials.find((m: any) => m.id === selectedMaterialId)?.unit}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] font-bold rounded-xl transition-colors cursor-pointer"
              >
                ละทิ้งฟอร์ม
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-95 transition-all text-xs cursor-pointer"
              >
                {loading ? 'กำลังดำเนินบันทึก...' : 'ยื่นควบคุมรับเข้าและเพิ่มสต็อกสาร ✓'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. MODAL / FORM ISSUE (เมื่อกด เบิกจ่าย) */}
      {showIssueModal && (
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xl space-y-5 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">
                  ทำรายการเบิกจ่ายมวลสารอโรมาติก
                </h3>
                <p className="text-[11px] text-[#86868B]">ส่งสารหอมประจำสูตรเข้าหม้อต้ม ปรุงผสมกลั่นบ่มน้ำหอมตามใบสั่งประกอบ</p>
              </div>
            </div>
            <button 
              onClick={() => setShowIssueModal(false)} 
              className="text-[#86868B] hover:text-[#1D1D1F] p-1.5 hover:bg-[#F5F5F7] rounded-lg transition-colors text-xs font-semibold"
            >
              ยกเลิก ✕
            </button>
          </div>

          <form onSubmit={handleIssueStock} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Material Dropdown */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 block">เลือกอะโรมาติก/สารผสมที่ขอเบิก <span className="text-rose-500">*</span></label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => {
                    setSelectedMaterialId(e.target.value);
                    setQuantity(0); // Reset quantity upon selection
                  }}
                  className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 transition-all font-sans"
                  required
                >
                  <option value="">-- กรุณาเลือกรายการสสารที่คงคลังอยู่ --</option>
                  {unfilteredMaterials.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {m.name} (คงสต็อกอยู่: {m.stockLevel.toLocaleString()} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block font-sans">ระบุปริมาณน้ำหนัก/ปริมาตรเบิก <span className="text-rose-500">*</span></label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    placeholder="0.000"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-100 transition-all font-mono font-bold"
                    required
                  />
                  <span className="absolute right-3 font-semibold text-slate-400 font-sans">
                    {selectedMaterialId ? unfilteredMaterials.find((m: any) => m.id === selectedMaterialId)?.unit : 'หน่วย'}
                  </span>
                </div>

                {/* Quick Presets for Selection */}
                {selectedMaterialId && (
                  <div className="flex gap-1.5 mt-1 select-none">
                    <button
                      type="button"
                      onClick={() => {
                        const mat = unfilteredMaterials.find((m: any) => m.id === selectedMaterialId);
                        if(mat) setQuantity(Number((mat.stockLevel * 0.1).toFixed(3)));
                      }}
                      className="text-[9px] bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold"
                    >
                      10% สต็อก
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const mat = unfilteredMaterials.find((m: any) => m.id === selectedMaterialId);
                        if(mat) setQuantity(Number((mat.stockLevel * 0.5).toFixed(3)));
                      }}
                      className="text-[9px] bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold"
                    >
                      ครึ่งคลัง (50%)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const mat = unfilteredMaterials.find((m: any) => m.id === selectedMaterialId);
                        if(mat) setQuantity(Number(mat.stockLevel.toFixed(3)));
                      }}
                      className="text-[9px] bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold"
                    >
                      หมดคลัง (100%)
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Validation helper display inside form */}
            {selectedMaterialId && (
              (() => {
                const mat = unfilteredMaterials.find((m: any) => m.id === selectedMaterialId);
                const remaining = mat ? (mat.stockLevel - quantity) : 0;
                const isOverLimit = remaining < 0;

                return (
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-[11px] font-sans ${isOverLimit ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50/40 border-amber-100 text-slate-700'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`p-1 px-2 text-white rounded-lg font-bold font-mono text-[9px] uppercase ${isOverLimit ? 'bg-rose-600' : 'bg-amber-500'}`}>
                        {isOverLimit ? 'สต็อกติดลบ' : 'ประมาณคลังใหม่'}
                      </span>
                      <span>
                        ยอดคงสต็อกหลังหักเบิกจ่ายบ่มของ <strong>{mat?.name}</strong>: 
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-xs">
                      {isOverLimit ? 'ไม่เพียงพอขาดแคลน!' : `${remaining.toLocaleString()} ${mat?.unit}`}
                    </span>
                  </div>
                );
              })()
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] font-bold rounded-xl transition-colors cursor-pointer"
              >
                ละทิ้งแบบฟอร์ม
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                {loading ? 'กำลังหักยอด...' : 'ยืนยันและดำเนินการสัดส่วนเบิกสสาร ✓'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB SUB-VIEWS */}
      {activeStockSubTab === 'inventory' ? (
        <>
          {/* INVENTORY SEARCH, FILTER & TABLE MAIN VIEW */}
          <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#E5E5EA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex bg-[#E8E8ED] p-1 rounded-xl text-xs font-semibold select-none">
                <button
                  onClick={() => handleCategoryChange('All')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'All' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
                >
                  ทั้งหมด ({unfilteredMaterials.length})
                </button>
                <button
                  onClick={() => handleCategoryChange('Raw Material')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'Raw Material' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
                >
                  สารหอม/หัวน้ำมัน ({unfilteredMaterials.filter((m: any) => m.category === 'Raw Material').length})
                </button>
                <button
                  onClick={() => handleCategoryChange('Packaging')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'Packaging' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
                >
                  บรรจุภัณฑ์หรู ({unfilteredMaterials.filter((m: any) => m.category === 'Packaging').length})
                </button>
              </div>

              {/* Advanced search controls */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => handleSafetyChange(stockSafetyFilter === 'All' ? 'Safety Low' : 'All')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 select-none ${stockSafetyFilter === 'Safety Low' ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-white text-[#1D1D1F] border-[#E5E5EA] hover:bg-neutral-50'}`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {stockSafetyFilter === 'Safety Low' ? 'แสดงเฉพาะยอดวิกฤต' : 'ตัวกรอง Safety Low'}
                </button>

                <div className="relative w-full sm:w-56 text-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#86868B]" />
                  <input
                    type="text"
                    placeholder="ค้นสารสกัด เคมีหอม รหัส..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl pl-9 pr-4 py-2.5 outline-none focus:bg-white focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-[#E5E5EA] uppercase tracking-wider text-[10px]">
                    <th className="p-4 pl-6">รหัสอ้างอิงเคมี</th>
                    <th className="p-4">ชื่อสารละลาย / สารสกัดหอมและส่วนประกอบคลัง</th>
                    <th className="p-4">ประเภทโครงสร้าง</th>
                    <th className="p-4 text-right">เกณฑ์ขั้นต่ำ (Min Safety)</th>
                    <th className="p-4 text-right">จำนวนพร้อมปรุงผสม</th>
                    <th className="p-4 text-center">หน่วย</th>
                    <th className="p-4 text-center">เสถียรภาพสสารสินค้า</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
                  {paginatedMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-[#86868B]">
                        ไม่พบรายการเคมีดิบหรือสารปรุงน้ำหอมตามเกณฑ์คำค้น
                      </td>
                    </tr>
                  ) : (
                    paginatedMaterials.map((m: any) => {
                      const isLow = m.stockLevel < m.minStock;
                      return (
                        <tr key={m.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                          <td className="p-4 pl-6 font-mono font-bold text-slate-800 select-all tracking-tight">
                            {m.code}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-900 text-sm">{m.name}</div>
                            <div className="text-[10px] text-[#86868B] font-mono mt-0.5">ERP Entity Reference: {m.id}</div>
                          </td>
                          <td className="p-4">
                            {m.category === 'Raw Material' ? (
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                🧪 สารอะโรมาติกเดี่ยว
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-[#1D1D1F] border border-[#E5E5EA] px-2.5 py-1 rounded-full text-[10px] font-bold">
                                📦 บรรจุภัณฑ์ต้นแบบ
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right font-mono text-[#86868B] font-semibold">
                            {m.minStock.toLocaleString()}
                          </td>
                          <td className="p-4 text-right font-mono font-bold">
                            <span className={isLow ? 'text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200' : 'text-slate-900'}>
                              {m.stockLevel.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4 text-center text-[#86868B] font-bold">
                            {m.unit}
                          </td>
                          <td className="p-4 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                <AlertTriangle className="h-3 w-3" />Safety Low
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                <ShieldCheck className="h-3 w-3" /> คลังสมบูรณ์
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI Controls */}
            <div className="p-4 border-t border-[#E5E5EA] flex justify-between items-center text-xs text-[#86868B]">
              <div>
                แสดงรายการที่ <b>{(currentPage - 1) * itemsPerPage + 1}</b> ถึง <b>{Math.min(currentPage * itemsPerPage, totalItems)}</b> จากทั้งหมด <b>{totalItems}</b> ชนิด
              </div>
              <div className="flex items-center gap-2 select-none">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-slate-800">หน้า {currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expiry Tracking Sub-Module (ติดตามวันหมดอายุสารเคมีคลังย่อย) */}
          <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-rose-600" />
                ติดตามการหมดหอมเสื่อมสลายของล็อตวัสดุตะเลียบสาร (Shelf-Life & Critical Expiry Watch)
              </h3>
              <p className="text-xs text-[#86868B]">
                เฝ้าระวังกลุ่มล็อตเคมีน้ำหอมที่ใกล้ถึงกำหนดเสื่อมคุณภาพ และยังช่วยเตือนให้นำหน้าล็อตนี้ไปใช้สกัดปรุงสูตรก่อนเพื่อลดขยะเหลว
              </p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-[#E5E5EA] uppercase tracking-wider text-[10px]">
                    <th className="p-3 pl-5">เลขอัญประกาศควบคุม</th>
                    <th className="p-3">ชื่อสารที่บรรจุ</th>
                    <th className="p-3 font-mono">Lot Number</th>
                    <th className="p-3 text-right">จำนวนล็อตที่นำเข้า</th>
                    <th className="p-3">วันที่ควรใช้ให้หมดก่อน (Expiry Date)</th>
                    <th className="p-3 text-center">เอกสารตรวจวิเคราะห์ COA</th>
                    <th className="p-3 text-center border-l border-[#E5E5EA]">ดัชนีคุมเสถียรสาร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
                  {goodsReceipts.slice(0, 10).map((gr: any) => {
                    const material = unfilteredMaterials.find((m: any) => m.id === gr.materialId) || { name: gr.materialId, unit: 'Units' };
                    const bExpired = isExpired(gr.expiryDate);
                    const bNearing = isNearingExpiry(gr.expiryDate);
                    const hasCOA = !!gr.coaDocument;

                    return (
                      <tr key={gr.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                        <td className="p-3 pl-5 font-mono font-bold text-slate-800">{gr.id}</td>
                        <td className="p-3 font-semibold text-slate-700">{material.name}</td>
                        <td className="p-3 font-mono text-[#515154] select-all">{gr.lotNumber}</td>
                        <td className="p-3 text-right font-mono font-semibold">{gr.quantityReceived} {material.unit}</td>
                        <td className="p-3 font-mono text-[#86868B] font-extrabold">{gr.expiryDate}</td>
                        <td className="p-3 text-center">
                          {hasCOA ? (
                            <button
                              type="button"
                              onClick={() => handleOpenCOA(gr)}
                              className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 mx-auto"
                            >
                              <FileText className="h-3 w-3" />
                              {gr.coaDocument.status === 'Verified' ? 'COA ครบถ้วน ✓' : 'รอยืนยันใบรับรอง'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenCOA(gr)}
                              className="bg-rose-50 border border-rose-200 text-rose-600 font-bold hover:bg-rose-100 text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 mx-auto"
                            >
                              <Upload className="h-3 w-3" />
                              ขาดใบ COA! อัปโหลด
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-center border-l border-[#E5E5EA]">
                          {bExpired ? (
                            <span className="bg-rose-50 border border-rose-200 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                              ⚠️ เสื่อมสภาพ/เสื่อมหอม
                            </span>
                          ) : bNearing ? (
                            <span className="bg-amber-50 border border-amber-200 text-amber-600 font-bold px-2 py-0.5 rounded text-[10px] uppercase animate-pulse">
                              ⏳ ด่วน! ใกล้หมดสต๊อกเสงี่ยม
                            </span>
                          ) : (
                            <span className="bg-[#34C759]/10 text-emerald-800 font-bold px-2 py-0.2 rounded text-[10px] uppercase">
                              ✓ เสถียรดีเยี่ยม
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="pt-3 text-center text-[#86868B] text-[10px]">
                *แสดงเฉพาะประวัติการรับเข้าล็อตสารสกัด 10 รายการล่าสุด เพื่อความรวดเร็วในการโหลดตาราง
              </div>
            </div>
          </div>
        </>
      ) : (
        /* COA COMPREHENSIVE DOCUMENT DIRECTORY HUB  */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-indigo-950 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                  รายชื่อล็อตรับเข้าคลังเคมีที่ต้องการระบบ COA ตรวจรับรองคลังวัตถุดิบ
                </h3>
                <p className="text-xs text-[#86868B]">
                  ISO 22716 ตรวจรับรองคุณภาพว่าของล็อตสารหอมธรรมชาติต้องมี Certificate of Analysis (COA) แนบเสถียรตามเกณฑ์ GMP สากล
                </p>
              </div>

              {/* COA Filters and Statistics in right corner */}
              <div className="flex bg-neutral-100 p-2 text-xs rounded-xl gap-4 border text-[#515154] shrink-0 font-medium">
                <div>ใบ COA รับรองแล้ว: <b className="text-emerald-700 font-mono font-extrabold">{verifiedCOAs}</b> ชุด</div>
                <div className="border-l border-neutral-300 pr-0.5"></div>
                <div>รอใบตรวจหรือล่าช้า: <b className="text-rose-600 font-mono font-extrabold">{outstandingCOAs}</b> ล็อต</div>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-[#E5E5EA] uppercase tracking-wider text-[10px]">
                    <th className="p-4 pl-6">เลขอัญประกาศ</th>
                    <th className="p-4">ชื่อสสาร / สารตั้งต้นหลัก</th>
                    <th className="p-4">รหัสล็อต (Lot Number)</th>
                    <th className="p-4">โรงงานต้นกำเนิด / ผู้ส่งมอบ</th>
                    <th className="p-4 text-center">ระดับ Purity ปากใบ</th>
                    <th className="p-4 text-center">วันที่และตราเอกสาร</th>
                    <th className="p-4 text-center">สถานะใบพยาน COA</th>
                    <th className="p-4 text-center">เข้าดูใบตรวจ / อัปเดต</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
                  {goodsReceipts.map((gr: any) => {
                    const material = unfilteredMaterials.find((m: any) => m.id === gr.materialId) || { name: gr.materialId, code: 'N/A' };
                    const hasCOA = !!gr.coaDocument;
                    
                    return (
                      <tr key={gr.id} className="hover:bg-[#F5F5F7]/30 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-indigo-950">{gr.id}</td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{material.name}</div>
                          <div className="text-[10px] text-[#86868B] font-mono select-all">รหัสสาร: {material.code}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-neutral-800 select-all">{gr.lotNumber}</td>
                        <td className="p-4 font-medium text-slate-600">
                          {gr.supplierId === 'supp-1' ? 'Grass Aromatics (ฝรั่งเศส)' : 'Bangkok Chem Depot'}
                        </td>
                        <td className="p-4 text-center font-mono font-bold">
                          {hasCOA ? (
                            <span className={gr.coaDocument.purityPercentage >= 99.0 ? 'text-emerald-700' : 'text-amber-600'}>
                              {gr.coaDocument.purityPercentage}%
                            </span>
                          ) : (
                            <span className="text-[#86868B] font-normal italic">ไม่มีข้อมูล</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {hasCOA ? (
                            <div className="space-y-0.5">
                              <div className="font-mono text-slate-700 font-semibold">{gr.coaDocument.fileName}</div>
                              <div className="text-[9px] text-[#86868B]">ตรวจเมื่อ: {gr.coaDocument.testedDate}</div>
                            </div>
                          ) : (
                            <span className="text-rose-500 font-semibold">❌ ยังไม่มีใบเอกสาร</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {gr.coaDocument?.status === 'Verified' ? (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px]">
                              ผ่านการรับรองกสิกรรม ✓
                            </span>
                          ) : gr.coaDocument?.status === 'Pending Verification' ? (
                            <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[10px] animate-pulse">
                              รอยืนยันโดยแล็บ ⏳
                            </span>
                          ) : (
                            <span className="bg-rose-50 border border-rose-200 text-rose-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
                              ขาดเอกสาร COA ⚠️
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenCOA(gr)}
                            className="bg-[#1D1D1F] hover:bg-neutral-800 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition-all duration-150 shadow-xs flex items-center gap-1 mx-auto"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            เปิดแฟ้มชันสูตร COA
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* COA VIEWER & UPLOADER SCREEN MODAL */}
      {selectedLotForCOA && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-in text-xs">
            {/* Modal Header */}
            <div className="bg-[#1D1D1F] text-white p-5 flex justify-between items-center select-none">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Certificate of Analysis Explorer (ใบวิเคราะห์สารระเหย)</div>
                <h4 className="text-base font-extrabold tracking-tight">ใบตรวจสอบระบุรหัสสินค้าเคมีประจำล็อต: {selectedLotForCOA.lotNumber}</h4>
              </div>
              <button 
                onClick={() => setSelectedLotForCOA(null)}
                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-sm transition-all font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F5F5F7] p-4 rounded-2xl border border-[#E5E5EA] space-y-2">
                  <div className="font-bold text-xs text-[#1D1D1F] border-b border-neutral-300 pb-1.5">ข้อมูลล็อตวัตถุดิบนำเข้า</div>
                  <div className="grid grid-cols-2 gap-y-1 text-[11px] text-[#515154]">
                    <div>รหัสใบรับวัสดุ:</div>
                    <div className="font-mono font-bold text-[#1D1D1F]">{selectedLotForCOA.id}</div>
                    <div>ชื่อสารสกัดเคมีดิบ:</div>
                    <div className="font-semibold text-indigo-950">
                      {unfilteredMaterials.find((m: any) => m.id === selectedLotForCOA.materialId)?.name || 'N/A'}
                    </div>
                    <div>วันที่ตรวจคลังรับเข้า:</div>
                    <div className="font-mono">{selectedLotForCOA.createdAt}</div>
                    <div>วันหมดอายุถังบ่ม:</div>
                    <div className="font-mono font-bold text-rose-600">{selectedLotForCOA.expiryDate}</div>
                    <div>สายสัมพันธ์คู่ค้า:</div>
                    <div>Grass Aromatics Ltd.</div>
                  </div>
                </div>

                {/* Drag Drop simulated zone */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-indigo-600 bg-indigo-50/55' : 'border-[#E5E5EA] bg-[#F5F5F7] hover:bg-neutral-50'}`}
                >
                  <Upload className={`h-8 w-8 mb-2 ${isDragging ? 'text-indigo-600' : 'text-[#86868B]'}`} />
                  <div className="font-bold text-[#1D1D1F] text-[11px]">ลากรูปภาพหรือไฟล์ PDF ใบ COA วางลงที่นี่</div>
                  <span className="text-[9px] text-[#86868B] mt-0.5">หรือคลิกเพื่อค้นไฟล์เอกสารแนบจากคอมพิวเตอร์ของคุณ</span>
                  
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="coa-file-file-input"
                  />
                  <label 
                    htmlFor="coa-file-file-input"
                    className="mt-2.5 px-3.5 py-1.5 bg-white border border-[#E5E5EA] hover:bg-[#F5F5F7] rounded-xl font-bold font-sans text-[10px] text-[#1D1D1F] cursor-pointer shadow-xs shadow-black/5"
                  >
                    เลือกแฟ้มเอกสาร
                  </label>

                  {uploadProgress !== null && (
                    <div className="w-full mt-3 space-y-1">
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <div className="text-[9px] text-indigo-700 font-bold animate-pulse">กำลังอ่านค่าความบริสุทธิ์และสารปรอทด้วย AI OCR... {uploadProgress}%</div>
                    </div>
                  )}
                </div>
              </div>

              {/* COA Parameters & Test Results Validation Table */}
              <div className="space-y-2">
                <div className="font-bold text-[#1D1D1F] text-xs flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                  <span className="flex items-center gap-1 text-indigo-950 font-sans tracking-wide">
                    📊 สารบบตรวจวัดตัวแปรสเปกตรัม (GC-MS Molecular Specifications)
                  </span>
                  <span className="text-[10px] text-indigo-700 font-mono">GMP Standard ISO 22716</span>
                </div>

                <div className="border border-[#E5E5EA] rounded-2xl overflow-hidden font-mono text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F5F5F7] text-[#86868B] font-semibold border-b border-[#E5E5EA] text-[10px]">
                        <th className="p-2.5 pl-4">ชื่อคีย์ตัวแปรทดสอบ (Analytical Specs)</th>
                        <th className="p-2.5">เกณฑ์อุตสาหกรรมคาดหวัง</th>
                        <th className="p-2.5 text-right pr-4">ค่าที่แล็บหรือตรา COA สลักได้ตรวจเจอ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5EA] bg-white text-[#1D1D1F]">
                      {selectedLotForCOA.coaDocument?.parameters?.map((p: any, i: number) => (
                        <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-2.5 pl-4 text-slate-700 font-medium font-sans">{p.name}</td>
                          <td className="p-2.5 font-bold text-indigo-900">{p.expected}</td>
                          <td className="p-2.5 text-right pr-4 font-extrabold text-[#1D1D1F]">
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full"></span>
                              {p.value}
                            </span>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-[#86868B]">ยังไม่มีบันทึกข้อมูลดัชนีคุณลักษณะ แนะนำให้อัปโหลดไฟล์หรือป้อนตรา COA ใบสำคัญ</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit parameters segment */}
              <div className="bg-amber-50/50 border border-amber-250 p-4 rounded-2xl space-y-3">
                <div className="font-bold text-xs text-amber-900 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  ฝ่ายควบคุมคุณภาพของโรงงานประเมินคุณลักษณะ (QC Verification Board)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] text-amber-900 font-bold block">ความบริสุทธิ์หลัก (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 font-mono font-bold"
                      value={editPurity}
                      onChange={(e) => setEditPurity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] text-amber-900 font-bold block">ดัชนีหักเหแสง (Refractive)</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 font-mono font-bold"
                      value={editRefrac}
                      onChange={(e) => setEditRefrac(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] text-amber-900 font-bold block">ความชื้น % (Moisture)</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 font-mono font-bold"
                      value={editMoisture}
                      onChange={(e) => setEditMoisture(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] text-amber-900 font-bold block">เจ้าหน้าที่ผู้ลงนามรับรอง</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 font-semibold"
                      value={editTester}
                      onChange={(e) => setEditTester(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#F5F5F7] border-t border-[#E5E5EA] p-5 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-[11px] text-[#86868B] font-medium text-center sm:text-left select-none">
                {selectedLotForCOA.coaDocument?.uploadedAt ? (
                  <>บันทึกเอกสาร COA เมื่อ: <b>{selectedLotForCOA.coaDocument.uploadedAt}</b></>
                ) : (
                  "แนะนำให้แนบไฟล์ PDF หรือป้อนคุณสมบัติเคมีตามใบ COA ของผู้ผลิตคู่ค้า"
                )}
              </span>

              <div className="flex gap-2 select-none w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleVerifyCOA('Rejected')}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200"
                >
                  ปฏิเสธคุณสมบัติล็อตสสาร ✕
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyCOA('Verified')}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  ตราประทับ อนุมัติล็อต COA Verified ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
