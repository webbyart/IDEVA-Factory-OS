// Seeded Mock Database File for IDEVA Cosmetics/Perfume Factory OS v2.0
import { 
  Employee, Department, Role, Customer, Supplier, Product, Material, Formula, 
  Machine, ManufacturingOrder, RepairTicket, PMTask, SparePart, AttendanceRecord, 
  LeaveRequest, OTRequest, PayrollPeriod, Payslip, AccountTransaction, Invoice, 
  SupplierBill, AuditLog, QCInspection, PurchaseRequest, PurchaseOrder, GoodsReceipt
} from '../types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'ฝ่ายบริหารจัดการและอำนวยการ', code: 'ADM' },
  { id: 'dept-2', name: 'ฝ่ายผลิตและบ่มปรุงน้ำหอม', code: 'PRD' },
  { id: 'dept-3', name: 'ฝ่ายควบคุมและประกันคุณภาพ (QA/QC)', code: 'QAQC' },
  { id: 'dept-4', name: 'ฝ่ายวิศวกรรมระบบและซ่อมบำรุง', code: 'MNT' },
  { id: 'dept-5', name: 'ฝ่ายบริหารทรัพยากรบุคคล', code: 'HR' },
  { id: 'dept-6', name: 'ฝ่ายบัญชีและการเงินโรงงาน', code: 'ACC' },
  { id: 'dept-7', name: 'ฝ่ายจัดซื้อจัดหาเคมีภัณฑ์ดิบ', code: 'PUR' },
  { id: 'dept-8', name: 'ฝ่ายคลังสินค้าและซัพพลายเชน', code: 'WMS' },
  { id: 'dept-9', name: 'ฝ่ายวิจัยแล็บและพัฒนาสูตร R&D', code: 'RD' },
  { id: 'dept-10', name: 'ฝ่ายขายและการค้าต่างประเทศ', code: 'SLS' }
];

export const ROLES: Role[] = [
  { id: 'role-admin', name: 'ผู้จัดการทั่วไป (General Admin)', permittedMenus: ['Production', 'Maintenance', 'HR', 'Accounting', 'Developer'] },
  { id: 'role-mgmt', name: 'ผู้บริหารระดับสูง (Management)', permittedMenus: ['Production', 'Maintenance', 'HR', 'Accounting'] },
  { id: 'role-sales', name: 'เจ้าหน้าที่ฝ่ายขายและส่งออก', permittedMenus: ['Accounting'] },
  { id: 'role-rd', name: 'นักปรุงแต่งกลิ่นน้ำหอม (Perfumer / R&D)', permittedMenus: ['Production'] },
  { id: 'role-purchase', name: 'เจ้าหน้าที่จัดซื้อสารเคมีดิบ', permittedMenus: ['Production', 'Accounting'] },
  { id: 'role-wh', name: 'ผู้ดูแลคลังกระจายสินค้าวัตถุดิบ', permittedMenus: ['Production'] },
  { id: 'role-qc', name: 'เจ้าหน้าที่ตรวจสอบคุณภาพแล็บ (QC)', permittedMenus: ['Production'] },
  { id: 'role-prod', name: 'หัวหน้าทีมควบคุมหม้อกลั่นผสม', permittedMenus: ['Production'] },
  { id: 'role-maint', name: 'ช่างเทคนิคซ่อมบำรุงระบบดักซึม', permittedMenus: ['Maintenance'] },
  { id: 'role-hr', name: 'เจ้าหน้าที่งานบุคคลและอัตราจ้าง', permittedMenus: ['HR'] },
  { id: 'role-acc', name: 'เจ้าหน้าที่บัญชีโรงงาน', permittedMenus: ['Accounting'] }
];

export const EMPLOYEES: Employee[] = [
  { id: 'emp-101', name: 'กิตติพงษ์ เลิศอัครเดช', email: 'kittipong@factory.com', departmentId: 'dept-1', roleId: 'role-admin', status: 'Active', salary: 120000, allowance: 10000, joiningDate: '2023-01-15', skills: ['SAP ERP', 'Perfume Formulation Specialist', 'Executive Leadership'] },
  { id: 'emp-102', name: 'อนงค์นาฏ ทรัพย์มงคล', email: 'anongnart@factory.com', departmentId: 'dept-5', roleId: 'role-hr', status: 'Active', salary: 75000, allowance: 4000, joiningDate: '2023-05-10', skills: ['Conflict Resolution', 'Corporate Payroll', 'Training Programs'] },
  { id: 'emp-103', name: 'ธนวัชร รัตนเวชศาสน์', email: 'thanawat@factory.com', departmentId: 'dept-2', roleId: 'role-prod', status: 'Active', salary: 65000, allowance: 6000, joiningDate: '2024-02-12', skills: ['Perfume Blender', 'Maturation Control', 'Weighing Precision'] },
  { id: 'emp-104', name: 'ดร. ลลิตา วรโชติสกุล', email: 'lalita@factory.com', departmentId: 'dept-3', roleId: 'role-qc', status: 'Active', salary: 68000, allowance: 4000, joiningDate: '2024-03-01', skills: ['Gas Chromatography', 'ISO 22716 Cosmetics GMP'] },
  { id: 'emp-105', name: 'สมชาย ไวกิจการ', email: 'somchai@factory.com', departmentId: 'dept-4', roleId: 'role-maint', status: 'Active', salary: 72000, allowance: 5000, joiningDate: '2023-11-20', skills: ['Pneumatic Pumps', 'Aerosol Filling Repair'] },
  { id: 'emp-106', name: 'ศิริพร บุญครองกุล', email: 'siriporn@factory.com', departmentId: 'dept-6', roleId: 'role-acc', status: 'Active', salary: 85000, allowance: 3000, joiningDate: '2023-08-15', skills: ['BOI Tax Incentives', 'Standard Costing'] },
  { id: 'emp-107', name: 'ดร. นิรุตต์ ตั้งจิตประสงค์', email: 'niroot@factory.com', departmentId: 'dept-9', roleId: 'role-rd', status: 'Active', salary: 95000, allowance: 8000, joiningDate: '2022-09-01', skills: ['Scent Engineering', 'Synthetics Sourcing'] },
  { id: 'emp-108', name: 'วรวิทย์ ศิลปบรรเลง', email: 'worawit@factory.com', departmentId: 'dept-2', roleId: 'role-rd', status: 'Active', salary: 55000, allowance: 2000, joiningDate: '2025-01-10', skills: ['Aromatherapy', 'Odor Control'] },
  { id: 'emp-109', name: 'ณัฐพล แก้ววิเศษ', email: 'nattapon@factory.com', departmentId: 'dept-8', roleId: 'role-wh', status: 'Active', salary: 32000, allowance: 1500, joiningDate: '2024-06-25', skills: ['Forklift License', 'WMS Audits'] },
  { id: 'emp-999', name: 'นายกิตติ์ธนา คำมูล', email: 'kittithana.km@factory.com', departmentId: 'dept-4', roleId: 'role-maint', status: 'Active', salary: 14000, allowance: 0, joiningDate: '2020-04-12', skills: ['Computer Networking', 'IoT Systems', 'Database Admin'], lineUserId: 'Ue26ade3b0cd4d6eda90f72436e4c5a43', citizenId: '1-1022-00543-12-9' }
];

export const CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'บริษัท คิงพาวเวอร์ บิวตี้ ดิสทริบิวชั่น จำกัด', code: 'CUST-KINGPOWER', email: 'dutyfree-beauty@kingpower.co.th', phone: '+66-2-677-8888', address: 'ศรีวารี, สมุทรปราการ, ประเทศไทย' },
  { id: 'cust-2', name: 'บริษัท มัทสึโมโตะ คิโยชิ โฮลดิ้ง ประเทศไทย LLC', code: 'CUST-MATSU', email: 'b2b-procurement@matsukiyo.co.th', phone: '+66-2-589-3344', address: 'ห้วยขวาง, กรุงเทพมหานคร, ประเทศไทย' },
  { id: 'cust-3', name: 'กลุ่มธุรกิจสปารับจ้างผลิต แอนนิแมค โกรฟ สยาม', code: 'CUST-ANIMAC', email: 'oem-contract@animac.com', phone: '+66-2-332-1111', address: 'อ.แม่ริม, เชียงใหม่, ประเทศไทย' },
  { id: 'cust-4', name: 'บริษัท เดอะมอลล์ กรุ๊ป พารากอน ดีพาร์ทเมนท์', code: 'CUST-THEMALL', email: 'procurement@themall.co.th', phone: '+66-2-310-1000', address: 'คลองเตย, กรุงเทพมหานคร, ประเทศไทย' },
  { id: 'cust-5', name: 'บริษัท เซ็นทรัลดีพาร์ทเมนท์สโตร์ จำกัด', code: 'CUST-CENTRAL', email: 'procurement@central.co.th', phone: '+66-2-793-7000', address: 'ชิดลม, กรุงเทพฯ, ประเทศไทย' },
  { id: 'cust-6', name: 'บริษัท คอสเมด กรุ๊ป เอเชีย จำกัด', code: 'CUST-COSMED', email: 'order@cosmedgroup.co.th', phone: '+66-2-890-5000', address: 'บางบอน, กรุงเทพฯ, ประเทศไทย' },
  { id: 'cust-7', name: 'บริษัท นิวบิวตี้ รีเทล เฮ้าส์ จำกัด', code: 'CUST-NEWBEAUTY', email: 'supply@newbeauty.co.th', phone: '+66-34-450-999', address: 'อ.กระทุ่มแบน, สมุทรสาคร, ประเทศไทย' },
  { id: 'cust-8', name: 'บริษัท พารารอยัล บิวตี้ ประเทศไทย จำกัด', code: 'CUST-ROYAL', email: 'royal_order@pararoyal.co.th', phone: '+66-2-123-4567', address: 'ลาดพร้าว, กรุงเทพฯ, ประเทศไทย' },
  { id: 'cust-9', name: 'บริษัท มาดามอโรมาอินเตอร์เนชั่นแนล จำกัด', code: 'CUST-AROMA', email: 'import@madamearoma.com', phone: '+66-2-901-2030', address: 'อ.ปากเกร็ด, นนทบุรี, ประเทศไทย' },
  { id: 'cust-10', name: 'บริษัท ลักซูรี่ บูทีค สกินแคร์ แอนด์ เวลเนส จำกัด', code: 'CUST-LUXURY', email: 'boutiquebg@luxswell.co.th', phone: '+66-2-331-5001', address: 'ปทุมวัน, กรุงเทพฯ, ประเทศไทย' }
];

export const SUPPLIERS: Supplier[] = [
  { id: 'supp-1', name: 'Robertet Fragrance Distillery (Grasse, France)', code: 'SUPP-ROB-FR', contactPerson: 'Jean-Luc Grasse', phone: '+33-4-9340-3300', email: 'contact@robertet.fr' },
  { id: 'supp-2', name: 'บริษัท ไทยแพคเกจจิ้ง แอนด์ ลักซูรี่ บ็อกซ์ จำกัด', code: 'SUPP-THAI-PACK', contactPerson: 'พิมพ์ลดา จรัสแสง', phone: '+66-2-440-9988', email: 'sales@thaipacklux.co.th' },
  { id: 'supp-3', name: 'ศิริมงคล เคมีคอล แอดดิทิฟส์ ผู้ส่งเอทานอล', code: 'SUPP-SIRI-CHEM', contactPerson: 'สมพล ไพบูลย์', phone: '+66-2-711-2334', email: 'info@sirichem.co.th' },
  { id: 'supp-4', name: 'Givaudan Fragrance Components (Singapore)', code: 'SUPP-GIV-SG', contactPerson: 'Lim Wei Meng', phone: '+65-6751-9100', email: 'singapore.sales@givaudan.com' },
  { id: 'supp-5', name: 'Firmenich Essential Sourcing (Zürich, Switzerland)', code: 'SUPP-FIR-SUI', contactPerson: 'Hans Peter', phone: '+41-22-780-2211', email: 'sourcing@firmenich.ch' },
  { id: 'supp-6', name: 'บริษัท สยามแก้วโมเดิร์นกลาส จำกัด', code: 'SUPP-SIAMGLASS', contactPerson: 'ชูศักดิ์ รุ่งเรือง', phone: '+66-2-882-3500', email: 'support@siamglass.co.th' },
  { id: 'supp-7', name: 'Symrise Natural Aromatics (Holzminden, Germany)', code: 'SUPP-SYM-DE', contactPerson: 'Dieter Müller', phone: '+49-5531-90-0', email: 'info.de@symrise.com' },
  { id: 'supp-8', name: 'บริษัท วีกรุ๊ปกล่องกระดาษสัมผัสแป้ง จำกัด', code: 'SUPP-VGROUP', contactPerson: 'วิไลวรรณ เจริญสุข', phone: '+66-2-990-1122', email: 'vgroup_box@gmail.com' },
  { id: 'supp-9', name: 'บริษัท เอเชียนโซลเว้นท์ ดิสทริบิวเตอร์ จำกัด', code: 'SUPP-ASIAN_SOLV', contactPerson: 'โกวิท บูรณพิมพ์', phone: '+66-2-441-3000', email: 'kovit@asiansolvent.com' },
  { id: 'supp-10', name: 'Takasago International Fine Chemicals (Tokyo, Japan)', code: 'SUPP-TAKASAGO', contactPerson: 'Rei Takahashi', phone: '+81-3-5744-1111', email: 't_chem@takasago.com' }
];

export const PRODUCTS: Product[] = [
  { id: 'prod-001', sku: 'PFM-CHRE-100', name: 'กลิ่น Chérie Rose Eau de Parfum (EDP) 100ml', category: 'น้ำหอมผู้หญิง (EDP)', minStock: 50, stockLevel: 120, unit: 'ขวด', costPrice: 450.00, sellPrice: 2450.00 },
  { id: 'prod-002', sku: 'PFM-MOUD-50', name: 'กลิ่น Midnight Oud Extrait de Parfum 50ml', category: 'น้ำหอมพรีเมียมเข้มข้น', minStock: 30, stockLevel: 45, unit: 'ขวด', costPrice: 850.00, sellPrice: 4200.00 },
  { id: 'prod-003', sku: 'PFM-SCIT-150', name: 'กลิ่น Summer Citrus Refreshing Body Mist 150ml', category: 'บอดี้มิสต์บางเบา', minStock: 100, stockLevel: 85, unit: 'ขวด', costPrice: 180.00, sellPrice: 690.00 },
  { id: 'prod-004', sku: 'PFM-JASM-100', name: 'กลิ่น Jasmine Blossom Signature Cologne 100ml', category: 'น้ำหอมโคโลญจน์', minStock: 40, stockLevel: 60, unit: 'ขวด', costPrice: 280.00, sellPrice: 1250.00 },
  { id: 'prod-005', sku: 'PFM-VANIL-50', name: 'กลิ่น Sweet Velvet Vanilla Extrait 50ml', category: 'น้ำหอมยูนิเซ็กส์พรีเมียม', minStock: 30, stockLevel: 40, unit: 'ขวด', costPrice: 650.00, sellPrice: 3800.00 },
  { id: 'prod-006', sku: 'PFM-LAV-100', name: 'กลิ่น Deep Lavender Sleep Well Pillow Mist 100ml', category: 'สเปรย์หอมเพื่อการนอนหลับ', minStock: 100, stockLevel: 150, unit: 'ขวด', costPrice: 120.00, sellPrice: 490.00 },
  { id: 'prod-007', sku: 'PFM-SAND-100', name: 'กลิ่น Sandalwood Mystic Temple EDP 100ml', category: 'น้ำหอมผู้ชายวู้ดดี้สไปซี่', minStock: 40, stockLevel: 55, unit: 'ขวด', costPrice: 520.00, sellPrice: 2900.00 },
  { id: 'prod-008', sku: 'PFM-AMB-50', name: 'กลิ่น Amber Imperial Warm Glow Extrait 50ml', category: 'น้ำหอมแอมเบอร์ตะวันออก', minStock: 20, stockLevel: 25, unit: 'ขวด', costPrice: 780.00, sellPrice: 4500.00 },
  { id: 'prod-009', sku: 'PFM-BERG-100', name: 'กลิ่น Bergamot Zest Fresh Splash Sport Cologne 100ml', category: 'น้ำหอมสปอร์ตโคโลญจน์', minStock: 60, stockLevel: 70, unit: 'ขวด', costPrice: 240.00, sellPrice: 1150.00 },
  { id: 'prod-010', sku: 'PFM-PATCH-50', name: 'กลิ่น Vintage Patchouli Velvet Cologne 50ml', category: 'น้ำหอมพิมเสนอโรมาติก', minStock: 30, stockLevel: 35, unit: 'ขวด', costPrice: 310.00, sellPrice: 1550.00 }
];

export const MATERIALS: Material[] = [
  { id: 'mat-001', code: 'RAW-ESS-ROSE', name: 'สารสกัดน้ำมันหอมระเหยกุหลาบฝรั่งเศส (French Rose Centric Oil)', category: 'Raw Material', minStock: 200, stockLevel: 450, unit: 'ลิตร', costPerUnit: 850.00 },
  { id: 'mat-002', code: 'RAW-ESS-OUD', name: 'สารสกัดไม้กฤษณาธรรมชาติระดับพรีเมียม (Natural Agarwood Oud Oil)', category: 'Raw Material', minStock: 20, stockLevel: 15, unit: 'ลิตร', costPerUnit: 4500.00 },
  { id: 'mat-003', code: 'RAW-ESS-JASM', name: 'สารสกัดมะลิไทยสดบริสุทธิ์เข้มข้น (Thai Jasmine Absolute Oil)', category: 'Raw Material', minStock: 100, stockLevel: 180, unit: 'ลิตร', costPerUnit: 1800.00 },
  { id: 'mat-004', code: 'RAW-ESS-BERG', name: 'น้ำมันผิวส้มอิตาเลียนเบอร์กาม็อท (Italian Bergamot Citrus Oil)', category: 'Raw Material', minStock: 150, stockLevel: 320, unit: 'ลิตร', costPerUnit: 950.00 },
  { id: 'mat-005', code: 'RAW-ESS-VANIL', name: 'สารสกัดโกโก้เบอร์เบินวนิลลา (Madagascar Bourbon Vanilla Extract)', category: 'Raw Material', minStock: 80, stockLevel: 95, unit: 'ลิตร', costPerUnit: 2100.00 },
  { id: 'mat-006', code: 'RAW-SOLV-ETH', name: 'เอทานอลแปลงสภาพบริสุทธิ์สูง 99.9% (De-odorized Ethanol)', category: 'Raw Material', minStock: 2000, stockLevel: 4500, unit: 'ลิตร', costPerUnit: 85.00 },
  { id: 'mat-007', code: 'RAW-FIX-MSK', name: 'สารละลายมัสก์ช่วยตรึงกลิ่นหอมทนนาน (Musk Fixative Base)', category: 'Raw Material', minStock: 200, stockLevel: 180, unit: 'กิโลกรัม', costPerUnit: 350.00 },
  { id: 'mat-010', code: 'PKG-BTL-100G', name: 'ขวดแก้วเหลี่ยมฝาโลหะทองคัตทีงคริสตัล 100ml', category: 'Packaging', minStock: 1000, stockLevel: 2500, unit: 'ขวด', costPerUnit: 45.00 },
  { id: 'mat-011', code: 'PKG-BTL-50', name: 'ขวดแก้วทรงหรูพร้อมปลอกสัมผัสแบบสเปรย์ 50ml', category: 'Packaging', minStock: 1000, stockLevel: 900, unit: 'ขวด', costPerUnit: 35.00 },
  { id: 'mat-012', code: 'PKG-CAP-MIST', name: 'หัวฉีดแบบพ่นสเปรย์ระดับไมครอนคอเกลียวสีทองพรีเมียม', category: 'Packaging', minStock: 2000, stockLevel: 3200, unit: 'ชิ้น', costPerUnit: 12.00 }
];

export const FORMULAS: Formula[] = [
  { id: 'form-001', productId: 'prod-001', version: 'สเกลกลั่น 3.1', status: 'Approved', approvedBy: 'ดร. นิรุตต์ ตั้งจิตประสงค์', items: [{ materialId: 'mat-001', quantity: 0.1500 }, { materialId: 'mat-006', quantity: 0.8000 }, { materialId: 'mat-007', quantity: 0.0500 }] },
  { id: 'form-002', productId: 'prod-002', version: 'เข้มข้นสูงพิเศษ 1.0b', status: 'Approved', approvedBy: 'กิตติพงษ์ เลิศอัครเดช', items: [{ materialId: 'mat-002', quantity: 0.3500 }, { materialId: 'mat-006', quantity: 0.6000 }, { materialId: 'mat-007', quantity: 0.0500 }] },
  { id: 'form-003', productId: 'prod-003', version: 'สลัดส้มคงทน 2.2', status: 'Approved', approvedBy: 'ดร. นิรุตต์ ตั้งจิตประสงค์', items: [{ materialId: 'mat-004', quantity: 0.1200 }, { materialId: 'mat-005', quantity: 0.0300 }, { materialId: 'mat-006', quantity: 0.8500 }] },
  { id: 'form-004', productId: 'prod-004', version: 'ความคงตัวโคโลญจ์ 1.1', status: 'Approved', approvedBy: 'ดร. ลลิตา วรโชติสกุล', items: [{ materialId: 'mat-003', quantity: 0.1000 }, { materialId: 'mat-006', quantity: 0.9000 }] }
];

export const MACHINES: Machine[] = [
  { id: 'mac-1', name: 'Homogenizer High-shear Mixer H1', code: 'MIX-H1', section: 'Melt & Blend', status: 'Online', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MIX-H1', installedDate: '2023-01-10', mtbfHours: 420, mttrHours: 6 },
  { id: 'mac-2', name: 'Automatic Liquid Fragrance Filler F2', code: 'FIL-F2', section: 'Bottle Ingress', status: 'Online', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FIL-F2', installedDate: '2023-05-18', mtbfHours: 350, mttrHours: 8 },
  { id: 'mac-3', name: 'Gold Anodized Spray Crimper C3', code: 'CRP-C3', section: 'Crimping & Seal', status: 'Online', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CRP-C3', installedDate: '2024-02-14', mtbfHours: 580, mttrHours: 4 }
];

export const MANUFACTURING_ORDERS: ManufacturingOrder[] = [
  { id: 'mo-perfume-901', productId: 'prod-001', formulaId: 'form-001', quantityRequested: 250, quantityProduced: 250, startDate: '2026-06-01', status: 'Released', costSummary: { materialCost: 45000, packagingCost: 8000, laborCost: 12000, overheadCost: 5500, lossCost: 1200, totalCost: 71700, costPerPiece: 286.80 } },
  { id: 'mo-perfume-902', productId: 'prod-002', formulaId: 'form-002', quantityRequested: 150, quantityProduced: 0, startDate: '2026-06-04', status: 'In Production' },
  { id: 'mo-perfume-903', productId: 'prod-003', formulaId: 'form-003', quantityRequested: 500, quantityProduced: 500, startDate: '2026-05-20', status: 'Released', costSummary: { materialCost: 35000, packagingCost: 12000, laborCost: 18000, overheadCost: 8000, lossCost: 2000, totalCost: 75000, costPerPiece: 150.00 } },
  { id: 'mo-perfume-904', productId: 'prod-004', formulaId: 'form-004', quantityRequested: 300, quantityProduced: 0, startDate: '2026-06-08', status: 'Material Issued' },
  { id: 'mo-perfume-905', productId: 'prod-005', formulaId: 'form-001', quantityRequested: 100, quantityProduced: 0, startDate: '2026-06-09', status: 'Weighing' },
  { id: 'mo-perfume-906', productId: 'prod-006', formulaId: 'form-002', quantityRequested: 400, quantityProduced: 400, startDate: '2026-05-15', status: 'Released', costSummary: { materialCost: 28000, packagingCost: 10000, laborCost: 15000, overheadCost: 6000, lossCost: 1000, totalCost: 60000, costPerPiece: 150.00 } },
  { id: 'mo-perfume-907', productId: 'prod-007', formulaId: 'form-003', quantityRequested: 200, quantityProduced: 0, startDate: '2026-06-07', status: 'Created' },
  { id: 'mo-perfume-908', productId: 'prod-008', formulaId: 'form-004', quantityRequested: 80, quantityProduced: 80, startDate: '2026-05-28', status: 'Finished Goods QC' },
  { id: 'mo-perfume-909', productId: 'prod-009', formulaId: 'form-001', quantityRequested: 600, quantityProduced: 600, startDate: '2026-05-10', status: 'Released', costSummary: { materialCost: 48000, packagingCost: 18000, laborCost: 25000, overheadCost: 10000, lossCost: 3000, totalCost: 104000, costPerPiece: 173.33 } },
  { id: 'mo-perfume-910', productId: 'prod-010', formulaId: 'form-002', quantityRequested: 120, quantityProduced: 0, startDate: '2026-06-10', status: 'Created' }
];

export const REPAIR_TICKETS: RepairTicket[] = [];
export const PM_TASKS: PMTask[] = [];
export const SPARE_PARTS: SparePart[] = [
  { id: 'sp-1', name: 'High-pressure Spray Nozzle N90', code: 'SP-VLV-PV90', stock: 12, minStock: 15, machineId: 'mac-2' },
  { id: 'sp-2', name: 'High-shear Impeller Blade B2', code: 'SP-MIX-B2', stock: 4, minStock: 2, machineId: 'mac-1' }
];

export const ATTENDANCE: AttendanceRecord[] = [];
export const LEAVE_REQUESTS: LeaveRequest[] = [];
export const OT_REQUESTS: OTRequest[] = [];
export const PAYROLL_PERIODS: PayrollPeriod[] = [
  { id: 'pr-2026-05', periodName: 'May 2026', startDate: '2026-05-01', endDate: '2026-05-31', status: 'Posted' }
];
export const PAYSLIPS: Payslip[] = [];

export const TRANSACTIONS: AccountTransaction[] = [
  { id: 'tx-001', date: '2026-05-15', type: 'Credit', category: 'Revenue', amount: 512500, description: 'Wholesale Chérie Rose sales deposit' },
  { id: 'tx-002', date: '2026-05-28', type: 'Debit', category: 'Expense', amount: 150700, description: 'Direct Plant Wages block dispatch' }
];

export const INVOICES: Invoice[] = [];
export const SUPPLIER_BILLS: SupplierBill[] = [];

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', user: 'กิตติพงษ์ เลิศอัครเดช', role: 'Admin', action: 'ระบบบูตระบบและปรับแต่งการสืบค้นข้อมูลเสร็จสมบูรณ์', timestamp: '2026-06-03 08:30:00', module: 'System' },
  { id: 'log-2', user: 'ดร. นิรุตต์ ตั้งจิตประสงค์', role: 'Admin', action: 'อนุมัติสูตรน้ำหอม Rose Concentric Blend v3.1 สำหรับสเกลพรีเมียม', timestamp: '2026-06-04 01:25:00', module: 'Production' },
  { id: 'log-3', user: 'อนงค์นาฏ ทรัพย์มงคล', role: 'Admin', action: 'ออกใบสลิปเงินเดือนของพนักงานรอบพฤษภาคม 2026 ทั้งหมด 22 ใบ', timestamp: '2026-06-05 10:14:00', module: 'HR' },
  { id: 'log-4', user: 'สมชาย ไวกิจการ', role: 'Admin', action: 'สแกน QR Code และปิดงานใบแจ้งซ่อมเครื่องบ่ม MX-Rose อะไหล่วาล์วใหม่', timestamp: '2026-06-06 14:22:00', module: 'Maintenance' },
  { id: 'log-5', user: 'ศิริพร บุญครองกุล', role: 'Admin', action: 'ลงราทึกยอดซื้อใบสำคัญจ่าย Direct Raw Material OPEX ประจำงวด', timestamp: '2026-06-07 09:12:00', module: 'Accounting' },
  { id: 'log-6', user: 'ดร. ลลิตา วรโชติสกุล', role: 'Admin', action: 'ตรวจสอบและเซ็นอนุมัติใบประกันคุณภาพ COA สารตั้งต้นสบู่กุหลาบฝรั่งเศส', timestamp: '2026-06-08 11:45:00', module: 'Production' },
  { id: 'log-7', user: 'ธนวัชร รัตนเวชศาสน์', role: 'Admin', action: 'เริ่มต้นขบวนการบ่มผสมวัตถุดิบและกวนสารเบอร์กาม็อท Lot #05002', timestamp: '2026-06-08 13:00:00', module: 'Production' },
  { id: 'log-8', user: 'นายกิตติ์ธนา คำมูล', role: 'Admin', action: 'ปรับเซ็ตระบบอินเทอร์เน็ตโรงงาน และทดสอบระบบ IoT เกตเวย์อุณหภูมิ', timestamp: '2026-06-09 16:50:00', module: 'System' },
  { id: 'log-9', user: 'ศิริพร บุญครองกุล', role: 'Admin', action: 'ปรับเปลี่ยนหมวดเลขที่บัญชี COA 1010 และปรับปรุงสมุดรายวันทั่วไป', timestamp: '2026-06-09 17:05:00', module: 'Accounting' },
  { id: 'log-10', user: 'กิตติพงษ์ เลิศอัครเดช', role: 'Admin', action: 'แก้ไขและอนุมัติสัญญาโครงการและเปิดลิงค์ลูกค้าบน Google Drive อัตโนมัติ', timestamp: '2026-06-10 08:25:00', module: 'System' }
];

export const GOODS_RECEIPTS: GoodsReceipt[] = [];
export const PURCHASE_ORDERS: PurchaseOrder[] = [];
export const PURCHASE_REQUESTS: PurchaseRequest[] = [];
export const QC_INSPECTIONS: QCInspection[] = [
  {
    id: 'qc-inspect-1',
    sourceType: 'Bulk',
    referenceId: 'LOT-ROSE-202605',
    inspector: 'ดร. ลลิตา วรโชติสกุล',
    status: 'Pending',
    parameters: [
      { name: 'Odor standard comparison', value: 'Conforms to Pure Rose Centric', expected: 'Pass standard deviation', passed: true },
      { name: 'Appearance and clarity', value: 'Clear slightly pinkish', expected: 'Must be clear', passed: true },
      { name: 'Purity concentration', value: '99.4%', expected: '>= 99.0%', passed: true }
    ],
    createdAt: '2026-06-08'
  }
];
