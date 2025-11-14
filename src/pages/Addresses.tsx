import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function Addresses() {
  const navigate = useNavigate();
  const addresses = useQuery(api.addresses.list);
  const cartItems = useQuery(api.cart.get);
  
  const createAddress = useMutation(api.addresses.create);
  const updateAddress = useMutation(api.addresses.update);
  const removeAddress = useMutation(api.addresses.remove);

  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<Id<"addresses"> | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
    isDefault: false,
  });

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
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

  const handleOpenDialog = (address?: any) => {
    if (address) {
      setEditingId(address._id);
      setFormData({
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        lat: address.lat,
        lng: address.lng,
        isDefault: address.isDefault,
      });
    } else {
      setEditingId(null);
      setFormData({
        label: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        lat: undefined,
        lng: undefined,
        isDefault: false,
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim() || !formData.street.trim() || !formData.city.trim() || 
        !formData.state.trim() || !formData.zipCode.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.lat === undefined || formData.lng === undefined) {
      toast.error("Please capture location");
      return;
    }

    try {
      if (editingId) {
        await updateAddress({ addressId: editingId, ...formData });
        toast.success("Address updated successfully");
      } else {
        await createAddress(formData);
        toast.success("Address added successfully");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error("Failed to save address");
      console.error(error);
    }
  };

  const handleDelete = async (addressId: Id<"addresses">) => {
    try {
      await removeAddress({ addressId });
      toast.success("Address deleted");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/profile")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Saved Addresses</h1>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>

        {!addresses ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-4">No saved addresses</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <motion.div
                key={address._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{address.label}</h3>
                        {address.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(address._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {address.street}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    {address.lat && address.lng && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {address.lat.toFixed(6)}, {address.lng.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update your address details" : "Add a new delivery address"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Label (Home, Work, etc.)</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Home"
                required
              />
            </div>
            <div>
              <Label>Street Address</Label>
              <Input
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Street address"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  required
                />
              </div>
            </div>
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="ZIP Code"
                required
              />
            </div>
            <div>
              <Label>Location</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full mt-1"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    {formData.lat && formData.lng ? "Update Location" : "Capture Location"}
                  </>
                )}
              </Button>
              {formData.lat && formData.lng && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Location: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default address
              </Label>
            </div>
            <Button type="submit" className="w-full">
              {editingId ? "Update Address" : "Add Address"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
