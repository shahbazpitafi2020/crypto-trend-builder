import Navbar from "@/components/Navbar";
import NewsGrid from "@/components/NewsGrid";
import BitcoinNewsSection from "@/components/BitcoinNewsSection";
import Sidebar from "@/components/Sidebar";
import AltcoinSection from "@/components/AltcoinSection";
import AIWeb3Section from "@/components/AIWeb3Section";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-6">
        <NewsGrid />

        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BitcoinNewsSection />
            </div>
            <div>
              <Sidebar />
            </div>
          </div>
        </div>

        <AltcoinSection />
        <AIWeb3Section />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
