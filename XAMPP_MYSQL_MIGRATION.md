# IDEVA Factory OS: local Database Integration & Migration Guide
### Connecting to Local XAMPP MySQL via Prisma ORM & Node.js

This guide explains how to connect **IDEVA Factory OS** to a local **XAMPP MySQL** database (`127.0.0.1` / `localhost`) using **Prisma ORM** when running the application on your local development machine.

---

## 🌎 1. localhost Web Connectivity (ตอบคำถามสำคัญ)

**คำถาม:** *ระบบนี้หากรันบน localhost (เครื่องตนเอง) จะสามารถเชื่อมต่อกับฐานข้อมูล XAMPP phpMyAdmin ที่เป็น 127.0.0.1 ได้หรือไม่?*

**คำตอบ:** 
**ได้ 100% ครับ** เมื่อคุณดึงซอร์สโค้ดนี้ไปรันบนเครื่องคอมพิวเตอร์ของคุณเองผ่านคำสั่ง `npm run dev` ตัว Node.js backend ของแอปพลิเคชันจะทำงานอยู่บนเครื่องของคุณโดยตรง (Local Environment) ทำให้สามารถสื่อสารและเชื่อมต่อไปยัง MySQL Server ของ XAMPP ที่ทำงานอยู่บน IP `127.0.0.1` หรือ `localhost` พอร์ต `3306` ได้อย่างรวดเร็วและปลอดภัยโดยไม่ต้องเปิดรับทราฟฟิกภายนอกใด ๆ

---

## 🛠️ 2. Step-by-Step Local Setup Guide

หลังจากเปิด **XAMPP Control Panel** และกด Start ทั้ง **Apache** และ **MySQL** เรียบร้อยแล้ว ให้ทำตามขั้นตอนการติดตั้งแต่ตั้งค่าต่อไปนี้:

### ขั้นตอนที่ 1: ติดตั้ง Prisma CLI และ Client ในโฟลเดอร์โปรเจกต์
รันคำสั่งเหล่านี้ใน Terminal ของคุณ:
```bash
# 1. ติดตั้ง Prisma CLI เป็น Development Dependency
npm install --save-dev prisma

# 2. ติดตั้ง Prisma Client ซึ่งใช้ดึงข้อมูลใน Backend Code
npm install @prisma/client
```

### ขั้นตอนที่ 2: สร้างโฟลเดอร์สำหรับโมเดลฐานข้อมูล
รันคำสั่งเริ่มต้นของ Prisma:
```bash
npx prisma init
```
คำสั่งนี้จะสร้างโฟลเดอร์ใหม่ชื่อ `/prisma/` พร้อมไฟล์ต้นแบบ `schema.prisma` ขึ้นมาโดยอัตโนมัติ

---

## 🔐 3. Environment Variable Configuration

ให้คัดลอกค่าคอนฟิกไปไว้ในเครื่องมือจัดเก็บไฟล์ลับ `.env` ที่เครื่องคอมพิวเตอร์ของคุณ โดยการกำหนดค่าเชื่อมต่อ MySQL:

```env
# .env (โลคอลสเปซของคุณ)
GEMINI_API_KEY="YOUR_API_KEY_HERE"
APP_URL="http://localhost:3000"

# รูปแบบ URL เชื่อมต่อ: mysql://[ชื่อผู้ใช้]:[รหัสผ่าน]@[เซิร์ฟเวอร์]:[พอร์ต]/[ชื่อฐานข้อมูล]
# สำหรับ XAMPP MySQL ค่าเริ่มต้นมักไม่มีรหัสผ่าน (Password ว่าง) และพอร์ตคือ 3306
DATABASE_URL="mysql://root:@127.0.0.1:3306/ideva_factory_os"
```

*หมายเหตุ: หากคุณได้ทำกรกำหนดรหัสผ่านให้กับผู้ใช้ root บน phpMyAdmin ของคุณ ให้ใส่รหัสผ่านหลัง `root:...` เช่น `mysql://root:my_secure_password@127.0.0.1:3306/ideva_factory_os`*

---

## 📋 4. Sample `schema.prisma` Configuration File

นี่คือไฟล์ตั้งค่าโมเดลฟิลด์ข้อมูลฐานข้อมูล (`/prisma/schema.prisma`) ที่จำลองความซับซ้อนของระบบ **IDEVA Factory OS** ได้อย่างละเอียด เที่ยงตรง และสอดรับกับ Key Relations ที่กำหนดอยู่ใน `server.ts`:

```prisma
// /prisma/schema.prisma

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ---------------------------------------------------------
// 1. MODULE: HR & EMPLOYEES
// ---------------------------------------------------------

model Employee {
  id               String            @id @default(uuid())
  employeeCode     String            @unique
  name             String
  departmentId     String
  roleId           String
  salary           Float             @default(0.0)
  allowance        Float             @default(0.0)
  status           String            @default("Active") // Active, Suspended, Resigned
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  
  // Relations
  attendance       Attendance[]
  payslips         Payslip[]
  manufacturingOps ManufacturingOrder[] @relation("InspectorRelation")
}

model Attendance {
  id         String   @id @default(uuid())
  employeeId String
  date       String   // Format: YYYY-MM-DD
  checkIn    String   // Format: HH:MM
  checkOut   String?  // Format: HH:MM
  status     String   @default("Present") // Present, Late, Absent, On Leave
  latitude   Float?
  longitude  Float?
  createdAt  DateTime @default(now())

  employee   Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
}

// ---------------------------------------------------------
// 2. MODULE: PRODUCTION & MATERIALS
// ---------------------------------------------------------

model Material {
  id              String            @id @default(uuid())
  name            String
  code            String            @unique
  category        String            @default("Raw Material") // Raw Material, Packaging, Chemical
  minStock        Float             @default(0.0)
  stockLevel      Float             @default(0.0)
  unit            String            @default("ลิตร")
  costPerUnit     Float             @default(0.0)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relations
  formulaItems    FormulaItem[]
  purchaseRequests PurchaseRequest[]
  goodsReceipts   GoodsReceipt[]
}

model Product {
  id          String               @id @default(uuid())
  name        String
  sku         String               @unique
  costPrice   Float                @default(0.0)
  sellingPrice Float               @default(0.0)
  stockLevel  Float                @default(0.0)
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  // Relations
  formulas    Formula[]
  moOrders    ManufacturingOrder[]
}

model Formula {
  id          String               @id @default(uuid())
  productId   String
  version     String               @default("v1.0")
  status      String               @default("Approved") // Pending Review, Approved, Obsolete
  approvedBy  String?
  createdAt   DateTime             @default(now())

  product     Product              @relation(fields: [productId], references: [id], onDelete: Cascade)
  items       FormulaItem[]
  moOrders    ManufacturingOrder[]

  @@index([productId])
}

model FormulaItem {
  id         String   @id @default(uuid())
  formulaId  String
  materialId String
  quantity   Float    // Ratio / Percentage (e.g. 0.1250 = 12.50%)

  formula    Formula  @relation(fields: [formulaId], references: [id], onDelete: Cascade)
  material   Material @relation(fields: [materialId], references: [id], onDelete: Restrict)

  @@index([formulaId])
  @@index([materialId])
}

// ---------------------------------------------------------
// 3. MODULE: MANUFACTURING ORDERS (MO) & QUALITY CONTROL (QC)
// ---------------------------------------------------------

model ManufacturingOrder {
  id                String       @id @default(uuid())
  productId         String
  formulaId         String
  quantityRequested Float
  quantityProduced  Float        @default(0.0)
  startDate         String       // YYYY-MM-DD
  status            String       @default("Created") // Created, Material Issued, Finished Goods QC, Released, Cancelled
  inspectorId       String?
  createdAt         DateTime     @default(now())

  product           Product      @relation(fields: [productId], references: [id], onDelete: Restrict)
  formula           Formula      @relation(fields: [formulaId], references: [id], onDelete: Restrict)
  inspector         Employee?    @relation("InspectorRelation", fields: [inspectorId], references: [id])

  @@index([productId])
  @@index([formulaId])
  @@index([inspectorId])
}

model QCInspection {
  id          String   @id @default(uuid())
  sourceType  String   // Incoming, Finished Goods
  referenceId String   // LotNumber or MO_ID
  inspector   String   @default("ดร. ลลิตา วรโชติสกุล")
  status      String   @default("Pending") // Pending, Passed, Failed
  parameters  String   @db.Text // JSON String containing quality criteria parameters
  createdAt   DateTime @default(now())
}

// ---------------------------------------------------------
// 4. MODULE: PROCUREMENT & SUPPLY CHAIN
// ---------------------------------------------------------

model PurchaseRequest {
  id          String   @id @default(uuid())
  materialId  String
  quantity    Float
  urgency     String   @default("Medium") // Low, Medium, High, Critical
  status      String   @default("Draft")  // Draft, Approved, Ordered, Rejected
  requestedBy String   @default("Auto Stock Engine")
  createdAt   DateTime @default(now())

  material    Material @relation(fields: [materialId], references: [id], onDelete: Cascade)

  @@index([materialId])
}

model GoodsReceipt {
  id               String   @id @default(uuid())
  poId             String
  supplierId       String
  materialId       String
  quantityReceived Float
  lotNumber        String   @unique
  expiryDate       String   // YYYY-MM-DD
  status           String   @default("Pending QC") // Pending QC, QC Approved, QC Rejected
  createdAt        DateTime @default(now())

  material         Material @relation(fields: [materialId], references: [id], onDelete: Restrict)

  @@index([materialId])
}

// ---------------------------------------------------------
// 5. MODULE: FINANCIAL ACCOUNTING
// ---------------------------------------------------------

model Payslip {
  id                    String   @id @default(uuid())
  payrollPeriodId       String
  employeeId            String
  baseSalary            Float
  otPay                 Float    @default(0.0)
  allowanceSum          Float    @default(0.0)
  bonus                 Float    @default(0.0)
  ssoDeduction          Float    @default(750.0)
  taxDeduction          Float    @default(0.0)
  netPay                Float
  pdfGenerated          Boolean  @default(false)
  createdAt             DateTime @default(now())

  employee              Employee @relation(fields: [employeeId], references: [id], onDelete: Restrict)

  @@index([employeeId])
}

model LedgerTransaction {
  id          String   @id @default(uuid())
  date        String   // YYYY-MM-DD
  type        String   // Debit, Credit
  category    String
  amount      Float
  description String
  createdAt   DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(uuid())
  user      String
  role      String
  action    String
  timestamp String   // YYYY-MM-DD HH:mm:ss
  module    String   // Production, Maintenance, HR, Accounting, System
  createdAt DateTime @default(now())
}
```

---

## 🔌 5. Setup client.ts Node.js Code Utility 

ให้สร้างไฟล์สำหรับเรียกใช้งาน Prisma Client เกรดระดับโปรดักชัน เพื่อความเสถียรของ Database connection pool ไม่เกิดปัญหา memory leaks หลีกเลี่ยงโพลเซสซ้อนกัน:

```typescript
// /src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // ทำให้สามารถมีตัวแปร prisma บน global space เมื่อตรวจพบในระหว่าง dev mode
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
```

---

## 🔄 6. Database refactoring Examples

เมื่อเชื่อมต่อกับ Prisma เรียบร้อยแล้ว คุณสามารถเปลี่ยนการเข้าถึงข้อมูล Mock State เดิมใน `server.ts` ไปใช้ฐานข้อมูล MySQL จริงได้ ตัวอย่างดังนี้:

### ตัวอย่างที่ 1: เปลี่ยน API ดึงข้อมูลวัตถุดิบทั้งหมด (Read Materials)

**โค้ดเดิม (In-Memory Mock State):**
```typescript
app.get("/api/materials", (req, res) => {
  res.json(dbState.materials);
});
```

**โค้ดใหม่ (MySQL + Prisma):**
```typescript
import { prisma } from "./src/lib/prisma";

app.get("/api/materials", async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { code: "asc" }
    });
    res.json(materials);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch materials from local database" });
  }
});
```

### ตัวอย่างที่ 2: เปลี่ยน API เพิ่มข้อมูลวัตถุดิบใหม่ (Create Material)

**โค้ดเดิม (In-Memory Mock State):**
```typescript
app.post("/api/generic/create", (req, res) => {
  const { table, item } = req.body;
  // ... จัดการ Array push แบบชั่วคราว
  dbState[table].push(item);
  res.json({ success: true, item });
});
```

**โค้ดใหม่ (MySQL + Prisma):**
```typescript
app.post("/api/materials/create", async (req, res) => {
  try {
    const { name, code, category, minStock, stockLevel, unit, costPerUnit } = req.body;
    
    const newMaterial = await prisma.material.create({
      data: {
        name,
        code,
        category,
        minStock: Number(minStock) || 0,
        stockLevel: Number(stockLevel) || 0,
        unit,
        costPerUnit: Number(costPerUnit) || 0,
      }
    });

    res.json({ success: true, message: "Material saved successfully", item: newMaterial });
  } catch (error) {
    res.status(500).json({ error: "Could not write to local database" });
  }
});
```

---

## 🚀 7. Commands Cheat-Sheet สำหรับเริ่มต้นใช้งาน

เมื่อตั้งค่าไฟล์ทั้งหมดเสร็จสิ้นแล้ว ให้ใช้คำสั่งเหล่านี้ในการทำ Database Migration และรันระบบ:

1. **สร้างตารางในฐานข้อมูลจริงตามพิมพ์เขียว (Migration):**
   ```bash
   npx prisma migrate dev --name init_factory_db
   ```
   *หมายเหตุ: คำสั่งนี้จะสร้างฐานข้อมูลชื่อ `ideva_factory_os` ใน phpMyAdmin ให้โดยอัตโนมัติ พร้อมสร้างตารางความสัมพันธ์ทั้งหมดที่คุณเขียนไว้*

2. **เปิดหน้าต่างแดชบอร์ดจัดการฐานข้อมูล GUI (แถมฟรีโดย Prisma):**
   ```bash
   npx prisma studio
   ```
   *หน้าต่างเว็บแอปพลิเคชันจะเปิดที่พอร์ต `5555` เพื่อให้คุณตรวจสอบ เพิ่ม ลบ แก้ไขข้อมูลใน MySQL ได้โดยตรง แสนสะดวกและครอบคลุม*

3. **เขียนความคุ้มค่าเพิ่มขึ้น: การลีดรันโค้ดและเริ่มการขยายตัว:**
   คุณสามารถเขียนไฟล์ Seeding ม็อคข้อมูลเพิ่มเติบลงตารางเริ่มใช้งาน (Cold Start Seed) ได้อย่างรวดเร็ว โดยศึกษาข้อมูลเพิ่มเติมจากเว็บไซต์ของ Prisma.
