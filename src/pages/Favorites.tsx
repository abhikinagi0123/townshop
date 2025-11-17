import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Heart, ArrowLeft, Share2, Users, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Favorites() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const favorites = useQuery(apiAny.favorites.list);
  const cartItems = useQuery(apiAny.cart.get);
  const sharedWishlists = useQuery(apiAny.wishlistSharing.listShared);
  
  const addToCart = useMutation(apiAny.cart.addItem);
  const updateQuantity = useMutation(apiAny.cart.updateQuantity);
  const toggleFavorite = useMutation(apiAny.favorites.toggle);
  const shareWishlist = useMutation(apiAny.wishlistSharing.share);
  const acceptWishlist = useMutation(apiAny.wishlistSharing.accept);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const getProductQuantity = (productId: string) => {
    const item = cartItems?.find((item: any) => item.productId === productId);
    return item?.quantity || 0;
  };

  const getCartItemId = (productId: string) => {
    return cartItems?.find((item: any) => item.productId === productId)?._id;
  };

  const handleAddToCart = async (productId: any) => {
    try {
      await addToCart({ productId, quantity: 1 });
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleIncrease = async (productId: any) => {
    const cartItemId = getCartItemId(productId);
    if (!cartItemId) return;
    
    try {
      await updateQuantity({
        cartItemId,
        quantity: getProductQuantity(productId) + 1,
      });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleDecrease = async (productId: any) => {
    const cartItemId = getCartItemId(productId);
    if (!cartItemId) return;
    
    try {
      await updateQuantity({
        cartItemId,
        quantity: getProductQuantity(productId) - 1,
      });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleToggleFavorite = async (productId: any) => {
    try {
      await toggleFavorite({ productId });
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handleShareWishlist = async () => {
    if (!shareEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    try {
      await shareWishlist({
        recipientEmail: shareEmail,
        message: shareMessage || undefined,
      });
      toast.success("Wishlist shared successfully!");
      setShareEmail("");
      setShareMessage("");
      setShareDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to share wishlist");
    }
  };

  const handleAcceptWishlist = async (wishlistId: string) => {
    try {
      await acceptWishlist({ wishlistId: wishlistId as any });
      toast.success("Wishlist accepted!");
    } catch (error) {
      toast.error("Failed to accept wishlist");
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/favorites`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view favorites</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold">My Favorites</h1>
          </div>
          
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Wishlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Recipient Email</Label>
                  <Input
                    type="email"
                    placeholder="friend@example.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Message (Optional)</Label>
                  <Input
                    placeholder="Check out my favorite products!"
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleShareWishlist} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share via Email
                  </Button>
                  <Button onClick={handleCopyShareLink} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {sharedWishlists && sharedWishlists.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Shared with You
            </h2>
            <div className="space-y-3">
              {sharedWishlists.map((wishlist: any) => (
                <Card key={wishlist._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{wishlist.senderName}'s Wishlist</p>
                        <p className="text-sm text-muted-foreground">
                          {wishlist.productIds?.length || 0} items
                        </p>
                        {wishlist.message && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            "{wishlist.message}"
                          </p>
                        )}
                      </div>
                      {!wishlist.isAccepted && (
                        <Button size="sm" onClick={() => handleAcceptWishlist(wishlist._id)}>
                          Accept
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!favorites || favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-4">No favorites yet</p>
            <Button onClick={() => navigate("/stores")}>
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite: any) => (
              <ProductCard
                key={favorite._id}
                product={favorite.product}
                quantity={getProductQuantity(favorite.productId)}
                onAdd={() => handleAddToCart(favorite.productId)}
                onIncrease={() => handleIncrease(favorite.productId)}
                onDecrease={() => handleDecrease(favorite.productId)}
              />
            ))}
          </div>
        )}
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}