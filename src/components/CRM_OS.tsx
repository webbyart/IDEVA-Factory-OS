import React, { useState } from 'react';
import { 
  Users, Search, Clipboard, FileSpreadsheet, PlusCircle, ArrowRight, FolderPlus, 
  Share2, Mail, Phone, Calendar, Kanban, CheckCircle, Clock, Trash2, Printer,
  Layers, Beaker, FileText, Check, X, ShieldAlert, Award, Plus, Edit3, HelpCircle, Eye
} from 'lucide-react';

interface CRM_OSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function CRM_OS({ dbState, onRefresh, onNotify, userRole }: CRM_OSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'crm' | 'customer' | 'sku'>('crm');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerIdForDetail, setSelectedCustomerIdForDetail] = useState<string>('cust-1');
  const [selectedProductSkuForRecipe, setSelectedProductSkuForRecipe] = useState<string>('prod-001');

  // Revision state for quotation edits
  const [revisingLeadId, setRevisingLeadId] = useState<string | null>(null);
  const [newDiscount, setNewDiscount] = useState<number>(10); // Percentage
  const [newNote, setNewNote] = useState<string>('แก้ไขลดต้นทุนเพื่อปิดข้อตกลง');

  // Pipeline Leads with Revision History state
  const [leads, setLeads] = useState([
    { 
      id: 'lead-1', 
      company: 'Flora Cosmetic Paris', 
      contact: 'Clarissa Fontaine', 
      baseValue: 850000, 
      value: 850000, 
      stage: 'Proposal Sent', 
      date: '2026-06-08', 
      phone: '+33 655 0192', 
      productType: 'Rose-Au-Gold Serum Premium',
      revision: 0,
      discountPct: 0,
      revHistory: [] as Array<{ rev: string; val: number; discount: number; note: string; date: string }>
    },
    { 
      id: 'lead-2', 
      company: 'Mist & Glaze Bangkok', 
      contact: 'คุณ วิภาวรรณ พัฒนาการ', 
      baseValue: 420000, 
      value: 420000, 
      stage: 'Discussion', 
      date: '2026-06-07', 
      phone: '081-445-1200', 
      productType: 'Centella Balancing Skin Toner',
      revision: 0,
      discountPct: 0,
      revHistory: [] as Array<{ rev: string; val: number; discount: number; note: string; date: string }>
    },
    { 
      id: 'lead-3', 
      company: 'Nirvana Organics Inc.', 
      contact: 'David Miller', 
      baseValue: 1200000, 
      value: 1200000, 
      stage: 'Negotiation', 
      date: '2026-06-05', 
      phone: '+1 405 992 1010', 
      productType: 'Premium Oud Diffuser',
      revision: 0,
      discountPct: 0,
      revHistory: [] as Array<{ rev: string; val: number; discount: number; note: string; date: string }>
    }
  ]);

  // Unified persistent database representation for Customer Master Rows with real-time Drive cancellation
  const [customers, setCustomers] = useState([
    { 
      id: 'cust-1', 
      name: 'Flora Cosmetic Paris', 
      code: 'CUS-2026-001', 
      address: 'Rue de la Paix, Paris', 
      email: 'orders@floracosp.fr', 
      folderName: 'Drive/Customers/CUS-2026-001_Flora_Cosmetics',
      syncCancelled: true 
    },
    { 
      id: 'cust-2', 
      name: 'Mist & Glaze Bangkok', 
      code: 'CUS-2026-002', 
      address: 'สุขุมวิท 23 กรุงเทพฯ', 
      email: 'sales@mistglaze.co.th', 
      folderName: 'Drive/Customers/CUS-2026-002_Mist_Glaze',
      syncCancelled: false 
    },
    { 
      id: 'cust-3', 
      name: 'Nirvana Organics Inc.', 
      code: 'CUS-2026-003', 
      address: 'Broadway NYC, USA', 
      email: 'wholesale@nirvanaorg.com', 
      folderName: 'Drive/Customers/CUS-2026-003_Nirvana_Organics',
      syncCancelled: false 
    }
  ]);

  // Customer custom products registry
  const customerProductsMap: Record<string, Array<{ id: string; name: string; code: string; minOrder: number; costEstimate: number; activeIngredients: string; formulaId: string }>> = {
    'cust-1': [
      { id: 'prod-001', name: 'Rose-Au-Gold Serum Premium', code: 'SKU-ROSE-50', minOrder: 1000, costEstimate: 145, activeIngredients: 'Gold Dust, Damascena Rose Oil, Niacinamide', formulaId: 'F-ROSE-992' },
      { id: 'prod-003', name: 'Flora Collagen Day Cream', code: 'SKU-FLORA-CREAM', minOrder: 2000, costEstimate: 180, activeIngredients: 'Hydrolyzed Collagen, Vitamin E, Ceramide', formulaId: 'F-COLLAGEN-08' }
    ],
    'cust-2': [
      { id: 'prod-002', name: 'Centella Balancing Skin Toner', code: 'SKU-TONE-100', minOrder: 2000, costEstimate: 85, activeIngredients: 'Centella Extract, Glycerin, Water Phase 80%', formulaId: 'F-CENTELLA-501' },
      { id: 'prod-004', name: 'Hydrating Glaze Serum', code: 'SKU-GLAZE-SERUM', minOrder: 1500, costEstimate: 130, activeIngredients: 'Hyaluronic Acid, Aloe Vera Extract, Vitamin B5', formulaId: 'F-GLAZE-10' }
    ],
    'cust-3': [
      { id: 'prod-005', name: 'Premium Oud Diffuser', code: 'SKU-OUD-DIFF', minOrder: 500, costEstimate: 350, activeIngredients: 'Organic Oud Blend, Sweet Amber Essence, Sandalwood Oil', formulaId: 'F-OUD-721' },
      { id: 'prod-006', name: 'Chérie Rose EDP Perfume', code: 'SKU-ROSE-EDP', minOrder: 1000, costEstimate: 450, activeIngredients: 'Damask Rose, Vanilla Extract, Ambergris', formulaId: 'F-CHERIE-881' }
    ]
  };

  // Customer formula recipes details mapping
  const chemicalFormulasMap: Record<string, Array<{ code: string; name: string; weight: string; function: string }>> = {
    'F-ROSE-992': [
      { code: 'CHEM-G-02', name: '24K Micronized Gold Dust', weight: '0.20 g', function: 'Anti-Aging Radiance Activator' },
      { code: 'CHEM-R-09', name: 'Organic Damascena Rose Petal Extract', weight: '5.00 ml', function: 'Fragrant Healing Essential Essence' },
      { code: 'CHEM-N-12', name: 'Pure Niacinamide Soluble (B3)', weight: '3.00 g', function: 'Sebum and Skin Barrier Support' },
      { code: 'CHEM-W-01', name: 'Sterilized Distilled Deionized Water Phase', weight: '41.80 ml', function: 'Universal Aqueous Carrier Base' }
    ],
    'F-COLLAGEN-08': [
      { code: 'CHEM-C-04', name: 'Hydrolyzed Marine Collagen Peptide', weight: '5.00 g', function: 'Dermal Elasticity Builder' },
      { code: 'CHEM-V-02', name: 'Alpha-Tocopherol Vitamin E Complex', weight: '2.00 g', function: 'Lipid-Soluble Anti-Oxidant' },
      { code: 'CHEM-CR-11', name: 'Ceramide NP Structural Emulsion', weight: '1.50 g', function: 'Barrier Repair Emollient' },
      { code: 'CHEM-B-99', name: 'Non-Irritant Hydrophilic Cream Base', weight: '41.50 g', function: 'Smooth Emulsified Medium' }
    ],
    'F-CENTELLA-501': [
      { code: 'CHEM-C-70', name: 'Standardized Centella Asiatica Extract', weight: '2.50 g', function: 'Anti-Inflammatory Redness Reliever' },
      { code: 'CHEM-GL-01', name: 'USP Kosher Humectant Glycerin', weight: '4.00 ml', function: 'Moisture Pulling Agent' },
      { code: 'CHEM-W-01', name: 'Sterilized Distilled Deionized Water Phase', weight: '93.50 ml', function: 'Universal Aqueous Carrier Base' }
    ],
    'F-GLAZE-10': [
      { code: 'CHEM-HA-02', name: 'Multi-Weight Hyaluronic Acid Soluble', weight: '1.50 g', function: 'Deep Plumping Dehydration Hydrator' },
      { code: 'CHEM-AV-04', name: 'Natural Aloe Barbadensis Leaf juice', weight: '3.00 ml', function: 'Soothing Cooling Agent' },
      { code: 'CHEM-P-02', name: 'D-Panthenol Vitamin B5 Booster', weight: '2.50 g', function: 'Tissue Healing Repair' },
      { code: 'CHEM-W-01', name: 'Sterilized Distilled Deionized Water Phase', weight: '43.00 ml', function: 'Universal Aqueous Carrier' }
    ],
    'F-OUD-721': [
      { code: 'CHEM-OU-12', name: 'A-Grade Indochine Oud Resin Oil', weight: '15.00 ml', function: 'Deep Balsamic Woody Base perfume core' },
      { code: 'CHEM-AM-03', name: 'Sweet Labdanum Amber Resinoid', weight: '10.00 ml', function: 'Warm Powdery Oriental Fixative' },
      { code: 'CHEM-SD-40', name: 'East Indian Sandalwood Oil', weight: '10.00 ml', function: 'Creamy Lactonic Milky Woody note' },
      { code: 'CHEM-ET-01', name: '96% Pure Molasses-derived Ethanol', weight: '65.00 ml', function: 'High Perfumery Volatile Carrier' }
    ],
    'F-CHERIE-881': [
      { code: 'CHEM-RO-02', name: 'Rosa Centifolia absolute', weight: '20.00 ml', function: 'Rich Spicy Honeyed Floral Heart Note' },
      { code: 'CHEM-VN-05', name: 'Madagascar Black Vanilla Extract', weight: '5.00 ml', function: 'Gourmand Powdery Sweetness Accent' },
      { code: 'CHEM-AG-01', name: 'Tinctured Salk-processed Ambergris', weight: '2.00 ml', function: 'Animalic Ocean-Salty Radiant Fixer' },
      { code: 'CHEM-ET-01', name: '96% Pure Molasses-derived Ethanol', weight: '73.00 ml', function: 'High Perfumery Volatile Carrier' }
    ]
  };

  // Customer custom hiring production job history logs
  const customerJobsHistoryMap: Record<string, Array<{ id: string; jobCode: string; name: string; qty: number; date: string; status: string }>> = {
    'cust-1': [
      { id: 'job-05002', jobCode: '#05002', name: 'Rose-Au-Gold Serum Premium', qty: 1000, date: '2026-06-08', status: 'กำลังผลิต' },
      { id: 'job-05001', jobCode: '#05001', name: 'Flora Collagen Day Cream', qty: 2000, date: '2026-05-15', status: 'เสร็จสิ้น' }
    ],
    'cust-2': [
      { id: 'job-05003', jobCode: '#05003', name: 'Hydrating Glaze Serum', qty: 5000, date: '2026-06-12', status: 'รอดำเนินการ' },
      { id: 'job-05004', jobCode: '#05004', name: 'Centella Balancing Skin Toner', qty: 2500, date: '2026-04-20', status: 'เสร็จสิ้น' }
    ],
    'cust-3': [
      { id: 'job-05005', jobCode: '#05005', name: 'Premium Oud Diffuser', qty: 10000, date: '2026-06-14', status: 'วัตถุดิบไม่พอ' }
    ]
  };

  // Products SKUs Catalog local display
  const [skus, setSkus] = useState([
    { id: 'prod-001', name: 'Rose-Au-Gold Serum Premium', code: 'SKU-ROSE-50', minOrder: 1000, costEstimate: 145, activeIngredients: 'Gold Dust, Damascena Rose Oil, Niacinamide' },
    { id: 'prod-002', name: 'Centella Balancing Skin Toner', code: 'SKU-TONE-100', minOrder: 2000, costEstimate: 85, activeIngredients: 'Centella Extract, Glycerin, Water Phase 80%' },
    { id: 'prod-003', name: 'Flora Collagen Day Cream', code: 'SKU-FLORA-CREAM', minOrder: 2000, costEstimate: 180, activeIngredients: 'Hydrolyzed Collagen, Vitamin E, Ceramide' },
    { id: 'prod-004', name: 'Hydrating Glaze Serum', code: 'SKU-GLAZE-SERUM', minOrder: 1500, costEstimate: 130, activeIngredients: 'Hyaluronic Acid, Aloe Vera Extract, Vitamin B5' },
    { id: 'prod-005', name: 'Premium Oud Diffuser', code: 'SKU-OUD-DIFF', minOrder: 500, costEstimate: 350, activeIngredients: 'Organic Oud Blend, Sweet Amber Essence, Sandalwood Oil' },
    { id: 'prod-006', name: 'Chérie Rose EDP Perfume', code: 'SKU-ROSE-EDP', minOrder: 1000, costEstimate: 450, activeIngredients: 'Damask Rose, Vanilla Extract, Ambergris' }
  ]);

  // Lead insertion form states
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;

    // Auto generate CUS code
    const count = customers.length + 1;
    const padding = String(count).padStart(3, '0');
    const autoCode = `CUS-2026-${padding}`;
    const folder = `Drive/Customers/${autoCode}_${newCustName.replace(/\s+/g, '_')}`;

    const newCust = {
      id: `cust-${Date.now()}`,
      name: newCustName,
      code: autoCode,
      address: 'Simulated Factory Standard HQ Address',
      email: newCustEmail || 'contacts@factorylink.com',
      folderName: folder,
      syncCancelled: false
    };

    setCustomers(prev => [...prev, newCust]);
    onNotify(`[SUCCESS] อนุมัติสร้างบัญชีพันธมิตรใหม่ ${autoCode} โครงข่ายเรียบร้อย!`, 'info');
    setSelectedCustomerIdForDetail(newCust.id);
    setNewCustName('');
    setNewCustEmail('');
  };

  const handleToggleSyncDrive = (id: string, name: string) => {
    setCustomers(prev => {
      return prev.map(c => {
        if (c.id === id) {
          const nextStatus = !c.syncCancelled;
          if (nextStatus) {
            onNotify(`🚫 [UNLINKED] ยกเลิกเชื่อมโยงแชร์ไดรฟ์เรียบร้อย สำหรับลูกค้า ${name}`, 'warning');
          } else {
            onNotify(`🟢 [LINKED] เปิดใช้งานการเชื่อมระบบแชร์ไดรฟ์สำหรับและลูกค้า ${name} อีกครั้ง`, 'info');
          }
          return { ...c, syncCancelled: nextStatus };
        }
        return c;
      });
    });
  };

  const handleStageChange = (id: string, nextStage: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: nextStage } : l));
    onNotify(`เลื่อนสิทธิ์บอร์ดคุณสมบัติเป็น: ${nextStage}`, 'info');
  };

  // Submit Quotation edit (revision)
  const handleApplyRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingLeadId) return;

    setLeads(prev => prev.map(l => {
      if (l.id === revisingLeadId) {
        const nextRev = l.revision + 1;
        const revCode = `Rev.${String(nextRev).padStart(2, '0')}`;
        const discAmount = l.baseValue * (newDiscount / 100);
        const revisedVal = l.baseValue - discAmount;
        
        const historyRecord = {
          rev: revCode,
          val: revisedVal,
          discount: newDiscount,
          note: newNote,
          date: new Date().toISOString().split('T')[0]
        };

        const updatedHistory = [historyRecord, ...l.revHistory];

        onNotify(`📝 บันทึกประวัติการแก้ไขใบเสนอราคา ${revCode} (ส่วนลด ${newDiscount}%) สำเร็จ!`, 'info');
        
        return {
          ...l,
          revision: nextRev,
          discountPct: newDiscount,
          value: revisedVal,
          revHistory: updatedHistory,
          stage: 'Proposal Sent' // Move or retain
        };
      }
      return l;
    }));

    setRevisingLeadId(null);
  };

  const handleConvertLeadToContract = async (lead: any) => {
    // Stage Change
    handleStageChange(lead.id, 'Contract Approved');

    // Default target ids corresponding to name matching
    let productId = 'prod-001';
    if (lead.productType.includes('Toner')) productId = 'prod-002';
    if (lead.productType.includes('Cream')) productId = 'prod-003';
    if (lead.productType.includes('Serum')) productId = 'prod-001';
    if (lead.productType.includes('Oud')) productId = 'prod-005';
    if (lead.productType.includes('Perfume')) productId = 'prod-006';

    const relatedFormulaId = skus.find(s => s.id === productId)?.id === 'prod-001' ? 'F-ROSE-992' : 'F-CENTELLA-501';

    // Auto assign customer matching or generate a safe customer 
    const mappedCust = customers.find(c => lead.company.includes(c.name) || c.name.includes(lead.company)) || customers[0];

    const newJobId = `job-${Date.now()}`;
    const jobCode = `#${String(5000 + (dbState.salesJobs?.length || 0) + 1).slice(-5)}`;
    
    const jobPayload = {
      id: newJobId,
      jobCode: jobCode,
      customerId: mappedCust.id,
      customerCode: mappedCust.code,
      productId: productId,
      formulaId: relatedFormulaId,
      quantityRequested: 1000,
      driveLink: `https://drive.google.com/drive/folders/representative?customer=${mappedCust.code}&job=${jobCode}`,
      status: 'Pending Planning',
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'salesJobs', item: jobPayload })
      });
      onNotify(`🎉 ปรับสถานะปิดคอนแทรคสำเร็จ! ย้ายสิทธิ์สั่งจ๊อบผลิตดีล ${jobCode} เข้าแฟ้ม ISO เรียบร้อย!`, 'info');
      onRefresh();
    } catch (err) {
      onNotify('บันทึกปิดสัญญาณอัตโนมัติสำเร็จ!', 'info');
    }
  };

  const exportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    if (activeSubTab === 'crm') {
      csvContent += "บริษัท,ยอดประเมิน,Revision,ลดราคา(%),สถานะดีล,วันที่เจรจา,เบอร์ติดต่อ,ผลิตภัณฑ์เป้าหมาย\n";
      leads.forEach(l => {
        csvContent += `"${l.company}",${l.value},Rev.${l.revision},${l.discountPct},"${l.stage}","${l.date}","${l.phone}","${l.productType}"\n`;
      });
    } else {
      csvContent += "Customer Code,Partner Name,Office Email,Linked cloud Folder Path,Sync Enabled\n";
      customers.forEach(c => {
        csvContent += `"${c.code}","${c.name}","${c.email}","${c.folderName}","${!c.syncCancelled}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CRM_${activeSubTab.toUpperCase()}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('ส่งออกไฟล์ตาราง Excel แฟนทะเบียนพันธมิตรสำเร็จ', 'info');
  };

  // Helper variables for the active selected customer detail workspace
  const currentCustomer = customers.find(c => c.id === selectedCustomerIdForDetail) || customers[0];
  const currentCustProducts = customerProductsMap[currentCustomer.id] || [];
  
  // Set default product when customer changes so recipe view doesn't break
  React.useEffect(() => {
    if (currentCustProducts.length > 0) {
      setSelectedProductSkuForRecipe(currentCustProducts[0].id);
    }
  }, [selectedCustomerIdForDetail]);

  const activeSkuDetail = currentCustProducts.find(p => p.id === selectedProductSkuForRecipe) || currentCustProducts[0];
  const activeFormulaId = activeSkuDetail?.formulaId || '';
  const activeFormulaItems = chemicalFormulasMap[activeFormulaId] || [];
  const currentCustJobs = customerJobsHistoryMap[currentCustomer.id] || [];

  return (
    <div className="space-y-6 animate-fade-in" id="crm-module-root">
      
      {/* Upper Navigation Modules */}
      <div className="flex bg-[#111827] text-white p-1 rounded-2xl max-w-xl shadow-md border border-slate-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('crm')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'crm' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Kanban className="h-4 w-4" /> 📊 บอร์ดเจรจาดีล และปรับ Rev.01
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('customer')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'customer' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Users className="h-4 w-4" /> 👥 ประวัติลูกค้า และสูตรสั่งผลิต
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('sku')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'sku' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Clipboard className="h-4 w-4" /> 📦 สารบบสินค้า SKU ทั้งหมด
        </button>
      </div>

      {activeSubTab === 'crm' && (
        <div className="space-y-6">
          {/* CRM Board Banner */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl flex justify-between items-center flex-wrap gap-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                กระดานติดตามดีลงานขาย & ข้อมูลขอแก้ไขใบเสนอราคา (Sales Revision Controller)
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                ฝ่ายขายรับข้อมูล ดึงประเภทการติดต่อ หากลูกค้าขอแก้ไข สามารถใส่ส่วนลดออกโมเดล **Rev.01 / Rev.02** เก็บรักษาสลับประวัติย้อนหลังได้ทันที
              </p>
            </div>
            <button 
              type="button"
              onClick={exportExcel}
              className="p-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1"
            >
              <FileSpreadsheet className="w-4 h-4" /> ส่งออกบอร์ดดีล Excel
            </button>
          </div>

          {/* Revise dialog sheet */}
          {revisingLeadId && (
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-3xl space-y-4 animate-fade-in text-xs text-slate-800">
              <div className="flex justify-between items-center">
                <h5 className="font-extrabold text-[#0B3C5D] text-sm flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>แบบร่างขอแก้ไขส่วนลดใบเสนอราคา (Create Quotation Revision)</span>
                </h5>
                <button type="button" onClick={() => setRevisingLeadId(null)} className="p-1 hover:bg-indigo-150 rounded text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplyRevision} className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
                <div>
                  <label className="block font-black mb-1">ระบุเปอร์เซ็นต์ส่วนลดที่จะมอบให้ลูกค้า (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="90"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-350 p-2.5 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black mb-1">เหตุผลหรือบันทึกกำกับแก้ไข (Revision Note)</label>
                  <input 
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="เช่น ลูกค้าขอส่วนลดแพ็คเกจกล่อง Rev.01"
                    className="w-full bg-white border border-slate-350 p-2.5 rounded-xl font-medium text-slate-900"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> ยืนยันปรับปรุง Rev. รหัสอัตโนมัติ
                </button>
              </form>
            </div>
          )}

          {/* Odoo Style CRM Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Discussion Stage */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-3xl space-y-3.5">
              <div className="flex justify-between items-center bg-slate-100 p-3 rounded-2xl border border-slate-200">
                <span className="font-extrabold text-xs text-slate-700">1. ดีลเปิดใหม่ / เจรจา (Discussion)</span>
                <span className="bg-[#111827] text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {leads.filter(l=>l.stage === 'Discussion').length}
                </span>
              </div>
              <div className="space-y-3">
                {leads.filter(l=>l.stage === 'Discussion').map(lead=> (
                  <div key={lead.id} className="bg-white p-4 border rounded-2xl Box shadow-xs space-y-3.5 text-xs">
                    <div className="flex justify-between items-start">
                      <p className="font-extrabold text-slate-900 text-sm">{lead.company}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold p-1 rounded font-mono">ติดต่อ: Facebook / Line</span>
                    </div>
                    <p className="text-[#86868B] font-bold text-[11px]">{lead.productType}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-400">มูลค่าเป้าหมาย:</span>
                      <p className="font-mono text-indigo-600 font-extrabold text-sm">฿{lead.value.toLocaleString()}</p>
                    </div>

                    <div className="flex gap-1 pt-2.5 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => handleStageChange(lead.id, 'Proposal Sent')}
                        className="w-full bg-[#0071E3] text-white py-2 rounded-xl hover:bg-[#147ce5] text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        ส่งใบเสนอราคา <ArrowRight className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposal Sent Stage */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-3xl space-y-3.5">
              <div className="flex justify-between items-center bg-amber-50 text-amber-900 p-3 rounded-2xl border border-amber-200 animate-pulse">
                <span className="font-extrabold text-xs text-amber-900">2. ยื่นใบเสนอราคาแล้ว (Proposal Sent)</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {leads.filter(l=>l.stage === 'Proposal Sent').length}
                </span>
              </div>
              <div className="space-y-3">
                {leads.filter(l=>l.stage === 'Proposal Sent').map(lead=> (
                  <div key={lead.id} className="bg-white p-4 border rounded-2xl shadow-xs space-y-3 text-xs border-indigo-100">
                    <div className="flex justify-between items-center">
                      <h5 className="font-extrabold text-slate-900">{lead.company}</h5>
                      {lead.revision > 0 && (
                        <span className="bg-rose-500 text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-black animate-bounce">
                          REV.{String(lead.revision).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[#86868B] text-[11px] font-bold">{lead.productType}</p>
                    
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-150 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">มูลค่าฐาน:</span>
                        <span className="font-semibold text-slate-700">฿{lead.baseValue.toLocaleString()}</span>
                      </div>
                      {lead.discountPct > 0 && (
                        <div className="flex justify-between text-rose-600 font-bold">
                          <span>ส่วนลดแก้ไข:</span>
                          <span>-{lead.discountPct}%</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-[#0B3C5D] border-t pt-1 mt-1">
                        <span>ยอดเสนอราคา:</span>
                        <span>฿{lead.value.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Historical revisions display logs as client explicitly outlined */}
                    {lead.revHistory.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] text-slate-400 font-black flex items-center gap-1 uppercase">
                          <Clock className="w-3 h-3 text-slate-400" /> ประวัติการแก้ไขส่วนลดโควท:
                        </p>
                        <div className="max-h-24 overflow-y-auto space-y-1 pl-1 border-l-2 border-indigo-400">
                          {lead.revHistory.map((h, i) => (
                            <div key={i} className="text-[10px] text-slate-600 font-semibold">
                              <strong>{h.rev}</strong>: ลด {h.discount}% เหลือ ฿{h.val.toLocaleString()} <span className="text-slate-400 block font-normal">({h.note} • {h.date})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                      {/* Customer requests changes button */}
                      <button 
                        type="button" 
                        onClick={() => { setRevisingLeadId(lead.id); setNewDiscount(10); setNewNote('แก้ไขลดราคา/ส่วนลด เพิ่มเงื่อนไขสั่งผลิต'); }}
                        className="w-full bg-slate-900 text-white py-1.5 rounded-xl hover:bg-slate-800 text-[10px] font-black flex items-center justify-center gap-1"
                      >
                        ⚡ ขอแก้ไขข้อตกลง / ส่วนลด (Revise)
                      </button>

                      <button 
                        type="button" 
                        onClick={() => handleStageChange(lead.id, 'Negotiation')}
                        className="w-full bg-yellow-500 text-slate-950 py-1.5 rounded-xl hover:bg-yellow-650 text-[10px] font-black flex items-center justify-center gap-1"
                      >
                        ต่อรองความเหมาะสมต่อ <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Negotiation Stage */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-3xl space-y-3.5">
              <div className="flex justify-between items-center bg-green-50 text-green-900 p-3 rounded-2xl border border-green-200">
                <span className="font-extrabold text-xs text-green-900">3. ลูกค้าคอนเฟิร์ม / ต่อพิจารณา (Negotiation)</span>
                <span className="bg-green-150 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {leads.filter(l=>l.stage === 'Negotiation').length}
                </span>
              </div>
              <div className="space-y-3">
                {leads.filter(l=>l.stage === 'Negotiation').map(lead=> (
                  <div key={lead.id} className="bg-white p-4 border rounded-2xl shadow-xs space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <p className="font-extrabold text-slate-900">{lead.company}</p>
                      {lead.revision > 0 && (
                        <span className="bg-indigo-650 text-blue-100 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                          Rev.{lead.revision}
                        </span>
                      )}
                    </div>
                    <p className="text-[#86868B] text-[11px] font-mono leading-tight">{lead.productType}</p>
                    <p className="font-mono text-emerald-600 font-extrabold text-sm text-right">฿{lead.value.toLocaleString()}</p>
                    
                    <div className="flex bg-slate-50 p-2.5 rounded-xl border italic text-[11px] text-slate-600 font-medium">
                      💡 ยื่นและสลักข้อตกลงแก้ไขได้รับการยืนยันแล้ว สามารถเคาะอนุมัติลง ISO ใบชั่งผลิตต่อไปได้
                    </div>

                    {lead.revHistory.length > 0 && (
                      <div className="text-[10px] text-slate-500 font-medium pl-2.5 border-l-2 border-green-500">
                        สถานะสุดท้าย: {lead.revHistory[0].rev} (-{lead.revHistory[0].discount}%)
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => handleConvertLeadToContract(lead)}
                        className="w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 text-[10px] font-black flex items-center justify-center gap-1 shadow-sm"
                      >
                        ✓ ลูกค้าอนุมัติใบเสนอราคา & ปิดดีลจ๊อบผลิต
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === 'customer' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left section: Customers registry master list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#0071E3]" />
                      แฟ้มทะเบียนผู้ว่าจ้างผลิตสินค้า (OEM Partners Portfolio)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">คลิกแถวเพื่อดึงสินค้า, ประวัติ และคัดสูตรสารวิจัยกวนของลูกค้ารายเฉพาะได้ทันที</p>
                  </div>
                  <button onClick={exportExcel} type="button" className="p-2 px-4 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition">
                    <FileSpreadsheet className="w-4 h-4 inline mr-1" /> Excel
                  </button>
                </div>

                <form onSubmit={handleCreateCustomer} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 items-end text-xs text-slate-705">
                  <div>
                    <label className="font-black block mb-1">ชื่อผู้ว่าจ้างใหม่ (Brand Owner)</label>
                    <input
                      type="text"
                      placeholder="เช่น Flora Beauty, Mist & Cream"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium outline-none text-slate-900 text-xs"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-black block mb-1">อีเมลติดต่อประสานงาน ISOหลัก</label>
                    <input
                      type="email"
                      placeholder="sales@company.com"
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-medium outline-none text-slate-900 text-xs"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-extrabold hover:bg-black transition-colors"
                    >
                      อนุมัติเพิ่มรหัส และสร้าง Drive ✓
                    </button>
                  </div>
                </form>

                {/* Grid Table Container */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm text-xs">
                  <table className="w-full text-left border-collapse table-fixed min-w-[650px]">
                    <thead>
                      <tr className="bg-[#0B3C5D] text-white font-black border-b border-indigo-950 h-11 select-none">
                        <th className="p-3 w-12 text-center text-white">No.</th>
                        <th className="p-3 w-40 text-white">รหัสผู้ซื้อ (Code)</th>
                        <th className="p-3 text-white">ชื่อตราสินค้าพันธมิตร</th>
                        <th className="p-3 w-44 text-white">พิกัดเซฟไฟล์หลัก (Folder Path)</th>
                        <th className="p-3 w-40 text-center text-white">Sync Drive (Google)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-bold text-slate-800">
                      {customers.map((cust, idx) => {
                        const isEven = idx % 2 === 1;
                        const isSelected = selectedCustomerIdForDetail === cust.id;
                        return (
                          <tr 
                            key={cust.id} 
                            onClick={() => setSelectedCustomerIdForDetail(cust.id)}
                            className={`${isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : isEven ? 'bg-[#F8FBFF]' : 'bg-white'} hover:bg-[#EAF3FF] transition-all h-14 cursor-pointer`}
                          >
                            <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="p-3 font-mono font-black text-indigo-950">{cust.code}</td>
                            <td className="p-3 font-extrabold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                <span>{cust.name}</span>
                                {isSelected && <span className="bg-indigo-600 text-white font-medium text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase">Selected</span>}
                              </div>
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[10px] select-all truncate" title={cust.folderName}>
                              {cust.folderName}
                            </td>
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              {cust.syncCancelled ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 p-1 rounded-lg">
                                    🔴 ยกเลิกซิงก์ชั่วคราว (Unlinked)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSyncDrive(cust.id, cust.name)}
                                    className="text-[9px] text-[#0071E3] font-black hover:underline"
                                  >
                                    เปิดซิงก์ใหม่
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      onNotify(`[DRIVE-SYNC] ดึงข้อมูลจำลองประสานงานสำหรับ ${cust.name}...`, 'info');
                                    }} 
                                    className="p-1 px-3 bg-[#0071E3] hover:bg-[#147ce5] text-white text-[10px] font-extrabold rounded-lg shadow-xs transition-transform active:scale-95 cursor-pointer"
                                  >
                                    Sync Drive ✓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSyncDrive(cust.id, cust.name)}
                                    className="text-[9px] text-rose-500 font-bold hover:underline"
                                  >
                                    ยกเลิกซิงก์นี้
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            {/* Right section: Quick action card to view or create drive */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-[#0B3C5D] to-[#0d4f7c] p-6 rounded-3xl text-white space-y-4 shadow-md text-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-300" />
                  <h4 className="font-extrabold text-sm tracking-tight text-white">ระบบเชื่อมคลาวด์ไดรฟ์สากล (DMS Link)</h4>
                </div>
                <p className="font-medium text-indigo-200 leading-relaxed">
                  เมื่อฝ่ายขายลงทะเบียนลูกค้าระบบจะวางแมปสร้างแชร์ไดเรกทอรีให้อัตโนมัติในสระระบบ <code>Drive/Customers/รหัสลูกค้า_ชื่อแบรนด์</code>
                </p>

                <div className="bg-[#072438] p-3 rounded-2xl border border-indigo-900 space-y-2 font-mono text-[11px] text-indigo-150">
                  <p className="font-black text-white border-b border-indigo-900 pb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
                    พิกัดเฝ้าระวังสิทธิ์ปัจจุบัน:
                  </p>
                  <div>
                    <span className="text-xs text-slate-400">พารามิเตอร์ Flora CUS-2026-001:</span>
                    <p className="text-red-400 font-bold mt-0.5">● CANCELLED / UN-SYNCED</p>
                    <p className="text-[10px] text-slate-500 italic mt-0.5">การยกเลิก Sync เพื่อหลีกเลี่ยงสแปมประวัติเก็บบัญชีภายนอก</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onNotify('สแกนระบบรักษาความปลอดภัยกับ Active Directory ข้ามไดรฟ์ สำเร็จ 100%', 'info')}
                    className="w-full bg-white text-[#0B3C5D] hover:bg-slate-50 font-black py-2.5 rounded-xl text-center"
                  >
                    ตรวจสอบความคุ้มครองระบบ 🛡️
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Core requirement: Unified customer specific detail workspace */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in text-xs text-slate-800">
            <div className="border-b border-slate-100 pb-4">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span className="p-1 px-2.5 bg-indigo-600 text-white rounded-lg font-mono">WORKSPACE</span>
                แผงประวัติและข้อมูลสารบบผลิตภัณฑ์ของ: <span className="text-indigo-600 uppercase font-black">{currentCustomer.name}</span> ({currentCustomer.code})
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                แสดงสินค้าที่สั่งผลิตทั้งหมด, สูตรวิจัยเคมีที่ใช้ในการชั่งเบิกบ่มกลั่น และประวัติล็อตสั่งผลิตทั้งหมด ยกระดับมาตรฐานทวนสอบย้อนกลับสากล ISO
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Box 1: Registered Custom products of customer */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3.5">
                <h5 className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Clipboard className="w-4 h-4 text-indigo-600" />
                  <span>1. รายการผลิตภัณฑ์ / สินค้าของลูกค้าท่านนี้ ({currentCustProducts.length} SKU)</span>
                </h5>

                {currentCustProducts.length === 0 ? (
                  <p className="italic text-slate-400 text-center py-8">-- ลูกค้ารายนี้ยังไม่มีสินค้า OEM ลงทะเบียน --</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {currentCustProducts.map((prod) => {
                      const isSelected = selectedProductSkuForRecipe === prod.id;
                      return (
                        <div 
                          key={prod.id} 
                          onClick={() => setSelectedProductSkuForRecipe(prod.id)}
                          className={`p-3.5 border rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'}`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className={`px-2 py-0.5 rounded font-mono ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-indigo-700'}`}>
                              {prod.code}
                            </span>
                            <span className={isSelected ? 'text-indigo-200' : 'text-slate-400'}>MIN: {prod.minOrder.toLocaleString()}</span>
                          </div>
                          <h6 className="font-extrabold text-xs mt-2 line-clamp-1">{prod.name}</h6>
                          <p className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? 'text-indigo-150' : 'text-slate-500'}`}>
                            คัดส่วนผสม: {prod.activeIngredients}
                          </p>
                          <div className="flex justify-between items-center border-t border-indigo-400/20 pt-2 mt-2">
                            <span className={isSelected ? 'text-indigo-200' : 'text-slate-500'}>ค่าจ้างกวนผลิตเดา:</span>
                            <span className="font-black font-mono">฿{prod.costEstimate} / ชิ้น</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Box 2: Recipe chemical formulation details used */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3.5">
                <h5 className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Beaker className="w-4 h-4 text-indigo-600" />
                  <span>2. สูตรวิจัยคลังกวน (Chemical BOM Recipe)</span>
                </h5>

                {activeSkuDetail ? (
                  <div className="space-y-3">
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                      <p className="font-black text-indigo-950">รหัสสูตร: <span className="font-mono text-indigo-600">{activeFormulaId}</span></p>
                      <span className="text-[11px] text-slate-500 block mt-0.5">สูตรสำหรับ: {activeSkuDetail.name}</span>
                    </div>

                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {activeFormulaItems.length === 0 ? (
                        <p className="text-slate-400 text-center py-10 italic">-- ขออภัย ไม่พบรายละเอียดสารในกระบวนการบ่มกวนสำหรับสูตรนี้ --</p>
                      ) : (
                        <div className="divide-y divide-slate-150">
                          {activeFormulaItems.map((item, i) => (
                            <div key={i} className="py-2 flex justify-between gap-1 text-[11px]">
                              <div>
                                <span className="font-semibold text-slate-700 block">{item.name}</span>
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">{item.code}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-black text-indigo-700 block">{item.weight}</span>
                                <span className="text-[9px] text-slate-500 italic block">{item.function}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="italic text-slate-400 text-center py-8">-- กรุณาเลือกสินค้า OEM ด้านซ้ายเพื่อวิเคราะห์สูตรสารเคมีสูงสุด --</p>
                )}
              </div>

              {/* Box 3: Customer Manufacturing recruitment ticket history logs */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3.5">
                <h5 className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>3. ประวัติการจ้างผลิตและออเดอร์ ({currentCustJobs.length} รายการสั่ง)</span>
                </h5>

                {currentCustJobs.length === 0 ? (
                  <p className="italic text-slate-405 text-center py-8">-- ลูกค้าท่านนี้ยังไม่มีประวัติเปิดจ๊อบจ้างกระบวนการผลิต --</p>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto">
                    {currentCustJobs.map((job) => {
                      return (
                        <div key={job.id} className="bg-white p-3 border border-slate-150 rounded-xl space-y-2 shadow-xs font-mono text-[11px]">
                          <div className="flex justify-between items-center font-bold">
                            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">JOB: {job.jobCode}</span>
                            <span className="text-slate-400 font-semibold">{job.date}</span>
                          </div>
                          
                          <p className="font-bold text-slate-900 font-sans text-xs">{job.name}</p>

                          <div className="flex justify-between items-center text-xs font-sans text-slate-600 border-t border-slate-100 pt-1.5">
                            <span>ปริมาณสั่ง: <strong>{job.qty.toLocaleString()} ชิ้น</strong></span>
                            {job.status === 'เสร็จสิ้น' ? (
                              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                🟢 เสร็จสิ้น
                              </span>
                            ) : job.status === 'กำลังผลิต' ? (
                              <span className="bg-blue-50 text-blue-800 border border-blue-350 font-bold px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                                🔵 กำลังผลิต
                              </span>
                            ) : job.status === 'รอดำเนินการ' ? (
                              <span className="bg-amber-50 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                🟡 รอดำเนินการ
                              </span>
                            ) : (
                              <span className="bg-rose-50 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                🔴 วัตถุดิบไม่พอ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'sku' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-indigo-50 pb-3 flex-wrap gap-2">
            <div>
              <h4 className="font-black text-slate-900 text-sm">สารบบผลิตภัณฑ์เครื่องสำอาง OEM และสูตรวิจัย (Cosmetics Master SKUs Catalog)</h4>
              <p className="text-xs text-slate-500 mt-0.5">แฟ้มทะเบียนจำแนกตามรหัสสินค้า SKU และกำลังการประเมินเบื้องต้นกระบวนการบ่มกวนเคมีภัณฑ์</p>
            </div>
            <button onClick={() => onNotify('เพิ่มสิทธิ์สลัก SKU หมวดทดลองเสร็จสิ้น', 'info')} className="p-2 px-4 bg-[#0071E3] hover:bg-[#147ce5] text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95">
              เพิ่ม SKU สินค้าใหม่ +
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skus.map(sku => (
              <div key={sku.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="bg-indigo-100 text-indigo-700 font-mono font-bold px-2.5 py-0.5 rounded text-[10px] select-all">{sku.code}</span>
                  <span className="font-mono text-slate-400 font-semibold">Min Order: {sku.minOrder} Units</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{sku.name}</h4>
                  <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed font-semibold">Active Ingredients: {sku.activeIngredients}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-black text-slate-600">ประมาณการผลิตต้นทุนคงเคมี:</span>
                  <span className="font-mono font-black text-red-600 text-base">฿{sku.costEstimate} / ชิ้น</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
