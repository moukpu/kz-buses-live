"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { MapLoadingState } from "@/components/MapLoadingState";
import type { BusPosition, City, Route } from "@/types/transit";

const BusMap = dynamic(() => import("@/components/BusMap"), {
  ssr: false,
  loading: () => <BusMapFallback />,
});

function BusMapFallback(): React.ReactElement {
  const t = useTranslations("city");
  return <MapLoadingState label={t("mapFallback")} />;
}

interface BusMapClientProps {
  city: City;
  positions: readonly BusPosition[];
  highlightedRoute?: Route | null;
  onSelectBus?: (busId: string) => void;
  showStops?: boolean;
}

export function BusMapClient(props: BusMapClientProps): React.ReactElement {
  return <BusMap {...props} />;
}
