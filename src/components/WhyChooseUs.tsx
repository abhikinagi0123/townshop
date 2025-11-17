import { Zap, MapPin, Star } from "lucide-react";

export function WhyChooseUs() {
  return (
    <div className="py-8 mt-6">
      <h2 className="text-lg font-extrabold mb-6 text-center">Why Choose TownShop?</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3 mx-auto shadow-lg">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm font-bold mb-1">All-in-One</p>
          <p className="text-xs text-muted-foreground leading-tight">Products & services</p>
        </div>

        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-3 mx-auto shadow-lg">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm font-bold mb-1">Local Businesses</p>
          <p className="text-xs text-muted-foreground leading-tight">Support community</p>
        </div>

        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-3 mx-auto shadow-lg">
            <Star className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm font-bold mb-1">Quality</p>
          <p className="text-xs text-muted-foreground leading-tight">Trusted services</p>
        </div>
      </div>
    </div>
  );
}
