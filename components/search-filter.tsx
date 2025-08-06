"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from 'lucide-react'

interface SearchFilterProps {
  onSearch: (query: string, semester: string, subject: string) => void
  subjects: string[]
  maxSemester: number
  initialQuery?: string
  initialSemester?: string
  initialSubject?: string
}

export function SearchFilter({ 
  onSearch, 
  subjects, 
  maxSemester, 
  initialQuery = "", 
  initialSemester = "all", 
  initialSubject = "all" 
}: SearchFilterProps) {
  const [query, setQuery] = useState(initialQuery)
  const [semester, setSemester] = useState(initialSemester)
  const [subject, setSubject] = useState(initialSubject)

  const handleSearch = () => {
    onSearch(query, semester, subject)
  }

  const handleClear = () => {
    setQuery("")
    setSemester("all")
    setSubject("all")
    onSearch("", "all", "all")
  }

  const hasFilters = query || semester !== "all" || subject !== "all"

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search notes, subjects, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {Array.from({ length: maxSemester }, (_, i) => i + 1).map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subj) => (
                <SelectItem key={subj} value={subj}>
                  {subj}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={handleSearch} size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Apply Filters
          </Button>
          {hasFilters && (
            <Button onClick={handleClear} variant="outline" size="sm">
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        {hasFilters && (
          <div className="text-sm text-gray-600">
            Active filters applied
          </div>
        )}
      </div>
    </div>
  )
}
