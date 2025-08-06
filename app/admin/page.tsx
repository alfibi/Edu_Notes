"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Send, FileText, Users, Bell, LogOut, Shield, Trash2, CheckCircle, MessageSquare, AlertCircle, Lightbulb } from 'lucide-react'
import { useRouter } from "next/navigation"
import { AppStorage, Note, Notification, Feedback, fileToBase64 } from "@/lib/storage"

export default function AdminDashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<Note[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [uploadForm, setUploadForm] = useState({
    title: "",
    subject: "",
    semester: "",
    description: "",
    tags: "",
    file: null as File | null
  })
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    targetSemester: "all"
  })
  const [uploading, setUploading] = useState(false)
  const [sendingNotification, setSendingNotification] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userType = localStorage.getItem("userType")
    
    if (userType !== "admin") {
      router.push("/")
      return
    }
    
    loadData()
  }, [router])

  const loadData = () => {
    const files = AppStorage.getNotes()
    const feedbackList = AppStorage.getFeedback()
    setUploadedFiles(files)
    setFeedback(feedbackList)
  }

  const handleLogout = () => {
    localStorage.removeItem("userType")
    router.push("/")
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadForm.title && uploadForm.subject && uploadForm.semester && uploadForm.file) {
      setUploading(true)
      
      try {
        // Convert file to base64 for storage
        const fileUrl = await fileToBase64(uploadForm.file)
        
        const newFile: Note = {
          id: Date.now().toString(),
          title: uploadForm.title,
          subject: uploadForm.subject,
          semester: uploadForm.semester,
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: uploadForm.file.type.includes('pdf') ? 'pdf' : 'doc',
          fileUrl: fileUrl,
          fileName: uploadForm.file.name,
          description: uploadForm.description || undefined,
          tags: uploadForm.tags ? uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
        }
        
        AppStorage.addNote(newFile)
        
        // Create notification for new upload
        const notification: Notification = {
          id: Date.now().toString(),
          title: "New Study Material Available",
          message: `${uploadForm.title} has been uploaded for ${uploadForm.subject} (Semester ${uploadForm.semester})`,
          date: new Date().toISOString().split('T')[0],
          isRead: false,
          targetSemester: uploadForm.semester
        }
        
        AppStorage.addNotification(notification)
        
        setUploadedFiles(prev => [newFile, ...prev])
        setUploadForm({ title: "", subject: "", semester: "", description: "", tags: "", file: null })
        
        // Reset file input
        const fileInput = document.getElementById('file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        // Show success message
        showSuccessMessage("File uploaded successfully and notification sent to students!")
        
      } catch (error) {
        console.error('Upload error:', error)
        alert("Error uploading file. Please try again.")
      } finally {
        setUploading(false)
      }
    }
  }

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault()
    if (notificationForm.title && notificationForm.message) {
      setSendingNotification(true)
      
      const notification: Notification = {
        id: Date.now().toString(),
        title: notificationForm.title,
        message: notificationForm.message,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
        targetSemester: notificationForm.targetSemester
      }
      
      AppStorage.addNotification(notification)
      
      setNotificationForm({ title: "", message: "", targetSemester: "all" })
      
      showSuccessMessage(`Notification sent to ${notificationForm.targetSemester === "all" ? "all students" : `Semester ${notificationForm.targetSemester} students`}`)
      
      setSendingNotification(false)
    }
  }

  const handleDeleteFile = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      AppStorage.deleteNote(fileId)
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
      showSuccessMessage("File deleted successfully!")
    }
  }

  const showSuccessMessage = (message: string) => {
    const successDiv = document.createElement('div')
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center'
    successDiv.innerHTML = `<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>${message}`
    document.body.appendChild(successDiv)
    
    setTimeout(() => {
      document.body.removeChild(successDiv)
    }, 4000)
  }

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />
      default:
        return <MessageSquare className="w-5 h-5 text-blue-500" />
    }
  }

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case 'bug':
        return 'Bug Report'
      case 'suggestion':
        return 'Feature Suggestion'
      default:
        return 'General Feedback'
    }
  }

  const pendingFeedback = feedback.filter(f => f.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{uploadedFiles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Notifications Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{AppStorage.getNotifications().length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingFeedback.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="notifications">Send Notifications</TabsTrigger>
            <TabsTrigger value="manage">Manage Files</TabsTrigger>
            <TabsTrigger value="feedback" className="relative">
              Feedback
              {pendingFeedback.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingFeedback.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload New File</CardTitle>
                <CardDescription>
                  Upload notes and study materials for students. Supported formats: PDF, DOC, DOCX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">File Title *</Label>
                      <Input
                        id="title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter file title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={uploadForm.subject}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter subject name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the content"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Enter tags separated by commas (e.g., algorithms, programming, java)"
                    />
                    <p className="text-xs text-gray-500">Tags help students find relevant materials more easily</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester *</Label>
                    <Select
                      value={uploadForm.semester}
                      onValueChange={(value) => setUploadForm(prev => ({ ...prev, semester: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                        <SelectItem value="5">Semester 5</SelectItem>
                        <SelectItem value="6">Semester 6</SelectItem>
                        <SelectItem value="7">Semester 7</SelectItem>
                        <SelectItem value="8">Semester 8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">File *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                      required
                    />
                    <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>
                  Send important updates to students. Notifications will appear in their dashboard immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notif-title">Notification Title *</Label>
                    <Input
                      id="notif-title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter notification title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter your message"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Audience</Label>
                    <Select
                      value={notificationForm.targetSemester}
                      onValueChange={(value) => setNotificationForm(prev => ({ ...prev, targetSemester: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                        <SelectItem value="5">Semester 5</SelectItem>
                        <SelectItem value="6">Semester 6</SelectItem>
                        <SelectItem value="7">Semester 7</SelectItem>
                        <SelectItem value="8">Semester 8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={sendingNotification}>
                    {sendingNotification ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Notification
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Manage Uploaded Files</CardTitle>
                <CardDescription>
                  View and manage all uploaded files. Students can download these materials from their dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No files uploaded</h3>
                      <p className="text-gray-600">Upload your first file to get started.</p>
                    </div>
                  ) : (
                    uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <FileText className="w-8 h-8 text-red-500" />
                          <div>
                            <h3 className="font-semibold">{file.title}</h3>
                            <p className="text-sm text-gray-600">{file.subject}</p>
                            {file.description && (
                              <p className="text-xs text-gray-500 mt-1">{file.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>Semester {file.semester}</span>
                              <span>{file.uploadDate}</span>
                              <span>{file.fileSize}</span>
                            </div>
                            {file.tags && file.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {file.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Student Feedback</CardTitle>
                <CardDescription>
                  Review feedback, bug reports, and suggestions from students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback yet</h3>
                      <p className="text-gray-600">Student feedback will appear here.</p>
                    </div>
                  ) : (
                    feedback.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getFeedbackIcon(item.type)}
                            <div>
                              <h3 className="font-semibold text-sm">{item.title}</h3>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                <span>From: {item.studentId}</span>
                                <span>•</span>
                                <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getFeedbackTypeLabel(item.type)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={item.status === 'pending' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
