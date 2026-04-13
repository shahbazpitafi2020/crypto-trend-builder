import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { timeAgo, getPostImage } from "@/lib/postUtils";
import { usePosts } from "@/hooks/usePosts";
import { ArrowLeft } from "lucide-react";

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts } = usePosts(post?.category, 4);
  const related = relatedPosts?.filter((p) => p.id !== post?.id).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center text-muted-foreground">Loading article...</div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-primary hover:underline font-medium">← Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* SEO: JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: post.title,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            description: post.excerpt || "",
            image: post.featured_image_url || undefined,
            author: { "@type": "Organization", name: "CryptoUptrend" },
          }),
        }}
      />

      <article className="container py-8 max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="mb-4">
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-primary text-primary-foreground">
            {post.category}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <span>CryptoUptrend Staff</span>
          <span>•</span>
          <span>{post.published_at ? timeAgo(post.published_at) : "Just now"}</span>
        </div>

        {post.featured_image_url && (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-auto max-h-[450px] object-cover mb-8"
          />
        )}

        <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {/* Related Posts */}
      {related && related.length > 0 && (
        <section className="container max-w-4xl mx-auto py-8 border-t border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((rp, i) => (
              <Link key={rp.id} to={`/post/${rp.slug}`} className="group block">
                <img
                  src={getPostImage(rp, i)}
                  alt={rp.title}
                  className="w-full h-[140px] object-cover mb-2 group-hover:scale-[1.02] transition-transform"
                  loading="lazy"
                />
                <span className="text-[11px] text-muted-foreground">
                  {rp.published_at ? timeAgo(rp.published_at) : "Just now"}
                </span>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {rp.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default PostPage;
