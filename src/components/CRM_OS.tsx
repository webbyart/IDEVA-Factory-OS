import React, { useState } from 'react';
import { 
  Users, Search, Clipboard, FileSpreadsheet, PlusCircle, ArrowRight, FolderPlus, 
  Share2, Mail, Phone, Calendar, Kanban, CheckCircle, Clock, Trash2, Printer
} from 'lucide-react';

interface CRM_OSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function CRM_OS({ dbState, onRefresh, onNotify, userRole }: CRM_OSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'crm' | 'customer' | 'job' | 'sku'>('crm');
  const [customerSearch, setCustomerSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  
  // Pipeline Leads
  const [leads, setLeads] = useState([
    { id: 'lead-1', company: 'Flora Cosmetic Paris', contact: 'Clarissa Fontaine', value: 850000, stage: 'Discussion', date: '2026-06-08', phone: '+33 655 0192', productType: 'Collagen Day Cream' },
    { id: 'lead-2', company: 'Mist & Glaze Bangkok', contact: 'คุณ วิภาวรรณ พัฒนาการ', value: 420000, stage: 'Proposal Sent', date: '2026-06-07', phone: '081-445-1200', productType: 'Hydrating Tone Mist' },
    { id: 'lead-3', company: 'Nirvana Organics Inc.', contact: 'David Miller', value: 1200000, stage: 'Negotiation', date: '2026-06-05', phone: '+1 405 992 1010', productType: 'Premium Oud Diffuser' }
  ]);

  // Customer List with Auto Code Generation
  const [customers, setCustomers] = useState([
    { id: 'cust-1', name: 'Flora Cosmetic Paris', code: 'CUS-2026-001', address: 'Rue de la Paix, Paris', email: 'orders@floracosp.fr', folderName: 'Drive/Customers/CUS-2026-001_Flora_Cosmetics' },
    { id: 'cust-2', name: 'Mist & Glaze Bangkok', code: 'CUS-2026-002', address: 'สุขุมวิท 23 กรุงเทพฯ', email: 'sales@mistglaze.co.th', folderName: 'Drive/Customers/CUS-2026-002_Mist_Glaze' },
    { id: 'cust-3', name: 'Nirvana Organics Inc.', code: 'CUS-2026-003', address: 'Broadway NYC, USA', email: 'wholesale@nirvanaorg.com', folderName: 'Drive/Customers/CUS-2026-003_Nirvana_Organics' }
  ]);

  // Products SKUs Catalog
  const [skus, setSkus] = useState([
    { id: 'prod-001', name: 'Rose-Au-Gold Serum Premium', code: 'SKU-ROSE-50', minOrder: 1000, costEstimate: 145, activeIngredients: 'Gold Dust, Damascena Rose Oil, Niacinamide' },
    { id: 'prod-002', name: 'Centella Balancing Skin Toner', code: 'SKU-TONE-100', minOrder: 2000, costEstimate: 85, activeIngredients: 'Centella Extract, Glycerin, Water Phase 80%' }
  ]);

  // Jobs/Production Orders
  const [jobs, setJobs] = useState([
    { id: 'job-05002', jobCode: '#05002', customerName: 'Flora Cosmetic Paris', productName: 'Rose-Au-Gold Serum Premium', qty: 1000, status: 'Active', driveLink: 'https://drive.google.com/drive/folders/1oSSFJqg2HT9o_yOH-iePcbpnsNzqFdaA', date: '2026-06-08' }
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
      folderName: folder
    };

    setCustomers(prev => [...prev, newCust]);
    onNotify(`[SUCCESS] อนุมัติสร้างบัญชีรหัสพันธมิตรใหม่ ${autoCode} พร้อมเปิดลิ้งค์ Google Drive ลูกค้าโดยอัตโนมัติแล้ว!`, 'info');
    setNewCustName('');
    setNewCustEmail('');
  };

  const handleStageChange = (id: string, nextStage: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: nextStage } : l));
    onNotify(`เลื่อนสิทธิ์ไปสถานะ: ${nextStage}`, 'info');
  };

  const exportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeSubTab === 'crm') {
      csvContent += "Company,Contact,Estimated Value,Stage,Created Date,Phone,Target SKU\n";
      leads.forEach(l => {
        csvContent += `"${l.company}","${l.contact}",${l.value},"${l.stage}","${l.date}","${l.phone}","${l.productType}"\n`;
      });
    } else {
      csvContent += "Customer Code,Partner Name,Office Email,Linked cloud Folder Path\n";
      customers.forEach(c => {
        csvContent += `"${c.code}","${c.name}","${c.email}","${c.folderName}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IDEVA_${activeSubTab.toUpperCase()}_Registry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('ดาวน์โหลด Excel แฟนทะเบียนพันธมิตรเสร็จเรียบร้อย', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="crm-module-root">
      
      {/* Tab Selectors */}
      <div className="flex bg-slate-950 text-white p-1 rounded-2xl max-w-xl shadow-md border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('crm')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${activeSubTab === 'crm' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Kanban className="h-4 w-4" /> 📊 หลอดดีล CRM Pipeline
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('customer')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${activeSubTab === 'customer' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Users className="h-4 w-4" /> 👥 ลูกค้า & ทุนคลาวด์ Drive
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('sku')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${activeSubTab === 'sku' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Clipboard className="h-4 w-4" /> 📦 แฟ้มผลิตภัณฑ์ SKU
        </button>
      </div>

      {activeSubTab === 'crm' && (
        <div className="space-y-6">
          {/* Odoo Style CRM Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Discussion Stage */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-xl">
                <span className="font-bold text-xs text-slate-700">1. ติดต่อเจรจา (In Discussion)</span>
                <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{leads.filter(l=>l.stage === 'Discussion').length}</span>
              </div>
              <div className="space-y-2">
                {leads.filter(l=>l.stage === 'Discussion').map(lead=> (
                  <div key={lead.id} className="bg-white p-4 border rounded-xl shadow-xs space-y-2 text-xs">
                    <p className="font-bold text-slate-900">{lead.company}</p>
                    <p className="text-[#86868B] text-[11px]">{lead.productType}</p>
                    <p className="font-mono text-indigo-600 font-bold">฿{lead.value.toLocaleString()}</p>
                    <div className="flex gap-1 pt-2 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => handleStageChange(lead.id, 'Proposal Sent')}
                        className="w-full bg-[#0071E3] text-white py-1 rounded hover:bg-[#147ce5] text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        ส่งใบเสนอราคา <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposal Sent Stage */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-100">
                <span className="font-bold text-xs">2. เสนอราคาเสร็จ (Proposal Sent)</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{leads.filter(l=>l.stage === 'Proposal Sent').length}</span>
              </div>
              <div className="space-y-2">
                {leads.filter(l=>l.stage === 'Proposal Sent').map(lead=> (
                  <div key={lead.id} className="bg-white p-4 border rounded-xl shadow-xs space-y-2 text-xs">
                    <p className="font-bold text-slate-900">{lead.company}</p>
                    <p className="text-[#86868B] text-[11px]">{lead.productType}</p>
                    <p className="font-mono text-indigo-600 font-bold">฿{lead.value.toLocaleString()}</p>
                    <div className="flex gap-1 pt-2 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => handleStageChange(lead.id, 'Negotiation')}
                        className="w-full bg-yellow-500 text-slate-950 py-1 rounded hover:bg-yellow-600 text-[10px] font-bold flex items-center justify-center gap-1"
                      >
                        ต่อรองค่าใช้จ่าย <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Negotiation Stage */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center bg-green-50 text-green-900 p-2.5 rounded-xl border border-green-100">
                <span className="font-bold text-xs">3. ต่อพิจารณา (Negotiation)</span>
                <span className="bg-green-150 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{leads.filter(l=>l.stage === 'Negotiation').length}</span>
              </div>
              <div className="space-y-2">
                {leads.filter(l=>l.stage === 'Negotiation').map(lead=> (
                  <div key={lead.id} className="bg-white p-4 border rounded-xl shadow-xs space-y-2 text-xs">
                    <p className="font-bold text-slate-900">{lead.company}</p>
                    <p className="text-[#86868B] text-[11px]">{lead.productType}</p>
                    <p className="font-mono text-indigo-600 font-bold">฿{lead.value.toLocaleString()}</p>
                    <div className="flex gap-1 pt-2 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={async () => {
                          // 1. Change stage locally so that this customer lead disappears from the active columns
                          handleStageChange(lead.id, 'Contract Approved');

                          // 2. Map the productType keyword to a corresponding system productId & formulaId
                          const pType = lead.productType.toLowerCase();
                          let productId = 'prod-001'; // Default: Chérie Rose EDP
                          if (pType.includes('rose')) {
                            productId = 'prod-001';
                          } else if (pType.includes('oud') || pType.includes('diffuser')) {
                            productId = 'prod-002';
                          } else if (pType.includes('citrus') || pType.includes('mist')) {
                            productId = 'prod-003';
                          } else if (pType.includes('jasmine')) {
                            productId = 'prod-004';
                          }

                          const relatedFormula = dbState.formulas?.find((f: any) => f.productId === productId);
                          const formulaId = relatedFormula ? relatedFormula.id : 'form-001';

                          // 3. Create a unique job ID and code
                          const newJobId = `job-${Date.now()}`;
                          const jobCode = `#${String(5000 + (dbState.salesJobs?.length || 0) + 1).slice(-5)}`;
                          
                          // Prepare a GMP-aligned salesJob payload
                          const jobPayload = {
                            id: newJobId,
                            jobCode: jobCode,
                            customerId: 'cust-3', // Default connected customer
                            customerCode: 'CUS-2026-003',
                            productId: productId,
                            formulaId: formulaId,
                            quantityRequested: 1000,
                            driveLink: `https://drive.google.com/drive/folders/1oSSFJqg2HT9o_yOH-iePcbpnsNzqFdaA?usp=sharing&customer=CUS&job=${jobCode}`,
                            status: 'Pending Planning',
                            createdAt: new Date().toISOString().split('T')[0]
                          };

                          // Prepare alert notification for the Material Requisition (เบิกวัตถุดิบ) department
                          const notifPayload = {
                            id: `notif-${Date.now()}`,
                            message: `🚨 [อนุมัติสัญญาสั่งผลิต] แจ้งเตือนฝ่ายเบิกวัตถุดิบ: กรุณาเตรียมจัดคิว ชั่งชอน และจ่ายสารเคมีสำหรับ Job ${jobCode} ของลูกค้า ${lead.company} (สูตร ${lead.productType}) จำนวน 1,000 ชิ้น`,
                            severity: 'warning',
                            createdAt: new Date().toISOString()
                          };

                          // Prepare audit log for ISO trace tracking
                          const logPayload = {
                            id: `log-crm-${Date.now()}`,
                            user: userRole || 'CRM Sales Coordinator',
                            role: 'Sales',
                            action: `อนุมัติปิดสัญญาสั่งผลิตของลูกค้า ${lead.company} (${lead.productType}) ยอดสัญญา ฿${lead.value.toLocaleString()} และส่งเรื่องอัตโนมัติแจ้งเตือนฝ่ายเบิกวัตถุดิบ`,
                            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                            module: 'System'
                          };

                          // Prepare automatic Manufacturing Order (MO)
                          const moPayload = {
                            id: `mo-${Date.now().toString().slice(-4)}`,
                            productId: productId,
                            formulaId: formulaId,
                            quantityRequested: 1000,
                            quantityProduced: 0,
                            startDate: new Date().toISOString().split('T')[0],
                            status: 'Created'
                          };

                          try {
                            // Call API to create Sales Job
                            await fetch('/api/generic/create', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ table: 'salesJobs', item: jobPayload })
                            });

                            // Call API to create notification
                            await fetch('/api/generic/create', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ table: 'notifications', item: notifPayload })
                            });

                            // Call API to create Audit Log
                            await fetch('/api/generic/create', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ table: 'auditLogs', item: logPayload })
                            });

                            // Call API to create Manufacturing Order
                            await fetch('/api/generic/create', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ table: 'manufacturingOrders', item: moPayload })
                            });

                            onNotify(`🎉 ปิดดีลสำเร็จกับ ${lead.company}! ระบบนำเข้าใบสั่งผลิต ${jobCode} และแจ้งเตือนฝ่ายเบิกวัตถุดิบแล้ว`, 'info');
                            onRefresh();
                          } catch (err) {
                            onNotify('ระบบภายนอกขัดข้อง ไม่สามารถสร้างใบเบิกได้โดยอัตโนมัติ', 'error');
                          }
                        }}
                        className="w-full bg-green-600 text-white py-1 rounded hover:bg-green-700 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        อนุมัติทำสัญญาสั่งผลิต ✓
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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm">แฟ้มทะเบียนผู้ประกอบการ & แหล่งข้อมูลคลาวด์ไดรฟ์ (Partners & Automatic Cloud Folders)</h4>
            <button onClick={exportExcel} type="button" className="p-1 px-3 bg-green-600 text-white text-[11px] font-bold rounded-lg hover:bg-green-750">
              Excel
            </button>
          </div>

          <form onSubmit={handleCreateCustomer} className="bg-slate-5 border border-slate-250 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3 items-end text-xs text-slate-705">
            <div>
              <label className="font-bold block mb-1">ชื่อสระบริษัทพันธมิตรผู้ว่าจ้าง</label>
              <input
                type="text"
                placeholder="เช่น Flora Beauty, Mist & Cream"
                className="w-full bg-white border border-slate-200 p-2 rounded outline-none"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="font-bold block mb-1">อีเมลติดต่อประสานงานหลัก</label>
              <input
                type="email"
                placeholder="sales@company.com"
                className="w-full bg-white border border-slate-200 p-2 rounded outline-none"
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2.5 rounded font-bold hover:bg-green-700 transition"
              >
                อนุมัติเพิ่มรหัส และสร้าง Drive อัตโนมัติ ✓
              </button>
            </div>
          </form>

          {/* Customer Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="p-3 w-12 text-center">No.</th>
                  <th className="p-3">รหัสระบบผู้ซื้อ (Customer Code)</th>
                  <th className="p-3">ชื่อพันธมิตรการค้า</th>
                  <th className="p-3">พิกัดอีเมลติดต่อด่วน</th>
                  <th className="p-3">พิกัดเซฟไฟล์หลัก (Drive Folder Path)</th>
                  <th className="p-3 text-center">สิทธิ์อัพเดตไดรฟ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {customers.map((cust, idx) => (
                  <tr key={cust.id} className="hover:bg-slate-50">
                    <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-zinc-900">{cust.code}</td>
                    <td className="p-3 font-bold">{cust.name}</td>
                    <td className="p-3 font-mono">{cust.email}</td>
                    <td className="p-3 text-indigo-600 font-mono text-[10px] underline cursor-pointer" onClick={() => onNotify(`เปิดโฟลเดอร์เก็บบัญชีของลูกค้าปฐม: ${cust.folderName}`, 'info')}>
                      {cust.folderName}
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        type="button" 
                        onClick={() => onNotify(`เชื่อมระบบความเร็วสูง Google Drive ไดเรกทอรีของ ${cust.name}`, 'info')} 
                        className="p-1 px-3.5 bg-[#0071E3] hover:bg-[#147ce5] text-white text-[10px] font-bold rounded-lg"
                      >
                        Sync Drive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {activeSubTab === 'sku' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm">สารบบผลิตภัณฑ์ / การตีราคาประเมิน (Cosmetics Master SKUs Catalog)</h4>
            <button onClick={() => onNotify('สลัก SKU หมวดทดลองเสร็จสิ้น', 'info')} className="p-1 px-3 bg-[#0071E3] text-white text-[11px] font-bold rounded">
              เพิ่ม SKU สินค้าใหม่ +
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skus.map(sku => (
              <div key={sku.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs select-none">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="bg-indigo-100 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded text-[10px] select-all">{sku.code}</span>
                  <span className="font-mono text-slate-400">Order Minimum: {sku.minOrder} Units</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{sku.name}</h4>
                  <p className="text-slate-500 text-[11px] mt-1">ส่วนผสมสกัดหลัก: {sku.activeIngredients}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-150">
                  <span className="font-bold text-slate-600">ประมาณการผลิตทุนคงเคมี:</span>
                  <span className="font-mono font-bold text-red-600 text-sm">฿{sku.costEstimate} / ชิ้น</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
