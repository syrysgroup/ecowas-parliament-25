import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, ChevronsUpDown, Plus, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { customerData } from "@/fake-db/apps/ecommerce";
import type { Customer } from "@/types/apps/ecommerceTypes";

const statusColors: Record<Customer["status"], string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const fuzzyFilter: FilterFn<Customer> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columnHelper = createColumnHelper<Customer>();

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const CustomerListTable = () => {
  const [data, setData] = useState<Customer[]>(customerData);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            className="h-3.5 w-3.5"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            className="h-3.5 w-3.5"
          />
        ),
        enableSorting: false,
      },
      columnHelper.accessor("customer", {
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.avatar ? (
              <img
                src={row.original.avatar}
                alt={row.original.customer}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{getInitials(row.original.customer)}</span>
              </div>
            )}
            <div>
              <Link
                to={`/apps/ecommerce/customers/details/${row.original.customerId}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {row.original.customer}
              </Link>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("customerId", {
        header: "ID",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">#{row.original.customerId}</span>,
      }),
      columnHelper.accessor("country", {
        header: "Country",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <img
              src={row.original.countryFlag}
              alt={row.original.country}
              className="w-5 h-5 rounded-full object-cover"
              loading="lazy"
            />
            <span className="text-sm text-foreground">{row.original.country}</span>
          </div>
        ),
      }),
      columnHelper.accessor("order", {
        header: "Orders",
        cell: ({ row }) => <span className="text-sm text-foreground">{row.original.order}</span>,
      }),
      columnHelper.accessor("totalSpent", {
        header: "Total Spent",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            ${row.original.totalSpent.toLocaleString()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[row.original.status]}`}>
            {row.original.status}
          </span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const handleAddCustomer = () => {
    if (!newName || !newEmail) return;
    setData((prev) => [
      ...prev,
      {
        customerId: prev.length + 1,
        customer: newName,
        email: newEmail,
        country: "USA",
        countryFlag: "/images/cards/us.png",
        order: 0,
        totalSpent: 0,
        status: "active",
      },
    ]);
    setNewName("");
    setNewEmail("");
    setAddOpen(false);
  };

  return (
    <>
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Input
              placeholder="Search customers..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-xs h-8 text-sm"
            />
            <div className="flex items-center gap-2">
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger className="h-8 w-20 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Download size={13} />
                Export
              </Button>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setAddOpen(true)}>
                <Plus size={13} />
                Add Customer
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1 cursor-pointer select-none">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              header.column.getIsSorted() === "asc" ? <ChevronUp size={12} /> :
                              header.column.getIsSorted() === "desc" ? <ChevronDown size={12} /> :
                              <ChevronsUpDown size={12} className="opacity-40" />
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-muted-foreground text-sm">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              {table.getFilteredRowModel().rows.length} total customers
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={13} />
              </Button>
              <span className="text-xs px-2">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="john@example.com" type="email" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustomer}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerListTable;
