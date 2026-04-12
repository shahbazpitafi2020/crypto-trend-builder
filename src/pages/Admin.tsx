import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, LogOut, Eye, EyeOff, Image } from "lucide-react";
import type { Post } from "@/hooks/usePosts";

const CATEGORIES = [
  "Bitcoin News",
  "Altcoin Update",
  "AI & Web3",
  "Market Analysis",
  "DeFi",
  "NFT",
  "Regulation",
];

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Bitcoin News");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPosts((data as Post[]) || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const resetForm = () => {
    setTitle("");
    setContent("");
    setExcerpt("");
    setCategory("Bitcoin News");
    setFeaturedImageUrl("");
    setPublished(false);
    setEditingPost(null);
    setShowForm(false);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setExcerpt(post.excerpt || "");
    setCategory(post.category);
    setFeaturedImageUrl(post.featured_image_url || "");
    setPublished(post.published);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({ title: "Error", description: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(fileName);

    setFeaturedImageUrl(urlData.publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded successfully" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const slug = generateSlug(title);
    const postData = {
      title: title.trim(),
      slug,
      content: content.trim(),
      excerpt: excerpt.trim() || null,
      category,
      featured_image_url: featuredImageUrl || null,
      published,
      published_at: published ? new Date().toISOString() : null,
      user_id: user.id,
    };

    let error;
    if (editingPost) {
      ({ error } = await supabase.from("posts").update(postData).eq("id", editingPost.id));
    } else {
      ({ error } = await supabase.from("posts").insert(postData));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingPost ? "Post updated" : "Post created" });
      resetForm();
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post deleted" });
      fetchPosts();
    }
  };

  const togglePublish = async (post: Post) => {
    const newPublished = !post.published;
    const { error } = await supabase
      .from("posts")
      .update({
        published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
      })
      .eq("id", post.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newPublished ? "Post published" : "Post unpublished" });
      fetchPosts();
    }
  };

  if (authLoading || (!user && !authLoading)) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-nav text-nav-foreground">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">
            <span className="text-primary">Crypto</span>Uptrend Admin
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-nav-foreground/60">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut} className="text-nav-foreground border-nav-foreground/20 hover:bg-nav-foreground/10">
              <LogOut size={14} className="mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Posts ({posts.length})
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              View Site
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus size={14} className="mr-1" /> New Post
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card border border-border p-6 mb-6 shadow-sm">
            <h3 className="text-base font-semibold mb-4">
              {editingPost ? "Edit Post" : "Create New Post"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Enter post title" maxLength={255} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief description for cards and previews" maxLength={500} />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Write your post content here..." className="min-h-[200px]" />
              </div>

              <div>
                <Label>Featured Image</Label>
                <div className="flex items-start gap-4 mt-1">
                  <div className="flex-1">
                    <label htmlFor="image-upload" className="flex items-center gap-2 px-4 py-2 border border-dashed border-input rounded-md cursor-pointer hover:bg-muted transition-colors">
                      <Image size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {uploading ? "Uploading..." : "Click to upload image (max 5MB)"}
                      </span>
                    </label>
                    <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    {featuredImageUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <Input value={featuredImageUrl} onChange={(e) => setFeaturedImageUrl(e.target.value)} placeholder="Or paste image URL" className="text-xs" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => setFeaturedImageUrl("")}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                  {featuredImageUrl && (
                    <img src={featuredImageUrl} alt="Preview" className="w-24 h-16 object-cover rounded border border-border" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded" />
                <Label htmlFor="published" className="cursor-pointer">Publish immediately</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingPost ? "Update Post" : "Create Post"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading posts...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No posts yet</p>
            <p className="text-sm">Click "New Post" to create your first article.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 bg-card border border-border p-4 shadow-sm">
                {post.featured_image_url && (
                  <img src={post.featured_image_url} alt="" className="w-16 h-12 object-cover rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate">{post.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">{post.category}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${post.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => togglePublish(post)} title={post.published ? "Unpublish" : "Publish"}>
                    {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                    <Edit size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
