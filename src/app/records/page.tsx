"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Eye, FileText, FilePlus, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Attachment {
  name: string;
}

interface MedicalRecord {
  id: number;
  title: string;
  type: string;
  date: string;
  doctor?: string;
  facility?: string;
  notes?: string;
  attachments: string[];
  category: string;
}

// Sample record data
const records: MedicalRecord[] = [
  {
    id: 1,
    title: "Annual Physical",
    type: "Doctor Visit",
    date: "2023-03-10",
    doctor: "Dr. Johnson",
    facility: "HealthFirst Medical Center",
    notes: "Blood pressure: 120/80, Heart rate: 72bpm, Cholesterol levels normal. Recommended annual flu shot.",
    attachments: ["physical_results.pdf"],
    category: "checkup"
  },
  {
    id: 2,
    title: "Blood Work",
    type: "Lab Results",
    date: "2023-02-15",
    facility: "Quest Diagnostics",
    doctor: "Dr. Smith (Ordered)",
    notes: "Complete blood count and metabolic panel. All results within normal range.",
    attachments: ["blood_work_results.pdf"],
    category: "test"
  },
  {
    id: 3,
    title: "Flu Shot",
    type: "Vaccination",
    date: "2023-01-05",
    facility: "Walgreens",
    notes: "Annual flu vaccination. No adverse reactions.",
    attachments: [],
    category: "immunization"
  },
  {
    id: 4,
    title: "Dental Cleaning",
    type: "Dental Visit",
    date: "2023-02-22",
    doctor: "Dr. Nguyen",
    facility: "Bright Smile Dental",
    notes: "Regular cleaning and check-up. No cavities found.",
    attachments: ["dental_xrays.pdf"],
    category: "dental"
  },
  {
    id: 5,
    title: "Eye Examination",
    type: "Specialist Visit",
    date: "2023-03-05",
    doctor: "Dr. Williams",
    facility: "Clear Vision Eye Care",
    notes: "Vision test and eye examination. Prescription updated for reading glasses.",
    attachments: ["vision_prescription.pdf"],
    category: "specialist"
  },
]

// Record categories for filtering
const categories = [
  { value: "all", label: "All Records" },
  { value: "checkup", label: "Check-ups" },
  { value: "test", label: "Tests & Lab Results" },
  { value: "immunization", label: "Immunizations" },
  { value: "specialist", label: "Specialist Visits" },
  { value: "dental", label: "Dental" },
]

export default function Records() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Filter records by search term, tab, and category
  const filteredRecords = records
    .filter(record =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(record => {
      if (categoryFilter === "all") return true
      return record.category === categoryFilter
    })
    .filter(record => {
      if (activeTab === "all") return true
      if (activeTab === "recent") {
        // Filter for records in the last 30 days (simplified for demo)
        return ["2023-03-10", "2023-03-05"].includes(record.date)
      }
      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    // In a real app, this would call an API to delete the record
    if (selectedRecord) {
      toast.success(`${selectedRecord.title} has been deleted`)
    }
    setDeleteDialogOpen(false)
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
            <p className="text-muted-foreground">
              Store and access your personal health information.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/records/add">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Record
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Medical Records</CardTitle>
            <CardDescription>View and manage your health records and documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search records..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category Filter" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="w-full md:w-auto grid grid-cols-2 h-auto">
                <TabsTrigger value="all" className="py-2">All Records</TabsTrigger>
                <TabsTrigger value="recent" className="py-2">Recent</TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Records Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ?
                    "No records match your search criteria." :
                    "You haven't added any medical records yet."}
                </p>
                <Link href="/records/add">
                  <Button>
                    <FilePlus className="mr-2 h-4 w-4" /> Add Your First Record
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{record.title}</h3>
                        <p className="text-sm text-muted-foreground">{record.type}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm flex items-center">
                            <Calendar className="mr-1 h-3 w-3" /> {record.date}
                          </span>
                          {record.doctor && (
                            <span className="text-sm">{record.doctor}</span>
                          )}
                          {record.facility && (
                            <span className="text-sm">{record.facility}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <Button size="sm" variant="outline" onClick={() => handleViewRecord(record)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteClick(record)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Record Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.title}</DialogTitle>
            <DialogDescription>
              {selectedRecord?.type} - {selectedRecord?.date}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="text-sm font-medium">Doctor:</span>
                <span className="col-span-2">{selectedRecord.doctor || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="text-sm font-medium">Facility:</span>
                <span className="col-span-2">{selectedRecord.facility || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="text-sm font-medium">Date:</span>
                <span className="col-span-2">{selectedRecord.date}</span>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="text-sm font-medium">Notes:</span>
                <div className="col-span-2">
                  <p className="text-sm">{selectedRecord.notes || 'No notes available'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="text-sm font-medium">Attachments:</span>
                <div className="col-span-2">
                  {selectedRecord.attachments && selectedRecord.attachments.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedRecord.attachments.map((attachment: string, index: number) => (
                        <li key={index} className="text-sm">
                          <a href="#" className="text-blue-600 hover:underline">{attachment}</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No attachments</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this medical record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
