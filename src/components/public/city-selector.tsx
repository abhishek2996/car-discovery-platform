"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UK_CITIES } from "@/lib/constants";

const COOKIE_NAME = "city";

export function getCityCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCityCookie(city: string) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(city)};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function CitySelector() {
  const router = useRouter();
  const [city, setCity] = useState<string>("London");

  useEffect(() => {
    const saved = getCityCookie();
    if (saved && UK_CITIES.includes(saved as (typeof UK_CITIES)[number])) {
      setCity(saved);
    }
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setCity(value);
      setCityCookie(value);
      router.refresh();
    },
    [router],
  );

  return (
    <Select value={city} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-auto gap-1.5 border-none bg-transparent px-2 text-sm font-medium shadow-none focus:ring-0">
        <MapPin className="size-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {UK_CITIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
