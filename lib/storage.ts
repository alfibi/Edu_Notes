export interface Note {
  id: string
  title: string
  subject: string
  semester: string
  uploadDate: string
  fileSize: string
  type: "pdf" | "doc"
  fileUrl: string
  fileName: string
  description?: string
  tags?: string[]
}

export interface Notification {
  id: string
  title: string
  message: string
  date: string
  isRead: boolean
  targetSemester: string
}

export interface Bookmark {
  id: string
  noteId: string
  studentId: string
  bookmarkedAt: string
}

export interface Feedback {
  id: string
  studentId: string
  type: 'bug' | 'suggestion' | 'general'
  title: string
  message: string
  status: 'pending' | 'reviewed' | 'resolved'
  submittedAt: string
}

export interface StudentProfile {
  studentId: string
  currentSemester: number
  name?: string
  course?: string
}

export class AppStorage {
  private static NOTES_KEY = 'edu_notes_files'
  private static NOTIFICATIONS_KEY = 'edu_notes_notifications'
  private static BOOKMARKS_KEY = 'edu_notes_bookmarks'
  private static FEEDBACK_KEY = 'edu_notes_feedback'
  private static PROFILES_KEY = 'edu_notes_profiles'

  // Notes management
  static getNotes(): Note[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.NOTES_KEY)
    return stored ? JSON.parse(stored) : this.getDefaultNotes()
  }

  static saveNotes(notes: Note[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes))
  }

  static addNote(note: Note): void {
    const notes = this.getNotes()
    notes.unshift(note)
    this.saveNotes(notes)
  }

  static deleteNote(noteId: string): void {
    const notes = this.getNotes().filter(note => note.id !== noteId)
    this.saveNotes(notes)
  }

  // Get accessible notes for a student (current and past semesters only)
  static getAccessibleNotes(currentSemester: number): Note[] {
    const allNotes = this.getNotes()
    return allNotes.filter(note => parseInt(note.semester) <= currentSemester)
  }

  // Search and filter notes
  static searchNotes(query: string, semester?: string, subject?: string, currentSemester?: number): Note[] {
    let notes = currentSemester ? this.getAccessibleNotes(currentSemester) : this.getNotes()
    
    if (query) {
      const searchTerm = query.toLowerCase()
      notes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.subject.toLowerCase().includes(searchTerm) ||
        note.description?.toLowerCase().includes(searchTerm) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }
    
    if (semester && semester !== 'all') {
      notes = notes.filter(note => note.semester === semester)
    }
    
    if (subject && subject !== 'all') {
      notes = notes.filter(note => note.subject === subject)
    }
    
    return notes
  }

  // Notifications management
  static getNotifications(): Notification[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.NOTIFICATIONS_KEY)
    return stored ? JSON.parse(stored) : this.getDefaultNotifications()
  }

  static saveNotifications(notifications: Notification[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications))
  }

  static addNotification(notification: Notification): void {
    const notifications = this.getNotifications()
    notifications.unshift(notification)
    this.saveNotifications(notifications)
  }

  static markNotificationAsRead(notificationId: string): void {
    const notifications = this.getNotifications()
    const updated = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    )
    this.saveNotifications(updated)
  }

  // Bookmarks management
  static getBookmarks(): Bookmark[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.BOOKMARKS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveBookmarks(bookmarks: Bookmark[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks))
  }

  static addBookmark(noteId: string, studentId: string): void {
    const bookmarks = this.getBookmarks()
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      noteId,
      studentId,
      bookmarkedAt: new Date().toISOString()
    }
    bookmarks.push(bookmark)
    this.saveBookmarks(bookmarks)
  }

  static removeBookmark(noteId: string, studentId: string): void {
    const bookmarks = this.getBookmarks()
    const filtered = bookmarks.filter(b => !(b.noteId === noteId && b.studentId === studentId))
    this.saveBookmarks(filtered)
  }

  static isBookmarked(noteId: string, studentId: string): boolean {
    const bookmarks = this.getBookmarks()
    return bookmarks.some(b => b.noteId === noteId && b.studentId === studentId)
  }

  static getBookmarkedNotes(studentId: string): Note[] {
    const bookmarks = this.getBookmarks().filter(b => b.studentId === studentId)
    const notes = this.getNotes()
    return bookmarks.map(bookmark => 
      notes.find(note => note.id === bookmark.noteId)
    ).filter(Boolean) as Note[]
  }

  // Feedback management
  static getFeedback(): Feedback[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.FEEDBACK_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveFeedback(feedback: Feedback[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(feedback))
  }

  static addFeedback(feedback: Omit<Feedback, 'id' | 'submittedAt' | 'status'>): void {
    const feedbackList = this.getFeedback()
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    }
    feedbackList.unshift(newFeedback)
    this.saveFeedback(feedbackList)
  }

  // Student profiles management
  static getProfiles(): StudentProfile[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.PROFILES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveProfiles(profiles: StudentProfile[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles))
  }

  static getStudentProfile(studentId: string): StudentProfile | null {
    const profiles = this.getProfiles()
    return profiles.find(p => p.studentId === studentId) || null
  }

  static updateStudentProfile(profile: StudentProfile): void {
    const profiles = this.getProfiles()
    const index = profiles.findIndex(p => p.studentId === profile.studentId)
    if (index >= 0) {
      profiles[index] = profile
    } else {
      profiles.push(profile)
    }
    this.saveProfiles(profiles)
  }

  // Get recent uploads (last 7 days)
  static getRecentNotes(days: number = 7): Note[] {
    const notes = this.getNotes()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return notes.filter(note => {
      const uploadDate = new Date(note.uploadDate)
      return uploadDate >= cutoffDate
    }).slice(0, 10) // Limit to 10 most recent
  }

  // Get unique subjects
  static getUniqueSubjects(): string[] {
    const notes = this.getNotes()
    const subjects = [...new Set(notes.map(note => note.subject))]
    return subjects.sort()
  }

  private static getDefaultNotes(): Note[] {
    const defaultNotes = [
      {
        id: "1",
        title: "Introduction to Data Structures",
        subject: "Data Structures",
        semester: "3",
        uploadDate: "2024-01-15",
        fileSize: "2.5 MB",
        type: "pdf" as const,
        fileUrl: "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooSW50cm9kdWN0aW9uIHRvIERhdGEgU3RydWN0dXJlcykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjA3IDAwMDAwIG4gCjAwMDAwMDAzMDEgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgozNzAKJSVFT0Y=",
        fileName: "intro-data-structures.pdf",
        description: "Comprehensive introduction to data structures including arrays, linked lists, and trees",
        tags: ["algorithms", "programming", "computer-science"]
      },
      {
        id: "2",
        title: "Database Normalization",
        subject: "Database Management",
        semester: "4",
        uploadDate: "2024-01-14",
        fileSize: "1.8 MB",
        type: "pdf" as const,
        fileUrl: "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0MAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooRGF0YWJhc2UgTm9ybWFsaXphdGlvbikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjA3IDAwMDAwIG4gCjAwMDAwMDAyOTcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgozNjYKJSVFT0Y=",
        fileName: "database-normalization.pdf",
        description: "Understanding database normalization forms and their applications",
        tags: ["database", "sql", "normalization"]
      },
      {
        id: "3",
        title: "Object Oriented Programming Concepts",
        subject: "OOP",
        semester: "2",
        uploadDate: "2024-01-13",
        fileSize: "3.2 MB",
        type: "pdf" as const,
        fileUrl: "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0Mgo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooT2JqZWN0IE9yaWVudGVkIFByb2dyYW1taW5nKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDcgMDAwMDAgbiAKMDAwMDAwMDI5OSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjM2OAolJUVPRg==",
        fileName: "oop-concepts.pdf",
        description: "Fundamental concepts of object-oriented programming including inheritance and polymorphism",
        tags: ["oop", "programming", "java", "concepts"]
      },
      {
        id: "4",
        title: "Advanced Algorithms",
        subject: "Algorithms",
        semester: "5",
        uploadDate: "2024-01-12",
        fileSize: "4.1 MB",
        type: "pdf" as const,
        fileUrl: "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCAzNgo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooQWR2YW5jZWQgQWxnb3JpdGhtcykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjA3IDAwMDAwIG4gCjAwMDAwMDAyOTMgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgozNjIKJSVFT0Y=",
        fileName: "advanced-algorithms.pdf",
        description: "Complex algorithmic concepts including dynamic programming and graph algorithms",
        tags: ["algorithms", "dynamic-programming", "graphs", "advanced"]
      }
    ]
    this.saveNotes(defaultNotes)
    return defaultNotes
  }

  private static getDefaultNotifications(): Notification[] {
    const defaultNotifications = [
      {
        id: "1",
        title: "Welcome to EduNotes",
        message: "Your digital learning companion is ready! Access all your study materials in one place.",
        date: new Date().toISOString().split('T')[0],
        isRead: false,
        targetSemester: "all"
      }
    ]
    this.saveNotifications(defaultNotifications)
    return defaultNotifications
  }
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

export const downloadFile = (fileUrl: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
