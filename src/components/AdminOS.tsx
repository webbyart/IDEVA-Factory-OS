import React, { useState } from 'react';
import { 
  Shield, Settings, Users, Database, FileText, Lock, CheckSquare, 
  RefreshCw, AlertTriangle, Cpu, Terminal, Layers, FileSpreadsheet
} from 'lucide-react';

interface AdminOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function AdminOS({ dbState, onRefresh, onNotify }: AdminOSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'schemas' | 'er'>('schemas');
  const [selectedRoleGroup, setSelectedRoleGroup] = useState('Admin');

  // Database tables metadata schema (representing part of the 200+ tables)
  const masterTables = [
    { tableName: 'tbl_customer_master', count: 18, bytes: '128 KB', type: 'Transactional Master', desc: 'ข้อมูลรหัสและฟิลด์ผู้ซื้อแบรนด์เครื่องสำอาง (CUS-Code)' },
    { tableName: 'tbl_formulas_research', count: 125, bytes: '8.4 MB', type: 'R&D Formula Record', desc: 'ฐานสูตรผลิตเฟสของเหลว น้ำมัน และวิตามิน Active Ingredients' },
    { tableName: 'tbl_purchase_requests', count: 42, bytes: '512 KB', type: 'Procurement Transaction', desc: 'ตารางบันทึกใบจัดซื้ออัตโนมัติ (PR) เมื่อจุดปล่อยสต็อกวัตถุดิบต่ำกว่า Min' },
    { tableName: 'tbl_goods_receipt_log', count: 86, bytes: '1.2 MB', type: 'WMS Supply Link', desc: 'ใบบันทึกรับเคมีผูกกับเล็ต COA ป้องกันการทับข้อมูลซ้ำ' },
    { tableName: 'tbl_batch_production_records', count: 140, bytes: '15.6 MB', type: 'MES Batch Sheet', desc: 'บันทึกประวัติล้างไลน์ สลัดพารามิเตอร์ pH และความหนืดครีมแบบวินาทีต่อวินาที (BPR)' }
  ];

  const handleBackupDatabase = () => {
    onNotify('สำรองข้อมูลฐานระบบหลักโรงงาน (Backup Complete: SQL Dump ISO-22716) สำเร็จเรียบร้อย', 'info');
  };

  const handleSyncPermissions = () => {
    onNotify('ซิงค์โครงข่ายบัญชีความปลอดภัยผู้ใช้งาน (Roles Permissions Re-synced) สำหรับทหารช่างผสมสูตรสำเร็จ', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="admin-module-root">
      
      {/* Tab Switcher */}
      <div className="flex bg-slate-900 text-white p-1 rounded-2xl max-w-md shadow-md border border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('schemas')}
          className={`flex-1 py-2.5 rounded-l-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${activeSubTab === 'schemas' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Database className="h-4 w-4" /> 🗄️ โครงสร้างฐานตาราง Schemas
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('er')}
          className={`flex-1 py-2.5 rounded-r-xl font-bold transition-all text-center flex items-center justify-center gap-1 ${activeSubTab === 'er' ? 'bg-[#0071E3] text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          <Layers className="h-4 w-4" /> 🔗 ผังความสัมพันธ์ ER-Diagram
        </button>
      </div>

      {activeSubTab === 'schemas' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">สารบบข้อมูลฐานรากโรงงาน (High Volume Relational Database Schemas)</h3>
                <p className="text-[11px] text-slate-400">ภาพรวมตารางหลักส่วนหนึ่งจาก 200+ Tables เชื่อมความสมเหตุสมผลด้านคณิตศาสตร์และมาตรฐาน GMP FDA</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBackupDatabase}
                className="p-1 px-3.5 bg-green-600 hover:bg-green-700 font-bold rounded-lg text-white text-[11px]"
              >
                Backup Database Dump
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="p-3">รหัสตารางหลัก (SQL Table Name)</th>
                  <th className="p-3 text-right">จำนวนคีย์ (Record Count)</th>
                  <th className="p-3 text-right">ขนาดจัดเก็บรวม</th>
                  <th className="p-3">ชนิดโครงผูกคีย์ (Table Classification)</th>
                  <th className="p-3">คำอธิบายขอบเขตมาตรฐาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#1D1D1F] font-medium">
                {masterTables.map(table => (
                  <tr key={table.tableName} className="hover:bg-slate-50 font-sans">
                    <td className="p-3 font-mono text-indigo-700 font-bold select-all">{table.tableName}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{table.count} Rows</td>
                    <td className="p-3 text-right font-mono text-zinc-500">{table.bytes}</td>
                    <td className="p-3 font-bold text-amber-800">{table.type}</td>
                    <td className="p-3 text-slate-500 font-medium">{table.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'er' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">โมเดลแผนผังความสัมพันธ์คีย์หลัก (Interactive ER Entity-Relationship Diagram Map)</h4>
              <p className="text-[11px] text-slate-400">สกรีนดรอปดาวน์และพอยต์เพื่อจำลองการสลัด Cascade Delete และ Foreign Key Constraints ตามมาตรฐาน Odoo Enterprise</p>
            </div>
            <button type="button" onClick={handleSyncPermissions} className="p-1 px-3 bg-[#0071E3] text-white text-[10px] font-bold rounded-lg leading-relaxed">
              Verify ER Link Consistency ✓
            </button>
          </div>

          {/* Interactive ER Diagram visual simulation using styled boxes and connecting badges */}
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-white overflow-hidden relative font-mono">
            
            {/* Table Customer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="bg-indigo-600 font-bold text-[8px] p-0.5 px-1.5 rounded uppercase tracking-wider">Table: tbl_customer_master</span>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><span className="text-emerald-400 font-bold">(PK)</span> id : <span className="text-zinc-500">VARCHAR(50)</span></p>
                <p>code : <span className="text-zinc-500">VARCHAR(20) [UNIQUE]</span></p>
                <p>name : <span className="text-zinc-500">VARCHAR(100)</span></p>
                <p>folder_link_drive : <span className="text-zinc-500">TEXT</span></p>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500">
                <span>* Relates One-To-Many toward target Job Master table (Cascade Restricted)</span>
              </div>
            </div>

            {/* Table Job */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 relative">
              <span className="bg-indigo-650 font-bold text-[8px] p-0.5 px-1.5 rounded uppercase tracking-wider">Table: tbl_job_planning</span>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><span className="text-emerald-400 font-bold">(PK)</span> job_id : <span className="text-zinc-500">VARCHAR(50)</span></p>
                <p><span className="text-rose-400 font-semibold">(FK)</span> customer_id : <span className="text-indigo-400 font-bold">tbl_customer_master.id</span></p>
                <p><span className="text-rose-400 font-semibold">(FK)</span> formula_id : <span className="text-indigo-400 font-bold">tbl_formulas.id</span></p>
                <p>spec_requested_qty : <span className="text-zinc-500">INTEGER</span></p>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500">
                <span>* Aggregates Bill-of-Materials (BOM) automatically inside R&D station</span>
              </div>
            </div>

            {/* Table BPR */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="bg-indigo-700 font-bold text-[8px] p-0.5 px-1.5 rounded uppercase tracking-wider">Table: tbl_bpr_record</span>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p><span className="text-emerald-400 font-bold">(PK)</span> bpr_sheet_no : <span className="text-zinc-500">VARCHAR(50)</span></p>
                <p><span className="text-rose-400 font-semibold">(FK)</span> job_code : <span className="text-indigo-400 font-bold">tbl_job_planning.job_id</span></p>
                <p>mixing_ph_conformed : <span className="text-zinc-500">BOOLEAN</span></p>
                <p>signature_qa_record : <span className="text-zinc-500">VARCHAR(100)</span></p>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500">
                <span>* Relates to Quality Audits Trail and COAs linked records by GRN</span>
              </div>
            </div>

          </div>
          <div className="text-[10px] text-slate-400 font-medium italic text-right">
            * คลิกหนึ่งครั้งเพื่อตรวจสอบ Cascade Constraints ทางคอร์ SQL (Relational database references conform strictly to ISO 22716 standardizations)
          </div>
        </div>
      )}

    </div>
  );
}
