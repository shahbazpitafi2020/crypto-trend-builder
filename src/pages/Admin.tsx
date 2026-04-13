import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  PlusCircle, 
  CheckCircle, 
  LogOut,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("editor");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const navigate = useNavigate();

  const ADMIN_EMAIL = "shahbazpitafi2020@gmail.com";

  useEffect(() => {
    getInitialSession();
  }, []);

  const getInitialSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    fetchProfileAndPosts(session.user);
  };

  const fetchProfileAndPosts = async (currentUser: any) => {
    // 1. Fetch User Role from Profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    const userRole = profile?.role || "editor";
    setRole(userRole);

    // 2. Fetch Posts based on Role
    let query = supabase.from("posts").select("*").order("created_at", { ascending: false });
    
    // Admin sab dekh sakta hai, Editor sirf apni posts
    if (userRole !== 'admin' && currentUser.email !== ADMIN_EMAIL) {
      query = query.eq('author_id', currentUser.id);
    }

    const { data: postsData } = await query;
    setPosts(postsData || []);
    setLoading(false);
  };

  const handlePublish = async (postId: string) => {
    const { error } = await supabase
      .from("posts")
      .update({ published: true, status: 'published' })
      .eq("id", postId);

    if (error) {
      toast.error("Error publishing post");
    } else {
      toast.success("Article Live ho gaya!");
      fetchProfileAndPosts(user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Initializing System...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-6">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-10">
            <ShieldCheck /> CryptoAdmin
          </div>
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2"><LayoutDashboard size={18}/> Dashboard</Button>
            <Button variant="ghost" className="w-full justify-start gap-2"><FileText size={18}/> Articles</Button>
            {role === 'admin' && (
              <Button variant="ghost" className="w-full justify-start gap-2 text-red-600"><Users size={18}/> Team Management</Button>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.email === ADMIN_EMAIL ? "Shahbaz Bhai" : "Editor"}</h1>
            <p className="text-sm text-gray-500">System Role: <Badge className="ml-2 uppercase">{role}</Badge></p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/")} variant="outline">View Site</Button>
            <Button onClick={handleLogout} variant="destructive" size="icon"><LogOut size={18}/></Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {posts.filter(p => !p.published).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Post Management Table */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Content Management</CardTitle>
            <Button className="gap-2"><PlusCircle size={18}/> New Article</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-400">
                    <th className="pb-4 font-medium">Post Title</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {posts.map((post) => (
                    <tr key={post.id} className="text-sm hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-semibold text-gray-700">{post.title}</td>
                      <td className="py-4">
                        {post.published ? 
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Live</Badge> : 
                          <Badge variant="outline" className="text-orange-500 border-orange-200">Draft</Badge>
                        }
                      </td>
                      <td className="py-4 text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="py-4">
                        {role === 'admin' && !post.published && (
                          <Button 
                            onClick={() => handlePublish(post.id)}
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 gap-1"
                          >
                            <CheckCircle size={14}/> Approve
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="ml-2">Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
