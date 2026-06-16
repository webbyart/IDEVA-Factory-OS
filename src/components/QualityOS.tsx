import React, { useState } from 'react';
import { 
  ShieldCheck, Search, FileText, Upload, Printer, Download, PlusCircle, 
  Beaker, Database, Eye, CheckCircle2, AlertTriangle, FileSpreadsheet, Trash2, Edit
} from 'lucide-react';

interface QualityOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function QualityOS({ dbState, onRefresh, onNotify, userRole }: QualityOSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'qc' | 'qa' | 'coa'>('qc');
  const [coaSearch, setCoaSearch] = useState('');
  const [qcSearch, setQcSearch] = useState('');
  const [selectedCoa, setSelectedCoa] = useState<any>(null);

  // Hardcoded rich COA records linked by GRN (Goods Receive Number) to prove Supplier Lot delivery history
  const [coaRecords, setCoaRecords] = useState([
    { id: 'COA-GRN001', grn: 'GRN001', rmName: 'French Rose Centric Oil', supplier: 'Rose Farms S.A.', lotNo: 'RM240501-A', purity: '99.4%', pH: '5.2', micro: 'Absent', date: '2026-05-15', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', docUrl: 'COA001_Rose_GRN001.pdf' },
    { id: 'COA-GRN002', grn: 'GRN002', rmName: 'French Rose Centric Oil', supplier: 'Rose Farms S.A.', lotNo: 'RM240501-A', purity: '99.5%', pH: '5.3', micro: 'Absent', date: '2026-05-20', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', docUrl: 'COA002_Rose_GRN002.pdf' },
    { id: 'COA-GRN003', grn: 'GRN003', rmName: 'French Rose Centric Oil', supplier: 'Rose Farms S.A.', lotNo: 'RM240501-A', purity: '99.3%', pH: '5.2', micro: 'Absent', date: '2026-06-01', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', docUrl: 'COA003_Rose_GRN003.pdf' },
    { id: 'COA-HA01', grn: 'GRN005', rmName: 'Hyaluronic Acid 1%', supplier: 'Apex Chemical Lab', lotNo: 'RM240710', purity: '99.8%', pH: '6.0', micro: 'Absent', date: '2026-05-22', status: 'Approved', auditor: 'สว่าง วงศ์วาน', docUrl: 'COA_HA_GRN005.pdf' },
    { id: 'COA-GLY01', grn: 'GRN004', rmName: 'Glycerin Pure Organic', supplier: 'Siam BioExtract Co.', lotNo: 'RM240602', purity: '98.5%', pH: '6.5', micro: '15 CFU/g (Pass)', date: '2026-05-18', status: 'Approved', auditor: 'ดร. ลลิตา วรโชติสกุล', docUrl: 'COA_Gly_GRN004.pdf' }
  ]);

  // QA mock audits
  const [qaAudits, setQaAudits] = useState([
    { id: 'AUD-001', type: 'SOP-ChangeControl', details: 'เปลี่ยนซัพพลายเออร์ดงกุหลาบฝรั่งเศส (ISO 22716 Ref: CC-Rose-26)', initiator: 'แผนกวิจัย R&D', approvedDate: '2569-05-20', severity: 'Medium', status: 'Approved' },
    { id: 'AUD-002', type: 'SOP-LineClearance', details: 'ตรวจสอบการล้างไลน์ Mixer A ด่าน 3 ฆ่าเชื้อแบคทีเรียความดันน้ำร้อน', initiator: 'ประกันคุณภาพ', approvedDate: '2569-06-08', severity: 'Critical', status: 'Approved' },
    { id: 'AUD-003', type: 'SOP-Validation', details: 'รายงานรับรองมาตรฐานตู้อบเครื่องผสมแก้ว (Calibration Glass Reactor-10)', initiator: 'ฝ่ายซ่อมบำรุง', approvedDate: '2569-06-02', severity: 'High', status: 'Pending Review' }
  ]);

  // QC inspection records
  const [qcInspections, setQcInspections] = useState([
    { id: 'QC-B2601', batchNo: 'B26001 (Gold Rose Serum)', inspector: 'ดร. ลลิตา วรโชติสกุล', pHVal: '5.2 (Pass)', viscosity: '12,500 cPs (Pass)', microCount: 'Absent (Passed)', physical: 'Clear Reddish Liquid', status: 'Passed', date: '2026-06-09' },
    { id: 'QC-B2602', batchNo: 'B26002 (Centella Balancing Toner)', inspector: 'สว่าง วงศ์วาน', pHVal: '4.8 (Pass)', viscosity: '1,200 cPs (Pass)', microCount: 'QC Pending', physical: 'Pale Brown, Herbal Aroma', status: 'Pending', date: '2026-06-10' }
  ]);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    grn: '',
    rmName: 'French Rose Centric Oil',
    supplier: 'Rose Farms S.A.',
    lotNo: '',
    purity: '99.5%',
    pH: '5.4',
    fileName: ''
  });

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadForm(prev => ({ ...prev, fileName: e.target.files![0].name }));
    }
  };

  const handleAddCoaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.grn || !uploadForm.lotNo) {
      onNotify('กรุณากรอกรหัส GRN และเลข ล็อตซัพพลายเออร์', 'warning');
      return;
    }
    const newRecord = {
      id: `COA-GRN-${Date.now()}`,
      grn: uploadForm.grn,
      rmName: uploadForm.rmName,
      supplier: uploadForm.supplier,
      lotNo: uploadForm.lotNo,
      purity: uploadForm.purity,
      pH: uploadForm.pH,
      micro: 'Absent',
      date: new Date().toISOString().slice(0, 10),
      status: 'Approved',
      auditor: userRole === 'Admin' ? 'เจมส์ บราวน์' : 'ดร. ลลิตา วรโชติสกุล',
      docUrl: uploadForm.fileName || 'COA_Manual_Lot.pdf'
    };

    setCoaRecords(prev => [newRecord, ...prev]);
    onNotify(`จัดเก็บเอกสาร COA แนบเชื่อมโยงใบรับสินค้า (GRN: ${uploadForm.grn}) สำเร็จเรียบร้อยแล้ว`, 'info');
    setShowUploadModal(false);
  };

  const filterCoa = coaRecords.filter(coa => 
    coa.grn.toLowerCase().includes(coaSearch.toLowerCase()) ||
    coa.rmName.toLowerCase().includes(coaSearch.toLowerCase()) ||
    coa.lotNo.toLowerCase().includes(coaSearch.toLowerCase()) ||
    coa.supplier.toLowerCase().includes(coaSearch.toLowerCase())
  );

  const filterQc = qcInspections.filter(qc =>
    qc.batchNo.toLowerCase().includes(qcSearch.toLowerCase()) ||
    qc.inspector.toLowerCase().includes(qcSearch.toLowerCase())
  );

  const handleApproveQC = (idx: number) => {
    setQcInspections(prev => prev.map((q, i) => i === idx ? { ...q, status: 'Passed', microCount: 'Absent (Passed)' } : q));
    onNotify('อนุมัติปล่อยรายงานผ่านแล็บเครื่องสำอาง (Passed) สำเร็จแล้ว', 'info');
  };

  const exportExcel = () => {
    let csvContent = "";
    if (activeSubTab === 'qc') {
      csvContent = "data:text/csv;charset=utf-8,Batch,Inspector,pH-Val,Viscosity,Microbiology,Physical State,Status,Date\n";
      qcInspections.forEach(qc => {
        csvContent += `"${qc.batchNo}","${qc.inspector}","${qc.pHVal}","${qc.viscosity}","${qc.microCount}","${qc.physical}","${qc.status}","${qc.date}"\n`;
      });
    } else if (activeSubTab === 'coa') {
      csvContent = "data:text/csv;charset=utf-8,GRN,Material,Supplier,Lot No,Purity,pH-Val,Audit Date,Auditor,Status,File\n";
      coaRecords.forEach(coa => {
        csvContent += `"${coa.grn}","${coa.rmName}","${coa.supplier}","${coa.lotNo}","${coa.purity}","${coa.pH}","${coa.date}","${coa.auditor}","${coa.status}","${coa.docUrl}"\n`;
      });
    } else {
      csvContent = "data:text/csv;charset=utf-8,Audit Type,Details,Initiator,Date,Severity,Status\n";
      qaAudits.forEach(aud => {
        csvContent += `"${aud.type}","${aud.details}","${aud.initiator}","${aud.approvedDate}","${aud.severity}","${aud.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IDEVA_${activeSubTab.toUpperCase()}_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('ส่งออกไฟล์ข้อมูลรายงาน (XLS, CSV) สำเร็จแล้ว', 'info');
  };

  const printSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="quality-audits-root">
      
      {/* AdminLTE Tab Switcher */}
      <div className="flex bg-slate-900 text-white p-1 rounded-2xl max-w-lg shadow-md border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => { setActiveSubTab('qc'); setSelectedCoa(null); }}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'qc' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Beaker className="h-4 w-4" /> 🔬 ด่านตรวจวิเคราะห์แล็บ QC
        </button>
        <button
          type="button"
          onClick={() => { setActiveSubTab('qa'); setSelectedCoa(null); }}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'qa' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <ShieldCheck className="h-4 w-4" /> 🛡️ ประกันคุณภาพ QA / Standards
        </button>
        <button
          type="button"
          onClick={() => { setActiveSubTab('coa'); setSelectedCoa(null); }}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${activeSubTab === 'coa' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Database className="h-4 w-4" /> 📄 บัญชีสาระ COA Directory (GRN)
        </button>
      </div>

      {activeSubTab === 'qc' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">สถานีควบคุมคุณภาพเคมีเครื่องสำอาง (Quality Control Laboratory)</h3>
                <p className="text-[11px] text-slate-400">ควบคุมระดับความเป็นกรดด่าง (pH) ความตึงเมือก (Viscosity) และส่องประชากรจุลชีพเชื้อสะสมด้วยมาตรฐานระเบียบ GMP</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหา Batch หรือผู้ตรวจสอบ..."
                  className="pl-9 pr-4 py-2 bg-neutral-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={qcSearch}
                  onChange={(e) => setQcSearch(e.target.value)}
                />
              </div>
              <button onClick={exportExcel} type="button" className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E2E8F0] rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-[#0B3C5D] border-b border-indigo-950 text-white font-black select-none sticky top-0 z-10 h-11">
                  <th className="p-3 w-12 text-center text-white">No.</th>
                  <th className="p-3 text-white">รหัส Batch ผลิตภัณฑ์</th>
                  <th className="p-3 text-white">เจ้าหน้าที่ตรวจ</th>
                  <th className="p-3 text-white">ทดสอบ pH Level</th>
                  <th className="p-3 text-white">แรงตึงหนืด Viscosity</th>
                  <th className="p-3 text-white">เชื้อเคมีปนเปื้อน (Microbiological)</th>
                  <th className="p-3 text-white">ลักษณะทางกายภาพภายนอก (Physical)</th>
                  <th className="p-3 text-center text-white">วันเสร็จตรวจ</th>
                  <th className="p-3 text-center text-white">สถานะแล็บ</th>
                  <th className="p-3 text-center w-32 text-white">คำสั่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900 font-bold">
                {filterQc.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500 font-extrabold">ไม่พบข้อมูลผลตรวจรับรองเข้าเงื่อนไข</td>
                  </tr>
                ) : (
                  filterQc.map((qc, idx) => {
                    const isEven = idx % 2 === 1;
                    return (
                      <tr key={qc.id} className={`${isEven ? 'bg-[#F8FBFF]' : 'bg-white'} hover:bg-[#EAF3FF] transition-colors h-14`}>
                        <td className="p-3 text-center text-slate-500 font-mono font-bold">{idx + 1}</td>
                        <td className="p-3 font-black text-indigo-950">{qc.batchNo}</td>
                        <td className="p-3 font-extrabold text-slate-900">{qc.inspector}</td>
                        <td className="p-3 font-mono text-slate-800">{qc.pHVal}</td>
                        <td className="p-3 font-mono text-slate-800">{qc.viscosity}</td>
                        <td className="p-3 font-mono text-slate-800">{qc.microCount}</td>
                        <td className="p-3 text-slate-700 font-extrabold">{qc.physical}</td>
                        <td className="p-3 text-center font-mono text-slate-500">{qc.date}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${
                            qc.status === 'Passed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                            qc.status === 'Pending' ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse' : 'bg-rose-100 text-rose-900 border border-rose-350'
                          }`}>
                            {qc.status === 'Passed' ? '🟢 ผ่าน' : qc.status === 'Pending' ? '🟡 รอผลตรวจ' : '🔴 ไม่ผ่าน'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {qc.status === 'Pending' ? (
                            <button
                              type="button"
                              onClick={() => handleApproveQC(idx)}
                              className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold cursor-pointer active:scale-95 transition-all shadow-xs"
                            >
                              อนุมัติปล่อยผ่าน ✓
                            </button>
                          ) : (
                            <div className="flex gap-1 justify-center">
                              <button
                                type="button"
                                onClick={() => onNotify(`แสดงข้อมูลผลสอบกระดาษ QC: ${qc.batchNo}`, 'info')}
                                className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold rounded-xl shadow-xs cursor-pointer"
                              >
                                ดูข้อมูล
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'qa' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">การรับรองคุณภาพฝ่ายบริหารโรงงาน (Quality Assurance Audit & Change Controls)</h3>
                <p className="text-[11px] text-slate-400">ควบคุมมาตรฐานการอนุมัติปล่อยเปลี่ยนสูตร ขันตอนการล้างสายงานผลิต GMP การวิเคราะห์รายงานคัดแยกสารปนเปื้อน</p>
              </div>
            </div>
            <button onClick={exportExcel} type="button" className="p-1.5 px-3 bg-green-600 text-white text-[11px] font-bold rounded-lg hover:bg-green-700 flex items-center gap-1">
              <FileSpreadsheet className="h-3.5 w-3.5" /> XLS Export
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {qaAudits.map(aud => (
              <div key={aud.id} className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-[10px] text-zinc-500 font-mono">{aud.id} / CC-ISO</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    aud.status === 'Approved' ? 'bg-green-150 text-green-700' : 'bg-yellow-105 text-yellow-700'
                  }`}>{aud.status}</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{aud.type}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{aud.details}</p>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>โดย: {aud.initiator}</span>
                  <span>วันที่: {aud.approvedDate}</span>
                </div>
                <div className="flex gap-1 pb-1 pt-1.5 border-t border-slate-200">
                  <button type="button" onClick={() => onNotify(`ตรวจสอบรายละเอียด SOP สำหรับ ${aud.id}`, 'info')} className="p-1 px-3 bg-[#0071E3] text-white rounded text-[10px] font-bold">
                    ดูข้อมูล
                  </button>
                  <button type="button" onClick={() => onNotify(`รับรองมาตรฐาน SOP ${aud.id} เรียบร้อยแล้ว`, 'info')} className="p-1 px-3 bg-green-600 text-white rounded text-[10px] font-bold">
                    อนุมัติ ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'coa' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">ดัชนีคุมใบรับรองเคมี (COA Goods Receive Records & Audit History)</h3>
                <p className="text-[11px] text-slate-400">ควบคุมและสบสลัด COA รายรับส่อง GRN (Goods Receive Number) ปล่อยซัพพลายเออร์ส่งสินค้าตัวเดียวกันหลายล็อตไม่สูญหาย</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="p-1.5 px-3 bg-[#0071E3] hover:bg-[#147ce5] text-white text-[11px] font-bold rounded-lg flex items-center gap-1"
              >
                อัพโหลดเอกสาร COA เชื่อม GRN +
              </button>
              <button onClick={exportExcel} type="button" className="p-1.5 px-3 bg-green-600 text-white text-[11px] font-bold rounded-lg">
                Excel
              </button>
            </div>
          </div>

          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="ค้นหา COA ตามเลข Raw Lot, GRN หรือผู้ผลิต..."
              className="w-full bg-slate-50 border border-slate-200 p-2 pl-8 rounded-lg outline-none text-xs text-slate-800"
              value={coaSearch}
              onChange={(e) => setCoaSearch(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          {/* COA DataTable */}
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="bg-[#0B3C5D] border-b border-indigo-950 text-white font-black select-none sticky top-0 z-10 h-11">
                  <th className="p-3 text-white">รหัส GRN เชื่อมโยง</th>
                  <th className="p-3 text-white">ชื่อเคมีสกัด</th>
                  <th className="p-3 text-white">ซัพพลายเออร์ผู้จัดส่ง</th>
                  <th className="p-3 text-white">รหัสล็อต (Supplier Lot)</th>
                  <th className="p-3 text-white">ความบริสุทธิ์ (Purity)</th>
                  <th className="p-3 text-white">ประเมินวันตรวจ</th>
                  <th className="p-3 text-white">พิจารณาโดย</th>
                  <th className="p-3 text-white">ชื่อไฟล์ PDF</th>
                  <th className="p-3 text-center text-white">ผลลัพธ์</th>
                  <th className="p-3 text-center text-white">คำสั่งแสดง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-900 font-bold">
                {filterCoa.map((coa, idx) => {
                  const isEven = idx % 2 === 1;
                  return (
                    <tr key={coa.id} className={`${isEven ? 'bg-[#F8FBFF]' : 'bg-white'} hover:bg-[#EAF3FF] transition-colors h-14`}>
                      <td className="p-3 font-mono font-black text-slate-900">{coa.grn}</td>
                      <td className="p-3 font-extrabold text-indigo-900">{coa.rmName}</td>
                      <td className="p-3 text-slate-800">{coa.supplier}</td>
                      <td className="p-3 font-mono font-black text-indigo-750 select-all">{coa.lotNo}</td>
                      <td className="p-3 font-mono text-slate-800">{coa.purity}</td>
                      <td className="p-3 font-mono text-slate-500">{coa.date}</td>
                      <td className="p-3 text-slate-700 font-extrabold">{coa.auditor}</td>
                      <td className="p-3 text-indigo-750 font-mono text-[11px] underline select-all">{coa.docUrl}</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-black">COA Release</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedCoa(coa)}
                          className="p-1.5 px-3 bg-[#0071E3] hover:bg-[#147ce5] text-white text-[10px] font-black rounded-xl flex items-center justify-center gap-1 mx-auto shadow-xs active:scale-95 cursor-pointer transition-all"
                        >
                          <Eye className="h-3 w-3" /> Preview PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Interactive PDF Document Preview */}
          {selectedCoa && (
            <div className="bg-slate-800 p-6 rounded-xl text-white space-y-4 animate-fade-in border border-slate-700 relative">
              <button 
                type="button" 
                onClick={() => setSelectedCoa(null)} 
                className="absolute right-4 top-4 hover:text-red-500 font-bold"
              >
                ✕ ปิดพรีวิว
              </button>
              <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
                <FileText className="h-6 w-6 text-indigo-400" />
                <div>
                  <h4 className="font-bold text-sm">การวิเคราะห์พรีวิวเอกสาร: {selectedCoa.docUrl} (สไลด์ระบบ PDF-Viewer)</h4>
                  <p className="text-[10px] text-slate-400">ผูกกับ Goods Receive Number: {selectedCoa.grn} | ตรวจสอบผ่านด่านกักกัน GMP แล้ว</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono p-4 bg-slate-900 border border-slate-950 rounded-lg">
                <div className="space-y-1">
                  <p><span className="text-slate-500">Material Standard:</span> {selectedCoa.rmName}</p>
                  <p><span className="text-slate-500">Lot Number Identifier:</span> {selectedCoa.lotNo}</p>
                  <p><span className="text-slate-500">Purity Assay (Specs &gt;99%):</span> <strong className="text-green-400">{selectedCoa.purity} (Conformed)</strong></p>
                  <p><span className="text-slate-500">pH Factor Analysis:</span> pH {selectedCoa.pH} (Specs: 5.0 - 6.5)</p>
                </div>
                <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-700 md:pl-4">
                  <p><span className="text-slate-500">Microbiological Counts:</span> {selectedCoa.micro}</p>
                  <p><span className="text-slate-500">Traceability Connection:</span> Valid GRN-Linked {selectedCoa.grn}</p>
                  <p><span className="text-slate-500">Approval Lead Auditor:</span> {selectedCoa.auditor}</p>
                  <p><span className="text-slate-500">Classification state:</span> <span className="bg-green-500/20 text-green-400 px-1 py-0.5 rounded text-[9px] font-bold">APPROVED RELEASE</span></p>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>* หมายเหตุ: ระบบจัดเก็บ COAs ห้ามเจือปนซ้ำหรือเขียนทับ (Never overwrite) ตามระเบียบข้อบังคับ ISO 22716</span>
                <button type="button" onClick={() => onNotify('สแกนพรีวิว PDF จำลองเสร็จเรียบร้อย', 'info')} className="px-3.5 py-1.5 bg-indigo-600 rounded text-white font-bold">
                  เปิดอ่านแท็บใหม่
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload file dialog modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-center items-center p-3 animate-fade-in" id="upload-coa-grn-modal">
          <div className="bg-white border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs select-none">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">อัพโหลดเอกสารประกอบ COA เชื่อมโยง GRN</h4>
              <p className="text-[10px] text-slate-400">ความปลอดภัยด้านซัพพลายเออร์และมาตรฐานวัตถุดิบนำเข้า</p>
            </div>
            
            <form onSubmit={handleAddCoaSubmit} className="space-y-3 pt-1 text-slate-700">
              <div className="space-y-1">
                <label className="font-semibold block">รหัสรับของของฝ่ายคลัง (GRN Link)</label>
                <input
                  type="text"
                  placeholder="เช่น GRN004, GRN005"
                  className="w-full bg-slate-50 border border-slate-200 p-2 text-xs rounded uppercase font-bold text-slate-900 outline-none focus:bg-white"
                  value={uploadForm.grn}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, grn: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">เลขล็อตส่งมอบจากโรงงานผลิต (Supplier Lot)</label>
                <input
                  type="text"
                  placeholder="เช่น RM240501-A, LOT-GLY-22"
                  className="w-full bg-slate-50 border border-slate-200 p-2 text-xs rounded font-mono font-bold outline-none"
                  value={uploadForm.lotNo}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, lotNo: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">ชื่อสารวิเคราะห์ต้นน้ำ</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded"
                  value={uploadForm.rmName}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, rmName: e.target.value }))}
                >
                  <option value="French Rose Centric Oil">French Rose Centric Oil (น้ำมันสกัดกุหลาบฝรั่งเศส)</option>
                  <option value="Hyaluronic Acid 1%">Hyaluronic Acid 1% (สารบำรุงผิวไฮยา)</option>
                  <option value="Glycerin Pure Organic">Glycerin Pure Organic (สารรักษาความชื้นกลีเซอรีน)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">แนบอัพโหลดไฟล์ (Choose PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full text-xs"
                  onChange={handleUploadFile}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold"
                >
                  บันทึกเข้า COA Registry ✓
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-slate-800 border py-2 rounded-lg font-bold"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
