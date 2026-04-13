import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Plus, Send, Trash2, Shield, Edit3, LogOut } from "lucide-react";
import { Navigate } from "react-router-dom";

const CATEGORIES = ["Bitcoin News", "Altcoin Updates", "AI & Web3", "Market Analysis"];

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

const Admin = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, isEditor, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("posts").insert({
      title,
      slug: generateSlug(title),
      content,
      excerpt: excerpt || null,
      category,
      published: false,
      user_id: user.id,
    });

    if (!error) {
      toast({ title: "Draft Submitted!", description: "Your article has been sent for admin approval." });
      setTitle("");
      setContent("");
      setExcerpt("");
      setCategory(CATEGORIES[0]);
      setShowForm(false);
      fetchPosts();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleApprove = async (id: string) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from("posts")
      .update({ published: true, published_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) {
      toast({ title: "Published!", description: "Post is now live on the website." });
      fetchPosts();
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from("posts")
      .update({ published: false })
      .eq("id", id);
    if (!error) {
      toast({ title: "Unpublished", description: "Post moved back to drafts." });
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) {
      toast({ title: "Deleted", description: "Post has been removed." });
      fetchPosts();
    }
  };

  if (!user) return <Navigate to="/auth" replace />;
  if (roleLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <Shield className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this dashboard. Contact the admin to get a role assigned.</p>
          <Button variant="outline" onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CryptoUptrend Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Admin" : "Editor"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
              {showForm ? "Cancel" : <><Plus className="mr-2" size={16} /> New Article</>}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
              <Edit3 size={18} /> Write New Article
            </h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Input placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Input placeholder="Short excerpt (optional)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea placeholder="Write your crypto news content..." className="min-h-[200px]" value={content} onChange={(e) => setContent(e.target.value)} required />
              <Button type="submit" className="w-full">
                <Send className="mr-2" size={16} /> Submit Draft for Approval
              </Button>
            </form>
          </div>
        )}

        {/* Posts Table */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Article</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground text-center">Status</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : posts.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No posts yet. Create your first article!</td></tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{post.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                      </td>
                      <td className="p-4">
                        <span className={`mx-auto px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                          post.published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {post.published ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {post.published ? "LIVE" : "DRAFT"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && !post.published && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(post.id)}>
                              Approve
                            </Button>
                          )}
                          {isAdmin && post.published && (
                            <Button size="sm" variant="outline" onClick={() => handleUnpublish(post.id)}>
                              Unpublish
                            </Button>
                          )}
                          {(isAdmin || (!post.published && post.user_id === user?.id)) && (
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                              <Trash2 size={14} />
                            </Button>
                          )}
                          {!isAdmin && post.published && (
                            <span className="text-xs text-muted-foreground">Live ✅</span>
                          )}
                          {!isAdmin && !post.published && post.user_id !== user?.id && (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
