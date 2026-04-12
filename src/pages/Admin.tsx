import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, Plus, Send, Eye } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ADMIN EMAIL - Sirf aapka access
  const ADMIN_EMAIL = "shahbazpitafi2020@gmail.com"; 
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    // Team member jo bhi likhega, published hamesha 'false' rahega
    const { error } = await supabase.from("posts").insert({
      title,
      content,
      published: false, 
      user_id: user?.id
    });

    if (!error) {
      toast({ title: "Submitted!", description: "Article Admin (Tahir) ko approval ke liye bhej diya gaya hai." });
      setTitle(""); setContent(""); setShowForm(false);
      fetchPosts();
    }
  };

  const handleApprove = async (id: string) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("posts").update({ published: true }).eq("id", id);
    if (!error) {
      toast({ title: "Approved!", description: "Post ab website par live hai." });
      fetchPosts();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Khabar Crypto Dashboard</h1>
            <p className="text-sm text-gray-500">Logged in as: {user?.email} {isAdmin ? "(Admin)" : "(Team Member)"}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : <><Plus className="mr-2" size={16}/> New Article</>}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-600">Write New Article</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Input placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea placeholder="Write crypto news content..." className="min-h-[200px]" value={content} onChange={(e) => setContent(e.target.value)} required />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                <Send className="mr-2" size={16}/> Submit for Tahir's Approval
              </Button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{post.title}</td>
                  <td className="p-4">
                    <span className={`mx-auto px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {post.published ? <CheckCircle size={12}/> : <Clock size={12}/>}
                      {post.published ? 'LIVE' : 'PENDING'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {!post.published && isAdmin ? (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(post.id)}>
                        Approve & Publish
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-sm flex items-center justify-end gap-1">
                        {post.published ? "Live Site ✅" : "Waiting for Tahir"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
