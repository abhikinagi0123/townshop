import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  Package,
  CreditCard,
  MapPin,
  ShoppingBag,
  Truck,
  RefreshCw,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function Help() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const apiAny: any = api;
  const createChatSession = useMutation(apiAny.chat.createSession);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    try {
      const sessionId = await createChatSession({});
      navigate(`/chat/${sessionId}`);
    } catch (error) {
      toast.error("Failed to start chat");
    }
  };

  const faqCategories = [
    {
      icon: Package,
      title: "Orders & Delivery",
      faqs: [
        {
          question: "How do I track my order?",
          answer: "Go to 'My Orders' from your profile, select the order you want to track, and you'll see real-time updates on your delivery status including live location tracking when your order is out for delivery.",
        },
        {
          question: "Can I cancel or modify my order?",
          answer: "You can cancel orders that are in 'pending' or 'confirmed' status. Once the order is being prepared or out for delivery, cancellation may not be possible. Contact support for assistance.",
        },
        {
          question: "What are the delivery charges?",
          answer: "Delivery charges vary by store and distance. You'll see the exact delivery fee at checkout before placing your order. Some stores offer free delivery on orders above a minimum amount.",
        },
        {
          question: "How long does delivery take?",
          answer: "Delivery times vary by store and your location. Most orders are delivered within 30-60 minutes. You can see estimated delivery time for each store on their page.",
        },
      ],
    },
    {
      icon: ShoppingBag,
      title: "Products & Services",
      faqs: [
        {
          question: "How do I book a service?",
          answer: "Browse services, select a provider, choose your preferred date and time, enter your address, and confirm the booking. You can also set up recurring bookings for regular services.",
        },
        {
          question: "Are products guaranteed to be in stock?",
          answer: "We do our best to keep inventory updated in real-time. If an item goes out of stock after you order, we'll notify you immediately and offer alternatives or a refund.",
        },
        {
          question: "Can I return or exchange products?",
          answer: "Return and exchange policies vary by store. Check the store's policy on their page. Generally, you can return items within 24-48 hours if they're unused and in original packaging.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: "Payments & Wallet",
      faqs: [
        {
          question: "What payment methods are accepted?",
          answer: "We accept UPI, credit/debit cards, wallet payments, and cash on delivery (COD). You can also use your TownShop wallet balance for faster checkout.",
        },
        {
          question: "How do I add money to my wallet?",
          answer: "Go to your profile, tap on the wallet card, and select 'Add Money'. Choose an amount and complete the payment. Wallet balance can be used for all purchases.",
        },
        {
          question: "Are my payment details secure?",
          answer: "Yes, all payments are processed through secure, encrypted payment gateways. We never store your complete card details on our servers.",
        },
        {
          question: "How do refunds work?",
          answer: "Refunds are processed to your original payment method within 5-7 business days. If you paid via wallet, the refund is instant.",
        },
      ],
    },
    {
      icon: MapPin,
      title: "Account & Addresses",
      faqs: [
        {
          question: "How do I add or edit delivery addresses?",
          answer: "Go to 'Saved Addresses' from your profile. You can add new addresses, edit existing ones, or set a default address for faster checkout.",
        },
        {
          question: "Can I have multiple delivery addresses?",
          answer: "Yes, you can save multiple addresses and choose which one to use at checkout. This is useful for home, office, or other frequent delivery locations.",
        },
        {
          question: "How do I update my profile information?",
          answer: "Tap the 'Edit' button on your profile page to update your name, phone number, email, and location preferences.",
        },
      ],
    },
    {
      icon: RefreshCw,
      title: "Loyalty & Rewards",
      faqs: [
        {
          question: "How do I earn loyalty points?",
          answer: "Earn points on every purchase (1 point per ₹10 spent), completing your profile, referring friends, and through special promotions. Points can be redeemed for discounts.",
        },
        {
          question: "What are loyalty tiers?",
          answer: "We have Bronze, Silver, Gold, and Platinum tiers. Higher tiers unlock better rewards, exclusive offers, and priority support. Tiers are based on your total spending.",
        },
        {
          question: "How do I use my loyalty points?",
          answer: "Points are automatically converted to wallet balance (100 points = ₹1). You can use this balance for any purchase on TownShop.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader showSearch={false} isAuthenticated={isAuthenticated} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Help Center</h1>
              <p className="text-sm text-muted-foreground">Find answers and get support</p>
            </div>
          </div>

          {/* Quick Contact Options */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-4">Contact Support</h2>
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleStartChat}
                >
                  <MessageSquare className="h-4 w-4 mr-3" />
                  <div className="text-left flex-1">
                    <p className="font-medium">Live Chat</p>
                    <p className="text-xs text-muted-foreground">Get instant help</p>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = "tel:+911234567890"}
                >
                  <Phone className="h-4 w-4 mr-3" />
                  <div className="text-left flex-1">
                    <p className="font-medium">Call Us</p>
                    <p className="text-xs text-muted-foreground">+91 123 456 7890</p>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = "mailto:support@townshop.com"}
                >
                  <Mail className="h-4 w-4 mr-3" />
                  <div className="text-left flex-1">
                    <p className="font-medium">Email Support</p>
                    <p className="text-xs text-muted-foreground">support@townshop.com</p>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Sections */}
          <div className="space-y-4">
            {faqCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="font-bold text-lg">{category.title}</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, faqIdx) => (
                        <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Still Need Help */}
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold mb-2">Still need help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is available 24/7 to assist you
              </p>
              <Button onClick={handleStartChat} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Live Chat
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </div>
  );
}
