import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Optional for notifications

// Updated interface to match Patient type
export interface Patient {
  name: string;
  context: string;
  phoneNumber: string;
  avatarUrl?: string;
  id?: number;
}

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  patientId: number;
  mode: "edit" | "add";
}

export function PatientModal({
  isOpen,
  onClose,
  patient,
  patientId,
  mode,
}: PatientModalProps) {
  const [formData, setFormData] = useState<Patient>({
    name: "",
    context: "",
    phoneNumber: "",
    avatarUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && patient) {
      setFormData(patient);
    } else if (mode === "add") {
      // Reset form with default values
      setFormData({
        name: "",
        context: "",
        phoneNumber: "",
        avatarUrl: "",
      });
    }
  }, [mode, patient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add the ID to the data for the API
      const patientData = {
        ...formData,
      };

      const response = await fetch("http://localhost:5500/api/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add patient");
      }

      // Show success message
      toast?.success("Patient added successfully");

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error adding patient:", error);
      toast?.error(
        error instanceof Error ? error.message : "Failed to add patient"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Patient Details" : "Add New Patient"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">
                Avatar URL
              </Label>
              <Input
                id="avatarUrl"
                value={formData.avatarUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, avatarUrl: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="context" className="text-right pt-2">
                Context
              </Label>
              <Textarea
                id="context"
                value={formData.context}
                onChange={(e) =>
                  setFormData({ ...formData, context: e.target.value })
                }
                className="col-span-3 min-h-48"
                placeholder="Who is this person?"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
