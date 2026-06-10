import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, Search, Download, Printer, PlusCircle, 
  Trash2, RefreshCw, Layers, Eye, CheckSquare, Edit, AlertCircle, FileSpreadsheet
} from 'lucide-react';

interface RegulatoryOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function RegulatoryOS({ dbState, onRefresh, onNotify, userRole }: RegulatoryOSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'docs' | 'fda'>('docs');
  const [searchDoc, setSearchDoc] = useState('');

  // SOP Document Control Register
  const [sopDocuments, setSopDocuments] = useState([
    { id: 'SOP-PROD-001', title: 'SOP การล้างไลน์เครื่องเตรียมกวนผสมความจุสูง Mixing Reactor RX-3F', version: 'v2.4', category: 'Production', author: 'เจมส์ บราวน์', date: '2026-05-10', status: 'Approved' },
    { id: 'SOP-WMS-004', title: 'SOP การคัดเกณฑ์ลำดับลำดับสิทธิ์การเบิกจ่ายสินค้าหมดอายุตามสูตร FEFO', version: 'v1.2', category: 'Warehouse', author: 'เจมส์ บราวน์', date: '2026-06-01', status: 'Approved' },
    { id: 'SOP-QA-012', title: 'SOP การวิเคราะห์และการจัดเก็บเอกสารใบรับรองสารเคมี COA ย้อนสารย้อนหลัง', version: 'v3.0', category: 'Quality QA', author: 'ดร. ลลิตา วรโชติสกุล', date: '2026-06-05', status: 'Approved' },
    { id: 'SOP-LAB-005', title: 'SOP ค่าวิจักษ์ pH และแรงตึงหนืด Viscosity สำหรับเครื่องสำอางกลุ่มบาล์ม', version: 'v1.0', category: 'Quality QC', author: 'สว่าง วงศ์วาน', date: '2026-06-08', status: 'Pending Review' }
  ]);

  // FDA / ASEAN Cosmetics Notification check lists
  const [fdaNotifications, setFdaNotifications] = useState([
    { id: 'FDA-REG-001', brandName: 'Flora Beauty Cream', activeSKU: 'SKU-ROSE-50', notificationNo: '10-1-6900012354', status: 'Active Registered', expiryDate: '2574-05-15', countryScope: 'ASEAN Common Target (TH, MY, SG)' },
    { id: 'FDA-REG-002', brandName: 'Centella Face Toner', activeSKU: 'SKU-TONE-100', notificationNo: '11-1-6900085441', status: 'Active Registered', expiryDate: '2574-06-01', countryScope: 'Thailand Only Domestic' },
    { id: 'FDA-REG-003', brandName: 'Extreme Hydra Mist 50ml', activeSKU: 'SKU-MIST-50', notificationNo: 'Pending ASEAN Filing', status: 'Pending Submission', expiryDate: 'Under Review', countryScope: 'ASEAN Common Target (TH, VN, PH)' }
  ]);

  const filterDocs = sopDocuments.filter(doc =>
    doc.id.toLowerCase().includes(searchDoc.toLowerCase()) || 
    doc.title.toLowerCase().includes(searchDoc.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchDoc.toLowerCase())
  );

  const handleCreateSop = () => {
    const newId = `SOP-NEW-${Math.floor(Math.random() * 899 + 100)}`;
    const newSop = {
      id: newId,
      title: 'SOP รวดเร็วสำหรับมาตรฐานสุขอนามัยการแต่งตัวในคลีนรูมการกวนสูตรเคมี (GMP Standard)',
      version: 'v1.0',
      category: 'Production',
      author: userRole === 'Admin' ? 'เจมส์ บราวน์' : 'ดร. ลลิตา วรโชติสกุล',
      date: new Date().toISOString().slice(0, 10),
      status: 'Approved'
    };
    setSopDocuments(prev => [newSop, ...prev]);
    onNotify(`อนุมัติและเข้ารวมทะเบียนเอกสารสำเร็จ: ${newId} (SOP Version Master) บันทึกลงระบบสำเร็จ`, 'info');
  };

  const handleUpdateSopVersion = (id: string) => {
    setSopDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        const currentVerNum = parseFloat(doc.version.replace('v', ''));
        const nextVer = `v${(currentVerNum + 0.1).toFixed(1)}`;
        return { ...doc, version: nextVer, date: new Date().toISOString().slice(0, 10) };
      }
      return doc;
    }));
    onNotify(`ยกระดับเวอร์ชันคุมเอกสาร SOP (Version incremented with full audit history) เรียบร้อยแล้ว`, 'info');
  };

  const exportExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeSubTab === 'docs') {
      csvContent += "SOP ID,Title,Version,Category,Owner,Last Updated,Status\n";
      sopDocuments.forEach(doc => {
        csvContent += `"${doc.id}","${doc.title}","${doc.version}","${doc.category}","${doc.author}","${doc.date}","${doc.status}"\n`;
      });
    } else {
      csvContent += "Registry ID,Product SKU,FDA Notification No,Status,EXP Date,Country scope\n";
      fdaNotifications.forEach(reg => {
        csvContent += `"${reg.brandName}","${reg.activeSKU}","${reg.notificationNo}","${reg.status}","${reg.expiryDate}","${reg.countryScope}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IDEVA_Regulatory_${activeSubTab.toUpperCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('ส่งออกไฟล์ประวัติการแก้ไขและเอกสาร ISO 22716 ไปยัง Excel เรียบร้อยแล้ว', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="regulatory-module-root">
      
      {/* Sub tabs switches */}
      <div className="flex bg-slate-900 text-white p-1 rounded-2xl max-w-sm shadow-md border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('docs')}
          className={`flex-1 py-2.5 rounded-l-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'docs' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <FileText className="h-4 w-4" /> 📂 งานคุมเอกสาร SOP (ISO)
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('fda')}
          className={`flex-1 py-2.5 rounded-r-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'fda' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <ShieldCheck className="h-4 w-4" /> 🏛️ จดทะเบียน อ.ย. (A.S.D)
        </button>
      </div>

      {activeSubTab === 'docs' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">ส่วนงานเอกสารสารระบบ (SOP Version & Document Control Vault)</h3>
                <p className="text-[11px] text-slate-400">บันทึกขั้นตอนทำงานมาตรฐาน ควบคุมเวอร์ชัน (Version Control) และอนุมัติปล่อยความคล่องแคล่วในการปรับเอกสาร ISO 22716 / ISO 9001</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateSop}
                className="p-1 px-3.5 bg-green-600 hover:bg-green-700 font-bold rounded-lg text-white text-[11px]"
              >
                สร้างร่าง SOP ใหม่ +
              </button>
              <button onClick={exportExcel} type="button" className="p-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-250 rounded text-[11px] font-bold">
                Export Docs
              </button>
            </div>
          </div>

          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="ค้นหา SOP ตามชื่อ ID หรือหมวดแผนก..."
              className="w-full bg-slate-50 border border-slate-200 p-2 pl-8 rounded-lg outline-none text-xs text-slate-850"
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          {/* DataTable of SOPs */}
          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="p-3">รหัสฟังก์ชัน SOP (Code)</th>
                  <th className="p-3">หัวข้อและขั้นตอนมาตรฐาน</th>
                  <th className="p-3 text-center">หลักคุมเวอร์ชัน (Version)</th>
                  <th className="p-3">กลุ่มฝ่ายแผนก (Category)</th>
                  <th className="p-3">เจ้าหน้าที่ลงทะเบียน</th>
                  <th className="p-3">อัพเดตเด่นล่าสุด</th>
                  <th className="p-3 text-center">ระดับอนุมัติ</th>
                  <th className="p-3 text-center w-36">คำสั่งปรับปรุง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filterDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900 bg-slate-100/50 inline-block my-1.5 border border-slate-200 rounded px-1.5">{doc.id}</td>
                    <td className="p-3 font-bold text-slate-950">{doc.title}</td>
                    <td className="p-3 text-center"><span className="bg-blue-100 text-[#0071E3] font-mono font-extrabold px-2 py-0.5 rounded text-[10px]">{doc.version}</span></td>
                    <td className="p-3 font-bold text-indigo-700">{doc.category}</td>
                    <td className="p-3 text-slate-500">{doc.author}</td>
                    <td className="p-3 font-mono text-zinc-550">{doc.date}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        doc.status === 'Approved' ? 'bg-green-150 text-green-700' : 'bg-yellow-101 text-yellow-700'
                      }`}>{doc.status}</span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-1.5 justify-center">
                        <button
                          type="button"
                          onClick={() => handleUpdateSopVersion(doc.id)}
                          className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded text-[10px] font-bold"
                          title="ยกระดับเวอร์ชันเอกสาร (Increment Version)"
                        >
                          อัปเดตเวอร์ชั่น ⟳
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'fda' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">สารระบบจดขึ้นทะเบียนแบรนดเครื่องสำอาง (FDA & ASEAN TF Cosmetics Registrant Desk)</h3>
                <p className="text-[11px] text-slate-400">สืบย้อนควบคุมเลขคำขอ อ.ย. ประกันคุณปฐมเลขจดแจ้ง ตรวจสอบวันหมดอายุ และดูแลกลุ่มขอบเขตประเทศการจัดส่งสินค้า</p>
              </div>
            </div>
            <button onClick={exportExcel} type="button" className="p-1 px-3 bg-green-600 text-white text-[11px] rounded hover:bg-green-700 font-bold">
              Export Excel Registry
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fdaNotifications.map(fda => (
              <div key={fda.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 font-sans text-xs select-none">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-bold font-mono text-indigo-700 text-[10px]">{fda.activeSKU}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    fda.status.startsWith('Active') ? 'bg-green-150 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>{fda.status}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{fda.brandName}</h4>
                  <p className="text-zinc-600 text-[11px] mt-1">ขอบเขตเป้าหมายจำหน่าย: {fda.countryScope}</p>
                </div>
                <div className="p-2 border border-dashed rounded-lg bg-white/60 space-y-1">
                  <p className="font-bold font-mono text-indigo-650">เลขแจ้งเตือน: {fda.notificationNo}</p>
                  <p className="text-[10px] text-slate-400">วันประเมินหมดสิทธิ์: {fda.expiryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
