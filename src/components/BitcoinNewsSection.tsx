import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { timeAgo, getPostImage } from "@/lib/postUtils";

// Typescript interface for better coding
interface Post {
  title: string;
  excerpt?: string;
  category?: string;
  published_at: string | null;
  featured_image_url: string | null;
  slug: string;
}

const fallbackFeatured: Post = {
  title: "God and Bitcoin: Why Christians Are Embracing Cryptocurrency",
  excerpt: "In recent years, an unexpected conversation has emerged at the intersection of faith and finance...",
  category: "Bitcoin News",
  published_at: null,
  featured_image_url: null,
  slug: "#",
};

const BitcoinNewsSection = () => {
  const { data: posts } = usePosts("Bitcoin News", 5);
  
  // Data handling
  const featured = posts && posts.length > 0 ? (posts[0] as Post) : fallbackFeatured;
  const sideArticles = posts && posts.length > 1 ? (posts.slice(1, 5) as Post[]) : [];

  return (
    <section id="bitcoin-news" aria-labelledby="bitcoin-heading">
      <div className="bg-card shadow-sm border border-border/50">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 id="bitcoin-heading" className="text-base font-semibold text-section-title flex items-center gap-1.5">
            <span className="text-lg" aria-hidden="true">₿</span> Bitcoin News
          </h2>
          <div className="flex items-center gap-1">
            <button aria-label="Previous" className="w-6 h-6 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft size={14} /></button>
            <button aria-label="Next" className="w-6 h-6 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
        <div className="px-5"><div className="w-[120px] h-[3px] bg-section-title" /></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          {/* Featured Article with Schema.org */}
          <article itemScope itemType="http://schema.org/NewsArticle">
            <Link to={featured.slug !== "#" ? `/post/${featured.slug}` : "#"} className="group block">
              <div className="relative overflow-hidden mb-3 bg-muted">
                <img 
                  itemProp="image"
                  src={getPostImage(featured, 0)} 
                  alt={`Analysis of ${featured.title}`} // SEO: Better Alt text
                  loading="lazy" 
                  className="w-full h-[220px] object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute bottom-3 right-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-primary text-primary-foreground uppercase">{featured.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                <span itemProp="author">Crypto Trend Staff</span>
                <span>⏱ <time itemProp="datePublished" dateTime={featured.published_at || ""}>
                  {featured.published_at ? timeAgo(featured.published_at) : "Just now"}
                </time></span>
              </div>
              <h3 itemProp="headline" className="text-[16px] font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-2">
                {featured.title}
              </h3>
              <p itemProp="description" className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                {featured.excerpt || "Read the latest updates and technical analysis on Bitcoin price trends and market sentiment."}
              </p>
            </Link>
          </article>

          {/* Side Articles */}
          <div className="flex flex-col gap-4">
            {sideArticles.map((article, i) => (
              <article key={i} itemScope itemType="http://schema.org/NewsArticle" className="group flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <img 
                  itemProp="image"
                  src={getPostImage(article, i + 1)} 
                  alt={article.title} 
                  className="w-[100px] h-[70px] object-cover flex-shrink-0 bg-muted" 
                />
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground mb-1">
                    ⏱ <time itemProp="datePublished">{article.published_at ? timeAgo(article.published_at) : "Just now"}</time>
                  </div>
                  <h4 itemProp="headline" className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    <Link to={`/post/${article.slug}`}>{article.title}</Link>
                  </h4>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BitcoinNewsSection;
