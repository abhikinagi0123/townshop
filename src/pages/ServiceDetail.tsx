import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Star, Phone, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const apiAny: any = api;
  const serviceData = useQuery(apiAny.services.getById, {
    serviceId: serviceId as Id<"services">,
  });

  const createBooking = useMutation(apiAny.services.createBooking);

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly" | "biweekly" | "monthly">("weekly");

  const handleBookService = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!scheduledDate || !scheduledTime || !address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createBooking({
        serviceId: serviceId as Id<"services">,
        scheduledDate,
        scheduledTime,
        address,
        lat: user?.lat || 28.6139,
        lng: user?.lng || 77.2090,
        notes: notes.trim() || undefined,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
      });
      toast.success("Service booked successfully!");
      setShowBookingDialog(false);
      navigate("/orders");
    } catch (error: any) {
      toast.error(error.message || "Failed to book service");
    }
  };

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
        <MobileBottomNav isAuthenticated={isAuthenticated} />
      </div>
    );
  }

  const { provider, reviews } = serviceData;
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={serviceData.images[0]}
                    alt={serviceData.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {serviceData.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {serviceData.images.slice(1, 5).map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${serviceData.name} ${idx + 2}`}
                          className="w-full h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-2xl font-bold">{serviceData.name}</h1>
                      {provider.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">{serviceData.category}</Badge>
                  </div>

                  <p className="text-muted-foreground">{serviceData.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Duration: {serviceData.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Service Area: {provider.serviceArea.radius}km radius</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                    <p className="text-3xl font-bold">₹{serviceData.basePrice}</p>
                  </div>

                  <Button
                    onClick={() => setShowBookingDialog(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">Service Provider</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold">{provider.businessName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{provider.businessName}</p>
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${provider.phone}`} className="text-primary hover:underline">
                    {provider.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${provider.email}`} className="text-primary hover:underline">
                    {provider.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {reviews && reviews.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Customer Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review._id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      {review.isVerified && (
                        <Badge variant="secondary" className="text-xs mt-2">
                          Verified Booking
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Service Address *</Label>
              <Textarea
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="recurring">Make this a recurring booking</Label>
            </div>
            {isRecurring && (
              <div>
                <Label>Frequency</Label>
                <Select value={recurringFrequency} onValueChange={(value: any) => setRecurringFrequency(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleBookService} className="w-full">
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
