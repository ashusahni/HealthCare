"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Edit, Plus, Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { medicationService } from "@/lib/services/database"
import type { Medication } from "@/types/database"
import { useAuth } from "@/contexts/auth-context"

export default function Medications() {
  const { user } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadMedications()
    }
  }, [user])

  const loadMedications = async () => {
    try {
      const data = await medicationService.getMedications()
      setMedications(data)
    } catch (error) {
      toast.error("Failed to load medications")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewMedication = (medication: Medication) => {
    setSelectedMedication(medication)
    setViewDialogOpen(true)
  }

  const handleDeleteClick = (medication: Medication) => {
    setSelectedMedication(medication)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedMedication) return

    try {
      await medicationService.deleteMedication(selectedMedication.id)
      toast.success("Medication deleted successfully")
      setDeleteDialogOpen(false)
      loadMedications()
    } catch (error) {
      toast.error("Failed to delete medication")
      console.error(error)
    }
  }

  const handleEditClick = (medication: Medication) => {
    setEditingMedication(medication)
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingMedication || !user) return

    try {
      await medicationService.updateMedication(editingMedication.id, editingMedication)
      toast.success("Medication updated successfully")
      setEditDialogOpen(false)
      loadMedications()
    } catch (error) {
      toast.error("Failed to update medication")
      console.error(error)
    }
  }

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMedication || !user) return

    try {
      await medicationService.addMedication({
        name: editingMedication.name,
        dosage: editingMedication.dosage,
        frequency: editingMedication.frequency,
        time_of_day: editingMedication.time_of_day,
        start_date: editingMedication.start_date,
        end_date: editingMedication.end_date || undefined,
        notes: editingMedication.notes || undefined,
        user_id: user.id
      })
      toast.success("Medication added successfully")
      setEditDialogOpen(false)
      loadMedications()
    } catch (error) {
      toast.error("Failed to add medication")
      console.error(error)
    }
  }

  const filteredMedications = medications.filter(medication =>
    medication.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="py-6">
              <p className="text-center">Please sign in to view and manage your medications.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Medications</h1>
          <Button onClick={() => {
            setEditingMedication({
              id: "",
              name: "",
              dosage: "",
              frequency: "",
              time_of_day: "",
              start_date: new Date().toISOString().split('T')[0],
              end_date: undefined,
              notes: undefined,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            setEditDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Medication
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Medications</CardTitle>
            <CardDescription>
              Manage and track your medications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Input
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredMedications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No medications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMedications.map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell className="font-medium">{medication.name}</TableCell>
                        <TableCell>{medication.dosage}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{medication.frequency}</span>
                            <span className="text-sm text-muted-foreground flex items-center">
                              <Clock className="mr-1 h-3 w-3" /> {medication.time_of_day}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{medication.start_date}</TableCell>
                        <TableCell>{medication.end_date || 'Ongoing'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewMedication(medication)}>
                              <Search className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(medication)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(medication)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Medication Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedMedication?.name}</DialogTitle>
            <DialogDescription>
              Medication details and information
            </DialogDescription>
          </DialogHeader>
          {selectedMedication && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-sm font-medium">Dosage:</span>
                <span className="col-span-3">{selectedMedication.dosage}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-sm font-medium">Frequency:</span>
                <span className="col-span-3">{selectedMedication.frequency}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-sm font-medium">Time:</span>
                <span className="col-span-3">{selectedMedication.time_of_day}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-sm font-medium">Start Date:</span>
                <span className="col-span-3">{selectedMedication.start_date}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-sm font-medium">End Date:</span>
                <span className="col-span-3">{selectedMedication.end_date || 'Ongoing'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-sm font-medium">Notes:</span>
                <span className="col-span-3">{selectedMedication.notes}</span>
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
              Are you sure you want to delete this medication? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Medication Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMedication?.id ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
            <DialogDescription>
              {editingMedication?.id ? 'Make changes to the medication details below' : 'Fill in the medication details below'}
            </DialogDescription>
          </DialogHeader>
          {editingMedication && (
            <form onSubmit={editingMedication.id ? handleSave : handleAddMedication} className="space-y-4 py-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingMedication.name}
                  onChange={(e) => setEditingMedication({
                    ...editingMedication,
                    name: e.target.value
                  })}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={editingMedication.dosage}
                  onChange={(e) => setEditingMedication({
                    ...editingMedication,
                    dosage: e.target.value
                  })}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={editingMedication.frequency}
                  onChange={(e) => setEditingMedication({
                    ...editingMedication,
                    frequency: e.target.value
                  })}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="time_of_day">Time of Day</Label>
                <Input
                  id="time_of_day"
                  value={editingMedication.time_of_day}
                  onChange={(e) => setEditingMedication({
                    ...editingMedication,
                    time_of_day: e.target.value
                  })}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={editingMedication.start_date}
                  onChange={(e) => setEditingMedication({
                    ...editingMedication,
                    start_date: e.target.value
                  })}
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={editingMedication.end_date || ''}
                  onChange={(e) => setEditingMedication({
                    ...editingMedication,
                    end_date: e.target.value || undefined
                  })}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={editingMedication.notes || ''}
                  onChange={(e) => setEditingMedication({
                    ...editingMedication,
                    notes: e.target.value
                  })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingMedication.id ? 'Save changes' : 'Add medication'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
