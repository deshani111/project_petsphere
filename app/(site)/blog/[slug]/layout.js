import { getPostBySlug } from "../../../../lib/blog-data";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return {
    title: post ? `${post.title} | PetSphere` : "Story not found | PetSphere",
    description: post
      ? "Helpful pet care advice and stories from the PetSphere journal."
      : "This PetSphere story could not be found.",
  };
}

export default function BlogPostLayout({ children }) {
  return children;
}
