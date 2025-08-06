"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from 'lucide-react'
import { AppStorage, StudentProfile } from "@/lib/storage"

interface SemesterSetupProps {
  studentId: string
  onComplete: (profile: StudentProfile) => void
}

export function SemesterSetup({ studentId, onComplete }: SemesterSetupProps) {
  const [form, setForm] = useState({
    name: '',
    course: '',
    currentSemester: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.currentSemester) return

    const profile: StudentProfile = {
      studentId,
      name: form.name || undefined,
      course: form.course || undefined,
      currentSemester: parseInt(form.currentSemester)
    }

    AppStorage.updateStudentProfile(profile)
    onComplete(profile)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Help us personalize your experience by setting up your academic details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name (Optional)</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course">Course (Optional)</Label>
              <Input
                id="course"
                value={form.course}
                onChange={(e) => setForm(prev => ({ ...prev, course: e.target.value }))}
                placeholder="e.g., Computer Science, Engineering"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="semester">Current Semester *</Label>
              <Select value={form.currentSemester} onValueChange={(value) => setForm(prev => ({ ...prev, currentSemester: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your current semester" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                You'll only see materials from your current and past semesters
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={!form.currentSemester}>
              Continue to Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
