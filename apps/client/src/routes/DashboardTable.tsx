import { createFileRoute } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "../dashboard/components/button"
import { Badge } from "../dashboard/components/badge"
import { DataTable } from "../dashboard/components/data-table"
import type { DashboardData } from "@workspace/types"

// Sample data
const sampleData: DashboardData[] = [
  {
    id: "1",
    name: "Project Alpha",
    status: "active",
    revenue: 125000,
    growth: 12.5,
    lastUpdated: "2024-01-15"
  },
  {
    id: "2", 
    name: "Project Beta",
    status: "inactive",
    revenue: 87500,
    growth: -8.2,
    lastUpdated: "2024-01-14"
  },
  {
    id: "3",
    name: "Project Gamma",
    status: "pending",
    revenue: 0,
    growth: 0,
    lastUpdated: "2024-01-16"
  },
  {
    id: "4",
    name: "Project Delta",
    status: "active",
    revenue: 210000,
    growth: 25.3,
    lastUpdated: "2024-01-15"
  }
]

// Column definitions
const columns: ColumnDef<DashboardData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "active" ? "default" : status === "pending" ? "secondary" : "destructive"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "revenue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Revenue
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("revenue"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "growth",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Growth %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const growth = parseFloat(row.getValue("growth"))
      return (
        <div className={`font-medium ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
          {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
        </div>
      )
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      return <div className="text-muted-foreground">{row.getValue("lastUpdated")}</div>
    },
  },
]

export default function DashboardTable() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard Table</h1>
        <p className="text-muted-foreground">
          Example table using TanStack Table with sorting, filtering, and pagination
        </p>
      </div>
      <DataTable columns={columns} data={sampleData} searchKey="name" />
    </div>
  )
}

export const Route = createFileRoute('/DashboardTable')({
  component: DashboardTable,
})
