'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatabaseTestPage() {
  const [tablesStatus, setTablesStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()
  
  const tables = [
    'user_profiles',
    'food_listings',
    'bids',
    'orders',
    'notifications'
  ]
  
  async function checkTables() {
    setLoading(true)
    setError(null)
    
    const tableResults: Record<string, boolean> = {}
    
    try {
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        tableResults[table] = !error
        
        if (error) {
          console.error(`Error checking table ${table}:`, error)
        }
      }
      
      setTablesStatus(tableResults)
    } catch (err) {
      console.error('Error checking database:', err)
      setError('Failed to check database tables')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    checkTables()
  }, [])
  
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <CardDescription>
            Checking if your Supabase database setup was successful
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <p>Checking database tables...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Table Status:</h3>
              <ul className="space-y-2">
                {tables.map(table => (
                  <li key={table} className="flex items-center">
                    <span className={`mr-2 ${tablesStatus[table] ? 'text-green-500' : 'text-red-500'}`}>
                      {tablesStatus[table] ? '✅' : '❌'}
                    </span>
                    <span className="font-mono">{table}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  {Object.values(tablesStatus).every(status => status) 
                    ? '✅ All tables are accessible. Database setup appears successful!' 
                    : '❌ Some tables are not accessible. Check your database setup.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={checkTables} 
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Recheck Tables'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 