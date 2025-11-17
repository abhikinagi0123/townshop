import { Shield, Award, Truck, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "Secure Payments",
      description: "100% secure transactions",
      color: "text-green-500",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Verified products & services",
      color: "text-blue-500",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick & reliable shipping",
      color: "text-orange-500",
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      description: "Hassle-free return policy",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="py-6">
      <h2 className="text-lg font-bold mb-4 text-center">Why Trust TownShop?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <Card key={idx} className="border-muted">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${badge.color}`} />
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
