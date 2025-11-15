import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface DeliverySlotSelectorProps {
  storeId: Id<"stores">;
  selectedDate: string;
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
}

export function DeliverySlotSelector({
  storeId,
  selectedDate,
  selectedSlot,
  onSlotChange,
}: DeliverySlotSelectorProps) {
  const apiAny: any = api;
  const slots = useQuery(apiAny.pricing.getDeliveryTimeSlots, {
    storeId,
    date: selectedDate,
  });

  if (!slots || slots.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No delivery slots available for this date
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Select Delivery Time Slot
      </Label>
      <RadioGroup value={selectedSlot} onValueChange={onSlotChange}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {slots.map((slot: any) => (
            <Card
              key={slot.startTime}
              className={`cursor-pointer transition-colors ${
                selectedSlot === slot.label ? "border-primary bg-primary/5" : ""
              } ${!slot.available ? "opacity-50" : ""}`}
              onClick={() => slot.available && onSlotChange(slot.label)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value={slot.label}
                    id={slot.label}
                    disabled={!slot.available}
                  />
                  <Label
                    htmlFor={slot.label}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{slot.label}</span>
                      <div className="flex items-center gap-2">
                        {slot.isPeakHour && (
                          <Badge variant="secondary" className="text-[10px]">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +₹{slot.surcharge}
                          </Badge>
                        )}
                        {!slot.available && (
                          <Badge variant="destructive" className="text-[10px]">
                            Full
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {slot.booked}/{slot.capacity} slots booked
                    </div>
                  </Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}