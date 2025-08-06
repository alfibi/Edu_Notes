"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Shield, Sparkles, BookOpen, Users, Trophy } from 'lucide-react'
import { useRouter } from "next/navigation"

const inspirationalQuotes = [
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Anonymous"
  }
]

export default function LoginPage() {
  const [studentId, setStudentId] = useState("")
  const [adminCode, setAdminCode] = useState("")
  const [currentQuote, setCurrentQuote] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (studentId.trim()) {
      setIsLoading(true)
      // Simulate loading for smooth animation
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem("userType", "student")
      localStorage.setItem("studentId", studentId)
      router.push("/dashboard")
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (adminCode === "admin123") {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem("userType", "admin")
      router.push("/admin")
    } else {
      // Shake animation for invalid code
      const form = e.target as HTMLFormElement
      form.classList.add("animate-shake")
      setTimeout(() => form.classList.remove("animate-shake"), 500)
      alert("Invalid admin code")
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-32 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl animate-float-slow"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30 shadow-2xl">
              <GraduationCap className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              EduNotes
            </h1>
            <p className="text-white/80 text-lg font-light">
              Your Digital Learning Companion
            </p>
          </div>

          {/* Login Card */}
          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl animate-fade-in-up animation-delay-200">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-yellow-300 shadow-xl">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-spin-slow" />
                Welcome Back
                <Sparkles className="w-6 h-6 text-yellow-300 animate-spin-slow" />
              </CardTitle>
              <CardDescription className="text-white/70 text-base">
                Access your study materials anytime, anywhere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border-white/20">
                  <TabsTrigger 
                    value="student" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 transition-all duration-300 hover:bg-white/10"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 transition-all duration-300 hover:bg-white/10"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="student" className="space-y-6 mt-6">
                  <form onSubmit={handleStudentLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-white font-medium">
                        Student ID
                      </Label>
                      <div className="relative">
                        <Input
                          id="studentId"
                          type="text"
                          placeholder="Enter your student ID"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          onFocus={() => setFocusedField('studentId')}
                          onBlur={() => setFocusedField(null)}
                          className={`bg-white/10 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 ${
                            focusedField === 'studentId' 
                              ? 'border-white/60 bg-white/20 shadow-lg scale-105' 
                              : 'hover:border-white/40 hover:bg-white/15'
                          }`}
                          required
                        />
                        <BookOpen className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                          focusedField === 'studentId' ? 'text-white' : 'text-white/40'
                        }`} />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-5 h-5 mr-2" />
                          Login as Student
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="admin" className="space-y-6 mt-6">
                  <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="adminCode" className="text-white font-medium">
                        Admin Code
                      </Label>
                      <div className="relative">
                        <Input
                          id="adminCode"
                          type="password"
                          placeholder="Enter admin code"
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          onFocus={() => setFocusedField('adminCode')}
                          onBlur={() => setFocusedField(null)}
                          className={`bg-white/10 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm transition-all duration-300 ${
                            focusedField === 'adminCode' 
                              ? 'border-white/60 bg-white/20 shadow-lg scale-105' 
                              : 'hover:border-white/40 hover:bg-white/15'
                          }`}
                          required
                        />
                        <Shield className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                          focusedField === 'adminCode' ? 'text-white' : 'text-white/40'
                        }`} />
                      </div>
                      <p className="text-white/60 text-sm bg-white/10 backdrop-blur-sm rounded px-3 py-2 border border-white/20">
                        💡 Demo code: <span className="font-mono font-semibold">admin123</span>
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          Login as Admin
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Inspirational Quote */}
          <div className="mt-8 text-center animate-fade-in-up animation-delay-400">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-yellow-300 mr-2" />
                <span className="text-white/80 font-medium">Daily Inspiration</span>
                <Trophy className="w-6 h-6 text-yellow-300 ml-2" />
              </div>
              <blockquote 
                key={currentQuote}
                className="text-white/90 text-lg font-light italic leading-relaxed animate-fade-in"
              >
                "{inspirationalQuotes[currentQuote].text}"
              </blockquote>
              <cite className="text-white/70 text-sm font-medium mt-3 block">
                — {inspirationalQuotes[currentQuote].author}
              </cite>
              
              {/* Quote indicators */}
              <div className="flex justify-center mt-4 space-x-2">
                {inspirationalQuotes.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentQuote ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
