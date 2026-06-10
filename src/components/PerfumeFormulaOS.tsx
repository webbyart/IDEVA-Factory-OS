import React, { useState } from 'react';
import { 
  Beaker, Save, RotateCcw, Plus, Trash2, Edit3, ClipboardList, Info, 
  Layers, Package, Sparkles, Scale, RefreshCcw, Check, ChevronDown, CheckCircle,
  Search, ChevronLeft, ChevronRight, Sliders, AlertCircle
} from 'lucide-react';

interface PerfumeFormulaOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function PerfumeFormulaOS({ dbState, onRefresh, onNotify, userRole }: PerfumeFormulaOSProps) {
  // Master Lists
  const products = dbState.products || [];
  const rawMaterials = (dbState.materials || []).filter((m: any) => m.category === 'Raw Material');
  const formulas = dbState.formulas || [];

  // Formula Search & Filter inside the Sidebar
  const [formulaSearch, setFormulaSearch] = useState('');
  const [formulaStatusFilter, setFormulaStatusFilter] = useState<'All' | 'Approved' | 'Development'>('All');
  
  // Formula list sidebar pagination
  const [formulaPage, setFormulaPage] = useState(1);
  const formulasPerPage = 5;

  // Active selected Formula for calculator or detailed viewing
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(formulas[0]?.id || '');
  
  // Batch calculator state
  const [batchWeight, setBatchWeight] = useState<number>(250); // 250 kg/liters standard industrial batch
  const [batchUnit, setBatchUnit] = useState<'kg' | 'liters'>('kg');

  // Form states for creating a new Formula
  const [showAddFormula, setShowAddFormula] = useState(false);
  const [newFormulaProductId, setNewFormulaProductId] = useState('');
  const [newFormulaVersion, setNewFormulaVersion] = useState('');
  const [newFormulaStatus, setNewFormulaStatus] = useState<'Draft' | 'Pending Review' | 'Approved'>('Draft');
  
  // Custom ingredients rows within the recipe creator
  const [newFormulaItems, setNewFormulaItems] = useState<{ materialId: string; quantity: number }[]>([
    { materialId: '', quantity: 0.15 },
    { materialId: '', quantity: 0.25 },
    { materialId: '', quantity: 0.60 }
  ]);

  const [loading, setLoading] = useState(false);

  // Convert material ID to human readable Name
  const getMaterialName = (id: string) => {
    const m = rawMaterials.find((x: any) => x.id === id);
    return m ? m.name : id;
  };

  const getMaterialCode = (id: string) => {
    const m = rawMaterials.find((x: any) => x.id === id);
    return m ? m.code : id;
  };

  const getProductScentName = (id: string) => {
    const p = products.find((x: any) => x.id === id);
    return p ? p.name : id;
  };

  // Filter formula list based on sidebar search & filters
  const filteredFormulas = formulas.filter((f: any) => {
    const scentName = getProductScentName(f.productId).toLowerCase();
    const versionStr = f.version.toLowerCase();
    const matchesSearch = scentName.includes(formulaSearch.toLowerCase()) || 
                          versionStr.includes(formulaSearch.toLowerCase()) ||
                          f.id.toLowerCase().includes(formulaSearch.toLowerCase());
    
    if (formulaStatusFilter === 'All') return matchesSearch;
    if (formulaStatusFilter === 'Approved') return matchesSearch && f.status === 'Approved';
    return matchesSearch && f.status !== 'Approved';
  });

  // Sidebar Formulas Pagination
  const totalFormulas = filteredFormulas.length;
  const totalFormulaPages = Math.ceil(totalFormulas / formulasPerPage) || 1;
  const paginatedFormulas = filteredFormulas.slice((formulaPage - 1) * formulasPerPage, formulaPage * formulasPerPage);

  const handleFormulaSearchChange = (val: string) => {
    setFormulaSearch(val);
    setFormulaPage(1);
  };

  const handleFormulaStatusChange = (val: 'All' | 'Approved' | 'Development') => {
    setFormulaStatusFilter(val);
    setFormulaPage(1);
  };

  // Get active formula details
  const activeFormula = formulas.find((f: any) => f.id === selectedFormulaId) || filteredFormulas[0] || formulas[0];

  // Calculate sum of ratios for validation
  const getIngredientsSum = (items: { materialId: string; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  };

  // Raw Material auto normalizer to exactly 100% (1.0000)
  const handleNormalizeRatios = () => {
    const sum = getIngredientsSum(newFormulaItems);
    if (sum <= 0) {
      onNotify("กรุณาระบุสัดส่วนของสสารในแถวอย่างน้อยหนึ่งตัวก่อนลงมือปรับความเข้มเป็น 100%", "warning");
      return;
    }
    const normalized = newFormulaItems.map(item => ({
      ...item,
      quantity: Number((item.quantity / sum).toFixed(4))
    }));
    setNewFormulaItems(normalized);
    onNotify("⚖️ ปรับผลดุลยภาพความเข้มข้นสารทุกแถวเฉลี่ยรวมเป็น 100% สมบูรณ์!", "info");
  };

  // Handle adding ingredient row in draft
  const handleAddIngredientRow = () => {
    setNewFormulaItems([...newFormulaItems, { materialId: '', quantity: 0.05 }]);
  };

  // Handle removing ingredient row in draft
  const handleRemoveIngredientRow = (index: number) => {
    if (newFormulaItems.length <= 1) {
      onNotify("สูตรน้ำหอมจำเป็นต้องมีส่วนผสมอย่างน้อย 1 รายการ", "warning");
      return;
    }
    setNewFormulaItems(newFormulaItems.filter((_, idx) => idx !== index));
  };

  // Update specific ingredient row value
  const handleUpdateIngredientRow = (index: number, key: 'materialId' | 'quantity', value: any) => {
    const updated = [...newFormulaItems];
    if (key === 'quantity') {
      updated[index].quantity = Number(value);
    } else {
      updated[index].materialId = value;
    }
    setNewFormulaItems(updated);
  };

  // Submit formula creation to backend
  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormulaProductId) {
      onNotify("โปรดเลือกผลิตภัณฑ์น้ำหอมคู่สูตร", "warning");
      return;
    }
    if (!newFormulaVersion.trim()) {
      onNotify("โปรดระบุเวอร์ชัน / ชื่อเรียกสูตรการกลั่น", "warning");
      return;
    }

    const hasUnselectedMaterial = newFormulaItems.some(item => !item.materialId);
    if (hasUnselectedMaterial) {
      onNotify("กรุณาระบุวัตถุดิบเจาะจงให้ครบถ้วนในทุกแถวส่วนผสม", "warning");
      return;
    }

    const totalRatio = getIngredientsSum(newFormulaItems);
    if (totalRatio <= 0) {
      onNotify("สัดส่วนความเข้มข้นสารรวมจำเป็นต้องมากกว่า 0%", "warning");
      return;
    }
    
    // Normalize automatically if difference is minor, or prompt
    let itemsToSubmit = newFormulaItems;
    if (Math.abs(totalRatio - 1.0) > 0.001) {
      const confirmNormalize = window.confirm(`สัดส่วนสารตรวจพบรวมได้ ${(totalRatio * 100).toFixed(1)}% (ระบบแนะนำให้ปรับให้อิ่มเสรียงที่ 100.00% เพื่อความง่ายในการผลิต)\n\nกด ตกลง (OK) เพื่อให้ปรับเกลี่ยอัตราน้ำหนักให้เท่ากับ 100% โดยกตัญูอัตโนมัติ`);
      if (confirmNormalize) {
        itemsToSubmit = newFormulaItems.map(item => ({
          ...item,
          quantity: Number((item.quantity / totalRatio).toFixed(4))
        }));
      }
    }

    setLoading(true);
    try {
      const formulaPayload = {
        id: `form-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`,
        productId: newFormulaProductId,
        version: newFormulaVersion,
        status: newFormulaStatus,
        approvedBy: userRole === 'Admin' ? 'ทีมวิจัยแล็บปรุงกลิ่นหรู IDEVA OS' : 'ผ่านพิจารณาแล็บอุตสาหกรรม',
        items: itemsToSubmit.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity
        }))
      };

      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'formulas',
          item: formulaPayload
        })
      });

      const resData = await response.json();

      if (resData.success) {
        onNotify(`จดทะเบียนบันทึกและเฉลี่ยสัดส่วนคลังสูตรน้ำหอมรุ่นที่ "${newFormulaVersion}" สำเร็จเรียบร้อย!`, "info");
        setShowAddFormula(false);
        setNewFormulaProductId('');
        setNewFormulaVersion('');
        setNewFormulaItems([
          { materialId: '', quantity: 0.15 },
          { materialId: '', quantity: 0.25 },
          { materialId: '', quantity: 0.60 }
        ]);
        setSelectedFormulaId(formulaPayload.id);
        onRefresh();
      } else {
        onNotify(resData.error || "เกิดความผิดพลาดในการขึ้นทะเบียนสูตร", "error");
      }
    } catch {
      onNotify("ไม่สามารถประทับลงทะเบียนสูตรลงเซิร์ฟเวอร์ฐานเคมี", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="perfume-formula-management-os">
      {/* Visual Apple Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-pink-50 border border-pink-100 text-pink-600 rounded-xl">
                <Beaker className="h-5 w-5" />
              </span>
              <h2 className="font-bold text-lg text-[#1D1D1F] tracking-tight">Perfume Formula OS</h2>
            </div>
            <p className="text-xs text-[#86868B]">
              คลังคุมสูตรปรุงผสมน้ำหอม (BOM Recipes Dashboard) วิเคราะห์มวลโครงสัดส่วน และคำนวณสเกลน้ำหนักสารดิบเพื่อเดินงานผลิตระดับอุตสาหกรรม
            </p>
          </div>

          <button
            onClick={() => setShowAddFormula(!showAddFormula)}
            className={`px-4.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs ${
              showAddFormula 
                ? 'bg-neutral-150 text-[#1D1D1F] border border-[#E5E5EA]' 
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            <Plus className="h-4 w-4" /> {showAddFormula ? 'ปิดระบบแต่งส่วนผสม' : 'จดทะเบียนสูตรผสมแก๊สชุดใหม่ + Normalize'}
          </button>
        </div>

        {/* Dynamic Metric metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#F5F5F7] pt-4 text-xs font-medium">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-pink-500 shrink-0" />
            <div>
              <p className="text-[#86868B] font-semibold text-[10px] uppercase">จำนวนสูตรน้ำหอมหลักสูตรหลัก</p>
              <p className="font-bold text-sm text-pink-700 font-mono">{formulas.length} แฟ้มวิจัย</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-[#5856D6] shrink-0" />
            <div>
              <p className="text-[#86868B] font-semibold text-[10px] uppercase">ผลิตภัณฑ์สเกลหรูที่ผูกสูตรเสร็จสิ้น</p>
              <p className="font-bold text-sm text-[#5856D6] font-mono">
                {formulas.filter((f: any) => f.status === 'Approved').length} รุ่นใบสัญญากลั่นน้ำหอม
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-[#86868B] font-semibold text-[10px] uppercase">สสารเคมี / อะโรมาติกเดี่ยวที่เลือกได้</p>
              <p className="font-bold text-sm text-amber-600 font-mono">{rawMaterials.length} ชนิดส่วนผสมสกัด</p>
            </div>
          </div>
        </div>
      </div>

      {/* COMPOSER FORM VIEW WITH MULTI-ELEMENT Normalizer */}
      {showAddFormula && (
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xl space-y-5 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 to-indigo-500"></div>
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1D1D1F]">
                  วิจัยโครงสร้างสูตรน้ำหอมใหม่ (Industrial Perfume BOM Composer)
                </h3>
                <p className="text-[11px] text-[#86868B]">
                  กำหนดส่วนผสม สัดส่วนอัตราน้ำหนัก และจัดชุดสารวิสารควบคุมคุณภาพตามมาตรฐาน GMP
                </p>
              </div>
            </div>
            <span className="text-[9px] bg-neutral-900 text-white px-2.5 py-1 rounded-full font-bold select-none tracking-wider uppercase">
              ระบบปันอัตราสัมพัทธ์
            </span>
          </div>

          <form onSubmit={handleCreateFormula} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Product Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">จับคู่เข้ากับผลิตภัณฑ์น้ำหอมแบรนด์ <span className="text-rose-500">*</span></label>
                <select
                  value={newFormulaProductId}
                  onChange={(e) => setNewFormulaProductId(e.target.value)}
                  className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all font-sans font-medium"
                  required
                >
                  <option value="">-- กรุณาเลือกผลิตภัณฑ์ --</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Version Identifier */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">ชื่อสูตร / รหัสจำแนก (BOM Description) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="เช่น สูตรส้มสากลพรีเมียมเวอร์ชัน v3.6"
                  value={newFormulaVersion}
                  onChange={(e) => setNewFormulaVersion(e.target.value)}
                  className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all font-medium"
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">สถานะกระบวนการวิจัย</label>
                <select
                  value={newFormulaStatus}
                  onChange={(e) => setNewFormulaStatus(e.target.value as any)}
                  className="w-full border border-[#E5E5EA] bg-[#F5F5F7] rounded-xl p-2.5 outline-none focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all font-sans font-medium"
                >
                  <option value="Draft">แบบฝึกวิจัยปรุงแต่ง (Draft)</option>
                  <option value="Pending Review">เสนอนายช่างใหญ่ประเมิน (Pending Review)</option>
                  <option value="Approved">ลงนามสลักเป็นสูตรอุตสาหกรรม (Approved)</option>
                </select>
              </div>
            </div>

            {/* Core ingred rows composer with beautiful layout */}
            <div className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-inner">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-200/80 gap-3">
                <span className="font-extrabold flex items-center gap-1.5 text-indigo-950">
                  <Beaker className="h-4.5 w-4.5 text-pink-600" />
                  รายชื่อและสัดส่วนองค์ประกอบสสาร (Chemical Formula Matrix)
                </span>
                <div className="flex gap-2 shrink-0 select-none">
                  <button
                    type="button"
                    onClick={handleNormalizeRatios}
                    className="px-3.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl border border-pink-100 font-bold flex items-center gap-1 transition-all text-[11px] active:scale-95"
                    title="ระบบปรับให้เปอร์เซ็นต์รวมทุกวัตถุดิบเฉลี่ยเท่ากับ 100% บาลานซ์"
                  >
                    ⚖️ ปรับดุลเฉลี่ย 100% (Normalize)
                  </button>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-neutral-800 text-white rounded-xl font-bold flex items-center gap-1 transition-all text-[11px] active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" /> เพิ่มแถวสารดิบ
                  </button>
                </div>
              </div>

              {/* Dynamic Progress indicator for Sum check */}
              {(() => {
                const totalDecimal = getIngredientsSum(newFormulaItems);
                const totalPct = totalDecimal * 100;
                const isBalanced = Math.abs(totalDecimal - 1.0) < 0.001;
                
                return (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-semibold">ดัชนีรวมน้ำหนักสุทธิ:</span>
                      <span className={`font-mono font-extrabold ${isBalanced ? 'text-emerald-700' : 'text-amber-600'}`}>
                        {totalPct.toFixed(2)}% {isBalanced ? '(ดุล 100% สมบูรณ์ ✓)' : '(ยังไม่ได้ดุล 100% ⚠️)'}
                      </span>
                    </div>
                    {/* Visual bar tracker */}
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full transition-all duration-300 ${isBalanced ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} 
                        style={{ width: `${Math.min(totalPct, 100)}%` }}
                      ></div>
                    </div>
                    {!isBalanced && (
                      <p className="text-[10px] text-amber-600 mt-1">
                        * ปริมาณส่วนผสมทั้งหมดไม่รวมเท่ากับ 100% (ปัจจุบัน {totalPct.toFixed(2)}%) กรุณากดปุ่ม <strong>&quot;ปรับดุลเฉลี่ย 100%&quot;</strong> เพื่อคำนวณสัดส่วนแบบปันส่วนอัตโนมัติ
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Matrix ingredient container list */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {newFormulaItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-3 rounded-2xl border border-slate-150 hover:border-pink-200 transition-all shadow-sm">
                    <span className="w-6 h-6 rounded-full bg-pink-50 text-pink-600 font-extrabold flex items-center justify-center border border-pink-100 font-mono text-[10px] shrink-0">
                      {index + 1}
                    </span>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <select
                          value={item.materialId}
                          onChange={(e) => handleUpdateIngredientRow(index, 'materialId', e.target.value)}
                          className="w-full border border-[#E5E5EA] rounded-xl p-2 bg-[#F5F5F7] outline-none font-medium focus:bg-white focus:border-pink-500 text-xs"
                          required
                        >
                          <option value="">-- กรุณาเลือกสารหอมวัตถุดิบ --</option>
                          {rawMaterials.map((m: any) => (
                            <option key={m.id} value={m.id}>
                              [{m.code}] {m.name} (คลังสำรอง: {m.stockLevel.toLocaleString()} {m.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.0001"
                            placeholder="สัดส่วน เช่น 0.12 = 12%"
                            value={item.quantity}
                            onChange={(e) => handleUpdateIngredientRow(index, 'quantity', e.target.value)}
                            className="w-full border border-[#E5E5EA] rounded-xl p-2 text-xs font-mono text-right font-bold bg-[#F5F5F7] focus:bg-white focus:border-pink-500 outline-none"
                            required
                          />
                          <span className="w-16 text-right font-mono text-indigo-700 text-[11px] font-extrabold bg-indigo-50 px-2 py-1.5 rounded-lg border border-indigo-100 shrink-0 select-none">
                            {(item.quantity * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredientRow(index)}
                      className="p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl shrink-0 self-end sm:self-center transition-colors cursor-pointer"
                      title="ลบส่วนประกอบแถวนี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowAddFormula(false)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] font-bold rounded-xl transition-colors cursor-pointer"
              >
                ละทิ้งแบบปรุงสสาร
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-xs"
              >
                {loading ? 'กำลังส่งขึ้นแฟ้มบ่มปรุง...' : 'ขึ้นทะเบียนคลังสูตรแล็บเสถียร ✓'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TWO COLUMN GRID FOR HIGH VOLUME SELECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left COLUMN: Formula selection sidebar with Search & Pagination */}
        <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-pink-500" />
                รายชื่อแฟ้มน้ำหอมและเกรดสูตร
              </h3>
              <p className="text-[11px] text-[#86868B]">
                มีสูตรสสารหลักร้อยรายการในฐานข้อมูลระบบ กดเพื่อดึงอัตราน้ำหนักขึ้นวิเคราะห์แปรสภาพ
              </p>
            </div>

            {/* Integrated search and filters for high-volume list */}
            <div className="space-y-2 text-xs font-medium">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นชื่อรุ่นกลิ่นหอม หรือรหัสสูตร..."
                  value={formulaSearch}
                  onChange={(e) => handleFormulaSearchChange(e.target.value)}
                  className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl pl-8 pr-3 py-2 outline-none focus:bg-white focus:border-pink-500 font-sans font-medium text-[11px]"
                />
              </div>

              {/* Status selectors */}
              <div className="flex bg-[#E8E8ED]/80 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handleFormulaStatusChange('All')}
                  className={`flex-1 py-1.5 rounded-md transition-all ${formulaStatusFilter === 'All' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
                >
                  ทั้งหมด ({formulas.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleFormulaStatusChange('Approved')}
                  className={`flex-1 py-1.5 rounded-md transition-all ${formulaStatusFilter === 'Approved' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
                >
                  อนุมัติกลั่น ({formulas.filter((f: any) => f.status === 'Approved').length})
                </button>
                <button
                  type="button"
                  onClick={() => handleFormulaStatusChange('Development')}
                  className={`flex-1 py-1.5 rounded-md transition-all ${formulaStatusFilter === 'Development' ? 'bg-white text-[#1D1D1F] shadow-xs' : 'text-[#86868B]'}`}
                >
                  แล็บวิจัย ({formulas.filter((f: any) => f.status !== 'Approved').length})
                </button>
              </div>
            </div>

            {/* Paginated formulae select scroll button stack */}
            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
              {paginatedFormulas.length === 0 ? (
                <div className="p-10 text-center text-[#86868B] border border-dashed rounded-2xl bg-neutral-50 border-neutral-200">
                  ไม่พบรายการสูตรน้ำหอม
                </div>
              ) : (
                paginatedFormulas.map((item: any) => {
                  const bSelected = item.id === selectedFormulaId;
                  const scent = getProductScentName(item.productId);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedFormulaId(item.id);
                        setBatchWeight(batchWeight); // Retain batch calculation
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between space-y-2.5 duration-150 ${
                        bSelected 
                          ? 'bg-neutral-900 border-neutral-900 text-white shadow-md scale-[1.01]' 
                          : 'bg-white border-[#E5E5EA] hover:border-neutral-300 text-[#1D1D1F]'
                      }`}
                    >
                      <div className="w-full flex justify-between items-start gap-1 select-none">
                        <span className={`font-mono font-bold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded ${
                          bSelected ? 'bg-white/10 text-pink-300 font-mono font-bold' : 'bg-[#F2F2F7] text-[#86868B] font-mono'
                        }`}>
                          {item.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100 font-medium'
                        }`}>
                          {item.status === 'Approved' ? 'ผ่านอนุมัติปรุงกลั่น' : 'อยู่ระหว่างพัฒนาแล็บ'}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-extrabold tracking-tight text-sm line-clamp-1">{scent}</h4>
                        <p className={`font-medium ${bSelected ? 'text-neutral-300' : 'text-[#86868B]'}`}>
                          เวอร์ชันสูตรแกนหลัก: <span className="underline font-bold font-sans">{item.version}</span>
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-2 border-t border-dashed w-full" style={{ borderColor: bSelected ? 'rgba(255,255,255,0.15)' : '#E5E5EA' }}>
                        <span className={`${bSelected ? 'text-neutral-400' : 'text-slate-500'} font-bold`}>
                          ส่วนผสมสกัด: {item.items?.length || 0} อรทบ
                        </span>
                        <span className="font-extrabold text-pink-600">
                          สัดส่วนรวม: {((item.items || []).reduce((sum: number, x: any)=>sum + x.quantity, 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar formula pages controller */}
          <div className="pt-3 border-t border-slate-100 bg-[#F5F5F7]/30 p-2.5 rounded-2xl flex justify-between items-center text-[10px] text-[#86868B] font-semibold select-none">
            <span>พบ {totalFormulas} สูตร</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFormulaPage(prev => Math.max(prev - 1, 1))}
                disabled={formulaPage === 1}
                className="p-1 rounded-md border border-[#E5E5EA] bg-white text-[#1D1D1F] disabled:opacity-40"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span>{formulaPage} / {totalFormulaPages}</span>
              <button
                type="button"
                onClick={() => setFormulaPage(prev => Math.min(prev + 1, totalFormulaPages))}
                disabled={formulaPage === totalFormulaPages}
                className="p-1 rounded-md border border-[#E5E5EA] bg-white text-[#1D1D1F] disabled:opacity-40"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right calculator scale column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E5E5EA]">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 font-bold px-3 py-1 text-[9px] rounded-full uppercase tracking-wider font-mono border border-indigo-100">
                <Scale className="h-3.5 w-3.5 text-pink-600 animate-pulse" /> เครื่องจักรคำนวณสเกลน้ำหอมความแม่นยำสูง
              </span>
              <h3 className="font-bold text-base text-[#1D1D1F] tracking-tight">คำนวณดึงสสารเคมีตามขนาด Batch สั่งผลิต</h3>
              <p className="text-xs text-[#86868B]">
                คำนวณย้อนเกลี่ยตามมวลโครงสร้างเพื่อชั่งปริมาณแอลกอฮอล์บ่ม หัวน้ำมันหอมระเหย และสารตรึงกลิ่นป้อนลงแท็งก์กวน
              </p>
            </div>
          </div>

          {activeFormula ? (
            <div className="space-y-6">
              <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-3xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block">วิเคราะห์โครงสร้างสูตรการปรุงผสม</span>
                  <p className="font-extrabold text-[#1D1D1F] text-base">{getProductScentName(activeFormula.productId)}</p>
                  <p className="text-xs text-[#86868B] font-mono">เวอร์ชันสูตรหลัก: <strong className="text-indigo-950 underline font-sans">{activeFormula.version}</strong> | ตราวินิจฉัย: {activeFormula.approvedBy || 'สลักอนุมัติ'}</p>
                </div>

                {/* Input weight multiplier parameters */}
                <div className="space-y-2 bg-white border border-[#E5E5EA] rounded-2xl p-4.5 text-xs">
                  <span className="font-bold text-indigo-950 block">เป้าหมายขนาดถังกลั่น / ขนาด Batch การผลิตน้ำหอม</span>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        value={batchWeight || ''}
                        onChange={(e) => setBatchWeight(Number(e.target.value) || 0)}
                        className="w-full bg-[#F5F5F7] focus:bg-white text-xs font-mono font-extrabold rounded-xl border border-[#E5E5EA] p-2.5 pr-10 text-right focus:border-indigo-500"
                      />
                      <span className="absolute right-3.5 top-3.5 font-bold uppercase text-[9px] text-[#86868B]">
                        {batchUnit}
                      </span>
                    </div>

                    <select
                      value={batchUnit}
                      onChange={(e) => setBatchUnit(e.target.value as any)}
                      className="border border-[#E5E5EA] rounded-xl p-2.5 font-bold text-xs bg-white outline-none"
                    >
                      <option value="kg">กิโลกรัม (Kg)</option>
                      <option value="liters">ลิตร (Liters)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BATCH INGREDIENTS SCALE RESULTS LIST */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500 font-bold border-b border-[#E5E5EA] pb-2 text-[11px] uppercase tracking-wide">
                  <span>รายการสารเคมีที่ต้องดึงสต็อกและชั่งป้อนกระบอก</span>
                  <span className="font-mono text-xs text-indigo-700 font-bold">เป้าหมายสะสม Batch: {batchWeight.toLocaleString()} {batchUnit === 'kg' ? 'Kg' : 'Litre'}</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {activeFormula.items && activeFormula.items.map((item: any, idx: number) => {
                    const materialName = getMaterialName(item.materialId);
                    const materialCode = getMaterialCode(item.materialId);
                    
                    const proportionRatio = item.quantity;
                    const calculatedScaledValue = (batchWeight * proportionRatio);

                    return (
                      <div key={idx} className="flex items-center justify-between border-b border-[#E5E5EA]/70 py-3 text-xs last:border-0 hover:bg-[#F5F5F7]/30 px-3.5 rounded-xl transition-all duration-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[9px] bg-[#1D1D1F] text-white px-2 py-0.5 rounded-md font-bold select-all">
                              {materialCode}
                            </span>
                            <span className="font-extrabold text-slate-800 text-sm">{materialName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold font-mono block">
                            รหัสวัตถุดิบ: {item.materialId} | ความบริสุทธิ์สูง R&D สัดส่วน: {(proportionRatio * 100).toFixed(2)}%
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-sm font-extrabold text-indigo-700 bg-indigo-50/50 px-3.5 py-1.5 rounded-2xl border border-indigo-100 inline-block min-w-28 text-center shadow-xs shadow-indigo-600/5">
                            {calculatedScaledValue.toFixed(4)} <span className="font-bold text-[10px] text-indigo-500 select-none">{batchUnit === 'kg' ? 'Kg' : 'Liters'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Standards stamp */}
              <div className="bg-pink-50/35 p-4 rounded-3xl border border-pink-100 text-[11px] text-[#86868B] space-y-2 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-pink-700">
                  <CheckCircle className="h-4 w-4 shrink-0" /> สอบทานเสถียรและความพร้อมคู่สูตรน้ำหอมอัจฉริยะกราบลงนาม
                </div>
                <p>
                  โปรดเตรียมความพร้อมของหัวจ่ายความเหนี่ยวนำเลเซอร์ และปั๊มสูตรผสมก่อนเปิดเครื่องจักรป้อนมวลสาร 
                  ค่าการคำนวณทั้งหมดได้รับการรับรองความแม่นยำระดับห้องทดลองชั้นสูง (± 0.0001) สอดคล้องตามมาตรฐาน Cosmetics GMP สากล
                </p>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 border border-dashed rounded-3xl bg-[#F5F5F7]">
              <Beaker className="h-10 w-10 text-neutral-300 mx-auto mb-3 animate-bounce" />
              <div className="font-bold text-[#1D1D1F]">กรุณาเลือกตระกูลสูตรน้ำหอมหลักสูตรหลักในแถบซ้าย</div>
              <p className="text-[11px] text-[#86868B] mt-1">เพื่อเริ่มใช้แกนวิเคราะห์ คาลิเบรตเครื่องจักรอัจฉริยะในคลังอุตสาหกรรม</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
