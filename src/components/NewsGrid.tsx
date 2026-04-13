import { Link } from "react-router-dom";
import { useAllPublishedPosts } from "@/hooks/usePosts";
import { timeAgo, getPostImage } from "@/lib/postUtils";

const fallbackSlides = [
  { title: "God and Bitcoin: Why Christians Are Embracing Cryptocurrency", excerpt: "In recent years, an unexpected conversation has emerged at the intersection of faith and finance…", category: "Bitcoin News", published_at: null, featured_image_url: null, slug: "#" },
  { title: "Bitcoin Climbs to Three-Week High on US-Iran Ceasefire Plan", category: "Bitcoin News", published_at: null, featured_image_url: null, excerpt: null, slug: "#" },
  { title: "Bitcoin Bear Market Time Pain Trap Signals Slow Bottom Ahead", category: "Bitcoin News", published_at: null, featured_image_url: null, excerpt: null, slug: "#" },
  { title: "Bitcoin Community Reacts to Iran Crypto Toll Reports", category: "Bitcoin News", published_at: null, featured_image_url: null, excerpt: null, slug: "#" },
  { title: "Brit Denies Being Bitcoin Creator Named by New York Times", category: "Bitcoin News", published_at: null, featured_image_url: null, excerpt: null, slug: "#" },
];

const NewsGrid = () => {
  const { data: posts } = useAllPublishedPosts(5);
  const slides = posts && posts.length >= 5 ? posts.slice(0, 5) : fallbackSlides;

  return (
    <section className="container py-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] bg-foreground/10">
        <Link
          to={slides[0].slug !== "#" ? `/post/${slides[0].slug}` : "#"}
          className="relative block overflow-hidden md:row-span-2 group min-h-[300px] lg:min-h-[420px]"
        >
          <img src={getPostImage(slides[0], 0)} alt={slides[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" width={800} height={512} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-primary text-primary-foreground">{slides[0].category}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="text-xs text-card/70 mb-2">⏱ {slides[0].published_at ? timeAgo(slides[0].published_at) : "Just now"}</div>
            <h2 className="text-xl lg:text-2xl font-semibold text-card leading-snug mb-2">{slides[0].title}</h2>
            {slides[0].excerpt && <p className="text-sm text-card/70 line-clamp-2">{slides[0].excerpt}</p>}
          </div>
        </Link>

        {slides.slice(1).map((slide, i) => (
          <Link key={i} to={slide.slug !== "#" ? `/post/${slide.slug}` : "#"} className="relative block overflow-hidden group min-h-[200px] lg:min-h-[208px]">
            <img src={getPostImage(slide, i + 1)} alt={slide.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" width={800} height={512} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="inline-block text-[11px] font-semibold px-2 py-0.5 bg-primary text-primary-foreground">{slide.category}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="text-[11px] text-card/70 mb-1.5">⏱ {slide.published_at ? timeAgo(slide.published_at) : "Just now"}</div>
              <h3 className="text-sm lg:text-[15px] font-semibold text-card leading-snug">{slide.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewsGrid;
