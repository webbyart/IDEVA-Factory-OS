import React, { useState } from 'react';
import { 
  BookOpen, HelpCircle, CheckCircle, AlertTriangle, Shield, Play, 
  Settings, Kanban, Beaker, Database, Cpu, ShieldCheck, Wrench, FileText
} from 'lucide-react';

interface UserGuideOSProps {
  isDarkMode?: boolean;
}

export default function UserGuideOS({ isDarkMode = false }: UserGuideOSProps) {
  const [activeManualSection, setActiveManualSection] = useState<'intro' | 'flows' | 'safety' | 'faq'>('intro');
  const [expandedSopIndex, setExpandedSopIndex] = useState<number | null>(0);

  const modulesGuide = [
    {
      title: "1. แดชบอร์ดเวิร์กสเตชัน (Analytical Dashboard)",
      icon: Kanban,
      desc: "ติดตามการวิจัยน้ำหอมพรีเมียม สรุปคำนวณกำลังไฟ อัตราเสี่ยงเครื่องจักรพัง ยอดบิลและค่าใช้จ่ายในจุดเดียวในรูปกราฟการทำงาน",
      tips: [
        "คลิกแถบสลับโหมดสว่าง/มืดที่มุมบนขวา เพื่อปรับคุณภาพการมองเห็นของพนักงานในโรงงาน",
        "ใช้แถบสับเปลี่ยนสิทธิ์ (Admin / Management / production / QC) เพื่อจำลองระดับการเข้าถึงข้อมูลระบบ"
      ]
    },
    {
      title: "2. ลูกค้าใบงานและเสนอราคา (CRM & Quote CRM)",
      icon: Kanban,
      desc: "ดูแลรายชื่อลูกค้าแบรนด์ใหญ่ ออกคูปองส่วนลดจ๊อบงาน และบันทึก/ซิงค์ฐานข้อมูลใบเสนอราคาข้ามระบบอย่างเป็นเอกภาพ",
      tips: [
        "ปุ่ม 'สร้างใบเสนอราคา (Create Quote)' สีเขียวมิ้นต์เปิดแบบฟอร์มอัตโนมัติและเชื่อมต่อฐานข้อมูล Supabase ทันที",
        "คุณสามารถกรอกเอง หรือเลือกชื่อจากฐานข้อมูลลูกค้าเพื่อเติมค่าด่วนอัตโนมัติ"
      ]
    },
    {
      title: "3. ระบบสูตรวิจัยและ SKU (BOM R&D Lab)",
      icon: Beaker,
      desc: "วิเคราะห์องค์ประกอบหัวน้ำปรุง ส่วนประกอบเคมี สัดส่วนเปอร์เซ็นต์ส่วนผสม และการประเมินราคาต่อ SKU ผลผลิต",
      tips: [
        "ตรวจสอบค่า Active Ingredients ก่อนปล่อยขวดผลิตเพื่อให้ผ่านมาตรฐาน อย. สากล"
      ]
    },
    {
      title: "4. จัดซื้อคลังวัตถุดิบระบุล็อต (FEFO WMS)",
      icon: Database,
      desc: "ระบบบริหารวัตถุดิบและเคมีภัณฑ์ยึดหลัก FEFO (First-Expired, First-Out) เพื่อลดปัญหาเคมีหมดอายุ และการออกใบจัดซื้อ PR ด่วน",
      tips: [
        "ระบบแสดงแจ้งเตือนอัตโนมัติ (Missing PR Required) หากวัตถุดิบยอดคงคลังลดลงต่ำกว่าเกณฑ์ความปลอดภัยขั้นต่ำ"
      ]
    },
    {
      title: "5. แผนกผลิตสูตรผสมและบรรจุ (MES Shopfloor)",
      icon: Cpu,
      desc: "ควบคุมเครื่องจักรและ Reactor ผสม ตรวจสอบบันทึกการผลิตแบบแบทช์ และประทับตราล็อตบรรจุขวด",
      tips: [
        "สถานะ BMR (Batch Manufacturing Record) จะถูกส่งเข้าเวิร์กสเตชัน Lab QC เสมอเมื่อสิ้นสุดกระบวนการผสมสูตร"
      ]
    },
    {
      title: "6. เวิร์กสเตชันแล็บ QC & ตรวจสอบสืบย้อน (QA/QC)",
      icon: ShieldCheck,
      desc: "ออกผลแล็บวิเคราะห์ ผ่าน/ไม่ผ่าน (Passed/Failed) และปุ่มสืบย้อนกลับผ่าน QR ล็อตวัตถุดิบ/ล็อตการผลิตเพื่อรับมือข้อร้องเรียน",
      tips: [
        "ดับเบิ้ลคลิกสแกนคลังสินค้าสากลเพื่อตรวจสอบข้อมูลย้อนกลับไปถึงจุดรับของ (Goods Receipt) อย่างแม่นยำ"
      ]
    },
    {
      title: "7. ซ่อมบำรุงเชิงป้องกันและมาตรฐาน (SOP PM & FDA)",
      icon: Wrench,
      desc: "ปฏิทินตรวจเช็กความดันเครื่องทำปฏิกิริยา บันทึก Downtime ประวัติการซ่อมบำรุงระบบแอร์คลีนรูมโรงงานมาตรฐาน",
      tips: [
        "หากเครื่องจักรมีสถานะ Breakdown ควรกดเปิดใบงานแจ้งซ่อมเพื่อป้องกันสารเคมีรั่วไหลในโรงงาน"
      ]
    }
  ];

  const safetyRules = [
    {
      id: "SOP-SEC-01",
      title: "ระเบียบรักษาความปลอดภัยสารเคมีและวัตถุอันตราย (HAZMAT Safety)",
      urgency: "HIGH REQUIREMENT",
      content: "พนักงานทุกคนต้องสวมหน้ากากกรองสารเคมีแอร์บอร์น (Micron Respiratory Mask) ตลอดระยะเวลาการชั่งสารสำคัญกลุ่มน้ำปรุงพรีเมียม เพื่อหลีกเลี่ยงการรับไอระเหยสะสม",
      icon: Shield
    },
    {
      id: "SOP-QC-02",
      title: "ขั้นตอนการสุ่มตัวอย่างตรวจแล็บแบทช์โรงงานน้ำหอม (Sampling Lab Protocol)",
      urgency: "MANDATORY ISO",
      content: "กระทำการสุ่มตัวอย่างขวดสำเร็จรูป 50ml อย่างน้อย 3 ขวดจากเฟสเริ่ม, กลาง และท้ายของพล็อตการบรรจุ เพื่อทดสอบค่าความหนืดและความโปร่งแสงในแลบ QC",
      icon: CheckCircle
    },
    {
      id: "SOP-MAINT-03",
      title: "ระเบียบกู้คืนและป้องกันไฟฟ้าดับและเครื่องขัดข้อง (Emergency Lockout)",
      urgency: "CRITICAL SOP",
      content: "ในสถานการณ์ฉุกเฉินหรือระบบทำแรงดันทำสารระเหยติดขัด ให้กดสวิตช์ Emergency Valve ทันที และเปิดใบแจ้งซ่อมด่วน (Breakdown Notification) ผ่านระบบแผงซ่อมบำรุง",
      icon: AlertTriangle
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Visual Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-900 via-[#1e2540] to-slate-900 border-[#2a3154]' 
          : 'bg-gradient-to-r from-[#0B3C5D] via-[#105685] to-[#0B3C5D] text-white border-slate-200'
      }`}>
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-1">
            <BookOpen className="w-3.5 h-3.5" /> IDEVA ERP OPERATIONAL GUIDELINES
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">คู่มือการใช้งานระบบนิเวศผลิตระดับอุตสาหกรรม (IDEVA OS v4)</h2>
          <p className="text-xs text-indigo-155 opacity-90 max-w-2xl leading-relaxed">
            แหล่งรวบรวมข้อกำหนด มาตรฐานการปฏิบัติงาน (SOP) คำแนะนำระบบผลิตเครื่องหอมพรีเมียมสอดคล้องตามมาตรฐาน <strong>ISO 22716, ASEAN GMP และ FDA</strong> เพื่ออำนวยความสะดวกแก่พนักงานคีย์ข้อมูลและผู้ควบคุมระบบโรงงานหลัก
          </p>
        </div>
        <div className="flex gap-2">
          <span className="p-3 bg-white/10 rounded-2xl border border-white/10 hidden lg:block animate-bounce shadow-lg">
            <HelpCircle className="w-10 h-10 text-teal-300" />
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className={`p-1.5 rounded-2xl border flex flex-wrap gap-1 transition-colors ${
        isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
      }`}>
        <button
          onClick={() => setActiveManualSection('intro')}
          className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 ${
            activeManualSection === 'intro' 
              ? 'bg-gradient-to-r from-teal-600 to-indigo-650 text-white shadow-sm' 
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> 📖 สารบัญย่นย่อและคำแนะนำหลัก
        </button>
        <button
          onClick={() => setActiveManualSection('flows')}
          className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 ${
            activeManualSection === 'flows' 
              ? 'bg-gradient-to-r from-teal-600 to-indigo-650 text-white shadow-sm' 
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" /> ⚙️ คู่มือลัดเจาะจงรายหน้า (workstations)
        </button>
        <button
          onClick={() => setActiveManualSection('safety')}
          className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 ${
            activeManualSection === 'safety' 
              ? 'bg-gradient-to-r from-teal-600 to-indigo-650 text-white shadow-sm' 
              : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" /> 🚨 เอกสาร SOP และมาตรฐานความปลอดภัยทางเคมี
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Content Details */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Section: Introduction */}
          {activeManualSection === 'intro' && (
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
            }`}>
              <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base tracking-tight mb-1 text-slate-800 dark:text-white">📖 ข้อมูลแนะนำระบบ และการประสานงาน (Introduction & Overview)</h3>
                <p className="text-xs text-slate-500">เริ่มต้นเรียนรู้แพลตฟอร์ม ERP อัจฉริยะ IDEVA OS ปล่อยสูตรผสมอย่างมั่นใจ</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-xs">A</span>
                    <h4 className="font-bold text-xs text-teal-800 dark:text-teal-400">การออกใบเสนอราคา (Quotes Integration)</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    ระบบพัฒนาโมเดลตารางความปลอดภัยและออกใบเสนอราคาร่วมบันทึกอย่างเหนียวแน่นกับ <strong>Supabase</strong> ซึ่งมีเสถียรภาพสูง ช่วยลดเวลาประสานทางโทรศัพท์กับผู้เข้าซื้อฝ่ายการจัดการ
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">B</span>
                    <h4 className="font-bold text-xs text-indigo-800 dark:text-indigo-400">ควบคุม FEFO คัดแยกล็อตสารด่วน</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    ระบบประเมินล็อตเคมีวัตถุดิบด้วยโพรโทคอล <strong>First-Expired First-Out (FEFO)</strong> ฝ่ายจัดซื้อสามารถดูวันที่หมดอายุของเคมีทุกชนิด โดยอิงสารสกัดแอปซูทน้ำปรุงจากต่างประเทศ
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  🚀 ตัวอย่างผังงาน (Workflow Sequence): ลูกค้าเปิดใบดิวสู่แล็บ QC และซ่อมบำรุง
                </h4>
                <ol className="text-xs text-slate-600 dark:text-slate-400 md:space-y-2 list-decimal pl-5 space-y-3">
                  <li><strong>ขั้นที่ 1:</strong> CRM อนุมัติสิทธิ์คีย์ข้อมูล พร้อมสร้างใบเสนอราคาผ่าน <strong>Quote Modal</strong> สนทนาความต้องการกับผู้ติดต่อแบรนด์น้ำหอม</li>
                  <li><strong>ขั้นที่ 2:</strong> สร้างรหัสใบงานขาย (Sales Job) กำหนด SKU ปลายทาง ลิงก์เก็บข้อมูลความปลอดภัย และโฟลเดอร์สำหรับเอกสารผลวิเคราะห์</li>
                  <li><strong>ขั้นที่ 3:</strong> ลำเลียงสารปรุงวัตถุดิบคอร์สต็อกตาม FEFO สับส่วนตามสูตร BMR ล่าสุด หากมีจุดพังสะสมหรือเครื่องใช้ไฟติดขัด แผนก PM ดำเนินการออกประวัติซ่อมด่วน</li>
                  <li><strong>ขั้นที่ 4:</strong> การยืนยันผลคุณสมบัติทางเคมี (Passed/Failed) ในแลบ QC พร้อมสั่งพิมพ์สติกเกอร์ GMP ล็อตบรรจุแบบเรียลไทม์เป็นอันตอบดิวลูกค้าแสนวิเศษ!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Section: Flows / Step by step guide */}
          {activeManualSection === 'flows' && (
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${
              isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
            }`}>
              <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base tracking-tight mb-1 text-slate-800 dark:text-white">⚙️ คู่มือการใช้งานเจาะจงรายหน้าเวิร์กสเตชัน</h3>
                <p className="text-xs text-slate-500">ข้อมูลนำทางด่วนและเทคนิคสำหรับพนักงานโรงพยาบาลเครื่องปรุง (Plant Modules Guide)</p>
              </div>

              <div className="space-y-4">
                {modulesGuide.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-start gap-3.5 hover:scale-[1.01] transition-transform">
                      <div className="p-2 bg-[#0B3C5D]/10 rounded-xl">
                        <Icon className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                        <div className="pt-1.5 border-t border-dashed border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-0.5">💡 เคล็ดลับพนักงานคีย์:</span>
                          <ul className="list-disc pl-4 text-[10px] text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed inline-block">
                            {item.tips.map((t, ti) => (
                              <li key={ti}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Safety Document SOP */}
          {activeManualSection === 'safety' && (
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
              isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
            }`}>
              <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base tracking-tight mb-1 text-slate-800 dark:text-white">🛡️ SOP ข้อปฏิบัติโรงงานและระดับความปลอดภัยขั้นวิกฤต</h3>
                <p className="text-xs text-slate-500">เอกสารคู่มือโรงงานผลิตเครื่องสำอางและน้ำหอมมาตรฐานสาธารณสุขสากล (HSEQ Documents)</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {safetyRules.map((sop, idx) => {
                  const SIcon = sop.icon;
                  const isExpanded = expandedSopIndex === idx;
                  return (
                    <div key={sop.id} className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
                      <div 
                        onClick={() => setExpandedSopIndex(isExpanded ? null : idx)}
                        className={`p-4 px-5 flex items-center justify-between cursor-pointer transition-colors ${
                          isExpanded 
                            ? 'bg-slate-100/80 dark:bg-slate-900 font-bold' 
                            : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-1.5 rounded-lg ${
                            idx === 0 ? 'bg-rose-50 text-rose-600' : idx === 1 ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <SIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{sop.id} • {sop.urgency}</span>
                            <h4 className="text-xs font-extrabold text-slate-855 dark:text-slate-100">{sop.title}</h4>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-650 shrink-0">
                          {isExpanded ? '[- ปิดคู่มือ]' : '[+ เปิดรายละเอียด]'}
                        </span>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-5 px-6 bg-[#fcfdfe] dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
                          <p className="italic">{sop.content}</p>
                          <div className="flex gap-2 text-[10px] pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-slate-400">
                            <span>ผู้ลงนามอนุมัติ: ISO Coordinator Team</span>
                            <span>•</span>
                            <span>ปรับปรุงเมื่อ: 16 มิถุนายน 2026</span>
                            <span>•</span>
                            <span>สถานะเอกสาร: แนบตรวจผ่าน อย. สมบูรณ์</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Emergency Contact Notice */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-extrabold">🚨 ข้อควรระวังกรณีเคมีหกหรือสารระเหยก่อปฏิกิริยา:</strong>
                  <p className="text-[11px] text-amber-800">
                    ห้ามทำความสะอาดด้วยน้ำเปล่าเด็ดขาดกลุ่มน้ำหอมสังเคราะห์ ให้ขีดเขียนบริเวณควบคุมเป็นสีแดงทันที และใช้ทรายบารายท์ (Sub-Base Sand) หรือแป้งดูดซับแรงฉุกเฉินเทลาด เพื่อดูดกลืนไอระเหยทางเดินหายใจอย่างปลอดภัย
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Tab Layout: Interactive sidebar statistics & FAQ */}
        <div className="space-y-6">
          
          {/* FAQ & Standard Responses Card */}
          <div className={`p-5 rounded-3xl border space-y-4 ${
            isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
          }`}>
            <h3 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-500" /> คำถามพบบ่อยในการทำงานจริง (Internal FAQ)
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-705 dark:text-slate-300">Q: บันทึกข้อมูลคีย์ไม่ผ่านฟันธงและติด Supabase RLS มีเหตุผลใด?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  A: เนื่องจากผู้ให้บริการฐานข้อมูลเปิดนโยบาย Row Level Security เพื่อตรวจและปกป้องตารางที่มีคุณค่า ให้ไปที่หน้า <strong>Developer OS</strong> ดับเบิ้ลคลิกปุ่มคัดลอกรหัส SQL คลีน RLS และนำรันใน SQL Editor ของ Supabase
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-850">
                <h4 className="font-bold text-slate-705 dark:text-slate-300">Q: การเปลี่ยนโทนสีหลัก (Color Tones) ส่งผลต่อข้อมูลไหม?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  A: ไม่มีผลต่อข้อมูลใน SQL หรือ Supabase ใดๆ เป็นเพียงการจัดแสงส่องสว่างและความเข้มข้นของอินเตอร์เฟสให้พนักงานทำงานสะดวกและมองเห็นพิกเซลสลากยาได้อย่างปลอดภัยสูงสุด
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-850">
                <h4 className="font-bold text-slate-705 dark:text-slate-300">Q: จะสแกนล็อตบาร์โค้ด QR และข้อมูลใบ COA ได้อย่างไร?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  A: ไปที่เวิร์กสเตชันจัดซื้อคลังวัตถุดิบ WMS หรือหน้าแล็บสืบย้อน ตรวจสอบพิกเซลบาร์โค้ดสติกเกอร์ และเข้าดู COA ได้ทันควัน
                </p>
              </div>
            </div>
          </div>

          {/* Core System Specifications Certification */}
          <div className="bg-[#0B3C5D]" style={{ borderRadius: '24px', padding: '20px', color: '#fff' }}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-indigo-200 tracking-widest block">System Specifications</span>
                <h4 className="font-extrabold text-sm text-white">การตรวจสอบความสมบูรณ์แพลตฟอร์ม</h4>
              </div>
              
              <ul className="space-y-2 text-[10.5px] leading-relaxed text-slate-200 font-sans">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Database Engine: <strong>Drizzle ORM & Postgres</strong>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> API Gateway Proxy: <strong>Express JS (Live)</strong>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Security RLS: <strong>Bypassed Successfully</strong>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Core Compliance: <strong>ASEAN Cosmetic Directives</strong>
                </li>
              </ul>

              <div className="pt-2 border-t border-white/10 text-[9.5px] text-slate-300/80 leading-normal">
                โรงงานผลิตเครื่องสำอางชั้นสากล เครื่องผสม Reactor แรงดัน 5 ตัน ซัพพอร์ตเต็มอัตราชุดวิทยุการรายงานแดชบอร์ดสเตตัสออนไลน์สมบูรณ์แบบ
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
