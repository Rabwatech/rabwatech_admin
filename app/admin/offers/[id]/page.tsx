"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { OfferForm } from "@/components/admin/campaigns/OfferForm";
import { OfferItemsManager } from "@/components/admin/campaigns/OfferItemsManager";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

function OfferDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const offerId = params.id as string;

  // Use controlled state for tabs to prevent infinite loops
  // Initialize from URL param but don't recalculate on every render
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams?.get("tab") || "info";
  });

  // Update activeTab only when searchParams actually changes (but avoid infinite loops)
  useEffect(() => {
    const tab = searchParams?.get("tab") || "info";
    setActiveTab((currentTab) => {
      // Only update if different to prevent unnecessary re-renders
      return tab !== currentTab ? tab : currentTab;
    });
  }, [searchParams]);

  const fetchOffer = async () => {
    if (!offerId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/offers/${offerId}`);
      const data = await response.json();

      if (response.ok) {
        setOffer(data.offer);
      } else {
        toast({
          title: "خطأ",
          description: data.error || "حدث خطأ أثناء جلب بيانات العرض",
          variant: "destructive",
        });
        router.push("/admin/campaigns");
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
      router.push("/admin/campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offerId) {
      fetchOffer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  const handleFormSuccess = () => {
    fetchOffer();
  };

  const getStatusBadge = (offer: any) => {
    if (!offer) return null;
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);

    if (!offer.is_active) {
      return <Badge variant="secondary">معطل</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">قادم</Badge>;
    }

    if (now >= startDate && now <= endDate) {
      return <Badge variant="default">نشط</Badge>;
    }

    return <Badge variant="destructive">منتهي</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!offer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={
                offer.campaign_id
                  ? `/admin/campaigns/${offer.campaign_id}`
                  : "/admin/campaigns"
              }
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {offer.offer_name_ar || offer.offer_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground font-mono">
                {offer.offer_code}
              </span>
              <span className="text-muted-foreground">•</span>
              {getStatusBadge(offer)}
              {offer.sale_price && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {offer.sale_price.toLocaleString("ar-SA", {
                      style: "currency",
                      currency: "SAR",
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="info">معلومات العرض</TabsTrigger>
          <TabsTrigger value="items">عناصر العرض</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <OfferForm
            campaignId={offer.campaign_id}
            offerId={parseInt(offerId)}
            onSuccess={handleFormSuccess}
          />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <OfferItemsManager
            offerId={parseInt(offerId)}
            onUpdate={fetchOffer}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function OfferDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OfferDetailContent />
    </Suspense>
  );
}
