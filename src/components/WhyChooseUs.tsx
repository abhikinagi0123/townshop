import { Zap, MapPin, Star } from "lucide-react";

export function WhyChooseUs() {
  return (
    <div className="py-6 mt-4">
      <h2 className="text-base font-bold mb-4 text-center">Why Choose Us?</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-2 mx-auto shadow-md">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <p className="text-xs font-semibold mb-1">Lightning Fast</p>
          <p className="text-[10px] text-muted-foreground leading-tight">10-30 min delivery</p>
        </div>

        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-2 mx-auto shadow-md">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <p className="text-xs font-semibold mb-1">Local Stores</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Support local</p>
        </div>

        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-2 mx-auto shadow-md">
            <Star className="h-6 w-6 text-white" />
          </div>
          <p className="text-xs font-semibold mb-1">Quality</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Fresh products</p>
        </div>
      </div>
    </div>
  );
}
