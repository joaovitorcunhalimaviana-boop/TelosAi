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
    <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#0D7377' }}>
              <Palette className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#F0EAD6' }}>
                VigIA Design System
              </h1>
              <p className="text-lg mt-1" style={{ color: '#7A8299' }}>
                Style Guide & Component Library
              </p>
            </div>
          </div>
          <p className="max-w-3xl" style={{ color: '#7A8299' }}>
            A comprehensive design system for medical professional applications. Built on Tailwind CSS with
            accessibility, consistency, and scalability as core principles.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="colors" className="space-y-8">
          <TabsList className="grid grid-cols-6 w-full h-auto p-1" style={{ backgroundColor: '#161B27' }}>
            <TabsTrigger value="colors" className="gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <Type className="h-4 w-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <Layout className="h-4 w-4" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <Sparkles className="h-4 w-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <Layout className="h-4 w-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <CheckCircle2 className="h-4 w-4" />
              Badges
            </TabsTrigger>
          </TabsList>

          {/* COLORS TAB */}
          <TabsContent value="colors" className="space-y-8">
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Primary Colors</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>
                  VigIA Blue, Gold, and Purple - The foundation of our brand identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#D8DEEB' }}>VigIA Blue</h3>
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
                          className="h-20 rounded-lg shadow-sm"
                          style={{ backgroundColor: color.value, border: '1px solid #1E2535' }}
                        />
                        <div className="text-center">
                          <div className="text-xs font-semibold" style={{ color: '#D8DEEB' }}>{color.name}</div>
                          <div className="text-xs font-mono" style={{ color: '#7A8299' }}>{color.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#D8DEEB' }}>VigIA Gold</h3>
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
                          className="h-20 rounded-lg shadow-sm"
                          style={{ backgroundColor: color.value, border: '1px solid #1E2535' }}
                        />
                        <div className="text-center">
                          <div className="text-xs font-semibold" style={{ color: '#D8DEEB' }}>{color.name}</div>
                          <div className="text-xs font-mono" style={{ color: '#7A8299' }}>{color.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#D8DEEB' }}>VigIA Purple (Research)</h3>
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
                          className="h-20 rounded-lg shadow-sm"
                          style={{ backgroundColor: color.value, border: '1px solid #1E2535' }}
                        />
                        <div className="text-center">
                          <div className="text-xs font-semibold" style={{ color: '#D8DEEB' }}>{color.name}</div>
                          <div className="text-xs font-mono" style={{ color: '#7A8299' }}>{color.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Semantic Colors</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Status indicators and feedback colors</CardDescription>
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
                        style={{ backgroundColor: color.value, borderColor: color.value }}
                      />
                      <div className="text-center">
                        <div className="text-sm font-semibold" style={{ color: '#F0EAD6' }}>{color.name}</div>
                        <div className="text-xs font-mono" style={{ color: '#7A8299' }}>{color.value}</div>
                        <div className="text-xs mt-1" style={{ color: '#7A8299' }}>Light: {color.bg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Neutral Grays</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Text, borders, and backgrounds</CardDescription>
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
                        className="h-16 rounded-lg shadow-sm"
                        style={{ backgroundColor: color.value, border: '1px solid #1E2535' }}
                      />
                      <div className="text-center">
                        <div className="text-xs font-semibold" style={{ color: '#D8DEEB' }}>{color.name}</div>
                        <div className="text-xs font-mono" style={{ color: '#7A8299' }}>{color.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TYPOGRAPHY TAB */}
          <TabsContent value="typography" className="space-y-8">
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Type Scale</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Font sizes, weights, and line heights</CardDescription>
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
                  <div key={type.size} className="flex items-center justify-between pb-4 last:border-0" style={{ borderBottom: '1px solid #1E2535' }}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-20">
                        <Badge variant="outline" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>{type.size}</Badge>
                      </div>
                      <div className="text-sm font-mono w-24" style={{ color: '#7A8299' }}>{type.value}</div>
                      <div className={`${type.class} font-semibold`} style={{ color: '#F0EAD6' }}>
                        {type.example}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Font Weights</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Weight variations for emphasis and hierarchy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { weight: 'Normal (400)', class: 'font-normal', usage: 'Body text, default weight' },
                  { weight: 'Medium (500)', class: 'font-medium', usage: 'Subtle emphasis, labels' },
                  { weight: 'Semibold (600)', class: 'font-semibold', usage: 'Section headings, buttons' },
                  { weight: 'Bold (700)', class: 'font-bold', usage: 'Strong emphasis, primary headings' },
                  { weight: 'Extrabold (800)', class: 'font-extrabold', usage: 'Hero text, impact' },
                ].map((weight) => (
                  <div key={weight.weight} className="flex items-center justify-between pb-3 last:border-0" style={{ borderBottom: '1px solid #1E2535' }}>
                    <div className="flex-1">
                      <div className={`text-xl ${weight.class} mb-1`} style={{ color: '#F0EAD6' }}>
                        The quick brown fox jumps over the lazy dog
                      </div>
                      <div className="text-sm" style={{ color: '#7A8299' }}>
                        <span className="font-semibold" style={{ color: '#D8DEEB' }}>{weight.weight}</span> - {weight.usage}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SPACING TAB */}
          <TabsContent value="spacing" className="space-y-8">
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Spacing Scale</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Based on 4px grid for consistent, predictable spacing</CardDescription>
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
                    <div key={space.token} className="flex items-center gap-6 pb-4 last:border-0" style={{ borderBottom: '1px solid #1E2535' }}>
                      <div className="w-32">
                        <Badge variant="outline" className="font-mono" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>{space.token}</Badge>
                      </div>
                      <div className="w-16 text-sm" style={{ color: '#7A8299' }}>{space.value}</div>
                      <div
                        className="h-8 rounded"
                        style={{ width: space.value, backgroundColor: '#0D7377' }}
                      />
                      <div className="text-sm flex-1" style={{ color: '#7A8299' }}>{space.usage}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Shadows</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Depth and elevation for cards and components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { name: 'Small', shadow: '0 1px 3px 0 rgb(0 0 0 / 0.3)', usage: 'Default cards' },
                    { name: 'Medium', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', usage: 'Elevated elements' },
                    { name: 'Large', shadow: '0 10px 20px -5px rgb(0 0 0 / 0.3)', usage: 'Modals, hover states' },
                    { name: 'Teal Glow', shadow: '0 0 30px rgba(13, 115, 119, 0.5)', usage: 'Primary emphasis' },
                    { name: 'Gold Glow', shadow: '0 0 30px rgba(212, 175, 55, 0.5)', usage: 'Premium elements' },
                    { name: 'Purple Glow', shadow: '0 0 30px rgba(124, 58, 237, 0.4)', usage: 'Research features' },
                  ].map((shadow) => (
                    <div key={shadow.name} className="space-y-3">
                      <div
                        className="h-24 rounded-lg flex items-center justify-center"
                        style={{ boxShadow: shadow.shadow, backgroundColor: '#161B27' }}
                      >
                        <span className="font-semibold" style={{ color: '#D8DEEB' }}>{shadow.name}</span>
                      </div>
                      <div className="text-sm text-center" style={{ color: '#7A8299' }}>{shadow.usage}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPONENTS TAB */}
          <TabsContent value="components" className="space-y-8">
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Buttons</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Primary, secondary, and specialized button styles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>Primary Button</Button>
                    <Button variant="outline" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>Secondary Button</Button>
                    <Button style={{ backgroundColor: COLORS.accent, color: COLORS.primary }}>Gold CTA</Button>
                    <Button variant="destructive">Danger Button</Button>
                    <Button variant="ghost" style={{ color: '#D8DEEB' }}>Ghost Button</Button>
                  </div>
                  <Separator style={{ backgroundColor: '#1E2535' }} />
                  <div className="flex items-center gap-4">
                    <Button size="sm" style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>Small</Button>
                    <Button size="default" style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>Default</Button>
                    <Button size="lg" style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>Large</Button>
                  </div>
                  <Separator style={{ backgroundColor: '#1E2535' }} />
                  <div className="flex items-center gap-4">
                    <Button disabled>Disabled Button</Button>
                    <Button style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>
                      <Users className="mr-2 h-4 w-4" />
                      With Icon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Form Elements</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Inputs, selects, and form controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="input-default" style={{ color: '#D8DEEB' }}>Default Input</Label>
                    <Input id="input-default" placeholder="Enter text..." style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-disabled" style={{ color: '#D8DEEB' }}>Disabled Input</Label>
                    <Input id="input-disabled" placeholder="Disabled" disabled style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#7A8299' }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="select-default" style={{ color: '#D8DEEB' }}>Select Dropdown</Label>
                    <Select>
                      <SelectTrigger id="select-default" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                        <SelectValue placeholder="Select option..." />
                      </SelectTrigger>
                      <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                        <SelectItem value="1" style={{ color: '#D8DEEB' }}>Option 1</SelectItem>
                        <SelectItem value="2" style={{ color: '#D8DEEB' }}>Option 2</SelectItem>
                        <SelectItem value="3" style={{ color: '#D8DEEB' }}>Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="input-error" style={{ color: '#D8DEEB' }}>Input with Error</Label>
                    <Input
                      id="input-error"
                      placeholder="Invalid input"
                      className="border-red-500 focus:ring-red-500"
                      style={{ backgroundColor: '#161B27', color: '#D8DEEB' }}
                    />
                    <p className="text-xs text-red-400">This field is required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CARDS TAB */}
          <TabsContent value="cards" className="space-y-8">
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Card Variants</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Standardized card components for different use cases</CardDescription>
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

            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Specialized Cards</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Purpose-built card components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <StatCard icon={<Users className="h-5 w-5" />} label="Total Patients" value="248" change={{ value: 12, trend: "up" }} />
                  <StatCard icon={<Activity className="h-5 w-5" />} label="Active Cases" value="42" variant="success" />
                  <StatCard icon={<AlertCircle className="h-5 w-5" />} label="Critical Alerts" value="3" variant="error" />
                </div>
                <Separator style={{ backgroundColor: '#1E2535' }} />
                <PatientCard patientName="João da Silva" surgeryType="Hemorroidectomia" postOpDay={5} riskLevel="medium" status="active" />
                <Separator style={{ backgroundColor: '#1E2535' }} />
                <FeatureCard icon={<FlaskConical className="h-8 w-8" />} title="Research Module" description="Advanced statistical analysis and data visualization for clinical research studies." highlighted />
                <Separator style={{ backgroundColor: '#1E2535' }} />
                <EmptyStateCard icon={<Users className="h-12 w-12" />} title="No patients found" description="Start by adding your first patient to the system." action={{ label: "Add Patient", onClick: () => alert("Add patient clicked") }} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* BADGES TAB */}
          <TabsContent value="badges" className="space-y-8">
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle style={{ color: '#F0EAD6' }}>Badge Variants</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Semantic badges for status, risk, and categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: '#D8DEEB' }}>Base Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="default">Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Error</Badge>
                  </div>
                </div>
                <Separator style={{ backgroundColor: '#1E2535' }} />
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: '#D8DEEB' }}>Status Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="active" />
                    <StatusBadge status="inactive" />
                    <StatusBadge status="pending" />
                    <StatusBadge status="completed" />
                    <StatusBadge status="cancelled" />
                  </div>
                </div>
                <Separator style={{ backgroundColor: '#1E2535' }} />
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: '#D8DEEB' }}>Risk Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <RiskBadge risk="low" />
                    <RiskBadge risk="medium" />
                    <RiskBadge risk="high" />
                    <RiskBadge risk="critical" />
                  </div>
                </div>
                <Separator style={{ backgroundColor: '#1E2535' }} />
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: '#D8DEEB' }}>Research & Special</h3>
                  <div className="flex flex-wrap gap-3">
                    <ResearchBadge groupCode="A" />
                    <ResearchBadge groupCode="B" />
                    <PostOpDayBadge day={3} />
                    <PostOpDayBadge day={15} />
                    <NewBadge />
                    <CompletenessBadge percentage={100} />
                    <CompletenessBadge percentage={65} />
                    <CountBadge count={5} />
                  </div>
                </div>
                <Separator style={{ backgroundColor: '#1E2535' }} />
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: '#D8DEEB' }}>Surgery Types</h3>
                  <div className="flex flex-wrap gap-3">
                    <SurgeryTypeBadge type="hemorroidectomia" />
                    <SurgeryTypeBadge type="fistula" />
                    <SurgeryTypeBadge type="fissura" />
                    <SurgeryTypeBadge type="pilonidal" />
                  </div>
                </div>
                <Separator style={{ backgroundColor: '#1E2535' }} />
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: '#D8DEEB' }}>Trending</h3>
                  <div className="flex flex-wrap gap-3">
                    <TrendingBadge trend="up" value={15} />
                    <TrendingBadge trend="down" value={8} />
                    <TrendingBadge trend="neutral" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8" style={{ borderTop: '1px solid #1E2535' }}>
          <div className="text-center space-y-4">
            <p className="text-sm" style={{ color: '#7A8299' }}>
              VigIA Design System v1.0.0 &quot; Last Updated: November 11, 2025
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <a href="/dashboard" style={{ color: '#14BDAE' }} className="hover:underline">Dashboard</a>
              <a href="/DESIGN_SYSTEM.md" style={{ color: '#14BDAE' }} className="hover:underline">Full Documentation</a>
              <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" style={{ color: '#14BDAE' }} className="hover:underline">Tailwind Docs</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
