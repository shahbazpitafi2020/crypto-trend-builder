import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle, Clock, Plus, Send, Trash2, Shield, Edit3, LogOut, Users, FileText, UserPlus, X
} from "lucide-react";
import { Navigate } from "react-router-dom";

const CATEGORIES = ["Bitcoin News", "Altcoin Updates", "AI & Web3", "Market Analysis"];

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

const Admin = () => {
  const { user, signOut, signUp } = useAuth();
  const { isAdmin, isEditor, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  // Team management state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "admin">("editor");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPosts();
      if (isAdmin) fetchTeamMembers();
    }
  }, [user, isAdmin]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  const fetchTeamMembers = async () => {
    // Get all roles with profile info
    const { data: roles } = await supabase
      .from("user_roles")
      .select("*");
    
    if (!roles) return;

    const userIds = [...new Set(roles.map(r => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", userIds);

    const members = userIds.map(uid => {
      const profile = profiles?.find(p => p.user_id === uid);
      const userRoles = roles.filter(r => r.user_id === uid).map(r => r.role);
      return {
        user_id: uid,
        display_name: profile?.display_name || "Unknown",
        roles: userRoles,
      };
    });
    setTeamMembers(members);
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
      setTitle(""); setContent(""); setExcerpt(""); setCategory(CATEGORIES[0]); setShowForm(false);
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
    const { error } = await supabase.from("posts").update({ published: false }).eq("id", id);
    if (!error) { toast({ title: "Unpublished" }); fetchPosts(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) { toast({ title: "Deleted" }); fetchPosts(); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      // Sign up the new user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: invitePassword,
        options: { emailRedirectTo: window.location.origin },
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Failed to create user");

      // Assign role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: signUpData.user.id,
        role: inviteRole,
      });
      if (roleError) throw roleError;

      toast({ title: "Team member invited!", description: `${inviteEmail} has been added as ${inviteRole}.` });
      setInviteEmail(""); setInvitePassword(""); setInviteDialogOpen(false);
      fetchTeamMembers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string, newRole: string) => {
    // Delete old role
    await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", currentRole as any);
    // Insert new role
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
    if (!error) {
      toast({ title: "Role updated!" });
      fetchTeamMembers();
    }
  };

  const handleRevokeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (!error) {
      toast({ title: "Role revoked" });
      fetchTeamMembers();
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
          <p className="text-muted-foreground">Contact the admin to get a role assigned.</p>
          <Button variant="outline" onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
        </div>
      </div>
    );
  }

  const drafts = posts.filter(p => !p.published);
  const published = posts.filter(p => p.published);

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CryptoUptrend Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "Admin" : "Editor"}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setShowForm(!showForm); setActiveTab("posts"); }} variant={showForm ? "outline" : "default"}>
              {showForm ? "Cancel" : <><Plus className="mr-2" size={16} /> New Article</>}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut size={18} /></Button>
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
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Write your crypto news content..." className="min-h-[200px]" value={content} onChange={(e) => setContent(e.target.value)} required />
              <Button type="submit" className="w-full"><Send className="mr-2" size={16} /> Submit Draft</Button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts" className="gap-1.5"><FileText size={14} /> Posts</TabsTrigger>
            {isAdmin && <TabsTrigger value="team" className="gap-1.5"><Users size={14} /> Team</TabsTrigger>}
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {/* Drafts */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/50">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Clock size={14} /> Drafts ({drafts.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody>
                    {drafts.length === 0 ? (
                      <tr><td className="p-6 text-center text-muted-foreground text-sm">No drafts</td></tr>
                    ) : drafts.map((post) => (
                      <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{post.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4"><Badge variant="outline" className="text-xs">{post.category}</Badge></td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(post.id)}>
                                Approve & Publish
                              </Button>
                            )}
                            {(isAdmin || post.user_id === user?.id) && (
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Published */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/50">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <CheckCircle size={14} /> Published ({published.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody>
                    {published.length === 0 ? (
                      <tr><td className="p-6 text-center text-muted-foreground text-sm">No published posts</td></tr>
                    ) : published.map((post) => (
                      <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{post.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</p>
                        </td>
                        <td className="p-4"><Badge variant="outline" className="text-xs">{post.category}</Badge></td>
                        <td className="p-4">
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">LIVE</Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin && (
                              <Button size="sm" variant="outline" onClick={() => handleUnpublish(post.id)}>Unpublish</Button>
                            )}
                            {isAdmin && (
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Team Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="team" className="space-y-4">
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Users size={14} /> Team Members ({teamMembers.length})
                  </h3>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm"><UserPlus className="mr-2" size={14} /> Invite Member</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleInvite} className="space-y-4 mt-2">
                        <Input placeholder="Email address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                        <Input placeholder="Temporary password (min 6 chars)" type="password" value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} required minLength={6} />
                        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "editor" | "admin")}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="submit" className="w-full" disabled={inviting}>
                          {inviting ? "Creating..." : "Create & Assign Role"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-4 text-sm font-medium text-muted-foreground">Member</th>
                        <th className="p-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="p-4 text-sm font-medium text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member) => (
                        <tr key={member.user_id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-foreground">{member.display_name}</p>
                            <p className="text-xs text-muted-foreground">{member.user_id === user?.id ? "(You)" : ""}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {member.roles.map((role: string) => (
                                <Badge key={role} variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {member.user_id !== user?.id && (
                              <div className="flex items-center justify-end gap-2">
                                {member.roles.includes("editor") && (
                                  <Button size="sm" variant="outline" onClick={() => handleChangeRole(member.user_id, "editor", "admin")}>
                                    Make Admin
                                  </Button>
                                )}
                                {member.roles.includes("admin") && (
                                  <Button size="sm" variant="outline" onClick={() => handleChangeRole(member.user_id, "admin", "editor")}>
                                    Make Editor
                                  </Button>
                                )}
                                {member.roles.map((role: string) => (
                                  <Button key={role} size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRevokeRole(member.user_id, role)}>
                                    <X size={14} className="mr-1" /> Revoke {role}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
