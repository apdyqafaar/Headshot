"use client";

import CreditPackageCard from "@/components/payments/credit-packacge-card";
import CreditsHeader from "@/components/payments/credits-header";
import PaymentHistory from "@/components/payments/payment-history";
import SelectPaymentSelector from "@/components/payments/payment-method-selector";
import StripeCheckoutSection from "@/components/payments/stripe-checkout-section";
import StripeRedirectHandler from "@/components/payments/stripe-redirect-handler";
import { PaymentPlatform } from "@/lib";
import { useUser } from "@/lib/context";
import {
  useGetCreditPackages,
  useProcessPayment,
} from "@/lib/hooks/usePayment";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const creditsPage = () => {
  const { user } = useUser();

  // state
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [selectedPlatform, setSelectedPlatform] = useState<PaymentPlatform>(
    PaymentPlatform.STRIPE,
  );
  const [showLocalForm, setShowLocalForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // use credits
  const {
    data: packages,
    isLoading: isLoadingCredits,
    error,
  } = useGetCreditPackages();
 
  // process payment
  const { mutate: processPayment, isPending: isVerifying } =
    useProcessPayment();

  const handleSelected = (packageId: string) => {
    setSelectedPackageId((prev)=>prev===packageId?"":packageId);
    setShowLocalForm(false);
  };

  // handle platform selection
  const handleSelectedPlatform = (platform: PaymentPlatform) => {
    setSelectedPlatform(platform);
    const IsLocalPayment = ["EVC", "ZAAD", "SAHAL", "EBIRR", "LOCAL"].includes(
      platform,
    );
    setShowLocalForm(IsLocalPayment);
  };

  const selectedPackage = packages?.find(
    (pcg) => pcg._id === selectedPackageId,
  );
  const handleVerifyingPayment = (sessionId: string) => {
    console.log("sessionId ", sessionId);
  };

const handleProcessPayment=()=>{
  
}
  return (
    <div className="space-y-8">
      <StripeRedirectHandler
        onVerify={handleVerifyingPayment}
        isVerifying={isVerifying}
      />
      <CreditsHeader
        credits={user?.credits as number}
        onToggleHistory={() => setShowHistory(!showHistory)}
        showHistory={showHistory}
      />

      {showHistory ? (
        <PaymentHistory isLoading={false} orders={[]} />
      ) : (
        isLoadingCredits?(
          <>
          <div className="gap-6 grid sm:grid-cols-2 md:grid-cols-3">
            {
                [...Array(3)].map((_, index) => (
                    <div key={index} className="h-64 animate-pulse rounded-lg bg-muted"/>
                ))
            }
            </div>
          </>
        ):(
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {packages?.map((creditPackage) => (
            <CreditPackageCard
              key={creditPackage._id}
              package={creditPackage}
              onSelect={handleSelected}
              isLoading={isLoadingCredits}
              isSelected={selectedPackageId === creditPackage._id}
            />
          ))}
        </div>
        )
        
      )}

      {/* Payment methods selection */}
      {
        selectedPackage&& !showHistory &&(
          <div className="p-6 border border-border rounded">
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Select Payment Platform</h3>
              <div className="space-y-4">
               {/* payment selector */}
               <SelectPaymentSelector onSelectPlatform={handleSelectedPlatform} selectedPlatform={selectedPlatform}/>
                 <div className="border-t pt-6">
                  {
                    selectedPlatform===PaymentPlatform.STRIPE && selectedPackage&&(
                      <StripeCheckoutSection isLoading={isProcessing} onCheckout={handleProcessPayment} package={selectedPackage}/>
                    )
                  }
                 </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default creditsPage;
