"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Phone,
  Home,
  Settings,
  Search,
  Bell,
  User,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/sidebar";
import { PatientModal, type Patient } from "@/components/PatientModal";
import { toast } from "sonner";

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [modalMode, setModalMode] = useState<"edit" | "add">("edit");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5500/api/get-users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const patientsData = await response.json();
      setPatients(patientsData);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to fetch contacts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:5500/api/delete-user?id=${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        fetchPatients();
        toast.success("Contact deleted successfully");
      } else {
        throw new Error("Failed to delete contact");
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete contact");
    }
  };

  const handleCall = async (id: number) => {
    try {
      // First, fetch the patient data
      const patientResponse = await fetch(
        `http://localhost:5500/api/get-patient-data?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!patientResponse.ok) {
        throw new Error("Failed to get contact data");
      }

      const patientData = await patientResponse.json();

      const selected_voice = await fetch(
        `http://localhost:5500/api/get-selected-voice`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const voice_id = await selected_voice.json();

      // Start the consultation call
      const callResponse = await fetch("http://localhost:5500/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voice_id: voice_id,
          data: patientData,
        }),
      });

      if (!callResponse.ok) {
        throw new Error("Failed to initiate call");
      }

      toast.success("Call initiated successfully");
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Failed to initiate call");
    }
  };

  const handleViewDetails = (id: number) => {
    const patient = patients.find((p) => p.id === id);
    setSelectedPatient(patient);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleAddPatient = () => {
    setSelectedPatient(undefined);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Refresh patients list after modal close to get updated data
    fetchPatients();
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <SidebarMenuButton asChild isActive>
                    <a href="#">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <Users className="h-4 w-4" />
                      <span>Contacts</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
<Link href="/dashboard/voice-library">
  
                        <Phone className="h-4 w-4" />
                        <span>Voice Library</span>
  
</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
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
            <h1 className="text-xl font-semibold">Contacts Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
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
              <h2 className="text-2xl font-bold">Your Contacts</h2>
              <p className="text-muted-foreground">
                Manage your contacts and make voice calls
              </p>
            </div>
            <Button onClick={handleAddPatient} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Contact
            </Button>
          </div>

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
          ) : filteredPatients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  <CardHeader className="bg-primary/5 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          {patient.avatarUrl ? (
                            <AvatarImage src={patient.avatarUrl} />
                          ) : (
                            <AvatarFallback>
                              {patient.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {patient.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {patient.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10">
                        Contact
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-2">
                        {patient.context || "No context provided"}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 border-t bg-muted/10 p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(patient.id!)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleCall(patient.id!)}
                    >
                      <Phone className="h-3 w-3" /> Call
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeletePatient(patient.id!)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <Card
                className="flex h-full cursor-pointer flex-col items-center justify-center border-dashed hover:border-primary/50 hover:bg-primary/5"
                onClick={handleAddPatient}
              >
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Add New Contact</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a new contact to call
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No contacts found</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchQuery
                  ? `No contacts matching "${searchQuery}"`
                  : "You haven't added any contacts yet"}
              </p>
              <Button onClick={handleAddPatient}>Add Your First Contact</Button>
            </div>
          )}
        </main>
      </SidebarInset>
      <PatientModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        patient={selectedPatient}
        patientId={selectedPatient?.id ?? 0}
        mode={modalMode}
      />
    </SidebarProvider>
  );
}
