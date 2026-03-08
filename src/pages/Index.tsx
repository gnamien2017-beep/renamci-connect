import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import GradesSection from "@/components/GradesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <GradesSection />
      <Footer />
    </div>
  );
};

export default Index;
