"use client";

import { useEffect } from "react";

interface AdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export function AdSense({ 
  adSlot, 
  adFormat = "auto", 
  adStyle = { display: "block" },
  className = "",
  responsive = true 
}: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense client ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// Banner Ad Component
export function AdSenseBanner({ adSlot, className = "" }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="auto"
      adStyle={{ display: "block", width: "100%", height: "90px" }}
      className={`banner-ad ${className}`}
    />
  );
}

// Rectangle Ad Component
export function AdSenseRectangle({ adSlot, className = "" }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="rectangle"
      adStyle={{ display: "block", width: "300px", height: "250px" }}
      className={`rectangle-ad ${className}`}
    />
  );
}

// Responsive Ad Component
export function AdSenseResponsive({ adSlot, className = "" }: { adSlot: string; className?: string }) {
  return (
    <AdSense
      adSlot={adSlot}
      adFormat="auto"
      adStyle={{ display: "block" }}
      className={`responsive-ad ${className}`}
      responsive={true}
    />
  );
}
