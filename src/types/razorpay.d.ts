declare module 'razorpay' {
  interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  interface OrderOptions {
    amount: number;
    currency: string;
    receipt: string;
    payment_capture?: number;
    notes?: Record<string, any>;
  }

  interface Order {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
    created_at: number;
  }

  interface Payment {
    id: string;
    status: string;
    amount: number;
    method: string;
    created_at: number;
  }

  class Razorpay {
    constructor(config: RazorpayConfig);
    orders: {
      create(options: OrderOptions): Promise<Order>;
    };
    payments: {
      fetch(paymentId: string): Promise<Payment>;
    };
  }

  export default Razorpay;
}
