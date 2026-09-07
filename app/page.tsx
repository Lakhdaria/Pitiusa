import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import ParticleShowcaseSection from "@/components/ParticleShowcaseSection";
import AnatomySection from "@/components/AnatomySection";
import CarouselSection from "@/components/CarouselSection";
import UsesSection from "@/components/UsesSection";
import StorySection from "@/components/StorySection";
import PressSection from "@/components/PressSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductSection />
        <ParticleShowcaseSection />
        <AnatomySection />
        <CarouselSection />
        <UsesSection />
        <StorySection />
        <PressSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
