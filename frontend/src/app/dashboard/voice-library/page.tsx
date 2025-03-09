"use client"

import { useState, useEffect, useRef } from "react"
import {
  Mic,
  Play,
  Pause,
  Trash2,
  Plus,
  Check,
  RefreshCw,
  Home,
  Users,
  Phone,
  Settings,
  Search,
  Bell,
  Volume2,
  Edit,
  Info,
} from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Voice {
  id: string
  name: string
  created_at: string
  sample_url?: string
  is_default?: boolean
  status: "ready" | "processing" | "failed"
}

export default function VoiceManagement() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newVoiceName, setNewVoiceName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("my-voices")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    setIsLoading(true)
    try {
      // Mock API call - replace with actual endpoint
      // const response = await fetch("http://localhost:5500/api/get-voices")
      // const voicesData = await response.json()

      // Mock data for demonstration
      const voicesData: Voice[] = [
        {
          id: "v1",
          name: "My Voice",
          created_at: "2023-05-15T10:30:00Z",
          sample_url: "/sample-voice.mp3",
          is_default: true,
          status: "ready",
        },
        {
          id: "v2",
          name: "Professional Voice",
          created_at: "2023-06-20T14:45:00Z",
          sample_url: "/sample-voice.mp3",
          status: "ready",
        },
        {
          id: "v3",
          name: "Casual Voice",
          created_at: "2023-07-05T09:15:00Z",
          sample_url: "/sample-voice.mp3",
          status: "ready",
        },
        {
          id: "v4",
          name: "New Voice Clone",
          created_at: "2023-08-10T16:20:00Z",
          status: "processing",
        },
      ]

      setVoices(voicesData)
    } catch (error) {
      console.error("Error fetching voices:", error)
      toast.error("Failed to fetch voices")
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)

        // Stop all tracks on the stream to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      toast.success("Recording started")
    } catch (error) {
      console.error("Error starting recording:", error)
      toast.error("Failed to access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }

      toast.success("Recording completed")
    }
  }

  const handleCreateVoice = async () => {
    if (!audioBlob || !newVoiceName.trim()) {
      toast.error("Please provide a name and record a voice sample")
      return
    }

    setIsUploading(true)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 200)

      // Mock API call - replace with actual endpoint
      // const formData = new FormData()
      // formData.append('name', newVoiceName)
      // formData.append('audio', audioBlob)

      // const response = await fetch("http://localhost:5500/api/clone-voice", {
      //   method: "POST",
      //   body: formData
      // })

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Add the new voice to the list (with processing status)
      const newVoice: Voice = {
        id: `v${Date.now()}`,
        name: newVoiceName,
        created_at: new Date().toISOString(),
        status: "processing",
      }

      setVoices((prev) => [newVoice, ...prev])

      // Reset form
      setNewVoiceName("")
      setAudioBlob(null)
      setIsCreateDialogOpen(false)

      toast.success("Voice clone initiated. Processing may take a few minutes.")

      // In a real app, you might poll for status updates or use websockets
      // to update the voice status when processing completes
    } catch (error) {
      console.error("Error creating voice:", error)
      toast.error("Failed to create voice clone")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteVoice = async (id: string) => {
    try {
      // Mock API call - replace with actual endpoint
      // await fetch(`http://localhost:5500/api/delete-voice/${id}`, {
      //   method: "DELETE"
      // })

      // Remove the voice from the list
      setVoices((prev) => prev.filter((voice) => voice.id !== id))

      toast.success("Voice deleted successfully")
    } catch (error) {
      console.error("Error deleting voice:", error)
      toast.error("Failed to delete voice")
    }
  }

  const handleSetDefaultVoice = async (id: string) => {
    try {
      // Mock API call - replace with actual endpoint
      // await fetch(`http://localhost:5500/api/set-default-voice/${id}`, {
      //   method: "PUT"
      // })

      // Update the default voice in the list
      setVoices((prev) =>
        prev.map((voice) => ({
          ...voice,
          is_default: voice.id === id,
        })),
      )

      toast.success("Default voice updated")
    } catch (error) {
      console.error("Error setting default voice:", error)
      toast.error("Failed to update default voice")
    }
  }

  const playVoiceSample = (voice: Voice) => {
    if (!voice.sample_url) return

    if (playingVoiceId === voice.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setPlayingVoiceId(null)
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause()
      }

      audioRef.current = new Audio(voice.sample_url)
      audioRef.current.onended = () => setPlayingVoiceId(null)
      audioRef.current.play()
      setPlayingVoiceId(voice.id)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredVoices = voices.filter((voice) => voice.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Phone className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VoiceConnect</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/contacts">
                      <Users className="h-4 w-4" />
                      <span>Contacts</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive>
                    <a href="/voices">
                      <Volume2 className="h-4 w-4" />
                      <span>Voice Library</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span>User Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Voice Library</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search voices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Voice Management</h2>
              <p className="text-muted-foreground">Create and manage your voice clones for calls</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Voice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Voice Clone</DialogTitle>
                  <DialogDescription>Record a sample of your voice to create a new voice clone.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="voice-name">Voice Name</Label>
                    <Input
                      id="voice-name"
                      placeholder="My Professional Voice"
                      value={newVoiceName}
                      onChange={(e) => setNewVoiceName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Voice Sample</Label>
                    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6 text-center">
                      {!audioBlob ? (
                        <>
                          <div className="rounded-full bg-primary/10 p-4">
                            <Mic className={`h-8 w-8 ${isRecording ? "text-red-500 animate-pulse" : "text-primary"}`} />
                          </div>

                          {isRecording ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="text-lg font-medium">{formatRecordingTime(recordingTime)}</div>
                              <p className="text-sm text-muted-foreground">Recording in progress...</p>
                              <Button variant="destructive" className="mt-2" onClick={stopRecording}>
                                Stop Recording
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-sm text-muted-foreground">
                                Click to record a sample of your voice (at least 30 seconds recommended)
                              </p>
                              <Button variant="outline" className="mt-2" onClick={startRecording}>
                                Start Recording
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="rounded-full bg-green-100 p-4">
                            <Check className="h-8 w-8 text-green-600" />
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-lg font-medium">Recording Complete</div>
                            <p className="text-sm text-muted-foreground">
                              {formatRecordingTime(recordingTime)} audio sample recorded
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setAudioBlob(null)}>
                                Record Again
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {isUploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Uploading and processing...</span>
                      <span className="text-sm font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateVoice} disabled={!audioBlob || !newVoiceName.trim() || isUploading}>
                    {isUploading ? "Processing..." : "Create Voice Clone"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="my-voices" className="mb-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="my-voices">My Voice Clones</TabsTrigger>
              <TabsTrigger value="voice-templates">Voice Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="my-voices">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="h-24 bg-muted/50" />
                      <CardContent className="p-4">
                        <div className="h-4 w-3/4 rounded bg-muted/50" />
                        <div className="mt-2 h-4 w-1/2 rounded bg-muted/50" />
                      </CardContent>
                      <CardFooter className="h-12 bg-muted/50" />
                    </Card>
                  ))}
                </div>
              ) : filteredVoices.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredVoices.map((voice) => (
                    <Card key={voice.id} className="overflow-hidden transition-all hover:shadow-md">
                      <CardHeader className="bg-primary/5 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                              <Volume2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{voice.name}</CardTitle>
                                {voice.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">Created {formatDate(voice.created_at)}</p>
                            </div>
                          </div>

                          {voice.status === "processing" ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-700">
                              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                              Processing
                            </Badge>
                          ) : voice.status === "failed" ? (
                            <Badge variant="outline" className="bg-red-100 text-red-700">
                              Failed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              Ready
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        {voice.status === "ready" ? (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">Voice sample available</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => playVoiceSample(voice)}
                              disabled={!voice.sample_url}
                            >
                              {playingVoiceId === voice.id ? (
                                <>
                                  <Pause className="h-4 w-4" />
                                  Stop
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4" />
                                  Preview
                                </>
                              )}
                            </Button>
                          </div>
                        ) : voice.status === "processing" ? (
                          <div className="text-sm text-muted-foreground">
                            Your voice is being processed. This may take a few minutes.
                          </div>
                        ) : (
                          <div className="text-sm text-red-500">
                            Processing failed. Please try creating a new voice clone.
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="flex justify-between gap-2 border-t bg-muted/10 p-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                disabled={voice.status !== "ready" || voice.is_default}
                                onClick={() => handleSetDefaultVoice(voice.id)}
                              >
                                {voice.is_default ? "Default" : "Set Default"}
                              </Button>
                            </TooltipTrigger>
                            {voice.is_default && (
                              <TooltipContent>
                                <p>This is your default voice for calls</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>

                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1"
                          disabled={voice.status !== "ready"}
                        >
                          <Edit className="h-3 w-3" /> Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleDeleteVoice(voice.id)}
                          disabled={voice.status === "processing"}
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                  <Card
                    className="flex h-full cursor-pointer flex-col items-center justify-center border-dashed hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Plus className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Create New Voice</h3>
                        <p className="text-sm text-muted-foreground">Clone your voice for calls</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <Volume2 className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No voice clones found</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {searchQuery ? `No voices matching "${searchQuery}"` : "You haven't created any voice clones yet"}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>Create Your First Voice Clone</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="voice-templates">
              <div className="rounded-lg border p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <Info className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Voice Templates Coming Soon</h3>
                  <p className="mb-4 max-w-md text-sm text-muted-foreground">
                    We're working on a library of pre-made voice templates that you can use for your calls. Check back
                    soon for updates!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 rounded-lg border bg-muted/20 p-6">
            <h3 className="mb-2 text-lg font-medium">About Voice Cloning</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Voice cloning technology allows you to create a digital replica of your voice that can be used for making
              calls. For best results, record at least 30 seconds of clear speech in a quiet environment.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-card p-4 shadow-sm">
                <h4 className="mb-2 font-medium">Privacy & Security</h4>
                <p className="text-sm text-muted-foreground">
                  Your voice data is encrypted and securely stored. We never share your voice data with third parties.
                </p>
              </div>
              <div className="rounded-lg bg-card p-4 shadow-sm">
                <h4 className="mb-2 font-medium">Voice Quality</h4>
                <p className="text-sm text-muted-foreground">
                  The quality of your voice clone depends on the quality of your recording. Use a good microphone in a
                  quiet room.
                </p>
              </div>
              <div className="rounded-lg bg-card p-4 shadow-sm">
                <h4 className="mb-2 font-medium">Usage Limits</h4>
                <p className="text-sm text-muted-foreground">
                  Your current plan allows for up to 5 voice clones and 100 minutes of call time per month. Upgrade for
                  additional capacity.
                </p>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

