import React, { useState } from 'react';
import { 
  ShieldCheck, Beaker, FileText, ClipboardList, TrendingUp, Compass, 
  Settings2, ShoppingBag, Eye, HelpCircle, ArrowRight, Zap, RefreshCw, 
  Trash2, Plus, CheckCircle2, Factory, Trash, AlertCircle, Info, Thermometer,
  Layers, ChevronDown, CheckSquare, Search, Truck, ShieldAlert, Award,
  Users, Network, Flame, Shuffle, Activity, Sliders, Briefcase, ChevronRight, HelpCircle as HelpIcon
} from 'lucide-react';

interface GMPHubProps {
  dbState: any;
  onRefresh: () => void;
  onNotify: (msg: string, type?: 'info' | 'warning' | 'error') => void;
  userRole: string;
}

export default function GMPHubOS({ dbState, onRefresh, onNotify, userRole }: GMPHubProps) {
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'flow' | 'checker' | 'trace'>('flow');

  // INTERACTIVE STATES FOR THE 18 GMP SECTIONS

  // 1. Business Planning
  const [prodType, setProdType] = useState('น้ำหอม');
  const [dailyCapacity, setDailyCapacity] = useState(10000);
  const [capexBudget, setCapexBudget] = useState(5000000);
  const [opexBudget, setOpexBudget] = useState(1200000);

  // 2. Factory Layout (13 Zones)
  const [checkedAreas, setCheckedAreas] = useState<string[]>([
    'รับวัตถุดิบ', 'คลังวัตถุดิบ', 'ห้องชั่งวัตถุดิบ', 'ห้องผลิต', 'ห้องบรรจุ', 'คลังสินค้าสำเร็จรูป', 'ห้อง QC', 'ห้อง R&D'
  ]);

  // 3. R&D Lab Tests Simulation
  const [stabilityTestResult, setStabilityTestResult] = useState<string>('ยังไม่ได้ทดสอบ');
  const [compatibilityStatus, setCompatibilityStatus] = useState<string>('ยังไม่ได้ตรวจเก็บบรรจุภัณฑ์');
  const [durabilityDays, setDurabilityDays] = useState<number>(180);
  const [isIncubating, setIsIncubating] = useState<boolean>(false);

  // 4. Procurement & Approved Suppliers list
  const [approvedSuppliers, setApprovedSuppliers] = useState([
    { id: 'S1', name: 'Global Aroma Chem Ltd.', cert: 'ASEAN GMP / HL-15', rating: 'A+', type: 'วัตถุดิบหลัก / Active Ingredients' },
    { id: 'S2', name: 'Nature Essence Botanical', cert: 'USDA Organic / ISO 22716', rating: 'A', type: 'สมุนไพรสกัด / Essential Oils' },
    { id: 'S3', name: 'Siam Glass Bottle & Cap', cert: 'ISO 9001 / Heavy Metal Pass', rating: 'A', type: 'แก้วบรรจุภัณฑ์ / Primary Pack' },
    { id: 'S4', name: 'Thai Box printing Co.', cert: 'ISO 14001', rating: 'B', type: 'กล่องนอก / Outer Cartoning' },
  ]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierType, setNewSupplierType] = useState('วัตถุดิบหลัก / Active Ingredients');
  const [newSupplierRating, setNewSupplierRating] = useState('A');

  // 5. Raw Material Warehouse status
  const [rmBatches, setRmBatches] = useState([
    { id: 'RM-LOT-A01', name: 'Absolute Rose Extract (Premium Grade)', status: 'Quarantine', qcCheck: 'กำลังสุ่มวิเคราะห์', timestamp: '2026-06-08 09:15' },
    { id: 'RM-LOT-B02', name: 'Premium Ethanol (99.9% Deodorized)', status: 'Approved', qcCheck: 'ติตตราปล่อยผ่านเรียบร้อย', timestamp: '2026-06-07 14:20' },
    { id: 'RM-LOT-C03', name: 'Centella Asiatica Water Extract', status: 'Approved', qcCheck: 'ผลลัพธ์ผ่านความชื้น', timestamp: '2026-06-06 11:10' },
    { id: 'RM-LOT-D04', name: 'Synthetic Musk Concentrated', status: 'Rejected', qcCheck: 'พบสารปนเปื้อนเกินมาตรฐานกำจัด', timestamp: '2026-06-05 16:30' },
  ]);

  // 6. Manufacturing steps progress & homogenizer simulation
  const [mixPhase, setMixPhase] = useState<number>(0);
  const [mixRunning, setMixRunning] = useState(false);
  const [mixerTemp, setMixerTemp] = useState(25);
  const [mixerSpeed, setMixerSpeed] = useState(0);

  const mixSteps = [
    '6.1 ชั่งวัตถุดิบ: ตรวจเช็คหมายเลข Batch & Lot ถ้วนหน้า (Double Check สี่ตา)',
    '6.2 เติมมวลน้ำบริสุทธิ์ RO และสารทำละลายลงในหม้อผสมสุญญากาศ',
    '6.3 ให้ความร้อน: สั่งการบอยเลอร์ไอน้ำดันอุณหภูมิควบคุมขึ้นสู่ระดับ 75 องศาเซลเซียส',
    '6.4 ผสม Oil Phase: ปล่อยสิริมวลสารไขและ Emulsifier ผสมกาวเนื้อนวล',
    '6.5 โฮโมจีไนเซชัน (Homogenize): สับมีดบิดรอบปั่นแรงดันสูง 3,500 รอบ/นาที',
    '6.6 ระบบลดอุณหภูมิ (Cooling Phase): ไหลวนน้ำหล่อเย็นลดเหลือย่านความปลอดภัย 32 องศา',
    '6.7 ชาร์จสารแพง: เติมน้ำหอม Fragrance สารสกัดถนอมผิว และกักกันพักเนื้อรอส่งเข้าบรรจุ'
  ];

  // 7. QC Lab Parameters
  const [qcState, setQcState] = useState({
    pH: 6.2,
    viscosity: 15.5,
    microbialCount: 0,
    heavyMetals: 'Negative',
    appearanceCheck: 'ถูกต้องสมบูรณ์'
  });

  // 8. QA Quality Documents Configuration
  const [qaApprovals, setQaApprovals] = useState({
    sopApproved: true,
    wiActive: true,
    batchRecordLogged: true,
    deviationCleared: true,
    capaClosed: true,
    riskAssessmentPass: true
  });

  // 9. Packaging machine controls
  const [packSpeed, setPackSpeed] = useState(45); // bottles per minute
  const [lastBottleWeight, setLastBottleWeight] = useState(50.2); // target is 50.0g
  const [isSealHeated, setIsSealHeated] = useState(true);

  // 10. Traceability Search Lot
  const [searchLotCode, setSearchLotCode] = useState('LOT-FG24001');
  const [traceResult, setTraceResult] = useState<any>({
    lot: 'LOT-FG24001',
    product: 'เซรั่มฟื้นฟูผิว Rose-Au-Gold Extreme Serum (50ml)',
    status: 'อนุมัติจำหน่ายจำเพาะ (Released by QA)',
    operator: 'วิศวกรผสม ชาญชัย ลพประสิทธิ์ (Batch Operator ID: EMP-104)',
    machine: 'Vacuum Emulsifier Tank Mixer VM-02 (Validated)',
    dateProduced: '2026-06-03 10:45',
    packaging: {
      bottleLot: 'BOTTLE-AMBER-50G7',
      supplier: 'Siam Glass Bottle & Cap Co.',
      receivedDate: '2026-05-20'
    },
    rawMaterials: [
      { name: 'Active Absolute Rose Extract 99%', lot: 'RM-LOT-A01', supplier: 'Global Aroma Chem Ltd.', qc: 'ตรวจผ่านโลหะหนัก' },
      { name: 'Deodorized Perfumer Denatured Alcohol', lot: 'RM-LOT-B02', supplier: 'Nature Essence Botanical', qc: 'วิเคราะห์กลิ่นสุญญากาศผ่าน' },
      { name: 'Centella Pure Organic Hydrosol', lot: 'RM-LOT-C03', supplier: 'Global Aroma Chem Ltd.', qc: 'สุ่มตรวจเชื้อจุลินทรีย์เป็นศูนย์ Pass' }
    ]
  });

  // 11. Finished Goods Warehouse (FEFO/FIFO queue)
  const [dispatchQueue, setDispatchQueue] = useState([
    { id: 'FG-LOT-101', name: 'Rose-Au-Gold Serum (LOT A)', expiryDate: '2027-12-30', qty: 1200, dispatchMethod: 'FEFOคัดคิวต้นสุดก่อน' },
    { id: 'FG-LOT-102', name: 'Rose-Au-Gold Serum (LOT B)', expiryDate: '2028-02-15', qty: 2500, dispatchMethod: 'FIFOคัดคิวถัดไป' },
    { id: 'FG-LOT-103', name: 'Extreme Hair Elixir 100ml', expiryDate: '2027-10-10', qty: 850, dispatchMethod: 'FEFOคัดออกเร็วกว่าเนื่องจากวันเสื่อมเร็วกว่า' },
  ]);

  // 12. Utilities parameters
  const [waterResistivity, setWaterResistivity] = useState(18.2); // GOAL: >15 MΩ-cm
  const [hvacAirChanges, setHvacAirChanges] = useState(25); // GOAL: 20-30 ACH
  const [diffPressure, setDiffPressure] = useState(15.2); // GOAL: 10-20 Pascals
  const [hepaFilterHealth, setHpaFilterHealth] = useState(96); // GOAL: >80%

  // 13. Environment Waste Treatment
  const [treatedWaterPH, setTreatedWaterPH] = useState(7.4);
  const [bodChemicalLevel, setBodChemicalLevel] = useState(12); // mg/L, Goal: <20 mg/L
  const [wasteWeightPlastic, setWasteWeightPlastic] = useState(45.5); // kg
  const [wasteWeightChemical, setWasteWeightChemical] = useState(12.4); // kg

  // 14. Safety Controls
  const [safetyLog, setSafetyLog] = useState<string[]>([
    'ระบายอากาศสารเคมีในระดับปกติ (0.01 ppm)',
    'ระบบขัดอัคคีภัย Fire Suppression สแตนด์บายเรียบร้อย',
    'พนักงานสวมชุดคลุมหัวและหน้ากากถนอมผิวผ่านประตูตรวจเช็ค'
  ]);
  const [alarmActive, setAlarmActive] = useState<boolean>(false);

  // 15. ERP/MES Active Systems
  const [erpBrand, setErpBrand] = useState('SAP S/4HANA (Standard ERP Cloud)');
  const [mesOeeTarget, setMesOeeTarget] = useState(88.4);

  // 16. Document Master directory
  const [docDirectory, setDocDirectory] = useState([
    { code: 'QM-001', name: 'Quality Manual แผนแม่บทคุณภาพโรงงาน (Ed. 5)', author: 'QA Director', version: 'v5.2' },
    { code: 'SOP-PRO-012', name: 'มาตรฐานปฏิบัติงานล้างหัวฉีดหม้อบรรจุครีมสูญญากาศ', author: 'Production Mgr', version: 'v2.0' },
    { code: 'BMR-ROSE-G01', name: 'Batch Manufacturing Record (BMR) สูตร Rose-Au-Gold', author: 'R&D Lead', version: 'v1.4' },
    { code: 'CAL-M-401', name: 'ใบรับรองการสอบเทียบอุณหภูมิเซ็นเซอร์หม้อผสม Homogenizer', author: 'Eng Lead', version: 'v2026-Q2' },
  ]);

  // 17. Personnel list structure
  const [organizationalChart, setOrganizationalChart] = useState([
    { role: 'Plant Director', name: 'ดร. กิตติพัฒน์ มั่งคั่ง', budgetLimit: 'สูงสุดไม่จำกัด', focus: 'บริหารภาพรวมโรงงานและมาตรฐานสูงสุด' },
    { role: 'Production Manager', name: 'คุณ เกรียงศักดิ์ สมบูรณ์', budgetLimit: '5,000,000 ฿', focus: 'ควบคุมไลน์กวนผสม ไลน์แบ่งบรรจุ และการคิดคำนวณ OEE' },
    { role: 'QA Manager', name: 'ภญ. จุฑารัตน์ มิตรดี', budgetLimit: '2,000,000 ฿', focus: 'อนุมัติเอกสาร BMR ออกใบรับเกรด QA Release ตรวจสอบ Deviation' },
    { role: 'QC Manager', name: 'ดร. สุขสันต์ แก้ววิจิตร', budgetLimit: '1,500,000 ฿', focus: 'ทดสอบทางจุลชีววิทยา วัดความเป็นกรดด่าง ตรวจวัดสารปนเปื้อน' },
    { role: 'R&D Manager', name: 'คุณ พิชลดา วงศ์สุวรรณ', budgetLimit: '2,500,000 ฿', focus: 'วิจัยความคงตัวของเครื่องหอม ตรวจสอบความเข้ากันได้ของพลาสติก' },
    { role: 'Warehouse Manager', name: 'คุณ สมภพ เด่นชัย', budgetLimit: '1,000,000 ฿', focus: 'จัดคิว FEFO ตรวจรับคุมสต็อกวัตถุดิบกักกัน (Quarantine)' },
    { role: 'Engineering Manager', name: 'คุณ อภิชาต เหล็กกล้า', budgetLimit: '3,000,000 ฿', focus: 'บำรุงรักษาน้ำ RO แผ่นกรองอากาศ HEPA ตู้ความดัน HVAC' },
    { role: 'EHS Manager', name: 'คุณ วิรุฬห์ ป้องกันภัย', budgetLimit: '800,000 ฿', focus: 'คุมมาตรวัดความปลอดภัย ระบบอัคคีภัย คัดกรองของเสียอุตสาหกรรม' }
  ]);

  // 18. Manufacturing status flow (End-To-End)
  const [currentGlobalStep, setCurrentGlobalStep] = useState<number>(3); // currently at "คลังวัตถุดิบจัดจ่าย"
  const e2eSteps = [
    { label: 'Supplier ส่งเคมีภัณฑ์', desc: 'ออกใบ COA ยืนยันสสารหอม' },
    { label: 'รับวัตถุดิบและคัดกักกัน', desc: 'Quarantine เช็คน้ำหนักสุทธิตู้เก็บ' },
    { label: 'QC Lab ตรวจสอบพอร์ต', desc: 'ลงประชามติกวาดตรวจหาเชื้อจุลชีวา' },
    { label: 'คลังจัดเก็บและอนุมัติปล่อยผลิต', desc: 'ติดตราเขียวป้าย APPROVED พร้อมเรียกตั๋วผลิต' },
    { label: 'ชั่งแบ่งสสารดับเบิ้ลเช็ค', desc: 'ชั่งสี่ตาผู้ควบคุมคุมเครื่องชั่งละเอียด' },
    { label: 'กวนสับปั่น Homogenizer', desc: 'ปั่นรอบความเร็วสูงคุมอุณหภูมิความร้อนไอน้ำ' },
    { label: 'สายพานบรรจุหลอดและซีลฝา', desc: 'สเกลวัดปริมาตรเหนี่ยวนำความร้อนฟอยล์ปากขวด' },
    { label: 'QA Release ตรวจเอกสาร BMR', desc: 'ตรวจสอบย้อนกลับและอนุมัติจัดเตรียมปล่อยจำหน่าย' },
    { label: 'จัดส่งพอร์ตสินค้าถึงมือลูกค้า', desc: 'คัดคิวด้วย FIFO และ FEFO ผ่านระบบบาร์โค้ด QR' }
  ];


  // HANDLERS FOR ACTIONS

  const performTrace = () => {
    if (searchLotCode.trim() === '') {
      onNotify('กรุณากรอกรหัสตรวจสอบย้อนกลับ', 'warning');
      return;
    }

    if (searchLotCode.toUpperCase().includes('LOT-FG24001') || searchLotCode.toUpperCase().includes('24001')) {
      setTraceResult({
        lot: 'LOT-FG24001',
        product: 'เซรั่มฟื้นฟูผิว Rose-Au-Gold Extreme Serum (50ml)',
        status: 'อนุมัติจำหน่ายจำเพาะ (Released by QA)',
        operator: 'วิศวกรผสม ชาญชัย ลพประสิทธิ์ (Batch Operator ID: EMP-104)',
        machine: 'Vacuum Emulsifier Tank Mixer VM-02 (Validated)',
        dateProduced: '2026-06-03 10:45',
        packaging: {
          bottleLot: 'BOTTLE-AMBER-50G7',
          supplier: 'Siam Glass Bottle & Cap Co.',
          receivedDate: '2026-05-20'
        },
        rawMaterials: [
          { name: 'Active Absolute Rose Extract 99%', lot: 'RM-LOT-A01', supplier: 'Global Aroma Chem Ltd.', qc: 'ตรวจผ่านโลหะหนัก' },
          { name: 'Deodorized Perfumer Denatured Alcohol', lot: 'RM-LOT-B02', supplier: 'Nature Essence Botanical', qc: 'วิเคราะห์กลิ่นสุญญากาศผ่าน' },
          { name: 'Centella Pure Organic Hydrosol', lot: 'RM-LOT-C03', supplier: 'Global Aroma Chem Ltd.', qc: 'สุ่มตรวจเชื้อจุลินทรีย์เป็นศูนย์ Pass' }
        ]
      });
    } else {
      // Dynamic fallback generator
      setTraceResult({
        lot: searchLotCode.toUpperCase().trim(),
        product: 'ผลิตภัณฑ์คัสตอมน้ำหอมปรุงสด Custom Perfume Premium (75ml)',
        status: 'รอดำเนินการตรวจสอบใบควบคุม BMR',
        operator: 'ผู้ควบคุมประจำศูนย์ ชาตรี วาทศิลป์ (ID: EMP-009)',
        machine: 'Batch Mixer Tank MX-15 (Standard Version)',
        dateProduced: '2026-06-08 08:30',
        packaging: {
          bottleLot: 'BOTTLE-CLEAR-Q10',
          supplier: 'Siam Glass Bottle & Cap Co.',
          receivedDate: '2026-05-28'
        },
        rawMaterials: [
          { name: 'หัวน้ำหอมและหัวกลิ่นอโรมาติก', lot: 'RM-LOT-' + Math.floor(Math.random() * 900 + 100), supplier: 'Global Aroma Chem Ltd.', qc: 'ตรวจผ่านเปรียบเทียบกลิ่น' },
          { name: 'ตัวทำละลายเวชสำอาง', lot: 'RM-LOT-' + Math.floor(Math.random() * 900 + 100), supplier: 'Chemical Solvent Plus', qc: 'ผ่านสัมพัทธ์ความบริสุทธิ์' }
        ]
      });
    }
    onNotify('ค้นพบล็อตข้อมูลตรวจสอบย้อนกลับในสัญญากริดเรียบร้อย!', 'info');
  };

  const runStabilitySimulation = () => {
    if (isIncubating) return;
    setIsIncubating(true);
    setStabilityTestResult('กำลังบ่มเร่งอายุในอุณหภูมิทดสออง (45°C) สลับเย็นจัด (4°C)...');
    onNotify('R&D ตู้อบเริ่มตรวจอายุและเสถียรភាពสารผสมเครื่องหอม...', 'info');

    setTimeout(() => {
      setIsIncubating(false);
      setStabilityTestResult('ตรวจผ่านมีเสถียรภาพถาวรรุ่นอายุ 2 ปีโดยไม่เหม็นหืนและตกตะกอน (PASSED)');
      setCompatibilityStatus('สารเนื้อครีมไม่มีปฏิกิริยากับผิวพลาสติกขวดโพลีเอทิลีน (Safe)');
      onNotify('ใบรายงานผลการทดลองวิจัยสสาร R&D คลอดแล้ว: สมบูรณ์ 100%!', 'info');
    }, 2500);
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    const newSupp = {
      id: 'S' + (approvedSuppliers.length + 1),
      name: newSupplierName,
      cert: 'ISO 9001 / ASEAN Cosmetic Verified',
      rating: newSupplierRating,
      type: newSupplierType
    };
    setApprovedSuppliers([...approvedSuppliers, newSupp]);
    setNewSupplierName('');
    onNotify(`ขึ้นทะเบียนประวัติพัสดุคู่ค้า: ${newSupplierName} เข้าสู่ Whitelist สำเร็จ`, 'info');
  };

  const toggleArea = (area: string) => {
    if (checkedAreas.includes(area)) {
      setCheckedAreas(checkedAreas.filter(a => a !== area));
    } else {
      setCheckedAreas([...checkedAreas, area]);
    }
  };

  const handleUpdateBatchStatus = (id: string, newStatus: 'Quarantine' | 'Approved' | 'Rejected', comment: string) => {
    setRmBatches(rmBatches.map(b => b.id === id ? { ...b, status: newStatus, qcCheck: comment } : b));
    onNotify(`ย้ายสถานะถังเก็บวัตถุดิบ ${id} เป็น [${newStatus}] ทางคลังวัตถุดิบเรียบร้อย`, 'info');
  };

  const startMixerSimulation = () => {
    if (mixRunning) return;
    setMixRunning(true);
    setMixPhase(0);
    setMixerSpeed(1500);
    setMixerTemp(45);
    onNotify('สั่งสตาร์ทใบพัด Vacuum Emulsifier + บอยเลอร์ทำละลาย!', 'info');

    const interval = setInterval(() => {
      setMixPhase((prev) => {
        if (prev >= mixSteps.length - 1) {
          clearInterval(interval);
          setMixRunning(false);
          setMixerSpeed(0);
          setMixerTemp(32);
          onNotify('ปั่นสารกลั่นผสมโฮโมจิไนเซชันสมบูรณ์แบบ ได้ Bulk รอแบ่งถ่ายขวด!', 'info');
          return prev;
        }
        
        // Adjust speed/temp depending on phase
        if (prev === 2) {
          setMixerTemp(75);
          setMixerSpeed(600);
        } else if (prev === 4) {
          setMixerSpeed(3500);
          setMixerTemp(72);
        } else if (prev === 5) {
          setMixerSpeed(400);
          setMixerTemp(32);
        }

        return prev + 1;
      });
    }, 2000);
  };

  const triggerFactoryAlarm = () => {
    if (alarmActive) {
      setAlarmActive(false);
      onNotify('ยกเลิกโหมดเตือนภัยโรงงานและคืนสู่ระบบความปลอดภัยปกติ', 'info');
    } else {
      setAlarmActive(true);
      onNotify('🚨 สัญญาณอพยพเกิดขัดข้องฉุกเฉิน! บันทึกระบบประคองอัติโนมัติปิดวาล์วเคมี', 'error');
    }
  };

  // 18-Point Comprehensive GMP Blueprint Definition
  const gmpSections = [
    { id: 1, title: '1. การวางแผนธุรกิจ', desc: 'Business Planning & Market Budget', badge: 'วางแผนมิติ' },
    { id: 2, title: '2. ผังโรงงานหลัก 13 โซน', desc: '13 Core Zones Facility Layout Design', badge: 'พิมพ์เขียวโซน' },
    { id: 3, title: '3. ระบบพัฒนาสูตร R&D', desc: 'Stability, Compatibility & Scale-up Validation', badge: 'สูตรและวิจัย' },
    { id: 4, title: '4. ระบบจัดซื้อและคู่ค้า', desc: 'Approved Suppliers, Whitelists & Auditing', badge: 'การค้าจัดซื้อ' },
    { id: 5, title: '5. ระบบคลังวัตถุดิบ', desc: 'Quarantine -> QA Check -> Approved Flow', badge: 'คลังสารดิบ' },
    { id: 6, title: '6. ระบบผลิต (ผสมแฮนด์แมด)', desc: 'Weighing, Charging & Mixer Homogenizer', badge: 'ใบเรือผลิต' },
    { id: 7, title: '7. ระบบตรวจสอบคุณภาพ QC', desc: 'Incoming, In-process & Finished Product Checks', badge: 'ตรวจคุณภาพ' },
    { id: 8, title: '8. ระบบประกันคุณภาพ QA', desc: 'SOPs, WI, Change Controls & ISO Compliance', badge: 'มาตรฐานกวาดล้าง' },
    { id: 9, title: '9. ไลน์บรรจุความเที่ยงตรง', desc: 'Filling target weights & Packaging capping seal', badge: 'จัดห่อแพ็คขวด' },
    { id: 10, title: '10. ระบบแทร็กย้อนกลับ', desc: 'Finished SKUs down to Raw Materials genealogy', badge: 'การแทร็กข้อมูล' },
    { id: 11, title: '11. คลังสำเร็จรูป WMS', desc: 'FEFO/FIFO Barcode and Rack distribution controls', badge: 'จัดเก็บสเกล' },
    { id: 12, title: '12. วิศวกรรม & Utility', desc: 'Purified RO-Water, Clean HVAC & HEPA Filter Pressure', badge: 'วิศวกรรมสะอาด' },
    { id: 13, title: '13. มิตรภาวะสิ่งแวดล้อม', desc: 'Wastewater Equalization treat & solid waste sort', badge: 'ของเสียคัดทิ้ง' },
    { id: 14, title: '14. ความปลอดภัย HSE', desc: 'PPE checkers, emergency drills & fire alarms', badge: 'ความปลอดภัยภัย' },
    { id: 15, title: '15. เชื่อม ERP & MES', desc: 'SAP net worth entries & factory OEE machines', badge: 'ระบบสมอง' },
    { id: 16, title: '16. ระบบเอกสาร GMP', desc: 'QM Master SOP database, batch records & calibration', badge: 'งานลงบันทึก' },
    { id: 17, title: '17. โครงสร้างบุคลากรเสาหลัก', desc: 'Plant organization directorship, roles and salary limits', badge: 'ผังกำลังพนักงาน' },
    { id: 18, title: '18. ผลลัพธ์เดินสายครบวงจร', desc: ' supplier to delivery full step flow indicators', badge: 'แผนภาพความก้าว' }
  ];

  return (
    <div className="space-y-6" id="gmp-os-root">
      
      {/* Intro header with GMP status check card */}
      <div className="bg-white p-6 rounded-3xl border border-indigo-150 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden" id="gmp-hdr-card">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-75"></div>
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 px-3 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="h-4 w-4" /> ระบบคุมมาตรฐานอุตสาหกรรม
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1 rounded-xl border border-emerald-100 uppercase tracking-wider">Cosmetics GMP / ISO 22716</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-sans text-slate-950 tracking-tight leading-snug">
            แผงควบคุมระบบคุมมาตรฐานเครื่องสำอาง GMP และ ISO ครบวงจร
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            สแกนตรวจสอบจุดตรวจอุตสาหกรรมประชาราษฎร์เป้าหมาย <strong>18 จุดมาตรฐาน</strong> ของโรงงานเครื่องสำอางและหัวน้ำหอมระดับโลก
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto shrink-0 flex-wrap">
          <button 
            type="button" 
            onClick={() => setActiveTab('flow')}
            className={`flex-1 md:flex-none px-4 py-3 text-xs md:text-sm font-bold rounded-2xl transition-all cursor-pointer ${activeTab === 'flow' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            📋 มาตรฐาน 18 ส่วน
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('trace')}
            className={`flex-1 md:flex-none px-4 py-3 text-xs md:text-sm font-bold rounded-2xl transition-all cursor-pointer ${activeTab === 'trace' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-[1.02]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            🔍 บอร์ดสืบย้อนกลับ (Traceability)
          </button>
        </div>
      </div>

      {activeTab === 'flow' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Mobile/Tablet chapter selector dropdown */}
          <div className="lg:hidden w-full bg-white p-5 rounded-3xl border border-indigo-150 shadow-md space-y-3 mb-2" id="gmp-mobile-sel">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 font-sans">
              📍 เลือกจุดมาตรฐาน GMP 18 แผนกงานเป้าหมาย:
            </label>
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(Number(e.target.value))}
                className="w-full text-sm font-bold text-indigo-950 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-4 pr-10 appearance-none outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                {gmpSections.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title} — ({sec.badge})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-indigo-600">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-indigo-700 font-semibold pl-1">
              คำแนะนำ: คุณสามารถสืบค้นและเปลี่ยนสัดส่วนเพื่อคำนวณและรันกระบวนการจำลองได้ทันที
            </p>
          </div>

          {/* List of 18 GMP Chapters on the left (hidden on mobile, visible on lg screens) */}
          <div className="hidden lg:col-span-4 lg:block bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-1.5 max-h-[750px] overflow-y-auto" id="gmp-desktop-sidebar">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">
              จุดควบคุมมาตรฐานโรงงาน (18 GMP Points)
            </span>
            <div className="space-y-1">
              {gmpSections.map(sec => {
                const isActive = selectedSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSection(sec.id)}
                    type="button"
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-center justify-between border ${
                      isActive 
                        ? 'bg-indigo-900 border-indigo-950 text-white shadow-md shadow-indigo-950/15' 
                        : 'bg-white border-slate-100 text-slate-800 hover:bg-[#F5F5F7] border-b border-b-slate-100'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[80%]">
                      <p className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>{sec.title}</p>
                      <p className={`text-[10px] truncate ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{sec.desc}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {sec.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapters details and simulations workspace */}
          <div className="lg:col-span-8 space-y-6" id="gmp-workspace">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden min-h-[550px]">
              <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600"></div>
              
              {/* SECTION 1: BUSINESS PLAN */}
              {selectedSection === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">📈</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">1. การวางแผนธุรกิจอุตสาหกรรม (Business Planning)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">กวาดแผนพอร์ตโฟลิโอแบรนด์สินค้า ความเหมาะสมงบและกลุ่มเป้าหมาย</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">กำหนดประเภทผลิตภัณฑ์เป้าหมาย:</label>
                      <select 
                        value={prodType}
                        onChange={(e)=>setProdType(e.target.value)}
                        className="w-full text-xs md:text-sm p-3 border border-slate-300 rounded-2xl bg-slate-50 outline-none font-semibold text-slate-900 transition focus:border-indigo-500"
                      >
                        <option value="สกินแคร์">ครีมสกินแคร์ (Skincare Formula)</option>
                        <option value="เมคอัพ">เมคอัพและสีแก้ม (Makeup Decor)</option>
                        <option value="ผลิตภัณฑ์ดูแลเส้นผม">ผลิตภัณฑ์ดูแลเส้นผม (Hair Care)</option>
                        <option value="ผลิตภัณฑ์ดูแลร่างกาย">ดูแลผิวพรรณฟองฟู (Body Care)</option>
                        <option value="น้ำหอม">หัวน้ำหอมและเพอร์ฟูม (Fragrance/Parfum Ex)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">กำลังการผลิตโรงงานคาดหวัง (ชิ้น/วัน):</label>
                      <input 
                        type="number" 
                        value={dailyCapacity}
                        onChange={(e)=>setDailyCapacity(Number(e.target.value))}
                        className="w-full text-xs md:text-sm p-3 border border-slate-300 rounded-2xl bg-slate-50 outline-none font-mono font-bold text-slate-900 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">งบลงทุนเครื่องจักรและสเกลโรงงาน (CAPEX) (฿):</label>
                      <input 
                        type="number" 
                        value={capexBudget}
                        onChange={(e)=>setCapexBudget(Number(e.target.value))}
                        className="w-full text-xs md:text-sm p-3 border border-slate-300 rounded-2xl bg-slate-50 outline-none font-mono font-bold text-emerald-800 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">ต้นทุนดำเนินคลังคงที่และจ้างงาน (OPEX) (฿/เดือน):</label>
                      <input 
                        type="number" 
                        value={opexBudget}
                        onChange={(e)=>setOpexBudget(Number(e.target.value))}
                        className="w-full text-xs md:text-sm p-3 border border-slate-300 rounded-2xl bg-slate-50 outline-none font-mono font-bold text-indigo-900 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Market info box */}
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-150 space-y-2 mt-6">
                    <p className="font-extrabold text-indigo-950 text-xs md:text-sm">🎯 การวิเคราะห์ตลาดและคำนวณต้นทุนประเมิน:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-755 font-medium leading-relaxed">
                      <div>
                        <p>• ผลิตภัณฑ์: <strong className="text-indigo-900">{prodType}</strong></p>
                        <p>• อัตราผลิตรวม: <strong>{dailyCapacity.toLocaleString()} ชิ้น/วัน</strong> (ประมาณ {(dailyCapacity * 300).toLocaleString()} ชิ้นต่อปี)</p>
                        <p>• ดัชนีความเหมาะสม: ตลาดเป้าหมายพรีเมียม / มอยส์เจอไรเซอร์อ้างอิง</p>
                      </div>
                      <div className="md:text-right md:border-l md:border-indigo-150/40 md:pl-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">ต้นทุนผลิตแปรผันเป้าหมาย:</p>
                        <p className="text-xl font-mono font-black text-indigo-700">฿{(opexBudget / (dailyCapacity * 25)).toFixed(2)} / ชิ้น</p>
                        <p className="text-[10px] text-slate-500">คาดการณ์ระยะคุ้มทุน: ~24 เดือน</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: AREAS LAYOUT */}
              {selectedSection === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🏢</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">2. ผังโรงงานแบ่งแยกระเบียบความดัน (13 Core Zones layout)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">กักกั้นบริเวณอาคาร เพื่อป้องกันสสารกระจายปนเปื้อนข้าม (Cross Contamination)</p>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                    มาตรฐาน GMP และ ISO 22716 บังคับให้โครงสร้างโรงงานมีลักษณะ "Flow ทิศทางเดียว" (one-way flow) เพื่อไม่ให้อากาศและบุคลากรที่เป็นแหล่งปนเปื้อนย้อนกลับทางเดิม ติ๊กตรวจสอบบริเวณเพื่อบีบสัญญาณความดัน:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      '1. รับวัตถุดิบ (Receiving Area)',
                      '2. คลังวัตถุดิบ (Raw Material Warehouse)',
                      '3. ห้องชั่งวัตถุดิบ (Dispensing Room)',
                      '4. ห้องผลิตกวน (Manufacturing Area)',
                      '5. ห้องพักรอผลิตภัณฑ์กึ่งสำเร็จรูป (Bulk Holding)',
                      '6. ห้องบรรจุเครื่องสัมผัสสาร (Filling Area)',
                      '7. คลังสินค้าสำเร็จรูป (Finished Goods)',
                      '8. ห้องแล็บเคมี QC (Quality Control)',
                      '9. ห้องแล็บพัฒนารุ่น R&D (Research)',
                      '10. ห้องเก็บตัวอย่างคงสภาพ (Retention Sample)',
                      '11. ห้องล้างทำความสะอาดภาชนะปนเปื้อน',
                      '12. ห้องงานระบบเครื่องจักรกล (Utility area)',
                      '13. ห้องเปลี่ยนชุดพนักงานก่อนเข้า (Gown room)'
                    ].map((area) => {
                      const isChecked = checkedAreas.some(a => area.includes(a.split(' ')[0]));
                      return (
                        <button
                          key={area}
                          onClick={() => {
                            const short = area.split(' ')[1];
                            toggleArea(short);
                          }}
                          className={`p-3 md:p-3.5 rounded-2xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                            isChecked 
                              ? 'bg-indigo-50 border-indigo-250 text-indigo-905 shadow-sm' 
                              : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-extrabold ${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {isChecked ? '✓' : ''}
                          </span>
                          <span className="truncate">{area}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-neutral-90 bg-indigo-50/30 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-950">
                    <span>ความหนาแน่นผังจุดตรวจ:</span>
                    <strong className="font-bold text-indigo-700">{checkedAreas.length} / 13 โซนหลัก (สัญลักษณ์ความดันบวกเป็นลำดับ)</strong>
                  </div>
                </div>
              )}

              {/* SECTION 3: R&D */}
              {selectedSection === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🔬</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">3. วงรอบและระบบพัฒนาสูตร R&D (Vitals Lab Validation)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">การทำสูตรอัจฉริยะ, ทดสอบความเข้ากันและการประเมินเสถียรสารเครื่องหอม</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-55 bg-indigo-50/20 rounded-2xl border border-indigo-100 space-y-3">
                    <p className="text-xs md:text-sm font-extrabold text-indigo-950">💼 ระบบหน้าที่การตรวจวิจัยห้องปฏิบัติการ:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                      <div className="space-y-1">
                        <p className="font-bold text-indigo-900">ทดสอบเสถียรสาร (Stability Test):</p>
                        <p className="text-slate-500 font-medium leading-relaxed">
                          บ่มสลับอุณหภูมิร้อนเย็นกวาดล้าง 45 องศาเซลเซียสเพื่อประเมินอายุการคืนรูป และตรวจจับการสูญรูปเคมี
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-indigo-900">ความเข้ากันบรรจุภัณฑ์ (Compatibility Test):</p>
                        <p className="text-slate-500 font-medium leading-relaxed">
                          ตรวจสอบว่าเนื้อครีมหรือน้ำหอมไม่กัดกร่อนขวดพลาสติกหรือเกิดการรั่วไหลระหว่างการวางขาย
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs md:text-sm space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="font-bold text-slate-900">สถานะความคงตัวของเครื่องหอม:</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-xl font-bold font-mono">
                        {stabilityTestResult}
                      </span>
                    </div>

                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="font-bold text-slate-900">ผลทดสอบความขัดแย้งของหลอด/ขวดพลาสติก:</span>
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-xl font-bold">
                        {compatibilityStatus}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={runStabilitySimulation}
                        disabled={isIncubating}
                        className={`p-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ${
                          isIncubating 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isIncubating ? '⚙️ กำลังประเมินผลเคมี...' : '⚡ รันประมวลผล Stability & Capsule Lab'}
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-yellow-50/50 rounded-2xl border border-yellow-150 text-xs text-slate-655 leading-relaxed font-semibold">
                    🔑 <strong>ชุดเอกสารบังคับประกอบใบพอร์ตสูตร:</strong> <br />
                    1. Formula Master (ทะเบียนโครงสร้างสูตร) • 2. Manufacturing Procedure (เอกสารลงบิดเตรียมผสม) • 3. Product Specification (ค่าเกณฑ์ตรวจสอบฟิสิกส์เคมีชีวา)
                  </div>
                </div>
              )}

              {/* SECTION 4: PROCUREMENT SUPPLIER WHITE LIST */}
              {selectedSection === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🤝</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">4. ระบบจัดซื้อและประวัติตรวจประเมินคู่ค้า (Procurement Control)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">การคัดกรอง Approved Supplier List และการอนุมัติวัตถุดิบ Active / บรรจุภัณฑ์ขวด</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateSupplier} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-950">➕ ขึ้นทะเบียนประเมินประวัติรายส่งวัตถุดิบและกล่องสกรีนนอก:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <input 
                        type="text" 
                        placeholder="กรอกชื่อบริษัท เช่น Global Chem Premium..."
                        value={newSupplierName}
                        onChange={(e)=>setNewSupplierName(e.target.value)}
                        className="w-full text-xs p-3 border border-slate-305 rounded-xl bg-white outline-none focus:border-indigo-500 font-semibold text-slate-900"
                      />
                      <select
                        value={newSupplierType}
                        onChange={(e)=>setNewSupplierType(e.target.value)}
                        className="w-full text-xs p-3 border border-slate-305 rounded-xl bg-white focus:border-indigo-500 font-semibold text-slate-900"
                      >
                        <option value="วัตถุดิบหลัก / Active Ingredients">Active Ingredients (สารสกัด)</option>
                        <option value="Emulsifier & Surfactant">Emulsifier & Surfactant (สารขึ้นเนื้อกวน)</option>
                        <option value="บรรจุภัณฑ์แก้ว / Primary pack">Primary Glass Capsule (ขวดแก้วและขวดแก้วหล่อ)</option>
                        <option value="กล่องกระดาษนอก / Secondary Carton">Secondary Packaging (กล่องนอกและสีฟอยล์)</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center pt-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span>ผลลัพธ์จัดอันดับ (Rating):</span>
                        <select 
                          value={newSupplierRating} 
                          onChange={(e)=>setNewSupplierRating(e.target.value)}
                          className="p-1.5 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="A+">ระดับสูงมาก (A+)</option>
                          <option value="A">ระดับมาตรฐาน (A)</option>
                          <option value="B">ผ่านเกณฑ์ลดคะแนน (B)</option>
                        </select>
                      </div>
                      <button 
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        เพิ่ม Whitelist คลังซัพฯ
                      </button>
                    </div>
                  </form>

                  <div className="overflow-x-auto" id="gmp-purchase-table">
                    <table className="w-full text-left text-xs font-semibold text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-205 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2 pl-2">รหัส</th>
                          <th className="py-2">พันธมิตรผู้จัดจำหน่าย</th>
                          <th className="py-2">กลุ่มพัสดุ</th>
                          <th className="py-2">ใบรับรอง GMP</th>
                          <th className="py-2 text-center">ระดับเกรด</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {approvedSuppliers.map(sup => (
                          <tr key={sup.id} className="hover:bg-slate-50">
                            <td className="py-2.5 pl-2 font-mono text-slate-400">{sup.id}</td>
                            <td className="py-2.5 text-slate-900 font-extrabold">{sup.name}</td>
                            <td className="py-2.5 text-slate-500 font-medium">{sup.type}</td>
                            <td className="py-2.5 text-slate-500 text-[11px]">{sup.cert}</td>
                            <td className="py-2.5 text-center font-bold text-indigo-700">{sup.rating}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 5: WAREHOUSE FLOW PROCESS */}
              {selectedSection === 5 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">📍</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">5. โซนจัดเก็บคลังวัตถุดิบเคมีและสารตัวหอม (Quarantine Gate)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">ขั้นตอน: รับเข้าคลัง → กักสถานะ (Quarantine) → ตรวจ QC → ย้ายพอร์ต APPROVED เพื่อใช้ชั่ง</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50/70 p-4 border border-yellow-200.80 rounded-2xl text-xs text-yellow-950 font-semibold space-y-1.5 leading-relaxed">
                    <p className="font-extrabold text-xs">⚠️ กฎระเบียบความปลอดภัย Quarantine (สีเหลือง):</p>
                    <p>
                      ห้ามนำสารเคมีหรือสารสกัดที่เดินทางมาถึงโรงงานเข้าสู่กระบวนการผลิตกวนชั่งเด็ดขาด จนกว่าเภสัชกรเคมีจะติดป้ายสติกเกอร์ <strong className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">APPROVED (สีเขียว)</strong> หลังจากผ่านสเปกตรัมตรวจสอบจุลินทรีย์เสร็จเรียบร้อย
                    </p>
                  </div>

                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1 pt-2">ล็อตสารสกัดปัจจุบันใน คลังกักกัน / ควบคุมผ่าน:</p>
                  <div className="space-y-3">
                    {rmBatches.map(b => (
                      <div key={b.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="space-y-1 max-w-[70%]">
                          <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            b.status === 'Quarantine' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            b.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' :
                            'bg-rose-100 text-rose-800 border border-rose-220'
                          }`}>
                            {b.id} — {b.status}
                          </span>
                          <h4 className="font-bold text-xs md:text-sm text-slate-900">{b.name}</h4>
                          <p className="text-xs text-slate-400 font-medium">ความคืบหน้าเชิงเคมี: <strong className="text-slate-600">{b.qcCheck}</strong> • มาถึงเมื่อ: {b.timestamp}</p>
                        </div>

                        <div className="flex gap-2 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => handleUpdateBatchStatus(b.id, 'Approved', 'ตรวจผ่านค่าความบริสุทธิ์และโลหะหนักเรียบร้อย')}
                            className={`p-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              b.status === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            ✓ อนุมัติ (Pass)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateBatchStatus(b.id, 'Rejected', 'ไม่ผ่านเกณฑ์จุลินทรีย์และค่านอกกรดด่าง')}
                            className={`p-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              b.status === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                            }`}
                          >
                            ✕ คัดทิ้ง (Reject)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 6: WEIGHING & MIXING TANK */}
              {selectedSection === 6 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">⚙️</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">6. ไลน์ผลิต เตรียมกวนผสม และชั่งสารละเอียด (Manufacturing Area)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">ควบคุมใบพัด Vacuum Emulsifier, Mixing Tank และระบบอิมัลชันกวนความเร็วสูง</p>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-950 text-white rounded-3xl space-y-4 shadow-inner">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping"></span>
                        <span className="text-xs font-mono tracking-widest font-black uppercase text-indigo-300">VACUUM MIXER VM-02 CONSOLE</span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full font-mono ${mixRunning ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'}`}>
                        {mixRunning ? 'Mixing Active — ปั่นความหนืด' : 'Standby / Ideal'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center border-y border-indigo-900 py-3.5">
                      <div className="bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-900">
                        <p className="text-[10px] text-indigo-300 font-bold uppercase font-sans">ความร้อนถังผสม</p>
                        <p className="text-xl font-mono font-black text-indigo-100">{mixerTemp}°C</p>
                      </div>
                      <div className="bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-900">
                        <p className="text-[10px] text-indigo-300 font-bold uppercase font-sans">รอบมีดบิดไฮสปีด</p>
                        <p className="text-xl font-mono font-black text-indigo-100">{mixerSpeed} RPM</p>
                      </div>
                      <div className="col-span-2 md:col-span-1 bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-900 flex flex-col justify-center">
                        <p className="text-[10px] text-indigo-300 font-bold uppercase font-sans">ความดันสุญญากาศ</p>
                        <p className="text-lg font-mono font-extrabold text-emerald-400">-0.08 MPa</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-indigo-200">
                        <span>ความคืบหน้าของเฟสผสมเครื่องสำอาง:</span>
                        <span>{mixPhase + 1} / {mixSteps.length} ขั้นตอนชุดสมบูรณ์</span>
                      </div>
                      <div className="h-2.5 w-full bg-indigo-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-400 via-indigo-400 to-pink-500 transition-all duration-300"
                          style={{ width: `${((mixPhase + 1) / mixSteps.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-xs bg-indigo-900/50 p-3.5 rounded-xl border border-indigo-800 text-slate-200 font-semibold leading-relaxed">
                      คำแนะนำปัจจุบัน: <strong className="text-white">{mixSteps[mixPhase]}</strong>
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={startMixerSimulation}
                        disabled={mixRunning}
                        className={`p-3.5 px-6 rounded-2xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                          mixRunning 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                        }`}
                      >
                        <Activity className="h-4 w-4" /> {mixRunning ? 'กำลังคำนวณการหมุนรอบ...' : '⚡ สั่งเดินเครื่องเตรียม Homogenizer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: QUALITY CONTROL (QC) */}
              {selectedSection === 7 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🔬</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">7. ระบบควบคุมคุณภาพและทดสอบสารปนเปื้อน (QC Lab Center)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">ตรวจสอบสมบัติทางเคมี ฟิสิกส์ และตรวจหาจุลวิทยาเชื้อซ้ำซ้อน</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold leading-relaxed">
                    <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1">🟢 1. Incoming QC</p>
                      <p className="text-slate-500">ตรวจสอบความบริสุทธิ์ของเม็ดพลาสติกและสารทำละลาย และเปรียบเทียบมาตรฐาน COA</p>
                    </div>
                    <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1">🔵 2. In-process QC</p>
                      <p className="text-slate-500">สุ่มวัดตรวจ pH ระหว่างปั่น ตรวจสี ตรวจกลิ่นของอิมัลชันในถังก่อนปล่อยพัก</p>
                    </div>
                    <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1">🟣 3. Finished Goods QC</p>
                      <p className="text-slate-500">ดึงสุ่มเช็คหาปริมาณโลหะหนัก (Heavy Metals) และปัดเชื้อจุลชีวาเป่าลมก่อนปิดบรรจุภัณฑ์</p>
                    </div>
                  </div>

                  <div className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-4">
                    <p className="text-xs font-extrabold text-indigo-950">🧪 คอนโซลควบคุมการทดสอบของหัวเครื่องสำอางสำเร็จรูป:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-bold block">ความเป็นกรดด่าง (pH Level):</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="3.0"
                            max="9.0"
                            step="0.1"
                            value={qcState.pH}
                            onChange={(e)=>setQcState({...qcState, pH: Number(e.target.value)})}
                            className="flex-1 accent-indigo-600"
                          />
                          <span className="font-mono font-bold bg-white p-1 rounded-md border text-slate-800 shrink-0 w-10 text-center">{qcState.pH}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">เป้าหมายผิวหน้า: 5.5 - 6.5</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-700 font-bold block">ความหนืด (Viscosity - cPs x100):</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="5"
                            max="30"
                            step="0.5"
                            value={qcState.viscosity}
                            onChange={(e)=>setQcState({...qcState, viscosity: Number(e.target.value)})}
                            className="flex-1 accent-indigo-600"
                          />
                          <span className="font-mono font-bold bg-white p-1 rounded-md border text-slate-800 shrink-0 w-10 text-center">{qcState.viscosity}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">เป้าหมายแบ่งกวน: 12.0 - 18.0 cPs</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center flex-wrap gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">ผลวิเคราะห์สารปนเปื้อนเชื้อโรค:</span>
                        <span className="bg-emerald-100 text-emerald-800 p-1 px-2.5 rounded-lg font-bold font-mono ml-2">PASSED / NEGATIVE</span>
                      </div>
                      <button
                        type="button"
                        onClick={()=> {
                          onNotify('วิเคราะห์สารเคมีฟิสิกส์ล้างผลผ่านเกณฑ์สมบูรณ์!', 'info');
                          setQcState({ pH: 5.8, viscosity: 14.2, microbialCount: 0, heavyMetals: 'Negative', appearanceCheck: 'ถูกต้องเหมาะสมสากล' });
                        }}
                        className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                      >
                        รีเซ็ตค่ามาตรฐาน (Auto Calibration)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: QUALITY ASSURANCE (QA) */}
              {selectedSection === 8 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">⚖️</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">8. ระบบประกันคุณภาพระเบียบ SOP & QA Release Gate</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">การรักษาความเสถียรของ SOP, WI, บันทึกการผลิตและรายงานอาการปัดเบี่ยงเบน (Deviation)</p>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-650 font-medium leading-relaxed font-sans">
                    ฝ่ายประกันคุณภาพ (Quality Assurance) มีหน้าระงับสิทธิ์จำหน่าย (Hold) หรืออนุมัติทลอยตู้ (QA Release) โดยการประเมินประวัติดิสเพลย์ความเสถียรและปิดเล่มใบรายงาน Deviation ทันที หากเกิดข้อผิดพลาดในการกวนผสม:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-emerald-50/35 border border-emerald-150 rounded-2xl space-y-3">
                      <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">🔏 ประเมินมาตรฐานอาคารโรงเรือน:</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={qaApprovals.sopApproved} onChange={(e)=>setQaApprovals({...qaApprovals, sopApproved: e.target.checked})} className="rounded scale-110 accent-emerald-600" />
                        <span>SOP คลังมาตรฐานปฏิบัติงานใช้งานแล้ว</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={qaApprovals.wiActive} onChange={(e)=>setQaApprovals({...qaApprovals, wiActive: e.target.checked})} className="rounded scale-110 accent-emerald-600" />
                        <span>WI ติดตั้งตามจุดงานผลิตพร้อมใช้งาน</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={qaApprovals.riskAssessmentPass} onChange={(e)=>setQaApprovals({...qaApprovals, riskAssessmentPass: e.target.checked})} className="rounded scale-110 accent-emerald-600" />
                        <span>จัดทำประเมินเอกสารความเสี่ยง (Risk Assessment)</span>
                      </label>
                    </div>

                    <div className="p-4 bg-rose-50/35 border border-rose-150 rounded-2xl space-y-3">
                      <p className="font-extrabold text-rose-950 flex items-center gap-1.5">📋 แฟลชประวัติความคลาดเคลื่อน (CAPA):</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={qaApprovals.batchRecordLogged} onChange={(e)=>setQaApprovals({...qaApprovals, batchRecordLogged: e.target.checked})} className="rounded scale-110 accent-rose-600" />
                        <span>บันทึกการผลิตแบบแบทช์ครบถ้วน (Batch Record)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={qaApprovals.deviationCleared} onChange={(e)=>setQaApprovals({...qaApprovals, deviationCleared: e.target.checked})} className="rounded scale-110 accent-rose-600" />
                        <span>รายงานการผลิตผิดสังเกตได้รับการวิเคราะห์กวาดล้างแล้ว (Deviation Cleared)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={qaApprovals.capaClosed} onChange={(e)=>setQaApprovals({...qaApprovals, capaClosed: e.target.checked})} className="rounded scale-110 accent-rose-600" />
                        <span>ออกใบแก้ไข CAPA ป้องกันการพังซ้ำสำเร็จ</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-900 text-white rounded-2xl flex justify-between items-center flex-wrap gap-3 text-xs">
                    <div>
                      <p className="font-bold">สถานภาพปล่อยขาย QA RELEASING STATUS:</p>
                      <p className="text-indigo-200 text-[11px] font-medium">เอกสารพอร์ตและใบตรวจเช็คถูกจัดชุดตรวจสอบคู่ขนานเรียบร้อย</p>
                    </div>
                    <span className="p-1.5 px-4 bg-emerald-500 rounded-lg text-white font-extrabold tracking-wider animate-pulse">
                      READY TO SELL ✓
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION 9: PACKAGING LINE */}
              {selectedSection === 9 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🧴</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">9. ระบบบรรจุภัณฑ์ แบรนด์สกินกวาร์ด (Primary Care Packaging)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">หัวจ่ายปริมาตรบีบลื่น เกลียวปากขวดเหนี่ยวนำความร้อน และติดตารหัสบาร์โค้ด</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                    <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-slate-200 space-y-3">
                      <p className="text-slate-900 font-black">⚙️ เครื่องจักรสายพานหลักบรรจุขวดโลชั่น-เซรั่ม:</p>
                      <ul className="space-y-1.5 font-medium text-[11px] text-[#4A4A4D]">
                        <li>• <strong>Filling Machine:</strong> จ่ายปริมาตรประคองระบบลูกสูบสยบแรงดีดขวด</li>
                        <li>• <strong>Capping Machine:</strong> ตรวจแรงขันปิดฝา และหมุนล็อกสปริงแน่นหน่วง</li>
                        <li>• <strong>Induction Sealer:</strong> เหนี่ยวนำความร้อนฟอยล์ปิดปากขวด กันเยิ้มปนเปื้อน</li>
                        <li>• <strong>Cartoning Machine:</strong> พับกล่องนอกสอดไกด์คู่มือการใช้งานเสร็จสิ้น</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-150 space-y-3">
                      <p className="text-indigo-950 font-black">⚡ พารามิเตอร์สายพานทำงานปัจจุบัน:</p>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold">ความเร็วเครื่องบีบขวดบรรจุคู่สาย:</label>
                        <div className="flex items-center gap-2 text-xs">
                          <input type="range" min="10" max="100" value={packSpeed} onChange={(e)=>setPackSpeed(Number(e.target.value))} className="accent-indigo-600 flex-1" />
                          <span className="bg-white border p-1 rounded font-mono font-bold shrink-0">{packSpeed} ชิ้น/นาที</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold">น้ำหนักเนื้อครีมเฉลี่ยนอกตราชั่ง (เป้าหมาย 50.0g):</label>
                        <div className="flex items-center gap-2 text-xs">
                          <input type="number" step="0.1" value={lastBottleWeight} onChange={(e)=>setLastBottleWeight(Number(e.target.value))} className="w-24 p-1 border rounded bg-white text-center font-mono font-bold" />
                          <span className={`${Math.abs(lastBottleWeight - 50.0) < 0.5 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'} p-1 px-2.5 rounded text-[10px] font-bold`}>
                            {Math.abs(lastBottleWeight - 50.0) < 0.5 ? 'ผ่านความคลาดเคลื่อน (Passed)' : 'คลาดเคลื่อนเกินขีดจำกัด!'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 10: TRACEABILITY BACK TRACK */}
              {selectedSection === 10 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🔗</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">10. ระบบตรวจสอบย้อนกลับแบบลูกโซ่คู่ขนาน (Chain Traceability)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">สืบค้นลำดับลึก: ผลผลิตสำเร็จรูป (Finished Product) → แหล่งวัตถุดิบและคู่ค้าซัพพลายเออร์สตรีมต้นน้ำ</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4.5 rounded-3xl border border-slate-200 space-y-4">
                    <p className="text-xs font-bold text-slate-900">🔍 ค้นเป้าหมายรหัสล็อตเพื่อจัดสถิติห่วงโซ่อุปทาน:</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={searchLotCode}
                        onChange={(e)=>setSearchLotCode(e.target.value)}
                        placeholder="เช่น LOT-FG24001, LOT-QA-772"
                        className="flex-1 text-xs md:text-sm border border-slate-300 rounded-2xl p-3 bg-white outline-none font-mono font-black uppercase text-indigo-950 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={performTrace}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 px-6 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        ตรวจสอบข้อมูลย้อนกลับ (Trace Lot)
                      </button>
                    </div>

                    {traceResult && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3 animate-fade-in font-semibold">
                        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[10px] text-indigo-600 font-extrabold uppercase font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Trace Master Active</span>
                            <h4 className="font-bold text-slate-950 text-sm md:text-base mt-1">{traceResult.product}</h4>
                          </div>
                          <span className="bg-indigo-950 text-white font-mono p-1 px-3 rounded-lg text-xs font-bold">{traceResult.lot}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed mt-2 text-[11px] font-medium text-[#4D4D50]">
                          <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-100/50 space-y-1.5">
                            <p className="font-black text-slate-900 text-xs">📦 บรรจุภัณฑ์ที่ตรวจย้อนกลับ:</p>
                            <p>• รหัสขวดแก้ว: <strong>{traceResult.packaging.bottleLot}</strong></p>
                            <p>• ซัพพลายเออร์: <strong>{traceResult.packaging.supplier}</strong></p>
                            <p>• วันตรวจดักฝุ่น: {traceResult.packaging.receivedDate}</p>
                          </div>
                          <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-100/50 space-y-1.5">
                            <p className="font-black text-emerald-950 text-xs">🌾 ประวัติตั๋ววัตถุดิบเคมีที่ใช้ลงหม้อ:</p>
                            {traceResult.rawMaterials.map((m: any, xi: number) => (
                              <p key={xi} className="text-[10px]">
                                • <strong>{m.name}</strong> (ล็อต {m.lot}) - {m.supplier} (สถานะ: {m.qc})
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between text-[11px] text-slate-500 gap-1 font-mono">
                          <span>👤 พนักงานผู้หมุนเดินเรื่อง: <strong>{traceResult.operator}</strong></span>
                          <span>🏢 ถังผสมเครื่อง Homogenize: <strong>{traceResult.machine}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 11: FINISHED GOODS WMS WITH FEFO/FIFO */}
              {selectedSection === 11 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">📦</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">11. คลังสินค้าสำเร็จรูป จัดคิว FIFO/FEFO (WMS & High-Bay)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">การบริหารคิวมอบขายตามวันเสื่อมสภาพก่อน (First Expired, First Out)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-150 text-xs text-slate-700 leading-relaxed space-y-2 font-semibold">
                    <p className="font-extrabold text-emerald-950">📦 ระบบกระจายผลิตภัณฑ์อัจฉริยะ (Smart Storage Dispatch):</p>
                    <p>
                      • <strong>FEFO (First Expired First Out):</strong> สั่งสแกนตำแหน่งโลชั่นหอมแก้วหรือครีมที่มีวันกำหมดอายุเข้าใกล้มากที่สุดออกท่าไปสู่คลังรถส่งเป็นลำดับต้น เพื่อสกัดสินค้าค้างบ่มเสียหาย
                    </p>
                    <p>
                      • <strong>FIFO (First In First Out):</strong> ระบายสต็อกตักผสมชุดแรกตามลำดับปฏิทินที่ผลิตประมวลผล
                    </p>
                  </div>

                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">คิวกระจายพอร์ตสินค้ากวาดออกจากคลังสำเร็จรูป:</p>
                  <div className="space-y-2.5">
                    {dispatchQueue.map(q => (
                      <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center flex-wrap gap-2 text-xs font-semibold">
                        <div>
                          <p className="font-bold text-slate-900">{q.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">รหัสแบทช์ล็อตเดลต้า: <strong className="font-mono text-indigo-700">{q.id}</strong> • วันหมดอายุ: <strong>{q.expiryDate}</strong></p>
                        </div>
                        <div className="text-right">
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2.5 py-1 rounded-xl block font-bold mb-0.5">
                            {q.dispatchMethod}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-600">สต็อกคงเหลือ: {q.qty} ชิ้น</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 12: FACILITIES UTILITIES */}
              {selectedSection === 12 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">💧</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">12. งานระบบวิศวกรรมสิทธิอาคารสะอาด (Facility Utilities System)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">การควบคุมน้ำบริสุทธิ์เพื่อสัมผัสสาร RO + EDI และลมความชื้นคลีนรูม HVAC/HEPA</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-sky-50/40 border border-sky-100 rounded-2xl space-y-3">
                      <p className="font-black text-sky-950 flex items-center gap-1">💧 ระบบกรองน้ำบริสุทธิ์สูง:</p>
                      <ul className="space-y-1.5 font-medium text-[11px] text-slate-650 list-disc pl-3">
                        <li>น้ำดิบผ่านชั้นกรองทราย, คาร์บอน และรอยเรซินขจัดแร่เหล็ก</li>
                        <li>กรองผ่านเมมเบรนความดันสูง <strong>Reverse Osmosis (RO)</strong></li>
                        <li>บำบัดด้วยไฟฟ้า <strong>EDI (Electrodeionization)</strong> เพื่อขจัดเกลือ</li>
                        <li>ฉายแสงอัลตราไวโอเลต UV ฆ่าเชื้อจุลินทรีย์หน้าถังเก็บน้ำ</li>
                      </ul>
                      <div className="bg-white p-2.5 rounded-xl border border-sky-200 flex justify-between items-center text-[11px]">
                        <span>ค่าความต้านทานน้ำปัจจุบัน (Resistivity):</span>
                        <strong className="text-sky-800 font-mono font-bold">{waterResistivity} MΩ-cm (เป้าหมาย {'>'} 15)</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50/40 border border-indigo-150 rounded-2xl space-y-3">
                      <p className="font-black text-indigo-950 flex items-center gap-1">🍃 ระบบแลกเปลี่ยนมวลอากาศ HVAC:</p>
                      <ul className="space-y-1.5 font-medium text-[11px] text-slate-650 list-disc pl-3">
                        <li>กรองอากาศด้วยระบบบีบอัดพิเศษแผ่นกรองอนุภาค <strong>HEPA Filter</strong></li>
                        <li>ควบคุมแรงกดอากาศต่างระดับให้ห้องผลิตเป็นความดันบวกกันฝุ่น</li>
                        <li>ควบคุมคุมอุณหภูมิห้องแล็บเก็บสสาร 22±2°C ความชื้นไม่เกิน 55% RH</li>
                      </ul>
                      <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex justify-between items-center text-[11px]">
                        <span>แรงดันต่างห้องบวก (Differential Press):</span>
                        <strong className="text-indigo-800 font-mono font-bold">{diffPressure} Pa (เป้าหมาย 10-20)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 13: ENVIRONMENTAL GREEN FACTORY WATER WASTE */}
              {selectedSection === 13 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🌱</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">13. วิศวกรรมบำบัดน้ำเสียเคมีและคัดกรองขยะโรงเรือน (Environment)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">การคุมดัชนีน้ำเสีย Equalization สสารแขวนลอย และการกำจัดเศษเคมีอันตราย</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/40 border border-emerald-150 rounded-2xl space-y-3.5 text-xs font-semibold text-emerald-950">
                    <p className="font-bold">🌊 ลำดับถังพักบำบัดน้ำสะอาดก่อนมอบคืนแผ่นดิน:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-medium text-slate-700">
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                        <strong>1. Equalization Tank</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">พักบดควบคุมความเข้มข้นเจือจาง และปรับความเป็นกลางค่าน้ำ</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                        <strong>2. Aeration Tank</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">เติมออกซิเจนลมเลี้ยงฟองให้กลุ่มจุลชีพกัดกินกากตะกอนอิมัลชัน</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                        <strong>3. Clarifier Room & Carbon</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">ตกจมตะกอนแยกส่วนน้ำแห้ง และผ่านผงถ่านกำจัดหมอกกลิ่นสารหอม</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                      <p className="text-slate-900">🧬 ดัชนีน้ำทิ้งสะสมเรียลไทม์:</p>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>ค่าความเป็นกรดด่างสุขลักษณะน้ำ:</span>
                        <strong className="text-indigo-700 font-mono">{treatedWaterPH}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>ค่าสารปนเปื้อนในน้ำ (BOD - mg/L):</span>
                        <strong className={`font-mono ${bodChemicalLevel < 20 ? 'text-emerald-700' : 'text-rose-700'}`}>{bodChemicalLevel} mg/L (เป้า {`<`} 20)</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                      <p className="text-slate-900">☣️ การแยกรองขยะอุตสาหกรรมในสัปดาห์นี้:</p>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>ขยะเนื้อพลาสติกบรรจุภัณฑ์ชุดเบล (Plastic Waste):</span>
                        <strong>{wasteWeightPlastic} kg</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>กากเคมีและไขน้ำมันคัดกวน (Chemical Waste):</span>
                        <strong className="text-rose-700">{wasteWeightChemical} kg</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 14: WORKER SAFETY PPE CODES */}
              {selectedSection === 14 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🛡️</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">14. ระบบอาชีวอนามัยและอาคารจำลองภัย (Safety HSE Protocols)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">การสวมใส่หมวกคุมคลุม, เสื้อสเปกสภาวะกาวน์, ประตูลมแอร์ฝักบัว และสัญญาณแจ้งเหตุเพลิงไหม้</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <p className="text-slate-950 font-bold">🥽 แฟล้มดัชนีเครื่องป้องกันส่วนบุคคล (PPE Requirements):</p>
                      <div className="space-y-2 text-[11px] text-[#4A4A4D] font-medium leading-relaxed pl-1.5 list-disc">
                        <p>• สวมใส่ถุงมือไนไตรเคมีเมื่อเอื้อมชาร์จสารสกัด Active ชนิดเข้มข้น</p>
                        <p>• หน้ากากกรองปะคาร์บอนเกราะก๊าซ สำหรับป้องกันไอระเหยเอทิลแอลกอฮอล์สัมผัสตา</p>
                        <p>• ชุดกาวน์หมีไร้เส้นใยฝุ่น พร้อมที่คลุมป้องกันรังไข่เส้นผมตบประชิดสแตนเลส</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${alarmActive ? 'bg-rose-500 text-white border-rose-950 animate-pulse' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
                      <p className="font-extrabold text-xs">🚨 ระบบทดสอบตอบรับอัคคีภัย / สารระเหยอันตราย:</p>
                      <p className="text-[11px] mt-1.5 leading-relaxed font-semibold">
                        {alarmActive ? '📢 สัญญาณระงับภัยฉุกเฉินดังอยู่ทั่วบริเวณโรงงาน! คลังปิดสัญลักษณ์ท่อเคมีหมดจดแล้ว' : 'ระบบป้องกันความปลอดภัยทำงานสแตนด์บายปกติ พร้อมกระตุ้นปุ่มจำลองเตือนภัยด้านล่าง:'}
                      </p>
                      <div className="pt-3.5 flex justify-end">
                        <button
                          type="button"
                          onClick={triggerFactoryAlarm}
                          className={`p-2.5 px-5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer ${alarmActive ? 'bg-white text-rose-700 hover:bg-slate-50' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
                        >
                          {alarmActive ? '🔕 ยกเลิกสัญญาณเตือนภัย' : '🔔 จำลองเหตุการณ์อัคคีภัยแจ้งฉุกเฉิน'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 15: MES / ERP INTEGRATION */}
              {selectedSection === 15 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🖥️</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">15. ประสานระบบบริหารจัดการทรัพยากร ERP / MES โรงงาน</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">ซอฟต์แวร์ประมวลและเซ็นเซอร์ OEE, ใบผลิตดิจิทัล และประสานกับ Ledger บัญชี</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
                    <div className="p-4 bg-indigo-50/40 border border-indigo-150 rounded-2xl space-y-3">
                      <p className="font-bold text-indigo-950">📊 ซอฟต์แวร์ระบบวิเศษ ERP (Corporate Network):</p>
                      <select 
                        value={erpBrand}
                        onChange={(e)=>setErpBrand(e.target.value)}
                        className="w-full p-2.5 border rounded-xl bg-white font-bold text-[11px] text-indigo-950"
                      >
                        <option value="SAP S/4HANA (Standard ERP Cloud)">SAP S/4HANA Enterprise Cloud</option>
                        <option value="Microsoft Dynamics 365 Operations">Microsoft Dynamics 365 Supply Chain</option>
                        <option value="Oracle NetSuite Industrial Edition">Oracle NetSuite ERP (Cloud Pure)</option>
                      </select>
                      <p className="text-[11px] text-slate-500 font-medium pl-1">
                        หน้าที่: ควบคุมงบจัดซื้อ, สถิติคอร์สคลังกระดาษบัญชีต้นทุน และเชื่อมต่อกับฝ่ายจัดซื้อApproved Supplier
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <p className="font-bold text-slate-950">⚙️ หน้าต่างระบบคุมการผลิตหน้างาน (MES Dashboard):</p>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed font-sans">
                        ควบคุมเครื่องกวน, มอนิเตอร์ OEE อัตราเสถียรภาพสายพานโรงรับ และจัดเก็บ Batch Manufacturing Record (BMR) เพื่อเป็นเอกสารดิจิทัล
                      </p>
                      <div className="p-2 bg-indigo-900 text-white rounded-xl flex justify-between items-center text-[11px] font-mono">
                        <span>เป้าหมายประสิทธิผล OEE โรงงาน:</span>
                        <strong className="text-emerald-300 font-extrabold">{mesOeeTarget}% (Validated)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 16: DOCUMENT CONTROL */}
              {selectedSection === 16 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">📁</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">16. ทะเบียนเอกสารสำคัญและแผนปฏิบัติการโรงงานสเกลใหญ่ (SOP Master)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">การจัดหมวดคู่มือเอกสาร Quality Manual, บันทึกการบรรจุห่อ BPR และใบสอบเทียบเกจวัดอุณหภูมิปล่องลวง</p>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-605 font-medium leading-relaxed font-sans">
                    กฎระเบียบประเมินผล GMP ถือมั่นว่า "กระบวนการใดที่มิได้ถูกลงบันทึกเป็นลายลักษณ์อักษร ถือว่าขั้นตอนนั้นยังมิได้เกิดขึ้นจริง" (What is not written was not done) ค้นรายการเอกสารด้านล่าง:
                  </p>

                  <div className="space-y-2.5">
                    {docDirectory.map(doc => (
                      <div key={doc.code} className="p-3 bg-[#F5F5F7] hover:bg-indigo-50/20 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-semibold">
                        <div>
                          <span className="font-mono text-[9px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold">{doc.code} ({doc.version})</span>
                          <h4 className="font-bold text-xs text-slate-900 mt-1">{doc.name}</h4>
                        </div>
                        <div className="text-[11px] text-slate-500 self-end sm:self-center">
                          <span>ลิขสิทธิ์: <strong>{doc.author}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 17: PERSONNEL ORG CHART */}
              {selectedSection === 17 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">👥</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">17. แผนภาพโครงสร้างเจ้าหน้าที่กำลังพลเสาหลัก (Plant Org Chart)</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">แผนผังอำนาจแบ่งแยกหน้าที่ระเบียบความปลอดภัย การรับอนุมัติงบ และสิทธิผู้ตรวจสอบเกียรติ FDA</p>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/35 border border-indigo-150 rounded-2xl space-y-1.5 leading-relaxed font-sans text-xs">
                    <p className="font-extrabold text-indigo-950">👑 แถวหน้าที่ฝ่ายอำนวยการและอำนาจวงเงินเซ็นอนุมัติ:</p>
                    <p className="text-[11px] text-[#4A4A4D] font-medium">• Plant Director มีเอกสิทธิ์อำนาจสูงสุดในการประชามติพอร์ตแบรนด์สินค้า</p>
                    <p className="text-[11px] text-[#4A4A4D] font-medium">• QA Manager และ QC Manager ได้รับสิทธิคานกันและกัน ไม่ขึ้นสายตรงกับฝ่ายผลิต เพื่อความโปร่งใสของคุณภาพ</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-semibold">
                    {organizationalChart.map(p => (
                      <div key={p.role} className="p-3.5 bg-white border border-slate-205 rounded-2xl shadow-xs space-y-1 hover:border-indigo-400 hover:shadow-md transition">
                        <div className="flex justify-between items-center bg-indigo-50/40 p-1.5 rounded-lg">
                          <span className="font-mono text-[10px] text-indigo-700 font-extrabold">{p.role}</span>
                          <span className="text-[9px] bg-[#FF9500]/10 text-[#FF9500] px-1.5 py-0.2 rounded font-extrabold">งบเซ็น: {p.budgetLimit}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mt-1">{p.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{p.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 18: FLUID LINE END-TO-END FLOW */}
              {selectedSection === 18 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
                    <span className="text-3xl bg-indigo-50 p-2.5 rounded-2xl block">🔄</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base md:text-lg">18. ระบบควบคุมเส้นสายและทิศทางการกลั่นเดินสายแบบครบวงจร</h3>
                      <p className="text-xs md:text-sm text-slate-500 font-semibold">จำลองโมเดลสเต็ปประมวลผล ตั้งแต่วัตถุดิบข้ามประตูนอกคลังลงสู่ตู้ขนส่งจัดจำหน่าย</p>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                    ระบบอุตสาหกรรมสากลต้องรับกับ Flow การทำงานที่กักความปนเปื้อน 9 ระดับหลัก จากซัพพลายเออร์ตรงถึงผู้ใช้ตามลำดับชั้น คลิกวงกลมเพื่อประเมินความก้าวหน้าข้ามคิว:
                  </p>

                  <div className="relative pl-6 space-y-4 text-xs font-semibold">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-indigo-200"></div>

                    {e2eSteps.map((step, idx) => {
                      const isPast = idx < currentGlobalStep;
                      const isCurrent = idx === currentGlobalStep;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setCurrentGlobalStep(idx)}
                          className="relative flex items-start gap-4 cursor-pointer transition select-none hover:translate-x-1"
                        >
                          <span className={`absolute -left-[21px] w-[11px] h-[11px] rounded-full ring-4 ring-white ${
                            isPast ? 'bg-emerald-500' :
                            isCurrent ? 'bg-indigo-600 ring-indigo-200 animate-pulse' :
                            'bg-slate-300'
                          }`}></span>

                          <div className={`p-3 rounded-2xl border flex-1 transition ${
                            isCurrent ? 'bg-indigo-50 border-indigo-250 shadow-xs' :
                            isPast ? 'bg-emerald-50/20 border-emerald-100 text-slate-600' :
                            'bg-white border-slate-150 text-slate-400'
                          }`}>
                            <p className={`font-bold ${isCurrent ? 'text-indigo-950' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                              {idx + 1}. {step.label}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-none mt-1 font-medium">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md animate-fade-in space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
              <Compass className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base md:text-lg">ประวัติเช็คและสืบสวนรอยต่อย้อนกลับสสารคู่ค้า (GMP Genealogy Validation)</h3>
              <p className="text-xs md:text-sm text-slate-500 font-semibold">ความโปรงใสลึก: พิมพ์ Lot Number เพื่อระบุนพนักงานผู้ต้ม, วันเวลาโฮโมจีไนเซอร์ และล็อตของขวดแก้ว</p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4 max-w-3xl mx-auto">
            <div className="space-y-1 pl-1">
              <label className="text-xs font-bold text-slate-550 block">รหัสล็อตสารสกัดหรือสินค้าสำเร็จรูป:</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={searchLotCode}
                  onChange={(e)=>setSearchLotCode(e.target.value)}
                  placeholder="ป้อนรหัส เช่น LOT-FG24001, LOT-COA-MYS-77B"
                  className="flex-1 text-xs md:text-sm border border-slate-300 rounded-2xl p-3 bg-white outline-none font-mono font-black uppercase text-indigo-950 focus:border-indigo-500 shadow-inner"
                />
                <button
                  type="button"
                  onClick={performTrace}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 px-6 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Search className="h-4.5 w-4.5" /> ตรวจสอบสสารสเกลลึก
                </button>
              </div>
            </div>

            {traceResult && (
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 text-xs text-slate-705 space-y-4 animate-fade-in font-semibold">
                <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-indigo-600 font-extrabold uppercase font-mono bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">🧬 GMP Trace Genealogy Verified</span>
                    <h4 className="font-bold text-slate-950 text-sm md:text-base mt-2">{traceResult.product}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{traceResult.status}</p>
                  </div>
                  <span className="bg-indigo-950 text-white font-mono p-1.5 px-4 rounded-xl text-xs font-bold">{traceResult.lot}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-150 space-y-2">
                    <p className="font-extrabold text-slate-900 text-xs border-l-2 border-indigo-500 pl-1.5">📦 รอยเวชระเบียบบรรจุขวดนอก:</p>
                    <p className="text-slate-600 font-medium">รหัสล็อตขวดแก้ว: <strong>{traceResult.packaging.bottleLot}</strong></p>
                    <p className="text-slate-600 font-medium">ซัพพลายเออร์จัดส่ง: <strong>{traceResult.packaging.supplier}</strong></p>
                    <p className="text-slate-600 font-medium">วันที่ลงรับคลังกักกัน: {traceResult.packaging.receivedDate}</p>
                  </div>

                  <div className="p-3.5 bg-emerald-50/20 rounded-xl border border-emerald-100 space-y-2">
                    <p className="font-extrabold text-emerald-950 text-xs border-l-2 border-emerald-500 pl-1.5">🌾 รายการล็อตสารสกัดสมุนไพรร่วมหม้อ:</p>
                    {traceResult.rawMaterials.map((m: any, xi: number) => (
                      <p key={xi} className="text-slate-700 font-medium">
                        • {m.name} ({m.lot}) — {m.supplier} ({m.qc})
                      </p>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex flex-col md:flex-row justify-between text-[11px] text-slate-450 gap-2 font-mono">
                  <p>👤 พนักงานคุมการผสมต้มชาร์จ: <strong className="text-slate-700">{traceResult.operator}</strong></p>
                  <p>⚙️ เครื่องจักร Vacuum Emulsifier: <strong className="text-slate-700">{traceResult.machine}</strong></p>
                  <p>📅 พิมพ์ประวัติและผลิตเมื่อ: <strong className="text-slate-700">{traceResult.dateProduced}</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
