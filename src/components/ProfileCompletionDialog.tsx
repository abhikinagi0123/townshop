import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
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
import { User, Phone, MapPin, Loader2 } from "lucide-react";

interface ProfileCompletionDialogProps {
  open: boolean;
  onComplete: () => void;
  currentName?: string;
  currentPhone?: string;
  currentLat?: number;
  currentLng?: number;
}

export function ProfileCompletionDialog({ open: propOpen, onComplete }: ProfileCompletionDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(propOpen);

  useEffect(() => {
    setOpen(propOpen);
  }, [propOpen]);
  const apiAny: any = api;
  const updateProfile = useMutation(apiAny.users.updateProfile);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [lat, setLat] = useState<number | undefined>(user?.lat);
  const [lng, setLng] = useState<number | undefined>(user?.lng);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setLat(user?.lat);
    setLng(user?.lng);
  }, [user]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        toast.success("Location captured successfully!");
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error("Failed to get location. Please enable location access.");
        console.error(error);
        setIsGettingLocation(false);
      }
    );
  };

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

    if (lat === undefined || lng === undefined) {
      toast.error("Please capture your location");
      return;
    }
    
    setIsLoading(true);
    try {
      await updateProfile({ 
        name: name.trim(), 
        phone: phone.trim(),
        lat,
        lng
      });
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

          <div>
            <Label htmlFor="location">Location</Label>
            <div className="mt-1 space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGetLocation}
                disabled={isLoading || isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    {lat && lng ? "Update Location" : "Capture Location"}
                  </>
                )}
              </Button>
              {lat && lng && (
                <p className="text-xs text-muted-foreground text-center">
                  Location captured: {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || !lat || !lng}>
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}