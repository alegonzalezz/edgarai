"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  vehicle: string
  lastPurchase: string
  [key: string]: string  // Permite indexación con string
}

const customers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    vehicle: "Toyota Camry",
    lastPurchase: "2023-05-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "987-654-3210",
    vehicle: "Honda Civic",
    lastPurchase: "2023-06-20",
  },
  // Add more customer data as needed
]

export default function CustomersPage() {
  const [sortColumn, setSortColumn] = useState<keyof Customer>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortColumn) {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Customer Database</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search customers..."
          className="max-w-sm"
        />
        <Button>Add New Customer</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
              Name <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort("email")} className="cursor-pointer">
              Email <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort("phone")} className="cursor-pointer">
              Phone <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort("vehicle")} className="cursor-pointer">
              Vehicle <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort("lastPurchase")} className="cursor-pointer">
              Last Purchase <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.vehicle}</TableCell>
              <TableCell>{customer.lastPurchase}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Edit customer</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Delete customer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

