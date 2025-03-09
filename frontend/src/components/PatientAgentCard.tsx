import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic2, Phone, Calendar, MoreVertical, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { GearIcon } from "@radix-ui/react-icons";

interface Patient {
  id?: number;
  name: string;
  context: string;
  phoneNumber: string;
  avatarUrl?: string;
  lastCall?: string;
}

interface PatientAgentCardProps {
  patient: Patient;
  onDelete: (id: number) => void;
  onCall: (id: number) => Promise<void>;
  onViewDetails: (id: number) => void;
}

export function PatientAgentCard({
  patient,
  onDelete,
  onCall,
  onViewDetails,
}: PatientAgentCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg">
      {/* Status indicator */}
      <div />

      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={patient.avatarUrl} alt={patient.name} />
          <AvatarFallback>
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-4xl font-black">{patient.name}</CardTitle>
          <CardDescription className="text-lg">This is example description of your contact.</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <GearIcon className="h-32 w-32" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(patient.id ?? 0)}>
              Edit Contact
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(patient.id ?? 0)}
              className="text-red-600"
            >
              Delete Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="py-4">
        <div className="flex flex-col gap-2">
          {patient.lastCall && (
            <div className="flex-col items-center gap-4 text-md text-muted-foreground">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Phone className="h-6 w-6" />
                {patient.phoneNumber}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={() => onCall(patient.id ?? 0)}
          className="w-full gap-2 text-2xl h-12 font-bold"
        >
          <Mic2 className="h-4 w-4" />
          Send an Echo
        </Button>
      </CardFooter>
    </Card>
  );
}
