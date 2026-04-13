import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import NewsGrid from "@/components/NewsGrid";
import BitcoinNewsSection from "@/components/BitcoinNewsSection";
import Sidebar from "@/components/Sidebar";
import AltcoinSection from "@/components/AltcoinSection";
import AIWeb3Section from "@/components/AIWeb3Section";
import Footer from "@/components/Footer";

const Index = () => {
  // SEO optimization using useEffect
  useEffect(() => {
    document.title = "Crypto Trend Builder | Latest Bitcoin & Altcoin News 2026";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Get real-time crypto trends, AI Web3 insights, and technical analysis on Crypto Trend Builder.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Tip: Make sure your Navbar uses <h1> or <h2> for the main 
          brand name if it's not already there.
      */}
      <Navbar />
      
      <div className="py-6">
        {/* Main Hero News Section */}
        <section aria-label="Top News">
          <NewsGrid />
        </section>

        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <article>
                <BitcoinNewsSection />
              </article>
            </div>
            <aside>
              <Sidebar />
            </aside>
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
