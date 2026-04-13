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
      </Helmet>
      <article className="prose lg:prose-xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-500 mb-8">{new Date(post.created_at).toLocaleDateString()}</div>
        <div className="whitespace-pre-wrap leading-relaxed">{post.content}</div>
      </article>
    </div>
  );
};

export default PostDetail;
