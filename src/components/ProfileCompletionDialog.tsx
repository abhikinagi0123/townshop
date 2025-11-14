import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Phone } from "lucide-react";

interface ProfileCompletionDialogProps {
  open: boolean;
  onComplete: () => void;
  currentName?: string;
  currentPhone?: string;
}

export function ProfileCompletionDialog({
  open,
  onComplete,
  currentName = "",
  currentPhone = "",
}: ProfileCompletionDialogProps) {
  const [name, setName] = useState(currentName);
  const [phone, setPhone] = useState(currentPhone);
  const [isLoading, setIsLoading] = useState(false);
  
  const updateProfile = useMutation(api.users.updateProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    
    // Basic phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    
    setIsLoading(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      toast.success("Profile updated successfully!");
      onComplete();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your details to continue
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="pl-9"
                disabled={isLoading}
                required
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your 10-digit mobile number
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
