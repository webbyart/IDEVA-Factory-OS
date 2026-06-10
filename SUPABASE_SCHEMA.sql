-- =================================================================================
-- 🌎 IDEVA Factory OS v2.0 - SUPABASE ENTERPRISE DATABASE SCHEMA & SEED DATA
-- Dialect: PostgreSQL (Supabase Default)
-- Purpose: 1. Setup 'factory_data' for 100% Real-Time Cloud State Sync & Persistence
--          2. Setup Relational Database Tables for all core ERP & MES modules
--          3. Seed 10 realistic simple data records (10 lists) for each major table
-- Instructions: Copy and run this entire script within the Supabase SQL Editor.
-- =================================================================================

-- =================================================================================
-- PART 1: STATE SYNCHRONIZATION ENGINE (For 100% persistent live system state)
-- =================================================================================

CREATE TABLE IF NOT EXISTS public.factory_data (
    id TEXT PRIMARY KEY,
    state JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe setup Row Level Security (RLS) on State Syner
ALTER TABLE public.factory_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read" ON public.factory_data;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.factory_data;
DROP POLICY IF EXISTS "Allow anonymous update" ON public.factory_data;
DROP POLICY IF EXISTS "Allow anonymous delete" ON public.factory_data;

CREATE POLICY "Allow anonymous read" ON public.factory_data FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON public.factory_data FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.factory_data FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON public.factory_data FOR DELETE TO anon USING (true);


-- =================================================================================
-- PART 2: THE HIGH-FIDELITY RELATIONAL DATABASE TABLES (For direct Postgres SQL)
-- =================================================================================

-- Drop existing tables to avoid duplicate constraint errors
DROP TABLE IF EXISTS account_transactions CASCADE;
DROP TABLE IF EXISTS payslips CASCADE;
DROP TABLE IF EXISTS payroll_periods CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS repair_tickets CASCADE;
DROP TABLE IF EXISTS pm_tasks CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS qc_inspections CASCADE;
DROP TABLE IF EXISTS goods_receipts CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS purchase_requests CASCADE;
DROP TABLE IF EXISTS manufacturing_orders CASCADE;
DROP TABLE IF EXISTS formula_details CASCADE;
DROP TABLE IF EXISTS formula_headers CASCADE;
DROP TABLE IF EXISTS material_master CASCADE;
DROP TABLE IF EXISTS product_master CASCADE;
DROP TABLE IF EXISTS supplier_master CASCADE;
DROP TABLE IF EXISTS customer_master CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Master structures DDL
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    permitted_menus TEXT[] NOT NULL
);

CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'Active' CHECK(status IN ('Active', 'On Leave', 'Suspended')),
    salary NUMERIC(12,2) NOT NULL,
    allowance NUMERIC(12,2) DEFAULT 0.00,
    joining_date DATE NOT NULL,
    skills TEXT[],
    line_user_id VARCHAR(100),
    citizen_id VARCHAR(30)
);

CREATE TABLE customer_master (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50),
    address TEXT
);

CREATE TABLE supplier_master (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100)
);

CREATE TABLE product_master (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    min_stock INTEGER DEFAULT 10,
    stock_level INTEGER DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL,
    sell_price NUMERIC(12,2) NOT NULL
);

CREATE TABLE material_master (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) CHECK(category IN ('Raw Material', 'Packaging')),
    min_stock NUMERIC(12,2) DEFAULT 10.00,
    stock_level NUMERIC(12,2) DEFAULT 0.00,
    unit VARCHAR(20) NOT NULL,
    cost_per_unit NUMERIC(12,2) NOT NULL
);

CREATE TABLE formula_headers (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES product_master(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Draft', 'Pending Review', 'Approved', 'Archived')),
    approved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE formula_details (
    id SERIAL PRIMARY KEY,
    formula_id VARCHAR(50) REFERENCES formula_headers(id) ON DELETE CASCADE,
    material_id VARCHAR(50) REFERENCES material_master(id) ON DELETE CASCADE,
    quantity_required NUMERIC(12,4) NOT NULL
);

CREATE TABLE manufacturing_orders (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES product_master(id),
    formula_id VARCHAR(50) REFERENCES formula_headers(id),
    quantity_requested NUMERIC(12,2) NOT NULL,
    quantity_produced NUMERIC(12,2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Created' CHECK (status IN ('Created', 'Material Reserved', 'Material Issued', 'Weighing', 'In Production', 'Packaging', 'Finished Goods QC', 'Released', 'Cancelled')),
    material_cost NUMERIC(12,2),
    packaging_cost NUMERIC(12,2),
    labor_cost NUMERIC(12,2),
    overhead_cost NUMERIC(12,2),
    loss_cost NUMERIC(12,2),
    total_cost NUMERIC(12,2),
    cost_per_piece NUMERIC(12,2)
);

CREATE TABLE purchase_requests (
    id VARCHAR(50) PRIMARY KEY,
    material_id VARCHAR(50) REFERENCES material_master(id),
    quantity NUMERIC(12,2) NOT NULL,
    urgency VARCHAR(20) CHECK(urgency IN ('Low', 'Medium', 'High')),
    status VARCHAR(30) CHECK(status IN ('Draft', 'Approved', 'Ordered', 'Rejected')),
    requested_by VARCHAR(100) NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    pr_id VARCHAR(50) REFERENCES purchase_requests(id) ON DELETE SET NULL,
    supplier_id VARCHAR(50) REFERENCES supplier_master(id),
    material_id VARCHAR(50) REFERENCES material_master(id),
    quantity NUMERIC(12,2) NOT NULL,
    total_cost NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Issued', 'Partially Received', 'Completed', 'Cancelled')),
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE goods_receipts (
    id VARCHAR(50) PRIMARY KEY,
    po_id VARCHAR(50) REFERENCES purchase_orders(id),
    supplier_id VARCHAR(50) REFERENCES supplier_master(id),
    material_id VARCHAR(50) REFERENCES material_master(id),
    quantity_received NUMERIC(12,2) NOT NULL,
    lot_number VARCHAR(100) UNIQUE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Pending QC', 'QC Approved', 'QC Rejected')),
    created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE qc_inspections (
    id VARCHAR(50) PRIMARY KEY,
    source_type VARCHAR(30) CHECK(source_type IN ('Incoming', 'Finished Goods')),
    reference_id VARCHAR(100) NOT NULL,
    inspector VARCHAR(150) NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK(status IN ('Pending', 'Passed', 'Failed')),
    parameters JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE machines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    section VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Online' CHECK (status IN ('Online', 'Offline', 'Repairing', 'Under PM')),
    qr_code_url VARCHAR(255),
    installed_date DATE NOT NULL,
    mtbf_hours NUMERIC(8,2),
    mttr_hours NUMERIC(6,2)
);

CREATE TABLE pm_tasks (
    id VARCHAR(50) PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    interval_days INTEGER NOT NULL,
    due_by DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Overdue'))
);

CREATE TABLE repair_tickets (
    id VARCHAR(50) PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE CASCADE,
    requested_by VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(30) CHECK(status IN ('Open', 'Assigned', 'In Progress', 'Resolved')),
    assigned_technician VARCHAR(150),
    root_cause TEXT,
    corrective_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIME NOT NULL,
    check_out TIME,
    gps_lat NUMERIC(9,6),
    gps_lng NUMERIC(9,6),
    status VARCHAR(20) CHECK(status IN ('Present', 'Late', 'Absent')),
    UNIQUE(employee_id, date)
);

CREATE TABLE payroll_periods (
    id VARCHAR(50) PRIMARY KEY,
    period_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Draft', 'Approved', 'Posted'))
);

CREATE TABLE payslips (
    id VARCHAR(50) PRIMARY KEY,
    payroll_period_id VARCHAR(50) REFERENCES payroll_periods(id),
    employee_id VARCHAR(50) REFERENCES employees(id),
    base_salary NUMERIC(12,2) NOT NULL,
    ot_pay NUMERIC(12,2) DEFAULT 0.00,
    allowance_sum NUMERIC(12,2) DEFAULT 0.00,
    bonus NUMERIC(12,2) DEFAULT 0.00,
    sso_deduction NUMERIC(12,2) DEFAULT 0.00,
    tax_deduction NUMERIC(12,2) DEFAULT 0.00,
    net_pay NUMERIC(12,2) NOT NULL,
    pdf_generated BOOLEAN DEFAULT FALSE
);

CREATE TABLE account_transactions (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(10) CHECK(type IN ('Debit', 'Credit')),
    category VARCHAR(50) CHECK(category IN ('Revenue', 'AP', 'AR', 'Expense', 'Tax', 'Payroll Posting', 'Production Cost Posting')),
    amount NUMERIC(12,2) NOT NULL,
    description VARCHAR(255) NOT NULL
);

-- Audit logs
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    "user" VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action TEXT NOT NULL,
    timestamp VARCHAR(30) NOT NULL,
    module VARCHAR(50) NOT NULL
);


-- =================================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) ON ALL RELATIONAL TABLES FOR APP ACCESS
-- =================================================================================
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_master DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_master DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_master DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_master DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_headers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturing_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;


-- =================================================================================
-- PART 3: 10 SEED RECORDS PER PRIMARY TABLE (10 Lists simple data)
-- =================================================================================

-- 1. DEPARTMENTS (10 rows)
INSERT INTO departments (id, name, code) VALUES
('dept-1', 'ฝ่ายบริหารจัดการและอำนวยการ', 'ADM'),
('dept-2', 'ฝ่ายผลิตและบ่มปรุงน้ำหอม', 'PRD'),
('dept-3', 'ฝ่ายควบคุมและประกันคุณภาพ (QA/QC)', 'QAQC'),
('dept-4', 'ฝ่ายวิศวกรรมระบบและซ่อมบำรุง', 'MNT'),
('dept-5', 'ฝ่ายบริหารทรัพยากรบุคคล', 'HR'),
('dept-6', 'ฝ่ายบัญชีและการเงินโรงงาน', 'ACC'),
('dept-7', 'ฝ่ายจัดซื้อจัดหาเคมีภัณฑ์ดิบ', 'PUR'),
('dept-8', 'ฝ่ายคลังสินค้าและซัพพลายเชน', 'WMS'),
('dept-9', 'ฝ่ายวิจัยแล็บและพัฒนาสูตร R&D', 'RD'),
('dept-10', 'ฝ่ายขายและการค้าต่างประเทศ', 'SLS');

-- 2. ROLES (11 rows)
INSERT INTO roles (id, name, permitted_menus) VALUES
('role-admin', 'ผู้จัดการทั่วไป (General Admin)', ARRAY['Production', 'Maintenance', 'HR', 'Accounting', 'Developer']),
('role-mgmt', 'ผู้บริหารระดับสูง (Management)', ARRAY['Production', 'Maintenance', 'HR', 'Accounting']),
('role-sales', 'เจ้าหน้าที่ฝ่ายขายและสั่งออก', ARRAY['Accounting']),
('role-rd', 'นักปรุงแต่งกลิ่นน้ำหอม (Perfumer / R&D)', ARRAY['Production']),
('role-purchase', 'เจ้าหน้าที่จัดซื้อสารเคมีดิบ', ARRAY['Production', 'Accounting']),
('role-wh', 'ผู้ดูแลคลังกระจายสินค้าวัตถุดิบ', ARRAY['Production']),
('role-qc', 'เจ้าหน้าที่ตรวจสอบคุณภาพแล็บ (QC)', ARRAY['Production']),
('role-prod', 'หัวหน้าทีมควบคุมหม้อกลั่นผสม', ARRAY['Production']),
('role-maint', 'ช่างเทคนิคซ่อมบำรุงระบบดักซึม', ARRAY['Maintenance']),
('role-hr', 'เจ้าหน้าที่งานบุคคลและอัตราจ้าง', ARRAY['HR']),
('role-acc', 'เจ้าหน้าที่บัญชีโรงงาน', ARRAY['Accounting']);

-- 3. EMPLOYEES (10 rows)
INSERT INTO employees (id, name, email, department_id, role_id, status, salary, allowance, joining_date, skills, line_user_id, citizen_id) VALUES
('emp-101', 'กิตติพงษ์ เลิศอัครเดช', 'kittipong@factory.com', 'dept-1', 'role-admin', 'Active', 120000, 10000, '2023-01-15', ARRAY['SAP ERP', 'Perfume Formulation Specialist', 'Executive Leadership'], NULL, NULL),
('emp-102', 'อนงค์นาฏ ทรัพย์มงคล', 'anongnart@factory.com', 'dept-5', 'role-hr', 'Active', 75000, 4000, '2023-05-10', ARRAY['Conflict Resolution', 'Corporate Payroll', 'Training Programs'], NULL, NULL),
('emp-103', 'ธนวัชร รัตนเวชศาสน์', 'thanawat@factory.com', 'dept-2', 'role-prod', 'Active', 65000, 6000, '2024-02-12', ARRAY['Perfume Blender', 'Maturation Control', 'Weighing Precision'], NULL, NULL),
('emp-104', 'ดร. ลลิตา วรโชติสกุล', 'lalita@factory.com', 'dept-3', 'role-qc', 'Active', 68000, 4000, '2024-03-01', ARRAY['Gas Chromatography', 'ISO 22716 Cosmetics GMP'], NULL, NULL),
('emp-105', 'สมชาย ไวกิจการ', 'somchai@factory.com', 'dept-4', 'role-maint', 'Active', 72000, 5000, '2023-11-20', ARRAY['Pneumatic Pumps', 'Aerosol Filling Repair'], NULL, NULL),
('emp-106', 'ศิริพร บุญครองกุล', 'siriporn@factory.com', 'dept-6', 'role-acc', 'Active', 85000, 3000, '2023-08-15', ARRAY['BOI Tax Incentives', 'Standard Costing'], NULL, NULL),
('emp-107', 'ดร. นิรุตต์ ตั้งจิตประสงค์', 'niroot@factory.com', 'dept-9', 'role-rd', 'Active', 95000, 8000, '2022-09-01', ARRAY['Scent Engineering', 'Synthetics Sourcing'], NULL, NULL),
('emp-108', 'วรวิทย์ ศิลปบรรเลง', 'worawit@factory.com', 'dept-2', 'role-rd', 'Active', 55000, 2000, '2025-01-10', ARRAY['Aromatherapy', 'Odor Control'], NULL, NULL),
('emp-109', 'ณัฐพล แก้ววิเศษ', 'nattapon@factory.com', 'dept-8', 'role-wh', 'Active', 32000, 1500, '2024-06-25', ARRAY['Forklift License', 'WMS Audits'], NULL, NULL),
('emp-999', 'นายกิตติ์ธนา คำมูล', 'kittithana.km@factory.com', 'dept-4', 'role-maint', 'Active', 14000, 0, '2020-04-12', ARRAY['Computer Networking', 'IoT Systems', 'Database Admin'], 'Ue26ade3b0cd4d6eda90f72436e4c5a43', '1-1022-00543-12-9');

-- 4. CUSTOMER_MASTER (10 rows)
INSERT INTO customer_master (id, name, code, email, phone, address) VALUES
('cust-1', 'บริษัท คิงพาวเวอร์ บิวตี้ ดิสทริบิวชั่น จำกัด', 'CUST-KINGPOWER', 'dutyfree-beauty@kingpower.co.th', '+66-2-677-8888', 'ศรีวารี, สมุทรปราการ, ประเทศไทย'),
('cust-2', 'บริษัท มัทสึโมโตะ คิโยชิ โฮลดิ้ง ประเทศไทย LLC', 'CUST-MATSU', 'b2b-procurement@matsukiyo.co.th', '+66-2-589-3344', 'ห้วยขวาง, กรุงเทพมหานคร, ประเทศไทย'),
('cust-3', 'กลุ่มธุรกิจสปารับจ้างผลิต แอนนิแมค โกรฟ สยาม', 'CUST-ANIMAC', 'oem-contract@animac.com', '+66-2-332-1111', 'อ.แม่ริม, เชียงใหม่, ประเทศไทย'),
('cust-4', 'บริษัท เดอะมอลล์ กรุ๊ป พารากอน ดีพาร์ทเมนท์', 'CUST-THEMALL', 'procurement@themall.co.th', '+66-2-310-1000', 'คลองเตย, กรุงเทพมหานคร, ประเทศไทย'),
('cust-5', 'บริษัท เซ็นทรัลดีพาร์ทเมนท์สโตร์ จำกัด', 'CUST-CENTRAL', 'procurement@central.co.th', '+66-2-793-7000', 'ชิดลม, กรุงเทพฯ, ประเทศไทย'),
('cust-6', 'บริษัท คอสเมด กรุ๊ป เอเชีย จำกัด', 'CUST-COSMED', 'order@cosmedgroup.co.th', '+66-2-890-5000', 'บางบอน, กรุงเทพฯ, ประเทศไทย'),
('cust-7', 'บริษัท นิวบิวตี้ รีเทล เฮ้าส์ จำกัด', 'CUST-NEWBEAUTY', 'supply@newbeauty.co.th', '+66-34-450-999', 'อ.กระทุ่มแบน, สมุทรสาคร, ประเทศไทย'),
('cust-8', 'บริษัท พารารอยัล บิวตี้ ประเทศไทย จำกัด', 'CUST-ROYAL', 'royal_order@pararoyal.co.th', '+66-2-123-4567', 'ลาดพร้าว, กรุงเทพฯ, ประเทศไทย'),
('cust-9', 'บริษัท มาดามอโรมาอินเตอร์เนชั่นแนล จำกัด', 'CUST-AROMA', 'import@madamearoma.com', '+66-2-901-2030', 'อ.ปากเกร็ด, นนทบุรี, ประเทศไทย'),
('cust-10', 'บริษัท ลักซูรี่ บูทีค สกินแคร์ แอนด์ เวลเนส จำกัด', 'CUST-LUXURY', 'boutiquebg@luxswell.co.th', '+66-2-331-5001', 'ปทุมวัน, กรุงเทพฯ, ประเทศไทย');

-- 5. SUPPLIER_MASTER (10 rows)
INSERT INTO supplier_master (id, name, code, contact_person, phone, email) VALUES
('supp-1', 'Robertet Fragrance Distillery (Grasse, France)', 'SUPP-ROB-FR', 'Jean-Luc Grasse', '+33-4-9340-3300', 'contact@robertet.fr'),
('supp-2', 'บริษัท ไทยแพคเกจจิ้ง แอนด์ ลักซูรี่ บ็อกซ์ จำกัด', 'SUPP-THAI-PACK', 'พิมพ์ลดา จรัสแสง', '+66-2-440-9988', 'sales@thaipacklux.co.th'),
('supp-3', 'ศิริมงคล เคมีคอล แอดดิทิฟส์ ผู้ส่งเอทานอล', 'SUPP-SIRI-CHEM', 'สมพล ไพบูลย์', '+66-2-711-2334', 'info@sirichem.co.th'),
('supp-4', 'Givaudan Fragrance Components (Singapore)', 'SUPP-GIV-SG', 'Lim Wei Meng', '+65-6751-9100', 'singapore.sales@givaudan.com'),
('supp-5', 'Firmenich Essential Sourcing (Zürich, Switzerland)', 'SUPP-FIR-SUI', 'Hans Peter', '+41-22-780-2211', 'sourcing@firmenich.ch'),
('supp-6', 'บริษัท สยามแก้วโมเดิร์นกลาส จำกัด', 'SUPP-SIAMGLASS', 'ชูศักดิ์ รุ่งเรือง', '+66-2-882-3500', 'support@siamglass.co.th'),
('supp-7', 'Symrise Natural Aromatics (Holzminden, Germany)', 'SUPP-SYM-DE', 'Dieter Müller', '+49-5531-90-0', 'info.de@symrise.com'),
('supp-8', 'บริษัท วีกรุ๊ปกล่องกระดาษสัมผัสแป้ง จำกัด', 'SUPP-VGROUP', 'วิไลวรรณ เจริญสุข', '+66-2-990-1122', 'vgroup_box@gmail.com'),
('supp-9', 'บริษัท เอเชียนโซลเว้นท์ ดิสทริบิวเตอร์ จำกัด', 'SUPP-ASIAN_SOLV', 'โกวิท บูรณพิมพ์', '+66-2-441-3000', 'kovit@asiansolvent.com'),
('supp-10', 'Takasago International Fine Chemicals (Tokyo, Japan)', 'SUPP-TAKASAGO', 'Rei Takahashi', '+81-3-5744-1111', 't_chem@takasago.com');

-- 6. PRODUCT_MASTER (10 rows)
INSERT INTO product_master (id, sku, name, category, min_stock, stock_level, unit, cost_price, sell_price) VALUES
('prod-001', 'PFM-CHRE-100', 'กลิ่น Chérie Rose Eau de Parfum (EDP) 100ml', 'น้ำหอมผู้หญิง (EDP)', 50, 120, 'ขวด', 450.00, 2450.00),
('prod-002', 'PFM-MOUD-50', 'กลิ่น Midnight Oud Extrait de Parfum 50ml', 'น้ำหอมพรีเมียมเข้มข้น', 30, 45, 'ขวด', 850.00, 4200.00),
('prod-003', 'PFM-SCIT-150', 'กลิ่น Summer Citrus Refreshing Body Mist 150ml', 'บอดี้มิสต์บางเบา', 100, 85, 'ขวด', 180.00, 690.00),
('prod-004', 'PFM-JASM-100', 'กลิ่น Jasmine Blossom Signature Cologne 100ml', 'น้ำหอมโคโลญจน์', 40, 60, 'ขวด', 280.00, 1250.00),
('prod-005', 'PFM-VANIL-50', 'กลิ่น Sweet Velvet Vanilla Extrait 50ml', 'น้ำหอมยูนิเซ็กส์พรีเมียม', 30, 40, 'ขวด', 650.00, 3800.00),
('prod-006', 'PFM-LAV-100', 'กลิ่น Deep Lavender Sleep Well Pillow Mist 100ml', 'สเปรย์หอมเพื่อการนอนหลับ', 100, 150, 'ขวด', 120.00, 490.00),
('prod-007', 'PFM-SAND-100', 'กลิ่น Sandalwood Mystic Temple EDP 100ml', 'น้ำหอมผู้ชายวู้ดดี้สไปซี่', 40, 55, 'ขวด', 520.00, 2900.00),
('prod-008', 'PFM-AMB-50', 'กลิ่น Amber Imperial Warm Glow Extrait 50ml', 'น้ำหอมแอมเบอร์ตะวันออก', 20, 25, 'ขวด', 780.00, 4500.00),
('prod-009', 'PFM-BERG-100', 'กลิ่น Bergamot Zest Fresh Splash Sport Cologne 100ml', 'น้ำหอมสปอร์ตโคโลญจน์', 60, 70, 'ขวด', 240.00, 1150.00),
('prod-010', 'PFM-PATCH-50', 'กลิ่น Vintage Patchouli Velvet Cologne 50ml', 'น้ำหอมพิมเสนอโรมาติก', 30, 35, 'ขวด', 310.00, 1550.00);

-- 7. MATERIAL_MASTER (10 rows)
INSERT INTO material_master (id, code, name, category, min_stock, stock_level, unit, cost_per_unit) VALUES
('mat-001', 'RAW-ESS-ROSE', 'สารสกัดน้ำมันหอมระเหยกุหลาบฝรั่งเศส (French Rose Centric Oil)', 'Raw Material', 200, 450, 'ลิตร', 850.00),
('mat-002', 'RAW-ESS-OUD', 'สารสกัดไม้กฤษณาธรรมชาติระดับพรีเมียม (Natural Agarwood Oud Oil)', 'Raw Material', 20, 15, 'ลิตร', 4500.00),
('mat-003', 'RAW-ESS-JASM', 'สารสกัดมะลิไทยสดบริสุทธิ์เข้มข้น (Thai Jasmine Absolute Oil)', 'Raw Material', 100, 180, 'ลิตร', 1800.00),
('mat-004', 'RAW-ESS-BERG', 'น้ำมันผิวส้มอิตาเลียนเบอร์กาม็อท (Italian Bergamot Citrus Oil)', 'Raw Material', 150, 320, 'ลิตร', 950.00),
('mat-005', 'RAW-ESS-VANIL', 'สารสกัดโกโก้เบอร์เบินวนิลลา (Madagascar Bourbon Vanilla Extract)', 'Raw Material', 80, 95, 'ลิตร', 2100.00),
('mat-006', 'RAW-SOLV-ETH', 'เอทานอลแปลงสภาพบริสุทธิ์สูง 99.9% (De-odorized Ethanol)', 'Raw Material', 2000, 4500, 'ลิตร', 85.00),
('mat-007', 'RAW-FIX-MSK', 'สารละลายมัสก์ช่วยตรึงกลิ่นหอมทนนาน (Musk Fixative Base)', 'Raw Material', 200, 180, 'กิโลกรัม', 350.00),
('mat-010', 'PKG-BTL-100G', 'ขวดแก้วเหลี่ยมฝาโลหะทองคัตทีงคริสตัล 100ml', 'Packaging', 1000, 2500, 'ขวด', 45.00),
('mat-011', 'PKG-BTL-50', 'ขวดแก้วทรงหรูพร้อมปลอกสัมผัสแบบสเปรย์ 50ml', 'Packaging', 1000, 900, 'ขวด', 35.00),
('mat-012', 'PKG-CAP-MIST', 'หัวฉีดแบบพ่นสเปรย์ระดับไมครอนคอเกลียวสีทองพรีเมียม', 'Packaging', 2000, 3200, 'ชิ้น', 12.00);

-- 8. FORMULA_HEADERS (10 rows)
INSERT INTO formula_headers (id, product_id, version, status, approved_by) VALUES
('form-001', 'prod-001', 'สเกลกลั่น 3.1', 'Approved', 'ดร. นิรุตต์ ตั้งจิตประสงค์'),
('form-002', 'prod-002', 'เข้มข้นสูงพิเศษ 1.0b', 'Approved', 'กิตติพงษ์ เลิศอัครเดช'),
('form-003', 'prod-003', 'สลัดส้มคงทน 2.2', 'Approved', 'ดร. นิรุตต์ ตั้งจิตประสงค์'),
('form-004', 'prod-004', 'ความคงตัวโคโลญจ์ 1.1', 'Approved', 'ดร. ลลิตา วรโชติสกุล'),
('form-005', 'prod-005', 'โมเลกุลคู่ 1.0', 'Approved', 'ดร. นิรุตต์ ตั้งจิตประสงค์'),
('form-006', 'prod-006', 'บดบ่มฟุ้งกระจาย 2.0', 'Approved', 'กิตติพงษ์ เลิศอัครเดช'),
('form-007', 'prod-007', 'แก่นไม้จันทน์ 1.3', 'Approved', 'ดร. ลลิตา วรโชติสกุล'),
('form-008', 'prod-008', 'แอมเบอร์อบอุ่น 1.1', 'Approved', 'ดร. นิรุตต์ ตั้งจิตประสงค์'),
('form-009', 'prod-009', 'สปอร์ตเฟรช 1.0', 'Approved', 'ดร. ลลิตา วรโชติสกุล'),
('form-010', 'prod-010', 'พิมเสนเก๋า 1.2b', 'Approved', 'กิตติพงษ์ เลิศอัครเดช');

-- 9. FORMULA_DETAILS (10 mappings of ingredients ratio)
INSERT INTO formula_details (formula_id, material_id, quantity_required) VALUES
('form-001', 'mat-001', 0.1500),
('form-001', 'mat-006', 0.8000),
('form-001', 'mat-007', 0.0500),
('form-002', 'mat-002', 0.3500),
('form-002', 'mat-006', 0.6000),
('form-002', 'mat-007', 0.0500),
('form-003', 'mat-004', 0.1200),
('form-003', 'mat-005', 0.0300),
('form-003', 'mat-006', 0.8500),
('form-004', 'mat-003', 0.1000),
('form-004', 'mat-006', 0.9000);

-- 10. MANUFACTURING_ORDERS (10 rows)
INSERT INTO manufacturing_orders (id, product_id, formula_id, quantity_requested, quantity_produced, start_date, status, material_cost, packaging_cost, labor_cost, overhead_cost, loss_cost, total_cost, cost_per_piece) VALUES
('mo-perfume-901', 'prod-001', 'form-001', 250.00, 250.00, '2026-06-01', 'Released', 45000.00, 8000.00, 12000.00, 5500.00, 1200.00, 71700.00, 286.80),
('mo-perfume-902', 'prod-002', 'form-002', 150.00, 0.00, '2026-06-04', 'In Production', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('mo-perfume-903', 'prod-003', 'form-003', 500.00, 500.00, '2026-05-20', 'Released', 35000.00, 12000.00, 18000.00, 8000.00, 2000.00, 75000.00, 150.00),
('mo-perfume-904', 'prod-004', 'form-004', 300.00, 0.00, '2026-06-08', 'Material Issued', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('mo-perfume-905', 'prod-005', 'form-005', 100.00, 0.00, '2026-06-09', 'Weighing', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('mo-perfume-906', 'prod-006', 'form-006', 400.00, 400.00, '2026-05-15', 'Released', 28000.00, 10000.00, 15000.00, 6000.00, 1000.00, 60000.00, 150.00),
('mo-perfume-907', 'prod-007', 'form-007', 200.00, 0.00, '2026-06-07', 'Created', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('mo-perfume-908', 'prod-008', 'form-008', 80.00, 80.00, '2026-05-28', 'Finished Goods QC', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('mo-perfume-909', 'prod-009', 'form-009', 600.00, 600.00, '2026-05-10', 'Released', 48000.00, 18000.00, 25000.00, 10000.00, 3000.00, 104000.00, 173.33),
('mo-perfume-910', 'prod-010', 'form-010', 120.00, 0.00, '2026-06-10', 'Created', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- 11. AUDIT_LOGS (10 rows)
INSERT INTO audit_logs (id, "user", role, action, timestamp, module) VALUES
('log-1', 'กิตติพงษ์ เลิศอัครเดช', 'Admin', 'ระบบบูตระบบและปรับแต่งการสืบค้นข้อมูลเสร็จสมบูรณ์', '2026-06-03 08:30:00', 'System'),
('log-2', 'ดร. นิรุตต์ ตั้งจิตประสงค์', 'R&D', 'อนุมัติสูตรน้ำหอม Rose Concentric Blend v3.1 สำหรับสเกลพรีเมียม', '2026-06-04 01:25:00', 'Production'),
('log-3', 'อนงค์นาฏ ทรัพย์มงคล', 'HR', 'ออกใบสลิปเงินเดือนของพนักงานรอบพฤษภาคม 2026 ทั้งหมด 22 ใบ', '2026-06-05 10:14:00', 'HR'),
('log-4', 'สมชาย ไวกิจการ', 'Maintenance', 'สแกน QR Code และปิดงานใบแจ้งซ่อมเครื่องบ่ม MX-Rose อะไหล่วาล์วใหม่', '2026-06-06 14:22:00', 'Maintenance'),
('log-5', 'ศิริพร บุญครองกุล', 'Accounting', 'ลงราทึกยอดซื้อใบสำคัญจ่าย Direct Raw Material OPEX ประจำงวด', '2026-06-07 09:12:00', 'Accounting'),
('log-6', 'ดร. ลลิตา วรโชติสกุล', 'QAQC', 'ตรวจสอบและเซ็นอนุมัติใบประกันคุณภาพ COA สารตั้งต้นสบู่กุหลาบฝรั่งเศส', '2026-06-08 11:45:00', 'Production'),
('log-7', 'ธนวัชร รัตนเวชศาสน์', 'Production', 'เริ่มต้นขบวนการบ่มผสมวัตถุดิบและกวนสารเบอร์กาม็อท Lot #05002', '2026-06-08 13:00:00', 'Production'),
('log-8', 'นายกิตติ์ธนา คำมูล', 'Maintenance', 'ปรับเซ็ตระบบอินเทอร์เน็ตโรงงาน และทดสอบระบบ IoT เกตเวย์อุณหภูมิ', '2026-06-09 16:50:00', 'System'),
('log-9', 'ศิริพร บุญครองกุล', 'Accounting', 'ปรับเปลี่ยนหมวดเลขที่บัญชี COA 1010 และปรับปรุงสมุดรายวันทั่วไป', '2026-06-09 17:05:00', 'Accounting'),
('log-10', 'กิตติพงษ์ เลิศอัครเดช', 'Admin', 'แก้ไขและอนุมัติสัญญาโครงการและเปิดลิงค์ลูกค้าบน Google Drive อัตโนมัติ', '2026-06-10 08:25:00', 'System');
