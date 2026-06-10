import React, { useState, useEffect } from 'react';
import { Database, FileText, Clipboard, Check, RefreshCw } from 'lucide-react';

interface DeveloperOSProps {
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function DeveloperOS({ onNotify }: DeveloperOSProps) {
  const [activeTab, setActiveTab] = useState<'er' | 'ddl' | 'debugger' | 'supabase'>('supabase');
  const [ddlSql, setDdlSql] = useState<string>('');
  const [dbDebuggerState, setDbDebuggerState] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSqlCopied, setIsSqlCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchDdl();
    fetchDebuggerState();
    fetchSupabaseStatus();
  }, []);

  const fetchDdl = async () => {
    try {
      const response = await fetch('/api/db/schema');
      const data = await response.json();
      setDdlSql(data.ddl);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDebuggerState = async () => {
    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      setDbDebuggerState(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSupabaseStatus = async () => {
    try {
      const response = await fetch('/api/supabase-status');
      const data = await response.json();
      setSupabaseStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ddlSql);
    setIsCopied(true);
    onNotify("PostgreSQL script copied to clipboard successfully!", "info");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const hardResetDb = async () => {
    if(!window.confirm("Are you sure you want to reset the factory database? This will clear active production records and re-seed defaults.")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/state/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onNotify(data.message, "info");
        fetchDebuggerState();
        fetchSupabaseStatus();
      }
    } catch (e) {
      onNotify("Error resetting server database.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="developer-os-panel">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1D1D1F] rounded-xl text-white">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight">ระบบสถาปัตยกรรมและโครงสร้างฐานข้อมูล (Database Architecture OS)</h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              แสดงพังความสัมพันธ์เชิงสัมพันธ์แบบคีย์เชื่อมโยง (Entity Relation Schema) และตารางตรวจสอบคำสั่งระบุ PostgreSQL อย่างโปร่งใส
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => {
              fetchDebuggerState();
              fetchSupabaseStatus();
            }}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-[#E5E5EA] bg-white"
            title="Refresh State"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={hardResetDb}
            disabled={loading}
            className="px-4 py-1.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/15 text-[#FF3B30] font-medium text-xs rounded-xl border border-[#FF3B30]/20 transition-colors flex items-center gap-2"
          >
            ล้างข้อมูลและตั้งค่าใหม่ (Reset DB)
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex bg-[#E8E8ED] p-1 rounded-xl border border-[#D1D1D6] overflow-x-auto gap-0.5 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('supabase')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeTab === 'supabase' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ☁️ การเชื่อมต่อ Supabase
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('er')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeTab === 'er' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          แผนผังความสัมพันธ์ (Entity Relations Blueprint)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ddl')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeTab === 'ddl' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ชุดคำสั่งเซิร์ฟเวอร์ (PostgreSQL DDL)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('debugger')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeTab === 'debugger' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ตัววิเคราะห์ฐานข้อมูลสด (State JSON Core)
        </button>
      </div>

      {/* Tabs Content */}
      <div className="min-h-[450px]">
        {activeTab === 'supabase' && supabaseStatus && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <span>Supabase REALTIME Cloud Sync</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">สถานะช่องทางบันทึกจริงเพื่อยกเลิกระบบ Mock Data ยืนยันความปลอดภัยระดับอุตสาหกรรม</p>
              </div>
              <div className="flex items-center gap-1.5 self-start md:self-auto">
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${supabaseStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${supabaseStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${supabaseStatus.connected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {supabaseStatus.connected ? 'ACTIVE (เชื่อมต่อฐานข้อมูลคลาวด์สำเร็จ)' : 'PENDING SQL ACTIONS (รอการรัน SQL บน Supabase)'}
                </span>
              </div>
            </div>

            {/* Connection Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="text-xs font-semibold text-slate-400">SUPABASE REST API URL</div>
                <div className="text-xs font-mono select-all text-slate-700 truncate" title={supabaseStatus.url}>
                  {supabaseStatus.url}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <div className="text-xs font-semibold text-slate-400">TABLE STORAGE TARGET</div>
                <div className="text-xs font-mono text-slate-700">
                  {supabaseStatus.table} (เซฟและโหลดข้อมูล REALTIME)
                </div>
              </div>
            </div>

            {/* Instruction workflow */}
            {!supabaseStatus.connected ? (
              <div className="p-5 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-amber-600 text-lg mt-0.5">⚠️</div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm text-amber-900">กรุณาสร้างตาราง [factory_data] เพื่อเริ่มต้นการจัดเก็บทันที</h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      เนื่องจากฐานข้อมูล Supabase เก่ายังไม่มีตารางเก็บข้อมูล กรุณาทำตามขั้นตอนต่อไปนี้เพื่อให้ระบบเปิดการบันทึกข้อมูลจริง:
                    </p>
                  </div>
                </div>

                <ol className="text-xs text-amber-800 list-decimal pl-5 space-y-2">
                  <li>เปิดหน้าแผงควบคุม <strong>Supabase Dashboard</strong> ของเว็บบราวเซอร์ของคุณ</li>
                  <li>เข้าไปที่เมนู <strong>SQL Editor</strong> ที่แทบเมนูด้านซ้าย</li>
                  <li>คลิกปุ่ม <strong>New Query</strong></li>
                  <li>คัดลอกชุดคำสั่ง SQL ด้านล่างนี้ไปวาง และกดปุ่ม <strong>Run</strong></li>
                  <li>เมื่อตารางถูกสร้างขึ้นเสร็จสิ้น ระบบจะสลับมาดึงและบันทึกฐานข้อมูลจริงแบบ 100% ทันที (ไม่ต้องดาวน์โหลดหรือรีโหลดระบบ!)</li>
                </ol>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center bg-slate-900 border-b border-slate-800 px-4 py-2 rounded-t-lg">
                    <span className="font-mono text-[11px] text-amber-400 font-bold">SQL Initializer Script</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(supabaseStatus.sqlInstructions);
                        setIsSqlCopied(true);
                        onNotify("คัดลอกคำสั่ง SQL เรียบร้อย! กรุณานำไปใส่ใน SQL Editor ของ Supabase", "info");
                        setTimeout(() => setIsSqlCopied(false), 2000);
                      }}
                      className="py-1 px-2.5 bg-slate-800 text-slate-300 hover:text-white rounded text-[11px] font-medium transition-all flex items-center gap-1.5"
                    >
                      {isSqlCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Clipboard className="h-3 w-3" />}
                      {isSqlCopied ? 'คัดลอกสำเร็จ!' : 'คัดลอกคำสั่ง SQL'}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-auto rounded-b-lg max-h-[160px]">
                    <code>{supabaseStatus.sqlInstructions}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
                <span className="text-emerald-500 font-bold text-xl leading-none">✓</span>
                <div className="space-y-1 bg-transparent">
                  <h4 className="font-bold text-sm text-emerald-950">เชื่อมต่อฐานข้อมูลกูเกิลคลาวด์ Supabase สำเร็จ! ยกเลิก Mock Data แล้ว</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    ขณะนี้ระบบ ERP & MES กำลังเก็บรักษาข้อมูลจริงทั้งหมดของคุณอย่างไร้รอยต่อในตาราง <strong>{supabaseStatus.table}</strong> ของโปรเจกต์ Supabase (<span className="font-mono text-[10px] bg-emerald-100/60 px-1 py-0.5 rounded">{supabaseStatus.url.split('/')[2]}</span>) ตลอดเวลา ข้อมูลลูกค้า, รายงาน COA เกรดสารเคมี, ใบสรุปชั่งผลิต, ประวัติเครื่องจักรสะสม PM และประวัติทางการบัญชี จะไม่สูญหายอีกต่อไปแม้จะรีสตาร์ตระบบ
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'er' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Unified Shared Database ER Diagram (Master System Flow)</h3>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Relational Constraints Validated</span>
            </div>

            {/* Interactive SVG Canvas for ERD */}
            <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 overflow-x-auto">
              <div className="min-w-[1000px] h-[550px] relative">
                <svg className="w-full h-full" viewBox="0 0 1000 550">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                    </marker>
                  </defs>

                  {/* Relationships Lines */}
                  {/* Employees -> Departments */}
                  <path d="M 120 180 Q 200 130 250 110" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
                  {/* Formulas -> Products */}
                  <path d="M 500 100 L 750 100" fill="none" stroke="#2563eb" strokeWidth="2" markerEnd="url(#arrow)" />
                  {/* MO -> Products & Formula */}
                  <path d="M 620 280 L 760 180" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  {/* RepairTicket -> Machine */}
                  <path d="M 370 420 L 220 340" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3" markerEnd="url(#arrow)" />
                  {/* Payslips -> Payroll & Employees */}
                  <path d="M 680 430 Q 560 380 450 320" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" />

                  {/* NODE A: Employees Master */}
                  <g transform="translate(40, 180)">
                    <rect width="180" height="150" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <rect width="180" height="30" rx="8" fill="#475569" />
                    <text x="10" y="20" fill="#ffffff" fontWeight="bold" fontSize="12">employees</text>
                    <text x="10" y="45" fill="#ef4444" fontSize="11" fontWeight="bold">id : VARCHAR [PK]</text>
                    <text x="10" y="65" fill="#334155" fontSize="11">name : VARCHAR</text>
                    <text x="10" y="85" fill="#334155" fontSize="11">email : VARCHAR [UQ]</text>
                    <text x="10" y="105" fill="#0284c7" fontSize="11">department_id : [FK]</text>
                    <text x="10" y="125" fill="#0284c7" fontSize="11">role_id : [FK]</text>
                    <text x="10" y="140" fill="#334155" fontSize="11">salary : NUMERIC</text>
                  </g>

                  {/* NODE B: Departments Master */}
                  <g transform="translate(250, 40)">
                    <rect width="160" height="100" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <rect width="160" height="30" rx="8" fill="#64748b" />
                    <text x="10" y="20" fill="#ffffff" fontWeight="bold" fontSize="12">departments</text>
                    <text x="10" y="45" fill="#ef4444" fontSize="11" fontWeight="bold">id : VARCHAR [PK]</text>
                    <text x="10" y="65" fill="#334155" fontSize="11">name : VARCHAR</text>
                    <text x="10" y="85" fill="#334155" fontSize="11">code : VARCHAR [UQ]</text>
                  </g>

                  {/* NODE C: Product Master */}
                  <g transform="translate(750, 40)">
                    <rect width="180" height="150" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <rect width="180" height="30" rx="8" fill="#2563eb" />
                    <text x="10" y="20" fill="#ffffff" fontWeight="bold" fontSize="12">product_master</text>
                    <text x="10" y="45" fill="#ef4444" fontSize="11" fontWeight="bold">id : VARCHAR [PK]</text>
                    <text x="10" y="65" fill="#334155" fontSize="11">sku : VARCHAR [UQ]</text>
                    <text x="10" y="85" fill="#334155" fontSize="11">name : VARCHAR</text>
                    <text x="10" y="105" fill="#334155" fontSize="11">min_stock : INTEGER</text>
                    <text x="10" y="125" fill="#334155" fontSize="11">sell_price : NUMERIC</text>
                  </g>

                  {/* NODE D: Formulas */}
                  <g transform="translate(480, 40)">
                    <rect width="180" height="120" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <rect width="180" height="30" rx="8" fill="#0284c7" />
                    <text x="10" y="20" fill="#ffffff" fontWeight="bold" fontSize="12">formula_headers</text>
                    <text x="10" y="45" fill="#ef4444" fontSize="11" fontWeight="bold">id : VARCHAR [PK]</text>
                    <text x="10" y="65" fill="#0284c7" fontSize="11">product_id : [FK]</text>
                    <text x="10" y="85" fill="#334155" fontSize="11">version : VARCHAR</text>
                    <text x="10" y="105" fill="#334155" fontSize="11">status : VARCHAR</text>
                  </g>

                  {/* NODE E: Manufacturing Orders */}
                  <g transform="translate(520, 240)">
                    <rect width="200" height="150" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <rect width="200" height="30" rx="8" fill="#1e3a8a" />
                    <text x="10" y="20" fill="#ffffff" fontWeight="bold" fontSize="12">manufacturing_orders</text>
                    <text x="10" y="45" fill="#ef4444" fontSize="11" fontWeight="bold">id : VARCHAR [PK]</text>
                    <text x="10" y="65" fill="#0284c7" fontSize="11">product_id : [FK]</text>
                    <text x="10" y="85" fill="#0284c7" fontSize="11">formula_id : [FK]</text>
                    <text x="10" y="105" fill="#334155" fontSize="11">qty_requested : NUMERIC</text>
                    <text x="10" y="125" fill="#334155" fontSize="11">status : VARCHAR</text>
                    <text x="10" y="140" fill="#334155" fontSize="11">total_cost : NUMERIC</text>
                  </g>

                  {/* NODE F: Machine Master */}
                  <g transform="translate(40, 40)">
                    <rect width="160" height="110" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <rect width="160" height="30" rx="8" fill="#b91c1c" />
                    <text x="10" y="20" fill="#ffffff" fontWeight="bold" fontSize="12">machines (Master)</text>
                    <text x="10" y="45" fill="#ef4444" fontSize="11" fontWeight="bold">id : VARCHAR [PK]</text>
                    <text x="10" y="65" fill="#334155" fontSize="11">name : VARCHAR</text>
                    <text x="10" y="85" fill="#334155" fontSize="11">code : VARCHAR [UQ]</text>
                  </g>

                  {/* NODE G: Repair Tickets */}
                  <g transform="translate(280, 240)">
                    <rect width="180" height="140" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <rect width="180" height="30" rx="8" fill="#b91c1c" />
                    <text x="10" y="20" fill="#ffffff" fontWeight="bold" fontSize="12">repair_tickets</text>
                    <text x="10" y="45" fill="#ef4444" fontSize="11" fontWeight="bold">id : VARCHAR [PK]</text>
                    <text x="10" y="65" fill="#0284c7" fontSize="11">machine_id : [FK]</text>
                    <text x="10" y="85" fill="#334155" fontSize="11">priority : VARCHAR</text>
                    <text x="10" y="105" fill="#334155" fontSize="11">status : VARCHAR</text>
                  </g>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500">
              <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-red-600 rounded"></span>
                <span>PK: Primary Keys enforce exact tuple integrity.</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded"></span>
                <span>FK: Relational Cascade constraint mappings.</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded"></span>
                <span>BOM Schema is mapped to Formula/Material indexes.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ddl' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center py-3 px-6 bg-slate-900 border-b border-slate-800">
              <span className="font-mono text-xs text-blue-400">ideva-factory-os-postgres-ddl.sql</span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="py-1 px-3 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
              >
                {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Clipboard className="h-3 w-3" />}
                {isCopied ? 'Copied DDL!' : 'Copy Schema'}
              </button>
            </div>
            <pre className="p-6 text-emerald-400 font-mono text-xs overflow-auto max-h-[500px] leading-relaxed">
              <code>{ddlSql || '-- Loading PostgreSQL DDL scripts from server...'}</code>
            </pre>
          </div>
        )}

        {activeTab === 'debugger' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-2">Live Distributed JSON State Store Database (Express Core REST API)</h3>
              <p className="text-sm text-slate-500 mb-4">
                Verify exactly how transactions mutate our Express JSON state in real-time. This mirrors of a local Redis or PostgreSQL cache active inside Cloud Run.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-xs rounded-md">Total Materials: {dbDebuggerState?.materials?.length || 0}</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 font-mono text-xs rounded-md">Total Transactions: {dbDebuggerState?.transactions?.length || 0}</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 font-mono text-xs rounded-md">Open Repairs: {dbDebuggerState?.repairTickets?.filter((r: any)=>r.status !== 'Resolved').length || 0}</span>
                <span className="px-3 py-1 bg-rose-50 text-rose-700 font-mono text-xs rounded-md">Active Emp: {dbDebuggerState?.employees?.length || 0}</span>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl overflow-auto max-h-[350px]">
                <pre className="text-xs text-sky-400 font-mono">
                  {dbDebuggerState ? JSON.stringify(dbDebuggerState, null, 2).slice(0, 5000) + "\n... [Truncated for developer performance visualization]" : "Loading live RAM state..."}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
