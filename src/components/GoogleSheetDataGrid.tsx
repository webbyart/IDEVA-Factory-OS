import React, { useState, useMemo } from 'react';
import { 
  ArrowUpDown, Search, Eye, EyeOff, FileText, FileSpreadsheet, 
  ChevronLeft, ChevronRight, Check, X, Download, PlusSquare
} from 'lucide-react';

export interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  readOnly?: boolean;
}

interface GoogleSheetDataGridProps {
  columns: ColumnConfig[];
  data: any[];
  onUpdateRow?: (id: string, updatedFields: any) => void;
  onDeleteRow?: (id: string) => void;
  onAddRow?: () => void;
  title?: string;
  statusField?: string;
}

export default function GoogleSheetDataGrid({
  columns,
  data = [],
  onUpdateRow,
  onDeleteRow,
  onAddRow,
  title = "Google Sheets Data Grid",
  statusField = "status"
}: GoogleSheetDataGridProps) {
  // Sorting state
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Search/Filter state
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Hidden columns state
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>({});
  const [showColumnControls, setShowColumnControls] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Inline edit state
  const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
  const [cellTempValues, setCellTempValues] = useState<Record<string, any>>({});

  // Reset or change sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Toggle column visibility
  const toggleColumn = (key: string) => {
    setHiddenColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Column filter change
  const handleColumnFilterChange = (key: string, val: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: val
    }));
    setCurrentPage(1);
  };

  // Start inline edit
  const startEdit = (rowId: string, colKey: string, currentVal: any) => {
    const col = columns.find(c => c.key === colKey);
    if (col?.readOnly || colKey === 'id') return; // Read only
    setEditingCell({ rowId, colKey });
    setCellTempValues({ [`${rowId}-${colKey}`]: currentVal });
  };

  // Confirm inline edit
  const finishEdit = (rowId: string, colKey: string) => {
    const key = `${rowId}-${colKey}`;
    const newVal = cellTempValues[key];
    if (onUpdateRow && newVal !== undefined) {
      onUpdateRow(rowId, { [colKey]: newVal });
    }
    setEditingCell(null);
  };

  // Cancel inline edit
  const cancelEdit = () => {
    setEditingCell(null);
  };

  // Handle value change during edit
  const handleCellValChange = (rowId: string, colKey: string, val: any, type: string) => {
    let finalVal = val;
    if (type === 'number') {
      finalVal = val === '' ? 0 : Number(val);
    }
    setCellTempValues(prev => ({
      ...prev,
      [`${rowId}-${colKey}`]: finalVal
    }));
  };

  // Filter & Sort computation
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Global Search
    if (globalSearch) {
      const lower = globalSearch.toLowerCase();
      result = result.filter(row => {
        return Object.values(row).some(v => 
          String(v).toLowerCase().includes(lower)
        );
      });
    }

    // 2. Column Filters
    Object.entries(columnFilters).forEach(([key, filterVal]) => {
      if (filterVal) {
        const lowerFilter = String(filterVal).toLowerCase();
        result = result.filter(row => 
          String(row[key] || '').toLowerCase().includes(lowerFilter)
        );
      }
    });

    // 3. Sorting
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
        if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, globalSearch, columnFilters, sortField, sortOrder]);

  // Pagination calculation
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Adjust page if data changes
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Export functions
  const exportCSV = () => {
    const visibleCols = columns.filter(c => !hiddenColumns[c.key]);
    const headers = visibleCols.map(c => c.label).join(',');
    const rows = processedData.map(row => {
      return visibleCols.map(c => {
        const val = row[c.key];
        return `"${String(val || '').replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_MasterList.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const visibleCols = columns.filter(c => !hiddenColumns[c.key]);
    
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /></head>
      <body>
        <table border="1">
          <tr style="background-color: #0B3C5D; color: white; font-weight: bold;">
            ${visibleCols.map(c => `<th>${c.label}</th>`).join('')}
          </tr>
          ${processedData.map((row, idx) => `
            <tr style="background-color: ${idx % 2 === 1 ? '#F8FBFF' : '#FFFFFF'}">
              ${visibleCols.map(c => `<td>${row[c.key] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_Spreadsheet.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    // Standard Print View layout
    window.print();
  };

  // Render badges for status
  const renderStatusBadge = (val: string) => {
    const cleanVal = String(val).trim();
    if (cleanVal.includes('เสร็จสิ้น') || cleanVal.includes('Completed') || cleanVal.includes('Released')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          🟢 เสร็จสิ้น
        </span>
      );
    } else if (cleanVal.includes('รอดำเนินการ') || cleanVal.includes('Pending') || cleanVal.includes('รอการวางแผน') || cleanVal.includes(' Created') || cleanVal.includes('Created') || cleanVal.includes('รอจัดซื้อ')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-amber-50 text-amber-800 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          🟡 รอดำเนินการ
        </span>
      );
    } else if (cleanVal.includes('กำลังผลิต') || cleanVal.includes('In Production') || cleanVal.includes('Weighing') || cleanVal.includes('เบิกวัตถุดิบแล้ว') || cleanVal.includes('Active')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-blue-50 text-blue-800 border border-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          🔵 กำลังผลิต
        </span>
      );
    } else {
      // Default fallback or deficient
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-full bg-rose-50 text-rose-800 border border-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          🔴 วัตถุดิบไม่พอ
        </span>
      );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col w-full text-slate-800 select-text">
      
      {/* Upper Sheets Controller Hub */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-[#0B3C5D] text-base tracking-tight flex items-center gap-2">
            <span className="p-1 px-2.5 bg-[#0B3C5D] text-white text-xs rounded-lg font-mono">SHEET</span>
            {title}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            ระเบียบลงระบบประเมินแอนะล็อกแบบ Google Sheets • ตรึง Header, ค้นหาเรียงแถว, และแก้ไขข้อมูลแบบ Inline ด่วน
          </p>
        </div>

        {/* Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Main search bar */}
          <div className="relative flex-1 md:flex-initial min-w-[180px]">
            <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="ค้นหาข้อมูลสัมบูรณ์..."
              value={globalSearch}
              onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-1.5 w-full bg-white border border-slate-250 rounded-xl text-xs outline-none focus:border-[#0B3C5D] focus:ring-1 focus:ring-[#0B3C5D]/20 transition-all font-semibold"
            />
          </div>

          {/* Hiding/Showing Columns Dropdown panel */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowColumnControls(!showColumnControls)}
              className="px-3.5 py-1.5 bg-white border border-slate-250 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>ซ่อน/แสดงคอลัมน์</span>
            </button>
            {showColumnControls && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 p-3.5 space-y-2 text-xs">
                <p className="font-black text-slate-800 border-b pb-1">เลือกแสดงคอลัมน์</p>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {columns.map(col => (
                    <label key={col.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={!hiddenColumns[col.key]}
                        onChange={() => toggleColumn(col.key)}
                        className="rounded border-slate-300 text-[#0B3C5D] focus:ring-[#0B3C5D]"
                      />
                      <span className="font-semibold text-slate-700">{col.label}</span>
                    </label>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowColumnControls(false)}
                  className="w-full text-center py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-800 border border-slate-200"
                >
                  เสร็จสิ้น
                </button>
              </div>
            )}
          </div>

          {/* Toggle individual column filters row */}
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-1.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${showFilters ? 'bg-[#0B3C5D]/10 border-[#0B3C5D] text-[#0B3C5D]' : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>ฟิลเตอร์หัวกรอง ({Object.values(columnFilters).filter(Boolean).length})</span>
          </button>

          {/* Exports Buttons layout */}
          <button 
            type="button" 
            onClick={exportExcel}
            className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
            title="ดาวน์โหลดไฟล์ Microsoft Excel (.xls)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          
          <button 
            type="button" 
            onClick={exportCSV}
            className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
            title="ดาวน์โหลดไฟล์ CSV"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>

          {onAddRow && (
            <button
              type="button"
              onClick={onAddRow}
              className="p-1.5 px-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-extrabold flex items-center gap-1"
            >
              <PlusSquare className="w-3.5 h-3.5" /> เพิ่มสถิติกดบวก
            </button>
          )}
        </div>
      </div>

      {/* Grid Table Arena with fixed layout and sticky styling */}
      <div className="overflow-auto max-h-[500px]" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full border-collapse text-xs select-text table-fixed min-w-[750px]">
          <thead>
            {/* Sticky table column labels mapped like Excel alphabet indices */}
            <tr className="bg-slate-100 text-[#86868B] font-mono border-b border-slate-200">
              <th className="w-14 text-center py-1 font-semibold select-none bg-slate-150 border-r border-slate-200">#</th>
              {columns.filter(c => !hiddenColumns[c.key]).map((col, idx) => (
                <th key={col.key} className="px-3 py-1 font-bold tracking-wider text-center border-r border-slate-200 select-none">
                  {String.fromCharCode(65 + idx)}
                </th>
              ))}
              {onDeleteRow && <th className="w-20 select-none text-center bg-slate-150 border-r border-slate-200">🗑️</th>}
            </tr>

            {/* Core Header row labeled in dark blue as requested */}
            <tr className="bg-[#0B3C5D] text-white border-b border-indigo-950 text-left">
              <th className="w-14 text-center select-none font-bold py-3 border-r border-indigo-900">No.</th>
              {columns.filter(c => !hiddenColumns[c.key]).map(col => (
                <th 
                  key={col.key} 
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 font-black text-xs border-r border-indigo-900 cursor-pointer select-none group relative hover:bg-[#072438]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-extrabold">{col.label}</span>
                    <ArrowUpDown className={`w-3 h-3 text-white/50 group-hover:text-white transition-colors ${sortField === col.key ? 'text-white opacity-100' : 'opacity-40'}`} />
                  </div>
                  <span className="text-[9px] font-mono font-medium block text-indigo-200/70">[{col.key}]</span>
                </th>
              ))}
              {onDeleteRow && <th className="w-20 text-center font-bold border-r border-indigo-900 select-none">ควบคุมถอน</th>}
            </tr>

            {/* Optional individual Column filters row */}
            {showFilters && (
              <tr className="bg-slate-50 border-b border-slate-200">
                <td className="w-14 text-center py-1 bg-slate-100 border-r border-slate-200 font-bold text-[#86868B]">🔍</td>
                {columns.filter(c => !hiddenColumns[c.key]).map(col => (
                  <td key={col.key} className="p-1 px-2 border-r border-slate-200">
                    <input 
                      type="text"
                      placeholder={`กรองด่วน...`}
                      value={columnFilters[col.key] || ''}
                      onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 py-1 text-[11px] outline-none font-semibold text-slate-800"
                    />
                  </td>
                ))}
                {onDeleteRow && <td className="w-20 bg-slate-100 border-r border-slate-200"></td>}
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-150">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.filter(c => !hiddenColumns[c.key]).length + (onDeleteRow ? 2 : 1)} className="py-12 text-center text-slate-400 font-bold bg-white italic">
                  -- ไม่พบข้อมูลแถวในเกณฑ์ที่วางเงื่อนไขตัวกรอง --
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index + 1;
                // Alternating row styling: Odd white, Even light blue as requested
                const isEven = index % 2 === 1;
                const rowClass = isEven ? 'bg-[#F8FBFF]' : 'bg-white';

                return (
                  <tr 
                    key={row.id || index}
                    className={`${rowClass} hover:bg-[#EAF3FF] transition-colors leading-relaxed border-b border-slate-150`}
                  >
                    {/* Index label like spreadsheet rows */}
                    <td className="w-14 text-center font-mono font-bold select-none p-2.5 text-slate-400 bg-slate-50 border-r border-slate-200">
                      {globalIndex}
                    </td>

                    {/* Columns mapping cells */}
                    {columns.filter(c => !hiddenColumns[c.key]).map(col => {
                      const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === col.key;
                      const cellValue = row[col.key] === undefined || row[col.key] === null ? '' : row[col.key];
                      const isReadOnly = col.readOnly || col.key === 'id';
                      const isStatus = col.key === statusField;

                      return (
                        <td 
                          key={col.key}
                          onClick={() => { if (!isReadOnly && !isEditing) startEdit(row.id, col.key, cellValue); }}
                          className={`p-2 px-3 border-r border-slate-200 font-bold select-text text-xs relative ${isReadOnly ? 'bg-slate-50/40 text-slate-500' : 'cursor-pointer hover:bg-indigo-50/50'}`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1 z-30 bg-white shadow-lg p-1.5 rounded-xl border border-indigo-400" onClick={(e)=>e.stopPropagation()}>
                              {col.type === 'select' ? (
                                <select 
                                  value={cellTempValues[`${row.id}-${col.key}`] || ''}
                                  onChange={(e) => handleCellValChange(row.id, col.key, e.target.value, 'select')}
                                  className="p-1 px-1.5 w-full bg-slate-50 text-slate-900 Outline-none border border-slate-300 font-black rounded text-[11px]"
                                >
                                  {(col.options || []).map(opt => (
                                    <option key={opt} value={opt} className="text-slate-950 font-bold bg-white">{opt}</option>
                                  ))}
                                </select>
                              ) : col.type === 'number' ? (
                                <input 
                                  type="number"
                                  value={cellTempValues[`${row.id}-${col.key}`] || 0}
                                  onChange={(e) => handleCellValChange(row.id, col.key, e.target.value, 'number')}
                                  className="p-1 w-full bg-slate-50 border text-slate-900 border-slate-300 font-bold rounded text-[11px] outline-none"
                                />
                              ) : col.type === 'date' ? (
                                <input 
                                  type="date"
                                  value={cellTempValues[`${row.id}-${col.key}`] || ''}
                                  onChange={(e) => handleCellValChange(row.id, col.key, e.target.value, 'date')}
                                  className="p-1 w-full bg-slate-50 border text-slate-900 border-slate-300 font-mono rounded text-[11px] outline-none"
                                />
                              ) : (
                                <input 
                                  type="text"
                                  value={cellTempValues[`${row.id}-${col.key}`] || ''}
                                  onChange={(e) => handleCellValChange(row.id, col.key, e.target.value, 'text')}
                                  className="p-1 w-full bg-slate-50 border text-slate-900 border-slate-300 font-semibold rounded text-[11px] outline-none"
                                />
                              )}
                              <button 
                                type="button" 
                                onClick={() => finishEdit(row.id, col.key)}
                                className="p-1 bg-[#34C759] hover:bg-[#30b551] text-white rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                type="button" 
                                onClick={cancelEdit}
                                className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="truncate">
                              {isStatus ? (
                                renderStatusBadge(cellValue)
                              ) : col.type === 'number' ? (
                                <span className="font-mono">{Number(cellValue).toLocaleString()}</span>
                              ) : col.type === 'date' ? (
                                <span className="font-mono text-slate-600">{cellValue}</span>
                              ) : (
                                <span className={col.key === 'id' || col.key === 'jobCode' ? 'font-mono text-indigo-700' : ''}>
                                  {cellValue}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Delete action cell */}
                    {onDeleteRow && (
                      <td className="w-20 text-center border-r border-slate-205 py-2">
                        <button
                          type="button"
                          onClick={() => { if(window.confirm('ยืนยันลบรายการแถวนี้ถาวร?')) onDeleteRow(row.id); }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Table Footer / Pagination */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-wrap justify-between items-center gap-3 text-xs font-semibold text-slate-505">
        <div className="flex items-center gap-2">
          <span>แสดงแถวต่อหน้า:</span>
          <select 
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-white border border-slate-250 p-1 px-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-slate-400 bg-slate-100 p-1 px-2 border rounded-lg font-mono">
            แสดง {processedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, processedData.length)} จากทั้งหมด {processedData.length} รายการ
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1.5 bg-white border border-slate-250 hover:bg-slate-50 rounded-lg text-slate-600 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-700">หน้า <strong>{currentPage}</strong> จาก <strong>{totalPages}</strong></span>
          <button 
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1.5 bg-white border border-slate-250 hover:bg-slate-50 rounded-lg text-slate-600 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
