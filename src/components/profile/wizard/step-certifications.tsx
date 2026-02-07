'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saveCertification, deleteCertification } from '@/actions/profile'
import {
  certificationSchema,
  type CertificationFormValues,
} from '@/lib/validations/profile'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Edit, Plus } from 'lucide-react'
import type { Company, Certification, Project } from '@prisma/client'

type CompanyProfile = (Company & {
  certifications: Certification[]
  projects: Project[]
}) | null

interface StepCertificationsProps {
  initialData: CompanyProfile
}

export function StepCertifications({ initialData }: StepCertificationsProps) {
  const [certifications, setCertifications] = useState<Certification[]>(
    initialData?.certifications || []
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: '',
      issuingBody: '',
      issueDate: '',
      expiryDate: '',
    },
  })

  const handleAdd = () => {
    form.reset({
      name: '',
      issuingBody: '',
      issueDate: '',
      expiryDate: '',
    })
    setEditingId(null)
    setIsEditing(true)
  }

  const handleEdit = (cert: Certification) => {
    form.reset({
      name: cert.name,
      issuingBody: cert.issuingBody,
      issueDate: cert.issueDate.toISOString().split('T')[0],
      expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : '',
    })
    setEditingId(cert.id)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingId(null)
    form.reset()
  }

  const onSubmit = async (data: CertificationFormValues) => {
    const dataWithId = editingId ? { ...data, id: editingId } : data
    const result = await saveCertification(dataWithId)

    if (result.success) {
      setMessage({ type: 'success', text: 'Certification saved successfully' })
      setTimeout(() => setMessage(null), 3000)

      // Refresh certifications list
      // In a real app, we'd refetch from the server. For now, we'll optimistically update.
      if (editingId) {
        // Update existing
        setCertifications((prev) =>
          prev.map((cert) =>
            cert.id === editingId
              ? {
                  ...cert,
                  name: data.name,
                  issuingBody: data.issuingBody,
                  issueDate: new Date(data.issueDate),
                  expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                }
              : cert
          )
        )
      } else {
        // Add new - we need to refetch to get the ID
        // For now, create a temp ID
        const newCert: Certification = {
          id: (result.data as any)?.certificationId || crypto.randomUUID(),
          name: data.name,
          issuingBody: data.issuingBody,
          issueDate: new Date(data.issueDate),
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          companyId: initialData?.id || '',
          createdAt: new Date(),
        }
        setCertifications((prev) => [...prev, newCert])
      }

      handleCancel()
    } else {
      setMessage({
        type: 'error',
        text: result.message || 'Failed to save certification',
      })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) {
      return
    }

    const result = await deleteCertification(id)

    if (result.success) {
      setMessage({ type: 'success', text: 'Certification deleted successfully' })
      setTimeout(() => setMessage(null), 3000)
      setCertifications((prev) => prev.filter((cert) => cert.id !== id))
    } else {
      setMessage({
        type: 'error',
        text: result.message || 'Failed to delete certification',
      })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Certifications</h2>
            <p className="text-muted-foreground">
              Add relevant certifications (ISO, security clearances, industry certifications)
            </p>
            {certifications.length === 0 && (
              <p className="text-sm text-yellow-600">
                At least 1 certification required to complete this step
              </p>
            )}
          </div>
          {!isEditing && (
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          )}
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

        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Certification' : 'Add Certification'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Certification Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., ISO 9001:2015" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issuingBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Issuing Body <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., BSI" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="issueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Issue Date <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Save</Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {certifications.map((cert) => (
            <Card key={cert.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.issuingBody}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Issue: {formatDate(cert.issueDate)}</span>
                      <span>Expiry: {formatDate(cert.expiryDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(cert)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
