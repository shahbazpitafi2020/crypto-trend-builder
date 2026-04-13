import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from 'react-helmet-async';

const PostDetail = () => {
  const { slug } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="p-20 text-center">Loading News...</div>;
  if (!post) return <div className="p-20 text-center">Post Not Found!</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>{post.title} | Crypto Uptrend</title>
        <meta name="description" content={post.content.substring(0, 160)} />
      </Helmet>
      
      <article className="bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center text-gray-400 mb-8 pb-8 border-b text-sm">
           Published on: {new Date(post.created_at).toLocaleDateString()}
        </div>
        <div className="prose prose-blue max-w-none text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>
    </div>
  );
};

export default PostDetail;
