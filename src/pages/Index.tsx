import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Globe, Zap, ArrowRight } from "lucide-react";

const Index = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
      <Helmet>
        <title>CryptoUptrend | Global Crypto Insights</title>
      </Helmet>

      {/* --- Top Navbar --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <TrendingUp size={24} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">
              Crypto<span className="text-blue-600">Uptrend</span>
            </span>
          </div>
          <div className="hidden md:flex gap-8 font-medium text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors">Market</Link>
            <Link to="/" className="hover:text-blue-600 transition-colors">Bitcoin</Link>
            <Link to="/" className="hover:text-blue-600 transition-colors">Altcoins</Link>
            <Link to="/admin" className="text-blue-600 font-bold border-l pl-8">Admin</Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="bg-slate-900 text-white py-20 px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <Badge className="bg-blue-600 mb-4 hover:bg-blue-700">EXCLUSIVE UPDATE</Badge>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
              Leading the <span className="text-blue-500 underline decoration-4 underline-offset-8">Crypto</span> Revolution.
            </h1>
            <p className="text-slate-400 text-lg md:text-xl mb-8 leading-relaxed max-w-lg">
              Real-time analysis, breaking news, and deep-dives into the future of digital finance.
            </p>
          </div>
          <div className="hidden md:block">
             <div className="bg-gradient-to-tr from-blue-600/20 to-purple-600/20 p-1 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="p-8 bg-slate-900/50 rounded-3xl border border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Live Sentiment</span>
                        <div className="flex gap-1">
                            <div className="h-1 w-8 bg-blue-600 rounded"></div>
                            <div className="h-1 w-8 bg-slate-700 rounded"></div>
                        </div>
                    </div>
                    <div className="text-4xl font-mono font-bold text-blue-400 mb-2">BULLISH 78%</div>
                    <p className="text-sm text-slate-500 leading-relaxed">The global market cap is surging as institutional adoption reaches new heights in Q2 2026.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- Main News Feed --- */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-12">
            <Zap className="text-blue-600 fill-blue-600" size={24} />
            <h2 className="text-3xl font-bold tracking-tight">The Latest Wire</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <Card key={post.id} className="group hover:border-blue-200 transition-all border-slate-100 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden border-2">
                <CardContent className="p-0">
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-slate-200">{post.category || 'MARKET'}</Badge>
                      <span className="text-xs text-slate-400 font-medium">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                      {post.content}
                    </p>
                    <Link 
                      to={`/post/${post.slug}`} 
                      className="inline-flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider group-hover:gap-4 transition-all"
                    >
                      Full Analysis <ArrowRight size={16} />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-3xl">
            <Globe className="mx-auto text-slate-300 mb-6" size={60} />
            <h3 className="text-xl font-bold text-slate-400 italic">No broadcasts recorded yet...</h3>
            <p className="text-slate-400 mt-2">Enter the Control Room to publish your first update.</p>
            <Link to="/admin">
                <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Go to Admin</button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
