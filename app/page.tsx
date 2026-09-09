import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SimulationsSection from "@/components/SimulationsSection";
import ProductSection from "@/components/ProductSection";
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
        <SimulationsSection />
        <ProductSection />
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
