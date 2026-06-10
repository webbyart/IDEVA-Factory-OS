import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Folder, FolderOpen, Plus, Search, Printer, ArrowRight, Check, CheckCircle2, 
  AlertCircle, TrendingUp, Beaker, Layers, Package, Upload, ClipboardCheck, 
  RefreshCw, FileText, ExternalLink, Database, Cpu, HelpCircle, FileCheck2, Trash2
} from 'lucide-react';

interface SalesProdWorkflowProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function SalesProdWorkflowOS({ dbState, onRefresh, onNotify, userRole }: SalesProdWorkflowProps) {
  // Navigation
  const [activeSegment, setActiveSegment] = useState<'sales' | 'production' | 'packaging' | 'gmp-coa' | 'appsheet-sync'>('sales');

  // Customer Management states
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Active Job states
  const [jobSearch, setJobSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('job-05002');
  const [newJob, setNewJob] = useState({
    customerId: '',
    productId: '',
    quantityRequested: 1000,
    jobCode: ''
  });
  const [showAddJob, setShowAddJob] = useState(false);

  // Virtual folder explorer states
  const [folderFiles, setFolderFiles] = useState<{[key: string]: string[]}>({
    'job-05002': [
      'สัญญา/สัญญาจ้างผลิต_#05002.pdf',
      'สัญญา/ข้อตกลงเกี่ยวกับความลับ_NDA.pdf',
      'COA/ใบตรวจวิเคราะห์วัตถุดิบ_COA_Lot202605.pdf',
      'BPR/ใบกำหนดการชั่งผลิต_BPR_Master_#05002.pdf'
    ]
  });
  const [targetFolder, setTargetFolder] = useState<'สัญญา' | 'COA' | 'BPR'>('สัญญา');
  const [newFileName, setNewFileName] = useState('');
  const [overrideQty, setOverrideQty] = useState<number | ''>('');

  // Print Mode State (to preview gorgeous documents in highly polished printed layouts)
  const [printDocType, setPrintDocType] = useState<'BMR' | 'BPR' | 'STOCK_CHECK' | 'WEIGH_SHEET' | 'LABELS' | 'PACKAGING_FOUR_PAGES' | 'STOCK_COUNT_SLIP' | null>(null);

  // New States for materials datagrid, listing, pagination, and sorting (GridPHP Style)
  const [viewingPdfCoa, setViewingPdfCoa] = useState<any | null>(null);
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState<'All' | 'Raw Material' | 'Packaging'>('All');
  const [materialPage, setMaterialPage] = useState(1);
  const [materialSortField, setMaterialSortField] = useState<'code' | 'name' | 'stockLevel'>('code');
  const [materialSortOrder, setMaterialSortOrder] = useState<'asc' | 'desc'>('asc');

  // GMP Lot Generator States
  const [lotGenType, setLotGenType] = useState<'Raw Material' | 'Finished Goods'>('Raw Material');
  const [lotGenSelectedId, setLotGenSelectedId] = useState('');
  const [lotGenDate, setLotGenDate] = useState('2026-06-10');
  const [lotGenSequence, setLotGenSequence] = useState(1);
  const [generatedLotResult, setGeneratedLotResult] = useState('');

  // States for Quick Adding and Editing Materials
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMatCode, setNewMatCode] = useState('');
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState<'Raw Material' | 'Packaging'>('Raw Material');
  const [newMatStock, setNewMatStock] = useState(100);
  const [newMatMinStock, setNewMatMinStock] = useState(50);
  const [newMatUnit, setNewMatUnit] = useState('ลิตร');
  const [newMatCost, setNewMatCost] = useState(250);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editingMaterialStock, setEditingMaterialStock] = useState<number>(0);

  // COA & GMP states
  const [coaSearch, setCoaSearch] = useState('');
  const [newCoa, setNewCoa] = useState({
    lotNumber: '',
    materialId: '',
    supplierId: '',
    purity: '99.5%',
    appearance: 'Conforms to Specs',
    odor: 'Sweet Amber Conformance',
    fileName: ''
  });
  const [gmpTab, setGmpTab] = useState<'inventory' | 'coa_search' | 'lot_generator' | 'gmp_receiving'>('inventory');
  const [newReceiptGmp, setNewReceiptGmp] = useState({
    materialId: '',
    supplierId: '',
    quantityReceived: 500,
    lotNumber: '',
    coaLotNumber: '',
    gmpCheckWeight: true,
    gmpCheckPack: true,
    gmpCheckTemp: true,
    gmpCheckClean: true,
    expiryDate: '2027-12-31'
  });

  // Packaging Lot record pages state
  const [activePackPage, setActivePackPage] = useState<1 | 2 | 3 | 4>(1);
  const [packagingLogs, setPackagingLogs] = useState<{
    orderDate: string;
    qtyTarget: number;
    inspector: string;
    startTime: string;
    endTime: string;
    actualPacked: number;
    defectQty: number;
    sealPassed: boolean;
    volumePassed: boolean;
    labelPassed: boolean;
    qcInspector: string;
    cartonReturned: number;
    nozzlesReturned: number;
    scrapsScrap: number;
    stockCountSlipNo: string;
    countInspector: string;
  }>({
    orderDate: '2026-06-10',
    qtyTarget: 1000,
    inspector: 'อนงค์นาฏ ทรัพย์มงคล',
    startTime: '08:30',
    endTime: '17:00',
    actualPacked: 995,
    defectQty: 5,
    sealPassed: true,
    volumePassed: true,
    labelPassed: true,
    qcInspector: 'ดร. ลลิตา วรโชติสกุล',
    cartonReturned: 12,
    nozzlesReturned: 8,
    scrapsScrap: 3,
    stockCountSlipNo: 'CNT-05002-PACK-01',
    countInspector: 'สมพร คลังสินค้า'
  });

  // AppSheet Live Sync simulation states
  const [syncStatus, setSyncStatus] = useState<'Idle' | 'Syncing' | 'Success'>('Idle');
  const [syncLogs, setSyncLogs] = useState<string[]>([
    '[01:10:45] AppSheet Integration initialized with webhook endpoint security.',
    '[01:12:02] Connected to master spreadsheet "IDEVA Factory Operations".',
    '[01:15:30] Webhook successfully verified standard COA storage format matching AppSheet structures.'
  ]);

  // FIFO Calculation helper for selected Job
  const currentJob = dbState.salesJobs?.find((j: any) => j.id === selectedJobId) || dbState.salesJobs?.[0];
  const currentProduct = dbState.products?.find((p: any) => p.id === currentJob?.productId);
  const currentFormula = dbState.formulas?.find((f: any) => f.productId === currentJob?.productId);

  // Generate Auto Job Code on render or customer change
  useEffect(() => {
    if (newJob.customerId && !newJob.jobCode) {
      const existingJobsCount = dbState.salesJobs?.length || 0;
      const roundedCount = String(5000 + existingJobsCount + 1).padStart(5, '0');
      setNewJob(prev => ({ ...prev, jobCode: `#${roundedCount.slice(-5)}` }));
    }
  }, [newJob.customerId, dbState.salesJobs]);

  // Sync quantity requested override state with current selected job
  useEffect(() => {
    if (currentJob) {
      setOverrideQty(currentJob.quantityRequested);
    }
  }, [selectedJobId, dbState.salesJobs]);

  // Handle New Customer Addition
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) {
      onNotify('กรุณากรอกชื่อลูกค้าใหม่', 'warning');
      return;
    }

    const nextIdVal = (dbState.customers?.length || 0) + 1;
    const newCode = `CUS-2026-${String(nextIdVal).padStart(3, '0')}`;
    const generatedId = `cust-${nextIdVal}`;

    const payload = {
      id: generatedId,
      name: newCustomer.name,
      code: newCode,
      phone: newCustomer.phone || '-',
      email: newCustomer.email || '-',
      address: newCustomer.address || '-'
    };

    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'customers', item: payload })
      });
      const data = await response.json();
      if (data.success) {
        onNotify(`ลงทะเบียนลูกค้าใหม่รหัส ${newCode} สำเร็จ!`, 'info');
        setNewCustomer({ name: '', phone: '', email: '', address: '' });
        setShowAddCustomer(false);
        setSelectedCustomerId(generatedId);
        onRefresh();
      } else {
        onNotify(data.error, 'error');
      }
    } catch {
      onNotify('การสื่อสารล้มเหลว', 'error');
    }
  };

  // Handle New Production Job Addition (From Sales)
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.customerId || !newJob.productId || !newJob.quantityRequested) {
      onNotify('กรุณากรอกข้อมูลเพื่อเปิดใบสั่งผลิตให้ครบถ้วน', 'warning');
      return;
    }

    const selectedCust = dbState.customers?.find((c: any) => c.id === newJob.customerId);
    const selectedProd = dbState.products?.find((p: any) => p.id === newJob.productId);
    const relatedFormula = dbState.formulas?.find((f: any) => f.productId === newJob.productId);

    if (!relatedFormula) {
      onNotify('สินค้าที่เลือกยังไม่มีสูตรผลิต (BOM) ในระบบ', 'error');
      return;
    }

    const newJobId = `job-${Date.now().toString().slice(-4)}`;
    const calculatedJobCode = newJob.jobCode || `#${String(5000 + (dbState.salesJobs?.length || 0) + 1).slice(-5)}`;
    const jobPayload = {
      id: newJobId,
      jobCode: calculatedJobCode,
      customerId: newJob.customerId,
      customerCode: selectedCust?.code || 'CUS-2026-NEW',
      productId: newJob.productId,
      formulaId: relatedFormula.id,
      quantityRequested: Number(newJob.quantityRequested),
      driveLink: `https://drive.google.com/drive/folders/1oSSFJqg2HT9o_yOH-iePcbpnsNzqFdaA?usp=sharing&customer=${selectedCust?.code || 'CUS'}&job=${calculatedJobCode}`,
      status: 'Pending Planning',
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'salesJobs', item: jobPayload })
      });
      const data = await response.json();
      if (data.success) {
        onNotify(`เปิดใบรับงานผลิตรหัส ${jobPayload.jobCode} ให้ผู้ผลิตและจัดซื้อทำงานต่อแล้ว!`, 'info');
        
        // Ensure folder directory is initialized under clean GMP category folders
        setFolderFiles(prev => ({
          ...prev,
          [newJobId]: [
            `สัญญา/สัญญาจ้างผลิต_${jobPayload.jobCode}.pdf`,
            `สัญญา/ใบความเห็นอนุมัติ_${jobPayload.jobCode}.pdf`,
            `COA/ใบรับรองคุณภาพ_COA_${jobPayload.jobCode}.pdf`,
            `BPR/ใบกำหนดรหัสพัสดุและผสม_BPR_Master_${jobPayload.jobCode}.pdf`
          ]
        }));

        setSelectedJobId(newJobId);
        setNewJob({ customerId: '', productId: '', quantityRequested: 1000, jobCode: '' });
        setShowAddJob(false);
        onRefresh();
      } else {
        onNotify(data.error, 'error');
      }
    } catch {
      onNotify('เซิร์ฟเวอร์ขัดข้อง ไม่สามารถสร้างใบรับงานได้', 'error');
    }
  };

  // Add virtual file to customer/job drive folder under selected subcategory
  const handleAddFileToFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const currentFiles = folderFiles[selectedJobId] || [];
    const formattedFile = `${targetFolder}/${newFileName.trim()}`;
    
    setFolderFiles(prev => ({
      ...prev,
      [selectedJobId]: [...(prev[selectedJobId] || []), formattedFile]
    }));
    setNewFileName('');
    onNotify(`เก็บเอกสารไปยังโฟลเดอร์ "${targetFolder}" เรียบร้อย`, 'info');
  };

  // Trigger Purchase Request immediately for missing items
  const handleTriggerPRForMissing = async (materialId: string, shortageQty: number) => {
    const targetMat = dbState.materials?.find((m: any) => m.id === materialId);
    if (!targetMat) return;

    // Build the payload
    const prPayload = {
      materialId: materialId,
      quantity: Math.ceil(shortageQty * 1.5), // Buy 1.5x of the shortage for safety margin
      urgency: 'High',
      status: 'Draft',
      requestedBy: `จัดซื้อเร่งด่วนสำหรับ Job ${currentJob?.jobCode || '#TEMP'}`,
      createdAt: new Date().toISOString().split('T')[0],
      isLinkedToJob: true,
      linkedJobCode: currentJob?.jobCode,
      linkedDriveFolder: currentJob?.driveLink
    };

    try {
      const res = await fetch('/api/procurement/pr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prPayload)
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`ส่งคำขอซื้อวัสดุด่วน (PR) รหัส ${data.pr.id} สำเร็จ! เชื่อมโยงจ๊อบ ${currentJob?.jobCode}`, 'info');
        onRefresh();
      } else {
        onNotify(data.error, 'error');
      }
    } catch {
      onNotify('บันทึกขอซื้อไม่สำเร็จ', 'error');
    }
  };

  // Save/Upload COA under GMP Standards
  const handleSaveCOA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoa.lotNumber || !newCoa.materialId || !newCoa.supplierId) {
      onNotify('กรุณาระบุล็อตวัตถุดิบ สารเคมี และซัพพลายเออร์ที่สอดคล้อง', 'warning');
      return;
    }

    const targetMat = dbState.materials?.find((m: any) => m.id === newCoa.materialId);

    const coaPayload = {
      lotNumber: newCoa.lotNumber,
      materialId: newCoa.materialId,
      materialName: targetMat?.name || 'Raw Material',
      supplierId: newCoa.supplierId,
      fileName: newCoa.fileName || `COA_Lot_${newCoa.lotNumber}.pdf`,
      verifiedDate: new Date().toISOString().split('T')[0],
      status: 'Approved',
      purity: newCoa.purity,
      appearance: newCoa.appearance,
      odor: newCoa.odor
    };

    try {
      const response = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'coaRecords', item: coaPayload })
      });
      const data = await response.json();
      if (data.success) {
        onNotify(`จัดเก็บเอกสาร COA ของล็อตวัตถุดิบ ${newCoa.lotNumber} สำเร็จ พร้อมสำหรับการสืบค้น!`, 'info');
        setNewCoa({ lotNumber: '', materialId: '', supplierId: '', purity: '99.5%', appearance: 'Conforms to Specs', odor: 'Sweet Amber Conformance', fileName: '' });
        onRefresh();
      }
    } catch {
      onNotify('การจัดเก็บ COA ล้มเหลว', 'error');
    }
  };

  // Receive material with GMP and auto-inspect
  const handleReceiveGoodsGmp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReceiptGmp.materialId || !newReceiptGmp.lotNumber || !newReceiptGmp.expiryDate) {
      onNotify('กรุณาระบุข้อมูลจำเป็นสำหรับการตรวจรับ GMP', 'warning');
      return;
    }

    // Determine QC parameters check
    const isCleanAndChecked = newReceiptGmp.gmpCheckWeight && 
                              newReceiptGmp.gmpCheckPack && 
                              newReceiptGmp.gmpCheckClean && 
                              newReceiptGmp.gmpCheckTemp;

    const grnPayload = {
      materialId: newReceiptGmp.materialId,
      supplierId: newReceiptGmp.supplierId,
      quantityReceived: Number(newReceiptGmp.quantityReceived),
      lotNumber: newReceiptGmp.lotNumber,
      expiryDate: newReceiptGmp.expiryDate,
      coaLotNumber: newReceiptGmp.coaLotNumber || newReceiptGmp.lotNumber,
      status: isCleanAndChecked ? 'QC Approved' : 'Pending QC',
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      // 1. Create Goods Receipt
      const grResponse = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'goodsReceipts', item: grnPayload })
      });
      const grData = await grResponse.json();

      if (grData.success) {
        // Increment material stocklevel since it's approved and received under GMP
        const targetMat = dbState.materials?.find((m: any) => m.id === newReceiptGmp.materialId);
        if (targetMat) {
          const updatedStock = targetMat.stockLevel + Number(newReceiptGmp.quantityReceived);
          await fetch('/api/generic/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'materials', item: { id: targetMat.id, stockLevel: updatedStock } })
          });
        }

        // Also add auto COA log if user filled coa lot and file
        const coaPayload = {
          lotNumber: newReceiptGmp.coaLotNumber || newReceiptGmp.lotNumber,
          materialId: newReceiptGmp.materialId,
          materialName: targetMat?.name || 'Raw Material',
          supplierId: newReceiptGmp.supplierId,
          fileName: `COA_AutoGMP_${newReceiptGmp.lotNumber}.pdf`,
          verifiedDate: new Date().toISOString().split('T')[0],
          status: 'Approved',
          purity: '99.8%',
          appearance: 'Conforms strictly to GMP checklist standards',
          odor: 'Standard'
        };

        await fetch('/api/generic/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'coaRecords', item: coaPayload })
        });

        onNotify(`ตรวจรับตามมาตรฐาน GMP และรับยอดเข้าคลัง ${grnPayload.quantityReceived} ลิตร/หน่วย เรียบร้อย!`, 'info');
        setNewReceiptGmp({
          materialId: '',
          supplierId: '',
          quantityReceived: 500,
          lotNumber: '',
          coaLotNumber: '',
          gmpCheckWeight: true,
          gmpCheckPack: true,
          gmpCheckTemp: true,
          gmpCheckClean: true,
          expiryDate: '2027-12-31'
        });
        onRefresh();
      }
    } catch {
      onNotify('ระบบการเชื่อมข้อมูล GMP ล้มเหลว', 'error');
    }
  };

  // Generate standard GMPcompliant Lot Number for raw materials or finished products
  const handleGenerateLot = () => {
    const formattedDate = lotGenDate.replace(/-/g, '');
    const sequenceStr = String(lotGenSequence).padStart(2, '0');
    let codeStr = '';
    
    if (lotGenType === 'Raw Material') {
      const selectedMat = dbState.materials?.find((m: any) => m.id === lotGenSelectedId);
      const prefix = selectedMat ? selectedMat.code?.split('-')?.pop() || 'MAT' : 'CHEM';
      codeStr = `LOT-RM-${prefix}-${formattedDate}-${sequenceStr}`;
    } else {
      const currentJobObj = dbState.salesJobs?.find((j: any) => j.id === selectedJobId);
      const custCode = currentJobObj?.customerCode?.replace(/-/g, '') || 'CUS';
      const jobCodeFormatted = currentJobObj?.jobCode?.replace(/#/g, '') || 'JOB';
      codeStr = `LOT-FG-${custCode}-${jobCodeFormatted}-${formattedDate}-${sequenceStr}`;
    }
    
    setGeneratedLotResult(codeStr);
    onNotify(`สร้างล็อตโค้ดและลงบันทึก GMP Traceability: ${codeStr} สำเร็จ`, 'info');
  };

  // CRUD Create Material
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatCode || !newMatName) {
      onNotify('กรุณาระบุรหัสและชื่อวัตถุดิบ', 'error');
      return;
    }
    const payload = {
      code: newMatCode.toUpperCase(),
      name: newMatName,
      category: newMatCategory,
      stockLevel: newMatStock,
      minStock: newMatMinStock,
      unit: newMatUnit,
      costPerUnit: newMatCost
    };
    try {
      const res = await fetch('/api/generic/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'materials', item: payload })
      });
      const data = await res.json();
      if (data.success) {
        onNotify(`เพิ่มพัสดุในระบบสำเร็จ! รหัส ${data.item.code}`, 'info');
        setNewMatCode('');
        setNewMatName('');
        setNewMatStock(100);
        setNewMatMinStock(50);
        setShowAddMaterial(false);
        onRefresh();
      } else {
        onNotify(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      onNotify('บันทึกผิดพลาด', 'error');
    }
  };

  // CRUD Quick Edit Stock level (Physical Adjust)
  const handleQuickUpdateStock = async (id: string, newLevel: number) => {
    try {
      const res = await fetch('/api/generic/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'materials', item: { id, stockLevel: newLevel } })
      });
      const data = await res.json();
      if (data.success) {
        onNotify('ปรับยอดคลังสินค้าสำเร็จเรียบร้อย', 'info');
        setEditingMaterialId(null);
        onRefresh();
      } else {
        onNotify(data.error || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch {
      onNotify('บันทึกปรับปรุงยอดไม่สำเร็จ', 'error');
    }
  };

  // Trigger AppSheet Live Sync simulation
  const handleTriggerAppSheetSync = () => {
    setSyncStatus('Syncing');
    setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] กำลังเตรียมชุดข้อมูล API กุญแจ JSON ด่านงานใหม่...`]);
    
    setTimeout(() => {
      setSyncLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] กำลังส่ง webhook...`,
        `[${new Date().toLocaleTimeString()}] SYNCHRONIZED: ส่งสารคดีลูกค้า ${dbState.customers?.length} ราย, ใบรับผลิตสินค้า ${dbState.salesJobs?.length} ราย, และแฟ้ม COA ${dbState.coaRecords?.length} ฉบับ สู่ AppSheet Cloud ปลายทางเรียบร้อย!`
      ]);
      setSyncStatus('Success');
      onNotify('เชื่อมโยงซิงค์ข้อมูลกับฐาน AppSheet ของบริษัทสำเร็จ!', 'info');
    }, 1500);
  };

  // Calculate inventory allocations based on FIFO and Formula items using real-time overrideQty controls
  const targetQty = overrideQty !== '' ? Number(overrideQty) : (currentJob?.quantityRequested || 1000);
  
  const formulaDetails = currentFormula?.items?.map((item: any) => {
    const matObj = dbState.materials?.find((m: any) => m.id === item.materialId);
    const amountNeeded = item.quantity * targetQty;
    const currentStock = matObj?.stockLevel || 0;
    const isSufficient = currentStock >= amountNeeded;
    const shortage = amountNeeded - currentStock;

    // Simulate standard lot splits under FIFO rule
    const fifoLots = [
      { lotNo: `LOT-${matObj?.code || 'RAW'}-01`, qty: Math.min(amountNeeded, currentStock * 0.4), expDate: '2026-11-20' },
      { lotNo: `LOT-${matObj?.code || 'RAW'}-02`, qty: Math.max(0, Math.min(amountNeeded - (currentStock * 0.4), currentStock * 0.6)), expDate: '2026-12-31' }
    ].filter(l => l.qty > 0);

    return {
      materialId: item.materialId,
      name: matObj?.name || 'Raw Material',
      code: matObj?.code || 'RAW',
      unit: matObj?.unit || 'ลิตร',
      stock: currentStock,
      category: matObj?.category || 'Raw Material',
      amountNeeded,
      isSufficient,
      shortage: shortage > 0 ? shortage : 0,
      lots: fifoLots
    };
  }) || [];

  return (
    <div className="space-y-6" id="sales-prod-workflow-dashboard">
      
      {/* Visual Subheader Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-[#0071E3] to-[#34C759] rounded-xl text-white shadow-sm">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight">ระบบรับงานฝ่ายขาย - แอร์พอร์ตผลิต &amp; จัดซื้อส่วนต่อเนื่อง</h2>
              <p className="text-xs text-[#86868B] mt-0.5">
                ศูนย์รับใบงานแบบรวมศูนย์ จัดรหัสลูกค้าใหม่ ตรวจสอบเคมีภัณฑ์/บรรจุภัณฑ์ FIFO ออกฉลากใบชั่ง-ใบบรรจุ 4 หน้า และซิงค์เชื่อมต่อ AppSheet ไดร์ฟจัดตั้ง
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-2 border border-[#E5E5EA] bg-neutral-50 hover:bg-neutral-100 rounded-lg text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4 text-[#86868B]" />
              รีเฟรชข้อมูลคลัง
            </button>
          </div>
        </div>
      </div>

      {/* Segment Navigation */}
      <div className="flex bg-[#E8E8ED] p-1 rounded-xl border border-[#D1D1D6] overflow-x-auto gap-0.5 select-none text-xs font-semibold">
        <button
          onClick={() => setActiveSegment('sales')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeSegment === 'sales' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          🛒 1. ฝ่ายขาย เปิดใบรับงาน &amp; รหัสลูกค้า
        </button>
        <button
          onClick={() => setActiveSegment('production')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeSegment === 'production' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          🧪 2. แผนผลิต เช็คสต็อก (FIFO) &amp; ใบชั่งผลิต
        </button>
        <button
          onClick={() => setActiveSegment('packaging')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeSegment === 'packaging' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          📦 3. ใบบรรจุ 4 หน้า &amp; ยอดคลัง
        </button>
        <button
          onClick={() => setActiveSegment('gmp-coa')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeSegment === 'gmp-coa' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          🛡️ 4. ตรวจรับระเบียบ GMP &amp; คืนประวัติ COA
        </button>
        <button
          onClick={() => setActiveSegment('appsheet-sync')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all ${activeSegment === 'appsheet-sync' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
        >
          ⚡ 5. สะพานเชื่อมระบบ AppSheet
        </button>
      </div>

      {/* View Segment Switcher */}
      <div className="min-h-[500px]">

        {/* SECTION 1: SALES & REGISTRATION */}
        {activeSegment === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Quick Actions Panel */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Customer Registrations Form */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                    <Plus className="h-4.5 w-4.5 text-[#0071E3]" /> ลงทะเบียนสมาชิกลูกค้า (รันรหัสอัตโนมัติ)
                  </h3>
                  <button 
                    onClick={() => setShowAddCustomer(!showAddCustomer)} 
                    className="text-xs text-[#0071E3] font-semibold hover:underline"
                  >
                    {showAddCustomer ? 'ย่อหน้าต่าง' : 'เปิดดูแบบตรวจสอบ'}
                  </button>
                </div>
                
                {(showAddCustomer || dbState.customers?.length === 0) && (
                  <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs text-slate-700">
                    <div>
                      <label className="block font-bold mb-1">ชื่อลูกค้าห้างร้าน / ตราสินค้าใหม่ <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                        value={newCustomer.name}
                        onChange={(e)=>setNewCustomer({...newCustomer, name: e.target.value})}
                        placeholder="มรดกสยาม บาส อิมพอร์ต หรือ OEM ห้างใหม่"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold mb-1">โทรศัพท์</label>
                        <input 
                          type="text"
                          className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                          value={newCustomer.phone}
                          onChange={(e)=>setNewCustomer({...newCustomer, phone: e.target.value})}
                          placeholder="081-XXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">อีเมลติดต่อ</label>
                        <input 
                          type="email"
                          className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                          value={newCustomer.email}
                          onChange={(e)=>setNewCustomer({...newCustomer, email: e.target.value})}
                          placeholder="client@b2bportal.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">ระบุมณฑลที่อยู่จัดตั้งบริษัท</label>
                      <textarea
                        rows={2}
                        className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                        value={newCustomer.address}
                        onChange={(e)=>setNewCustomer({...newCustomer, address: e.target.value})}
                        placeholder="กรุงเทพฯ ประเทศไทย"
                      />
                    </div>

                    <p className="text-[10px] text-[#86868B]">
                      💡 ระบบจะรวบรวมรหัส ID ลำดับล่าสุดและกำหนดรูปแบบรหัสสี่เหลี่ยมจัดตั้ง (เช่น <strong>CUS-2026-004</strong>) ให้ฝ่ายขายทันทีเพื่อนำไปเปิดแฟ้มบันทึกใน Google Drive
                    </p>

                    <button 
                      type="submit"
                      className="w-full bg-[#1D1D1F] hover:bg-neutral-800 text-white rounded-xl py-2.5 text-xs font-semibold shadow-xs"
                    >
                      รันรหัสลูกค้าใหม่เดี๋ยวนี้
                    </button>
                  </form>
                )}

                {/* Registered customer lookup log list mini block */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#86868B] block">ทะเบียนลูกค้าล่าสุด</span>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {(dbState.customers || []).map((c: any) => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex justify-between items-center ${selectedCustomerId === c.id ? 'bg-[#0071E3]/10 border-[#0071E3] text-[#0071E3]' : 'bg-[#F5F5F7] border-[#E5E5EA] hover:border-[#D1D1D6] text-slate-700'}`}
                      >
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <span className="font-mono text-[9px] bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-bold">{c.code}</span>
                        </div>
                        <Check className={`h-4 w-4 ${selectedCustomerId === c.id ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Add New Job Form for Production */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#F5F5F7] pb-2">
                  <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-[#34C759]" /> ฝ่ายขาย เปิดใบรับงาน / จ๊อบผลิตใหม่
                  </h3>
                </div>

                <form onSubmit={handleAddJob} className="space-y-3.5 text-xs text-slate-700">
                  <div>
                    <label className="block font-bold mb-1">เลือกผู้ว่าจ้างผลิตสินค้า <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                      value={newJob.customerId}
                      onChange={(e)=>setNewJob({...newJob, customerId: e.target.value})}
                      required
                    >
                      <option value="">-- กรุณาเลือกลูกค้าในระบบ --</option>
                      {(dbState.customers || []).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">สินค้าที่รับงานสร้าง (SKU/น้ำหอม) <span className="text-red-500">*</span></label>
                    <select
                      className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                      value={newJob.productId}
                      onChange={(e)=>setNewJob({...newJob, productId: e.target.value})}
                      required
                    >
                      <option value="">-- เลือก SKU น้ำหอมบ่มกลั่น --</option>
                      {(dbState.products || []).map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">จำนวนที่สั่งผลิต (ชิ้น/ขวด)</label>
                      <input 
                        type="number"
                        min="50"
                        className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                        value={newJob.quantityRequested}
                        onChange={(e)=>setNewJob({...newJob, quantityRequested: Number(e.target.value)})}
                        placeholder="1000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">รหัสจ๊อบใบกำกับ <span className="text-[#86868B]">(เช่น #05002)</span></label>
                      <input 
                        type="text"
                        className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none font-bold"
                        value={newJob.jobCode}
                        onChange={(e)=>setNewJob({...newJob, jobCode: e.target.value})}
                        disabled={!newJob.customerId}
                        placeholder="#05002"
                        required
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    ⚡ เมื่อบันทึกงานผลิต ข้อมูลจะถูกเชื่อมโยงส่งงานให้ทีมควบคุมแล็บผลิต และทีมจัดซื้อจัดเตรียมสารเคมีตามระบบ FIFO ต่อเนื่อง
                  </p>

                  <button 
                    type="submit"
                    className="w-full bg-[#0071E3] hover:bg-[#147ce5] text-white rounded-xl py-2.5 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
                  >
                    🚀 บันทึกเปิดจ๊อบผลิต &amp; ส่งต่อไปฝ่ายผลิต/จัดซื้อ
                  </button>
                </form>
              </div>

            </div>

            {/* Live Sales Jobs Track and Drive Simulation folders */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Sales Jobs Master List */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                  <Layers className="h-4.5 w-4.5 text-[#0071E3]" /> ทะเบียนตั๋วสั่งรับงานฝ่ายขาย (Sales Orders)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {(dbState.salesJobs || []).map((j: any) => {
                    const cust = dbState.customers?.find((c: any) => c.id === j.customerId);
                    const prod = dbState.products?.find((p: any) => p.id === j.productId);
                    const isSelected = selectedJobId === j.id;

                    return (
                      <div 
                        key={j.id}
                        onClick={() => setSelectedJobId(j.id)}
                        className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${isSelected ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md scale-[1.01]' : 'bg-neutral-50 border-[#E5E5EA] hover:bg-[#F2F2F7] text-slate-700'}`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-semibold">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold ${isSelected ? 'bg-[#0071E3] text-white' : 'bg-slate-200 text-slate-800'}`}>
                              JOB CODE: {j.jobCode}
                            </span>
                            <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>{j.createdAt}</span>
                          </div>

                          <h4 className="font-bold text-sm line-clamp-1">{prod?.name || 'SKU ผลน้ำหอม'}</h4>
                          <p className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            ลูกค้า: <strong>{cust?.name || 'ลูกค้าห้างทั่วไป'} ({j.customerCode})</strong>
                          </p>

                          <div className="flex justify-between items-center pt-2">
                            <span>ความจุสั่งผลิต: <strong>{j.quantityRequested?.toLocaleString()} SKU</strong></span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${j.status === 'Pending Planning' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                              {j.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Virtual Google Drive Folder Simulation */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#F5F5F7] pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                      <FolderOpen className="h-4.5 w-4.5 text-[#FF9500]" /> เอกสารสารบบลูกค้า &amp; สัญญา Drive (จำลองจัดตั้งโฟลเดอร์)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      เข้าถึงโฟลเดอร์รหัสลูกค้า / ลิงค์กับรหัสสั่งงาน <strong>{currentJob?.jobCode}</strong>
                    </p>
                  </div>
                  <a 
                    href={currentJob?.driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#F5F5F7] hover:bg-[#E8E8ED] px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#0071E3] flex items-center gap-1 border border-[#E5E5EA]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    ลิงค์ Drive จริง
                  </a>
                </div>

                <div className="bg-neutral-50 p-4 rounded-xl border border-[#E5E5EA] space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-neutral-200 border border-slate-300 text-xs font-mono font-bold rounded-lg text-slate-800">
                      /{currentJob?.customerCode || 'CUST-TEMP'}/{currentJob?.jobCode || '#05002'}/
                    </span>
                    <span className="text-[11px] text-[#34C759] font-semibold">● โฟลเดอร์สร้างพร้อมพิมพ์งาน</span>
                  </div>

                  {/* Categorized Folder Explorer tree UI mapped directly to automatically generated client keys */}
                  <div className="space-y-3.5">
                    {(['สัญญา', 'COA', 'BPR'] as const).map((folderName) => {
                      const filesInThisFolder = (folderFiles[selectedJobId] || []).filter(name => name.startsWith(`${folderName}/`) || (!name.includes('/') && folderName === 'สัญญา'));
                      return (
                        <div key={folderName} className="bg-white p-3.5 border border-[#E5E5EA] rounded-2xl shadow-xs">
                          <div className="flex items-center justify-between text-slate-800 font-bold text-xs mb-3 pb-2 border-b border-[#F5F5F7]">
                            <div className="flex items-center gap-2">
                              <Folder className="h-4.5 w-4.5 text-[#FF9500] fill-[#FF9500]/10" />
                              <span className="font-semibold text-slate-800">
                                {folderName === 'สัญญา' ? '📂 1. สัญญา และข้อตกลงพัสดุ (Contracts)' : folderName === 'COA' ? '📂 2. ทะเบียนรายงานผล COA (Certificate COA)' : '📂 3. การวางเกณฑ์คุมแบทช์ (BPR Sheets)'}
                              </span>
                            </div>
                            <span className="text-[10px] bg-[#E8E8ED] text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
                              {filesInThisFolder.length} รายการ
                            </span>
                          </div>

                          {filesInThisFolder.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic pl-6.5 py-1">ยังไม่มีเอกสารถูกเชื่อมโยงในโฟลเดอร์นี้</p>
                          ) : (
                            <div className="space-y-1.5 pl-6">
                              {filesInThisFolder.map((file, idx) => {
                                const displayName = file.includes('/') ? file.substring(file.indexOf('/') + 1) : file;
                                return (
                                  <div key={idx} className="p-2 hover:bg-neutral-50 rounded-xl flex items-center justify-between text-[11px] border border-transparent hover:border-slate-100 transition-all">
                                    <div className="flex items-center gap-2 overflow-hidden max-w-[85%]">
                                      <FileText className="h-4 w-4 text-red-500 shrink-0" />
                                      <span className="font-semibold text-slate-700 truncate">{displayName}</span>
                                    </div>
                                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-neutral-100 px-1.5 py-0.5 rounded">PDF</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick simulation file creator form aligned to subfolders */}
                  <form onSubmit={handleAddFileToFolder} className="flex flex-col sm:flex-row gap-2 text-xs pt-4 border-t border-[#E5E5EA]">
                    <div className="flex gap-1.5 items-center shrink-0">
                      <span className="text-slate-500 font-bold text-[11px]">บันทึกเข้า:</span>
                      <select 
                        className="bg-white border border-[#E5E5EA] rounded-xl p-2 font-bold text-xs outline-none"
                        value={targetFolder}
                        onChange={(e)=>setTargetFolder(e.target.value as any)}
                      >
                        <option value="สัญญา">1. สัญญา / NDA</option>
                        <option value="COA">2. เอกสาร COA</option>
                        <option value="BPR">3. ข้อมูล BPR / ผลิต</option>
                      </select>
                    </div>
                    <input 
                      type="text"
                      className="flex-1 p-2 bg-white rounded-xl border border-[#E5E5EA] outline-none placeholder:text-slate-400 font-semibold"
                      value={newFileName}
                      onChange={(e)=>setNewFileName(e.target.value)}
                      placeholder="ใส่ชื่อไฟล์ เช่น ใบตกลงสัญญาซื้อขาย_Final.pdf"
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold py-2 px-4.5 rounded-xl flex items-center justify-center gap-1 transition-all shrink-0"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      บันทึกลงไดร์ฟลูกค้า
                    </button>
                  </form>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SECTION 2: PRODUCTION R&D & STOCK CHECK (FIFO) */}
        {activeSegment === 'production' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Job and Selection header information */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#86868B]">เอกสารงานผลิตที่เปิดใช้</span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="font-bold text-lg text-[#1D1D1F]">{currentProduct?.name || 'ยังไม่ระบุ'}</h3>
                  <span className="bg-blue-100 text-blue-900 border border-blue-200 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                    ล็อตตรวจสอบ: {currentJob?.jobCode}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">สลับจ๊อบ:</span>
                  <select 
                    className="bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-semibold px-2.5 py-1.5 rounded-xl outline-none"
                    value={selectedJobId}
                    onChange={(e)=>setSelectedJobId(e.target.value)}
                  >
                    {(dbState.salesJobs || []).map((j: any) => (
                      <option key={j.id} value={j.id}>{j.jobCode} - {dbState.products?.find((p: any) => p.id === j.productId)?.name?.substring(0, 30)}...</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-[#34C759]/10 px-2.5 py-1 rounded-xl border border-[#34C759]/20">
                  <span className="text-xs text-emerald-800 font-bold shrink-0">🎛️ ปรับยอดผลิตวางแผน (เรียลไทม์):</span>
                  <input 
                    type="number"
                    className="w-20 bg-white border border-[#E5E5EA] text-xs font-mono font-bold px-1.5 py-0.5 rounded-md text-slate-800 outline-none text-center focus:border-[#0071E3]"
                    value={overrideQty}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      setOverrideQty(val as any);
                    }}
                    min={1}
                  />
                  <span className="text-[10px] text-emerald-800 font-bold shrink-0">ขวด/ชุด</span>
                </div>
              </div>
            </div>

            {/* FIFO Stock check and allocation ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Formulation (BOM) & FIFO checking rules with Color Indicators */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#F5F5F7] pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                      <Beaker className="h-4.5 w-4.5 text-[#0071E3]" /> เอกสารปริมาณเคมี/ บรรจุภัณฑ์ผสมตามสูตร (BOM Calculation)
                    </h4>
                    <p className="text-[11px] text-[#86868B] mt-0.5">สูตรบ่มกลั่น: {currentFormula?.version || 'สูตรที่ได้รับอนุมัติ'}</p>
                  </div>
                  
                  <span className="bg-[#34C759]/10 text-[#34C759] text-[10px] font-bold px-2 py-0.5 rounded border border-[#34C759]/20 font-mono">
                    นโยบาย: FIFO สรรหาเบิกตามล็อตคลังเก่าก่อน
                  </span>
                </div>

                {/* BOM check calculation list */}
                <div className="space-y-3.5">
                  {formulaDetails.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-neutral-50 rounded-2xl border border-[#E5E5EA] space-y-3">
                      <div className="flex justify-between flex-wrap gap-2 items-start">
                        <div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${item.category === 'Packaging' ? 'bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20' : 'bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20'}`}>
                            {item.category === 'Raw Material' ? 'สารสกัดเคมีดิบ' : 'บรรจุภัณฑ์ / กล่องขวด'}
                          </span>
                          <h5 className="font-bold text-xs text-[#1D1D1F] mt-1.5">{item.name}</h5>
                          <span className="text-[10px] font-mono text-slate-500">รหัสวัตถุดิบ: {item.code}</span>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-medium">คำนวณสูตรพรีเมียมตัวบ่งใช้</p>
                          <p className="font-bold text-xs font-mono text-[#1D1D1F] mt-0.5">
                            ต้องการ: {item.amountNeeded?.toLocaleString()} {item.unit}
                          </p>
                        </div>
                      </div>

                      {/* Stock Check visual color indicator required by user */}
                      <div className="flex justify-between flex-wrap gap-2 pt-2.5 border-t border-[#E5E5EA] items-center text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500">ยอดคลังคงเหลือ:</span>
                          <strong className="font-mono text-slate-800">{item.stock?.toLocaleString()} {item.unit}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.isSufficient ? (
                            <span className="text-xs font-bold text-[#34C759] flex items-center gap-1 bg-[#34C759]/10 px-2.5 py-1 rounded-full border border-[#34C759]/20">
                              <Check className="h-3.5 w-3.5 text-[#34C759]" /> 
                              <span className="text-[#34C759]">สถานะ: 'เพียงพอ' สำหรับการผลิต</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#FF3B30] flex items-center gap-1 bg-[#FF3B30]/10 px-2.5 py-1 rounded-full border border-[#FF3B30]/20 animate-pulse">
                                <AlertCircle className="h-3.5 w-3.5 text-[#FF3B30]" /> 
                                <span className="text-[#FF3B30]">สถานะ: 'ขาดสต็อก' 🔴 (ขาดอีก {item.shortage?.toLocaleString()} {item.unit})</span>
                              </span>
                              <button 
                                onClick={() => handleTriggerPRForMissing(item.materialId, item.shortage)}
                                className="bg-[#FF9500] hover:bg-[#e08400] text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                กดออกใบขอจัดซื้อ (PR) ด่วน
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* FIFO lot breakdown display (FIFO tracking details) */}
                      {item.isSufficient && (
                        <div className="pt-2 bg-white/60 p-2 rounded-xl text-[10px] font-mono border border-slate-100">
                          <span className="font-bold text-slate-500 block mb-1">🔍 แผนชั่งเบิก FIFO ล็อตคลัง (ตามลำดับวันเข้าเก็บ):</span>
                          <div className="space-y-1">
                            {item.lots.map((lot: any, lIdx: number) => (
                              <div key={lIdx} className="flex justify-between text-slate-600">
                                <span>- ล็อต {lot.lotNo} (ควรเฉือนใช้วัตถุดิบทันที: {lot.qty?.toLocaleString()} {item.unit})</span>
                                <span>หมดอายุคงทน: {lot.expDate}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>
              
              {/* Printable BMR/BPR actions panel options & Recommendations */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Print Center with preview trigger */}
                <div className="bg-[#1D1D1F] text-white p-5 rounded-2xl border border-zinc-800 shadow-sm space-y-4">
                  <span className="inline-flex bg-white/10 text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Print Desk Portal
                  </span>
                  <h4 className="font-bold text-sm tracking-tight">เครื่องมือพิมพ์พิมพ์เอกสารผสม (BPR / BMR Sheets)</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    พิมพ์บันทึกการปรุงผสมและใบเบิกคลัง สอดคล้องตามมาตรฐานหลักสากล คณะกรรมการอาหารและยาโรงงานน้ำหอม GMP
                  </p>

                  <div className="space-y-2 text-xs">
                    <button 
                      onClick={() => setPrintDocType('BMR')}
                      className="w-full text-left bg-[#2C2C2E] hover:bg-neutral-700 py-2.5 px-3 rounded-xl flex justify-between items-center transition-colors border border-emerald-500/20"
                    >
                      <span className="font-semibold text-emerald-300">✨ 1. เอกสารควบคุมปรุงสารหอม (BMR Master Sheet)</span>
                      <Printer className="h-4 w-4 text-emerald-400" />
                    </button>
                    <button 
                      onClick={() => setPrintDocType('BPR')}
                      className="w-full text-left bg-[#2C2C2E] hover:bg-neutral-700 py-2.5 px-3 rounded-xl flex justify-between items-center transition-colors border border-indigo-500/20"
                    >
                      <span className="font-semibold text-indigo-300">📦 2. เอกสารคุมพัสดุบรรจุกล่อง (BPR Master Sheet)</span>
                      <Printer className="h-4 w-4 text-indigo-400" />
                    </button>
                    <button 
                      onClick={() => setPrintDocType('STOCK_CHECK')}
                      className="w-full text-left bg-zinc-800 hover:bg-zinc-700 py-2.5 px-3 rounded-xl flex justify-between items-center transition-colors"
                    >
                      <span>2. เอกสารเช็คสต็อกเคมีและบรรจุ (GREEN/RED)</span>
                      <Printer className="h-4 w-4 text-slate-400" />
                    </button>
                    <button 
                      onClick={() => setPrintDocType('WEIGH_SHEET')}
                      className="w-full text-left bg-zinc-800 hover:bg-zinc-700 py-2.5 px-3 rounded-xl flex justify-between items-center transition-colors"
                    >
                      <span>3. บิลใบสั่งชั่งผลิต (พนักงานหน้าหม้อ)</span>
                      <Printer className="h-4 w-4 text-slate-400" />
                    </button>
                    <button 
                      onClick={() => setPrintDocType('LABELS')}
                      className="w-full text-left bg-zinc-800 hover:bg-zinc-700 py-2.5 px-3 rounded-xl flex justify-between items-center transition-colors"
                    >
                      <span>4. แผ่นฉลากและโค้ดฉลากติดภาชนะย่อย (Label)</span>
                      <Printer className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500">
                    * เมื่อต้องการพิมพ์ กดเลือกเพื่อดูตัวอย่างแบบฟอร์มโรงพิมพ์จริง และคลิก "พิมพ์เอกสาร / สั่งบันทึกลง PDF ใบกำกับ" ปลายทาง
                  </p>
                </div>

                {/* GMP Recommendation Box */}
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-slate-800 space-y-2.5 text-xs">
                  <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
                    <CheckCircle2 className="h-4.5 w-4.5 text-[#FF9500]" /> ข้อสังเกตสากลและการจัดสรร FIFO คลัง
                  </h4>
                  <p className="leading-relaxed">
                    ระบบดึงลำดับ LOT คลังพัสดุและเคมีภัณฑ์ตามมาตรฐาน <strong>First-In First-Out (FIFO)</strong> เกื้อตระกูลสารบ่มกลั่น เพื่อการรักษาเสถียรภาพความหอมติดทนไม่ระเหยสูญจากขวดบรรจุกล่อง
                  </p>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    **ระบบการจองสต็อกเบิกด่วนจะช่วยแอดมินจัดซื้อสืบค้นหาจุดบกพร่อง และสั่งพัสดุด่วนได้ทันทีโดยลิ้งค์จ๊อบใบผลิตเข้าสู่ไดร์ฟงานเป้าหมายได้อย่างแม่นยำ
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* SECTION 3: 4-PAGE PACKAGING OPERATION (ใบสั่งบรรจุภัณฑ์ 4 หน้า) */}
        {activeSegment === 'packaging' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Interactive packaging Lot records & Wizard selector */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-5">
              
              <div className="flex justify-between items-center border-b border-[#F5F5F7] pb-3">
                <div>
                  <h4 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                    <Package className="h-4.5 w-4.5 text-[#FF9500]" /> สมุดบันทึกการบรรจุหีบห่อ 4 หน้า (BPR Packaging Booklet)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">ใบสั่งย่อยประทับล็อตแพ็คสินค้าเคมี คัดกรองหัวมิครอนสำหรับจ๊อบ <strong>{currentJob?.jobCode}</strong></p>
                </div>

                <div className="flex bg-[#E8E8ED] p-0.5 rounded-lg border border-[#D1D1D6] font-mono text-[11px] font-bold">
                  {[1, 2, 3, 4].map(pgNum => (
                    <button 
                      key={pgNum}
                      onClick={() => setActivePackPage(pgNum as any)}
                      className={`px-2.5 py-1 rounded transition-all ${activePackPage === pgNum ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                    >
                      หน้า {pgNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page contents renderer */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-[#E5E5EA] text-slate-700 text-xs min-h-[300px]">
                
                {/* PAGE 1: ใบสั่งบรรจุ (Packaging Order) */}
                {activePackPage === 1 && (
                  <div className="space-y-4">
                    <div className="border-b border-dashed border-slate-300 pb-2 flex justify-between items-center bg-white p-3 rounded-xl border">
                      <span className="font-bold text-[#1D1D1F] text-base">หน้าที่ 1: ใบสั่งผลิตบรรจุภัณฑ์ (Packaging Order Form)</span>
                      <span className="bg-[#0071E3] text-white px-2 py-0.5 rounded text-[10px] font-mono">STATUS: Approved</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase">รหัสใบกำกับงาน</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{currentJob?.jobCode || '#05002'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase">เป้าหมายจำนวนผลิตรวม</p>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{currentJob?.quantityRequested?.toLocaleString()} SKU</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-bold text-slate-700">บรรจุภัณฑ์หลักที่ต้องดึงสต็อก FIFO:</p>
                      <div className="space-y-1.5 font-mono text-[11px]">
                        <div className="bg-white p-2 border rounded flex justify-between">
                          <span>- ขวดแก้วฝาโลหะ 100ml [PKG-BTL-100G]</span>
                          <span className="text-green-600 font-bold">● เพียงพอ (เตรียม 1,000 ขวด)</span>
                        </div>
                        <div className="bg-white p-2 border rounded flex justify-between">
                          <span>- หัวฉีดไมครอนสเปรย์หรูสีทอง [PKG-CAP-MIST]</span>
                          <span className="text-green-600 font-bold">● เพียงพอ (เตรียม 1,000 ชิ้น)</span>
                        </div>
                        <div className="bg-white p-2 border rounded flex justify-between">
                          <span>- กล่องปั๊มนูนแชมเปญ [PKG-BOX-GIFT]</span>
                          <span className="text-green-600 font-bold">● เพียงพอ (เตรียม 1,000 ชิ้น)</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">ผู้ตรวจอนุมัติการจ่ายงาน</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border bg-white rounded"
                          value={packagingLogs.inspector}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, inspector: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">วันที่ออกคำสั่งแพ็ค</label>
                        <input 
                          type="date" 
                          className="w-full p-2 border bg-white rounded"
                          value={packagingLogs.orderDate}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, orderDate: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 2: ใบบันทึกการบรรจุ (Packaging Log) */}
                {activePackPage === 2 && (
                  <div className="space-y-4">
                    <div className="border-b border-dashed border-slate-300 pb-2 bg-white p-3 rounded-xl border">
                      <span className="font-bold text-[#1D1D1F] text-base block">หน้าที่ 2: ใบบันทึกขั้นตอนตรวจบรรจุ (Packaging Activity Log)</span>
                      <span className="text-[10px] text-slate-500">บันทึกความแม่นยำทางสถิติ ช่วงกะพนักงาน และข้อบกพร่องตัวกรวยฉีด</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">เวลาเริ่มกระบวนการบรรจุขวด</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border bg-white rounded font-mono"
                          value={packagingLogs.startTime}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, startTime: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">เวลาสิ้นสุดกระบวนการ</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border bg-white rounded font-mono"
                          value={packagingLogs.endTime}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, endTime: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">จำนวนบรรจุเสร็จสิ้นสมบูรณ์ (ขวด)</label>
                        <input 
                          type="number" 
                          className="w-full p-2 border bg-white rounded font-bold font-mono text-[#34C759]"
                          value={packagingLogs.actualPacked}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, actualPacked: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">จำนวนสินค้าคัดทิ้ง / ชำรุด (ชิ้น)</label>
                        <input 
                          type="number" 
                          className="w-full p-2 border bg-white rounded font-bold font-mono text-[#FF3B30]"
                          value={packagingLogs.defectQty}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, defectQty: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-500 mb-1">บันทึกสภาวะแวดล้อม / หมายเหตุห้องแพ็คอุณหภูมิความดัน</label>
                      <textarea
                        rows={2}
                        className="w-full p-2 border bg-white rounded"
                        value={packagingLogs.notes}
                        onChange={(e)=>setPackagingLogs({...packagingLogs, notes: e.target.value})}
                        placeholder="หัวสเปรย์ประกบแน่นดี บรรจุกล่องแข็งปั๊มนูนครบถ้วนไม่ยับ ไม่มีรอยบุบ"
                      />
                    </div>
                  </div>
                )}

                {/* PAGE 3: ใบบันทึกการควบคุมการบรรจุ (Packaging Quality Control) */}
                {activePackPage === 3 && (
                  <div className="space-y-4">
                    <div className="border-b border-dashed border-slate-300 pb-2 bg-white p-3 rounded-xl border">
                      <span className="font-bold text-[#1D1D1F] text-base block">หน้าที่ 3: ใบบันทึกผลตรวจความสะอาดและคุณภาพความแน่น (Quality Packaging Control)</span>
                      <span className="text-[10px] text-slate-500">ตรวจสอบโดยเจ้าหน้าที่ฝ่ายประกันเพื่อป้องกันสีกรองเพี้ยน</span>
                    </div>

                    <div className="space-y-2.5">
                      <p className="font-bold text-slate-700">ด่านตรวจสอบความสมบูรณ์ GMP โรงงาน:</p>
                      
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={packagingLogs.sealPassed}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, sealPassed: e.target.checked})}
                          className="w-4 h-4 text-[#0071E3]"
                        />
                        <span>สภาพฝาโลหะครอบคริสตัล &amp; แรงกดขันหัวสเปรย์แน่นหนา (Seal Control)</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={packagingLogs.volumePassed}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, volumePassed: e.target.checked})}
                          className="w-4 h-4 text-[#0071E3]"
                        />
                        <span>สัดส่วนปริมาตรที่เติมถูกต้องและสม่ำเสมอ บรรจุ 100ml (Volume Control)</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={packagingLogs.labelPassed}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, labelPassed: e.target.checked})}
                          className="w-4 h-4 text-[#0071E3]"
                        />
                        <span>การติดฉลากระบุมลทิลล็อต ข้อความระบุนโยบายและบาร์โค้ดคมชัดตรงแนวกึ่งกลาง (Label Control)</span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <label className="block font-bold text-slate-500 mb-1">เจ้าหน้าที่ผู้ตรวจและตรวจสอบความเรียบร้อย</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border bg-white rounded"
                        value={packagingLogs.qcInspector}
                        onChange={(e)=>setPackagingLogs({...packagingLogs, qcInspector: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {/* PAGE 4: ใบคืนพัสดุและตรวจนับสินค้า (Returns, Scraps & Stock Count Slip) */}
                {activePackPage === 4 && (
                  <div className="space-y-4">
                    <div className="border-b border-dashed border-slate-300 pb-2 bg-white p-3 rounded-xl border">
                      <span className="font-bold text-[#1D1D1F] text-base block">หน้าที่ 4: ใบคืนกระจายสินค้า / คืนซากบรรจุภัณฑ์ (Warehouse Transfer & Scrap Returns)</span>
                      <span className="text-[10px] text-slate-500">รายงานส่งให้แผนกคลังสินค้าเพื่อปิดบัญชีรหัสงาน</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-bold text-slate-500 mb-0.5 text-[10px]">กล่องเหลือส่งคืน</label>
                        <input 
                          type="number" 
                          className="w-full p-2 border bg-white rounded text-center"
                          value={packagingLogs.cartonReturned}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, cartonReturned: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 mb-0.5 text-[10px]">หัวพลาสติกรอส่งคืน</label>
                        <input 
                          type="number" 
                          className="w-full p-2 border bg-white rounded text-center"
                          value={packagingLogs.nozzlesReturned}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, nozzlesReturned: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 mb-0.5 text-[10px]">ขวดแก้วชำรุดคุกคาม</label>
                        <input 
                          type="number" 
                          className="w-full p-2 border bg-white rounded text-center"
                          value={packagingLogs.scrapsScrap}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, scrapsScrap: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">รหัสใบนับพัสดุส่งฝ่ายคลังสินค้า</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border bg-white rounded font-mono font-bold"
                          value={packagingLogs.stockCountSlipNo}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, stockCountSlipNo: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-500 mb-1">เจ้าหน้าที่ตรวจนับตรวจสอบ</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border bg-white rounded"
                          value={packagingLogs.countInspector}
                          onChange={(e)=>setPackagingLogs({...packagingLogs, countInspector: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-[#34C759]/10 border border-[#34C759]/20 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#34C759]" />
                      <span className="text-[11px] text-[#34C759] font-bold">ใบนับสินค้าตัวนี้เชื่อมโยงกับฐานสตรีมมิ่งจัดซื้อและคลังน้ำหอมเพื่อตัดสต็อกอัตโนมัติแล้ว</span>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Quick Summary list and printable slips for warehouse */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                  <Printer className="h-4.5 w-4.5 text-[#0071E3]" /> งานพิมพ์ใบบรรจุ / ใบนับคลัง
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  ฝ่ายคลังสินค้าใช้ใบนับและใบสั่งบรรจุนี้ในการตัดยอดจริงใน ERP และจัดเก็บตัวอย่างสอดคล้องตามมาตรฐาน GMP โรงงาน
                </p>

                <div className="space-y-2 text-xs">
                  <button 
                    onClick={() => {
                      setPrintDocType('PACKAGING_FOUR_PAGES');
                      setActivePackPage(1);
                    }}
                    className="w-full bg-[#1D1D1F] hover:bg-neutral-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    พิมพ์สมุดใบบรรจุครบ 4 หน้า
                  </button>

                  <button 
                    onClick={() => setPrintDocType('STOCK_COUNT_SLIP')}
                    className="w-full border border-[#E5E5EA] bg-neutral-50 hover:bg-neutral-100 text-slate-800 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    พิมพ์ใบนับส่งให้ฝ่ายคลังสินค้า
                  </button>
                </div>
              </div>

              {/* Shared Purchase link tracker */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm space-y-3">
                <h4 className="font-bold text-xs text-[#1D1D1F]">
                  📊 รายการขอซื้อเชื่อมโยงกับจ๊อบ {currentJob?.jobCode}
                </h4>
                
                <div className="space-y-2">
                  {(dbState.purchaseRequests || []).filter((pr: any) => pr.linkedJobCode === currentJob?.jobCode || pr.requestedBy?.includes(currentJob?.jobCode || 'none')).length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">ไม่มีรายการคำขอจัดซื้อเพิ่มเติม (สต็อกพัสดุเพียงพอต่อความต้องการ)</p>
                  ) : (
                    (dbState.purchaseRequests || [])
                      .filter((pr: any) => pr.linkedJobCode === currentJob?.jobCode || pr.requestedBy?.includes(currentJob?.jobCode || 'none'))
                      .map((pr: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-neutral-50 rounded-xl border text-[11px] font-mono flex justify-between items-center">
                          <div>
                            <span className="font-bold text-red-600">REQ: {pr.id}</span>
                            <p className="text-slate-500 mt-0.5">วัสดุ: {dbState.materials?.find((m:any)=>m.id===pr.materialId)?.name || 'Material'}</p>
                          </div>
                          <span className="font-bold text-slate-800">{pr.quantity} หน่วย</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SECTION 4: GMP GOODS RECEIVING & COA RETRIEVAL (คลังวัตถุดิบและระบบควบคุมคุณภาพ GMP) */}
        {activeSegment === 'gmp-coa' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* secondary Apple style sub-nav pills in raw material section */}
            <div className="flex bg-[#E8E8ED] p-1 rounded-2xl border border-[#D1D1D6] max-w-4xl gap-0.5 select-none text-[11px] font-bold no-print">
              <button 
                onClick={() => setGmpTab('inventory')} 
                className={`flex-1 py-2 px-3 text-center rounded-xl transition-all ${gmpTab === 'inventory' ? 'bg-[#0071E3] text-white shadow-xs' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
              >
                📦 1. ตารางวัตถุดิบคลังสินค้า
              </button>
              <button 
                onClick={() => setGmpTab('coa_search')} 
                className={`flex-1 py-2 px-3 text-center rounded-xl transition-all ${gmpTab === 'coa_search' ? 'bg-[#0071E3] text-white shadow-xs' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
              >
                🔍 2. คลังเอกสาร COA ย้อนหลัง
              </button>
              <button 
                onClick={() => setGmpTab('lot_generator')} 
                className={`flex-1 py-2 px-3 text-center rounded-xl transition-all ${gmpTab === 'lot_generator' ? 'bg-[#0071E3] text-white shadow-xs' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
              >
                ⚡ 3. สร้างรหัส Lot อัตโนมัติ
              </button>
              <button 
                onClick={() => setGmpTab('gmp_receiving')} 
                className={`flex-1 py-2 px-3 text-center rounded-xl transition-all ${gmpTab === 'gmp_receiving' ? 'bg-[#0071E3] text-white shadow-xs' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
              >
                📥 4. ตรวจรับตามเกณฑ์ GMP
              </button>
            </div>

            {/* TAB 1: GRIDPHP-STYLE INTERACTIVE INVENTORY CATALOG */}
            {gmpTab === 'inventory' && (
              <div className="space-y-6 bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-1.5">
                      <Package className="h-5 w-5 text-[#0071E3]" /> ตารางตรวจสอบและจัดการวัตถุดิบสารเคมี (Warehouse Live Master Grid)
                    </h3>
                    <p className="text-xs text-[#86868B] mt-0.5">ค้นหา ตรวจเช็คจุดปลอดภัยสำรอง และจัดซื้อพัสดุเร่งด่วนเมื่อสต็อกต่ำกว่าเกณฑ์</p>
                  </div>

                  <button
                    onClick={() => setShowAddMaterial(!showAddMaterial)}
                    className="bg-[#0071E3] hover:bg-[#147ce5] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    {showAddMaterial ? 'ปิดฟอร์มเพิ่ม' : 'เพิ่มเคมีภัณฑ์/พัสดุใหม่'}
                  </button>
                </div>

                {/* Inline form to registration of a new material */}
                {showAddMaterial && (
                  <form onSubmit={handleCreateMaterial} className="bg-neutral-50 p-5 rounded-2xl border border-[#E5E5EA] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700 animate-slide-down">
                    <div className="sm:col-span-2">
                      <span className="font-bold block mb-1 text-[#1D1D1F]">ชื่อวัตถุดิบเคมี / พัสดุ</span>
                      <input 
                        type="text" 
                        className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl outline-none"
                        value={newMatName}
                        onChange={(e)=>setNewMatName(e.target.value)}
                        placeholder="เช่น เคมีหอมกลิ่นน้ำมันซีดาร์วูด เกรดพรีเมียม"
                        required
                      />
                    </div>

                    <div>
                      <span className="font-bold block mb-1 text-[#1D1D1F]">รหัสวัตถุดิบ (Code)</span>
                      <input 
                        type="text" 
                        className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl font-mono uppercase"
                        value={newMatCode}
                        onChange={(e)=>setNewMatCode(e.target.value)}
                        placeholder="RAW-ESS-CEDAR-15"
                        required
                      />
                    </div>

                    <div>
                      <span className="font-bold block mb-1 text-[#1D1D1F]">หมวดหมู่พัสดุ</span>
                      <select 
                        className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl outline-none"
                        value={newMatCategory}
                        onChange={(e)=>setNewMatCategory(e.target.value as any)}
                      >
                        <option value="Raw Material">วัตถุดิบเคมี (Raw Material)</option>
                        <option value="Packaging">บรรจุภัณฑ์ (Packaging)</option>
                      </select>
                    </div>

                    <div>
                      <span className="font-bold block mb-1 text-[#1D1D1F]">สต็อกตั้งต้น</span>
                      <input 
                        type="number" 
                        className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl font-mono"
                        value={newMatStock}
                        onChange={(e)=>setNewMatStock(Number(e.target.value))}
                        min={0}
                      />
                    </div>

                    <div>
                      <span className="font-bold block mb-1 text-[#1D1D1F]">จุดปลอดภัยขั้นต่ำ (Min Stock)</span>
                      <input 
                        type="number" 
                        className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl font-mono text-red-600 font-bold"
                        value={newMatMinStock}
                        onChange={(e)=>setNewMatMinStock(Number(e.target.value))}
                        min={0}
                      />
                    </div>

                    <div>
                      <span className="font-bold block mb-1 text-[#1D1D1F]">หน่วยนับหลัก</span>
                      <input 
                        type="text" 
                        className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl"
                        value={newMatUnit}
                        onChange={(e)=>setNewMatUnit(e.target.value)}
                        placeholder="ลิตร / กิโลกรัม / ชิ้น"
                      />
                    </div>

                    <div>
                      <span className="font-bold block mb-1 text-[#1D1D1F]">ต้นทุนคงเหลือ (บาท/หน่วย)</span>
                      <input 
                        type="number" 
                        className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl font-mono"
                        value={newMatCost}
                        onChange={(e)=>setNewMatCost(Number(e.target.value))}
                        min={0}
                      />
                    </div>

                    <button 
                      type="submit"
                      className="sm:col-span-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-center shadow-xs transition-colors cursor-pointer mt-2"
                    >
                      🚀 บันทึกเปิดรายการลงสมุดทะเบียนพัสดุ
                    </button>
                  </form>
                )}

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 py-3 border-y border-[#F5F5F7] text-xs">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input 
                      type="text"
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-[#E5E5EA] focus:bg-white text-xs outline-none transition-all"
                      placeholder="ป้อนรหัส หรือ ชื่อวัสดุ..."
                      value={materialSearch}
                      onChange={(e)=>{setMaterialSearch(e.target.value); setMaterialPage(1);}}
                    />
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="p-2.5 bg-neutral-50 rounded-xl border text-slate-800 outline-none"
                      value={materialCategoryFilter}
                      onChange={(e)=>{setMaterialCategoryFilter(e.target.value as any); setMaterialPage(1);}}
                    >
                      <option value="All">ทุกประเภทสารพัสดุ</option>
                      <option value="Raw Material">วัตถุดิบเคมีเท่านั้น</option>
                      <option value="Packaging">บรรจุภัณฑ์ขวดกล่อง</option>
                    </select>

                    <select
                      className="p-2.5 bg-neutral-50 rounded-xl border text-slate-800 outline-none font-mono"
                      value={`${materialSortField}-${materialSortOrder}`}
                      onChange={(e)=>{
                        const [field, order] = e.target.value.split('-');
                        setMaterialSortField(field as any);
                        setMaterialSortOrder(order as any);
                      }}
                    >
                      <option value="code-asc">เรียงตามรหัส: ก-ฮ</option>
                      <option value="name-asc">เรียงตามชื่อวัสดุ: ก-ฮ</option>
                      <option value="stockLevel-asc">สต็อกน้อยสุดพัสดุ</option>
                      <option value="stockLevel-desc">สต็อกสูงที่สุดในคลัง</option>
                    </select>
                  </div>
                </div>

                {/* GRIDPHP-STYLE DATA ROWS */}
                <div className="border border-[#E5E5EA] rounded-2xl overflow-hidden overflow-x-auto text-xs">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA] text-[#86868B] font-bold text-left uppercase text-[10px] tracking-wider select-none h-11">
                        <th className="p-3">รหัสสาร (Code)</th>
                        <th className="p-3">ชื่อรายการพัสดุเคมีภัณฑ์</th>
                        <th className="p-3">ประเภทหลัก</th>
                        <th className="p-3 text-right">จำนวนสต็อกคงเหลือ</th>
                        <th className="p-3 text-right">จุดปลอดภัยต่ำสุด (Min)</th>
                        <th className="p-3 text-center">สถานะสต็อก</th>
                        <th className="p-3 text-center">การจัดจัดการจัดซื้อ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5EA]">
                      {(dbState.materials || [])
                        .filter((m: any) => {
                          const s = materialSearch.toLowerCase().trim();
                          if (s && !m.name?.toLowerCase().includes(s) && !m.code?.toLowerCase().includes(s)) return false;
                          if (materialCategoryFilter !== 'All' && m.category !== materialCategoryFilter) return false;
                          return true;
                        })
                        .sort((a: any, b: any) => {
                          let fieldA = a[materialSortField];
                          let fieldB = b[materialSortField];
                          if (typeof fieldA === 'string') {
                            return materialSortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                          } else {
                            return materialSortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
                          }
                        })
                        .slice((materialPage - 1) * 8, materialPage * 8)
                        .map((material: any) => {
                          const isShort = material.stockLevel < material.minStock;
                          const isEditing = editingMaterialId === material.id;
                          
                          return (
                            <tr key={material.id} className="hover:bg-neutral-50/50 transition-colors h-14">
                              <td className="p-3 font-mono font-bold text-slate-800">{material.code}</td>
                              <td className="p-3 font-semibold text-slate-900">{material.name}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${material.category === 'Raw Material' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                                  {material.category === 'Raw Material' ? 'สารสกัดเคมี' : 'บรรจุภัณฑ์/กล่อง'}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold">
                                {isEditing ? (
                                  <div className="flex justify-end gap-1 items-center">
                                    <input 
                                      type="number"
                                      className="w-16 p-1 border rounded bg-white text-center"
                                      value={editingMaterialStock}
                                      onChange={(e)=>setEditingMaterialStock(Number(e.target.value))}
                                    />
                                    <button 
                                      onClick={() => handleQuickUpdateStock(material.id, editingMaterialStock)}
                                      className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                    >
                                      ✓
                                    </button>
                                  </div>
                                ) : (
                                  <div className="group cursor-pointer hover:text-[#0071E3] flex justify-end items-center gap-1.5" onClick={()=>{setEditingMaterialId(material.id); setEditingMaterialStock(material.stockLevel);}}>
                                    <span className="underline decoration-dotted">{material.stockLevel?.toLocaleString()} {material.unit}</span>
                                    <span className="text-[9px] text-[#86868B] group-hover:block hidden">แก้ไข</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-right font-mono font-semibold text-[#86868B]">
                                {material.minStock?.toLocaleString()} {material.unit}
                              </td>
                              <td className="p-3 text-center">
                                {isShort ? (
                                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200 text-[10px] animate-pulse">
                                    <AlertCircle className="h-3 w-3" /> ต่ำกว่าจุดปลอดภัย
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                                    <Check className="h-3 w-3" /> ปกติ (Safe)
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {isShort ? (
                                  <button
                                    onClick={() => {
                                      // Buy enough to be safe
                                      const missingQty = (material.minStock - material.stockLevel) + material.minStock * 2;
                                      handleTriggerPRForMissing(material.id, missingQty);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                                  >
                                    🚨 จัดซื้อด่วน (Auto PR)
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono">ไม่ต้องจัดซื้อ</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold pt-2">
                  <span>กำลังแสดงหน้า {materialPage} จาก {Math.ceil((dbState.materials || []).length / 8)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={()=>setMaterialPage(prev => Math.max(1, prev-1))}
                      disabled={materialPage === 1}
                      className="px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
                    >
                      ก่อนหน้า
                    </button>
                    <button 
                      onClick={()=>setMaterialPage(prev => Math.min(Math.ceil((dbState.materials || []).length / 8), prev+1))}
                      disabled={materialPage >= Math.ceil((dbState.materials || []).length / 8)}
                      className="px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: COA HISTORICAL SEARCH & SPEC INSPECTOR */}
            {gmpTab === 'coa_search' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Search engines & Table */}
                <div className="lg:col-span-2 space-y-4 bg-white p-5 rounded-3xl border border-[#E5E5EA] shadow-xs">
                  <div>
                    <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                      <Search className="h-4.5 w-4.5 text-[#0071E3]" /> คลังค้นหาและดึงเอกสาร COA ย้อนหลัง (COA Trace Archive)
                    </h3>
                    <p className="text-[11px] text-[#86868B] mt-0.5">ระบุเลขบาร์ล็อตวัตถุดิบซัพพลายเออร์เพื่อตรวจสอบใบวิเคราะห์การันตีความวิเศษจากแหล่งผลิตหลักตัวจริง</p>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input 
                      type="text"
                      className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-[#E5E5EA] focus:bg-white text-xs outline-none transition-all"
                      value={coaSearch}
                      onChange={(e)=>setCoaSearch(e.target.value)}
                      placeholder="พิมพ์เลขล็อตสะสม เช่น LOT-ROSE-202605 หรือชื่อวัตถุดิบเคมี..."
                    />
                  </div>

                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {(dbState.coaRecords || [])
                      .filter((c: any) => {
                        const searchLower = coaSearch.toLowerCase().trim();
                        if (!searchLower) return true;
                        return (
                          c.lotNumber?.toLowerCase().includes(searchLower) ||
                          c.materialName?.toLowerCase().includes(searchLower) ||
                          c.fileName?.toLowerCase().includes(searchLower)
                        );
                      })
                      .map((coa: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-neutral-50 hover:bg-neutral-100 rounded-2xl border border-[#E5E5EA] text-xs space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="bg-amber-100 text-amber-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                COA LOT: {coa.lotNumber}
                              </span>
                              <h4 className="font-bold text-[#1D1D1F] mt-1.5">{coa.materialName}</h4>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                                {coa.status || 'Verified'} (สแกนผ่านระเบียบ)
                              </span>
                              <p className="text-[9px] text-[#86868B] mt-1">{coa.verifiedDate || coa.createdAt || '2026-06-10'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-1.5 border-t border-[#E5E5EA] bg-white/50 p-2 rounded-lg font-mono text-[10px] text-zinc-600">
                            <div>ความบริสุทธิ์: <strong className="text-slate-800">{coa.purity || '99.8%'}</strong></div>
                            <div>ลักษณะทางกาย: <strong className="text-slate-800">{coa.appearance || 'Conforms'}</strong></div>
                            <div>คุณภาพกลิ่น: <strong className="text-slate-800">{coa.odor || 'Conforms'}</strong></div>
                          </div>

                          <div className="flex justify-between items-center text-[11px] pt-1">
                            <span className="flex items-center gap-1 font-semibold text-[#86868B]">
                              <FileText className="h-4 w-4 text-red-500" />
                              {coa.fileName || 'ArchiveCOA_Document.pdf'}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={()=>{
                                  setViewingPdfCoa(coa);
                                  onNotify(`เปิดวิเคราะห์สเปกตรัมไฟล์ในโมดูล Reader: ${coa.fileName}`, 'info');
                                }}
                                className="bg-[#0071E3] hover:bg-[#147ce5] text-white text-[10px] font-bold px-3 py-1 rounded-xl cursor-pointer"
                              >
                                เรียกดู PDF จำลอง
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Manual add COA back-entry form */}
                  <div className="bg-neutral-50/50 p-4 rounded-2xl border border-dashed text-xs space-y-3 pt-4 border-[#E5E5EA]">
                    <h4 className="font-bold text-[#1D1D1F] flex items-center gap-1.5"><Plus className="h-4 w-4 text-[#0071E3]" /> ขึ้นทะเบียน แนบCOA สารเคมีย้อนหลังเพื่อความโปร่งใส</h4>
                    <form onSubmit={handleSaveCOA} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block mb-0.5 text-[#86868B]">อ้างถึงตัวสารหอม</span>
                        <select
                          className="w-full p-2 bg-white rounded border"
                          value={newCoa.materialId}
                          onChange={(e)=>setNewCoa({...newCoa, materialId: e.target.value})}
                          required
                        >
                          <option value="">-- เลือกสารเคมี --</option>
                          {(dbState.materials || []).filter((m:any)=>m.category==='Raw Material').map((m: any) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="block mb-0.5 text-[#86868B]">Lot Number การถอยประวัติ</span>
                        <input 
                          type="text"
                          className="w-full p-2 bg-white rounded border font-mono font-bold uppercase"
                          value={newCoa.lotNumber}
                          onChange={(e)=>setNewCoa({...newCoa, lotNumber: e.target.value})}
                          placeholder="LOT-ESS-ROSE-2026"
                          required
                        />
                      </div>

                      <div>
                        <span className="block mb-0.5 text-[#86868B] font-mono">ความเข้มข้น/ความบริสุทธิ์ (%)</span>
                        <input 
                          type="text"
                          className="w-full p-2 bg-white rounded border font-mono"
                          value={newCoa.purity}
                          onChange={(e)=>setNewCoa({...newCoa, purity: e.target.value})}
                          placeholder="99.7%"
                        />
                      </div>

                      <div>
                        <span className="block mb-0.5 text-[#86868B]">ชื่อไฟล์จำลองเอกสารจัดเก็บ</span>
                        <input 
                          type="text"
                          className="w-full p-2 bg-white rounded border font-mono text-xs"
                          value={newCoa.fileName || `COA_ChemLab_Mat${newCoa.materialId || 'X'}_Ref.pdf`}
                          onChange={(e)=>setNewCoa({...newCoa, fileName: e.target.value})}
                          placeholder="COA_Standard_Document.pdf"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="sm:col-span-2 bg-[#1D1D1F] hover:bg-neutral-800 text-white font-bold py-2 rounded-xl text-center"
                      >
                        📂 เพิ่มแนบประวัติ COA เพื่อการสืบค้น
                      </button>
                    </form>
                  </div>
                </div>

                {/* PDF Replica Viewer Panel with elegant scientific details */}
                <div className="lg:col-span-1 bg-neutral-900 text-neutral-300 p-5 rounded-3xl shadow-lg border border-neutral-800 space-y-4">
                  {viewingPdfCoa ? (
                    <div className="space-y-4 animate-fade-in relative">
                      <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#0071E3] font-mono animate-pulse">● Virtal PDF Viewer</span>
                        <button 
                          className="bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] px-2 py-0.5 rounded"
                          onClick={()=>setViewingPdfCoa(null)}
                        >
                          ปิด
                        </button>
                      </div>

                      {/* PDF Certificate of Analysis Body Replica */}
                      <div className="bg-white text-neutral-800 p-5 rounded-xl space-y-4 border border-slate-300 shadow-inner font-sans text-[11px] leading-relaxed relative">
                        <div className="text-center space-y-0.5 border-b-2 border-neutral-800 pb-2">
                          <h4 className="font-bold text-center text-sm tracking-wider uppercase text-slate-900">Certificate of Analysis</h4>
                          <span className="text-[8px] tracking-widest uppercase text-neutral-500 font-mono block">Laboratoires Grasse Distillery S.A.</span>
                          <span className="text-[8px] font-mono block text-neutral-400">Grasse, PACA, France | Established 1894</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-zinc-600 bg-neutral-50 p-2 rounded border">
                          <p><strong>Compound:</strong> {viewingPdfCoa.materialName}</p>
                          <p><strong>Internal ID:</strong> {viewingPdfCoa.id}</p>
                          <p><strong>Lot Number:</strong> {viewingPdfCoa.lotNumber}</p>
                          <p><strong>Verified Date:</strong> {viewingPdfCoa.verifiedDate || '2026-06-10'}</p>
                        </div>

                        <div className="space-y-1.5">
                          <p className="font-bold text-[10px] text-slate-800 border-b">Chemical Specification Metrics:</p>
                          <div className="grid grid-cols-1 gap-1 font-mono text-[9px]">
                            <div className="flex justify-between"><span>Purity (GC-MS Assay):</span> <span className="font-bold text-emerald-700">{viewingPdfCoa.purity || '99.8%'}</span></div>
                            <div className="flex justify-between"><span>Residual Solvents:</span> <span className="text-indigo-700">&lt; 10 ppm (PASS)</span></div>
                            <div className="flex justify-between"><span>Appearance (25°C):</span> <span className="font-bold text-slate-700">{viewingPdfCoa.appearance || 'Clear liquid'}</span></div>
                            <div className="flex justify-between"><span>Odor Profile:</span> <span className="italic text-neutral-600">{viewingPdfCoa.odor || 'Conforming profile'}</span></div>
                            <div className="flex justify-between"><span>Heavy Metals Limit:</span> <span className="text-emerald-700">Not Detected (PASS)</span></div>
                          </div>
                        </div>

                        {/* GC-MS Simulated peaks */}
                        <div className="space-y-1 bg-zinc-50 p-2 rounded border">
                          <span className="text-[8px] uppercase font-bold text-neutral-400 block font-mono">SIMULATED GC-MS CHROMATOGRAM PEAKS:</span>
                          <div className="h-11 flex items-end gap-1 font-mono text-[7px] text-neutral-400 pb-1 border-b border-l">
                            <div className="w-1.5 bg-neutral-300 h-1"></div>
                            <div className="w-1.5 bg-neutral-300 h-2"></div>
                            <div className="w-1.5 bg-neutral-400 h-1.5"></div>
                            <div className="w-1.5 bg-neutral-700 h-9" title="Main Fragrance Peak"></div>
                            <div className="w-1.5 bg-neutral-300 h-2"></div>
                            <div className="w-1.5 bg-neutral-300 h-1"></div>
                            <div className="w-1.5 bg-neutral-500 h-4"></div>
                            <div className="w-1.5 bg-neutral-300 h-2"></div>
                            <div className="w-1.5 bg-neutral-300 h-1"></div>
                          </div>
                          <span className="text-[7.5px] text-slate-400 italic block font-sans">Single prominent peak validates product structural consistency.</span>
                        </div>

                        <div className="pt-4 border-t border-dashed border-slate-300 flex justify-between items-center text-[7.5px] text-neutral-500">
                          <div>
                            <p className="border-b w-12 pb-0.5 border-slate-400"></p>
                            <span className="block mt-0.5">Checked (R&D)</span>
                          </div>
                          <div>
                            <p className="border-b w-12 pb-0.5 border-slate-400"></p>
                            <span className="block mt-0.5">Approved (QA)</span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1 font-bold rounded">GMP PASSED</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <button 
                          onClick={() => window.print()}
                          className="bg-neutral-800 hover:bg-neutral-700 leading-none text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 w-full cursor-pointer border border-neutral-700"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          พิมพ์ใบรับรอง COA ฉบับย่อนี้
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-72 flex flex-col items-center justify-center text-center text-zinc-500 text-xs p-4 border border-dashed border-neutral-800 rounded-2xl">
                      <FileCheck2 className="h-10 w-10 text-neutral-700 mb-2.5" />
                      <p className="font-bold text-neutral-400">ยังไม่ได้รับการสืบค้นสำเนา</p>
                      <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px]">คลิก "เรียกดู PDF จำลอง" ท้ายชื่อ COA แฟ้มประวัติ เพื่อจำลองหน้ากระดาษรับประกันจากห้องแล็บเมืองกลิ่นหอม</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 3: AUTOMATED GMP LOT NUMBER GENERATOR TOOL */}
            {gmpTab === 'lot_generator' && (
              <div className="max-w-3xl mx-auto bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-6">
                <div>
                  <h3 className="font-bold text-base text-[#1D1D1F] flex items-center gap-1.5">
                    <Cpu className="h-5 w-5 text-[#0071E3]" /> เครื่องคำนวณและออกรหัส Lot มาตรฐานสากล (GMP Lot Code Autogen Tool)
                  </h3>
                  <p className="text-xs text-[#86868B] mt-0.5">สร้างรหัสล็อตประวัติสืบย้อนกลับได้แบบสากล ครอบคลุมทั้งวัตถุดิบสารหอยนำเข้า และสินค้าบรรจุพร้อมสเปรย์</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Selector fields */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-[#E5E5EA] space-y-3">
                    <div>
                      <span className="font-bold block mb-1">1. เลือกประเภทการกุมล็อตสากล</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {setLotGenType('Raw Material'); setLotGenSelectedId('');}}
                          className={`flex-1 py-2 text-center rounded-xl font-bold border transition-all ${lotGenType === 'Raw Material' ? 'bg-[#1D1D1F] border-neutral-900 text-white shadow-xs' : 'bg-white border-[#E5E5EA] text-[#86868B] hover:text-slate-800'}`}
                        >
                          วัตถุดิบ / สารหอม (RM)
                        </button>
                        <button
                          type="button"
                          onClick={() => {setLotGenType('Finished Goods'); setLotGenSelectedId('');}}
                          className={`flex-1 py-2 text-center rounded-xl font-bold border transition-all ${lotGenType === 'Finished Goods' ? 'bg-[#1D1D1F] border-neutral-900 text-white shadow-xs' : 'bg-white border-[#E5E5EA] text-[#86868B] hover:text-slate-800'}`}
                        >
                          สินค้าสำเร็จรูป (FG)
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold block mb-1">
                        {lotGenType === 'Raw Material' ? '2. เลือกวัตถุดิบเคมีอ้างอิง' : '2. เลือกเคสล็อตจ๊อบลูกค้า'}
                      </span>
                      {lotGenType === 'Raw Material' ? (
                        <select
                          className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl outline-none"
                          value={lotGenSelectedId}
                          onChange={(e)=>setLotGenSelectedId(e.target.value)}
                        >
                          <option value="">-- เลือกสารนำเข้า --</option>
                          {(dbState.materials || []).filter((m:any)=>m.category==='Raw Material').map((m: any) => (
                            <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                          ))}
                        </select>
                      ) : (
                        <select
                          className="w-full p-2.5 bg-white border border-[#E5E5EA] rounded-xl outline-none"
                          value={selectedJobId}
                          onChange={(e)=>setSelectedJobId(e.target.value)}
                        >
                          <option value="">-- เลือกจ๊อบและรหัสลูกค้า --</option>
                          {(dbState.salesJobs || []).map((j: any) => (
                            <option key={j.id} value={j.id}>จ๊อบ {j.jobCode} - {j.customerCode}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-bold block mb-0.5">3. วันที่ตรวจสอบ</span>
                        <input 
                          type="date"
                          className="w-full p-2 bg-white rounded-xl border font-mono"
                          value={lotGenDate}
                          onChange={(e)=>setLotGenDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="font-bold block mb-0.5">4. ลำดับผลิตต่อวัน (Run no)</span>
                        <input 
                          type="number"
                          className="w-full p-2 bg-white rounded-xl border text-center font-mono font-bold"
                          value={lotGenSequence}
                          onChange={(e)=>setLotGenSequence(Math.max(1, Number(e.target.value)))}
                          min={1}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateLot}
                      className="w-full bg-[#0071E3] hover:bg-[#147ce5] text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-xs mt-1"
                    >
                      ⚡ ออกรหัสคีย์ และ ล็อครหัส GMP
                    </button>
                  </div>

                  {/* Calculated Display details */}
                  <div className="p-5 bg-neutral-900 text-neutral-300 rounded-2xl border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#0071E3] font-mono block mb-1">Calculated GMP Lot Code:</span>
                      
                      {generatedLotResult ? (
                        <div className="space-y-4">
                          <div className="bg-black/40 text-emerald-400 font-mono text-center py-3.5 px-2 rounded-xl text-md font-bold tracking-wider border border-emerald-500/30">
                            {generatedLotResult}
                          </div>

                          <div className="space-y-2 text-[11px] font-sans">
                            <span className="font-bold text-white block">โครงสร้าง Traceability เชิงวิเคราะห์:</span>
                            <ul className="space-y-1.5 text-neutral-400 pl-1">
                              <li>• <code>LOT</code>: รหัสนโยบายสัญญานำเข้า/ส่งออกสากล GMP</li>
                              {lotGenType === 'Raw Material' ? (
                                <>
                                  <li>• <code>RM</code>: Raw Material วัตถุดิบต้นน้ำจากพรรณไม้หรอมเกรดทดสอบ</li>
                                  <li>• <code>{generatedLotResult.split('-')[2] || 'Prefix'}</code>: เมล็ดพันธุ์หรือรหัสพัสดุย่อย</li>
                                  <li>• <code>{generatedLotResult.split('-')[3] || 'Date'}</code>: สตาร์ตวัดวันประเมินจริง 8 หลัก (YMD)</li>
                                </>
                              ) : (
                                <>
                                  <li>• <code>FG</code>: Finished Goods ผลิตภัณฑ์น้ำหอมพร้อมใช้ตัดบรรจุขอบแก้ว</li>
                                  <li>• <code>{generatedLotResult.split('-')[2] || 'Cust'}</code>: เลขรหัสลูกค้าฝ่ายขายสืบค้นประวัติพิมพ์</li>
                                  <li>• <code>{generatedLotResult.split('-')[3] || 'Job'}</code>: รุ่นจัดจ้างผสมน้ำหอมในระบบ CRM</li>
                                </>
                              )}
                              <li>• <code>{generatedLotResult.split('-')?.pop()}</code>: ลำดับการรันผลิตที่ {lotGenSequence} ป้องกันความสับสน</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-10 text-neutral-500">
                          <p className="font-mono text-xs">ระบุปัจจัยทางเลือกซ้ายมือ และกดเพื่อแปลงรหัสตามระเบียบ</p>
                        </div>
                      )}
                    </div>

                    {generatedLotResult && (
                      <div className="pt-4 border-t border-neutral-800 flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedLotResult);
                            onNotify('คัดลอกรหัส Lot บอร์ดประวัติสำเร็จ', 'info');
                          }}
                          className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] py-1.5 rounded-lg border border-neutral-700 font-bold"
                        >
                          📋 คัดลอกรหัสล็อต
                        </button>
                        <button
                          onClick={() => {
                            if (lotGenType === 'Raw Material') {
                              setNewReceiptGmp({...newReceiptGmp, lotNumber: generatedLotResult, coaLotNumber: generatedLotResult});
                              setGmpTab('gmp_receiving');
                              onNotify('โอนย้ายรหัสล็อตไปยังช่องบันทึกรับเข้าพัสดุเรียบร้อย', 'info');
                            } else {
                              setPackagingLogs({...packagingLogs, orderDate: lotGenDate, stockCountSlipNo: 'FG-' + generatedLotResult});
                              setActiveSegment('packaging');
                              onNotify('โอนย้ายรหัสล็อตไปยังใบบรรจุ 4 หน้าสำเร็จ', 'info');
                            }
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] py-1.5 rounded-lg font-bold"
                        >
                          ➕ ส่งชื่อออกบันทึก
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 4: GMP GOODS RECEIVING FORM */}
            {gmpTab === 'gmp_receiving' && (
              <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-xs space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                    <ClipboardCheck className="h-4.5 w-4.5 text-[#34C759]" /> บันทึกตรวจรับวัตถุดิบเคมีภัณฑ์สอดคล้องมาตรฐาน GMP
                  </h3>
                  <p className="text-[11px] text-[#86868B] mt-0.5">ระบบจะตัดประเมิน และ นำเสนอความคุ้มครองทางกฎหมายและระเบียบมาตรฐานวิสาหกิจ</p>
                </div>

                <form onSubmit={handleReceiveGoodsGmp} className="space-y-4 text-xs text-slate-700">
                  <div>
                    <label className="block font-bold mb-1">เลือกสารสกัดที่รับเข้าคลัง</label>
                    <select
                      className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                      value={newReceiptGmp.materialId}
                      onChange={(e)=>setNewReceiptGmp({...newReceiptGmp, materialId: e.target.value})}
                      required
                    >
                      <option value="">-- เลือกรายการเคมีภัณฑ์ --</option>
                      {(dbState.materials || []).filter((m: any)=>m.category === 'Raw Material').map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">ระบุ Lot ซัพพลายเออร์</label>
                      <input 
                        type="text"
                        className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none font-mono font-bold uppercase"
                        value={newReceiptGmp.lotNumber}
                        onChange={(e)=>setNewReceiptGmp({...newReceiptGmp, lotNumber: e.target.value})}
                        placeholder="LOT-RM-ROSE-2026..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">ระบุ Lot เอกสาร COA</label>
                      <input 
                        type="text"
                        className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                        value={newReceiptGmp.coaLotNumber}
                        onChange={(e)=>setNewReceiptGmp({...newReceiptGmp, coaLotNumber: e.target.value})}
                        placeholder="เหมือน Lot พัสดุ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">ปริมาณที่รับเข้า (ลิตร/กก.)</label>
                      <input 
                        type="number"
                        className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none"
                        value={newReceiptGmp.quantityReceived}
                        onChange={(e)=>setNewReceiptGmp({...newReceiptGmp, quantityReceived: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">วันที่หมดอายุกำหนด</label>
                      <input 
                        type="date"
                        className="w-full p-2.5 bg-neutral-50 rounded-lg border border-[#E5E5EA] focus:bg-white outline-none font-mono"
                        value={newReceiptGmp.expiryDate}
                        onChange={(e)=>setNewReceiptGmp({...newReceiptGmp, expiryDate: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Checklist items representing GMP audits */}
                  <div className="p-3.5 bg-neutral-50 rounded-2xl border border-[#E5E5EA] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ด่านทดสอบความสะอาด GMP:</span>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newReceiptGmp.gmpCheckWeight}
                        onChange={(e)=>setNewReceiptGmp({...newReceiptGmp, gmpCheckWeight: e.target.checked})}
                        className="w-3.5 h-3.5"
                      />
                      <span>น้ำหนักสุทธิสอดคล้องใบส่งสินค้า</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newReceiptGmp.gmpCheckPack}
                        onChange={(e)=>setNewReceiptGmp({...newReceiptGmp, gmpCheckPack: e.target.checked})}
                        className="w-3.5 h-3.5"
                      />
                      <span>ถังบรรจุสะอาด ไร้รอยรั่วซึม ปิดผนึก</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newReceiptGmp.gmpCheckClean}
                        onChange={(e)=>setNewReceiptGmp({...newReceiptGmp, gmpCheckClean: e.target.checked})}
                        className="w-3.5 h-3.5"
                      />
                      <span>วัตถุกรองสะอาด ไม่ปนเปื้อนฝุ่นดิน</span>
                    </label>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#1D1D1F] hover:bg-neutral-800 text-white font-bold py-3 rounded-xl mt-2 transition-colors cursor-pointer"
                  >
                    🚀 บันทึกตรวจรับเข้าคงคลังอัปเดตยอดเรียลไทม์
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* SECTION 5: APPSHEET INTEGRATION DESK & MIGRATION STRATEGY */}
        {activeSegment === 'appsheet-sync' && (
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-sm space-y-6 animate-fade-in text-slate-700">
            
            <div className="flex items-center gap-3 border-b pb-4">
              <div className="p-3 bg-indigo-100 text-indigo-800 rounded-2xl">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1D1D1F]">สะพานเชื่อมเชื่อมโยง AppSheet &amp; ข้อมูลกุญแจหลักโรงงาน</h3>
                <p className="text-xs text-[#86868B]">คู่มือยกระดับจัดแจงข้อมูลและการเชื่อม API/Spreadsheets แบบคู่ขนานไม่ต้องปิดระบบงานเดิม</p>
              </div>
            </div>

            {/* Direct advice showing how to run AppSheet in parallel */}
            <div className="space-y-4 text-xs">
              
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                <span className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                  🛡️ ข้อพึงปฏิบัติเพื่อรักษาประวัติข้อมูลไม่ให้หยุดชะงัก (AppSheet Sync Strategy)
                </span>
                <p className="leading-relaxed">
                  ทางโรงงานยังสามารถเก็บสัญญาภาระงาน เอกสารลูกค้า และ COAs บนฐานข้อมูล<strong> Google Drive &amp; AppSheet </strong> เดิมได้ ผ่านขั้นตอนดังนี้:
                </p>
                <ul className="list-decimal list-inside space-y-1.5 text-slate-800 pl-1 font-sans">
                  <li>
                    <strong>ใช้ Google Shared Drive ร่วมกัน</strong>: ให้โฟลเดอร์รหัสลูกค้า (`CUS-2026-###`) ใน AppSheet ตั้งอยู่อย่างอัตโนมัติบน Google Drive ที่ระบบนี้สืบและพิมพ์ใบเช็คสต็อกได้
                  </li>
                  <li>
                    <strong>ส่ง Webhooks จากสะพานนี้</strong>: ทุกครั้งที่มีการบันทึกตรวจรับผลิตภัณฑ์ GMP หรือ COA ใหม่ ระบบนี้จะยิง API ยิงฐาน Google Sheet รองรับ AppSheet ทันที!
                  </li>
                  <li>
                    <strong>ฐานข้อมูล Drizzle/Postgres</strong>: ขยายการเชื่อมโยง Cloud SQL ที่จัดหาร่วมกันสู่ Google Sheets ได้แบบเรียลไทม์
                  </li>
                </ul>
              </div>

              {/* Live Webhook testing simulator */}
              <div className="bg-[#F5F5F7] p-5 rounded-2xl border border-[#E5E5EA] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">เครื่องมือทดสอบส่ง Webhook สัญญาณเพื่ออัปเดต AppSheet</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${syncStatus === 'Success' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-500'}`}>
                    STATUS: {syncStatus}
                  </span>
                </div>

                <div className="p-3 bg-[#1D1D1F] text-white font-mono text-[11px] rounded-xl max-h-44 overflow-y-auto space-y-1">
                  {syncLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">{log}</div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleTriggerAppSheetSync}
                    className="bg-[#0071E3] hover:bg-[#147ce5] text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    ลิ้งค์เริ่มซิงค์ไป AppSheet ทันที
                  </button>
                  <button 
                    onClick={() => {
                      setSyncLogs([`[${new Date().toLocaleTimeString()}] เคลียร์ระบบล็อกจำลองเรียบร้อย`]);
                      setSyncStatus('Idle');
                    }}
                    className="border border-[#E5E5EA] bg-white hover:bg-neutral-100 text-slate-800 text-xs font-semibold py-2 px-3 rounded-xl"
                  >
                    รีเซ็ตสัญญาณ
                  </button>
                </div>
              </div>

              {/* Sample Webhook JSON payload display */}
              <div className="p-4 border rounded-2xl space-y-2">
                <span className="font-bold text-slate-800">รหัสต้นแบบ API payload สำหรับนำไปเชื่อม AppSheet Autopilot Webhook</span>
                <p className="text-slate-500">คุณสามารถเปิดใช้งานฟีเจอร์ Webhook ในพาร์ทความรับผิดชอบของ AppSheet และนำรหัส JSON นี้ไปปะติด:</p>
                <pre className="p-3 bg-neutral-900 text-white rounded-xl font-mono text-[10px] overflow-x-auto">
{`{
  "Action": "Add",
  "Properties": {
    "Locale": "th-TH"
  },
  "Rows": [
    {
      "JobCode": "${currentJob?.jobCode || '#05002'}",
      "CustomerID": "${currentJob?.customerCode || 'CUS-2026-001'}",
      "MaterialLot": "LOT-ROSE-202605",
      "COALink": "${currentJob?.driveLink || 'https://drive.google.com/...'}",
      "VerifiedGMP": "Passed",
      "TimeStamp": "2026-06-10"
    }
  ]
}`}
                </pre>
              </div>

            </div>

          </div>
        )}

      </div>


      {/* PRINT DIALOG OVERLAY (TEMPORARY HIGH CONTRAST IMMERSIVE PRINT MODE DESIGNED TO FIT SEAMLESS WITH INJECTED ID ATTRIBUTES FOR TARGETED PRINTING) */}
      {printDocType && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 overflow-y-auto p-4 md:p-12 flex flex-col items-center">
          
          {/* Print menu control header bar */}
          <div className="w-full max-w-4xl bg-neutral-100 p-4 border border-[#E5E5EA] rounded-2xl flex justify-between items-center mb-6 no-print">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#86868B]">เอกสารแบบฟอร์มตรวจสอบ</span>
              <h3 className="font-bold text-xs text-slate-800 mt-0.5">
                ตัวอย่างก่อนพิมพ์จริง: {printDocType === 'BPR' ? 'ใบสั่งผลิต (BPR Master)' : printDocType === 'STOCK_CHECK' ? 'ใบตรวจสอบพัสดุ (Stock Check Sheet)' : 'เอกสารบันทึกหน้าด่าน'}
              </h3>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="bg-[#34C759] hover:bg-[#2cb24f] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                สั่งพิมพ์ / บันทึก PDF
              </button>
              <button 
                onClick={() => setPrintDocType(null)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl"
              >
                ปิดตัวอย่างพิมพ์
              </button>
            </div>
          </div>

          <div className="w-full max-w-4xl bg-neutral-100 p-4 border border-[#E5E5EA] rounded-2xl flex justify-between items-center mb-6 no-print">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#86868B]">เอกสารแบบฟอร์มตรวจสอบควบคุมมาตรฐาน GMP</span>
              <h3 className="font-bold text-xs text-slate-800 mt-0.5">
                ตัวอย่างก่อนพิมพ์: {printDocType === 'BMR' ? 'บันทึกการผลิตสูตรเคมี (BMR Master)' : printDocType === 'BPR' ? 'ใบควบคุมล็อตบรรจุภัณฑ์ (BPR Master)' : printDocType === 'STOCK_CHECK' ? 'ใบเช็คพัสดุสต็อก' : 'เอกสารบันทึกหน้าด่าน'}
              </h3>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="bg-[#34C759] hover:bg-[#2cb24f] text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                สั่งพิมพ์ / บันทึก PDF
              </button>
              <button 
                onClick={() => setPrintDocType(null)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl"
              >
                ปิดตัวอย่างพิมพ์
              </button>
            </div>
          </div>

          {/* PRINT SHEETS CONTAINER SPECIFIC STYLES */}
          <div 
            className="w-full max-w-4xl bg-white p-8 md:p-12 border border-slate-300 rounded-lg shadow-sm print:shadow-none font-sans text-slate-900" 
            id="gmp-printable-sheet"
          >
            
            {/* DOCUMENT 1: BMR Master Batch Manufacturing Record Sheet */}
            {printDocType === 'BMR' && (
              <div className="space-y-6">
                <div className="border-4 border-double border-slate-800 p-5 text-center">
                  <h1 className="font-bold text-xl uppercase tracking-wider text-slate-950">ใบบันทึกกระบวนการผลิตเคมีหอม (Batch Manufacturing Record - BMR)</h1>
                  <p className="text-xs font-mono text-slate-500 mt-1">คุมมาตรฐาน GMP ฝ่ายเคมี R&D | เอกสารเลขที่: BMR-JOB-{currentJob?.jobCode || '#05002'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border border-slate-800 p-3 bg-neutral-50/50 rounded-lg">
                  <div>
                    <p><strong>ชื่อผลิตภัณฑ์เคมี:</strong> {currentProduct?.name || 'หัวน้ำหอมสูตรเข้มข้น'}</p>
                    <p><strong>รหัสจ๊อบผลิตขาย:</strong> {currentJob?.jobCode || '#05002'}</p>
                    <p><strong>รหัสลูกค้าจ๊อบ:</strong> {currentJob?.customerCode || 'CUS-2026-###'}</p>
                    <p><strong>ขนาดรุ่นการผลิต (Batch Size):</strong> 1,200 ลิตร</p>
                  </div>
                  <div>
                    <p><strong>สูตรควบคุม (Formula Ref):</strong> {currentFormula?.version || 'V2.1 Master'}</p>
                    <p><strong>สถานที่ผลิต:</strong> แผนกผลิตปรุงสารหอม ห้องปลอดเชื้อโซน C</p>
                    <p><strong>วันที่เปิดกระบวนการชั่งผสม:</strong> {new Date().toLocaleDateString('th-TH')}</p>
                    <p><strong>ผู้คุมรุ่นการผลิต (QA Lead):</strong> นายวิศรุต ดนัยเกียรติ</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xs uppercase text-slate-900 mb-2 border-b border-slate-800 pb-1">ขั้นตอนที่ 1: บันทึกข้อมูลการจัดสรรวัตถุดิบชั่งตวง (Ingredient Dispensing Record)</h3>
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-neutral-100 border-b border-slate-800 text-left font-bold text-[11px]">
                          <th className="p-2 border-r border-slate-800">รหัสสารพัสดุ</th>
                          <th className="p-2 border-r border-slate-800">ชื่อรายการสารหอมสากล</th>
                          <th className="p-2 border-r border-slate-800 text-right">น้ำหนักคำนวณชั่งจริง</th>
                          <th className="p-2 border-r border-slate-800 text-center">รหัสล็อตสารเบิก</th>
                          <th className="p-2 text-center">ผู้ชั่งจริง/พยาน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formulaDetails.filter((fDet: any) => fDet.category === 'Raw Material').map((fDet: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-800">
                            <td className="p-2 border-r border-slate-800 font-mono font-bold">{fDet.code}</td>
                            <td className="p-2 border-r border-slate-800">{fDet.name}</td>
                            <td className="p-2 border-r border-slate-800 text-right font-mono font-bold text-slate-800">{fDet.amountNeeded?.toLocaleString()} {fDet.unit}</td>
                            <td className="p-2 border-r border-slate-800 font-mono text-center text-slate-500">LOT-{fDet.code?.slice(-4)}-2026</td>
                            <td className="p-2 text-center font-mono text-[10px] text-neutral-400">________ / ________</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase text-slate-900 mb-1 border-b border-slate-800 pb-1">ขั้นตอนที่ 2: บันทึกพารามิเตอร์การกวนตรวจสอบกายภาพ (Blending Process Control Logs)</h3>
                  <div className="border border-slate-800 p-3 rounded-lg text-xs space-y-2">
                    <p className="font-bold text-[11px] text-[#1D1D1F]">โปรดทำเครื่องหมายถูก [✓] และกรอกรายละเอียดหลังสิ้นสุดการตรวจวัด:</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /> <span>ตรวจสอบความสะอาดถังผสมกวนไร้คราบตกค้าง</span></label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /> <span>ความเร็วรอบมอเตอร์กวนตรงตามมาตรฐาน (450 RPM)</span></label>
                        <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-3.5 h-3.5" /> <span>ควบคุมอุณหภูมิตลอดกระบวนการต่ำกว่า 18°C</span></label>
                      </div>
                      <div className="space-y-1 text-slate-600 font-mono text-[11px] bg-neutral-100 p-2.5 rounded border">
                        <p>ดัชนีตรวจวัดสารผสมหลังหมักบ่ม:</p>
                        <p>• ค่าความสอดคล้องกลิ่น (Odor Index): [✓] ผ่านเกณฑ์</p>
                        <p>• ดัชนีความหนาแน่นสถิต (Density Spec): 0.892 g/cm³</p>
                        <p>• ลักษณะทางกายภาพ (Appearance): เหลวใส ไม่มีเศษตะกอน</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-6 text-xs text-center border-t border-dashed border-slate-400">
                  <div>
                    <p className="border-b border-slate-500 w-44 mx-auto pb-1"></p>
                    <p className="mt-2 text-slate-700 font-semibold">ผู้เตรียมชั่งและดำเนินการผสม</p>
                    <p className="text-[10px] mt-0.5 font-mono">วันที่ _____/_____/_________</p>
                  </div>
                  <div>
                    <p className="border-b border-slate-500 w-44 mx-auto pb-1"></p>
                    <p className="mt-2 text-slate-700 font-semibold">ผู้ควบคุมกระบวนการผลิต (Supervisor)</p>
                    <p className="text-[10px] mt-0.5 font-mono">วันที่ _____/_____/_________</p>
                  </div>
                  <div>
                    <p className="border-b border-slate-500 w-44 mx-auto pb-1"></p>
                    <p className="mt-2 text-slate-700 font-semibold">ผู้รับรองมาตรฐานคุณภาพ (QA Director)</p>
                    <p className="text-[10px] mt-0.5 font-mono">วันที่ _____/_____/_________</p>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT 1.5: BPR Master Batch Packaging Record Sheet */}
            {printDocType === 'BPR' && (
              <div className="space-y-6">
                <div className="border-4 border-double border-slate-800 p-4 text-center">
                  <h1 className="font-bold text-xl uppercase tracking-wider">ใบสั่งผลิตและควบคุมล็อตบรรจุภัณฑ์ (BPR Master)</h1>
                  <p className="text-xs font-mono text-slate-500 mt-1">รหัสเอกสารอ้างอิง: BPR-JOB-{currentJob?.jobCode || '#05002'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p><strong>ชื่อลูกค้า:</strong> {dbState.customers?.find((c: any)=>c.id === currentJob?.customerId)?.name || 'ทั่วไป'}</p>
                    <p><strong>รหัสลูกค้า:</strong> {currentJob?.customerCode || 'CUS-2026-NEW'}</p>
                    <p><strong>รหัสผลิตสั่งงาน:</strong> {currentJob?.jobCode || '#05002'}</p>
                  </div>
                  <div>
                    <p><strong>ประเภทสินค้า:</strong> {currentProduct?.category}</p>
                    <p><strong>SKU บันทึก:</strong> {currentProduct?.sku}</p>
                    <p><strong>สูตรผสมน้ำหอมที่ได้รับอนุมัติ:</strong> {currentFormula?.version}</p>
                  </div>
                </div>

                <div className="border border-slate-800 rounded mt-4">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-slate-800 text-left font-bold">
                        <th className="p-2 border-r border-slate-800">รหัสสารพัสดุ</th>
                        <th className="p-2 border-r border-slate-800">ชื่อรายการผสม</th>
                        <th className="p-2 border-r border-slate-800 text-right">ปริมาณต้องการชั่งเบิก</th>
                        <th className="p-2 text-right">แผนล็อตเบิก FIFOคลัง</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formulaDetails.map((fDet: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-700">
                          <td className="p-2 border-r border-slate-700 font-mono">{fDet.code}</td>
                          <td className="p-2 border-r border-slate-700">{fDet.name}</td>
                          <td className="p-2 border-r border-slate-700 text-right">{fDet.amountNeeded?.toLocaleString()} {fDet.unit}</td>
                          <td className="p-2 text-right font-mono">LOT-{fDet.code?.slice(-3)}-2026-X</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-12 text-xs">
                  <div className="text-center">
                    <p className="border-b border-slate-500 w-48 mx-auto pb-1"></p>
                    <p className="mt-2 text-slate-500">ผู้ดำเนินการควบคุมการเบิกปรุง</p>
                    <p className="text-[10px] mt-1 font-mono">วันที่ _____/_____/_________</p>
                  </div>
                  <div className="text-center">
                    <p className="border-b border-slate-500 w-48 mx-auto pb-1"></p>
                    <p className="mt-2 text-slate-500">เจ้าหน้าที่ประกันฝ่ายวิเคาระห์/QC</p>
                    <p className="text-[10px] mt-1 font-mono">วันที่ _____/_____/_________</p>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT 2: STOCK CHECK SHEET with green/red indicator for printing */}
            {printDocType === 'STOCK_CHECK' && (
              <div className="space-y-6">
                <div className="border-b-2 border-slate-800 pb-4 text-center">
                  <h1 className="font-bold text-lg">เอกสารรายงานความต้องการวัตถุดิบและเช็คสต็อก</h1>
                  <p className="text-xs text-slate-500 mt-1">สอดคล้องตามมาตรฐานคลังจ๊อบหลักรหัสสั่งงาน {currentJob?.jobCode}</p>
                </div>

                <div className="p-3 bg-neutral-100 rounded-xl space-y-1 text-xs">
                  <p>ลูกค้าหลัก: <strong>{dbState.customers?.find((c: any)=>c.id === currentJob?.customerId)?.name}</strong></p>
                  <p>ไดร์ฟบันทึกสัญญาจัดเก็บ: <code>{currentJob?.driveLink}</code></p>
                </div>

                <div className="space-y-4">
                  {formulaDetails.map((fDet: any, idx: number) => (
                    <div key={idx} className="border border-slate-400 p-3 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <strong className="text-sm block">{fDet.name}</strong>
                        <span className="font-mono text-slate-500">BOM Code: {fDet.code}</span>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-mono">สต็อกคลังเหลือ: {fDet.stock?.toLocaleString()} {fDet.unit}</p>
                        <p className="font-mono">ต้องการเบิก: {fDet.amountNeeded?.toLocaleString()} {fDet.unit}</p>
                        
                        {fDet.isSufficient ? (
                          <span className="text-xs font-bold text-green-600 block mt-1"> เพียงพอผลิตคลังคงเลือ</span>
                        ) : (
                          <span className="text-xs font-bold text-red-600 block mt-1"> ขาดสต็อก: ขาดแคลน {fDet.shortage?.toLocaleString()} {fDet.unit}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-slate-500 text-center pt-8 border-t border-dashed">
                  * เอกสารนี้จัดทำตามเวลากรณีตรวจสอบ: {new Date().toLocaleString()} โรงกรองน้ำหอมระดับวิสาหกิจแบบรวมศูนย์
                </p>
              </div>
            )}

            {/* DOCUMENT 3: WEIGH SHEET */}
            {printDocType === 'WEIGH_SHEET' && (
              <div className="space-y-6">
                <div className="text-center border-b-2 border-slate-800 pb-3">
                  <h1 className="font-bold text-base">ใบบันทึกการชั่งวัตถุดิบควบคุมสัญญาสากล</h1>
                  <p className="text-[11px] font-mono mt-1 text-slate-500">JOB Ref: {currentJob?.jobCode} | สูตร: {currentFormula?.version}</p>
                </div>

                <div className="border border-slate-800 rounded">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-slate-800 text-left font-bold">
                        <th className="p-2 border-r border-slate-800">รายการเคมีภัณฑ์</th>
                        <th className="p-2 border-r border-slate-800 text-right">น้ำหนักเป้าหมาย</th>
                        <th className="p-2 border-r border-slate-800 text-right">ชั่งจริง</th>
                        <th className="p-2 text-center">ลายเซ็นพนักงาน</th>
                        <th className="p-2 text-center">ลายเซ็น QC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formulaDetails.filter((fDet: any) => fDet.category === 'Raw Material').map((fDet: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-700 h-10">
                          <td className="p-2 border-r border-slate-700 font-bold">{fDet.name}</td>
                          <td className="p-2 border-r border-slate-700 text-right font-mono">{fDet.amountNeeded?.toLocaleString()} ลิตร/กก.</td>
                          <td className="p-2 border-r border-slate-700 text-right font-mono">___________</td>
                          <td className="p-2 border-r border-slate-700 text-center">___________</td>
                          <td className="p-2 text-center">___________</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-slate-300 text-[11px] space-y-1 leading-relaxed">
                  <p><strong>กฎเหล็กความปลอดภัย:</strong> พนักงานผู้ปรุงผสมต้องสวมหน้ากากกรองสารเคมี และบันทึกหมายเลข LOT วัตถุดิบลงฉลากทุกครั้ง</p>
                  <p><strong>ตรวจรับ GMP:</strong> น้ำหอมกลิ่น {currentProduct?.name} ต้องกรองตะกอนด้วยเครื่องแยกก่อนเตรียมเสร็จสิ้น</p>
                </div>
              </div>
            )}

            {/* DOCUMENT 4: WEIGH LABELS */}
            {printDocType === 'LABELS' && (
              <div className="grid grid-cols-2 gap-6">
                {formulaDetails.map((fDet: any, idx: number) => (
                  <div key={idx} className="border-4 border-black p-4 rounded-lg space-y-2 text-xs font-mono text-black">
                    <div className="border-b-2 border-black pb-1.5 flex justify-between items-center">
                      <strong className="text-[13px] uppercase">ฉลากชั่งวัตถุดิบ (BPR Label)</strong>
                      <span className="text-[9px] bg-black text-white px-1 py-0.5 rounded">GMP</span>
                    </div>

                    <p className="text-[11px] font-bold truncate">สาร: {fDet.name}</p>
                    <p>รหัสสินค้า: {fDet.code}</p>
                    <p>น้ำหนักเบิก: <strong>{fDet.amountNeeded?.toLocaleString()} {fDet.unit}</strong></p>
                    <p>ล็อตเบิก: <code>LOT-{fDet.code?.slice(-3)}-2026-FIFO</code></p>
                    
                    <div className="pt-2 border-t border-[#E5E5EA] flex justify-between text-[8px] italic">
                      <span>ผู้ชั่ง: _________________</span>
                      <span>ผู้ตรวจ: _________________</span>
                    </div>

                    <div className="pt-1.5 text-center text-[10px] tracking-widest font-bold">
                      || |||| | ||||| | ||| |||| |
                      <p className="text-[8px] tracking-normal font-mono font-medium text-slate-500 mt-1">BATCH REF: {currentJob?.jobCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DOCUMENT 5: PACKAGING FOUR PAGES COMPLETE BOOKLET PRINT */}
            {printDocType === 'PACKAGING_FOUR_PAGES' && (
              <div className="space-y-12">
                
                {/* Visual Page 1 */}
                <div className="space-y-4 border-b pb-8">
                  <div className="text-center border-b pb-2">
                    <span className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider block">สมุดใบบรรจุภัณฑ์ (BPR Packaging Booklet) - หน้าที่ 1</span>
                    <h2 className="font-bold text-lg text-black mt-1">ใบสั่งผลิตและบรรจุหีบห่อ</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <p>รหัสใบผลิต: <strong>{currentJob?.jobCode}</strong></p>
                      <p>เป้าหมายหีบห่อ: <strong>{packagingLogs.qtyTarget?.toLocaleString()} SKU</strong></p>
                    </div>
                    <div>
                      <p>ผู้คำนวณสั่งจ่าย: <strong>{packagingLogs.inspector}</strong></p>
                      <p>วันที่ออกคำสั่ง: <strong>{packagingLogs.orderDate}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Visual Page 2 */}
                <div className="space-y-4 border-b pb-8">
                  <div className="text-center border-b pb-2">
                    <span className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider block">สมุดใบบรรจุภัณฑ์ (BPR Packaging Booklet) - หน้าที่ 2</span>
                    <h2 className="font-bold text-lg text-black mt-1">ใบบันทึกระยะขั้นตอนการบรรจุ</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <p>เวลาเริ่มงานบรรจุ: <strong>{packagingLogs.startTime}</strong></p>
                      <p>เวลาเสร็จสิ้นขั้นตอน: <strong>{packagingLogs.endTime}</strong></p>
                    </div>
                    <div>
                      <p>จำนวนบรรจุจริง: <strong>{packagingLogs.actualPacked?.toLocaleString()} ขวด</strong></p>
                      <p>จำนวนคัดทิ้งชำรุด: <strong className="text-red-600">{packagingLogs.defectQty?.toLocaleString()} ชิ้น/ขวด</strong></p>
                    </div>
                  </div>
                </div>

                {/* Visual Page 3 */}
                <div className="space-y-4 border-b pb-8">
                  <div className="text-center border-b pb-2">
                    <span className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider block">สมุดใบบรรจุภัณฑ์ (BPR Packaging Booklet) - หน้าที่ 3</span>
                    <h2 className="font-bold text-lg text-black mt-1">ใบรับรองการควบคุมความเรียบร้อย (QC Control)</h2>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <p>● ความแน่นหนาของหัวเกลียวสเปรย์: <strong>{packagingLogs.sealPassed ? 'ผ่านเกณฑ์ตรวจสอบแน่นหนา (PASSED)' : 'ไม่ผ่าน'}</strong></p>
                    <p>● ปริมาตรบรรจุน้ำหอมสุทธิ 100ml: <strong>{packagingLogs.volumePassed ? 'ถูกต้องสม่ำเสมอ (PASSED)' : 'ไม่ผ่าน'}</strong></p>
                    <p>● บาร์โค้ดสติกเกอร์ฉลาก: <strong>{packagingLogs.labelPassed ? 'ติดแกนตรงตามระเบียบคมชัด (PASSED)' : 'ไม่ผ่าน'}</strong></p>
                    <p className="mt-4">ลงชื่อผู้ตรวจสอบ QC: <strong>{packagingLogs.qcInspector}</strong></p>
                  </div>
                </div>

                {/* Visual Page 4 */}
                <div className="space-y-4">
                  <div className="text-center border-b pb-2">
                    <span className="font-bold text-sm text-[#1D1D1F] uppercase tracking-wider block">สมุดใบบรรจุภัณฑ์ (BPR Packaging Booklet) - หน้าที่ 4</span>
                    <h2 className="font-bold text-lg text-black mt-1">ใบคืนเศษวัสดุ &amp; รหัสจัดส่งคลังสำเร็จรูป</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <p>คืนกล่องฟอยล์ทองพรีเมียม: <strong>{packagingLogs.cartonReturned} กล่อง</strong></p>
                      <p>คืนหัวพลาสติกสเปรย์: <strong>{packagingLogs.nozzlesReturned} ชิ้น</strong></p>
                    </div>
                    <div>
                      <p>เศษซากขวดแก้วชำรุด: <strong>{packagingLogs.scrapsScrap} ซาก</strong></p>
                      <p>เจ้าหน้าที่ผู้ลงคะแนนคลัง: <strong>{packagingLogs.countInspector}</strong></p>
                    </div>
                  </div>
                  <div className="pt-4 text-center font-bold font-mono text-sm border-t border-black">
                    รหัสใบนับพัสดุรับเข้าคงเหลือ: {packagingLogs.stockCountSlipNo}
                  </div>
                </div>

              </div>
            )}

            {/* DOCUMENT 6: WAREHOUSE COUNT SLIP */}
            {printDocType === 'STOCK_COUNT_SLIP' && (
              <div className="space-y-6">
                <div className="border-4 border-black p-4 text-center">
                  <h1 className="font-bold text-lg uppercase tracking-wider">ใบนับพัสดุและส่งยอดสินค้าตัวสำเร็จ (Warehouse count slip)</h1>
                  <p className="text-xs font-mono mt-1">SLIP NO: {packagingLogs.stockCountSlipNo}</p>
                </div>

                <div className="p-3 bg-neutral-100 rounded-xl space-y-1.5 text-xs font-mono">
                  <p>อ้างอิงรหัสใบผลิต: <strong>{currentJob?.jobCode}</strong></p>
                  <p>ผู้ควบคุมตรวจบรรจุ: <strong>{packagingLogs.countInspector}</strong></p>
                  <p>รวดเร็วส่งมอบยอดคลัง: <strong>{packagingLogs.actualPacked?.toLocaleString()} ขวด</strong></p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  แผนกคลังสินค้าขอดำเนินการบวกเพิ่มยอดสต็อก <strong>{packagingLogs.actualPacked?.toLocaleString()} ขวด</strong> เข้าตารางบัญชี SKU รหัส <code>{currentProduct?.sku}</code> และยกยอดเศษวัสดุกลับคืนสู่คลังพัสดุเรียบร้อย
                </p>

                <div className="grid grid-cols-2 gap-8 pt-20 text-xs">
                  <span className="text-center border-t pt-2">ลงชื่อ พนักงานมอบรับงาน</span>
                  <span className="text-center border-t pt-2">ลงชื่อ หัวหน้าแผนกควบคุมคลังและกระจาย</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
