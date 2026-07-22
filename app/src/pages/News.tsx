import { useState } from "react";
import { Calendar, Newspaper, Trophy, Bell, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { trpc } from "@/providers/trpc";

const categoryIcons: Record<string, any> = {
  news: Newspaper,
  event: PartyPopper,
  achievement: Trophy,
  announcement: Bell,
};

export default function News() {
  const { data: newsItems } = trpc.public.news.list.useQuery();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = (newsItems || []).filter(
    (n) => activeCategory === "all" || n.category === activeCategory
  );

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-brand-dark via-brand to-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white font-display">
            News & <span className="text-gradient-gold">Events</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
            Stay updated with the latest happenings at Pacemaker Institute.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-brand-light border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto">
            {["all", "news", "event", "achievement", "announcement"].map((cat) => {
              const Icon = categoryIcons[cat] || Newspaper;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? "bg-brand text-white"
                      : "bg-white text-muted-foreground hover:bg-brand/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="py-12 bg-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:h-auto bg-gradient-to-br from-brand-dark to-brand flex items-center justify-center">
                  <div className="text-center">
                    <span
                      className="inline-block px-4 py-1.5 text-xs font-medium rounded-full text-white mb-4"
                      style={{ backgroundColor: "hsl(var(--brand))" }}
                    >
                      {featured.category.toUpperCase()}
                    </span>
                    <div className="text-8xl font-bold text-white/10 font-display">
                      {featured.category.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
                <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    {featured.publishedAt
                      ? new Date(featured.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently"}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-display">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">By {featured.authorName}</span>
                    {featured.eventDate && (
                      <span className="text-sm text-brand font-medium">
                        Event: {new Date(featured.eventDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* News Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((item) => {
              const Icon = categoryIcons[item.category] || Newspaper;
              return (
                <Card
                  key={item.id}
                  className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="h-48 bg-gradient-to-br from-brand-dark to-brand flex items-center justify-center">
                    <Icon className="w-16 h-16 text-white/20" />
                  </div>
                  <CardContent className="p-6">
                    <span
                      className="inline-block px-3 py-1 text-xs font-medium rounded-full text-white mb-3 bg-brand"
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : "Recently"}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 font-display group-hover:text-brand transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {item.excerpt}
                    </p>
                    <span className="text-xs text-muted-foreground">By {item.authorName}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No articles found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
