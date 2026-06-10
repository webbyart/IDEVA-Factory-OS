import React, { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Building, Layers, Wrench, Users, DollarSign, Cpu, AlertTriangle, 
  ShieldCheck, RefreshCw, MessageSquare, Terminal, Eye, Bell, Check, 
  QrCode, Play, ChevronRight, User, Settings, Info, BrainCircuit, Beaker, 
  Clipboard, FileSpreadsheet, Kanban, Database, FileText, Search, Printer, 
  Upload, Tag, LayoutDashboard, ExternalLink, Minimize2, PlusCircle,
  Sun, Moon, Menu, ChevronDown, Home
} from 'lucide-react';

// Subcomponents import
import ProductionOS from './components/ProductionOS';
import MaintenanceOS from './components/MaintenanceOS';
import HRPayrollOS from './components/HRPayrollOS';
import AccountingOS from './components/AccountingOS';
import DeveloperOS from './components/DeveloperOS';
import PerfumeFormulaOS from './components/PerfumeFormulaOS';
import ChemicalStockOS from './components/ChemicalStockOS';
import GMPHubOS from './components/GMPHubOS';
import SalesProdWorkflowOS from './components/SalesProdWorkflowOS';

// New high-fidelity modular subcomponents
import WarehouseOS from './components/WarehouseOS';
import QualityOS from './components/QualityOS';
import TraceabilityOS from './components/TraceabilityOS';
import CRM_OS from './components/CRM_OS';
import AdminOS from './components/AdminOS';
import RegulatoryOS from './components/RegulatoryOS';

import { 
  DEPARTMENTS, ROLES, EMPLOYEES, CUSTOMERS, SUPPLIERS, PRODUCTS, MATERIALS, 
  FORMULAS, MACHINES, MANUFACTURING_ORDERS, REPAIR_TICKETS, PM_TASKS, SPARE_PARTS, 
  ATTENDANCE, LEAVE_REQUESTS, OT_REQUESTS, PAYROLL_PERIODS, PAYSLIPS, TRANSACTIONS, 
  INVOICES, SUPPLIER_BILLS, AUDIT_LOGS, GOODS_RECEIPTS, PURCHASE_ORDERS, 
  PURCHASE_REQUESTS, QC_INSPECTIONS
} from './data/mockFactoryData';

const INITIAL_DB_STATE = {
  departments: DEPARTMENTS,
  roles: ROLES,
  employees: EMPLOYEES,
  customers: CUSTOMERS,
  suppliers: SUPPLIERS,
  products: PRODUCTS,
  materials: MATERIALS,
  formulas: FORMULAS,
  machines: MACHINES,
  manufacturingOrders: MANUFACTURING_ORDERS,
  purchaseRequests: PURCHASE_REQUESTS,
  purchaseOrders: PURCHASE_ORDERS,
  goodsReceipts: GOODS_RECEIPTS,
  qcInspections: QC_INSPECTIONS,
  repairTickets: REPAIR_TICKETS,
  pmTasks: PM_TASKS,
  spareParts: SPARE_PARTS,
  attendance: ATTENDANCE,
  leaveRequests: LEAVE_REQUESTS,
  otRequests: OT_REQUESTS,
  payrollPeriods: PAYROLL_PERIODS,
  payslips: PAYSLIPS,
  transactions: TRANSACTIONS,
  invoices: INVOICES,
  supplierBills: SUPPLIER_BILLS,
  bills: SUPPLIER_BILLS,
  coa: [
    { code: '1010', name: 'Cash on Hand / Industrial Treasury', type: 'Asset', balance: 450000, id: 'coa-1010' },
    { code: '1020', name: 'Raw Material Inventory Capitalized', type: 'Asset', balance: 185000, id: 'coa-1020' },
    { code: '1030', name: 'Accounts Receivable (A/R Ledger)', type: 'Asset', balance: 163000, id: 'coa-1030' },
    { code: '2010', name: 'Accounts Payable Accrued (A/P)', type: 'Liability', balance: 15800, id: 'coa-2010' },
    { code: '3010', name: 'Corporate Retained Earnings Capital', type: 'Equity', balance: 350000, id: 'coa-3010' },
    { code: '4010', name: 'Wholesale Factory Product Sales Revenue', type: 'Revenue', balance: 512500, id: 'coa-4010' },
    { code: '5010', name: 'Direct Plant Wages & Labor Expenses', type: 'Expense', balance: 150700, id: 'coa-5010' },
    { code: '5020', name: 'Machinery Overhaul & Corrective PM OPEX', type: 'Expense', balance: 14200, id: 'coa-5020' },
    { code: '5030', name: 'Direct Raw Material Procurement OPEX', type: 'Expense', balance: 60500, id: 'coa-5030' }
  ],
  journals: [
    {
      id: 'jn-001',
      memo: 'Raw material inventory asset adjustment',
      date: '2026-05-01',
      lines: [
        { accountCode: '1020', type: 'Debit', amount: 185000 },
        { accountCode: '3010', type: 'Credit', amount: 185000 }
      ]
    },
    {
      id: 'jn-002',
      memo: 'May 2026 plant wages ledger allocation',
      date: '2026-05-28',
      lines: [
        { accountCode: '5010', type: 'Debit', amount: 150700 },
        { accountCode: '1010', type: 'Credit', amount: 150700 }
      ]
    }
  ],
  auditLogs: AUDIT_LOGS,
  notifications: [
    { id: 'n-1', message: 'Welcome to IDEVA Cosmetic Factory OS v2.0 - System Boot Completed', severity: 'info', createdAt: new Date().toISOString() },
    { id: 'n-2', message: 'Alert: Active chemical stock Glycerin is below core safety levels. Purchase Request triggered.', severity: 'warning', createdAt: new Date().toISOString() }
  ]
};

export default function App() {
  const [dbState, setDbState] = useState<any>(INITIAL_DB_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('Admin'); // Interactive RBAC
  
  // Tab Switcher for unified portals
  const [activeTab, setActiveTab] = useState<any>('dashboard');

  // Sub-tab states for unified modules
  const [crmSubTab, setCrmSubTab] = useState<'crm' | 'customer_management' | 'job_management'>('crm');
  const [formulaSubTab, setFormulaSubTab] = useState<'product_management' | 'formula_management' | 'bom_management'>('product_management');
  const [inventorySubTab, setInventorySubTab] = useState<'warehouse' | 'purchasing'>('warehouse');
  const [productionSubTab, setProductionSubTab] = useState<'production' | 'packaging'>('production');
  const [qualitySubTab, setQualitySubTab] = useState<'qc' | 'qa' | 'coa_management' | 'traceability'>('qc');
  const [maintenanceSubTab, setMaintenanceSubTab] = useState<'maintenance' | 'document_control' | 'regulatory_affairs'>('maintenance');
  const [systemSubTab, setSystemSubTab] = useState<'reports' | 'administration' | 'gmp' | 'hr' | 'developer'>('reports');

  // Intelligent navigation helper to map sub-tabs to master portals dynamically
  const navigateTo = (targetTab: string) => {
    if (['crm', 'customer_management', 'job_management'].includes(targetTab)) {
      setActiveTab('crm_and_jobs');
      setCrmSubTab(targetTab as any);
    } else if (['product_management', 'formula_management', 'bom_management'].includes(targetTab)) {
      setActiveTab('formula_and_sku');
      setFormulaSubTab(targetTab as any);
    } else if (['purchasing', 'warehouse'].includes(targetTab)) {
      setActiveTab('inventory_and_purchasing');
      setInventorySubTab(targetTab as any);
    } else if (['production', 'packaging'].includes(targetTab)) {
      setActiveTab('production_and_packaging');
      setProductionSubTab(targetTab as any);
    } else if (['qa', 'qc', 'coa_management', 'traceability'].includes(targetTab)) {
      setActiveTab('quality_and_traceability');
      setQualitySubTab(targetTab as any);
    } else if (['maintenance', 'document_control', 'regulatory_affairs'].includes(targetTab)) {
      setActiveTab('maintenance_and_compliance');
      setMaintenanceSubTab(targetTab as any);
    } else if (['reports', 'administration', 'gmp', 'hr', 'developer'].includes(targetTab)) {
      setActiveTab('system_and_reports');
      setSystemSubTab(targetTab as any);
    } else {
      setActiveTab(targetTab as any);
    }
  };

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showMobileMore, setShowMobileMore] = useState(false);
  
  // Floating Tool Modals State
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showPdfMockup, setShowPdfMockup] = useState(false);
  
  // Notification logs toast state
  const [toasts, setToasts] = useState<{ id: string, msg: string, type: 'info' | 'warning' | 'error' }[]>([]);
  
  // AI Copilot state
  const [copilotMessage, setCopilotMessage] = useState<string>('');
  const [copilotHistory, setCopilotHistory] = useState<{ sender: 'user' | 'ai', msg: string }[]>([
    { sender: 'ai', msg: "Greetings! I am the **IDEVA Factory OS Copilot**. I analyze real-time inventory balances, floor OEE scores, maintenance backlogs, and corporate ledger distributions. Ask me anything such as *'Give me an operational optimization blueprint'*." }
  ]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Theme & Responsive Sidebar States for AdminLTE 3 / Bootstrap 5 Look
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ideva_theme_mode') === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    // Open by default on screen size, but support toggle
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    localStorage.setItem('ideva_theme_mode', isDarkMode ? 'dark' : 'light');
    const root = document.getElementById('ideva-applet-root');
    if (root) {
      if (isDarkMode) {
        root.classList.add('dark-theme');
      } else {
        root.classList.remove('dark-theme');
      }
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      const response = await fetch('/api/state');
      if (!response.ok) {
        throw new Error(`Failed to fetch state from backend: ${response.status}`);
      }
      const data = await response.json();
      setDbState(data);
    } catch (e) {
      addToast("Failed to connect to live Supabase company database.", "error");
    } finally {
      setLoading(false);
    }
  };

  const addToast = (msg: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleSendCopilotMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || copilotMessage;
    if (!promptToSend.trim()) return;

    setCopilotHistory(prev => [...prev, { sender: 'user', msg: promptToSend }]);
    setCopilotMessage('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptToSend })
      });
      const data = await response.json();
      setCopilotHistory(prev => [...prev, { sender: 'ai', msg: data.response }]);
    } catch {
      setCopilotHistory(prev => [...prev, { sender: 'ai', msg: "Sorry, I had an issue connecting to the cognitive copilot. Check process logs." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGlobalExportExcel = () => {
    // Generates a mock download of the active tab state
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `IDEVA OS Export - ${activeTab.toUpperCase()} Module Registry\n`;
    csvContent += "Generated Date,User Operator,Security Clearance,Target Enclosure\n";
    csvContent += `"${new Date().toLocaleString()}","${userRole}","Level-3 clearance","Primary Database Engine"\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IDEVA_Master_Export_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${activeTab.toUpperCase()} records to Excel successfully!`, "info");
  };

  const handleGlobalExportPdf = () => {
    setShowPdfMockup(true);
  };

  const handleGlobalPrint = () => {
    window.print();
  };

  if (loading || !dbState) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center gap-4">
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3 text-white">
          <RefreshCw className="h-6 w-6 text-blue-550 animate-spin" />
          <span className="font-bold text-sm tracking-tight text-slate-200">Booting IDEVA Cosmetic Factory OS v2.0 Enterprise Suite...</span>
        </div>
      </div>
    );
  }

  // Calculate dynamic dashboard stats
  const totalEmployees = dbState.employees?.length || 0;
  
  const totalRevenues = dbState.coa?.filter((ac: any) => ac.type === 'Revenue')
    .reduce((sum: number, ac: any) => sum + ac.balance, 0) || 0;
  
  const totalOperatingExpenses = dbState.coa?.filter((ac: any) => ac.type === 'Expense')
    .reduce((sum: number, ac: any) => sum + ac.balance, 0) || 0;
  
  const netEarnings = totalRevenues - totalOperatingExpenses;
  
  const unrestrictedStockPercent = dbState.materials
    ? Math.round((dbState.materials.filter((m: any) => m.stockLevel >= m.minStock).length / dbState.materials.length) * 100)
    : 100;

  // Formatting chart data
  const revenueExpenseChartData = [
    { name: 'Income Statement', GrossRevenues: totalRevenues, TotalOpex: totalOperatingExpenses, NetMargin: netEarnings }
  ];

  const moStageChartData = dbState.manufacturingOrders
    ? [
        { name: 'Weighing', count: dbState.manufacturingOrders.filter((m: any) => m.status === 'Weighing').length },
        { name: 'In Production', count: dbState.manufacturingOrders.filter((m: any) => m.status === 'In Production' || m.status === 'Material Issued').length },
        { name: 'QC Station', count: dbState.manufacturingOrders.filter((m: any) => m.status.includes('QC')).length },
        { name: 'Released', count: dbState.manufacturingOrders.filter((m: any) => m.status === 'Released').length },
      ]
    : [];

  const machineryChartData = dbState.machines
    ? dbState.machines.map((m: any) => ({
        name: m.name,
        MTBF: m.mtbfHours,
        MTTR: m.mttrHours * 50 // scaled up for visualization
      }))
    : [];

  const PIE_COLORS = ['#0071E3', '#FF9500', '#5856D6', '#34C759'];

  // Collapsed ERP Master Portals
  const menuItems = [
    { id: 'dashboard', label: '1. เวิร์กสเตชันแดชบอร์ด (Dashboard)', icon: LayoutDashboard, category: 'CORE PORTAL' },
    { id: 'crm_and_jobs', label: '2. บริหารงานลูกค้าและดีลใบงาน (CRM & Job Orders)', icon: Kanban, category: 'CLIENTS & ORDERS' },
    { id: 'formula_and_sku', label: '3. สารบบสินค้า SKU และสูตรวิจัย (R&D & BOM)', icon: Beaker, category: 'FORMULA & BOM R&D' },
    { id: 'inventory_and_purchasing', label: '4. จัดซื้อคลังวัตถุดิบระบุล็อต FEFO (WMS)', icon: Database, category: 'PROCUREMENT & INVENTORY' },
    { id: 'production_and_packaging', label: '5. แผนกผลิตสูตรผสมและบรรจุ (MES Shopfloor)', icon: Cpu, category: 'MES & PLANT OPERATIONS' },
    { id: 'quality_and_traceability', label: '6. ตรวจแล็บคุณภาพและสืบกลับ (QA/QC)', icon: ShieldCheck, category: 'QUALITY & SAFETY' },
    { id: 'maintenance_and_compliance', label: '7. ตารางซ่อมบำรุงและ SOP อ.ย. (PM & Regulation)', icon: Wrench, category: 'REPAIR & COMPLIANCE' },
    { id: 'system_and_reports', label: '8. รายงานสรุปและสิทธิ์ผู้ใช้งาน (Admin & Reports)', icon: Settings, category: 'ANALYTICS & SYSTEMS' },
    { id: 'copilot', label: '9. สมองกลร่วมงานสนันสนุน (AI Copilot)', icon: BrainCircuit, category: 'ANALYTICS & SYSTEMS' }
  ];

  // Filtering sidebar menu
  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
    item.category.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  return (
    <div className={`flex min-h-screen antialiased transition-colors duration-150 ${isDarkMode ? 'bg-[#0f111a] text-slate-100' : 'bg-[#eef2f5] text-[#212529]'}`} id="ideva-applet-root">
      
      {/* Drawer backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. AdminLTE 3 Responsive Theme Sidebar */}
      <aside className={`bg-[#343a40] text-[#c2c7d0] flex flex-col shrink-0 select-none transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-40 md:static ${
        sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:opacity-0 md:-translate-x-full'
      } ${
        isDarkMode ? 'bg-[#151821] border-r border-[#242936] text-slate-350' : 'bg-[#343a40] border-r border-[#2c3138] text-slate-200'
      }`}>
        
        {/* Brand Banner (AdminLTE 3 style) */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 text-white ${
          isDarkMode ? 'border-[#242936] bg-[#0d0f17]' : 'border-slate-705 bg-[#23272b]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#FF9500] rounded-xl text-white shadow-md animate-pulse">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-xs tracking-wider font-sans text-white uppercase">IDEVA Factory OS</h1>
              <p className="text-[9px] text-green-400 font-extrabold uppercase mt-0.5 tracking-wider">ASEAN GMP & ISO 22716</p>
            </div>
          </div>
          {/* Collapse side-button inside mobile sidebar for quick close */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-md md:hidden"
            title="Close sidebar"
            type="button"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>

        {/* User Status Panel (Classic AdminLTE 3 hallmark) */}
        <div className={`p-4 border-b flex items-center gap-3 ${
          isDarkMode ? 'border-[#242936] bg-[#1a1d29]' : 'border-slate-705 bg-[#2e3439]'
        }`}>
          <div className="h-10 w-10 rounded-full bg-sky-600 font-bold border border-slate-600 flex items-center justify-center text-white text-sm tracking-tight select-none shadow-sm">
            {userRole.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white leading-snug truncate">{userRole || 'Operator'}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9.5px] text-emerald-400 font-extrabold font-mono uppercase tracking-wider">● ONLINE / คุมสิทธิ์</span>
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar Menu Categories */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto no-scrollbar font-sans">
          {Array.from(new Set(filteredMenuItems.map(m => m.category))).map(cat => (
            <div key={cat} className="space-y-1">
              <p className="px-2.5 text-[9.5px] font-extrabold text-[#94a3b8] uppercase tracking-widest border-l-2 border-[#0071E3] mb-2">{cat}</p>
              {filteredMenuItems.filter(i => i.category === cat).map(item => {
                const IconComp = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      // On mobile we automatically close the drawer after clicking a menu item
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                      isSelected 
                        ? 'bg-[#0071E3] text-white font-bold shadow-md transform scale-[1.02]' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-750'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <IconComp className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-[#86868B]'}`} /> 
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-white' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Role and Sync */}
        <div className={`p-4 border-t text-[10.5px] text-slate-400 space-y-1.5 ${
          isDarkMode ? 'border-[#242936] bg-[#0c0d15]' : 'border-slate-750 bg-[#23272b]'
        }`}>
          <div className="flex justify-between items-center font-semibold">
            <span>ฐานข้อมูล MySQL: 127.0.0.1</span>
            <button 
              type="button" 
              onClick={() => {
                fetchState();
                addToast("เสร็จสิ้นการรีเฟรชฐานข้อมูล MySQL แบบ Real-time", "info");
              }} 
              className="text-[#FF9500] font-bold hover:underline py-0.5 px-2 bg-slate-900 rounded-md shadow-xs active:scale-95 transition-all text-[9.5px]"
            >
              ดึงข้อมูลใหม่
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">XAMPP Configured • Port 3306</p>
        </div>
      </aside>

      {/* 2. Primary Layout Scroller with Unified Top Navigation */}
      <main className={`flex-1 flex flex-col overflow-hidden min-w-0 transition-colors duration-150 ${isDarkMode ? 'bg-[#101322]' : 'bg-[#f4f6f9]'}`}>
        
        {/* Unified Top Navigation (AdminLTE 3 Style Navbar) */}
        <header className={`h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 gap-4 z-10 border-b shadow-sm transition-colors duration-150 ${
          isDarkMode ? 'bg-[#15192c] border-[#252a42] text-white' : 'bg-white border-[#E5E5EA] text-[#212529]'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Collapse Sidebar Trigger Button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="สลับมุมมองเมนูหลัก"
              type="button"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            {/* Micro branding visible only when sidebar collapsed or on mobile */}
            {!sidebarOpen && (
              <span className="text-xs font-extrabold text-[#0071E3] flex items-center gap-1">
                <Building className="h-4.5 w-4.5 text-[#FF9500]" /> 
                <span className="hidden sm:inline">IDEVA OS</span>
              </span>
            )}

            {/* Dynamic Status / ISO Banner (Easy read for factory workers) */}
            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold ${
              isDarkMode ? 'bg-[#1a1f38] border border-[#2b3252]' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ระบบดำเนินแผนงาน ISO 22716 & ASEAN GMP: สถานะปกติ</span>
            </div>
          </div>

          {/* Right-aligned utilities (Interactive switches, Dark mode, User status) */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Light / Dark Mode Toggle button */}
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                addToast(`สลับใช้งานหน้าจอ โหมด${!isDarkMode ? 'มืด (Dark Mode)' : 'สว่าง (Light Mode)'}`, "info");
              }}
              type="button"
              className={`p-2.5 rounded-xl transition-all relative group active:scale-90 ${
                isDarkMode ? 'hover:bg-slate-850 text-amber-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title={isDarkMode ? "เปลี่ยนเป็นโหมดสว่าง (Light Mode)" : "เปลี่ยนเป็นโหมดมืด (Dark Mode)"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Dynamic Interactive Role Switcher in Bootstrap dropdown form */}
            <div className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border ${
                isDarkMode ? 'bg-[#1c223c] border-[#2f3863]' : 'bg-neutral-50 border-[#E5E5EA]'
              }`}>
                <User className="h-4 w-4 text-[#FF9500]" />
                <span className="hidden xl:inline text-[9px] font-bold uppercase tracking-wider text-slate-500 mr-1">สิทธิ์ปัจจุบัน:</span>
                <select
                  className={`text-xs bg-transparent border-0 outline-none cursor-pointer font-bold pr-1 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}
                  value={userRole}
                  onChange={(e) => {
                    setUserRole(e.target.value);
                    addToast(`เปลี่ยนสิทธิ์การเข้าคีย์ระบบเป็น: ${e.target.value}`, "info");
                  }}
                >
                  <option value="Admin">Admin (สิทธิ์คาร์ซีเนียร์)</option>
                  <option value="Management">Management (สิทธิ์ผู้บริหาร)</option>
                  <option value="QC">QC Lab (ส่องเครื่อง/วิเคราะห์)</option>
                  <option value="Production">Production (ฝ่ายผลิตสูตรผสม)</option>
                </select>
              </div>
            </div>

            {/* Notification Icon classic to AdminLTE 3 */}
            <div className="relative cursor-pointer hover:scale-105 transition-transform" onClick={() => addToast("ยังไม่มีข้อความค้างชำระหรืองานด่วนที่ต้องการแก้ไขขณะนี้", "info")}>
              <Bell className="h-5 w-5 text-[#86868B] hover:text-[#0071E3]" />
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono text-[9px] font-bold h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {dbState.qcInspections?.filter((q: any) => q.status === 'Pending').length || 2}
              </span>
            </div>
          </div>
        </header>

        {/* 3. Floating Global Action Toolbar (AdminLTE Style Action Strip) */}
        <div className={`px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 select-none border-b transition-colors duration-150 ${
          isDarkMode ? 'bg-[#151825] border-[#252b42] text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-[#FF9500]" />
            <span className="font-mono text-xs font-extrabold text-slate-300">
              สถานีงานคีย์: <strong className="text-white uppercase ml-1.5 tracking-wider">{activeTab.replace('_', ' ')} workstation</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleGlobalExportExcel}
              type="button"
              className="p-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl text-white text-[10.5px] flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel แผ่นงาน
            </button>
            <button
              onClick={handleGlobalExportPdf}
              type="button"
              className="p-1.5 px-3.5 bg-[#0071E3] hover:bg-[#147ce5] font-semibold rounded-xl text-white text-[10.5px] flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <FileText className="h-3.5 w-3.5" /> เอกสาร PDF
            </button>
            <button
              onClick={handleGlobalPrint}
              type="button"
              className={`p-1.5 px-3.5 border font-semibold rounded-xl text-[10.5px] flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-100 border-[#E5E5EA] text-slate-700'
              }`}
            >
              <Printer className="h-3.5 w-3.5" /> พิมพ์บันทึก SOP
            </button>
            <button
              onClick={() => {
                setShowAuditModal(true);
                addToast("เปิดศูนย์บันทึกตรวจสอบสิทธิ์และกิจกรรมหลังบ้าน (Audit Log)", "info");
              }}
              type="button"
              className="p-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 font-semibold rounded-xl text-slate-950 text-[10.5px] flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              ประวัติตรวจสอบ (Audit Log)
            </button>
            <button
              onClick={() => {
                setShowAttachModal(true);
              }}
              type="button"
              className="p-1.5 px-3.5 bg-indigo-650 hover:bg-indigo-700 font-semibold rounded-xl text-white text-[10.5px] flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              แนบไฟล์ใบ COA +
            </button>
          </div>
        </div>

        {/* 4. Active Module Container Content (Configured for Light / Dark ERP look) */}
        <section className={`flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-6 transition-colors duration-150 ${
          isDarkMode ? 'bg-[#0f111a] text-slate-100' : 'bg-[#f4f6f9] text-[#212529]'
        }`}>
          
          {/* Module 1: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* SAP/Odoo/AdminLTE 3 style KPI Small Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="kpi-panel">
                
                {/* Small Box 1: ฟ้า (Blue) - Gross Revenue */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#005bb7] to-[#0071E3] text-white shadow-md transition-transform hover:scale-[1.01] flex flex-col justify-between h-36 group">
                  <div className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-white/80 text-[10.5px] font-extrabold uppercase tracking-wider font-sans">Gross Revenue (บัญชีรายรับ)</p>
                      <p className="text-2xl font-extrabold font-mono tracking-tight text-white leading-none">฿{totalRevenues.toLocaleString()}</p>
                      <p className="text-[10px] text-sky-100 bg-white/15 px-1.5 py-0.5 rounded-md inline-block font-bold">✓ Net Margin: +15.4% GP</p>
                    </div>
                    <DollarSign className="h-14 w-14 absolute right-2 top-2 text-white/10 group-hover:scale-110 transition-all duration-200" />
                  </div>
                  <button 
                    onClick={() => {
                      navigateTo('purchasing');
                      addToast("สลับสถานีงาน ไปที่ 'ด่านจัดซื้อจัดหา PR/PO (Purchasing)'", "info");
                    }}
                    className="w-full bg-black/15 hover:bg-black/35 text-white/95 text-[10.5px] py-2 text-center font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-100"
                  >
                    <span>เปิดผังบัญชีจัดซื้อ (More info)</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Small Box 2: เขียว (Green) - WMS Stock */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#219653] to-[#34C759] text-white shadow-md transition-transform hover:scale-[1.01] flex flex-col justify-between h-36 group">
                  <div className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-white/80 text-[10.5px] font-extrabold uppercase tracking-wider font-sans">Active RM Stocks (คลังคุมร้อยละ)</p>
                      <p className="text-2xl font-extrabold font-mono tracking-tight text-white leading-none">{unrestrictedStockPercent}% Quality OK</p>
                      <p className="text-[10px] text-green-100 bg-white/15 px-1.5 py-0.5 rounded-md inline-block font-bold">FEFO Auto-Suggester ON</p>
                    </div>
                    <Layers className="h-14 w-14 absolute right-2 top-2 text-white/10 group-hover:scale-110 transition-all duration-200" />
                  </div>
                  <button 
                    onClick={() => {
                      navigateTo('warehouse');
                      addToast("สลับสถานีงาน ไปที่ 'คลังควบคุมระบุล็อต FEFO (WMS)'", "info");
                    }}
                    className="w-full bg-black/15 hover:bg-black/35 text-white/95 text-[10px] py-2 text-center font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-100"
                  >
                    <span>ส่องยอดคลังระบุล็อต (More info)</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Small Box 3: ส้ม (Orange) - Pending QC */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#d35400] to-[#FF9500] text-white shadow-md transition-transform hover:scale-[1.01] flex flex-col justify-between h-36 group">
                  <div className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-white/80 text-[10.5px] font-extrabold uppercase tracking-wider font-sans">Pending QC (พิจารณากักกัน)</p>
                      <p className="text-2xl font-extrabold font-mono tracking-tight text-white leading-none">
                        {dbState.qcInspections?.filter((q: any) => q.status === 'Pending').length || 1} Batches
                      </p>
                      <p className="text-[10px] text-orange-100 bg-white/15 px-1.5 py-0.5 rounded-md inline-block font-bold">⚠️ Quarantine Checked</p>
                    </div>
                    <Beaker className="h-14 w-14 absolute right-2 top-2 text-white/10 group-hover:scale-110 transition-all duration-200" />
                  </div>
                  <button 
                    onClick={() => {
                      navigateTo('qc');
                      addToast("สลับสถานีงาน ไปที่ 'วิเคราะห์ส่องสิ่งปนเปื้อน (QC)'", "info");
                    }}
                    className="w-full bg-black/15 hover:bg-black/35 text-white/95 text-[10px] py-2 text-center font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-100"
                  >
                    <span>เปิดชุดวิเคราะห์แลป (More info)</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Small Box 4: ฟ้า-เขียว - Machine OEE */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0d9488] to-[#17a2b8] text-white shadow-md transition-transform hover:scale-[1.01] flex flex-col justify-between h-36 group">
                  <div className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-white/80 text-[10.5px] font-extrabold uppercase tracking-wider font-sans">Plant OEE (ประสิทธิภาพจักร)</p>
                      <p className="text-2xl font-extrabold font-mono tracking-tight text-white leading-none">86.2%</p>
                      <p className="text-[10px] text-teal-100 bg-white/15 px-1.5 py-0.5 rounded-md inline-block font-bold font-mono">✓ World-class standard</p>
                    </div>
                    <Wrench className="h-14 w-14 absolute right-2 top-2 text-white/10 group-hover:scale-110 transition-all duration-200" />
                  </div>
                  <button 
                    onClick={() => {
                      navigateTo('maintenance');
                      addToast("สลับสถานีงาน ไปที่ 'ตารางป้องกันบำรุงกวน (PM)'", "info");
                    }}
                    className="w-full bg-black/15 hover:bg-black/35 text-white/95 text-[10px] py-2 text-center font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-100"
                  >
                    <span>เปิดหน้าบำรุงกวนป้องกัน (More info)</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Graphical Charts and Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Income Statements */}
                <div className={`p-5 rounded-2xl border transition-colors duration-150 space-y-3 ${
                  isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
                }`}>
                  <h4 className={`font-bold text-xs uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-205' : 'text-slate-900'
                  }`}>บัญชีรายละเอียดผลการดำเนินงาน (Accounting Profit Sheet)</h4>
                  <div className="h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueExpenseChartData}>
                        <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#86868B"} fontSize={10} />
                        <YAxis stroke={isDarkMode ? "#cbd5e1" : "#86868B"} fontSize={10} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' } : undefined} />
                        <Area type="monotone" dataKey="GrossRevenues" stroke="#0071E3" fill="#0071E3" fillOpacity={0.15} name="รายรับรวม" />
                        <Area type="monotone" dataKey="TotalOpex" stroke="#FF9500" fill="#FF9500" fillOpacity={0.1} name="ต้นทุน" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Live Machines MTBF states */}
                <div className={`p-5 rounded-2xl border transition-colors duration-150 space-y-3 ${
                  isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
                }`}>
                  <h4 className={`font-bold text-slate-900 text-xs uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-205' : 'text-slate-900'
                  }`}>ประสิทธิภาพชั่วโมงการทนกวนเครื่อง Reactor (Machine MTBF Hours)</h4>
                  <div className="h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={machineryChartData}>
                        <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#86868B"} fontSize={9} />
                        <YAxis stroke={isDarkMode ? "#cbd5e1" : "#86868B"} fontSize={10} />
                        <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' } : undefined} />
                        <Bar dataKey="MTBF" fill="#0071E3" radius={[4, 4, 0, 0]} name="ชั่วโมงทนทานเฉลี่ย" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              <div className="bg-[#1C1C1E] p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <span className="bg-blue-600 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Operations Suggestion</span>
                  <h4 className="font-bold text-white text-[15px]">ข้อแนะนำสมองกลจากบอทร่วมงานไอดีวา (IDEVA Copilot Tips)</h4>
                  <p className="text-[#86868B] text-xs max-w-xl">
                    สต็อก Niacinamide อยู่ในขั้นวิกฤต (25 kg) แต่มีคิวรอความรับเข้า GRN005 ในดักตรวจ COA. กรุณาเร่งเจ้าหน้าที่ฝ่ายตรวจสอบ QC ปล่อยปล่อยสิทธิ์ผ่านแล็บโดยด่วนเพื่อให้ไลน์ Mixer RX-3F ทำงานตู้ได้เต็มประสิทธิภาพ OEE
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('copilot')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                >
                  สอบถามสมองอัจฉริยะ 🧠
                </button>
              </div>

            </div>
          )}

          {/* Module 2: CRM & Job Orders Portal */}
          {activeTab === 'crm_and_jobs' && (
            <div className="space-y-6">
              {/* Sub-tab Navigation */}
              <div className={`p-1.5 sm:p-2 rounded-2xl border flex flex-wrap gap-1 transition-colors ${
                isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
              }`}>
                <button
                  onClick={() => setCrmSubTab('crm')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    crmSubTab === 'crm' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  💵 แผงดีลเจรจาลูกค้า (CRM Pipeline)
                </button>
                <button
                  onClick={() => setCrmSubTab('customer_management')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    crmSubTab === 'customer_management' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  👥 ทะเบียนลูกค้าโรงงาน (Customers)
                </button>
                <button
                  onClick={() => setCrmSubTab('job_management')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    crmSubTab === 'job_management' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📋 ทะเบียนใบสั่งผลิต (Job Orders)
                </button>
              </div>

              {crmSubTab === 'crm' && (
                <CRM_OS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {crmSubTab === 'customer_management' && (
                <CRM_OS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {crmSubTab === 'job_management' && (
                <SalesProdWorkflowOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
            </div>
          )}

          {/* Module 3: Product, R&D & BOM Portal */}
          {activeTab === 'formula_and_sku' && (
            <div className="space-y-6">
              <div className={`p-1.5 sm:p-2 rounded-2xl border flex flex-wrap gap-1 transition-colors ${
                isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
              }`}>
                <button
                  onClick={() => setFormulaSubTab('product_management')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    formulaSubTab === 'product_management' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🏷️ สารบบสินค้า SKU (SKU Catalog)
                </button>
                <button
                  onClick={() => setFormulaSubTab('formula_management')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    formulaSubTab === 'formula_management' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🧪 สูตรเคมีสลักกวนวิจัย (Formula R&D)
                </button>
                <button
                  onClick={() => setFormulaSubTab('bom_management')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    formulaSubTab === 'bom_management' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🗃️ บัญชีวัตถุดิบคลังกวนสูตร (Formula BOM)
                </button>
              </div>

              {formulaSubTab === 'product_management' && (
                <CRM_OS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {formulaSubTab === 'formula_management' && (
                <PerfumeFormulaOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {formulaSubTab === 'bom_management' && (
                <ChemicalStockOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
            </div>
          )}

          {/* Module 4: Inventory & Purchasing Supply Portal */}
          {activeTab === 'inventory_and_purchasing' && (
            <div className="space-y-6">
              <div className={`p-1.5 sm:p-2 rounded-2xl border flex flex-wrap gap-1 transition-colors ${
                isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
              }`}>
                <button
                  onClick={() => setInventorySubTab('warehouse')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    inventorySubTab === 'warehouse' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📦 คลังวัตถุดิบระบุล็อต (WMS Stock FEFO)
                </button>
                <button
                  onClick={() => setInventorySubTab('purchasing')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    inventorySubTab === 'purchasing' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🧾 ด่านจัดซื้อพัสดุและ PR/PO (Purchasing)
                </button>
              </div>

              {inventorySubTab === 'warehouse' && (
                <WarehouseOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {inventorySubTab === 'purchasing' && (
                <AccountingOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
            </div>
          )}

          {/* Module 5: MES & Plant Production Operations Portal */}
          {activeTab === 'production_and_packaging' && (
            <div className="space-y-6">
              <div className={`p-1.5 sm:p-2 rounded-2xl border flex flex-wrap gap-1 transition-colors ${
                isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
              }`}>
                <button
                  onClick={() => setProductionSubTab('production')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    productionSubTab === 'production' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ⚙️ ชุดบันทึกผลิตสูตร BPR (MES BMR)
                </button>
                <button
                  onClick={() => setProductionSubTab('packaging')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    productionSubTab === 'packaging' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📦 แผนกบรรจุพรีเมียม (Packaging)
                </button>
              </div>

              {productionSubTab === 'production' && (
                <ProductionOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {productionSubTab === 'packaging' && (
                <SalesProdWorkflowOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
            </div>
          )}

          {/* Module 6: Quality Assurance & Traceability Portal */}
          {activeTab === 'quality_and_traceability' && (
            <div className="space-y-6">
              <div className={`p-1.5 sm:p-2 rounded-2xl border flex flex-wrap gap-1 transition-colors ${
                isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
              }`}>
                <button
                  onClick={() => setQualitySubTab('qc')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    qualitySubTab === 'qc' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🔬 วิเคราะห์สิ่งปนเปื้อนแล็บ (QC Lab)
                </button>
                <button
                  onClick={() => setQualitySubTab('qa')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    qualitySubTab === 'qa' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🛡️ ประกันคุณภาพตรวจสอบ (QA Standards)
                </button>
                <button
                  onClick={() => setQualitySubTab('coa_management')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    qualitySubTab === 'coa_management' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📄 ตรวจใบรับรับรอง COA (Chemical COA)
                </button>
                <button
                  onClick={() => setQualitySubTab('traceability')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    qualitySubTab === 'traceability' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🔍 ตรวจสืบย้อนรหัสกระบวนการ (Traceability 5s)
                </button>
              </div>

              {qualitySubTab === 'qc' && (
                <QualityOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {qualitySubTab === 'qa' && (
                <QualityOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {qualitySubTab === 'coa_management' && (
                <QualityOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {qualitySubTab === 'traceability' && (
                <TraceabilityOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
            </div>
          )}

          {/* Module 7: Repair, PM & Regulation compliance Portal */}
          {activeTab === 'maintenance_and_compliance' && (
            <div className="space-y-6">
              <div className={`p-1.5 sm:p-2 rounded-2xl border flex flex-wrap gap-1 transition-colors ${
                isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
              }`}>
                <button
                  onClick={() => setMaintenanceSubTab('maintenance')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    maintenanceSubTab === 'maintenance' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🔧 ป้องกันบำรุงกวนป้องกัน (PM Checklist)
                </button>
                <button
                  onClick={() => setMaintenanceSubTab('document_control')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    maintenanceSubTab === 'document_control' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📂 ควบคุมระเบียบประวัติดิว SOP
                </button>
                <button
                  onClick={() => setMaintenanceSubTab('regulatory_affairs')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    maintenanceSubTab === 'regulatory_affairs' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🏛️ ขึ้นทะเบียนฉลากแจ้ง อ.ย. (FDA License)
                </button>
              </div>

              {maintenanceSubTab === 'maintenance' && (
                <MaintenanceOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {maintenanceSubTab === 'document_control' && (
                <RegulatoryOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {maintenanceSubTab === 'regulatory_affairs' && (
                <RegulatoryOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
            </div>
          )}

          {/* Module 8: System settings, analytical reports & Special Portals */}
          {activeTab === 'system_and_reports' && (
            <div className="space-y-6">
              <div className={`p-1.5 sm:p-2 rounded-2xl border flex flex-wrap gap-1 transition-colors ${
                isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
              }`}>
                <button
                  onClick={() => setSystemSubTab('reports')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    systemSubTab === 'reports' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  📊 รายงานวิเคราะห์ข้อมูล (Analytical Pivot)
                </button>
                <button
                  onClick={() => setSystemSubTab('administration')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    systemSubTab === 'administration' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🔑 ตั้งสิทธิ์สิทธิ์คีย์ระบบ (Admin RBAC)
                </button>
                <button
                  onClick={() => setSystemSubTab('gmp')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    systemSubTab === 'gmp' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🎖️ จัดการมาตรฐานโรงงาน (GMP Hub)
                </button>
                <button
                  onClick={() => setSystemSubTab('hr')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    systemSubTab === 'hr' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  👥 ฝ่ายงานกำลังพลและสลักจ่าย (HR & Payroll)
                </button>
                <button
                  onClick={() => setSystemSubTab('developer')}
                  className={`px-4 py-2 font-extrabold text-xs rounded-xl transition-all ${
                    systemSubTab === 'developer' 
                      ? 'bg-[#0071E3] text-white shadow-sm' 
                      : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  💻 Dev Command Center
                </button>
              </div>

              {systemSubTab === 'reports' && (
                <div className={`p-6 rounded-2xl border transition-colors ${
                  isDarkMode ? 'bg-[#151824] border-[#242936]' : 'bg-white border-[#E5E5EA] shadow-xs'
                } space-y-4`}>
                  <div className="flex justify-between items-center border-b border-zinc-100/10 pb-3">
                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>แผงวิจักษ์ต้นทุนคงคลัง และรอบผลิตอัจฉริยะ (Pivoting Analytical Reports Tool)</h4>
                    <button onClick={handleGlobalExportExcel} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs transition-colors">
                      Export Complete Raw Pivot Table (CSV)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className={`p-4 border rounded-xl space-y-2 ${isDarkMode ? 'bg-slate-850 border-slate-755' : 'bg-slate-50'}`}>
                      <span className="font-bold text-[#0071E3]">สรุปคุณลักษณะผลผลิต (Production Mix Yield Report)</span>
                      <div className="space-y-1 text-slate-500 text-[11px] pt-1 border-t border-slate-205/10">
                        <p>ปริมาตรรอผลิต (Total Target Vol) : <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-900'}>4,500 Liters</strong></p>
                        <p>ปริมาตรกวนผสมผลสำเร็จ (Actual Mixed Vol) : <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-900'}>4,492 Liters</strong></p>
                        <p>สรุปเปอร์เซ็นต์ของเสียเศษสูตร (Yield Rate) : <strong className="text-green-600">99.82% (Excellent Standard)</strong></p>
                      </div>
                    </div>

                    <div className={`p-4 border rounded-xl space-y-2 ${isDarkMode ? 'bg-slate-850 border-slate-755' : 'bg-slate-50'}`}>
                      <span className="font-bold text-[#FF9500]">สรุปวิเศษส่วนจัดซื้อพัสดุ (Supply Purchasing Allocation)</span>
                      <div className="space-y-1 text-slate-500 text-[11px] pt-1 border-t border-slate-205/10">
                        <p>ใบคำขอจัดส่งสินค้า Auto-PR : <strong className="text-indigo-600">3 ฉบับ (Draft)</strong></p>
                        <p>มูลค่า PR พัสดุคงค้าง (Open Value) : <strong className="text-[#FF9500]">฿120,000</strong></p>
                        <p>ผู้เซ็นรับรอง (Witness Manager) : <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-900'}>ฝ่ายคลังสินค้าปักษ์สมพร</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {systemSubTab === 'administration' && (
                <AdminOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} />
              )}
              {systemSubTab === 'gmp' && (
                <GMPHubOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {systemSubTab === 'hr' && (
                <HRPayrollOS dbState={dbState} onRefresh={fetchState} onNotify={addToast} userRole={userRole} />
              )}
              {systemSubTab === 'developer' && (
                <DeveloperOS onNotify={addToast} />
              )}
            </div>
          )}

          {/* AI Copilot Tab */}
          {activeTab === 'copilot' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-sm max-w-4xl mx-auto space-y-6 animate-fade-in" id="ai-intelligence-panel">
              <div className="flex items-center gap-3 border-b border-[#E5E5EA] pb-4">
                <span className="p-3 bg-neutral-100 border border-[#E5E5EA] rounded-xl text-[#1D1D1F]"><BrainCircuit className="h-6 w-6" /></span>
                <div>
                  <h3 className="font-semibold text-[#1D1D1F] text-lg">สมองกลสนับสนุนไลน์ผลิต (Factory OS Copilot)</h3>
                  <p className="text-[#86868B] text-xs">วิเคราะห์แผน OEE, ทะเบียนวัตถุดิบขาดแคลน และจัดงบลงทุนเชิงประหยัดด้วยปัญญาประดิษฐ์สถิติขั้นสูง</p>
                </div>
              </div>

              <div className="h-[430px] border border-[#E5E5EA] bg-[#F5F5F7]/40 rounded-2xl p-5 overflow-y-auto space-y-4">
                {copilotHistory.map((h, idx) => (
                  <div key={idx} className={`flex ${h.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`p-4 rounded-2xl max-w-2xl text-xs shadow-xs leading-relaxed ${
                        h.sender === 'user' 
                          ? 'bg-[#0071E3] text-white rounded-br-none' 
                          : 'bg-white border border-[#E5E5EA] text-[#1D1D1F] rounded-bl-none'
                      }`}
                    >
                      <div className="flex font-bold uppercase tracking-wider text-[9px] mb-1.5 opacity-80">
                        {h.sender === 'user' ? 'Operator' : 'AI Engineer Core'}
                      </div>
                      
                      <div className="space-y-1.5 font-sans">
                        {h.msg.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#E5E5EA] p-4 rounded-xl flex items-center gap-3">
                      <RefreshCw className="h-4 w-4 text-[#0071E3] animate-spin" />
                      <span className="text-xs text-[#86868B]">กำลังประมวลความเร็วสูงด้วยโครงข่ายข้อมูล Gemini Neural...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider">ตัวอย่างหัวข้อมอบหมายด่วน</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSendCopilotMessage(e, "Audit current OEE bottlenecks across live chemical mixers")}
                    className="px-3.5 py-2 border border-[#E5E5EA] hover:border-[#D1D1D6] bg-white text-[#1D1D1F] text-xs rounded-xl font-medium transition-colors"
                  >
                    🚀 ตรวจคอขวด OEE Mixers
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSendCopilotMessage(e, "Check inventory stock level warnings and list pending PR orders")}
                    className="px-3.5 py-2 border border-[#E5E5EA] hover:border-[#D1D1D6] bg-white text-[#1D1D1F] text-xs rounded-xl font-medium transition-colors"
                  >
                    📦 วิเคราะห์วัตถุดิบสำรอง
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => handleSendCopilotMessage(e)} className="flex gap-2">
                <input
                  type="text"
                  className="w-full text-xs rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] p-3.5 focus:bg-white focus:ring-2 focus:ring-[#0071E3]/25 focus:border-[#0071E3] outline-none text-[#1D1D1F] font-sans"
                  placeholder="Ask anything (เช่น 'วิเคราะห์แผนการซ่อมเครื่องจักร Mixer-MX10 เชิงรุก')"
                  value={copilotMessage}
                  onChange={(e) => setCopilotMessage(e.target.value)}
                  disabled={aiLoading}
                  required
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-6 py-3.5 bg-[#1D1D1F] hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-all h-full"
                >
                  ส่งข้อมูล
                </button>
              </form>
            </div>
          )}

        </section>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200/80 h-16 rounded-2xl z-40 flex justify-around items-center shadow-xl px-2" id="mobile-bottom-bar">
        <button
          onClick={() => { navigateTo('dashboard'); setShowMobileMore(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 bg-indigo-50/40 font-bold' : 'text-[#86868B]'}`}
        >
          <LayoutDashboard className="h-4.5 w-4.5" />
          <span className="text-[11px] font-bold mt-1">แดชบอร์ด</span>
        </button>

        <button
          onClick={() => { navigateTo('warehouse'); setShowMobileMore(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none rounded-xl transition-all ${activeTab === 'inventory_and_purchasing' && inventorySubTab === 'warehouse' ? 'text-indigo-600 bg-indigo-50/40 font-bold' : 'text-[#86868B]'}`}
        >
          <Database className="h-4.5 w-4.5" />
          <span className="text-[11px] font-bold mt-1">คลังวัตถุดิบ</span>
        </button>

        <button
          onClick={() => { navigateTo('traceability'); setShowMobileMore(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none rounded-xl transition-all ${activeTab === 'quality_and_traceability' && qualitySubTab === 'traceability' ? 'text-indigo-600 bg-indigo-50/40 font-bold' : 'text-[#86868B]'}`}
        >
          <QrCode className="h-4.5 w-4.5" />
          <span className="text-[11px] font-bold mt-1">สืบย้อนกลับ</span>
        </button>

        <button
          onClick={() => setShowMobileMore(prev => !prev)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none rounded-xl transition-all ${showMobileMore ? 'text-indigo-600 bg-indigo-50/40 font-bold scale-105' : 'text-[#86868B]'}`}
        >
          <span className="text-[11px] font-black leading-none bg-slate-100 border p-1 rounded-full px-2">•••</span>
          <span className="text-[11px] font-bold mt-1">อื่น ๆ</span>
        </button>
      </div>

      {/* MOBILE MORE DRAWER POPUP OVERLAY */}
      {showMobileMore && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/45 backdrop-blur-xs flex items-end animate-fade-in" id="mobile-more-backdrop" onClick={() => setShowMobileMore(false)}>
          <div 
            className="w-full bg-[#FAFAFC] rounded-t-[32px] p-5 pb-24 shadow-2xl space-y-4 max-h-[75%] overflow-y-auto font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">เมนูระบบโรงงานผลิต</h4>
                <p className="text-[9px] text-[#86868B] font-bold uppercase tracking-wider">IDEVA Factory Process Modules</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowMobileMore(false)}
                className="w-8 h-8 rounded-full bg-slate-200/50 text-slate-705 font-extrabold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700 font-semibold">
              <button
                onClick={() => { navigateTo('crm'); setShowMobileMore(false); }}
                className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:bg-slate-50"
              >
                CRM Pipeline
              </button>
              <button
                onClick={() => { navigateTo('production'); setShowMobileMore(false); }}
                className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:bg-slate-50"
              >
                Mixing BPR
              </button>
              <button
                onClick={() => { navigateTo('qa'); setShowMobileMore(false); }}
                className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:bg-slate-50"
              >
                QA Standards
              </button>
              <button
                onClick={() => { navigateTo('qc'); setShowMobileMore(false); }}
                className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:bg-slate-50"
              >
                QC Laboratory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modal A: Audit Log View */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-center items-center p-3 animate-fade-in" id="global-audit-log-modal">
          <div className="bg-[#121420] text-slate-300 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white text-sm">ประวัติบันทึกการทำงาน (Audit Log Trail)</h4>
                <p className="text-[10px] text-slate-400 font-mono">Module Security Audit logs matching ISO 22716 standards</p>
              </div>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-white font-bold font-mono">✕</button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto text-[11px] font-mono divide-y divide-slate-850">
              {dbState.auditLogs?.slice(0, 8).map((log: any) => (
                <div key={log.id} className="pt-2 text-slate-400">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span className="text-indigo-400">[{log.module}] {log.user} ({log.role})</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="mt-1 text-slate-300 font-sans leading-relaxed">{log.action}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowAuditModal(false)} 
                className="px-4 py-2 bg-[#0071E3] hover:bg-[#147ce5] text-white font-bold text-xs rounded-xl"
              >
                ปิดสารบบการตรวจสอบ ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modal B: Drag and Drop Attach File */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-center items-center p-3 animate-fade-in" id="global-attach-file-modal">
          <div className="bg-white border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">อัพโหลดและแนบไฟล์ประกอบหลักฐาน</h4>
              <p className="text-[10px] text-slate-400 font-mono">SOP & batch validation attachments for ISO conformity (Never overwrite)</p>
            </div>

            {/* Drag Drop Area */}
            <div 
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2 hover:border-indigo-500 cursor-pointer transition"
              onClick={() => document.getElementById('global-drag-file')?.click()}
            >
              <Upload className="h-8 w-8 text-[#0071E3] mx-auto animate-bounce" />
              <p className="font-bold text-slate-700">ลากไฟล์วางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="text-[10px] text-slate-400">รองรับ PDF, Excel, Word สูงสุด 20 MB</p>
              <input 
                type="file" 
                id="global-drag-file" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    addToast(`แนบไฟล์หลักฐานประกอบสำเร็จ: ${e.target.files[0].name}`, "info");
                    setShowAttachModal(false);
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAttachModal(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-slate-800 border rounded-lg font-bold"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock PDF Document Preview Modal */}
      {showPdfMockup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 animate-fade-in" id="global-pdf-mock-modal">
          <div className="bg-white rounded-2xl border max-w-3xl w-full p-6 shadow-2xl space-y-4 overflow-hidden max-h-[85%] flex flex-col justify-between">
            <div className="border-b border-slate-150 pb-2 flex justify-between items-center shrink-0">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">ไฟล์ส่งออกเอกสารรายงานฉบับจัดพิมพ์ภาพเสมือน (.PDF Render)</h4>
                <p className="text-[10px] text-slate-400 font-mono">IDEVA Cosmetic Factory OS v2.0 • ISO Certificate conformances</p>
              </div>
              <button onClick={() => setShowPdfMockup(false)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100/50 border border-slate-200 rounded-xl p-8 space-y-6 text-xs text-slate-800 font-sans leading-relaxed select-text" id="pdf-container-viewport">
              {/* PDF Header mapping */}
              <div className="flex justify-between border-b pb-4 border-slate-300">
                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-950 text-sm">โรงงานผลิตเครื่องสำอางแบคเกจจำกัด (มหาชน)</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ASEAN GMP ASEAN, ISO 22716 & ISO 9001 Compliance</p>
                  <p className="text-[10px] text-slate-400">เลขจดแจ้งพาณิชย์: 0105569000123</p>
                </div>
                <div className="text-right font-mono text-[9px] text-slate-500">
                  <p>เลขที่บัญชีเอกสาร: #PDF-OUT-2569</p>
                  <p>พิมพ์จากเวิร์กสเตชัน: {activeTab.toUpperCase()}</p>
                  <p>วันที่พิมพ์: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-3">
                <p className="font-bold text-zinc-900 text-xs">หัวข้อกิจกรรม: รายงานการดำเนินระดับโรงงานผลิตและกักเกกันสารเคมี</p>
                <p className="text-slate-600">
                  ขอรับรองว่ารายงานใบข้อมูลนี้ นำกระบวนการประมวลจากเครื่องปฏิกรณ์เคมี Reactor RX-3F และสต็อก WMS ทะเบียนระเบียนคงคลัง FEFO ตราอนุมัติถูกต้อง ผ่านการรับรอบใบตรวจแล็บ COA เรียบร้อยแล้วทุกกรณี เหมาะต่อการยื่นประเมินสลัดความมั่นคงของสถานประกอบการต่อนายจดแจ้งพนักงาน อ.ย.
                </p>
                
                {/* Visual signature boxes */}
                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[10px] text-slate-500 font-sans">
                  <div className="border-t border-slate-300 pt-3 space-y-1">
                    <p className="font-bold text-slate-800">___________________________</p>
                    <p className="font-bold text-slate-900">({userRole === 'Admin' ? 'เจมส์ บราวน์' : 'ดร. ลลิตา วรโชติสกุล'})</p>
                    <p>เจ้าหน้าที่ผู้รับผิดชอบจัดพิมพ์เอกสาร</p>
                  </div>
                  <div className="border-t border-slate-300 pt-3 space-y-1">
                    <p className="font-bold text-slate-800">___________________________</p>
                    <p className="font-bold text-slate-900">(เจมส์ บราวน์ - QA Director)</p>
                    <p>ผู้จัดการฝ่ายประกันคุณภาพโรงงาน (Witness QA Sign)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setShowPdfMockup(false);
                }}
                className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#147ce5] text-white font-bold text-xs rounded-xl"
              >
                ยืนยันการจัดพิมพ์ (Print A4 Paper) ✓
              </button>
              <button
                type="button"
                onClick={() => setShowPdfMockup(false)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-slate-200 text-slate-800 border rounded-xl font-bold text-xs"
              >
                ปิดพรีวิว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Notifications and Toast Containers */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`p-3.5 rounded-xl text-xs font-bold shadow-2xl border flex items-center gap-2.5 pointer-events-auto animate-fade-in ${
              toast.type === 'error' 
                ? 'bg-red-900/90 text-red-100 border-red-800' 
                : toast.type === 'warning' 
                ? 'bg-[#FF9500]/95 text-slate-950 border-amber-500' 
                : 'bg-slate-950/95 text-slate-100 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-450 animate-pulse"></span>
            <span>{toast.msg}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
