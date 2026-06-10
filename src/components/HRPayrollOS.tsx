import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, DollarSign, Award, MapPin, Check, 
  X, Printer, FileText, ChevronRight, UserCheck, Play, Send,
  QrCode, Camera, Download, Eye, Volume2
} from 'lucide-react';
import GoogleSheetEditor from './GoogleSheetEditor';
import LinePayslipOS from './LinePayslipOS';
import { getQRCodeDataUrl } from '../utils/qrGenerator';

interface HRPayrollOSProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function HRPayrollOS({ dbState, onRefresh, onNotify, userRole }: HRPayrollOSProps) {
  const [activeHrTab, setActiveHrTab] = useState<'roster' | 'clock' | 'requests' | 'payroll' | 'line-payslips'>('roster');
  
  // Simulated Selected Slip for Print
  const [printingSlip, setPrintingSlip] = useState<any>(null);

  // QR-based states
  const [viewingEmployeeQR, setViewingEmployeeQR] = useState<any | null>(null);
  const [showHrScanner, setShowHrScanner] = useState<boolean>(false);
  const [hrScannerTarget, setHrScannerTarget] = useState<string>('');
  const [hrCheckType, setHrCheckType] = useState<'Check In' | 'Check Out'>('Check In');
  const [isHrScanning, setIsHrScanning] = useState<boolean>(false);
  const [hrScannerMute, setHrScannerMute] = useState<boolean>(false);

  // Web Audio clock sound synthesis beep!
  const playAttendanceBeep = (isSuccess: boolean) => {
    if (hrScannerMute) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(isSuccess ? 1200 : 350, audioCtx.currentTime); // High pitch or low buzz
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
      console.log('Web Audio Context blocked:', e);
    }
  };

  const handleClockAction = async (type: 'Check In' | 'Check Out', customEmpId?: string) => {
    const randomCoords = {
      lat: 13.7563 + (Math.random() - 0.5) * 0.01,
      lng: 100.5018 + (Math.random() - 0.5) * 0.01
    };

    const targetEmpId = customEmpId || 'emp-103';

    try {
      const res = await fetch('/api/hr/attendance/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: targetEmpId,
          checkType: type,
          gpsCoords: randomCoords
        })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`[SUCCESS] QR Verified Check-In: '${targetEmpId}' registered for ${type}. GPS lock established.`, "info");
        onRefresh();
      } else {
        onNotify(data.error, "error");
      }
    } catch {
      onNotify("Failed to communicate with HR clock server.", "error");
    }
  };

  const handlePostPayroll = async (periodId: string) => {
    try {
      const res = await fetch('/api/hr/payroll/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId })
      });
      const data = await res.json();
      if(data.success) {
        onNotify(`June 2026 payroll finalized. Disbursed salaries posted immediately to General Ledger accounts!`, "info");
        onRefresh();
      }
    } catch {
      onNotify("Error executing payroll posting.", "error");
    }
  };

  // Roles verification
  const canFinalizePayroll = ['Admin', 'HR', 'Management'].includes(userRole);

  return (
    <div className="space-y-6" id="hr-payroll-os-panel">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1D1D1F] rounded-xl text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight">ระบบคนและคำนวณบัญชีเงินเดือน (HR Operations &amp; Enterprise Payroll)</h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              จัดการทะเบียนพนักงาน จัดตารางเวลาสแกนนิ้ว GPS ปรับปรุงวันลาป่วย/ลากิจ และตรวจสอบสลิปเงินเดือนโอนเข้า General Ledger อัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      {/* Sub menu links */}
      <div className="flex bg-[#E8E8ED] p-1 rounded-xl border border-[#D1D1D6] overflow-x-auto gap-0.5 select-none">
        <button
          type="button"
          onClick={() => setActiveHrTab('roster')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'roster' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          แผนผังและผังองค์กร (Corporate Roster)
        </button>
        <button
          type="button"
          onClick={() => setActiveHrTab('clock')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'clock' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ลงเวลาทำงานสแกน GPS (Clock In)
        </button>
        <button
          type="button"
          onClick={() => setActiveHrTab('requests')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'requests' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          อนุมัติวันลาและเวลาทำงานพิเศษ (Leave &amp; OT)
        </button>
        <button
          type="button"
          onClick={() => setActiveHrTab('payroll')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'payroll' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          สลิปและเงินเดือนพนักงาน (Payroll Specs)
        </button>
        <button
          type="button"
          onClick={() => setActiveHrTab('line-payslips')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeHrTab === 'line-payslips' ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ส่งสลิปไลน์ Flex Message (E-Payslip)
        </button>
      </div>

      {/* Renders Tab Elements */}
      <div className="min-h-[400px]">

        {/* Tab 1: Org Chart and Roster */}
        {activeHrTab === 'roster' && (
          <div className="space-y-6">
            {/* Interactive Organization Chart Graphic (Fluent Style) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Visual Organizational Hierarchy (Sharing Master Database)</h3>
              
              <div className="flex flex-col items-center gap-4 border border-dashed border-slate-200 p-6 rounded-xl bg-slate-50/50">
                {/* Director Node */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-3.5 rounded-xl text-white text-center shadow-md w-52 border border-slate-700">
                  <p className="font-bold text-sm">Edward Vane</p>
                  <p className="text-[10px] text-slate-300">Managing Director (Admin)</p>
                </div>

                <div className="w-0.5 h-6 bg-slate-200"></div>

                {/* Second tier nodes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative w-full max-w-2xl">
                  {/* QA Head */}
                  <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-xs text-center flex flex-col items-center">
                    <p className="font-semibold text-slate-800 text-xs text-sm">Elena Rostova</p>
                    <p className="text-[10px] text-slate-500">VP Quality Assurance</p>
                  </div>
                  {/* Chemist */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm text-center flex flex-col items-center">
                    <p className="font-semibold text-slate-800 text-xs text-sm">Kenji Sato</p>
                    <p className="text-[10px] text-slate-500">VP Chemistry & R&D</p>
                  </div>
                  {/* Accounts */}
                  <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-xs text-center flex flex-col items-center">
                    <p className="font-semibold text-slate-800 text-xs text-sm">Sofia Rodriguez</p>
                    <p className="text-[10px] text-slate-500">VP Finance & Accounts</p>
                  </div>
                </div>

                <div className="w-full max-w-xl flex justify-around">
                  <div className="w-0.5 h-5 bg-slate-200"></div>
                  <div className="w-0.5 h-5 bg-slate-200"></div>
                </div>

                {/* Third level: Engineering Floor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-center border">
                    <p className="font-bold text-slate-700 text-xs">Marcus Brody</p>
                    <p className="text-[9px] text-slate-500">Production Operator</p>
                  </div>
                  <div className="bg-slate-100 p-2.5 rounded-xl text-center border">
                    <p className="font-bold text-slate-700 text-xs">Tariq Al-Fayed</p>
                    <p className="text-[9px] text-slate-500">Chief Reliability Engineer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Roster database table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Active Staff Roster Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-mono text-[10px] uppercase">
                      <th className="py-3 px-4">Emp ID</th>
                      <th className="py-3 px-4">FullName</th>
                      <th className="py-3 px-4">Email Channel</th>
                      <th className="py-3 px-4">Dept Node</th>
                      <th className="py-3 px-4 text-right">Compensation Rate</th>
                      <th className="py-3 px-4 text-right">Monthly Allowance</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Staff Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbState.employees.map((emp: any) => {
                      const dept = dbState.departments.find((d: any) => d.id === emp.departmentId);
                      return (
                        <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{emp.id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{emp.name}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{emp.email}</td>
                          <td className="py-3 px-4 font-semibold text-indigo-700">{dept ? dept.name : emp.departmentId}</td>
                          <td className="py-3 px-4 text-right font-mono font-semibold">${emp.salary.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono text-slate-500">${emp.allowance.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">{emp.status}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setViewingEmployeeQR(emp)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="ดูบัตรพนักงานสวมใส่ QR"
                            >
                              <QrCode className="h-3.5 w-3.5" /> บัตร QR Badge
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Clock terminal GPS */}
        {activeHrTab === 'clock' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Dual Column: GPS vs QR Scanner badging terminal */}
              <div className="lg:col-span-1 space-y-5">
                
                {/* Mode A: GPS Satlock */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-4 border border-slate-850 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <MapPin className="h-4.5 w-4.5" />
                      <span className="text-[10px] font-mono font-bold animate-pulse">GPS SATLOCK - ONLINE</span>
                    </div>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold text-right">Method 1</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Mobile GPS Geofence Check</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">จำลองการตอกบัตรมือถือนอกอาคาร (User: <strong>Marcus Brody</strong>)</p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl space-y-1 text-[11.5px] font-mono border border-slate-700 text-slate-300">
                    <p>Plant Lat: <span className="text-emerald-400">13.7563° N</span></p>
                    <p>Plant Lng: <span className="text-emerald-400">100.5018° E</span></p>
                    <p className="text-[10px]">Verify: <span className="text-emerald-300">PASS - Geofence Lock OK</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { playAttendanceBeep(true); handleClockAction('Check In', 'emp-103'); }}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Check-In (GPS)
                    </button>
                    <button
                      type="button"
                      onClick={() => { playAttendanceBeep(true); handleClockAction('Check Out', 'emp-103'); }}
                      className="py-2 bg-rose-600 hover:bg-rose-700 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Check-Out (GPS)
                    </button>
                  </div>
                </div>

                {/* Mode B: QR Ingress Attendance Scanner Card */}
                <div className="bg-[#1C1C1E] rounded-2xl p-5 text-white space-y-4 border border-neutral-800 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-indigo-400">
                      <Camera className="h-4.5 w-4.5" />
                      <span className="text-[10px] font-mono font-bold">QR BADGE UNIT</span>
                    </div>
                    <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded uppercase font-bold">Method 2</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Tablet QR Gate Reader</h4>
                    <p className="text-neutral-400 text-[11px] mt-0.5">จำลองเครื่องสแกนติดใบงานหน้าประตูโรงงาน</p>
                  </div>

                  {/* Laser scan preview frame with sound state */}
                  <div className="relative h-44 w-full bg-black rounded-xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center p-3">
                    {/* Pulsing Scan Line */}
                    <div className={`absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_3px_rgba(99,102,241,0.6)] z-10 ${isHrScanning ? 'animate-[bounce_1.4s_infinite]' : 'animate-pulse'}`} style={{ top: isHrScanning ? 'auto' : '40%' }} />

                    {hrScannerTarget ? (
                      <div className="z-20 text-center space-y-1.5 flex flex-col items-center animate-fade-in">
                        <img
                          src={getQRCodeDataUrl(hrScannerTarget, 80)}
                          alt="Badge Vector"
                          className="w-16 h-16 border border-neutral-700 bg-white p-0.5"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase">Badge Target Seated</p>
                          <strong className="text-[11px] text-white font-mono block truncate max-w-[140px]">
                            {dbState.employees.find((e: any) => e.id === hrScannerTarget)?.name}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <div className="z-20 text-center text-neutral-500 space-y-1 select-none">
                        <QrCode className="h-8 w-8 text-neutral-700 mx-auto" />
                        <p className="text-[9px] uppercase tracking-wider text-neutral-600 font-mono">Reader Standing By</p>
                      </div>
                    )}

                    {isHrScanning && (
                      <div className="absolute inset-0 bg-[#6366F1]/20 z-20 flex items-center justify-center animate-pulse">
                        <span className="bg-black/95 text-[9px] px-2.5 py-1 text-white border border-indigo-500/50 rounded-lg uppercase tracking-widest font-mono">
                          GRID READING...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Form fields */}
                  <div className="space-y-2.5 text-xs text-stone-300">
                    <div>
                      <label className="text-[9px] uppercase text-neutral-500 block font-bold mb-1">Position Employee Card Badge</label>
                      <select
                        value={hrScannerTarget}
                        onChange={(e) => setHrScannerTarget(e.target.value)}
                        className="w-full text-xs p-2 bg-stone-900 border border-neutral-800 rounded-lg text-white"
                      >
                        <option value="">-- Choose Member Badge --</option>
                        {dbState.employees.map((e: any) => (
                          <option key={e.id} value={e.id}>[{e.id}] {e.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase text-neutral-500 block font-bold mb-1">Direction Flow</label>
                      <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-neutral-900 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setHrCheckType('Check In')}
                          className={`py-1 rounded font-bold text-[10px] uppercase transition-all ${hrCheckType === 'Check In' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                          Check In 🌅
                        </button>
                        <button
                          type="button"
                          onClick={() => setHrCheckType('Check Out')}
                          className={`py-1 rounded font-bold text-[10px] uppercase transition-all ${hrCheckType === 'Check Out' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                        >
                          Check Out 🌆
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!hrScannerTarget || isHrScanning}
                      onClick={() => {
                        if (!hrScannerTarget) return;
                        setIsHrScanning(true);
                        setTimeout(() => {
                          setIsHrScanning(false);
                          playAttendanceBeep(true);
                          handleClockAction(hrCheckType, hrScannerTarget);
                        }, 1300);
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                        !hrScannerTarget ? 'bg-neutral-850 text-neutral-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all'
                      }`}
                    >
                      <Camera className="h-4 w-4" /> สแกนบัตร (Log QR Attendance)
                    </button>
                  </div>
                </div>

              </div>

              {/* Attendance Log Table */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm">Attendance logs (GPS geofenced logs)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 font-mono text-slate-400 text-left uppercase text-[9px]">
                        <th className="pb-2">Date Record</th>
                        <th className="pb-2">Employee ID</th>
                        <th className="pb-2">Check In</th>
                        <th className="pb-2">Check Out</th>
                        <th className="pb-2">GPS Verification</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbState.attendance.map((log: any) => (
                        <tr key={log.id} className="border-b border-slate-100 font-mono">
                          <td className="py-2.5 text-slate-800 font-semibold">{log.date}</td>
                          <td className="py-2.5 text-slate-500 font-bold">{log.employeeId}</td>
                          <td className="py-2.5 font-bold text-emerald-600">{log.checkIn}</td>
                          <td className="py-2.5 text-slate-600">{log.checkOut || '--'}</td>
                          <td className="py-2.5 text-[10px] text-slate-500">
                            {log.gpsCoords ? `${log.gpsCoords.lat.toFixed(4)}, ${log.gpsCoords.lng.toFixed(4)}` : 'N/A Geofence'}
                          </td>
                          <td className="py-2.5 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-700 font-bold'
                            }`}>{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Leaves & OT requests */}
        {activeHrTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leaves and approvals */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" /> Annual & Sick Leave Scheduling
              </h3>
              <div className="space-y-3">
                {dbState.leaveRequests.map((lv: any) => {
                  const emp = dbState.employees.find((e: any) => e.id === lv.employeeId);
                  
                  return (
                    <div key={lv.id} className="border border-slate-100 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{emp ? emp.name : lv.employeeId}</p>
                          <p className="text-[10px] text-slate-400 font-semibold font-mono">Request Code: {lv.id} | Type: {lv.type}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>{lv.status}</span>
                      </div>
                      <p className="text-xs text-slate-600">{lv.startDate} to {lv.endDate} | Reason: &quot;{lv.reason}&quot;</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OT Hours queue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" /> Overtime hours billing
              </h3>
              <div className="space-y-3">
                {dbState.otRequests.map((ot: any) => {
                  const emp = dbState.employees.find((e: any) => e.id === ot.employeeId);
                  
                  return (
                    <div key={ot.id} className="border border-slate-100 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{emp ? emp.name : ot.employeeId}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-semibold">{ot.date} | Request: {ot.id}</p>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">{ot.status}</span>
                      </div>
                      <p className="text-xs text-slate-600">Requested: <strong className="text-slate-800">{ot.hours} overtime hours</strong> to assist: &quot;{ot.reason}&quot;</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Payroll generation & Payslip Dialog Print layout */}
        {activeHrTab === 'payroll' && (
          <div className="space-y-6">
            
            {/* Interactive Printable PDF mock overlays */}
            {printingSlip && (
              <div className="bg-slate-900/40 backdrop-blur-sm shadow-xl p-6 rounded-2xl border border-emerald-200 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                <div className="md:col-span-2 bg-white text-slate-800 p-8 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-200" id="print-area">
                  <div className="text-center space-y-1 mb-6">
                    <h3 className="font-extrabold text-sm tracking-tight">IDEVA FACTORY SYSTEM CO., LTD.</h3>
                    <p className="text-[9px] text-slate-500">HEAD OFFICE: INDUSTRIAL INDUSTRIAL ESTATE, RAYONG, THAILAND</p>
                    <p className="text-[9px] bg-slate-100 inline-block px-3 py-0.5 rounded">CONFIDENTIAL - PRIVATE EMPLOYEE PAYSLIP</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <p>Employee Reference: <strong>{printingSlip.employeeId}</strong></p>
                      <p>Full Name: <strong>{dbState.employees.find((e: any)=> e.id === printingSlip.employeeId)?.name}</strong></p>
                      <p>Account Node: <strong>Siam Commercial Bank SCS-901-2092</strong></p>
                    </div>
                    <div className="text-right">
                      <p>Payroll slip ID: <strong>{printingSlip.id}</strong></p>
                      <p>Pay Period Month: <strong>June 2026 Shift Run</strong></p>
                      <p>Disburse Date: <strong>2026-06-30 (Expected)</strong></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <p className="font-bold border-b pb-1 text-slate-500 text-[10px]">REVENUE & ALLOWANCES</p>
                      <div className="flex justify-between"><span>Base Salary:</span><strong>+${printingSlip.baseSalary.toLocaleString()}</strong></div>
                      <div className="flex justify-between"><span>Production OT:</span><strong>+${printingSlip.otPay.toLocaleString()}</strong></div>
                      <div className="flex justify-between"><span>Allowances Sum:</span><strong>+${printingSlip.allowanceSum.toLocaleString()}</strong></div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold border-b pb-1 text-slate-500 text-[10px]">DEDUCTIONS & TAXATION</p>
                      <div className="flex justify-between"><span>SSO Fund:</span><strong>-${printingSlip.ssoDeduction}</strong></div>
                      <div className="flex justify-between"><span>Corporate Income Tax:</span><strong>-${printingSlip.taxDeduction.toLocaleString()}</strong></div>
                    </div>
                  </div>

                  <div className="flex justify-between font-extrabold text-sm pt-4">
                    <span>NET DISBURSED INCOME:</span>
                    <span className="text-emerald-700 bg-emerald-50 px-3 rounded">฿{printingSlip.netPay.toLocaleString()}</span>
                  </div>

                  <div className="text-center text-[8px] text-slate-400 mt-8">
                    Note: This is a system-generated secure payslip from IDEVA Factory OS Accounting API. No signed copy required.
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-4 text-white">
                  <h4 className="font-bold text-sm">Payslip document generator</h4>
                  <p className="text-xs text-slate-300">
                    Verify compliance with National Insurance contributions (SSO) and progressive income tax brackets. This is ready to download.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <Printer className="h-4 w-4" /> Print Document
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintingSlip(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold"
                    >
                      Close Viewer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Calculations period trigger card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">Active Pay periods scheduler</h3>
                <p className="text-slate-500 text-xs">Verify calculations for June pay schedules. Finalizing logs auto-posts wages debit listings back to General Ledger accounting.</p>
              </div>

              <div>
                {dbState.payrollPeriods[1].status === 'Draft' ? (
                  canFinalizePayroll ? (
                    <button
                      type="button"
                      onClick={() => handlePostPayroll('payp-06')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" fill="currentColor" /> Finalize Pay Period & auto-Post to Accounting
                    </button>
                  ) : (
                    <span className="text-xs bg-amber-50 text-amber-800 border border-amber-100 p-2.5 rounded-xl">Postings blocked: Only Admin or HR roles allowed.</span>
                  )
                ) : (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-xl">Posted & finalised in Accounting ledger</span>
                )}
              </div>
            </div>

            {/* Payslips roster */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-semibold text-slate-800 text-xs uppercase text-slate-400">Archived Period Payslips roster</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-mono text-[9px] uppercase">
                      <th className="py-3 px-4">Pay ID</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4 text-right">Base salary</th>
                      <th className="py-3 px-4 text-right">OT hours earned</th>
                      <th className="py-3 px-4 text-right">allowances</th>
                      <th className="py-3 px-4 text-right">deductions (Tax+SSO)</th>
                      <th className="py-3 px-4 text-right">Total Disbursed Net</th>
                      <th className="py-3 px-4 text-right">Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbState.payslips.map((slip: any) => {
                      const emp = dbState.employees.find((e: any) => e.id === slip.employeeId);
                      return (
                        <tr key={slip.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{slip.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{emp ? emp.name : slip.employeeId}</td>
                          <td className="py-3.5 px-4 text-right font-mono">฿{slip.baseSalary.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-mono">฿{slip.otPay.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-mono">฿{slip.allowanceSum.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-rose-600">-฿{(slip.taxDeduction + slip.ssoDeduction).toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-800 font-mono">฿{slip.netPay.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setPrintingSlip(slip)}
                              className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1.5 ml-auto"
                            >
                              <FileText className="h-4 w-4" /> View Payslip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: LINE Flex Message Creator and sender */}
        {activeHrTab === 'line-payslips' && (
          <LinePayslipOS
            dbState={dbState}
            onRefresh={onRefresh}
            onNotify={onNotify}
            userRole={userRole}
          />
        )}

      </div>

      {/* Google Sheet Simulator component bottom of page */}
      {(() => {
        const getSheetConfig = () => {
          switch (activeHrTab) {
            case 'roster':
              return {
                tableKey: 'employees',
                tableName: 'ทำเนียบบัญชีข้อมูลบุคลากรพนักงาน (Employees)',
                columns: [
                  { key: 'id', label: 'รหัสพนักงาน (ID)', type: 'text', readOnly: true },
                  { key: 'name', label: 'ชื่อ-นามสกุล', type: 'text' },
                  { key: 'department', label: 'แผนก/ฝ่ายสังกัด', type: 'text' },
                  { key: 'role', label: 'ตำแหน่งงาน', type: 'text' },
                  { key: 'baseSalary', label: 'เงินเดือนพื้นฐาน (บาท)', type: 'number' },
                  { key: 'status', label: 'สถานะการทำงาน', type: 'select', options: ['Active', 'Inactive', 'On Leave'] }
                ] as any,
                data: dbState.employees || []
              };
            case 'clock':
              return {
                tableKey: 'attendance',
                tableName: 'บันทึกประวัติการลงเวลาทำงาน (Attendance)',
                columns: [
                  { key: 'id', label: 'รหัสการลงเวลา (ID)', type: 'text', readOnly: true },
                  { key: 'employeeId', label: 'รหัสพนักงาน', type: 'text' },
                  { key: 'clockIn', label: 'วันเวลาเข้างาน', type: 'text' },
                  { key: 'clockOut', label: 'วันเวลาออกงาน', type: 'text' },
                  { key: 'status', label: 'สถานะการลงเวลา', type: 'select', options: ['Present', 'Late', 'Absent'] }
                ] as any,
                data: dbState.attendance || []
              };
            case 'requests':
              return {
                tableKey: 'leaveRequests',
                tableName: 'แบบใบคำร้องขอการลางาน (Leave Requests)',
                columns: [
                  { key: 'id', label: 'รหัสใบลางาน', type: 'text', readOnly: true },
                  { key: 'employeeId', label: 'รหัสพนักงาน', type: 'text' },
                  { key: 'type', label: 'เหตุผลประเภทการลา', type: 'text' },
                  { key: 'status', label: 'สถานะอนุมัติลา', type: 'select', options: ['Pending', 'Approved', 'Rejected'] }
                ] as any,
                data: dbState.leaveRequests || []
              };
            case 'payroll':
              return {
                tableKey: 'payslips',
                tableName: 'บัญชีประวัติจ่ายเงินเดือน (Payslips Registry)',
                columns: [
                  { key: 'id', label: 'เอกสารหักจ่าย (ID)', type: 'text', readOnly: true },
                  { key: 'employeeId', label: 'รหัสพนักงาน', type: 'text' },
                  { key: 'baseSalary', label: 'ฐานเงินสุทธิ', type: 'number' },
                  { key: 'otPay', label: 'ค่าล่วงเวลา (OT)', type: 'number' },
                  { key: 'allowanceSum', label: 'ค่าสวัสดิการรวม', type: 'number' },
                  { key: 'taxDeduction', label: 'หักภาษี ณ ที่จ่าย', type: 'number' },
                  { key: 'ssoDeduction', label: 'หักสมทบประกันสังคม', type: 'number' },
                  { key: 'netPay', label: 'ยอดชำระสุทธิโอนเข้า', type: 'number' }
                ] as any,
                data: dbState.payslips || []
              };
            default:
              return null;
          }
        };

        const config = getSheetConfig();
        if (!config) return null;
        
        return (
          <GoogleSheetEditor
            tableKey={config.tableKey}
            tableName={config.tableName}
            columns={config.columns}
            data={config.data}
            onRefresh={onRefresh}
            onNotify={onNotify}
          />
        );
      })()}

      {/* FLOATING MODAL: Corporate Employee ID QR Badge Sticker Viewer */}
      {viewingEmployeeQR && (
        <div className="fixed inset-0 z-50 bg-[#1D1D1F]/65 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="employee-qr-badge-docket">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden transform scale-100 transition-all flex flex-col">
            <div className="bg-indigo-700 h-3" />
            
            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
                    <Award className="h-4.5 w-4.5 text-indigo-600" /> Security Access Card
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">ID Ref No: {viewingEmployeeQR.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingEmployeeQR(null)}
                  className="p-1 px-2.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-xs font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Printable Physical ID Card Layout */}
              <div id="printable-employee-badge-sticker" className="border-2 border-slate-900 bg-slate-50 p-5 rounded-2xl flex flex-col items-center space-y-4 text-center select-none shadow-sm relative">
                {/* Visual clip-holder slot at top */}
                <div className="w-12 h-2.5 bg-slate-800 rounded-full mx-auto opacity-30 top-1.5 absolute" />

                <div className="w-full border-b pb-2 text-left pt-1">
                  <span className="bg-indigo-600 text-white font-mono font-black tracking-widest text-[8px] px-2 py-0.5 rounded">IDEVA STAFF</span>
                  <span className="float-right text-[8px] font-mono text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">Secure Entry Keycard</span>
                </div>

                {/* Profile Placeholder Badge Icon */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-11 h-11 bg-indigo-50 border border-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm tracking-wide">
                    {viewingEmployeeQR.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-black text-[13px] tracking-tight">{viewingEmployeeQR.name}</h4>
                    <p className="text-[9.5px] font-mono font-semibold text-slate-500 tracking-wide uppercase mt-0.5">
                      {dbState.departments.find((d: any) => d.id === viewingEmployeeQR.departmentId)?.name || "Facility Operations"}
                    </p>
                  </div>
                </div>

                {/* Deterministic QR Code for Entrance Gates */}
                <div className="p-3 bg-white border border-slate-300 rounded-xl flex items-center justify-center shadow-xs">
                  <img
                    src={getQRCodeDataUrl(viewingEmployeeQR.id, 140)}
                    alt={`Employee QR Badge for ${viewingEmployeeQR.id}`}
                    className="w-28 h-28"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Authorized warnings / Gate policies */}
                <div className="space-y-1 w-full text-xs font-mono text-slate-600">
                  <div className="flex justify-between text-[9px] border-b pb-1 text-slate-500">
                    <span>REGISTRY CODE</span>
                    <strong className="text-slate-800 font-bold">{viewingEmployeeQR.id}</strong>
                  </div>
                  <p className="text-[7.5px] text-slate-400 leading-snug pt-1 text-left uppercase">
                    RESTRICTED GATES LOCK: APPROVED ACCESS FOR INDUSTRIAL DISPENSARIES, MIXER CELLS, AND HAZARDOUS BOILER BAYS 1-4. ALWAYS KEEP VISIBLE.
                  </p>
                </div>
              </div>

              {/* Utility actions */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <a
                  href={getQRCodeDataUrl(viewingEmployeeQR.id, 400)}
                  download={`Badge-QR-${viewingEmployeeQR.id}.svg`}
                  className="bg-slate-50 hover:bg-slate-200 text-slate-800 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold border border-slate-300 transition-colors"
                >
                  <Download className="h-4 w-4 text-slate-600" /> Download Badge (SVG)
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('printable-employee-badge-sticker')?.outerHTML;
                    if (printContents) {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Print Security Badge ${viewingEmployeeQR.id}</title>
                              <script src="https://cdn.tailwindcss.com"></script>
                            </head>
                            <body class="p-8 flex items-center justify-center min-h-screen">
                              <div class="max-w-xs border-2 border-black p-6 rounded-2xl bg-white text-center">
                                ${printContents}
                              </div>
                              <script>window.onload = function() { window.print(); window.close(); }</script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      } else {
                        onNotify("Window pop-up blocked. Please download the badge vector instead.", "warning");
                      }
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print Badge Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
