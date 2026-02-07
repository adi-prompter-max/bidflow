'use client'

import { useState } from 'react'
import { saveProject, deleteProject } from '@/actions/profile'
import type { ProjectFormValues } from '@/lib/validations/profile'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProjectDialog } from '@/components/profile/project-dialog'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { Company, Certification, Project } from '@prisma/client'

type CompanyProfile = (Company & {
  certifications: Certification[]
  projects: Project[]
}) | null

interface StepProjectsProps {
  initialData: CompanyProfile
}

export function StepProjects({ initialData }: StepProjectsProps) {
  const [projects, setProjects] = useState<Project[]>(initialData?.projects || [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<
    (ProjectFormValues & { id?: string }) | null
  >(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAdd = () => {
    setEditingProject(null)
    setDialogOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject({
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      description: project.description,
      sector: project.sector,
      valueRange: project.valueRange,
      yearCompleted: project.yearCompleted,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    const result = await deleteProject(id)

    if (result.success) {
      setMessage({ type: 'success', text: 'Project deleted successfully' })
      setTimeout(() => setMessage(null), 3000)
      setProjects((prev) => prev.filter((proj) => proj.id !== id))
    } else {
      setMessage({
        type: 'error',
        text: result.message || 'Failed to delete project',
      })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleSave = async (data: ProjectFormValues & { id?: string }) => {
    const result = await saveProject(data)

    if (result.success) {
      setMessage({ type: 'success', text: 'Project saved successfully' })
      setTimeout(() => setMessage(null), 3000)

      // Update local state
      if (data.id) {
        // Update existing
        setProjects((prev) =>
          prev.map((proj) =>
            proj.id === data.id
              ? {
                  ...proj,
                  name: data.name,
                  clientName: data.clientName,
                  description: data.description,
                  sector: data.sector,
                  valueRange: data.valueRange,
                  yearCompleted: data.yearCompleted,
                }
              : proj
          )
        )
      } else {
        // Add new
        const newProject: Project = {
          id: (result.data as any)?.projectId || crypto.randomUUID(),
          name: data.name,
          clientName: data.clientName,
          description: data.description,
          sector: data.sector,
          valueRange: data.valueRange,
          yearCompleted: data.yearCompleted,
          companyId: initialData?.id || '',
          createdAt: new Date(),
        }
        setProjects((prev) => [...prev, newProject])
      }
    } else {
      setMessage({
        type: 'error',
        text: result.message || 'Failed to save project',
      })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Past Projects</h2>
            <p className="text-muted-foreground">
              Add relevant past projects to demonstrate your experience
            </p>
            {projects.length === 0 && (
              <p className="text-sm text-yellow-600">
                At least 1 project required to complete this step
              </p>
            )}
          </div>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No projects added yet. Add at least one project to complete your profile.
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Value Range</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>{project.sector}</TableCell>
                    <TableCell>{project.valueRange}</TableCell>
                    <TableCell>{project.yearCompleted}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <ProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          project={editingProject}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
