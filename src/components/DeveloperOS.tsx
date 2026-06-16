import React, { useState, useEffect } from 'react';
import { Database, FileText, Clipboard, Check, RefreshCw, Globe, Server, HelpCircle, ArrowRight } from 'lucide-react';

interface DeveloperOSProps {
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
}

export default function DeveloperOS({ onNotify }: DeveloperOSProps) {
  const [activeTab, setActiveTab] = useState<'er' | 'ddl' | 'debugger' | 'supabase' | 'deployment'>('supabase');
  const [ddlSql, setDdlSql] = useState<string>('');
  const [dbDebuggerState, setDbDebuggerState] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSqlCopied, setIsSqlCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [customApiUrl, setCustomApiUrl] = useState<string>(localStorage.getItem("FACTORY_API_URL") || '');
  const [currentOriginUrl, setCurrentOriginUrl] = useState<string>('');

  useEffect(() => {
    setCurrentOriginUrl(window.location.origin);
  }, []);

  const handleSaveApiUrl = () => {
    const trimmed = customApiUrl.trim();
    if (trimmed) {
      localStorage.setItem("FACTORY_API_URL", trimmed);
      onNotify("บันทึกที่อยู่เซิร์ฟเวอร์ Express เรียบร้อย! เปลี่ยนเส้นทางส่งข้อมูลทางอ้อมสำเร็จ", "info");
    } else {
      localStorage.removeItem("FACTORY_API_URL");
      onNotify("สลับระบบเกตเวย์กลับเข้าใช้เซิร์ฟเวอร์หลักของ AI Studio สำเร็จ", "info");
    }
    fetchDebuggerState();
    fetchSupabaseStatus();
  };

  const handleClearApiUrl = () => {
    localStorage.removeItem("FACTORY_API_URL");
    setCustomApiUrl('');
    onNotify("ยกเลิก API เคลียร์ค่าว่าง! ระบบสลับกลับสู่เซิร์ฟเวอร์พรีวิวเรียบร้อย", "info");
    fetchDebuggerState();
    fetchSupabaseStatus();
  };


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

  const hardResetDb = async (type?: 'clean' | 'mock') => {
    const confirmMsg = type === 'clean' 
      ? 'คุณแน่ใจว่าต้องการเคลียร์ล้างข้อมูลทั้งหมดกระดานเป็นค่าว่าง? การกระทำนี้จะล้างข้อมูลตัวอย่าง (Mock Data) ทั้งหมดเพื่อเริ่มบันทึกงานใหม่'
      : type === 'mock'
        ? 'คุณแน่ใจว่าต้องการโหลดข้อมูลจำลองต้นแบบสำเร็จรูป (Mock Data)? การกระทำนี้จะลงทับประวัติปัจจุบันและใส่ประวัติโรงงานพร้อมชาร์ตสรุปเพื่อความรวดเร็วในการทดสอบ'
        : 'คุณแน่ใจว่าต้องการกู้คืนข้อมูลสดจากคลาวด์ Supabase โดยยกเลิกการปรับปรุงในหน่วยความจำชั่วคราว?';
        
    if(!window.confirm(confirmMsg)) return;
    setLoading(true);
    try {
      const url = type ? `/api/state/reset?type=${type}` : '/api/state/reset';
      const res = await fetch(url, { method: 'POST' });
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
              แสดงแผนผังความสัมพันธ์เชิงสัมพันธ์แบบคีย์เชื่อมโยง (Entity Relation Schema) และจัดการล้างข้อมูล Mock Data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
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
            onClick={() => hardResetDb('mock')}
            disabled={loading}
            className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1"
          >
            🌱 โหลดชุดข้อมูลจำลอง (Load Demo Seeds)
          </button>

          <button
            type="button"
            onClick={() => hardResetDb('clean')}
            disabled={loading}
            className="px-4 py-1.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/15 text-[#FF3B30] font-medium text-xs rounded-xl border border-[#FF3B30]/20 transition-colors flex items-center gap-1"
          >
            🗑️ เคลียร์ประวัติจำลองเป็นค่าว่าง (Clear Mock Data)
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
          onClick={() => setActiveTab('deployment')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeTab === 'deployment' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          🌐 การเชื่อมต่อ Netlify & API Gateway
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
        {activeTab === 'deployment' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-500" />
                  <span>Netlify Deploy Gateway & Express API Setup</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">ตั้งค่าช่องทางเชื่อมโยงเมื่อติดตั้ง App บน Netlify เพื่อเปลี่ยนไปคุยกับเซิร์ฟเวอร์ฐานข้อมูลหลังบ้าน</p>
              </div>
            </div>

            <div className="p-5 bg-amber-50 border border-amber-200/80 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4" />
                ทำไม Deploy บน Netlify แล้วถึงแจ้งว่า "เชื่อมต่อ Supabase ไม่ได้"?
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                เนื่องจาก Netlify เป็นแพลตฟอร์มแบบ <strong>Static Host (Single Page Application)</strong> ซึ่งจะทำหน้าที่ดาวน์โหลดและติดตั้งเพียงหน้ากาก UI (React Code) เท่านั้น! ขณะที่ระบบบริหารโรงงานหลังบ้าน (Express JS Server) ซึ่งบรรจุสูตรการคำนวณขั้นสูง การซิงค์และบันทึกลงสู่ Supabase รวมถึง AI Copilot <strong>จะไม่ได้ถูกรันอยู่บน Netlify</strong> การส่งคำสั่งดึงฐานข้อมูลปกติผ่านช่องทาง <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[10.5px]">/api/*</code> จึงคืนค่า 404
              </p>
              <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                💡 ทางแก้ไขที่ง่ายและดีที่สุดมี 2 แนวทางหลัก:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 bg-white bg-opacity-70 rounded-lg border border-amber-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span className="bg-[#1D1D1F] text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px]">1</span>
                    ใช้อีเวนต์เกตเวย์ AI Studio (สตรีมมิ่งเซิร์ฟเวอร์รวดเร็ว)
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    คุณสามารถคัดลอก URL ของเซิร์ฟเวอร์ที่กำลังรันพรีวิวอยู่ขณะนี้จาก AI Studio ไปวางเซ็ตที่บราวเซอร์ Netlify ของคุณได้ทันที แอปพลิเคชันบน Netlify จะส่งคำสั่งควบคุมมาที่เซิร์ฟเวอร์นี้และเชื่อมลง Supabase ตลอดเวลา
                  </p>
                </div>
                <div className="p-3.5 bg-white bg-opacity-70 rounded-lg border border-amber-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span className="bg-[#1D1D1F] text-white w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px]">2</span>
                    โฮสต์เซิร์ฟเวอร์ Express แยกภายนอก
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    การทำระบบจริงในโปรดักชัน คุณสามารถนำโค้ดในโปรเจกต์นี้ไปฝาก Express API Server ไว้บนผู้ให้บริการ Node.js ฟรี เช่น <strong>Render.com</strong>, <strong>Railway.app</strong> หรือ <strong>Fly.io</strong> แล้วระบุเกตเวย์รับ-ส่งได้ทันที
                  </p>
                </div>
              </div>
            </div>

            {/* Config Panel */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Server className="h-4 w-4 text-indigo-500" />
                แผงควบคุมการรับส่ง API Gateway (บราวเซอร์นี้ส่งทางอ้อม)
              </h4>
              <p className="text-[11.5px] text-slate-600 leading-normal">
                หากต้องการให้ Netlify ของหน้าต่างนี้ส่งข้อมูลลงทะเบียนไปที่เซิร์ฟเวอร์ที่กำหนด ป้อนที่อยู่ของ Backend แล้วกดบันทึก ข้อมูลทั้งหมดจะถูกส่งถ่ายโอนได้อย่างไร้รอยต่อ
              </p>

              <div className="space-y-3">
                <div className="flex gap-2 flex-col sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="เช่น https://ideva-express.onrender.com"
                      value={customApiUrl}
                      onChange={(e) => setCustomApiUrl(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-inner text-slate-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveApiUrl}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    💾 บันทึกเกตเวย์เชื่อมโยง
                  </button>
                  {customApiUrl && (
                    <button
                      type="button"
                      onClick={handleClearApiUrl}
                      className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
                    >
                      ยกเลิก & รีเซ็ต
                    </button>
                  )}
                </div>

                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                  <div className="flex justify-between items-start flex-col sm:flex-row gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-indigo-950">🔗 พิกัดรหัสพรีวิวเซิร์ฟเวอร์ AI Studio คอนเทนเนอร์ของคุณขณะนี้:</div>
                      <div className="text-[10.5px] font-mono text-indigo-700 select-all font-semibold break-all bg-indigo-100/40 py-1 px-2 rounded border border-indigo-200/50">
                        {currentOriginUrl}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomApiUrl(currentOriginUrl);
                        navigator.clipboard.writeText(currentOriginUrl);
                        onNotify("คัดลอกที่ตั้งต้นแบบ AI Studio Server แล้ว! พร้อมสำหรับการรัน Netlify", "info");
                      }}
                      className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] rounded-lg font-medium transition-colors flex items-center gap-1 self-stretch sm:self-auto text-center justify-center whitespace-nowrap"
                    >
                      คัดลอกและใส่ทันที <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-indigo-900/70 mt-1 leading-relaxed">
                    *เมื่อคุณเปิดหน้าเว็บ Netlify (https://ideva-product-os.netlify.app/) ในเบราว์เซอร์นี้ ให้กดเข้าแท็บ <strong>Developer OS</strong> นี้นำพิกัดนี้ไปป้อนปุ่มบน Netlify แอปบน Netlify จะคุยกับเซิร์ฟเวอร์ใน AI Studio ตรงนี้และดึงข้อมูลลง Supabase ได้ทันที!
                  </p>
                </div>
              </div>
            </div>

            {/* Build guideline */}
            <div className="p-5 border border-slate-200/80 rounded-2xl space-y-4 shadow-sm bg-white">
              <h4 className="font-bold text-xs text-slate-800">🛠️ แนะนำวิธีการติดตั้งและ Deployment ในบทบาท Production</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                เนื่องจากแพ็กเกจนี้ถูกสร้างขึ้นมาให้เป็น <strong>Full-stack Node.js (Express + React)</strong> บนสถาปัตยกรรมระดับอุตสาหกรรม การอัปโครงสร้างจริงทั้งหมดไปเก็บไว้บนโฮสต์ของคุณให้มีประสิทธิภาพสูงสุด สามารถตั้งค่าได้ง่ายดาย:
              </p>

              <ol className="text-xs text-slate-600 list-decimal pl-5 space-y-3 leading-relaxed">
                <li>
                  <span className="font-semibold text-slate-900">อัปเลเยอร์ Node.js ไปใช้เซิร์ฟเวอร์ Express ถาวร</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    นำไฟล์ต้นฉบับบทความทั้งหมดของระบบ ไปฝากไว้ที่ Render/Railway ซึ่งจะคอมไพล์ <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">server.ts</code> และเปิดพอร์ตรอรับคำสั่ง (ระบบเซ็ตไว้ที่พอร์ต 3000 และคุยกับ Supabase ตรงจุดนี้แบบปลอดภัย 100%)
                  </p>
                </li>
                <li>
                  <span className="font-semibold text-slate-900">กำหนด Environment Variables บนเซิร์ฟเวอร์ภายนอกของคุณ:</span>
                  <div className="bg-slate-900 text-slate-300 font-mono text-[10.5px] p-3 rounded-lg mt-1 space-y-1 leading-relaxed">
                    <div>SUPABASE_URL=https://your-project.supabase.co/rest/v1/</div>
                    <div>SUPABASE_KEY=your-service-role-or-anon-key</div>
                    <div>GEMINI_API_KEY=your-gemini-cognitive-key (สำหรับพึ่งพาระบบ AI Copilot)</div>
                  </div>
                </li>
                <li>
                  <span className="font-semibold text-slate-900">กำหนดตัวแปรฝั่ง Netlify Static UI (เลือกได้):</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    คุณสามารถไปเพิ่มตัวแปรสิ่งแวดล้อมที่แอปพลิเคชัน Netlify ของคุณในหัวข้อ Custom Env:
                  </p>
                  <div className="bg-slate-900 text-slate-300 font-mono text-[10.5px] p-3 rounded-lg mt-1 space-y-1.5">
                    <div>VITE_API_URL=https://your-express-app.onrender.com <span className="text-emerald-400 text-[9.5px] ml-2">// ชี้หน้ากากมาหา Express</span></div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

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
              <div className="space-y-4 bg-transparent">
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
                  <span className="text-emerald-500 font-bold text-xl leading-none">✓</span>
                  <div className="space-y-1 bg-transparent">
                    <h4 className="font-bold text-sm text-emerald-950">เชื่อมต่อฐานข้อมูลกูเกิลคลาวด์ Supabase สำเร็จ! ยกเลิก Mock Data แล้ว</h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      ขณะนี้ระบบ ERP & MES กำลังเก็บรักษาข้อมูลจริงทั้งหมดของคุณอย่างไร้รอยต่อในตาราง <strong>{supabaseStatus.table}</strong> ของโปรเจกต์ Supabase (<span className="font-mono text-[10px] bg-emerald-100/60 px-1 py-0.5 rounded">{supabaseStatus.url.split('/')[2]}</span>) ตลอดเวลา ข้อมูลลูกค้า, รายงาน COA เกรดสารเคมี, ใบสรุปชั่งผลิต, ประวัติเครื่องจักรสะสม PM และประวัติทางการบัญชี จะไม่สูญหายอีกต่อไปแม้จะรีสตาร์ตระบบ
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center flex-col sm:flex-row gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-amber-900">⚠️ พบปัญหากการบันทึก / บันทึกประวัติล้มเหลว (RLS Violations)?</h4>
                      <p className="text-[10.5px] text-amber-700 mt-0.5 leading-relaxed">
                        หากคุณแยกตารางสัมพันธ์บน Supabase แล้วเจอปัญหาระบุสิทธิ์ (Error 42501 / 401: violates row-level security policy), กรุณาคัดลอก SQL นี้ไปรันใน SQL Editor ของ Supabase เพื่อปลดบล็อกสิทธิ์ลงบันทึกในตารางสัมพัทธ์ทั้งหมดได้อย่างสมบูรณ์แบบ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const rlsBypassSql = `-- Disable Row Level Security (RLS) on all relational tables for seamless ERP sync\n` +
                          `ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.customer_master DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.supplier_master DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.product_master DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.material_master DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.formula_headers DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.formula_details DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.manufacturing_orders DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.purchase_requests DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.goods_receipts DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.qc_inspections DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.machines DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.pm_tasks DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.repair_tickets DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.attendance_records DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.payroll_periods DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.payslips DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.account_transactions DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;\n` +
                          `ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;`;
                        navigator.clipboard.writeText(rlsBypassSql);
                        onNotify("คัดลอกคำสั่งปลดบล็อก RLS เรียบร้อย! สำหรับนำไปรันใน SQL Editor ของ Supabase เพื่อลดข้อขัดแย้งของระบบสำเร็จ", "info");
                      }}
                      className="py-1.5 px-3 bg-[#1D1D1F] hover:bg-[#2D2D2F] text-white text-[11px] rounded-lg font-semibold transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
                    >
                      คัดลอก SQL ปลด RLS ตารางทั้งหมด
                    </button>
                  </div>
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
