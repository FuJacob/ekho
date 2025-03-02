"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PatientAgentCard } from "@/components/PatientAgentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { PatientModal, Patient } from "@/components/PatientModal";
import { toast } from "sonner";

export default function Page() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [modalMode, setModalMode] = useState<"edit" | "add">("edit");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
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
      toast.error("Failed to fetch patients");
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
      fetchPatients();
      if (response.ok) {
        toast.success("Patient deleted successfully");
      } else {
        throw new Error("Failed to delete patient");
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete patient");
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
        throw new Error("Failed to get patient data");
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Patients</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            {patients.map((patient) => (
              <PatientAgentCard 
                key={patient.id}
                patient={patient}
                onDelete={handleDeletePatient}
                onCall={handleCall}
                onViewDetails={handleViewDetails}
              />
            ))}

            <Card
              className="flex h-[200px] cursor-pointer items-center justify-center hover:bg-accent/50 transition-colors"
              onClick={handleAddPatient}
            >
              <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
                <Plus className="h-8 w-8" />
                <p>Add New Patient</p>
              </CardContent>
            </Card>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
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
