import React, { useState } from 'react';
import { 
  Building, MapPin, Search, CheckCircle2, QrCode, FileText, Cpu, 
  ArrowRight, ShieldAlert, Layers, Printer, RefreshCw, FileSpreadsheet, Eye
} from 'lucide-react';

interface TraceabilityOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function TraceabilityOS({ dbState, onRefresh, onNotify, userRole }: TraceabilityOSProps) {
  const [lotInput, setLotInput] = useState('FG-LOT-ROSE-2601');
  const [isTracing, setIsTracing] = useState(false);
  const [traceResult, setTraceResult] = useState<any | null>(null);

  // Pre-seed traceability data
  const traceabilityRecords: { [key: string]: any } = {
    'FG-LOT-ROSE-2601': {
      fgLot: 'FG-LOT-ROSE-2601',
      productName: 'Rose-Au-Gold Serum Premium (50ml)',
      capacity: '54,000 Pcs Daily Cap Line',
      sku: 'SKU-ROSE-50',
      productionDate: '2026-06-09',
      releaseState: 'RELEASE APPROVED',
      qualityResult: 'pH: 5.2, Viscosity: 12,500 cps, Microbe: Passed (Absent)',
      auditors: { qa: 'เจมส์ บราวน์ (QA Director)', qc: 'ดร. ลลิตา วรโชติสกุล (Lead QC)' },
      steps: [
        {
          id: 'STEP-1',
          title: 'Finished Goods Lot Release (สินค้าสำเร็จรูป)',
          desc: 'อนุมัติปล่อยสินค้าสำเร็จรูปล็อตทองคำกุหลาบ บันทึกสิทธิ์บาร์โค้ด QR และส่งเข้าคลังสินค้า WMS โลเคชั่นจัดจำหน่าย',
          refCode: 'FG-LOT-ROSE-2601',
          location: 'Zone C - Bin C-01-01',
          timestamp: '2026-06-09 17:30'
        },
        {
          id: 'STEP-2',
          title: 'Production Batch Mixer (กระบวนการกวนผสม)',
          desc: 'กระบวนการแปรรูปเคมีกวนสารภายใต้อุณหภูมิ 85°C ดำเนินผ่านเครื่องจักรกวนผสม Precision Chemical Reactor RX-3F ตามข้อกำหนด ISO 22716',
          refCode: 'MO-B26001 (Gold Rose Serum)',
          location: 'Mixing & Grinding Section',
          timestamp: '2026-06-09 11:30'
        },
        {
          id: 'STEP-3',
          title: 'Material Issue & FEFO Check (การเบิกจ่ายสารสกัด)',
          desc: 'อนุมัติหักจ่ายเคมีสารสังเคราะห์ Niacinamide และ French Rose Centric Oil ตามสิทธิ์วันกำหมดอายุ EXP เหลือน้อยสุดก่อน',
          refCode: 'FEFO_Suggest_Alloc_Lot_RM240501-A',
          location: 'Zone A - Bin A-01-01',
          timestamp: '2026-06-09 09:10'
        },
        {
          id: 'STEP-4',
          title: 'Supplier Raw Material Lot (ล็อตวัตถุดิบต้นน้ำ)',
          desc: 'จัดเก็บสกัดวัตถุดิบ French Rose Centric Oil นำเข้ารับจากซัพพลายเออร์ แช่จัดเก็บควบคุมอุณหภูมิความเย็นกันแสง',
          refCode: 'LOT-ROSE-202605 (Supplier: Rose Farms S.A.)',
          location: 'Zone A Depot',
          timestamp: '2026-05-15 08:30'
        },
        {
          id: 'STEP-5',
          title: 'Goods Receive Entry (การลงบัญชีรับ)',
          desc: 'ลงทะเบียนตรวจส่งสินค้าจริงคีย์เชื่อมใบรับของทางบัญชี กำหนดเลข Goods Receive Number (GRN) เพื่อป้องกันการเจือปนซ้ำ',
          refCode: 'GRN001 / PO-2026-081',
          location: 'Receiving Dock Gate 2',
          timestamp: '2026-05-15 08:00'
        },
        {
          id: 'STEP-6',
          title: 'COA Release Documentation (ใบวิเคราะห์ผลแล็บซัพพลายเออร์)',
          desc: 'ตรวจสอบประทับเอกสารรับรอง COA แท้จากฝรั่งเศส คีย์ค่าแล็บความบริสุทธิ์ 99.4% ละเอียด ผ่านมาตรฐาน ISO 9001',
          refCode: 'COA001_Rose_GRN001.pdf (Verified Approved)',
          location: 'COA Cloud Vault Folder Drive',
          timestamp: '2026-05-15 08:15'
        }
      ]
    },
    'FG-LOT-GLY-2602': {
      fgLot: 'FG-LOT-GLY-2602',
      productName: 'Hydrating Face Mist 100ml',
      capacity: '32,000 Pcs Daily Cap Line',
      sku: 'SKU-MIST-100',
      productionDate: '2026-06-10',
      releaseState: 'RELEASE APPROVED',
      qualityResult: 'pH: 6.0, Viscosity: 1,150 cPs, Microbe: Passed (Absent)',
      auditors: { qa: 'เจมส์ บราวน์ (QA Director)', qc: 'สว่าง วงศ์วาน (QC Inspector)' },
      steps: [
        {
          id: 'STEP-1',
          title: 'Finished Goods Lot Release (สินค้าสำเร็จรูป)',
          desc: 'อนุมัติผ่านแล็บ Mist ล็อตกลีเซอรีนบำรุงแกน จัดลงบาร์โค้ด QR และแยกบรรจุกล่องขนส่ง',
          refCode: 'FG-LOT-GLY-2602',
          location: 'Zone C - Bin C-02-01',
          timestamp: '2026-06-10 16:30'
        },
        {
          id: 'STEP-2',
          title: 'Production Batch Mixer (กระบวนการกวนผสม)',
          desc: 'แปรรูปผสมด่านน้ำหอมอุ่นเกลือความร้อน Reactor RX-5',
          refCode: 'MO-B26002 (Centella Mist)',
          location: 'Thermal Processing Unit',
          timestamp: '2026-06-10 10:15'
        },
        {
          id: 'STEP-3',
          title: 'Material Issue & FEFO Check (การเบิกจ่ายสารสะกัด)',
          desc: 'อนุมัติหักใช้คิวสาร Glycerin Organic Pure ล็อตบำรุง',
          refCode: 'FEFO_Suggest_Alloc_Lot_RM240602',
          location: 'Zone A - Bin A-02-01',
          timestamp: '2026-06-10 08:45'
        },
        {
          id: 'STEP-4',
          title: 'Supplier Raw Material Lot (ล็อตวัตถุดิบ)',
          desc: 'ล็อตนำส่ง Siam BioExtract Co.',
          refCode: 'RM240602-B',
          location: 'Zone A Depot',
          timestamp: '2026-05-18 10:00'
        },
        {
          id: 'STEP-5',
          title: 'Goods Receive Entry (ใบรับ)',
          desc: 'ลงทะเบียนรับของฝ่ายคลัง',
          refCode: 'GRN004 / PO-2026-092',
          location: 'Receiving Dock Gate 1',
          timestamp: '2026-05-18 09:30'
        },
        {
          id: 'STEP-6',
          title: 'COA Release Documentation (ใบวิเคราะห์ผลแล็บ)',
          desc: 'ใบ COA แนบ PDF ใบกักกันแล็บตรวจ',
          refCode: 'COA_Gly_GRN004.pdf (Approved)',
          location: 'COA Cloud Vault Folder Drive',
          timestamp: '2026-05-18 09:45'
        }
      ]
    }
  };

  const handleTraceLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotInput) return;

    setIsTracing(true);
    setTraceResult(null);

    // Simulate 5-second rapid traceback check (GMP / ISO audit mandate)
    setTimeout(() => {
      const result = traceabilityRecords[lotInput];
      if (result) {
        setTraceResult(result);
        onNotify('ค้นหาย้อนกลับประวัติ (Traceability Traceback) สำเร็จภายในรวดเร็ว (2.8 วินาที)', 'info');
      } else {
        onNotify('ไม่พบข้อมูลล็อตตรวจย้อนกลับ กรุณากรอกเลขล็อตผลิตภัณฑ์ เช่น FG-LOT-ROSE-2601', 'error');
      }
      setIsTracing(false);
    }, 2800);
  };

  const exportExcel = () => {
    if (!traceResult) return;
    let csvContent = `data:text/csv;charset=utf-8,Lot Genealogy for ${traceResult.productName}\n`;
    csvContent += "Step ID,Genealogy Node,Details,Reference Code,Location,Witness Timestamp\n";
    traceResult.steps.forEach((s: any) => {
      csvContent += `"${s.id}","${s.title}","${s.desc}","${s.refCode}","${s.location}","${s.timestamp}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Trace_Lot_${traceResult.fgLot}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('ดาวน์โหลดประวัติ Traceability สู่ไฟล์ Excel สำเร็จ', 'info');
  };

  const printSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="traceability-root">
      
      {/* Title Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-zinc-900 border text-white rounded-xl">
            <QrCode className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">สืบย้อนประวัติย้อนกลับ 5 วินาที (Rapid 5-Second GMP Traceability Engine)</h3>
            <p className="text-[11px] text-slate-400">ระบุเลขบาร์โค้ดล็อตสำเร็จรูป (FG Lot) เพื่อสืบค้นย้อนหา BPR, ล็อควัตถุกวนแล็บกระปุก จนถึงใบตรวจวิเคราะห์ COA ซัพพลายเออร์รวดเร็ว</p>
          </div>
        </div>

        {traceResult && (
          <div className="flex gap-2.5">
            <button
              onClick={exportExcel}
              type="button"
              className="p-1.5 px-3.5 bg-green-600 hover:bg-green-700 font-bold rounded-lg text-white text-[11px]"
            >
              Export Excel
            </button>
            <button
              onClick={printSheet}
              type="button"
              className="p-1.5 px-3.5 bg-[#0071E3] hover:bg-[#147ce5] font-bold rounded-lg text-white text-[11px]"
            >
              Print Record
            </button>
          </div>
        )}
      </div>

      {/* Input Trace Station */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
        <h4 className="font-bold text-xs text-indigo-300 uppercase tracking-widest font-mono">Traceback Query Panel</h4>
        <form onSubmit={handleTraceLookup} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">สแกน/กรอกเลขล็อตตู้สินค้า (Finished Goods Lot Number)</label>
            <input
              type="text"
              placeholder="เช่น FG-LOT-ROSE-2601, FG-LOT-GLY-2602"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none font-mono font-bold text-xs focus:ring-1 focus:ring-indigo-500 text-indigo-200"
              value={lotInput}
              onChange={(e) => setLotInput(e.target.value.toUpperCase())}
              disabled={isTracing}
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isTracing}
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              {isTracing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" /> 
                  กำลังประมวลสายประวัติ (2.8s/5s)...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" /> เริ่มสืบค้นประวัติย้อนลึก ✓
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="text-slate-400 font-semibold self-center">ลัดล็อตค้นด่วนที่สระรับ:</span>
          <button type="button" onClick={() => { setLotInput('FG-LOT-ROSE-2601'); }} className="bg-slate-800 hover:bg-slate-700 p-1 px-2 rounded text-indigo-300 font-bold font-mono">กุหลาบทองคำ: FG-LOT-ROSE-2601</button>
          <button type="button" onClick={() => { setLotInput('FG-LOT-GLY-2602'); }} className="bg-slate-800 hover:bg-slate-700 p-1 px-2 rounded text-indigo-300 font-bold font-mono">สเปรย์ชื้นกลีเซอรีน: FG-LOT-GLY-2602</button>
        </div>
      </div>

      {/* Tracing Loader Simulator */}
      {isTracing && (
        <div className="bg-white border rounded-xl p-8 py-16 text-center space-y-4 shadow-sm animate-pulse flex flex-col items-center">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">โคลนระบบฐานระเบียนความเร็วสูง...</h4>
            <p className="text-xs text-slate-400 max-w-sm">กำลังเชื่อมประมวลย้อนกลับ Finished Goods Lot สู่ใบสูบสูตร Mixer ข้อมูลคันวัตถุดิบ บันทึก QC และส่องหา COA ซัพพลายเออร์</p>
          </div>
        </div>
      )}

      {/* Traced Results Show List */}
      {traceResult && !isTracing && (
        <div className="space-y-6 animate-fade-in" id="trace-report-results">
          
          {/* Header Summary of queried lot */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">คุณสมบัติสินค้าสืบค้น</span>
              <p className="font-bold text-slate-900 text-sm">{traceResult.productName}</p>
              <p className="font-mono text-indigo-600">SKU Code: {traceResult.sku}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">เลขประมวลสิทธิ์ (Lot Number)</span>
              <p className="font-bold font-mono text-zinc-950 text-sm">{traceResult.fgLot}</p>
              <p className="text-slate-400">ผลิตสำเร็จ: {traceResult.productionDate}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">คุณลักษณะวันตรวจแล็บ QC</span>
              <p className="font-bold text-slate-850 text-xs text-green-600">✓ passed ( Conformed )</p>
              <p className="text-slate-500">{traceResult.qualityResult}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">ฝ่ายประกันภัย (QA/QC Witness)</span>
              <p className="font-medium text-slate-800">QA: {traceResult.auditors.qa}</p>
              <p className="font-medium text-slate-855">QC: {traceResult.auditors.qc}</p>
            </div>
          </div>

          {/* Interactive visual genealogical tree */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-indigo-600" /> แผงผังลำดับเชื่อมย้อนกลับ (End-to-End Genealogy Tree View)
            </h4>

            {/* Trace Step timeline loop vertically and connected */}
            <div className="relative pl-6 space-y-8 border-l border-slate-200">
              {traceResult.steps.map((step: any, idx: number) => (
                <div key={step.id} className="relative">
                  
                  {/* Point Indicator bullet */}
                  <span className="absolute -left-[31px] top-0 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  </span>

                  <div className="space-y-1.5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
                      <h5 className="font-bold text-zinc-950 text-xs md:text-sm flex items-center gap-2">
                        <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold">{step.id}</span>
                        {step.title}
                      </h5>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{step.timestamp}</span>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed max-w-4xl">{step.desc}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl text-[10px] font-mono pt-1 text-slate-600">
                      <div className="bg-slate-50 border p-2 rounded-lg">
                        <span className="text-slate-400 font-bold uppercase block">Reference Ref:</span>
                        <strong className="text-indigo-700 text-xs select-all">{step.refCode}</strong>
                      </div>
                      <div className="bg-slate-50 border p-2 rounded-lg">
                        <span className="text-slate-400 font-bold uppercase block">Physical Location:</span>
                        <strong className="text-slate-900">{step.location}</strong>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Verification approval safety block */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center text-xs text-green-900 gap-4 mt-8">
              <span className="font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                ประวัติย้อนสายตรวจสอบแล้ว: ได้รับการยอมรับการปล่อยทางกฎหมาย ASEAN Cosmetic Directive และผ่านการรับรองระบบคุณภาพ ISO 22716
              </span>
              <span className="font-bold font-mono text-[9px] bg-green-200 text-green-800 p-1 px-2 rounded-full uppercase">GENEALOGY VALID ✓</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
