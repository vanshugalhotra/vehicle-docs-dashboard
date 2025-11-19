"use client";

import { AppText } from "@/components/ui/AppText";
import { LayoutDashboard, Activity, Clock } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  date: string;
  time: string;
}

export function HeroSection({ title, subtitle, date, time }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-linear-to-br from-primary/5 via-surface to-primary/5 border-b border-border">
      {/* Floating Blur Background Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-info/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          {/* Left Block */}
          <div className="space-y-3">
            {/* Title Row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-text-primary via-primary to-text-primary bg-clip-text text-transparent">
                  {title}
                </h1>

                <AppText
                  size="body"
                  variant="muted"
                  className="flex items-center gap-2 mt-1"
                >
                  <Activity className="w-4 h-4" />
                  {subtitle}
                </AppText>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/80 backdrop-blur-sm rounded-lg border border-border-subtle">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{date}</span>
              </div>

              <div className="px-3 py-1.5 bg-surface/80 backdrop-blur-sm rounded-lg border border-border-subtle">
                <span className="font-mono font-medium">{time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
