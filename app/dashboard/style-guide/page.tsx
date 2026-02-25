'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  StatusBadge,
  RiskBadge,
  ResearchBadge,
  PostOpDayBadge,
  NewBadge,
  CompletenessBadge,
  CountBadge,
  SurgeryTypeBadge,
  TrendingBadge
} from '@/components/ui/badge-variants'
import {
  BaseCard,
  InteractiveCard,
  ElevatedCard,
  StatCard,
  PatientCard,
  FeatureCard,
  EmptyStateCard,
  ResearchCard
} from '@/components/ui/card-variants'
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '@/lib/design-tokens'
import {
  Users,
  Activity,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Palette,
  Type,
  Layout,
  Sparkles
} from 'lucide-react'

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-telos-blue-500 rounded-xl">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: COLORS.primary }}>
                VigIA Design System
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Style Guide & Component Library
              </p>
            </div>
          </div>
          <p className="text-gray-600 max-w-3xl">
            A comprehensive design system for medical professional applications. Built on Tailwind CSS with
            accessibility, consistency, and scalability as core principles.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="colors" className="space-y-8">
          <TabsList className="grid grid-cols-6 w-full h-auto p-1 bg-gray-100">
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2">
              <Type className="h-4 w-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="gap-2">
              <Layout className="h-4 w-4" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2">
              <Layout className="h-4 w-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Badges
            </TabsTrigger>
          </TabsList>

          {/* ============================================================================ */}
          {/* COLORS TAB */}
          {/* ============================================================================ */}
          <TabsContent value="colors" className="space-y-8">
            {/* Primary Colors */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Primary Colors</CardTitle>
                <CardDescription>
                  VigIA Blue, Gold, and Purple - The foundation of our brand identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* VigIA Blue */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">VigIA Blue</h3>
                  <div className="grid grid-cols-9 gap-2">
                    {[
                      { name: '50', value: '#E6EBF2' },
                      { name: '100', value: '#B3C5DB' },
                      { name: '200', value: '#8099C4' },
                      { name: '300', value: '#4D6CAD' },
                      { name: '400', value: '#264E8D' },
                      { name: '500', value: '#0A2647' },
                      { name: '600', value: '#081E39' },
                      { name: '700', value: '#06162B' },
                      { name: '800', value: '#040E1D' },
                    ].map((color) => (
                      <div key={color.name} className="space-y-2">
                        <div
                          className="h-20 rounded-lg shadow-sm border border-gray-200"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="text-center">
                          <div className="text-xs font-semibold text-gray-700">{color.name}</div>
                          <div className="text-xs font-mono text-gray-500">{color.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VigIA Gold */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">VigIA Gold</h3>
                  <div className="grid grid-cols-9 gap-2">
                    {[
                      { name: '50', value: '#FBF8EF' },
                      { name: '100', value: '#F5ECCC' },
                      { name: '200', value: '#EFE0A9' },
                      { name: '300', value: '#E9D486' },
                      { name: '400', value: '#DFC75E' },
                      { name: '500', value: '#D4AF37' },
                      { name: '600', value: '#B89630' },
                      { name: '700', value: '#8B7124' },
                      { name: '800', value: '#5E4C18' },
                    ].map((color) => (
                      <div key={color.name} className="space-y-2">
                        <div
                          className="h-20 rounded-lg shadow-sm border border-gray-200"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="text-center">
                          <div className="text-xs font-semibold text-gray-700">{color.name}</div>
                          <div className="text-xs font-mono text-gray-500">{color.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VigIA Purple */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">VigIA Purple (Research)</h3>
                  <div className="grid grid-cols-9 gap-2">
                    {[
                      { name: '50', value: '#F3EEFB' },
                      { name: '100', value: '#DCC9F3' },
                      { name: '200', value: '#C5A4EB' },
                      { name: '300', value: '#AE7FE3' },
                      { name: '400', value: '#9760DB' },
                      { name: '500', value: '#7C3AED' },
                      { name: '600', value: '#6930CA' },
                      { name: '700', value: '#5626A7' },
                      { name: '800', value: '#431C84' },
                    ].map((color) => (
                      <div key={color.name} className="space-y-2">
                        <div
                          className="h-20 rounded-lg shadow-sm border border-gray-200"
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="text-center">
                          <div className="text-xs font-semibold text-gray-700">{color.name}</div>
                          <div className="text-xs font-mono text-gray-500">{color.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Semantic Colors */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Semantic Colors</CardTitle>
                <CardDescription>
                  Status indicators and feedback colors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { name: 'Success', value: '#10B981', bg: '#ECFDF5' },
                    { name: 'Warning', value: '#F59E0B', bg: '#FFFBEB' },
                    { name: 'Error', value: '#EF4444', bg: '#FEF2F2' },
                    { name: 'Info', value: '#3B82F6', bg: '#EFF6FF' },
                  ].map((color) => (
                    <div key={color.name} className="space-y-2">
                      <div
                        className="h-24 rounded-lg shadow-sm border-2"
                        style={{
                          backgroundColor: color.value,
                          borderColor: color.value,
                        }}
                      />
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{color.name}</div>
                        <div className="text-xs font-mono text-gray-600">{color.value}</div>
                        <div className="text-xs text-gray-500 mt-1">Light: {color.bg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Neutral Grays */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Neutral Grays</CardTitle>
                <CardDescription>
                  Text, borders, and backgrounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {[
                    { name: '50', value: '#F9FAFB' },
                    { name: '100', value: '#F3F4F6' },
                    { name: '200', value: '#E5E7EB' },
                    { name: '300', value: '#D1D5DB' },
                    { name: '400', value: '#9CA3AF' },
                    { name: '500', value: '#6B7280' },
                    { name: '600', value: '#4B5563' },
                    { name: '700', value: '#374151' },
                    { name: '800', value: '#1F2937' },
                    { name: '900', value: '#111827' },
                  ].map((color) => (
                    <div key={color.name} className="space-y-2">
                      <div
                        className="h-16 rounded-lg shadow-sm border border-gray-200"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="text-center">
                        <div className="text-xs font-semibold text-gray-700">{color.name}</div>
                        <div className="text-xs font-mono text-gray-500">{color.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================================ */}
          {/* TYPOGRAPHY TAB */}
          {/* ============================================================================ */}
          <TabsContent value="typography" className="space-y-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Type Scale</CardTitle>
                <CardDescription>
                  Font sizes, weights, and line heights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { size: '4xl', value: '3rem', class: 'text-4xl', example: 'Hero Headline' },
                  { size: '3xl', value: '2.25rem', class: 'text-3xl', example: 'Page Title' },
                  { size: '2xl', value: '1.875rem', class: 'text-2xl', example: 'Section Header' },
                  { size: 'xl', value: '1.5rem', class: 'text-xl', example: 'Card Title' },
                  { size: 'lg', value: '1.25rem', class: 'text-lg', example: 'Subheading' },
                  { size: 'base', value: '1rem', class: 'text-base', example: 'Body Text (Default)' },
                  { size: 'sm', value: '0.875rem', class: 'text-sm', example: 'Secondary Text' },
                  { size: 'xs', value: '0.75rem', class: 'text-xs', example: 'Caption & Labels' },
                ].map((type) => (
                  <div key={type.size} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-20">
                        <Badge variant="outline">{type.size}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 font-mono w-24">{type.value}</div>
                      <div className={`${type.class} font-semibold text-gray-900`}>
                        {type.example}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Font Weights</CardTitle>
                <CardDescription>
                  Weight variations for emphasis and hierarchy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { weight: 'Normal (400)', class: 'font-normal', usage: 'Body text, default weight' },
                  { weight: 'Medium (500)', class: 'font-medium', usage: 'Subtle emphasis, labels' },
                  { weight: 'Semibold (600)', class: 'font-semibold', usage: 'Section headings, buttons' },
                  { weight: 'Bold (700)', class: 'font-bold', usage: 'Strong emphasis, primary headings' },
                  { weight: 'Extrabold (800)', class: 'font-extrabold', usage: 'Hero text, impact' },
                ].map((weight) => (
                  <div key={weight.weight} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex-1">
                      <div className={`text-xl ${weight.class} text-gray-900 mb-1`}>
                        The quick brown fox jumps over the lazy dog
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{weight.weight}</span> - {weight.usage}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================================ */}
          {/* SPACING TAB */}
          {/* ============================================================================ */}
          <TabsContent value="spacing" className="space-y-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Spacing Scale</CardTitle>
                <CardDescription>
                  Based on 4px grid for consistent, predictable spacing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { token: 'space-1', value: '4px', usage: 'Tiny gaps between inline elements' },
                    { token: 'space-2', value: '8px', usage: 'Small gaps, icon margins' },
                    { token: 'space-3', value: '12px', usage: 'Compact spacing, button padding' },
                    { token: 'space-4', value: '16px', usage: 'Default spacing between elements' },
                    { token: 'space-6', value: '24px', usage: 'Card padding, standard gaps' },
                    { token: 'space-8', value: '32px', usage: 'Section spacing' },
                    { token: 'space-12', value: '48px', usage: 'Major section dividers' },
                    { token: 'space-16', value: '64px', usage: 'Large section spacing' },
                  ].map((space) => (
                    <div key={space.token} className="flex items-center gap-6 border-b border-gray-200 pb-4 last:border-0">
                      <div className="w-32">
                        <Badge variant="outline" className="font-mono">{space.token}</Badge>
                      </div>
                      <div className="w-16 text-sm text-gray-600">{space.value}</div>
                      <div
                        className="h-8 bg-telos-blue-500 rounded"
                        style={{ width: space.value }}
                      />
                      <div className="text-sm text-gray-600 flex-1">{space.usage}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Shadows</CardTitle>
                <CardDescription>
                  Depth and elevation for cards and components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { name: 'Small', shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', usage: 'Default cards' },
                    { name: 'Medium', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', usage: 'Elevated elements' },
                    { name: 'Large', shadow: '0 10px 20px -5px rgb(0 0 0 / 0.1)', usage: 'Modals, hover states' },
                    { name: 'Gold Glow', shadow: '0 0 30px rgba(212, 175, 55, 0.5)', usage: 'Premium elements' },
                    { name: 'Blue Glow', shadow: '0 0 30px rgba(10, 38, 71, 0.3)', usage: 'Primary emphasis' },
                    { name: 'Purple Glow', shadow: '0 0 30px rgba(124, 58, 237, 0.4)', usage: 'Research features' },
                  ].map((shadow) => (
                    <div key={shadow.name} className="space-y-3">
                      <div
                        className="h-24 bg-white rounded-lg flex items-center justify-center"
                        style={{ boxShadow: shadow.shadow }}
                      >
                        <span className="font-semibold text-gray-700">{shadow.name}</span>
                      </div>
                      <div className="text-sm text-gray-600 text-center">{shadow.usage}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================================ */}
          {/* COMPONENTS TAB */}
          {/* ============================================================================ */}
          <TabsContent value="components" className="space-y-8">
            {/* Buttons */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>
                  Primary, secondary, and specialized button styles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button style={{ backgroundColor: COLORS.primary }}>Primary Button</Button>
                    <Button variant="outline">Secondary Button</Button>
                    <Button style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}>Gold CTA</Button>
                    <Button variant="destructive">Danger Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <Button disabled>Disabled Button</Button>
                    <Button>
                      <Users className="mr-2 h-4 w-4" />
                      With Icon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forms */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
                <CardDescription>
                  Inputs, selects, and form controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="input-default">Default Input</Label>
                    <Input id="input-default" placeholder="Enter text..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-disabled">Disabled Input</Label>
                    <Input id="input-disabled" placeholder="Disabled" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="select-default">Select Dropdown</Label>
                    <Select>
                      <SelectTrigger id="select-default">
                        <SelectValue placeholder="Select option..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Option 1</SelectItem>
                        <SelectItem value="2">Option 2</SelectItem>
                        <SelectItem value="3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-error">Input with Error</Label>
                    <Input
                      id="input-error"
                      placeholder="Invalid input"
                      className="border-red-500 focus:ring-red-500"
                    />
                    <p className="text-xs text-red-500">This field is required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================================ */}
          {/* CARDS TAB */}
          {/* ============================================================================ */}
          <TabsContent value="cards" className="space-y-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Card Variants</CardTitle>
                <CardDescription>
                  Standardized card components for different use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <BaseCard variant="default">
                    <div className="font-semibold mb-2">Default Card</div>
                    <div className="text-sm text-gray-600">Standard card with subtle shadow</div>
                  </BaseCard>

                  <BaseCard variant="elevated">
                    <div className="font-semibold mb-2">Elevated Card</div>
                    <div className="text-sm text-gray-600">More prominent shadow</div>
                  </BaseCard>

                  <BaseCard variant="bordered">
                    <div className="font-semibold mb-2">Bordered Card</div>
                    <div className="text-sm text-gray-600">Blue border, no shadow</div>
                  </BaseCard>

                  <InteractiveCard onClick={() => alert('Clicked!')}>
                    <div className="font-semibold mb-2">Interactive Card</div>
                    <div className="text-sm text-gray-600">Click me! Hover for effect</div>
                  </InteractiveCard>

                  <BaseCard variant="success">
                    <div className="font-semibold mb-2">Success Card</div>
                    <div className="text-sm text-gray-600">Positive status or completion</div>
                  </BaseCard>

                  <BaseCard variant="warning">
                    <div className="font-semibold mb-2">Warning Card</div>
                    <div className="text-sm text-gray-600">Attention needed</div>
                  </BaseCard>

                  <BaseCard variant="error">
                    <div className="font-semibold mb-2">Error Card</div>
                    <div className="text-sm text-gray-600">Critical alert or error state</div>
                  </BaseCard>

                  <BaseCard variant="gold">
                    <div className="font-semibold mb-2">Gold Card</div>
                    <div className="text-sm text-gray-600">Premium or highlighted content</div>
                  </BaseCard>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Specialized Cards</CardTitle>
                <CardDescription>
                  Purpose-built card components
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <StatCard
                    icon={<Users className="h-5 w-5" />}
                    label="Total Patients"
                    value="248"
                    change={{ value: 12, trend: "up" }}
                  />

                  <StatCard
                    icon={<Activity className="h-5 w-5" />}
                    label="Active Cases"
                    value="42"
                    variant="success"
                  />

                  <StatCard
                    icon={<AlertCircle className="h-5 w-5" />}
                    label="Critical Alerts"
                    value="3"
                    variant="error"
                  />
                </div>

                <Separator />

                <PatientCard
                  patientName="João da Silva"
                  surgeryType="Hemorroidectomia"
                  postOpDay={5}
                  riskLevel="medium"
                  status="active"
                />

                <Separator />

                <FeatureCard
                  icon={<FlaskConical className="h-8 w-8" />}
                  title="Research Module"
                  description="Advanced statistical analysis and data visualization for clinical research studies."
                  highlighted
                />

                <Separator />

                <EmptyStateCard
                  icon={<Users className="h-12 w-12" />}
                  title="No patients found"
                  description="Start by adding your first patient to the system. You can track their post-operative recovery and manage follow-ups."
                  action={{
                    label: "Add Patient",
                    onClick: () => alert("Add patient clicked")
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================================================ */}
          {/* BADGES TAB */}
          {/* ============================================================================ */}
          <TabsContent value="badges" className="space-y-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Badge Variants</CardTitle>
                <CardDescription>
                  Semantic badges for status, risk, and categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Base Badges */}
                <div>
                  <h3 className="font-semibold mb-4">Base Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="default">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="secondary">Success</Badge>
                    <Badge variant="outline">Warning</Badge>
                    <Badge variant="destructive">Error</Badge>
                    <Badge variant="outline">Info</Badge>
                    <Badge variant="secondary">Gold</Badge>
                    <Badge variant="secondary">Purple</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="outline">Outline Primary</Badge>
                  </div>
                </div>

                <Separator />

                {/* Status Badges */}
                <div>
                  <h3 className="font-semibold mb-4">Status Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="active" />
                    <StatusBadge status="inactive" />
                    <StatusBadge status="pending" />
                    <StatusBadge status="completed" />
                    <StatusBadge status="cancelled" />
                  </div>
                </div>

                <Separator />

                {/* Risk Badges */}
                <div>
                  <h3 className="font-semibold mb-4">Risk Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <RiskBadge risk="low" />
                    <RiskBadge risk="medium" />
                    <RiskBadge risk="high" />
                    <RiskBadge risk="critical" />
                  </div>
                </div>

                <Separator />

                {/* Research & Special Badges */}
                <div>
                  <h3 className="font-semibold mb-4">Research & Special</h3>
                  <div className="flex flex-wrap gap-3">
                    <ResearchBadge groupCode="A" />
                    <ResearchBadge groupCode="B" />
                    <PostOpDayBadge day={3} />
                    <PostOpDayBadge day={15} />
                    <PostOpDayBadge day={35} />
                    <NewBadge />
                    <CompletenessBadge percentage={100} />
                    <CompletenessBadge percentage={65} />
                    <CompletenessBadge percentage={25} />
                    <CountBadge count={5} />
                    <CountBadge count={42} />
                  </div>
                </div>

                <Separator />

                {/* Surgery Type Badges */}
                <div>
                  <h3 className="font-semibold mb-4">Surgery Types</h3>
                  <div className="flex flex-wrap gap-3">
                    <SurgeryTypeBadge type="hemorroidectomia" />
                    <SurgeryTypeBadge type="fistula" />
                    <SurgeryTypeBadge type="fissura" />
                    <SurgeryTypeBadge type="pilonidal" />
                  </div>
                </div>

                <Separator />

                {/* Trending Badges */}
                <div>
                  <h3 className="font-semibold mb-4">Trending</h3>
                  <div className="flex flex-wrap gap-3">
                    <TrendingBadge trend="up" value={15} />
                    <TrendingBadge trend="down" value={8} />
                    <TrendingBadge trend="neutral" />
                  </div>
                </div>

                <Separator />

                {/* Badge Sizes */}
                <div>
                  <h3 className="font-semibold mb-4">Sizes</h3>
                  <div className="flex items-center flex-wrap gap-3">
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">Small</Badge>
                    <Badge variant="default">Medium</Badge>
                    <Badge variant="default" className="text-sm px-3 py-1">Large</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              VigIA Design System v1.0.0 &quot; Last Updated: November 11, 2025
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="/dashboard" className="text-telos-blue-500 hover:underline">Dashboard</a>
              <a href="/DESIGN_SYSTEM.md" className="text-telos-blue-500 hover:underline">Full Documentation</a>
              <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="text-telos-blue-500 hover:underline">Tailwind Docs</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
