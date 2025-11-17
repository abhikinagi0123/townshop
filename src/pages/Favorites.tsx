import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { Heart, ArrowLeft, Share2, Users, Copy, Trash2, Eye, Plus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Favorites() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const apiAny: any = api;
  const favorites = useQuery(apiAny.favorites.list);
  const cartItems = useQuery(apiAny.cart.get);
  const sharedWishlists = useQuery(apiAny.wishlistSharing.listShared);
  const mySharedWishlists = useQuery(apiAny.wishlistSharing.listByUser);
  
  const addToCart = useMutation(apiAny.cart.addItem);
  const updateQuantity = useMutation(apiAny.cart.updateQuantity);
  const toggleFavorite = useMutation(apiAny.favorites.toggle);
  const shareWishlist = useMutation(apiAny.wishlistSharing.share);
  const acceptWishlist = useMutation(apiAny.wishlistSharing.accept);
  const deleteSharedWishlist = useMutation(apiAny.wishlistSharing.deleteSharedWishlist);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [viewSharedDialogOpen, setViewSharedDialogOpen] = useState(false);
  const [selectedSharedWishlist, setSelectedSharedWishlist] = useState<any>(null);
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
      const result = await shareWishlist({
        recipientEmail: shareEmail,
        message: shareMessage || undefined,
      });
      toast.success(`Wishlist shared! Code: ${result.shareCode}`);
      setShareEmail("");
      setShareMessage("");
      setShareDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to share wishlist");
    }
  };

  const handleAcceptWishlist = async (wishlistId: string) => {
    try {
      const result = await acceptWishlist({ wishlistId: wishlistId as any });
      toast.success(`Added ${result.addedCount} products to your favorites!`);
    } catch (error) {
      toast.error("Failed to accept wishlist");
    }
  };

  const handleDeleteSharedWishlist = async (wishlistId: string) => {
    try {
      await deleteSharedWishlist({ wishlistId: wishlistId as any });
      toast.success("Shared wishlist deleted");
    } catch (error) {
      toast.error("Failed to delete wishlist");
    }
  };

  const handleCopyShareLink = (shareCode: string) => {
    const shareUrl = `${window.location.origin}/wishlist/${shareCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const productFavorites = favorites?.filter((f: any) => f.product) || [];
  const storeFavorites = favorites?.filter((f: any) => f.store) || [];

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
                <Button onClick={handleShareWishlist} className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Wishlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="products">
              Products {productFavorites.length > 0 && `(${productFavorites.length})`}
            </TabsTrigger>
            <TabsTrigger value="stores">
              Stores {storeFavorites.length > 0 && `(${storeFavorites.length})`}
            </TabsTrigger>
            <TabsTrigger value="shared">
              Shared {sharedWishlists && sharedWishlists.length > 0 && `(${sharedWishlists.length})`}
            </TabsTrigger>
            <TabsTrigger value="my-shared">
              My Shared {mySharedWishlists && mySharedWishlists.length > 0 && `(${mySharedWishlists.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {productFavorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground mb-4">No favorite products yet</p>
                <Button onClick={() => navigate("/stores")}>
                  Start Shopping
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productFavorites.map((favorite: any) => (
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
          </TabsContent>

          <TabsContent value="stores">
            {storeFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground mb-4">No favorite stores yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeFavorites.map((favorite: any) => (
                  <Card key={favorite._id} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/store/${favorite.storeId}`)}>
                    <CardContent className="p-4">
                      <img src={favorite.store?.image} alt={favorite.store?.name} 
                        className="w-full h-32 object-cover rounded mb-3" />
                      <h3 className="font-semibold">{favorite.store?.name}</h3>
                      <p className="text-sm text-muted-foreground">{favorite.store?.category}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared">
            {!sharedWishlists || sharedWishlists.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">No shared wishlists</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedWishlists.map((wishlist: any) => (
                  <Card key={wishlist._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{wishlist.senderName}'s Wishlist</p>
                            <Badge variant="secondary">{wishlist.productIds?.length || 0} items</Badge>
                          </div>
                          {wishlist.message && (
                            <p className="text-sm text-muted-foreground italic">
                              "{wishlist.message}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedSharedWishlist(wishlist);
                              setViewSharedDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptWishlist(wishlist._id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add All
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-shared">
            {!mySharedWishlists || mySharedWishlists.length === 0 ? (
              <div className="text-center py-12">
                <Share2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">No shared wishlists yet</p>
                <p className="text-sm text-muted-foreground mt-2">Share your favorites with friends!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySharedWishlists.map((wishlist: any) => (
                  <Card key={wishlist._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{wishlist.name}</p>
                            <Badge variant="secondary">{wishlist.productIds?.length || 0} items</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Code: {wishlist.shareCode}</p>
                          {wishlist.description && (
                            <p className="text-sm text-muted-foreground mt-1">{wishlist.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCopyShareLink(wishlist.shareCode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteSharedWishlist(wishlist._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={viewSharedDialogOpen} onOpenChange={setViewSharedDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSharedWishlist?.senderName}'s Wishlist</DialogTitle>
          </DialogHeader>
          {selectedSharedWishlist && (
            <div className="space-y-4 py-4">
              {selectedSharedWishlist.message && (
                <p className="text-sm text-muted-foreground italic">"{selectedSharedWishlist.message}"</p>
              )}
              <div className="grid grid-cols-1 gap-3">
                {selectedSharedWishlist.productIds?.map((productId: any) => {
                  const product = favorites?.find((f: any) => f.productId === productId)?.product;
                  if (!product) return null;
                  return (
                    <Card key={productId} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/product/${productId}`)}>
                      <CardContent className="p-3 flex gap-3">
                        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.storeName}</p>
                          <p className="font-bold text-primary mt-1">₹{product.price}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Button 
                onClick={() => {
                  handleAcceptWishlist(selectedSharedWishlist._id);
                  setViewSharedDialogOpen(false);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add All to My Favorites
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}