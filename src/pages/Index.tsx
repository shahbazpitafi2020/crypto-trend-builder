import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Ye line zaroori hai
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingUp } from "lucide-react";

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

  const latestPostTitle = posts.length > 0 ? posts[0].title : "Crypto Uptrend";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Helmet>
        <title>{latestPostTitle} | Crypto Uptrend</title>
      </Helmet>

      <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            <span className="font-bold text-xl tracking-tight">Crypto<span className="text-blue-600">Uptrend</span></span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Breaking News</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-xl transition-shadow border-none shadow-md overflow-hidden bg-white">
                <CardHeader>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <Badge variant="secondary">Crypto News</Badge>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <CardTitle className="text-xl font-bold leading-tight">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3 mb-6">{post.content}</p>
                  
                  {/* --- DYNAMIC LINK YAHAN HAI --- */}
                  <div className="pt-4 border-t flex justify-end">
                    <Link 
                      to={`/post/${post.slug}`} 
                      className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
                    >
                      Read Full Story →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
