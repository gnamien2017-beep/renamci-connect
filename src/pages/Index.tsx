import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import CorpsMetierSection from "@/components/CorpsMetierSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <CorpsMetierSection />
      <Footer />
    </div>
  );
};

export default Index;
