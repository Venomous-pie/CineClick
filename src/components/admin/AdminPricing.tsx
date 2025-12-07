import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Save, DollarSign } from "lucide-react";

interface AdminPricingProps {
  onRefresh?: () => void;
}

interface PricingConfig {
  [key: string]: {
    value: number;
    description: string;
    id: number;
  };
}

const AdminPricing = ({ onRefresh }: AdminPricingProps) => {
  const [pricing, setPricing] = useState<PricingConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, number>>({});

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPricing();
      if (response.success && response.pricing) {
        setPricing(response.pricing);
        // Initialize form data with current values
        const initialData: Record<string, number> = {};
        Object.keys(response.pricing).forEach((key) => {
          initialData[key] = response.pricing[key].value;
        });
        setFormData(initialData);
      }
    } catch (error: any) {
      console.error("Error loading pricing:", error);
      toast({
        title: "Error",
        description: "Failed to load pricing configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData({ ...formData, [key]: numValue });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminService.updatePricing(formData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Pricing updated successfully",
        });
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((error) => {
            toast({
              title: "Warning",
              description: error,
              variant: "destructive",
            });
          });
        }
        loadPricing();
        onRefresh?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getLabel = (key: string): string => {
    const labels: Record<string, string> = {
      base_price: "Base Price (₱)",
      room_basic_multiplier: "Basic Room Multiplier",
      room_3d_multiplier: "3D Room Multiplier",
      room_premium_multiplier: "Premium Room Multiplier",
      room_vip_multiplier: "VIP Room Multiplier",
    };
    return labels[key] || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const calculatePrice = (key: string, value: number): number => {
    if (key === "base_price") {
      return value;
    }
    const basePrice = formData.base_price || pricing.base_price?.value || 250;
    return Math.round(basePrice * value);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading pricing configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pricing Management</h2>
          <p className="text-muted-foreground">Configure base price and room multipliers</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Base Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Base Price</CardTitle>
              </div>
              <CardDescription>
                {pricing.base_price?.description || "Base ticket price in PHP"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">{getLabel("base_price")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    id="base_price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.base_price || 0}
                    onChange={(e) => handleChange("base_price", e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This is the base price used for all ticket calculations
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Room Multipliers */}
        {Object.keys(pricing)
          .filter((key) => key.startsWith("room_") && key.endsWith("_multiplier"))
          .map((key, index) => {
            const roomType = key.replace("room_", "").replace("_multiplier", "");
            const roomName =
              roomType === "basic"
                ? "Basic"
                : roomType === "3d"
                ? "3D"
                : roomType === "premium"
                ? "Premium"
                : "VIP";

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{roomName} Room</CardTitle>
                    <CardDescription>
                      {pricing[key]?.description || `${roomName} room price multiplier`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={key}>Price Multiplier</Label>
                      <Input
                        id={key}
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData[key] || 0}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Current price: ₱{calculatePrice(key, formData[key] || pricing[key]?.value || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Formula: Base Price × Multiplier = {roomName} Room Price
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </div>

      {/* Price Preview */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Price Preview</CardTitle>
          <CardDescription>See how prices will look with current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Basic</p>
              <p className="text-2xl font-bold text-foreground">
                ₱{calculatePrice("room_basic_multiplier", formData.room_basic_multiplier || pricing.room_basic_multiplier?.value || 1)}
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">3D</p>
              <p className="text-2xl font-bold text-foreground">
                ₱{calculatePrice("room_3d_multiplier", formData.room_3d_multiplier || pricing.room_3d_multiplier?.value || 1.3)}
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Premium</p>
              <p className="text-2xl font-bold text-foreground">
                ₱{calculatePrice("room_premium_multiplier", formData.room_premium_multiplier || pricing.room_premium_multiplier?.value || 1.8)}
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">VIP</p>
              <p className="text-2xl font-bold text-foreground">
                ₱{calculatePrice("room_vip_multiplier", formData.room_vip_multiplier || pricing.room_vip_multiplier?.value || 2.5)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPricing;

