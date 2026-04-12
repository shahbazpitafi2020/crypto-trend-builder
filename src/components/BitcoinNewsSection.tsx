import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { timeAgo, getPostImage, placeholderImages } from "@/lib/postUtils";

const fallbackFeatured = {
  title: "God and Bitcoin: Why Christians Are Embracing Cryptocurrency",
  excerpt: "In recent years, an unexpected conversation has emerged at the intersection of faith and finance. God and Bitcoin: why some Christians are using crypto as an expression of their beliefs, supporting missions, and envisioning a financial system aligned to...",
  category: "Bitcoin News",
  published_at: null,
  featured_image_url: null,
};

const fallbackSide = [
  { title: "Bitcoin Climbs to Three-Week High on US-Iran Ceasefire Plan", published_at: null, featured_image_url: null },
  { title: "Bitcoin Bear Market Time Pain Trap Signals Slow Bottom Ahead", published_at: null, featured_image_url: null },
  { title: "Bitcoin Community Reacts to Iran Crypto Toll Reports", published_at: null, featured_image_url: null },
  { title: "Brit Denies Being Bitcoin Creator Named by New York Times", published_at: null, featured_image_url: null },
];

const BitcoinNewsSection = () => {
  const { data: posts } = usePosts("Bitcoin News", 5);

  const featured = posts && posts.length > 0 ? posts[0] : fallbackFeatured;
  const sideArticles = posts && posts.length > 1 ? posts.slice(1, 5) : fallbackSide;

  return (
    <section id="bitcoin-news">
      <div className="bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-section-title flex items-center gap-1.5">
              <span className="text-lg">₿</span> Bitcoin News
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-primary font-medium cursor-pointer">All</span>
              <span className="mx-1">·</span>
              <span className="cursor-pointer hover:text-primary transition-colors">Bitcoin News</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button className="w-6 h-6 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5">
          <div className="w-[120px] h-[3px] bg-section-title" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          <div>
            <a href="#" className="group block">
              <div className="relative overflow-hidden mb-3">
                <img
                  src={getPostImage(featured, 0)}
                  alt={featured.title}
                  loading="lazy"
                  className="w-full h-[220px] object-cover group-hover:scale-105 transition-transform duration-500"
                  width={800}
                  height={512}
                />
                <div className="absolute bottom-3 right-3">
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-primary text-primary-foreground">
                    {featured.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                <span>cryptoUptrend Staff</span>
                <span>⏱ {featured.published_at ? timeAgo(featured.published_at) : "Just now"}</span>
              </div>
              <h3 className="text-[15px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors mb-2">
                {featured.title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                {featured.excerpt || ""}
              </p>
            </a>
            <a
              href="#"
              className="inline-block mt-4 text-xs font-semibold uppercase text-primary-foreground bg-primary px-4 py-2 hover:opacity-90 transition-opacity"
            >
              Read More »
            </a>
          </div>

          <div className="flex flex-col gap-4">
            {sideArticles.map((article, i) => (
              <a key={i} href="#" className="group flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <img
                  src={getPostImage(article, i + 1)}
                  alt={article.title}
                  loading="lazy"
                  className="w-[100px] h-[70px] object-cover flex-shrink-0"
                  width={100}
                  height={70}
                />
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground mb-1">
                    ⏱ {article.published_at ? timeAgo(article.published_at) : "Just now"}
                  </div>
                  <h4 className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BitcoinNewsSection;
