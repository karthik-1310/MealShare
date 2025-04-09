"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'

// Mock inventory data
const mockInventory = [
  { id: 1, name: 'Fresh Vegetables', quantity: '20 lbs', expiresAt: '2023-12-20', status: 'Available' },
  { id: 2, name: 'Canned Goods', quantity: '30 cans', expiresAt: '2024-06-15', status: 'Reserved' },
  { id: 3, name: 'Bread', quantity: '15 loaves', expiresAt: '2023-12-10', status: 'Available' },
  { id: 4, name: 'Fruit Baskets', quantity: '5 baskets', expiresAt: '2023-12-12', status: 'Available' },
  { id: 5, name: 'Dairy Products', quantity: '10 items', expiresAt: '2023-12-08', status: 'Expired' },
]

export default function InventoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [inventory, setInventory] = useState(mockInventory)

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(
    item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700" 
          onClick={() => router.push('/dashboard/inventory/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Food Item
        </Button>
      </div>

      <Card className="bg-gray-900/70 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Food Inventory</CardTitle>
          <CardDescription>
            Manage your available food items and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search inventory..." 
                className="pl-8 bg-gray-800 border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border border-gray-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <Button variant="ghost" className="p-0 h-4 font-medium">
                      Name <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-gray-400">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.expiresAt}</TableCell>
                      <TableCell>
                        <span className={`inline-flex h-6 items-center justify-center rounded-full px-2 text-xs ${
                          item.status === 'Available' ? 'bg-green-900/30 text-green-400' :
                          item.status === 'Reserved' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/inventory/${item.id}`)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/70 border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Inventory Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Available Items</p>
              <p className="text-xl font-bold">
                {inventory.filter(item => item.status === 'Available').length}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Reserved Items</p>
              <p className="text-xl font-bold">
                {inventory.filter(item => item.status === 'Reserved').length}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Expiring Soon</p>
              <p className="text-xl font-bold">
                {inventory.filter(item => 
                  new Date(item.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && 
                  item.status !== 'Expired'
                ).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 