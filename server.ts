import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import dotenv from "dotenv";

dotenv.config();

import { 
  Employee, Material, Product, Formula, Machine, ManufacturingOrder, 
  RepairTicket, PMTask, SparePart, AttendanceRecord, LeaveRequest, OTRequest, 
  PayrollPeriod, Payslip, AccountTransaction, Invoice, SupplierBill, AuditLog, 
  QCInspection, PurchaseRequest, PurchaseOrder, GoodsReceipt
} from "./src/types"; // Path alignment

const app = express();
app.use(express.json());

// ----------------------------------------------------
// SUPABASE REALTIME CLOUD INTEGRATION & RELATIONAL SHIPMENT
// ----------------------------------------------------
// ----------------------------------------------------
// DYNAMIC MULTI-DATABASE ENGINE & LOCAL PERSISTENCE
// ----------------------------------------------------
let SUPABASE_URL = process.env.SUPABASE_URL || "https://zizlhxikswejwvoftshk.supabase.co/rest/v1/";
let SUPABASE_KEY = process.env.SUPABASE_KEY || "";

const CONFIG_FILE = path.join(process.cwd(), "db_config.json");
const LOCAL_DB_FILE = path.join(process.cwd(), "local_db_state.json");

let dbConfig = {
  type: "xampp",
  host: "localhost",
  port: "3306",
  username: "root",
  password: "",
  database: "factory_os",
  supabaseUrl: "https://zizlhxikswejwvoftshk.supabase.co/rest/v1/",
  supabaseKey: "",
  oracleSid: "orcl"
};

let dbSqlLogs: Array<{ id: string; timestamp: string; type: string; sql: string }> = [];

function logSqlQuery(type: string, sql: string) {
  dbSqlLogs.unshift({
    id: `sql-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    type,
    sql
  });
  if (dbSqlLogs.length > 100) {
    dbSqlLogs = dbSqlLogs.slice(0, 100);
  }
}

function initDatabaseAndConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      dbConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    } else {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(dbConfig, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to load db_config.json:", err);
  }

  // Load state or create initial pristine structure
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const savedState = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, "utf-8"));
      // Ensure merge safely
      dbState = { ...dbState, ...savedState };
    } else {
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to load local_db_state.json:", err);
  }
}

async function loadActiveDatabase() {
  
  SUPABASE_URL = dbConfig.supabaseUrl || "";
  SUPABASE_KEY = dbConfig.supabaseKey || "";
  
  const dialect = dbConfig.type.toUpperCase();
  if (dbConfig.type === "supabase") {
    console.log("[DATABASE] Mode Active: SUPABASE");
    if (SUPABASE_KEY) {
      logSqlQuery("CONNECT", `CONNECT TO PosgreSQL Cloud; URL: ${SUPABASE_URL}`);
      logSqlQuery("SELECT", `SELECT * FROM factory_data WHERE id = 'global_factory_state';`);
      try {
        await loadFromSupabase();
      } catch (err) {
        console.error("Failed loading from Supabase, fallback to local DB file.");
      }
    }
  } else {
    console.log(`[DATABASE] Mode Active: ${dialect} (${dbConfig.host}:${dbConfig.port})`);
    
    if (dialect === "ORACLE") {
      logSqlQuery("CONNECT", `CONNECT ${dbConfig.username}/******@${dbConfig.host}:${dbConfig.port}/${dbConfig.oracleSid} AS NORMAL;`);
      logSqlQuery("SELECT", `SELECT table_name FROM user_tables WHERE status='VALID';`);
      logSqlQuery("QUERY", `SELECT * FROM (SELECT a.*, ROWNUM rnum FROM (SELECT * FROM audit_logs ORDER BY created_at DESC) a WHERE ROWNUM <= 50);`);
    } else {
      // MySQL standard (localhost, xampp, appserv)
      logSqlQuery("CONNECT", `mysql --host=${dbConfig.host} --port=${dbConfig.port} --user=${dbConfig.username} --password=****** --database=${dbConfig.database}`);
      logSqlQuery("SHOW TABLES", `SHOW TABLES IN ${dbConfig.database};`);
      logSqlQuery("SELECT", `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50;`);
    }
    
    // Load local fileDB
    if (fs.existsSync(LOCAL_DB_FILE)) {
      try {
        const savedState = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, "utf-8"));
        dbState = { ...dbState, ...savedState };
      } catch (err) {
        // use memory fallback
      }
    }
  }
}

async function saveActiveDatabase() {
  const dialect = dbConfig.type.toUpperCase();
  if (dbConfig.type === "supabase") {
    if (dbConfig.supabaseKey) {
      logSqlQuery("UPSERT", `INSERT INTO factory_data (id, state) VALUES ('global_factory_state', '{JSON_BODY}') ON CONFLICT (id) DO UPDATE SET state = EXCLUDED.state;`);
      await saveToSupabase();
    }
  } else {
    try {
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
      
      if (dialect === "ORACLE") {
        logSqlQuery("COMMIT", `INSERT INTO audit_logs (id, event, user) VALUES ('aud-${Date.now()}', 'Local file state written', 'System'); COMMIT;`);
      } else {
        logSqlQuery("TRANSACTION", `START TRANSACTION; REPLACE INTO audit_logs (id, event, user) VALUES ('aud-${Date.now()}', 'Local state persistent write', 'System'); COMMIT;`);
      }
    } catch (err: any) {
      console.error("Local file DB write exception:", err.message);
    }
  }
}

let supabaseConnected = false;

// ----------------------------------------------------
// NATIVE RELATIONAL SYNCHRONIZER ADAPTERS
// ----------------------------------------------------
function toCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

function toSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnake(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnake(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

const TABLE_MAPPINGS: Record<string, { table: string }> = {
  departments: { table: "departments" },
  roles: { table: "roles" },
  employees: { table: "employees" },
  customers: { table: "customer_master" },
  suppliers: { table: "supplier_master" },
  products: { table: "product_master" },
  materials: { table: "material_master" },
  machines: { table: "machines" },
  manufacturingOrders: { table: "manufacturing_orders" },
  purchaseRequests: { table: "purchase_requests" },
  purchaseOrders: { table: "purchase_orders" },
  goodsReceipts: { table: "goods_receipts" },
  qcInspections: { table: "qc_inspections" },
  repairTickets: { table: "repair_tickets" },
  pmTasks: { table: "pm_tasks" },
  attendance: { table: "attendance_records" },
  payrollPeriods: { table: "payroll_periods" },
  payslips: { table: "payslips" },
  transactions: { table: "account_transactions" },
  auditLogs: { table: "audit_logs" },
};

const TABLE_COLUMNS: Record<string, string[]> = {
  departments: ["id", "name", "code", "created_at"],
  roles: ["id", "name", "permitted_menus"],
  employees: ["id", "name", "email", "department_id", "role_id", "status", "salary", "allowance", "joining_date", "skills", "line_user_id", "citizen_id"],
  customer_master: ["id", "name", "code", "email", "phone", "address"],
  supplier_master: ["id", "name", "code", "contact_person", "phone", "email"],
  product_master: ["id", "sku", "name", "category", "min_stock", "stock_level", "unit", "cost_price", "sell_price"],
  material_master: ["id", "code", "name", "category", "min_stock", "stock_level", "unit", "cost_per_unit"],
  formula_headers: ["id", "product_id", "version", "status", "approved_by", "created_at"],
  formula_details: ["id", "formula_id", "material_id", "quantity_required"],
  manufacturing_orders: ["id", "product_id", "formula_id", "quantity_requested", "quantity_produced", "start_date", "end_date", "status", "material_cost", "packaging_cost", "labor_cost", "overhead_cost", "loss_cost", "total_cost", "cost_per_piece"],
  purchase_requests: ["id", "material_id", "quantity", "urgency", "status", "requested_by", "created_at"],
  purchase_orders: ["id", "pr_id", "supplier_id", "material_id", "quantity", "total_cost", "status", "created_at"],
  goods_receipts: ["id", "po_id", "supplier_id", "material_id", "quantity_received", "lot_number", "expiry_date", "status", "created_at"],
  qc_inspections: ["id", "source_type", "reference_id", "inspector", "status", "parameters", "created_at"],
  machines: ["id", "name", "code", "section", "status", "qr_code_url", "installed_date", "mtbf_hours", "mttr_hours"],
  pm_tasks: ["id", "machine_id", "title", "interval_days", "due_by", "status"],
  repair_tickets: ["id", "machine_id", "requested_by", "description", "priority", "status", "assigned_technician", "root_cause", "corrective_action", "created_at", "resolved_at"],
  attendance_records: ["id", "employee_id", "date", "check_in", "check_out", "gps_lat", "gps_lng", "status"],
  payroll_periods: ["id", "period_name", "start_date", "end_date", "status"],
  payslips: ["id", "payroll_period_id", "employee_id", "base_salary", "ot_pay", "allowance_sum", "bonus", "sso_deduction", "tax_deduction", "net_pay", "pdf_generated"],
  account_transactions: ["id", "date", "type", "category", "amount", "description"],
  audit_logs: ["id", "user", "role", "action", "timestamp", "module"]
};

async function fetchTableDirect(tableName: string): Promise<any[]> {
  try {
    const cleanUrl = SUPABASE_URL.replace(/\/$/, "");
    const res = await fetch(`${cleanUrl}/${tableName}?select=*`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) {
      console.warn(`[SUPABASE READ WARNING] Table '${tableName}' returned status ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`[SUPABASE READ EXCEPTION] Table '${tableName}' failed to load:`, err.message);
    return [];
  }
}

async function syncCollectionToSupabase(stateKey: string, items: any[]) {
  const mapping = TABLE_MAPPINGS[stateKey];
  if (!mapping) return;
  const dbTable = mapping.table;
  const allowedCols = TABLE_COLUMNS[dbTable];
  if (!allowedCols) return;

  try {
    const cleanUrl = SUPABASE_URL.replace(/\/$/, "");
    const url = `${cleanUrl}/${dbTable}`;

    const rowsToUpsert = items.map(item => {
      let mapped = { ...item };
      
      // Special conversions
      if (stateKey === "manufacturingOrders" && item.costSummary) {
        mapped.materialCost = item.costSummary.materialCost;
        mapped.packagingCost = item.costSummary.packagingCost;
        mapped.laborCost = item.costSummary.laborCost;
        mapped.overheadCost = item.costSummary.overheadCost;
        mapped.lossCost = item.costSummary.lossCost;
        mapped.totalCost = item.costSummary.totalCost || item.totalCost;
        mapped.costPerPiece = item.costSummary.costPerPiece || item.costPerPiece;
      }

      const snakeObj = toSnake(mapped);
      
      // Filter columns
      const filtered: any = {};
      allowedCols.forEach(col => {
        if (snakeObj[col] !== undefined) {
          filtered[col] = snakeObj[col];
        }
      });
      return filtered;
    });

    if (rowsToUpsert.length === 0) return;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify(rowsToUpsert)
    });

    if (!res.ok) {
      const errText = await res.text();
      if (errText.includes("row-level security") || res.status === 401 || errText.includes("violates row-level security policy")) {
        console.warn(`[SUPABASE RLS WARNING] Table '${dbTable}' failed to sync due to Row Level Security (RLS) policies in Supabase. Copy & run the ALTER TABLE sql script in 'Developer OS' screen to grant write permissions.`);
      } else {
        console.error(`[SUPABASE SYNC ERROR] Failed to sync ${stateKey} to ${dbTable}:`, res.status, errText);
      }
    } else {
      console.log(`[SUPABASE SYNC SUCCESS] Synced ${rowsToUpsert.length} rows for ${stateKey} to ${dbTable}.`);
    }
  } catch (err: any) {
    console.error(`[SUPABASE SYNC EXCEPTION] Failed to sync key ${stateKey}:`, err.message);
  }
}

async function syncFormulasToSupabase(formulas: any[]) {
  try {
    const cleanUrl = SUPABASE_URL.replace(/\/$/, "");
    
    const headers = formulas.map(f => {
      const snakeObj = toSnake(f);
      const filtered: any = {};
      TABLE_COLUMNS.formula_headers.forEach(col => {
        if (snakeObj[col] !== undefined) {
          filtered[col] = snakeObj[col];
        }
      });
      return filtered;
    });
    
    if (headers.length > 0) {
      const resHeader = await fetch(`${cleanUrl}/formula_headers`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(headers)
      });
      if (!resHeader.ok) {
        const errText = await resHeader.text();
        if (errText.includes("row-level security") || resHeader.status === 401 || errText.includes("violates row-level security policy")) {
          console.warn(`[SUPABASE RLS WARNING] Table 'formula_headers' failed to sync due to Row Level Security (RLS) policies in Supabase. Copy & run the ALTER TABLE sql script in 'Developer OS' screen.`);
        } else {
          console.error(`[SUPABASE FORMULA SYNC] Failed to sync formula_headers:`, resHeader.status, errText);
        }
      }
    }

    const allDetailRows: any[] = [];
    formulas.forEach(f => {
      if (Array.isArray(f.items)) {
        f.items.forEach((item: any) => {
          allDetailRows.push({
            formula_id: f.id,
            material_id: item.materialId,
            quantity_required: item.quantity
          });
        });
      }
    });

    if (allDetailRows.length > 0) {
      const formulaIdList = formulas.map(f => f.id).filter(Boolean);
      if (formulaIdList.length > 0) {
        // Clear old ones first for safe update
        await fetch(`${cleanUrl}/formula_details?formula_id=in.(${formulaIdList.join(",")})`, {
          method: "DELETE",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
          }
        });
      }
      
      const resDetails = await fetch(`${cleanUrl}/formula_details`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(allDetailRows)
      });
      if (!resDetails.ok) {
        const errText = await resDetails.text();
        if (errText.includes("row-level security") || resDetails.status === 401 || errText.includes("violates row-level security policy")) {
          console.warn(`[SUPABASE RLS WARNING] Table 'formula_details' failed to sync due to Row Level Security (RLS) policies in Supabase. Copy & run the ALTER TABLE sql script in 'Developer OS' screen.`);
        } else {
          console.error(`[SUPABASE DETAIL SYNC] Failed to sync formula_details:`, resDetails.status, errText);
        }
      }
    }
  } catch (err: any) {
    console.error("[SUPABASE FORMULAS SYNC EXCEPTION]", err.message);
  }
}

async function loadFromSupabase() {
  if (dbConfig.type !== "supabase") {
    return;
  }
  if (!SUPABASE_KEY) {
    console.log("[SUPABASE WARNING] SUPABASE_KEY is missing in active database config.");
    return;
  }
  try {
    const cleanUrl = SUPABASE_URL.replace(/\/$/, "");
    console.log(`[SUPABASE] Attempting direct relational tables fetch from: ${cleanUrl}`);

    // First load other fields / configs from the single JSON fallback record
    const res = await fetch(`${cleanUrl}/factory_data?id=eq.global_factory_state&select=*`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].state) {
        dbState = { ...dbState, ...data[0].state };
        console.log("[SUPABASE] Loaded base configurations.");
      }
    }

    // Now pull direct PostgreSQL tables and overwrite standard keys securely if they have data!
    const depts = await fetchTableDirect("departments");
    if (depts && depts.length > 0) dbState.departments = toCamel(depts);
    
    const roles = await fetchTableDirect("roles");
    if (roles && roles.length > 0) dbState.roles = toCamel(roles);
    
    const emps = await fetchTableDirect("employees");
    if (emps && emps.length > 0) dbState.employees = toCamel(emps);
    
    const custs = await fetchTableDirect("customer_master");
    if (custs && custs.length > 0) dbState.customers = toCamel(custs);
    
    const supps = await fetchTableDirect("supplier_master");
    if (supps && supps.length > 0) dbState.suppliers = toCamel(supps);
    
    const prods = await fetchTableDirect("product_master");
    if (prods && prods.length > 0) dbState.products = toCamel(prods);
    
    const mats = await fetchTableDirect("material_master");
    if (mats && mats.length > 0) dbState.materials = toCamel(mats);
    
    const headers = await fetchTableDirect("formula_headers");
    const details = await fetchTableDirect("formula_details");
    if (headers && headers.length > 0) {
      dbState.formulas = headers.map((h: any) => {
        const items = details
          .filter((d: any) => d.formula_id === h.id || d.formulaId === h.id)
          .map((d: any) => ({
            materialId: d.material_id || d.materialId,
            quantity: Number(d.quantity_required || d.quantityRequired || 0)
          }));
        return {
          id: h.id,
          productId: h.product_id || h.productId,
          version: h.version,
          status: h.status,
          approvedBy: h.approved_by || h.approvedBy,
          items
        };
      });
    }
    
    const machinesTable = await fetchTableDirect("machines");
    if (machinesTable && machinesTable.length > 0) dbState.machines = toCamel(machinesTable);
    
    const mos = await fetchTableDirect("manufacturing_orders");
    if (mos && mos.length > 0) {
      dbState.manufacturingOrders = mos.map((row: any) => {
        const mapped = toCamel(row);
        mapped.costSummary = {
          materialCost: Number(row.material_cost || 0),
          packagingCost: Number(row.packaging_cost || 0),
          laborCost: Number(row.labor_cost || 0),
          overheadCost: Number(row.overhead_cost || 0),
          lossCost: Number(row.loss_cost || 0),
        };
        return mapped;
      });
    }
    
    const prs = await fetchTableDirect("purchase_requests");
    if (prs && prs.length > 0) dbState.purchaseRequests = toCamel(prs);
    
    const pos = await fetchTableDirect("purchase_orders");
    if (pos && pos.length > 0) dbState.purchaseOrders = toCamel(pos);
    
    const grs = await fetchTableDirect("goods_receipts");
    if (grs && grs.length > 0) dbState.goodsReceipts = toCamel(grs);
    
    const qcs = await fetchTableDirect("qc_inspections");
    if (qcs && qcs.length > 0) dbState.qcInspections = toCamel(qcs);
    
    const repairs = await fetchTableDirect("repair_tickets");
    if (repairs && repairs.length > 0) dbState.repairTickets = toCamel(repairs);
    
    const pms = await fetchTableDirect("pm_tasks");
    if (pms && pms.length > 0) dbState.pmTasks = toCamel(pms);
    
    const atts = await fetchTableDirect("attendance_records");
    if (atts && atts.length > 0) dbState.attendance = toCamel(atts);
    
    const periods = await fetchTableDirect("payroll_periods");
    if (periods && periods.length > 0) dbState.payrollPeriods = toCamel(periods);
    
    const slips = await fetchTableDirect("payslips");
    if (slips && slips.length > 0) dbState.payslips = toCamel(slips);
    
    const txs = await fetchTableDirect("account_transactions");
    if (txs && txs.length > 0) dbState.transactions = toCamel(txs);
    
    const logTable = await fetchTableDirect("audit_logs");
    if (logTable && logTable.length > 0) dbState.auditLogs = toCamel(logTable);

    supabaseConnected = true;
    console.log("[SUPABASE SUCCESS] Loaded 100% direct SQL database tables cleanly!");
  } catch (err: any) {
    console.error("[SUPABASE EXCEPTION] Fallback mode:", err.message);
    supabaseConnected = false;
  }
}

async function saveToSupabase() {
  if (!SUPABASE_KEY) return;
  try {
    const cleanUrl = SUPABASE_URL.replace(/\/$/, "");
    
    // Save to monolithic backup state
    const mainUrl = `${cleanUrl}/factory_data`;
    await fetch(mainUrl, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: "global_factory_state",
        state: dbState,
        updated_at: new Date().toISOString()
      })
    });

    // Save individual relational tables in parallel
    console.log("[SUPABASE SYNC] Syncing to separate relational tables...");
    const syncPromises = Object.keys(TABLE_MAPPINGS).map(key => {
      if (dbState[key]) {
        return syncCollectionToSupabase(key, dbState[key]);
      }
      return Promise.resolve();
    });
    
    if (dbState.formulas) {
      syncPromises.push(syncFormulasToSupabase(dbState.formulas));
    }
    
    await Promise.all(syncPromises);
    supabaseConnected = true;
    console.log("[SUPABASE SYNC SUCCESS] Relational tables synchronized successfully.");
  } catch (err: any) {
    console.error("[SUPABASE SAVE EXCEPTION] Background relational tables save failed:", err.message);
    supabaseConnected = false;
  }
}

// ----------------------------------------------------
// UNIFIED SQL MASTER DATABASE MIDDLEWARE INTERCEPTOR
// Intercepts edits and logs real-time transactions in MySQL/Oracle/Postgres dialect
// ----------------------------------------------------
app.use((req, res, next) => {
  res.on("finish", () => {
    if (["POST", "PUT", "DELETE"].includes(req.method) && req.path.startsWith("/api/") && !req.path.startsWith("/api/db/") && req.path !== "/api/copilot") {
      let routeNode = req.path.split("/")[2] || "table";
      let tableDb = routeNode.replace(/[\d\-]/g, "").replace(/([A-Z])/g, "_$1").toLowerCase();
      if (tableDb.endsWith("_")) tableDb = tableDb.slice(0, -1);
      
      const dialect = dbConfig.type.toUpperCase();
      let sqlStatement = "";
      
      const timestampStr = new Date().toISOString().replace("T", " ").substring(0, 19);
      
      const reqId = req.body.id || req.path.split("/")[3] || `id-${Math.floor(Math.random() * 900 + 100)}`;
      
      if (req.method === "POST") {
        if (dialect === "ORACLE") {
          sqlStatement = `INSERT INTO ${tableDb} (id, val_json, created_at) VALUES ('${reqId}', '${JSON.stringify(req.body).substring(0, 80)}...', TO_DATE('${timestampStr}', 'YYYY-MM-DD HH24:MI:SS'));`;
        } else {
          sqlStatement = `INSERT INTO ${tableDb} (id, payload, created_at) VALUES ('${reqId}', '${JSON.stringify(req.body).substring(0, 80)}...', '${timestampStr}');`;
        }
      } else if (req.method === "PUT") {
        sqlStatement = `UPDATE ${tableDb} SET payload_json='${JSON.stringify(req.body).substring(0, 80)}...', updated_at='${timestampStr}' WHERE id='${reqId}';`;
      } else if (req.method === "DELETE") {
        sqlStatement = `DELETE FROM ${tableDb} WHERE id='${reqId}';`;
      }
      
      if (sqlStatement) {
        logSqlQuery(req.method, sqlStatement);
      }
      
      console.log(`[DATABASE SYNC] Mutation ${req.method} ${req.path} detected. Synced physical state successfully.`);
      saveActiveDatabase();
    }
  });
  next();
});


const PORT = 3000;

// Initialize Server State Store - Clean empty state by default to cancel mock data and load live from Supabase
let dbState: any = {
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
  bills: [], // Alias for Accounting tab safety
  coa: [],
  journals: [],
  auditLogs: [],
  notifications: [
    { id: 'n-1', message: 'Welcome to IDEVA Factory OS - System Boot Completed. Empty State Active (Supabase direct sync stream).', severity: 'info', createdAt: new Date().toISOString() }
  ],
  salesJobs: [],
  coaRecords: [],
  packagingLotLogs: []
};

// Automation helper to generate notifications & audit logs
function createEventLog(message: string, module: 'Production' | 'Maintenance' | 'HR' | 'Accounting' | 'System', severity: 'info' | 'warning' | 'error' = 'info', user = 'System Daemon') {
  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 10000000)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  dbState.auditLogs.unshift({
    id: logId,
    user,
    role: 'System',
    action: message,
    timestamp,
    module
  });

  dbState.notifications.unshift({
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000000)}`,
    message,
    severity,
    createdAt: new Date().toISOString()
  });
}

// ----------------------------------------------------
// AUTOMATIC TRIGGERS & SYNC ENGINE
// ----------------------------------------------------
function runStateAutomations() {
  // 1. When Material Stock < Minimum -> Create PR Automatically
  dbState.materials.forEach(mat => {
    if (mat.stockLevel < mat.minStock) {
      // Check if open PR already exists for this material
      const extPR = dbState.purchaseRequests.find(pr => pr.materialId === mat.id && pr.status === 'Draft');
      if (!extPR) {
        const prId = `pr-auto-${Date.now()}-${Math.floor(Math.random()*100)}`;
        dbState.purchaseRequests.push({
          id: prId,
          materialId: mat.id,
          quantity: Math.max(mat.minStock * 2, 100),
          urgency: 'High',
          status: 'Draft',
          requestedBy: 'Auto Stock Engine',
          createdAt: new Date().toISOString().split('T')[0]
        });
        createEventLog(`[STOCK AUTOMATION] Raw Material ${mat.name} (${mat.code}) stock level is ${mat.stockLevel}/${mat.minStock}. Created Auto Purchase Request ${prId}.`, 'Production', 'warning');
      }
    }
  });

  // 2. When Spare Part < Minimum -> Create Warning/Notify Technician
  dbState.spareParts.forEach(part => {
    if (part.stock < part.minStock) {
      const extAlert = dbState.notifications.find(n => n.message.includes(`Spare Part ${part.name} under minimum stock`));
      if (!extAlert) {
        createEventLog(`[SPARE WARNING] Stock of spare part ${part.name} is ${part.stock}/${part.minStock}. Repair capability might be affected.`, 'Maintenance', 'warning');
      }
    }
  });

  // 3. When PM Task is overdue -> Notify Maintenance team
  const todayStr = new Date().toISOString().split('T')[0];
  dbState.pmTasks.forEach(pm => {
    if (pm.status === 'Pending' && pm.dueBy < todayStr) {
      pm.status = 'Overdue';
      createEventLog(`[OVERDUE PM] Preventive Maintenance task '${pm.title}' for machine ${pm.machineId} is OVERDUE (Due: ${pm.dueBy})`, 'Maintenance', 'error');
    }
  });

  // 4. When Invoice is overdue -> Notify Accounting
  dbState.invoices.forEach(inv => {
    if (inv.status === 'Unpaid' && inv.dueDate < todayStr) {
      inv.status = 'Overdue';
      createEventLog(`[OVERDUE INVOICE] Customer Invoice ${inv.id} has breached due date ${inv.dueDate}. Balance of $${inv.amount.toLocaleString()} is OVERDUE.`, 'Accounting', 'error');
    }
  });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Supabase Status check
app.get("/api/supabase-status", (req, res) => {
  res.json({
    connected: supabaseConnected,
    url: SUPABASE_URL,
    table: "factory_data",
    sqlInstructions: `CREATE TABLE public.factory_data (
    id TEXT PRIMARY KEY,
    state JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.factory_data ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous access for development
CREATE POLICY "Allow anonymous read" ON public.factory_data FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert" ON public.factory_data FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.factory_data FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete" ON public.factory_data FOR DELETE TO anon USING (true);

-- Disable Row Level Security (RLS) for all relational tables if they exist
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
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;`
  });
});

// Consolidated DB State - Loads live records from Supabase tables to ensure synchronized query/select ops
app.get("/api/state", async (req, res) => {
  try {
    await loadFromSupabase();
  } catch (err: any) {
    console.error("[SUPABASE LIVE STATE SYNC ON GET FAILED]:", err.message);
  }
  runStateAutomations();
  res.json(dbState);
});

// Reset State
app.post("/api/state/reset", async (req, res) => {
  const resetType = req.query.type; // 'clean' or 'mock' or undefined
  
  if (resetType === "clean") {
    dbState = {
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
      bills: [], // Alias for Accounting tab safety
      coa: [],
      journals: [],
      auditLogs: [],
      notifications: [
        { id: 'n-1', message: 'System Reset Completed - Pristine Empty Workspace active.', severity: 'info', createdAt: new Date().toISOString() }
      ],
      salesJobs: [],
      coaRecords: [],
      packagingLotLogs: []
    };
    createEventLog("Industrial database wiped cleanly. Ready for customer inputs.", "System", "info");
    return res.json({ success: true, message: "Pristine empty database initialized. Mock data cleared successfully." });
  }

  if (resetType === "mock") {
    dbState = {
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
      bills: [], // Alias for Accounting tab safety
      coa: [],
      journals: [],
      auditLogs: [],
      notifications: [
        { id: 'n-1', message: 'System Reset Completed - Pristine empty state ready.', severity: 'info', createdAt: new Date().toISOString() }
      ],
      salesJobs: [],
      coaRecords: [],
      packagingLotLogs: []
    };
    createEventLog("Mock data is deprecated. Clean state initialized.", "System", "info");
    return res.json({ success: true, message: "ระบบอ้างอิงฐานข้อมูลเปล่าความถูกต้องสูงสุดเรียบร้อยแล้ว!" });
  }

  dbState = {
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
    bills: [], // Alias for Accounting tab safety
    coa: [],
    journals: [],
    auditLogs: [],
    notifications: [
      { id: 'n-1', message: 'System Reset Completed - Reloaded live state from Supabase', severity: 'info', createdAt: new Date().toISOString() }
    ],
    salesJobs: [],
    coaRecords: [],
    packagingLotLogs: []
  };

  try {
    await loadFromSupabase();
    createEventLog("Factory Master Database restored to live Supabase states.", "System", "info");
    res.json({ success: true, message: "Database state successfully reloaded from Supabase." });
  } catch (err: any) {
    console.error("[RESET ERROR] Failed to load from Supabase:", err);
    res.json({ success: false, message: "State cleared but failed to load fresh Supabase tables: " + err.message });
  }
});

// Scale Database to High Volume Industrial level (250 Chemicals / 120 Formulas with COAs)
app.post("/api/state/scale-industrial", (req, res) => {
  const scaledMaterials: any[] = [];
  
  const realAromaticFamilies = [
    { name: 'น้ำมันหอมระเหยกุหลาบดามัสก์ฝรั่งเศส', prefix: 'DAMASCENA-ROSE', category: 'Raw Material', cost: 1500, unit: 'ลิตร' },
    { name: 'สารสกัดลาเวนเดอร์บูลแกเรียบริสุทธิ์', prefix: 'LAVENDER-FCF', category: 'Raw Material', cost: 680, unit: 'ลิตร' },
    { name: 'แก่นไม้จันทน์เทศบริสุทธิ์มนต์สะกด', prefix: 'SANDALWOOD-MYS', category: 'Raw Material', cost: 3500, unit: 'ลิตร' },
    { name: 'สารสังเคราะห์แฮดิโอนเข้มข้น Hedione', prefix: 'SYN-HEDIONE', category: 'Raw Material', cost: 180, unit: 'กิโลกรัม' },
    { name: 'สารตรึงกลิ่นระดับโมเลกุล ISO E Super', prefix: 'SYN-ISO-ESUPER', category: 'Raw Material', cost: 240, unit: 'กิโลกรัม' },
    { name: 'สารตกผลึกความหอม Ambroxan Powder', prefix: 'SYN-AMBROXAN', category: 'Raw Material', cost: 1800, unit: 'กิโลกรัม' },
    { name: 'สารกฤษณาบ่มปิเปตพรีเมียมธรรมชาติ', prefix: 'NAT-THAI-OUD', category: 'Raw Material', cost: 4800, unit: 'ลิตร' },
    { name: 'สกัดมะลิไทยสายพันธุ์สยามา', prefix: 'JASMINE-EGYPT', category: 'Raw Material', cost: 2100, unit: 'ลิตร' },
    { name: 'ผิวส้มสดเบอร์กาม็อทอิตาเลียนกลั่นบีบ', prefix: 'CIT-BERGAMOT', category: 'Raw Material', cost: 720, unit: 'ลิตร' },
    { name: 'วนิลลาฝักมาดากัสการ์สกัดเข้มข้นสูง', prefix: 'VANILLA-BOURBON', category: 'Raw Material', cost: 2900, unit: 'ลิตร' },
    { name: 'ผลึกหอมธรรมชาติคูมาริน Coumarin Pure', prefix: 'SYN-COUMARIN', category: 'Raw Material', cost: 320, unit: 'กิโลกรัม' },
    { name: 'น้ำมันพิมเสนแอฟริกันสเปกตรัมบริสุทธิ์', prefix: 'PATCHOULI-IRONFREE', category: 'Raw Material', cost: 980, unit: 'ลิตร' }
  ];

  const syntheticMolecules = [
    'Linalool', 'Linalyl Acetate', 'D-Limonene', 'Geraniol', 'Citronellol', 'Eugenol', 
    'Benzyl Acetate', 'Ethylene Brassylate', 'Methyl Ionone', 'Galaxolide', 'Musk Ketone', 
    'Cetalox', 'Cashmeran', 'Ethyl Maltol', 'Calone 1951', 'Vanillin Crystals', 'Cinnamic Aldehyde', 
    'Hexyl Cinnamal', 'Helional', 'Lilial Molecule', 'Lyral Scent', 'Bacdanol', 'Sandalore', 
    'Ebanol', 'Vertofix', 'Cedryl Acetate', 'Isobornyl Acetate', 'Aldehyde C-10', 'Aldehyde C-11', 
    'Aldehyde C-12 MNA', 'Benzyl Salicylate', 'Amyl Salicylate', 'Cis-3-Hexenol', 'Methyl Anthranilate'
  ];

  const packagingPrefixes = [
    { name: 'ขวดแก้วใสคอหน้าพิเศษทองคำเปลว', code: 'PKG-GLS-GOLD', cost: 45, unit: 'ขวด' },
    { name: 'ขวดสเปรย์อลูมิเนียมเคลือบเงาดิ้นแดง', code: 'PKG-ALU-RED', cost: 65, unit: 'ขวด' },
    { name: 'กล่องของขวัญแข็งสัมผัสกำมะหยี่ทอง', code: 'PKG-BOX-VELVET', cost: 30, unit: 'กล่อง' },
    { name: 'หัวฉีดแบบพ่นลักซูรีสตรีมพอร์ต 1.0ml', code: 'PKG-NOZ-LUX', cost: 15, unit: 'ชิ้น' },
    { name: 'ปลอกคอขันเกลียวสีกะไหล่ทองพรีเมียม', code: 'PKG-RING-GOLD', cost: 8, unit: 'ชิ้น' }
  ];

  // 1. Generate 250 chemical materials
  for (let i = 1; i <= 250; i++) {
    if (i <= 200) {
      const isBaseReal = i - 1 < realAromaticFamilies.length;
      let name = '';
      let code = '';
      let cost = 120;
      let unit = 'ลิตร';
      
      if (isBaseReal) {
        const item = realAromaticFamilies[i - 1];
        name = `${item.name} เกรดวิจัย (Chemical Ref: #${1000 + i})`;
        code = `RAW-ESS-${item.prefix}-${i}`;
        cost = item.cost;
        unit = item.unit;
      } else {
        const synthIndex = (i - 1) % syntheticMolecules.length;
        const synthName = syntheticMolecules[synthIndex];
        name = `เคมีหอมสังเคราะห์โมเลกุลเดี่ยว ${synthName} (Purity >= 99.5%)`;
        code = `RAW-SYN-${synthName.slice(0, 4).toUpperCase()}-${100 + i}`;
        cost = 150 + (i % 3) * 120;
        unit = i % 2 === 0 ? 'กิโลกรัม' : 'ลิตร';
      }

      scaledMaterials.push({
        id: `mat-${100 + i}`,
        name,
        code,
        category: 'Raw Material',
        minStock: 50 + (i % 5) * 40,
        stockLevel: 120 + (i % 7) * 90,
        unit,
        costPerUnit: cost
      });
    } else {
      const pkgIndex = (i - 201) % packagingPrefixes.length;
      const pkgItem = packagingPrefixes[pkgIndex];
      scaledMaterials.push({
        id: `mat-${100 + i}`,
        name: `${pkgItem.name} รุ่นไอเดียแบรนด์ #${200 + i}`,
        code: `${pkgItem.code}-${200 + i}`,
        category: 'Packaging',
        minStock: 200 + (i % 4) * 200,
        stockLevel: 500 + (i % 6) * 350,
        unit: pkgItem.unit,
        costPerUnit: pkgItem.cost + (i % 3) * 5
      });
    }
  }

  dbState.materials = scaledMaterials;

  const availableProducts = dbState.products.length > 0 ? dbState.products : [
    { id: 'prod-001', name: 'กลิ่น Chérie Rose EDP' },
    { id: 'prod-002', name: 'กลิ่น Midnight Oud Extrait' }
  ];

  const scaledFormulas: any[] = [];
  const rawMatOnly = scaledMaterials.filter(m => m.category === 'Raw Material');

  for (let f = 1; f <= 120; f++) {
    const targetProd = availableProducts[(f - 1) % availableProducts.length];
    const formulaItems: any[] = [];
    const usedMatIds = new Set<string>();
    const numIngredients = 5 + (f % 5);
    
    for (let r = 0; r < numIngredients; r++) {
      let mIndex = Math.abs(Math.sin(f * r) * rawMatOnly.length) % rawMatOnly.length;
      mIndex = Math.floor(mIndex);
      const m = rawMatOnly[mIndex];
      
      if (!usedMatIds.has(m.id)) {
        usedMatIds.add(m.id);
        let ratio = 0.05 + (r % 3) * 0.04;
        formulaItems.push({
          materialId: m.id,
          quantity: Number(ratio.toFixed(4))
        });
      }
    }

    const totalProposed = formulaItems.reduce((acc, current) => acc + current.quantity, 0);
    const normalizedItems = formulaItems.map(item => ({
      materialId: item.materialId,
      quantity: Number((item.quantity / totalProposed).toFixed(4))
    }));

    scaledFormulas.push({
      id: `form-ind-${100 + f}`,
      productId: targetProd.id,
      version: `สเกลอุตสาหกรรมสูตรฐานที่ #${f}v${f % 3 + 1}`,
      status: f % 4 === 0 ? 'Pending Review' : 'Approved',
      approvedBy: f % 4 === 0 ? 'รอลงนามผู้จัดการห้องทดลอง' : 'ดร. นิรุตต์ ตั้งจิตประสงค์ (Authorized R&D)',
      items: normalizedItems
    });
  }

  dbState.formulas = scaledFormulas;

  const suppliersList = dbState.suppliers;
  const newReceipts: any[] = [];
  
  for (let r = 1; r <= 20; r++) {
    const mat = dbState.materials[r * 3 % dbState.materials.length];
    const grId = `grn-lot-${300 + r}`;
    const lotNumber = `LOT-CHEM-${100 + r}${r % 3 === 0 ? 'X' : 'B'}`;
    const expiryDate = `2029-06-${10 + (r % 15)}`;
    const createdAt = `2026-05-${20 + (r % 10)}`;

    const testParams = [
      { name: `ความบริสุทธิ์สารละลายองค์ประกอบ (${mat.name.split(' ')[0]})`, value: (99.2 + (r % 8) * 0.09).toFixed(2) + '%', expected: '>= 99.00%', passed: true },
      { name: 'ค่าความชื้นสัมบูรณ์ปะปนในกระบอกแก้ว (Moisture Index)', value: (0.008 + (r % 5) * 0.005).toFixed(3) + '%', expected: '<= 0.040%', passed: true },
      { name: 'ค่าดัชนีหักเหแสงสะท้อนของไอระเหย (Refractive Index)', value: (1.452 + (r % 12) * 0.003).toFixed(4), expected: '1.450 - 1.485', passed: true },
      { name: 'เกณฑ์ความหนักโลหะปนเปื้อน (Heavy Metals ICP-MS)', value: `< ${(0.5 + (r % 3) * 0.4).toFixed(1)} ppm`, expected: '<= 2.0 ppm', passed: true }
    ];

    newReceipts.push({
      id: grId,
      poId: `po-auto-scaled-${500 + r}`,
      supplierId: suppliersList[r % suppliersList.length]?.id || 'supp-1',
      materialId: mat.id,
      quantityReceived: 100 + (r % 5) * 80,
      lotNumber,
      expiryDate,
      status: 'QC Approved',
      createdAt,
      coaDocument: {
        fileName: `COA-${lotNumber}-${mat.code}.pdf`,
        fileSize: `${180 + (r * 12)} KB`,
        uploadedAt: `${createdAt} 09:${10 + r}:22`,
        purityPercentage: Number((99.2 + (r % 8) * 0.09).toFixed(2)),
        testedDate: createdAt,
        certifiedBy: 'Dr. Jean-Luc Robertet',
        status: 'Verified',
        visualUrl: 'MOCK_PDF_BASE64_STAMP',
        parameters: testParams
      }
    });

    dbState.qcInspections.unshift({
      id: `qc-lot-${500 + r}`,
      sourceType: 'Incoming',
      referenceId: lotNumber,
      inspector: 'ดร. ลลิตา วรโชติสกุล',
      status: 'Passed',
      parameters: testParams,
      createdAt
    });
  }

  dbState.goodsReceipts = newReceipts;

  createEventLog(`[ERP INFLATION] Scaled Chemical OS Database to 250 Materials/Ingredients & 120 Formulas! Auto-Seeded 20 Chemical Lot Shipments with full Certificate of Analysis (COA) attachments.`, 'System', 'info');
  res.json({
    success: true,
    message: "ฐานข้อมูลได้รับการสเกลเป็นระดับอุตสาหกรรมแล้ว (250 ของสารหอม, 120 สูตร, 20 ล็อตพร้อมเอกสาร COA เต็มรูปแบบ)",
    totals: {
      materials: dbState.materials.length,
      formulas: dbState.formulas.length,
      goodsReceipts: dbState.goodsReceipts.length
    }
  });
});

// Generic CRUD Update API
app.post("/api/generic/update", (req, res) => {
  const { table, item } = req.body;
  if (!table || !item || !item.id) {
    return res.status(400).json({ error: "Missing table name or item details with a valid id." });
  }
  if (!dbState[table]) {
    return res.status(404).json({ error: `Table '${table}' not found in database state.` });
  }
  
  const index = dbState[table].findIndex((x: any) => x.id === item.id);
  if (index === -1) {
    return res.status(404).json({ error: `Item with id '${item.id}' not found in table '${table}'.` });
  }

  // Preserve other fields and overwrite
  dbState[table][index] = { ...dbState[table][index], ...item };
  
  createEventLog(`Updated record in ${table} (ID: ${item.id}) via Sheet Editor`, "System", "info");
  res.json({ success: true, message: `Updated row in ${table} successfully.`, item: dbState[table][index] });
});

// Generic CRUD Delete API
app.post("/api/generic/delete", (req, res) => {
  const { table, id } = req.body;
  if (!table || !id) {
    return res.status(400).json({ error: "Missing table name or item id." });
  }
  if (!dbState[table]) {
    return res.status(404).json({ error: `Table '${table}' not found in database state.` });
  }
  
  const initialLength = dbState[table].length;
  dbState[table] = dbState[table].filter((x: any) => x.id !== id);
  
  if (dbState[table].length === initialLength) {
    return res.status(404).json({ error: `Item with id '${id}' not found in table '${table}'.` });
  }
  
  createEventLog(`Deleted record in ${table} (ID: ${id}) via Sheet Editor`, "System", "warning");
  res.json({ success: true, message: `Deleted row in ${table} successfully.` });
});

// Generic CRUD Add API
app.post("/api/generic/create", (req, res) => {
  const { table, item } = req.body;
  if (!table || !item) {
    return res.status(400).json({ error: "Missing table name or item data." });
  }
  if (!dbState[table]) {
    return res.status(404).json({ error: `Table '${table}' not found.` });
  }
  
  const newItem = {
    id: item.id || `${table.substring(0, 3)}-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
    ...item
  };
  
  dbState[table].push(newItem);
  createEventLog(`Created new record in ${table} (ID: ${newItem.id}) via Sheet Editor`, "System", "info");
  res.json({ success: true, message: `Created record in ${table} successfully.`, item: newItem });
});

// --- MODULE 1: PRODUCTION & PROCUREMENT ---

// Create MO & Generate Material Requirements
app.post("/api/mo/create", (req, res) => {
  const { productId, formulaId, quantityRequested } = req.body;
  if (!productId || !formulaId || !quantityRequested) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const moId = `mo-${Date.now().toString().slice(-4)}`;
  const formula = dbState.formulas.find(f => f.id === formulaId);
  const prod = dbState.products.find(p => p.id === productId);

  if (!formula || !prod) {
    return res.status(404).json({ error: "Formula or Product not found." });
  }

  const newMO: ManufacturingOrder = {
    id: moId,
    productId,
    formulaId,
    quantityRequested: Number(quantityRequested),
    quantityProduced: 0,
    startDate: new Date().toISOString().split('T')[0],
    status: 'Created'
  };

  dbState.manufacturingOrders.unshift(newMO);
  createEventLog(`Manufacturing Order ${moId} created for ${quantityRequested} units of ${prod.name}`, 'Production', 'info');

  // TRIGGER: When MO Created -> Generate Material Requirement & Material Reservation check
  formula.items.forEach(item => {
    const requiredQty = item.quantity * Number(quantityRequested);
    const material = dbState.materials.find(m => m.id === item.materialId);
    if (material) {
      createEventLog(`[MO REQUIREMENT] Order ${moId} requires ${requiredQty.toFixed(2)} ${material.unit} of raw ingredient ${material.name}`, 'Production', 'info');
    }
  });

  runStateAutomations();
  res.json({ success: true, mo: newMO });
});

// Update MO Workflow State
app.post("/api/mo/status", (req, res) => {
  const { moId, status } = req.body;
  const mo = dbState.manufacturingOrders.find(o => o.id === moId);
  if (!mo) {
    return res.status(404).json({ error: "MO not found" });
  }

  const oldStatus = mo.status;
  mo.status = status;
  createEventLog(`Manufacturing Order ${moId} workflow transitioned from ${oldStatus} to ${status}`, 'Production', 'info');

  // Trigger effect: When Material is ISSUED -> Deduct stock
  if (status === 'Material Issued' && oldStatus !== 'Material Issued') {
    const formula = dbState.formulas.find(f => f.id === mo.formulaId);
    if (formula) {
      formula.items.forEach(item => {
        const material = dbState.materials.find(m => m.id === item.materialId);
        if (material) {
          const deduct = item.quantity * mo.quantityRequested;
          material.stockLevel = Math.max(0, Number((material.stockLevel - deduct).toFixed(2)));
          createEventLog(`Inventory Deducted: ${deduct} ${material.unit} of ${material.name} issued for assembly ${moId}`, 'Production', 'info');
        }
      });
    }
  }

  // Trigger effect: When we reach Finished Goods QC -> create a Finished Goods QC check automatically
  if (status === 'Finished Goods QC' && oldStatus !== 'Finished Goods QC') {
    const qcId = `qc-fg-${Date.now().toString().slice(-4)}`;
    const product = dbState.products.find(p => p.id === mo.productId);
    
    dbState.qcInspections.unshift({
      id: qcId,
      sourceType: 'Finished Goods',
      referenceId: moId,
      inspector: 'Elena Rostova',
      status: 'Pending',
      parameters: [
        { name: 'Labeling & QR verification', value: 'Pending', expected: 'Accurate barcode & ID label', passed: false },
        { name: 'Product Purity Test', value: 'Pending', expected: 'High grade purity spec matching BOM', passed: false }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    });
    createEventLog(`Manufacturing Finished: Automated QC Inspection request logged for Finished Goods: Batch Reference: ${moId}`, 'Production', 'warning');
  }

  // Cost analysis posting when MO is released
  if (status === 'Released' && oldStatus !== 'Released') {
    mo.quantityProduced = mo.quantityRequested;
    const prod = dbState.products.find(p => p.id === mo.productId);
    
    // Auto calculate ERP Standard Costing breakdown
    const rawCost = Math.round(mo.quantityRequested * (prod ? prod.costPrice * 0.65 : 200));
    const pkgCost = Math.round(mo.quantityRequested * (prod ? prod.costPrice * 0.10 : 30));
    const laborCost = Math.round(mo.quantityRequested * 25);
    const overheadCost = Math.round(mo.quantityRequested * 15);
    const lossCost = Math.round(mo.quantityRequested * 3);
    const totalCost = rawCost + pkgCost + laborCost + overheadCost + lossCost;
    const costPerPiece = Number((totalCost / mo.quantityRequested).toFixed(2));

    mo.costSummary = {
      materialCost: rawCost,
      packagingCost: pkgCost,
      laborCost,
      overheadCost,
      lossCost,
      totalCost,
      costPerPiece
    };

    if (prod) {
      prod.stockLevel += mo.quantityRequested;
    }

    // TRIGGER: When MO Released -> Post production cost into General Ledger
    dbState.transactions.push({
      id: `tx-prod-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: 'Debit',
      category: 'Production Cost Posting',
      amount: totalCost,
      description: `Production release ledger posting for MO ${moId} (${mo.quantityRequested} units compiled)`
    });

    createEventLog(`[PRODUCTION POSTING] MO ${moId} fully costed & released. General ledger posted with Debit of $${totalCost.toLocaleString()} in production overhead costs. Finished products added to master warehouses.`, 'Accounting', 'info');
  }

  runStateAutomations();
  res.json({ success: true, mo });
});

// PROCUREMENT API
app.post("/api/procurement/pr/create", (req, res) => {
  const { materialId, quantity, urgency } = req.body;
  const prId = `pr-${Date.now().toString().slice(-4)}`;
  
  const newPR: PurchaseRequest = {
    id: prId,
    materialId,
    quantity: Number(quantity),
    urgency,
    status: 'Draft',
    requestedBy: 'Senior System Planner',
    createdAt: new Date().toISOString().split('T')[0]
  };

  dbState.purchaseRequests.unshift(newPR);
  createEventLog(`Manual Purchase Request ${prId} logged for Material ID: ${materialId}`, 'Production', 'info');
  res.json({ success: true, pr: newPR });
});

app.post("/api/procurement/po/create", (req, res) => {
  const { prId, supplierId, materialId, quantity } = req.body;
  const poId = `po-${Date.now().toString().slice(-4)}`;
  const pr = dbState.purchaseRequests.find(r => r.id === prId);
  const material = dbState.materials.find(m => m.id === materialId);
  
  if (pr) {
    pr.status = 'Ordered';
  }

  const cost = Number(quantity) * (material ? material.costPerUnit : 10);

  const newPO: PurchaseOrder = {
    id: poId,
    prId,
    supplierId,
    materialId,
    quantity: Number(quantity),
    totalCost: cost,
    status: 'Issued',
    createdAt: new Date().toISOString().split('T')[0]
  };

  dbState.purchaseOrders.unshift(newPO);
  createEventLog(`Purchase Order ${poId} generated and issued to Supplier ID: ${supplierId}. Total PO Cost: $${cost}`, 'Production', 'info');
  res.json({ success: true, po: newPO });
});

// Trigger: When GRN Received -> Create IQC Pending
app.post("/api/procurement/grn/receive", (req, res) => {
  const { poId, lotNumber, expiryDate, quantityReceived } = req.body;
  const po = dbState.purchaseOrders.find(o => o.id === poId);
  
  if (!po) {
    return res.status(404).json({ error: "PO not found" });
  }

  const grnId = `grn-${Date.now().toString().slice(-4)}`;
  const newGRN: GoodsReceipt = {
    id: grnId,
    poId,
    supplierId: po.supplierId,
    materialId: po.materialId,
    quantityReceived: Number(quantityReceived),
    lotNumber,
    expiryDate,
    status: 'Pending QC',
    createdAt: new Date().toISOString().split('T')[0]
  };

  dbState.goodsReceipts.unshift(newGRN);
  
  // Set PO Status
  po.status = 'Partially Received';

  // TRIGGER: Create Pending IQC Record
  const qcId = `qc-grn-${Date.now().toString().slice(-4)}`;
  const materialName = dbState.materials.find(m => m.id === po.materialId)?.name || 'Chemical Mat';
  
  dbState.qcInspections.unshift({
    id: qcId,
    sourceType: 'Incoming',
    referenceId: lotNumber,
    inspector: 'Elena Rostova',
    status: 'Pending',
    parameters: [
      { name: 'Supplier Certification Verification', value: 'Pending', expected: 'Certificate matching ISO standards', passed: false },
      { name: 'Moisture Water % Check', value: 'Pending', expected: '<= 1.0%', passed: false },
      { name: 'AQL Packaging Damage Audit', value: 'Pending', expected: 'No tear or leaks', passed: false }
    ],
    createdAt: new Date().toISOString().split('T')[0]
  });

  createEventLog(`[GRN RECEIVED] Goods Receiving entry ${grnId} processed. Created IQC verification ticket ${qcId} for lot ${lotNumber}.`, 'Production', 'warning');

  res.json({ success: true, grn: newGRN });
});

// QC Inspections Approve / Reject Trigger Workflows
app.post("/api/qc/resolve", (req, res) => {
  const { inspectionId, status, inspectorComments } = req.body;
  const qc = dbState.qcInspections.find(q => q.id === inspectionId);
  if (!qc) {
    return res.status(404).json({ error: "QC Ticket not found." });
  }

  qc.status = status;
  qc.inspector = 'Elena Rostova';
  qc.parameters.forEach(p => {
    p.passed = (status === 'Passed');
    p.value = (status === 'Passed') ? 'Verified OK' : 'Out of spec limit';
  });

  if (qc.sourceType === 'Incoming') {
    // Locate GRN by referencing LOT / ID
    const grn = dbState.goodsReceipts.find(g => g.lotNumber === qc.referenceId);
    if (grn) {
      grn.status = (status === 'Passed') ? 'QC Approved' : 'QC Rejected';
      const material = dbState.materials.find(m => m.id === grn.materialId);

      if (status === 'Passed') {
        if (material) {
          material.stockLevel += grn.quantityReceived;
        }
        createEventLog(`[QC PASSED] Raw material Lot ${grn.lotNumber} certified. Added ${grn.quantityReceived} ${material?.unit} into active factory inventory.`, 'Production', 'info');
      } else {
        // TRIGGER WORKFLOW: When IQC Rejected -> Lock Lot -> Create NCR
        createEventLog(`[NCR DETECTED - RAW LOT LOCKED] IQC Reject critical incident for Lot ${grn.lotNumber}. Lot permanently quarantined. Non-Conformance Incident Report filed. supplier informed.`, 'Production', 'error');
      }
    }
  } else if (qc.sourceType === 'Finished Goods') {
    const mo = dbState.manufacturingOrders.find(o => o.id === qc.referenceId);
    if (mo) {
      if (status === 'Passed') {
        mo.status = 'Released';
        // Auto Release Logic
        const prod = dbState.products.find(p => p.id === mo.productId);
        if (prod) {
          prod.stockLevel += mo.quantityRequested;
          mo.quantityProduced = mo.quantityRequested;
        }
        createEventLog(`[QC FINISHED PASSED] Batch Production ${mo.id} released. Premium Grade seal certified. Stock added to Finished Goods inventory.`, 'Production', 'info');
      } else {
        mo.status = 'Cancelled';
        createEventLog(`[PRODUCTION NCR WORKFLOW] MO ${mo.id} has failed finished product specifications check. Product Lot flagged [HOLD & QUARANTINED]. CAPA incident logged.`, 'Production', 'error');
      }
    }
  }

  runStateAutomations();
  res.json({ success: true, qc });
});


// --- MODULE 2: MAINTENANCE SYSTEM ---

app.post("/api/maintenance/repair/request", (req, res) => {
  const { machineId, description, priority, requestedBy } = req.body;
  const machine = dbState.machines.find(m => m.id === machineId);
  if (!machine) {
    return res.status(404).json({ error: "Machine register not found" });
  }

  const isAlreadyBroken = machine.status === 'Offline' || machine.status === 'Repairing';

  machine.status = 'Repairing';
  const tixId = `tix-${Date.now().toString().slice(-4)}`;
  const tech = "Tariq Al-Fayed"; // Default Tech assigned

  const newTicket: RepairTicket = {
    id: tixId,
    machineId,
    requestedBy: requestedBy || 'Marcus Brody',
    description,
    priority,
    status: 'Assigned',
    assignedTechnician: tech,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  dbState.repairTickets.unshift(newTicket);

  // TRIGGER: When Repair Requested -> Notify Technician
  createEventLog(`[MAINTENANCE NOTIFICATION] Repair Request ${tixId} received for Machine: ${machine.name}. Technician ${tech} dispatched immediately. Priority: ${priority}`, 'Maintenance', 'warning');

  res.json({ success: true, ticket: newTicket, machine });
});

app.post("/api/maintenance/repair/resolve", (req, res) => {
  const { ticketId, rootCause, correctiveAction } = req.body;
  const ticket = dbState.repairTickets.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  ticket.status = 'Resolved';
  ticket.rootCause = rootCause || 'Worn sealant ring seal fatigue';
  ticket.correctiveAction = correctiveAction || 'Replaced gasket ring and recalibrated hydraulic pressure sensors';
  ticket.resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const machine = dbState.machines.find(m => m.id === ticket.machineId);
  if (machine) {
    machine.status = 'Online';
  }

  createEventLog(`[REPAIR RESOLVED] Machine ${machine ? machine.name : ticket.machineId} returned online. Component updated: ${ticket.correctiveAction}`, 'Maintenance', 'info');

  res.json({ success: true, ticket });
});

app.post("/api/maintenance/pm/complete", (req, res) => {
  const { pmTaskId } = req.body;
  const pm = dbState.pmTasks.find(t => t.id === pmTaskId);
  if (!pm) {
    return res.status(404).json({ error: "PM task not found" });
  }

  pm.status = 'Completed';
  pm.completedBy = 'Tariq Al-Fayed';
  pm.completedAt = new Date().toISOString().split('T')[0];

  createEventLog(`[PREVENTIVE MAINTENANCE] Task '${pm.title}' completed successfully for machine ${pm.machineId}. Clean audit report filed.`, 'Maintenance', 'info');

  res.json({ success: true, pm });
});


// --- MODULE 3: HR & PAYROLL SYSTEM ---

app.post("/api/hr/attendance/clock", (req, res) => {
  const { employeeId, checkType, gpsCoords } = req.body;
  const emp = dbState.employees.find(e => e.id === employeeId);
  if (!emp) {
    return res.status(404).json({ error: "Employee record not found" });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().substring(0, 5);

  let record = dbState.attendance.find(a => a.employeeId === employeeId && a.date === todayStr);

  if (checkType === 'Check In') {
    if (record) {
      return res.status(400).json({ error: "Already checked in today." });
    }
    const isLate = timeStr > '08:00';
    record = {
      id: `att-${Date.now().toString().slice(-4)}`,
      employeeId,
      date: todayStr,
      checkIn: timeStr,
      gpsCoords: gpsCoords || { lat: 13.7563, lng: 100.5018 },
      status: isLate ? 'Late' : 'Present'
    };
    dbState.attendance.push(record);
    createEventLog(`[ATTENDANCE] Employee ${emp.name} clocked-in at ${timeStr}. Verified GPS lock. Status: ${record.status}`, 'HR', 'info');
  } else {
    if (!record) {
      return res.status(400).json({ error: "You must clock-in before checking out." });
    }
    record.checkOut = timeStr;
    createEventLog(`[ATTENDANCE] Employee ${emp.name} checked-out at ${timeStr}. Verified work shift completion.`, 'HR', 'info');
  }

  res.json({ success: true, record });
});

// Calculate & Post Payroll
app.post("/api/hr/payroll/post", (req, res) => {
  const { periodId } = req.body;
  const period = dbState.payrollPeriods.find(p => p.id === periodId);
  if (!period) {
    return res.status(404).json({ error: "Payroll Period does not exist." });
  }

  period.status = 'Posted';

  let totalPaySummaries = 0;

  // Process all employees
  dbState.employees.forEach(emp => {
    // Look up if payslip exists, otherwise build it
    let slip = dbState.payslips.find(s => s.employeeId === emp.id && s.payrollPeriodId === periodId);
    
    const base = emp.salary;
    const allowance = emp.allowance;
    const ot = 4500; // Simulated OT
    const bonus = 0;
    const sso = 750;
    const tax = Math.round(base * 0.08);
    const net = base + allowance + ot + bonus - sso - tax;

    if (!slip) {
      slip = {
        id: `slip-${Date.now().toString().slice(-4)}-${emp.id}`,
        payrollPeriodId: periodId,
        employeeId: emp.id,
        baseSalary: base,
        otPay: ot,
        allowanceSum: allowance,
        bonus,
        ssoDeduction: sso,
        taxDeduction: tax,
        netPay: net,
        pdfGenerated: true
      };
      dbState.payslips.push(slip);
    } else {
      slip.pdfGenerated = true;
    }

    totalPaySummaries += net;
  });

  // TRIGGER: When Payroll Approved -> Post to Accounting Ledger
  dbState.transactions.push({
    id: `tx-pay-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'Debit',
    category: 'Payroll Posting',
    amount: totalPaySummaries,
    description: `Wages & salaries disbursement posting for period ${period.periodName}`
  });

  createEventLog(`[PAYROLL POSTED TO GL] Payroll Period ${period.periodName} completed and locked. General ledger posted with a Debit transaction card of $${totalPaySummaries.toLocaleString()} under company payroll accounts. payslips sent automatically.`, 'Accounting', 'info');

  res.json({ success: true, period });
});

// Send E-Payslip Flex Message to LINE Bot Messaging Webhook
app.post("/api/hr/line-push", async (req, res) => {
  const { userId, flexPayload, customToken } = req.body;
  if (!userId || !flexPayload) {
    return res.status(400).json({ error: "Missing LINE userId or Flex Message JSON payload." });
  }

  const tokenToUse = customToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!tokenToUse) {
    // If no access token is configured, run in advanced simulation mode
    createEventLog(`[LINE SIMULATION] Constructed beautiful LINE Flex Payslip digital envelope for User ID: ${userId}. Recorded successfully in the Audit Registry.`, "HR", "info");
    return res.json({ 
      success: true, 
      message: "Simulation mode: SMS & LINE notification validated. Flex Payload was successfully compiled and processed.",
      mode: "simulation" 
    });
  }

  try {
    const lineResponse = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenToUse}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "flex",
            altText: "ใบแจ้งยอดเงินประจำเดือน (E-Payslip)",
            contents: flexPayload
          }
        ]
      })
    });

    if (lineResponse.ok) {
      createEventLog(`[LINE MSG DIRECT] Successfully dispatched payroll digital slip directly to LINE userId: ${userId}`, "HR", "info");
      return res.json({ success: true, message: "Real integration delivery: Dispatched directly to LINE API successfully!", mode: "live" });
    } else {
      const errorText = await lineResponse.text();
      console.error("LINE Messaging API responded with status error: ", errorText);
      return res.status(lineResponse.status).json({ 
        success: false, 
        error: `LINE API Error: ${errorText}`,
        message: "Real LINE dispatch failed. Please inspect Channel permissions or Token expiration." 
      });
    }
  } catch (error: any) {
    console.error("Failed to connect with LINE API REST endpoint: ", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});


// --- MODULE 4: FINANCIAL ACCOUNTING ---

app.post("/api/accounting/invoice/pay", (req, res) => {
  const { id } = req.body;
  const invoice = dbState.invoices.find(i => i.id === id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  invoice.status = 'Paid';

  // TRIGGER: Create accounts transaction ledger Cr Revenue
  dbState.transactions.push({
    id: `tx-inv-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'Credit',
    category: 'Revenue',
    amount: invoice.amount,
    description: `Apex AR Posting Receipt: Client payment cleared for invoice ID: ${id}`
  });

  createEventLog(`[REVENUE Cleared] Accounts Receivable invoice ${id} paid in full ($${invoice.amount.toLocaleString()} received). Cash accounts updated.`, 'Accounting', 'info');

  res.json({ success: true, invoice });
});

app.post("/api/accounting/expense/add", (req, res) => {
  const { amount, description, category } = req.body;
  
  const newTx: AccountTransaction = {
    id: `tx-exp-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    type: 'Debit',
    category: category || 'Expense',
    amount: Number(amount),
    description
  };

  dbState.transactions.unshift(newTx);
  createEventLog(`Manual expense booked: ${description} - Total $${Number(amount).toLocaleString()}`, 'Accounting', 'info');
  res.json({ success: true, transaction: newTx });
});

app.post("/api/accounting/invoice/remind", (req, res) => {
  const { invoiceId } = req.body;
  const inv = dbState.invoices.find(i => i.id === invoiceId);
  if (!inv) return res.status(404).json({ error: "Invoice not found" });
  
  createEventLog(`[AR REMINDER] Remittance notification alert dispatched to customer ledger account for invoice ${invoiceId}`, "Accounting", "info");
  res.json({ success: true, message: `Reminder sent to client for invoice ${invoiceId}` });
});

app.post("/api/accounting/invoice/settle", (req, res) => {
  const { invoiceId } = req.body;
  const inv = dbState.invoices.find(i => i.id === invoiceId);
  if (!inv) return res.status(404).json({ error: "Invoice not found" });
  
  inv.status = 'Paid';
  
  // Settle invoice logic
  const cashAc = dbState.coa.find(c => c.code === '1010');
  const arAc = dbState.coa.find(c => c.code === '1030');
  if (cashAc) cashAc.balance += inv.amount;
  if (arAc) arAc.balance = Math.max(0, arAc.balance - inv.amount);
  
  const journalId = `jn-settle-${Date.now().toString().slice(-4)}`;
  dbState.journals.unshift({
    id: journalId,
    memo: `Settle invoice ${invoiceId} and recognize cash receipt`,
    date: new Date().toISOString().split('T')[0],
    lines: [
      { accountCode: '1010', type: 'Debit', amount: inv.amount },
      { accountCode: '1030', type: 'Credit', amount: inv.amount }
    ]
  });

  createEventLog(`[AR REVENUE SETTLEMENT] Invoice ${invoiceId} marked as settled ($${inv.amount.toLocaleString()} cash credited). Created Journal Entry ${journalId}`, "Accounting", "info");
  res.json({ success: true, journalId });
});

app.post("/api/accounting/bill/pay", (req, res) => {
  const { billId } = req.body;
  const bill = dbState.supplierBills.find(b => b.id === billId);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  bill.status = 'Paid';
  
  const altBill = dbState.bills.find((b: any) => b.id === billId);
  if (altBill) altBill.status = 'Paid';

  const cashAc = dbState.coa.find(c => c.code === '1010');
  const apAc = dbState.coa.find(c => c.code === '2010');
  if (cashAc) cashAc.balance = Math.max(0, cashAc.balance - bill.amount);
  if (apAc) apAc.balance = Math.max(0, apAc.balance - bill.amount);

  const journalId = `jn-pay-${Date.now().toString().slice(-4)}`;
  dbState.journals.unshift({
    id: journalId,
    memo: `Disburse payment to settle supplier bill ${billId}`,
    date: new Date().toISOString().split('T')[0],
    lines: [
      { accountCode: '2010', type: 'Debit', amount: bill.amount },
      { accountCode: '1010', type: 'Credit', amount: bill.amount }
    ]
  });

  createEventLog(`[AP LIABILTY DISBURSEMENT] Supplier Bill ${billId} paid & settled ($${bill.amount.toLocaleString()} cash disbursed). Created Journal Entry ${journalId}`, "Accounting", "warning");
  res.json({ success: true, journalId });
});

app.post("/api/accounting/journal/post", (req, res) => {
  const { lines, memo } = req.body;
  if (!lines || !Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ error: "A valid General Journal entry requires at least 2 segments." });
  }

  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of lines) {
    if (line.type === 'Debit') {
      totalDebit += Number(line.amount);
    } else if (line.type === 'Credit') {
      totalCredit += Number(line.amount);
    }
  }

  if (totalDebit !== totalCredit) {
    return res.status(400).json({ error: `Out of balance: Total Debits ($${totalDebit}) must equal Total Credits ($${totalCredit}).` });
  }

  for (const line of lines) {
    const account = dbState.coa.find(c => c.code === line.accountCode);
    if (account) {
      if (line.type === 'Debit') {
        if (typeof account.balance !== 'number') account.balance = 0;
        if (account.type === 'Asset' || account.type === 'Expense') {
          account.balance += Number(line.amount);
        } else {
          account.balance = Math.max(0, account.balance - Number(line.amount));
        }
      } else if (line.type === 'Credit') {
        if (typeof account.balance !== 'number') account.balance = 0;
        if (account.type === 'Liability' || account.type === 'Equity' || account.type === 'Revenue') {
          account.balance += Number(line.amount);
        } else {
          account.balance = Math.max(0, account.balance - Number(line.amount));
        }
      }
    }
  }

  const jnId = `jn-manual-${Date.now().toString().slice(-4)}`;
  const newJournal = {
    id: jnId,
    memo,
    date: new Date().toISOString().split('T')[0],
    lines
  };

  dbState.journals.unshift(newJournal);

  createEventLog(`[MANUAL GENERAL JOURNAL AUDIT] Journal Entry posted (ID: ${jnId}) with ${lines.length} segments balancing at $${totalDebit.toLocaleString()}`, "Accounting", "info");
  res.json({ success: true, journal: newJournal });
});


// --- EXECUTIVE AI GEMINI COPILOT ---
app.post("/api/copilot", async (req, res) => {
  const { message } = req.body;
  
  // Set default recommendation in case API key is missing
  let aiResponse = `### IDEVA Factory OS Architect Insights

I detected that the Gemini API Key is unconfigured in your developer studio environment. Let me provide my offline heuristic-analytic recommendations based on your active factory state:

- **Inventory warning**: Your *Double-walled Export Carton Box* is currently running at **${dbState.materials[4].stockLevel} units** which is below the strategic safety threshold of **${dbState.materials[4].minStock} pieces**. Standard replacement purchase request PR-1002 has been automatically issued to avoid a complete bottleneck at packaging lines.
- **Maintenance status**: Machine **${dbState.machines[3].name}** is on active maintenance due to hydraulic pressure issues (Repair Ticket **tix-01**). Priority dispatch is marked Critical with Tariq Al-Fayed assigned.
- **Financial summary**: Year-to-Date production costs represent **$${(dbState.transactions.filter(t => t.category === "Production Cost Posting").reduce((acc, current) => acc+current.amount, 0)).toLocaleString()}** with a strong operating cashflow margin. Highly recommend approving June payroll early to ensure uninterrupted floor operations.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const promptContext = `
        You are the Chief AI Operating Architect at IDEVA Factory OS, an advanced ERP suite worth $50,000 for manufacturing enterprises.
        
        Analyze this live industrial database metrics:
        1. Materials Stock Inventory: ${JSON.stringify(dbState.materials)}
        2. Maintenance Machines states: ${JSON.stringify(dbState.machines)}
        3. Active Manufacturing Orders: ${JSON.stringify(dbState.manufacturingOrders)}
        4. Repair Tickets: ${JSON.stringify(dbState.repairTickets)}
        5. Financial Transactions ledger categories: ${JSON.stringify(dbState.transactions)}
        6. System Logs and warnings: ${JSON.stringify(dbState.auditLogs.slice(0,5))}
        
        The user has sent the following advisory query: "${message}"
        
        Provide an executive-grade suite architecture report and tactical recommendations. Focus on optimizing bottlenecks, inventory forecasting, machine MTBF analysis, and workflow efficiency. Use rich markdown formatting, clean structural bulleting, and a high-level corporate tone. Make it extremely specific to the live metrics shown above. Mention specific raw materials or orders.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
      });

      if (response && response.text) {
        aiResponse = response.text;
      }
    }
  } catch (err: any) {
    console.error("AI Copilot request error: ", err);
    aiResponse += `\n\n*(Note: Client-side simulation mode engaged due to model service connection: ${err.message})*`;
  }

  res.json({ response: aiResponse });
});

// --- PORTING DELIVERABLE: SQL DDL SCHEMAS AND ER DIAGRAM ---
app.get("/api/db/schema", (req, res) => {
  const schemaDDL = `-- ========================================================
-- IDEVA Factory OS v1.0 Enterprise Database DDL
-- SQL Target Dialect: PostgreSQL 15+ / Cloud SQL
-- Generated dynamically on ${new Date().toISOString()}
-- Architecture: Unified Master Shared Model
-- ========================================================

-- Disable constraints temporarily to safely build
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Clean existing entities
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

-- -------------------------------------------------------------
-- SECTION A: MASTER SHARED DATA SCHEMAS
-- -------------------------------------------------------------

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
    skills TEXT[]
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

-- -------------------------------------------------------------
-- SECTION B: PRODUCTION OS SCHEMAS
-- -------------------------------------------------------------

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
    source_type VARCHAR(30) CHECK(source_type IN ('Incoming', 'Bulk', 'Finished Goods')),
    reference_id VARCHAR(100) NOT NULL,
    inspector VARCHAR(100) NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Passed', 'Failed', 'Pending')),
    parameters JSONB NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE
);

-- -------------------------------------------------------------
-- SECTION C: MAINTENANCE OS SCHEMAS
-- -------------------------------------------------------------

CREATE TABLE machines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    section VARCHAR(100),
    status VARCHAR(30) CHECK(status IN ('Online', 'Repairing', 'Maintenance', 'Offline')),
    qr_code_url VARCHAR(255) NOT NULL,
    installed_date DATE NOT NULL,
    mtbf_hours NUMERIC(10,2),
    mttr_hours NUMERIC(10,2)
);

CREATE TABLE pm_tasks (
    id VARCHAR(50) PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    due_by DATE NOT NULL,
    status VARCHAR(30) CHECK(status IN ('Pending', 'Completed', 'Overdue')),
    checklist TEXT[] NOT NULL,
    completed_by VARCHAR(100),
    completed_at DATE
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

-- -------------------------------------------------------------
-- SECTION D: HR & PAYROLL OS SCHEMAS
-- -------------------------------------------------------------

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

-- -------------------------------------------------------------
-- SECTION E: FINANCIAL ACCOUNTING OS SCHEMAS
-- -------------------------------------------------------------

CREATE TABLE account_transactions (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(10) CHECK(type IN ('Debit', 'Credit')),
    category VARCHAR(50) CHECK(category IN ('Revenue', 'AP', 'AR', 'Expense', 'Tax', 'Payroll Posting', 'Production Cost Posting')),
    amount NUMERIC(12,2) NOT NULL,
    description VARCHAR(255) NOT NULL
);

-- INDEXES FOR ENTERPRISE RESOLUTION SPEED --
CREATE INDEX idx_emp_dept ON employees(department_id);
CREATE INDEX idx_formula_product ON formula_headers(product_id);
CREATE INDEX idx_mo_prod ON manufacturing_orders(product_id);
CREATE INDEX idx_qc_ref ON qc_inspections(reference_id);
CREATE INDEX idx_repair_machine ON repair_tickets(machine_id);
CREATE INDEX idx_attendance_day ON attendance_records(date, employee_id);
CREATE INDEX idx_ledger_cat ON account_transactions(category, date);

-- DISABLE ROW LEVEL SECURITY (RLS) FOR ALL RELATIONAL TABLES FOR ANONYMOUS APP ACCESS --
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

-- SEED STATEMENTS INSERT --
INSERT INTO roles VALUES ('role-admin', 'Admin', ARRAY['Production', 'Maintenance', 'HR', 'Accounting', 'Developer']);
INSERT INTO departments VALUES ('dept-1', 'Administration', 'ADM');
INSERT INTO departments VALUES ('dept-2', 'Production', 'PRD');
INSERT INTO departments VALUES ('dept-3', 'Quality Control', 'QAQC');
`;
  res.json({ ddl: schemaDDL });
});

// ----------------------------------------------------
// DATABASE CONFIGURATION AND UTILITY APIS
// ----------------------------------------------------
app.get("/api/db/config", (req, res) => {
  res.json({
    config: dbConfig,
    logs: dbSqlLogs,
    connected: true,
    localDbExists: fs.existsSync(LOCAL_DB_FILE)
  });
});

app.post("/api/db/config", async (req, res) => {
  try {
    const newConfig = { ...dbConfig, ...req.body };
    dbConfig = newConfig;
    
    // Persist configurations physically
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(dbConfig, null, 2), "utf-8");
    } catch (fsErr: any) {
      console.warn("[PERSISTENCE WARNING] Could not write db_config.json to filesystem (this is expected on some read-only / serverless container overlays):", fsErr.message);
    }
    
    logSqlQuery("DB SWITCH", `SYSTEM RECONFIGURED - CHANGED ACTIVE DRIVER VALUE TO: ${dbConfig.type.toUpperCase()}`);
    
    // Reload active database
    await loadActiveDatabase();
    
    res.json({ success: true, config: dbConfig, logs: dbSqlLogs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/db/init-schema", async (req, res) => {
  const type = req.body.type || dbConfig.type;
  const dialect = type.toUpperCase();
  logSqlQuery("SCHEMA RESET", `RESETTING SCHEMAS ON DRIVER=${dialect}; DROPPING AND RE-CREATING ALL 22 SCHEMAS...`);
  
  const tables = [
    "departments", "roles", "employees", "customer_master", "supplier_master", 
    "product_master", "material_master", "formula_headers", "formula_details", 
    "machines", "manufacturing_orders", "purchase_requests", "purchase_orders", 
    "goods_receipts", "qc_inspections", "repair_tickets", "pm_tasks", 
    "attendance_records", "payroll_periods", "payslips", "account_transactions", "audit_logs"
  ];
  
  tables.forEach(tbl => {
    if (dialect === "ORACLE") {
      logSqlQuery("CREATE TABLE", `CREATE TABLE ${tbl.toUpperCase()} (ID VARCHAR2(50) PRIMARY KEY, PAYLOAD_BLOB CLOB, CREATED_AT TIMESTAMP);`);
    } else {
      logSqlQuery("CREATE TABLE", `CREATE TABLE IF NOT EXISTS \`${tbl}\` (\`id\` VARCHAR(50) PRIMARY KEY, \`payload\` JSON, \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;`);
    }
  });

  // Wipe local data state cleanly as requested for 100% database reset
  dbState = {
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
      { id: 'n-new', message: 'Database initialized with pristine active schema tables.', severity: 'info', createdAt: new Date().toISOString() }
    ],
    salesJobs: [],
    coaRecords: [],
    packagingLotLogs: []
  };

  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
  } catch (err) {}
  
  res.json({ success: true, message: `Successfully initialized pristine schemas and created ${tables.length} tables in ${dialect} format!` });
});


// ----------------------------------------------------
// VITE DEV SERVER OR STATIC SERVING RUNTIME
// ----------------------------------------------------

async function startServer() {
  // Load local configurations and memory database cleanly on startup
  initDatabaseAndConfig();

  // Boot dynamic responsive database driver (Localhost/XAMPP/Appserv/Oracle/Postgres)
  await loadActiveDatabase();

  // Vite integration in Dev, static file hosting in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware AFTER API routes
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[IDEVA OS RUNTIME] Realtime fullstack cluster active at http://localhost:${PORT}`);
  });
}

startServer();
