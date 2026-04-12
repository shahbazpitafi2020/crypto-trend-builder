import { useState } from "react";
import { useAllPublishedPosts } from "@/hooks/usePosts";
import { timeAgo, getPostImage, placeholderImages } from "@/lib/postUtils";

const fallbackArticles = [
  { title: "God and Bitcoin: Why Christians Are Embracing Cryptocurrency", published_at: null, featured_image_url: null },
  { title: "Bitcoin Climbs to Three-Week High on US-Iran Ceasefire Plan", published_at: null, featured_image_url: null },
  { title: "Bitcoin Bear Market Time Pain Trap Signals Slow Bottom Ahead", published_at: null, featured_image_url: null },
  { title: "Bitcoin Community Reacts to Iran Crypto Toll Reports", published_at: null, featured_image_url: null },
  { title: "Brit Denies Being Bitcoin Creator Named by New York Times", published_at: null, featured_image_url: null },
];

type Tab = "recent" | "popular" | "comments";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<Tab>("recent");
  const { data: posts } = useAllPublishedPosts(10);

  const tabs: { label: string; value: Tab }[] = [
    { label: "Recent", value: "recent" },
    { label: "Popular", value: "popular" },
    { label: "Comments", value: "comments" },
  ];

  const recentArticles = posts && posts.length > 0
    ? posts.slice(0, 5)
    : fallbackArticles;

  const popularArticles = posts && posts.length > 0
    ? [...posts].reverse().slice(0, 5)
    : fallbackArticles;

  const articles = activeTab === "recent" ? recentArticles : popularArticles;

  return (
    <div className="bg-card shadow-sm">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 py-3 text-[13px] font-semibold text-center transition-colors ${
              activeTab === tab.value
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "comments" ? (
          <p className="text-sm text-muted-foreground text-center py-6">No comments yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article, i) => (
              <a key={i} href="#" className="group flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <img
                  src={getPostImage(article, i)}
                  alt={article.title}
                  loading="lazy"
                  className="w-[60px] h-[60px] object-cover flex-shrink-0"
                  width={60}
                  height={60}
                />
                <div className="min-w-0">
                  <h4 className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    ⏱ {article.published_at ? timeAgo(article.published_at) : "Just now"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
