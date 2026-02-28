export enum PaymentPlatform{
    STRIPE="STRIPE",
    EBIRR="EBIRR",
    EVC="EVC",
    ZAAD="ZAAD",
    SAHAL="SAHAL",
    LOCAL="LOCAL" //for cash payments
}

export enum PaymentStatus{
    PENDING="Pending",
    SUCCESS="Success",
    PROCESSING="Processing",
    COMPLETED="Completed",
    FAILED="Failed",
    REFUNDED="Refunded"
}

export interface CreditPackage  {
    _id:string;
  name: string;
  credits: number;
  price: number;
  description?: string;
  isActive: boolean;
  stripePriceId?: string;
  bonus?: number;
  popular?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface ProcessPaymentParams{
  packageId:string,
  platform:PaymentPlatform,
  phone?:string,
  successUrl?:string,
  cancelUrl?:string
}

export interface PaymentHistoryProps{
    orders:Order[]
    isLoading:boolean
}
export interface CreditPackacgeCardProps{
  package:CreditPackage;
  onSelect:(packageId:string)=>void;
  isLoading?:boolean;
  isSelected?:boolean;
}


export interface Order   {
    _id:string;
  user: string;
  amount: number;
  package: CreditPackage;
  platform: PaymentPlatform;
  phone?: string;
  status: PaymentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  transactionId?: string;
  paymentDetails?: any;
  creditsAdded?: boolean;
  credits?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface verifyPayment{
    success:boolean;
    message:string;
    status:PaymentStatus,
    orderId:string;
    credits:number;
    data?:{
        paymentIntentId:string;
        amountTotal:number;
        currency:string;
        customerEmail?:string;
        metadata?:any
    }
}


export interface GetPaymentHistory{
    limit?:number
}

export interface GetPaymentHistoryResponse{
    order:Order[]
}

export interface LocalPaymentFormProps{
    packageId:string;
    onsubmit:(phone:string, platform?:string)=>void
    isLoading?:boolean
}
export interface PaymentMetaData{
    userId?:string;
    packageId?:string;
    credits?:number;
    [key:string]:any;
}

export interface PaymentRequest{
    userId:string;
    packageId:string;
    amount:number;
    platform:PaymentPlatform;
    phone?:string;
    description?:string
    returnUrl?:string;
    metaData?:PaymentMetaData
}

export interface PaymentResponse{
  success:boolean;
  message?:string;
  data?:any;
  error?:any;
  sessionId?:string;
  orderId?:string;
  transactionId?:string;
  amount?:number;
  credits?:number;
  redirectUrl?:string;
  status?:PaymentStatus
}

export interface PaymentResult{
  success:boolean;
  message?:string;
  sessionId?:string;
  orderId?:string;
  transactionId?:string;
  amount?:number;
  credits?:number;
  redirectUrl?:string;
  status?:PaymentStatus
}


export interface MobileWalletConfig{
  merchantUid:string
  apiKey:string;
  apiUserId:string;
  apiEndPoint:string
}


export interface MobileWalletPayload {
  schemaVersion?: string;
  requestedId?: string;
  timestamp?: string;
  channelName?: string;
  serviceName?: string;
  serviceParams?: {
    merchantUid: string;
    apiKey: string;
    apiUserId: string;
    payerInfo: {
        accountNo: string;
    };
        transactionInfo: {
        amount: number;
        currency: string;
        description?: string;
        invoiceId?: string;
        refrenceId?: string;
        platform?: string;
    };
  }
}


export interface MobileWalletResponse {
  transactionId?: string; 
  timestamp?: string;
  refrenceId?: string;
  responseMSG?: string;
  responseCode?: string;
}


export interface StripePaymentConfig {
  publicKey?: string;
  secretKey: string; 
  webhookSecret?: string; 
}

export interface StripePaymentResponse {
    sessionId: string;
    paymentIntentId?: string;
  redirectUrl: string | undefined;
  status: PaymentStatus;
}

export interface PaymentProcessor{
    processPayment(request: PaymentRequest): Promise<PaymentResponse>;
    verifyPayment?(orderId: string): Promise<PaymentResult>;
}

