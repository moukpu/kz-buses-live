import { CitiesGrid } from "@/components/CitiesGrid";
import { HomeFAQ } from "@/components/HomeFAQ";
import { HomeFeatures } from "@/components/HomeFeatures";
import { HomeHero } from "@/components/HomeHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default async function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <SiteHeader activeSlug={null} />
      <main>
        <HomeHero />
        <HomeFeatures />
        <CitiesGrid />
        <HomeFAQ />
      </main>
      <SiteFooter />
    </div>
  );
}
