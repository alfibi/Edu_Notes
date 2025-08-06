"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Download, FileText, LogOut, User, BookOpen, RefreshCw, Bookmark, BookmarkCheck, Clock, TrendingUp } from 'lucide-react'
import { useRouter } from "next/navigation"
import { AppStorage, Note, Notification, StudentProfile, downloadFile } from "@/lib/storage"
import { SearchFilter } from "@/components/search-filter"
import { FeedbackModal } from "@/components/feedback-modal"
import { SemesterSetup } from "@/components/semester-setup"

export default function StudentDashboard() {
  const [studentId, setStudentId] = useState("")
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [bookmarkedNotes, setBookmarkedNotes] = useState<Note[]>([])
  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const router = useRouter()

  const loadData = () => {
    if (!profile) return
    
    setLoading(true)
    const accessibleNotes = AppStorage.getAccessibleNotes(profile.currentSemester)
    const storedNotifications = AppStorage.getNotifications()
    const bookmarks = AppStorage.getBookmarkedNotes(studentId)
    const recent = AppStorage.getRecentNotes().filter(note => 
      parseInt(note.semester) <= profile.currentSemester
    )
    
    setNotes(accessibleNotes)
    setFilteredNotes(accessibleNotes)
    setNotifications(storedNotifications)
    setBookmarkedNotes(bookmarks)
    setRecentNotes(recent)
    setLoading(false)
  }

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    const storedStudentId = localStorage.getItem("studentId")
    
    if (userType !== "student" || !storedStudentId) {
      router.push("/")
      return
    }
    
    setStudentId(storedStudentId)
    
    // Check if profile exists
    const existingProfile = AppStorage.getStudentProfile(storedStudentId)
    if (existingProfile) {
      setProfile(existingProfile)
    }
  }, [router])

  useEffect(() => {
    if (profile) {
      loadData()
      // Set up periodic refresh for notifications
      const interval = setInterval(loadData, 10000) // Refresh every 10 seconds
      return () => clearInterval(interval)
    }
  }, [profile])

  const handleProfileComplete = (newProfile: StudentProfile) => {
    setProfile(newProfile)
  }

  const handleLogout = () => {
    localStorage.removeItem("userType")
    localStorage.removeItem("studentId")
    router.push("/")
  }

  const handleDownload = (note: Note) => {
    try {
      downloadFile(note.fileUrl, note.fileName)
      
      // Show success message
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
      successDiv.textContent = `Downloading ${note.title}...`
      document.body.appendChild(successDiv)
      
      setTimeout(() => {
        document.body.removeChild(successDiv)
      }, 3000)
    } catch (error) {
      alert('Error downloading file. Please try again.')
    }
  }

  const handleBookmark = (noteId: string) => {
    const isCurrentlyBookmarked = AppStorage.isBookmarked(noteId, studentId)
    
    if (isCurrentlyBookmarked) {
      AppStorage.removeBookmark(noteId, studentId)
    } else {
      AppStorage.addBookmark(noteId, studentId)
    }
    
    // Refresh bookmarked notes
    const updatedBookmarks = AppStorage.getBookmarkedNotes(studentId)
    setBookmarkedNotes(updatedBookmarks)
  }

  const handleSearch = (query: string, semester: string, subject: string) => {
    if (!profile) return
    
    setSearchQuery(query)
    setSelectedSemester(semester)
    setSelectedSubject(subject)
    
    const results = AppStorage.searchNotes(query, semester, subject, profile.currentSemester)
    setFilteredNotes(results)
  }

  const markAsRead = (notificationId: string) => {
    AppStorage.markNotificationAsRead(notificationId)
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    )
  }

  const groupedNotes = filteredNotes.reduce((acc, note) => {
    if (!acc[note.semester]) {
      acc[note.semester] = []
    }
    acc[note.semester].push(note)
    return acc
  }, {} as Record<string, Note[]>)

  const unreadCount = notifications.filter(n => !n.isRead).length
  const subjects = AppStorage.getUniqueSubjects()

  // Show profile setup if no profile exists
  if (!profile) {
    return <SemesterSetup studentId={studentId} onComplete={handleProfileComplete} />
  }

  const renderNoteCard = (note: Note, showSemester: boolean = true) => {
    const isBookmarked = AppStorage.isBookmarked(note.id, studentId)
    const isFutureNote = parseInt(note.semester) > profile.currentSemester
    
    return (
      <Card key={note.id} className={`hover:shadow-md transition-shadow ${isFutureNote ? 'opacity-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <FileText className="w-8 h-8 text-red-500" />
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{note.type.toUpperCase()}</Badge>
              {showSemester && (
                <Badge variant="outline">Sem {note.semester}</Badge>
              )}
            </div>
          </div>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2">
            {note.title}
          </h3>
          <p className="text-xs text-gray-600 mb-2">{note.subject}</p>
          {note.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{note.description}</p>
          )}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
            <span>{note.uploadDate}</span>
            <span>{note.fileSize}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleDownload(note)}
              disabled={isFutureNote}
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBookmark(note.id)}
              disabled={isFutureNote}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
          {isFutureNote && (
            <p className="text-xs text-orange-600 mt-2 text-center">
              Available in Semester {note.semester}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">EduNotes</h1>
                {profile.name && (
                  <p className="text-xs text-gray-600">Welcome, {profile.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <FeedbackModal studentId={studentId} />
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-1" />
                <div>
                  <div>{studentId}</div>
                  <div className="text-xs">Semester {profile.currentSemester}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="notes">All Notes</TabsTrigger>
            <TabsTrigger value="bookmarks">
              Bookmarks ({bookmarkedNotes.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Available Notes</p>
                      <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Bookmark className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Bookmarked</p>
                      <p className="text-2xl font-bold text-gray-900">{bookmarkedNotes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                      <p className="text-2xl font-bold text-gray-900">{recentNotes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Current Semester</p>
                      <p className="text-2xl font-bold text-gray-900">{profile.currentSemester}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Uploads */}
            {recentNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                    Recent Uploads
                  </CardTitle>
                  <CardDescription>
                    Latest study materials uploaded in the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recentNotes.slice(0, 6).map((note) => renderNoteCard(note))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bookmarked Notes */}
            {bookmarkedNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bookmark className="w-5 h-5 mr-2 text-green-600" />
                    Your Bookmarks
                  </CardTitle>
                  <CardDescription>
                    Quick access to your favorite study materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bookmarkedNotes.slice(0, 6).map((note) => renderNoteCard(note))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <SearchFilter
              onSearch={handleSearch}
              subjects={subjects}
              maxSemester={profile.currentSemester}
              initialQuery={searchQuery}
              initialSemester={selectedSemester}
              initialSubject={selectedSubject}
            />

            {Object.keys(groupedNotes).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedSemester !== "all" || selectedSubject !== "all" 
                      ? "Try adjusting your search filters." 
                      : "Check back later for new study materials."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {Object.entries(groupedNotes)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([semester, semesterNotes]) => (
                  <Card key={semester}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                          Semester {semester}
                        </div>
                        <Badge variant="outline">
                          {semesterNotes.length} notes
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {semesterNotes.map((note) => renderNoteCard(note, false))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            {bookmarkedNotes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
                  <p className="text-gray-600">
                    Bookmark your favorite study materials for quick access.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookmarkedNotes.map((note) => renderNoteCard(note))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-blue-50 border-blue-200" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Bell className={`w-5 h-5 mt-0.5 ${
                          !notification.isRead ? "text-blue-600" : "text-gray-400"
                        }`} />
                        <div>
                          <h3 className="font-semibold text-sm mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{notification.date}</span>
                            {notification.targetSemester !== "all" && (
                              <Badge variant="outline" className="text-xs">
                                Semester {notification.targetSemester}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
