import { verifySession } from '@/lib/dal'
import { getCompanyProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function ProfilePage() {
  await verifySession()
  const company = await getCompanyProfile()

  // If no company profile exists, redirect to wizard
  if (!company) {
    redirect('/dashboard/profile/wizard')
  }

  // Parse sectorSubcategories from Json
  const sectorSubcategories = company.sectorSubcategories as Record<string, string[]> | null

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your company information
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profile/wizard">Edit Profile</Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Section 1: Company Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Company Information</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/profile/wizard?step=1">Edit</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {company.name ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Company Name</div>
                  <div className="text-base">{company.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Country</div>
                    <div className="text-base">{company.country || '—'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Company Size</div>
                    <div className="text-base">{company.size || '—'}</div>
                  </div>
                </div>
                {company.website && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Website</div>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.description && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Description</div>
                    <div className="text-base">{company.description}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Not yet completed.{' '}
                <Link href="/dashboard/profile/wizard?step=1" className="text-primary hover:underline">
                  Complete this section
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Section 2: Industry Sectors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Industry Sectors</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/profile/wizard?step=2">Edit</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {company.sectors.length > 0 ? (
              <div className="space-y-4">
                {company.sectors.map((sector) => (
                  <div key={sector}>
                    <Badge className="mb-2">{sector}</Badge>
                    {sectorSubcategories?.[sector] && sectorSubcategories[sector].length > 0 && (
                      <div className="mt-2 ml-4">
                        <div className="text-sm text-muted-foreground">Sub-categories:</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {sectorSubcategories[sector].map((sub) => (
                            <Badge key={sub} variant="outline" className="text-xs">
                              {sub}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Not yet completed.{' '}
                <Link href="/dashboard/profile/wizard?step=2" className="text-primary hover:underline">
                  Complete this section
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Section 3: Capabilities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Capabilities</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/profile/wizard?step=3">Edit</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {company.capabilityDescription || company.capabilityTags.length > 0 ? (
              <div className="space-y-3">
                {company.capabilityDescription && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Description</div>
                    <div className="text-base whitespace-pre-wrap">{company.capabilityDescription}</div>
                  </div>
                )}
                {company.capabilityTags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {company.capabilityTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Not yet completed.{' '}
                <Link href="/dashboard/profile/wizard?step=3" className="text-primary hover:underline">
                  Complete this section
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Section 4: Certifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Certifications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/profile/wizard?step=4">Edit</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {company.certifications.length > 0 ? (
              <div className="space-y-4">
                {company.certifications.map((cert) => (
                  <div key={cert.id} className="border-l-2 border-primary pl-4">
                    <div className="font-medium">{cert.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Issued by {cert.issuingBody}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(cert.issueDate), 'MMM yyyy')}
                      {cert.expiryDate && (
                        <> - {format(new Date(cert.expiryDate), 'MMM yyyy')}</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Not yet completed.{' '}
                <Link href="/dashboard/profile/wizard?step=4" className="text-primary hover:underline">
                  Complete this section
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Section 5: Past Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Past Projects</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/profile/wizard?step=5">Edit</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {company.projects.length > 0 ? (
              <div className="space-y-4">
                {company.projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{project.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Client: {project.clientName}
                        </div>
                        <div className="text-sm mt-2">{project.description}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sector:</span>{' '}
                        <Badge variant="outline" className="ml-1">
                          {project.sector}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value:</span>{' '}
                        <span className="font-medium">{project.valueRange}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Year:</span>{' '}
                        <span className="font-medium">{project.yearCompleted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Not yet completed.{' '}
                <Link href="/dashboard/profile/wizard?step=5" className="text-primary hover:underline">
                  Complete this section
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
