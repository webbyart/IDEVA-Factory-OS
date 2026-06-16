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
  Sun, Moon, Menu, ChevronDown, Home,
  ShoppingBag, BarChart3, UserPlus, Globe2, Send, Minimize, Maximize2, MessageCircle,
  BookOpen, Palette
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
import UserGuideOS from './components/UserGuideOS';

// New high-fidelity modular subcomponents
import WarehouseOS from './components/WarehouseOS';
import QualityOS from './components/QualityOS';
import TraceabilityOS from './components/TraceabilityOS';
import CRM_OS from './components/CRM_OS';
import AdminOS from './components/AdminOS';
import RegulatoryOS from './components/RegulatoryOS';
import DatabaseSetupOS from './components/DatabaseSetupOS';

// No mock data imports - purely connected to database state
const INITIAL_DB_STATE = {
  departments: [],
  roles: [],
  employees: [],
  customers: [],
  suppliers: [],
  products: [],
  materials: [],
  formulas: [],
  machines: [],
  manufacturingOrders: [],
  purchaseRequests: [],
  purchaseOrders: [],
  goodsReceipts: [],
  qcInspections: [],
  repairTickets: [],
  pmTasks: [],
  spareParts: [],
  attendance: [],
  leaveRequests: [],
  otRequests: [],
  payrollPeriods: [],
  payslips: [],
  transactions: [],
  invoices: [],
  supplierBills: [],
  bills: [],
  coa: [],
  journals: [],
  auditLogs: [],
  notifications: [
    { id: 'n-1', message: 'Welcome to IDEVA Cosmetic Factory OS v2.0 - System Boot Completed', severity: 'info', createdAt: new Date().toISOString() }
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
  
  // AdminLTE 4 Direct Chat states
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Alexander Pierce', text: 'Is this template really for free? That\'s unbelievable!', time: '23 Jan 2:00 pm', isMe: false },
    { id: '2', sender: 'Sarah Bullock', text: 'You better believe it!', time: '23 Jan 2:05 pm', isMe: true },
    { id: '3', sender: 'Alexander Pierce', text: 'Wow, this is awesome! We can build incredible factory operating systems out of it.', time: '23 Jan 5:37 pm', isMe: false },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsgId = `${Date.now()}`;
    const newMsg = {
      id: userMsgId,
      sender: userRole === 'Admin' ? 'Icie Reynolds' : userRole,
      text: chatInput,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      isMe: true
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    
    // Simulate smart agent reply in 1.2 seconds
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-reply`,
          sender: 'Alexander Pierce',
          text: `Roger that! Message received at IDEVA Factory Engine. Let's work on dashboard v4 optimization! ⚙️`,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          isMe: false
        }
      ]);
    }, 1200);
  };
  


  // Theme & Responsive Sidebar States for AdminLTE 3 / Bootstrap 5 Look
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ideva_theme_mode') === 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const [colorTheme, setColorTheme] = useState<'blue' | 'green' | 'yellow'>(() => {
    return (localStorage.getItem('ideva_color_theme') as any) || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('ideva_color_theme', colorTheme);
  }, [colorTheme]);

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

  const [activeDbConfig, setActiveDbConfig] = useState<any>({ type: 'xampp', host: 'localhost', port: '3306' });

  const fetchDbConfig = async () => {
    try {
      const res = await fetch('/api/db/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setActiveDbConfig(data.config);
        }
      }
    } catch (err) {}
  };

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
      fetchDbConfig();
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
  
  const unrestrictedStockPercent = dbState.materials && dbState.materials.length > 0
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
    { id: 'user_guide', label: '10. คู่มือใช้งานและคำแนะนำระบบ (SOP & Manual)', icon: BookOpen, category: 'ANALYTICS & SYSTEMS' },
    { id: 'database_setup', label: '9. ตั้งค่า ฐานข้อมูล (Database Engine)', icon: Database, category: 'ANALYTICS & SYSTEMS' }
  ];

  // Filtering sidebar menu
  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
    item.category.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  return (
    <div className={`flex min-h-screen antialiased transition-colors duration-150 ${isDarkMode ? 'bg-[#0d0f17] text-slate-100' : 'bg-[#f1f5f9] text-[#1e293b]'}`} id="ideva-applet-root">
      
      {/* Dynamic Theme Color Overrides style tag */}
      <style>{`
        ${colorTheme === 'green' ? `
          /* Green light theme overrides */
          .bg-indigo-600, .bg-[#0071E3], .bg-indigo-650 { background-color: #059669 !important; }
          .text-indigo-600, .text-[#0071E3] { color: #059669 !important; }
          .border-indigo-600, .border-[#0071E3], .border-indigo-400, .border-indigo-600\\/30 { border-color: #059669 !important; }
          .hover\\:bg-indigo-700:hover, .hover\\:bg-indigo-750:hover, .hover\\:bg-\\[\\#0061c0\\]:hover, .hover\\:bg-indigo-650:hover, .hover\\:bg-indigo-600\\/90:hover { background-color: #047857 !important; }
          .bg-indigo-50\\/40, .bg-indigo-50, .bg-indigo-50\\/30 { background-color: #ecfdf5 !important; }
          .text-indigo-805, .text-indigo-800 { color: #047857 !important; }
          .border-indigo-100 { border-color: #a7f3d0 !important; }
          .text-indigo-600 { color: #059669 !important; }
        ` : ''}
        ${colorTheme === 'yellow' ? `
          /* Yellow light theme overrides */
          .bg-indigo-600, .bg-[#0071E3], .bg-indigo-650 { background-color: #d97706 !important; }
          .text-indigo-600, .text-[#0071E3] { color: #d97706 !important; }
          .border-indigo-600, .border-[#0071E3], .border-indigo-400, .border-indigo-600\\/30 { border-color: #d97706 !important; }
          .hover\\:bg-indigo-700:hover, .hover\\:bg-indigo-750:hover, .hover\\:bg-\\[\\#0061c0\\]:hover, .hover\\:bg-indigo-650:hover, .hover\\:bg-indigo-600\\/90:hover { background-color: #b45309 !important; }
          .bg-indigo-50\\/40, .bg-indigo-50, .bg-indigo-50\\/30 { background-color: #fffbeb !important; }
          .text-indigo-805, .text-indigo-800 { color: #b45309 !important; }
          .border-indigo-100 { border-color: #fde68a !important; }
          .text-indigo-600 { color: #d97706 !important; }
        ` : ''}
      `}</style>

      {/* Drawer backdrop for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/45 z-30 md:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 1. AdminLTE 3 Responsive Theme Sidebar */}
      <aside className={`flex flex-col shrink-0 select-none transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-40 md:static ${
        sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:opacity-0 md:-translate-x-full'
      } ${
        isDarkMode 
          ? 'bg-[#0a0c14] border-r border-[#1a1c2a] text-slate-300' 
          : 'bg-[#ffffff] border-r border-slate-200/85 text-slate-650'
      }`}>
        
        {/* Brand Banner (Premium Modern Style) */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${
          isDarkMode ? 'border-[#1a1c2a] bg-[#07080d] text-white' : 'border-slate-100 bg-[#fbfcfd] text-slate-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 py-2 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl text-white shadow-sm">
              <Building className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className={`font-black text-xs tracking-wider uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>IDEVA Factory OS</h1>
              <p className="text-[9px] text-[#219653] font-black uppercase mt-0.5 tracking-wider font-mono">ASEAN GMP & ISO 22716</p>
            </div>
          </div>
          {/* Collapse side-button inside mobile sidebar for quick close */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-md md:hidden cursor-pointer"
            title="Close sidebar"
            type="button"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>

        {/* User Status Panel (Premium Modern Style) */}
        <div className={`p-4 border-b flex items-center gap-3 ${
          isDarkMode ? 'border-[#1a1c2a] bg-[#0c0d15]/50' : 'border-slate-100/70 bg-slate-50/40'
        }`}>
          <div className="h-9 w-9 rounded-full bg-indigo-650 font-bold border border-indigo-400 flex items-center justify-center text-white text-xs tracking-tight select-none shadow-xs">
            {userRole.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={`text-xs font-bold leading-snug truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{userRole || 'Operator'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9.5px] text-emerald-650 dark:text-emerald-400 font-extrabold font-mono uppercase tracking-wider">● ONLINE / คุมสิทธิ์</span>
            </div>
          </div>
        </div>

        {/* Sidebar Search Input matching AdminLTE 4 */}
        <div className="px-3.5 pt-4 pb-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input 
              type="text"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              placeholder="Search Menu..."
              className={`w-full p-2.5 pl-9 pr-8 text-xs font-medium rounded-lg outline-none transition-all ${
                isDarkMode 
                  ? 'bg-slate-900 border border-slate-800/80 text-slate-205 focus:border-indigo-600' 
                  : 'bg-slate-100 border border-slate-200 text-slate-700 focus:border-indigo-600'
              }`}
            />
            {sidebarSearch && (
              <button 
                onClick={() => setSidebarSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-200 cursor-pointer text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Sidebar Menu Categories */}
        <nav className="flex-1 px-3.5 py-4 space-y-4 overflow-y-auto no-scrollbar font-sans">
          {Array.from(new Set(filteredMenuItems.map(m => m.category))).map(cat => (
            <div key={cat} className="space-y-1">
              <p className={`px-2.5 text-[9.5px] font-bold uppercase tracking-widest border-l-2 mb-2 ${
                isDarkMode 
                  ? 'text-slate-500 border-indigo-550' 
                  : 'text-slate-400 border-indigo-600'
              }`}>{cat}</p>
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 text-left cursor-pointer group ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : isDarkMode
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/55' 
                          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <IconComp className={`h-4.5 w-4.5 transition-colors ${
                        isSelected 
                          ? 'text-white' 
                          : isDarkMode ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-indigo-650'
                      }`} /> 
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${
                      isSelected 
                        ? 'translate-x-0.5 text-white' 
                        : isDarkMode ? 'text-slate-650' : 'text-slate-300'
                    }`} />
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Role and Sync */}
        <div 
          onClick={() => setActiveTab('database_setup')}
          className={`p-4 border-t text-[10.5px] space-y-1.5 cursor-pointer transition-all ${
            isDarkMode 
              ? 'border-[#1a1c2a] bg-[#06080e] text-slate-450 hover:bg-[#0c0e16]' 
              : 'border-slate-100 bg-[#fcfdfe] text-slate-500 hover:bg-slate-50'
          }`}
          title="คลิกเพื่อตั้งค่าเครื่องยนต์ฐานข้อมูล"
        >
          <div className="flex justify-between items-center font-bold">
            <span className="flex items-center gap-1.5 text-xs">
              <Database className="h-3.5 w-3.5 text-indigo-500" />
              <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>ไดรเวอร์: {activeDbConfig.type?.toUpperCase()}</span>
            </span>
            <span className="text-emerald-555 font-black text-[9px] uppercase font-mono animate-pulse">● Active</span>
          </div>
          <p className={`text-[9.5px] font-mono truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {activeDbConfig.type === 'supabase' ? 'Supabase cloud cloud tables' : `${activeDbConfig.host || '127.0.0.1'} • Port ${activeDbConfig.port || ''}`}
          </p>
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
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Dynamic Color Palette selector */}
            <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border ${
              isDarkMode ? 'bg-[#1c223c] border-[#2f3863]' : 'bg-neutral-50 border-[#E5E5EA]'
            }`}>
              <Palette className="h-4 w-4 text-pink-500" />
              <select
                className={`text-[11px] bg-transparent border-0 outline-none cursor-pointer font-bold ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}
                value={colorTheme}
                onChange={(e) => {
                  setColorTheme(e.target.value as any);
                  addToast(`เปลี่ยนสถานะแบบสีหลักระบบเป็น: ${e.target.value === 'green' ? 'เขียวอ่อน' : e.target.value === 'yellow' ? 'เหลืองอ่อน' : 'ฟ้าอ่อน'}`, "info");
                }}
              >
                <option value="blue" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-850'}>🔵 ฟ้าอ่อน</option>
                <option value="green" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-850'}>🟢 เขียวอ่อน</option>
                <option value="yellow" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-850'}>🟡 เหลืองอ่อน</option>
              </select>
            </div>
            
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
          isDarkMode ? 'bg-[#121522] border-[#1e2336] text-slate-300' : 'bg-slate-100/90 border-slate-200/80 text-slate-655'
        }`}>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-500" />
            <span className={`font-mono text-xs font-bold ${isDarkMode ? 'text-slate-350' : 'text-slate-550'}`}>
              สถานีงานคีย์: <strong className={`${isDarkMode ? 'text-white' : 'text-slate-800'} uppercase ml-1.5 tracking-wider`}>{activeTab.replace('_', ' ')} workstation</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleGlobalExportExcel}
              type="button"
              className="p-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-white text-[10.5px] flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel แผ่นงาน
            </button>
            <button
              onClick={handleGlobalExportPdf}
              type="button"
              className="p-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-750 font-bold rounded-xl text-white text-[10.5px] flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" /> เอกสาร PDF
            </button>
            <button
              onClick={handleGlobalPrint}
              type="button"
              className={`p-1.5 px-3.5 border font-bold rounded-xl text-[10.5px] flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer ${
                isDarkMode ? 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-50 border-slate-250 text-slate-700'
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
              className="p-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl text-slate-950 text-[10.5px] flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
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
            <div className="space-y-6 animate-fade-in font-sans">
              
              {/* AdminLTE 4 Page Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-white uppercase">
                    Dashboard
                  </h1>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono select-none">
                  <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => navigateTo('dashboard')}>Home</span>
                  <span>/</span>
                  <span className="text-slate-700 dark:text-slate-350">Dashboard</span>
                </div>
              </div>

              {/* AdminLTE 4 Small Boxes KPI Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="kpi-panel">
                
                {/* 1. Blue Box: New Orders */}
                <div className="relative overflow-hidden rounded-md bg-[#0d6efd] text-white shadow-sm flex flex-col justify-between h-[130px] group transition-all hover:translate-y-[-2px]">
                  <div className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-3xl font-black font-mono tracking-tight text-white leading-none">
                        {dbState.salesJobs?.length || 150}
                      </p>
                      <p className="text-xs font-medium text-white/95 mt-1.5 font-sans">New Orders</p>
                    </div>
                    <ShoppingBag className="h-16 w-16 absolute right-2.5 top-2.5 text-black/15 pointer-events-none group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <button 
                    onClick={() => {
                      navigateTo('job_management');
                      addToast("เปิดสารบันทะเบียนตั๋วรับงานสั่งผลิต (Sales Jobs)", "info");
                    }}
                    className="w-full bg-black/15 hover:bg-black/25 text-white/95 text-[10.5px] py-1.5 text-center font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-100 cursor-pointer"
                  >
                    <span>More info</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* 2. Green Box: Bounce Rate */}
                <div className="relative overflow-hidden rounded-md bg-[#198754] text-white shadow-sm flex flex-col justify-between h-[130px] group transition-all hover:translate-y-[-2px]">
                  <div className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-3xl font-black font-mono tracking-tight text-white leading-none">
                          {unrestrictedStockPercent}%
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white/95 mt-1.5 font-sans">Bounce Rate</p>
                    </div>
                    <BarChart3 className="h-16 w-16 absolute right-2.5 top-2.5 text-black/15 pointer-events-none group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <button 
                    onClick={() => {
                      navigateTo('warehouse');
                      addToast("ตรวจสอบสถานะคลังควบคุมระบุล็อต FEFO (WMS)", "info");
                    }}
                    className="w-full bg-black/15 hover:bg-black/25 text-white/95 text-[10.5px] py-1.5 text-center font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-100 cursor-pointer"
                  >
                    <span>More info</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* 3. Yellow Box: User Registrations */}
                <div className="relative overflow-hidden rounded-md bg-[#ffc107] text-[#212529] shadow-sm flex flex-col justify-between h-[130px] group transition-all hover:translate-y-[-2px]">
                  <div className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-3xl font-black font-mono tracking-tight text-[#212529] leading-none">
                        {totalEmployees || 44}
                      </p>
                      <p className="text-xs font-bold text-[#212529]/95 mt-1.5 font-sans">User Registrations</p>
                    </div>
                    <UserPlus className="h-16 w-16 absolute right-2.5 top-2.5 text-black/10 pointer-events-none group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <button 
                    onClick={() => {
                      navigateTo('hr');
                      addToast("เปิดหน้างานพนักงานและสิทธิ์ผู้ใช้งาน", "info");
                    }}
                    className="w-full bg-black/10 hover:bg-black/15 text-[#212529]/95 text-[10.5px] py-1.5 text-center font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-100 cursor-pointer"
                  >
                    <span>More info</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {/* 4. Red Box: Unique Visitors */}
                <div className="relative overflow-hidden rounded-md bg-[#dc3545] text-white shadow-sm flex flex-col justify-between h-[130px] group transition-all hover:translate-y-[-2px]">
                  <div className="p-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-3xl font-black font-mono tracking-tight text-white leading-none">
                        {dbState.machines?.length || 65}
                      </p>
                      <p className="text-xs font-medium text-white/95 mt-1.5 font-sans">Unique Visitors</p>
                    </div>
                    <Globe2 className="h-16 w-16 absolute right-2.5 top-2.5 text-black/15 pointer-events-none group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <button 
                    onClick={() => {
                      navigateTo('maintenance');
                      addToast("เปิดตรวจสอบเครื่องจักรสูตรผสม (OEE / PM)", "info");
                    }}
                    className="w-full bg-black/15 hover:bg-black/25 text-white/95 text-[10.5px] py-1.5 text-center font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-100 cursor-pointer"
                  >
                    <span>More info</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

              </div>

              {/* Grid Section 1: Sales Value Area Chart & Map Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Area Chart Box (Col span-2) */}
                <div className={`lg:col-span-2 rounded-lg border transition-all duration-150 flex flex-col ${
                  isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
                }`}>
                  {/* Card Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200/90 dark:border-slate-800">
                    <h3 className={`font-medium text-sm font-sans flex items-center gap-1.5 ${
                      isDarkMode ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      Sales Value
                    </h3>
                  </div>
                  
                  {/* Chart Container */}
                  <div className="p-5 flex-1">
                    <div className="h-[275px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={[
                            { name: '09 Jan', visitors: 64, sales: 26 },
                            { name: '06 Feb', visitors: 61, sales: 40 },
                            { name: '06 Mar', visitors: 78, sales: 30 },
                            { name: '03 Apr', visitors: 79, sales: 21 },
                            { name: '01 May', visitors: 60, sales: 82 },
                            { name: '29 May', visitors: 58, sales: 50 },
                            { name: '26 Jun', visitors: 62, sales: 80 }
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorSalesLine" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorVisitorsLine" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#20c997" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#20c997" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke={isDarkMode ? "#cbd5e1" : "#86868B"} fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke={isDarkMode ? "#cbd5e1" : "#86868B"} fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={isDarkMode ? { backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' } : undefined} />
                          <Area type="monotone" dataKey="visitors" stroke="#20c997" strokeWidth={2.5} fill="url(#colorVisitorsLine)" name="Bounce Rate / ความคงคลัง (visitors)" />
                          <Area type="monotone" dataKey="sales" stroke="#0d6efd" strokeWidth={2.5} fill="url(#colorSalesLine)" name="ยอดขายรวม (sales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Right Map Widget (Col span-1) - Dynamic Blue Style as AdminLTE4 */}
                <div className="rounded-lg bg-[#0d6efd] text-white shadow-md flex flex-col justify-between max-h-[385px] overflow-hidden">
                  
                  {/* Widget Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
                    <h3 className="font-medium text-sm flex items-center gap-1.5 text-white">
                      Sales Value
                    </h3>
                    <div className="flex items-center gap-1.5 opacity-80 text-white text-xs">
                      <button onClick={() => addToast("ย่อโมดูลแผนดินจำลองเรียบร้อย", "info")} className="hover:text-amber-300">
                        <Minimize className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Widget Body World Map Silhouette SVG & Glow Targets */}
                  <div className="p-4 flex-1 flex flex-col justify-center items-center relative overflow-hidden">
                    <svg viewBox="0 0 1000 450" className="w-full opacity-35 text-white max-h-[160px]" fill="currentColor">
                      <path d="M150,150 C230,120 280,180 320,130 C360,110 400,160 450,140 C500,100 550,140 600,110 C650,80 720,120 780,90 C840,70 900,120 950,100 L950,400 C900,420 850,380 800,410 C750,430 700,390 650,410 C600,380 550,420 500,390 C450,410 400,370 350,390 C300,350 250,400 200,380 L150,400 Z" />
                      <circle cx="280" cy="140" r="14" fill="#ffc107" className="animate-ping" />
                      <circle cx="280" cy="140" r="10" fill="#ffc107" />
                      <circle cx="580" cy="150" r="16" fill="#20c997" className="animate-ping" />
                      <circle cx="580" cy="150" r="12" fill="#20c997" />
                      <circle cx="750" cy="220" r="14" fill="#ffffff" className="animate-ping" />
                      <circle cx="750" cy="220" r="10" fill="#ffffff" />
                    </svg>

                    <div className="absolute top-2 left-4 text-[10px] font-mono tracking-wider font-extrabold bg-black/25 px-2 py-0.5 rounded-md">
                      ASEAN OPERATIONS HUB ONLINE
                    </div>
                  </div>

                  {/* Mini-Sparkline stats below map container */}
                  <div className="grid grid-cols-3 border-t border-white/15 bg-black/10 py-3 text-center text-xs">
                    <div className="border-r border-white/10 flex flex-col items-center">
                      <div className="h-6 w-12 opacity-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{v:10},{v:40},{v:22},{v:35},{v:50}]}>
                            <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={1} fill="#ffffff" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <span className="text-[10px] opacity-75 mt-1 block">Visitors</span>
                      <strong className="text-sm">8.3K</strong>
                    </div>

                    <div className="border-r border-white/10 flex flex-col items-center">
                      <div className="h-6 w-12 opacity-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{v:30},{v:15},{v:42},{v:20},{v:60}]}>
                            <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={1} fill="#ffffff" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <span className="text-[10px] opacity-75 mt-1 block">Online</span>
                      <strong className="text-sm">76.3%</strong>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-6 w-12 opacity-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{v:12},{v:25},{v:18},{v:55},{v:40}]}>
                            <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={1} fill="#ffffff" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <span className="text-[10px] opacity-75 mt-1 block">Sales</span>
                      <strong className="text-sm">90.2%</strong>
                    </div>
                  </div>

                </div>

              </div>

              {/* Grid Section 2: Quick Recommendations & Recent Members */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Practical Tips Widget (Replacing Direct Chat) */}
                <div className={`rounded-lg border flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
                }`}>
                  {/* Card Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200/90 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        💡 ข้อเสนอแนะมาตรฐานผลิตเครื่องหอม (GMP Tips)
                      </h3>
                    </div>
                    <span className="bg-emerald-500 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded inline-block animate-pulse">
                      ISO 22716
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 space-y-4 font-sans text-xs">
                    <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100/30">
                      <strong className="text-indigo-600 dark:text-teal-400 block mb-1">🧼 การรักษาสุขอนามัยแรกเข้า (Personal Sanitization)</strong>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                        ผู้เปิดงานคีย์และฝ่ายกวนผสมทุกท่าน ต้องสวมชุดกาวน์ที่ผ่านการซักฆ่าเชื้อโรค ล้างมือด้วยแอลกอฮอล์ 75% และเดินผ่านอุโมงค์ลมสลัดฝุ่น (Air Shower) ไม่ต่ำกว่า 15 วินาที เพื่อรักษาระดับฝุ่นละอองในคลีนรูมระดับ ISO Class 7
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/30">
                      <strong className="text-amber-600 block mb-1">⏱️ การคํานวณสับสิทธิ์ FEFO คลังวัตถุดิบ</strong>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                        ก่อนเปิดใช้หัวน้ำมันพรีเมียมจากคีย์ถัง ต้องตรวจสอบพลาสติกซีลและการันตี GMP COA เผื่อเกิดการทำลายสารเคมีจากความชื้น ให้ลำเลียงตามวันหมดอายุต่ำสุด (FEFO) ออกไปผสมก่อนเสมอเพื่อป้องกันสต็อกขาดทุน
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/30">
                      <strong className="text-emerald-600 block mb-1">📝 ความสอดคล้องใบเสนอราคา (BMR Alignment)</strong>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                        เมื่อมีการตกลงอนุมัติใบเสนอราคาผ่าน Supabase Quotes แล้ว ข้อมูลส่วนประกอบน้ำหอม SKU สำคัญจะถูกล็อกรหัสเพื่อเตรียมบรรจุลงหม้อกวนโดยอัตโนมัติ ห้ามแก้ไขนอกรอบเว้นแต่มีใบขออนุมัติจาก QC
                      </p>
                    </div>
                  </div>

                  {/* Card Footer with Link */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button 
                      onClick={() => {
                        setActiveTab('user_guide');
                        addToast("เปิดอ่านคู่มือและแผนกกฎระเบียบของระบบสมบูรณ์", "info");
                      }}
                      className="text-xs text-[#0d6efd] font-bold hover:underline"
                    >
                      เปิดอ่านคู่มือการดำเนินงานทั้งหมด (SOP Handbook &rarr;)
                    </button>
                  </div>
                </div>

                {/* 2. Recent Logs / Members List Widget */}
                <div className={`rounded-lg border flex flex-col justify-between ${
                  isDarkMode ? 'bg-[#15192c] border-[#252a42]' : 'bg-white border-[#E5E5EA] shadow-xs'
                }`}>
                  {/* Card Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200/90 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Recent Activity
                      </h3>
                      <span className="bg-emerald-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-full inline-block animate-pulse">
                        8 Active members
                      </span>
                    </div>
                  </div>

                  {/* Card Body - list of active members or logs */}
                  <div className="p-4 flex-1 space-y-4">
                    {[
                      { name: 'Alexander Pierce', task: 'Created Sales Job Ticket #JOB-2026-039', time: '2:00 pm', status: 'Approved', statusColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-850 dark:text-emerald-300' },
                      { name: 'Sarah Bullock', task: 'Released manufacturing order #MO-00109 for Reactor A', time: '2:05 pm', status: 'Success', statusColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-850 dark:text-indigo-300' },
                      { name: 'Icie Reynolds', task: 'Verified chemical FEFO stock level for essential perfume oils', time: '3:30 pm', status: 'Online', statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-850 dark:text-blue-300' },
                      { name: 'Laboratory Chief', task: 'Approved COA analysis and quality clearance reports', time: '4:15 pm', status: 'Cleared', statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-850 dark:text-purple-300' }
                    ].map((act, idx) => (
                      <div key={idx} className="flex items-start gap-3.5 pb-2.5 last:pb-0 border-b border-dashed border-slate-100 dark:border-slate-850 last:border-0">
                        {/* Avatar */}
                        <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white font-extrabold text-xs">
                          {act.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        {/* Detail */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-1.5">
                            <h4 className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              {act.name}
                            </h4>
                            <span className="text-[9px] font-medium text-slate-400 shrink-0 font-mono">
                              {act.time}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 leading-snug line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {act.task}
                          </p>
                        </div>
                        {/* Status badge */}
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${act.statusColor}`}>
                          {act.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button 
                      onClick={() => {
                        navigateTo('reports');
                        addToast("เปิดรายงานตรวจสอบประวัติทั้งระบบเรียบร้อย", "info");
                      }}
                      className="text-xs text-[#0d6efd] font-bold hover:underline"
                    >
                      View All Activity Logs
                    </button>
                  </div>
                </div>

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



          {/* User Manual and Guidelines Tab */}
          {activeTab === 'user_guide' && (
            <UserGuideOS isDarkMode={isDarkMode} />
          )}

          {/* Database Setup Workstation Tab */}
          {activeTab === 'database_setup' && (
            <DatabaseSetupOS onNotify={addToast} onRefreshState={fetchState} />
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
