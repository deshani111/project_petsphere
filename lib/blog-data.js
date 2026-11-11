const authors = {
  emily: {
    name: "Dr. Emily Chen",
    avatar: "EC",
    role: "Companion-animal veterinarian",
    bio: "Dr. Emily is a companion-animal veterinarian and lifelong dog person who believes small, consistent habits create the healthiest bonds.",
  },
  mark: {
    name: "Mark Hudson",
    avatar: "MH",
    role: "Pet care educator",
    bio: "Mark turns everyday pet-care questions into practical routines that are easy for busy families to keep.",
  },
  sarah: {
    name: "Sarah J. Miller",
    avatar: "SM",
    role: "Feline behavior specialist",
    bio: "Sarah helps cat families understand the quiet signals that make home life calmer and more connected.",
  },
  james: {
    name: "James Wilson",
    avatar: "JW",
    role: "Certified positive-reinforcement trainer",
    bio: "James helps pet parents replace pressure with patience, clear communication, and small wins.",
  },
  nina: {
    name: "Nina Patel",
    avatar: "NP",
    role: "PetSphere community writer",
    bio: "Nina shares real stories from PetSphere families and the routines that help pets thrive.",
  },
};

const puppyContent = () => [
  { type: "paragraph", text: "Bringing home a puppy changes the rhythm of the whole household. Everything is new for them: the sounds, smells, people, and routines. A little preparation gives your puppy a secure place to learn while giving you confidence through each new stage." },
  { type: "heading", text: "Make the first night feel safe" },
  { type: "paragraph", text: "Prepare a quiet sleeping area before your puppy arrives. Keep their bed, water, and one familiar toy close together, and introduce the space during the day so it feels less unfamiliar at bedtime." },
  { type: "paragraph", text: "The goal is not a perfect first night. It is helping your puppy understand that home is a safe place to rest and explore." },
  { type: "paragraph", text: "PetSphere tip: Keep the first few days simple. Short naps, gentle play, and regular bathroom breaks are more useful than an overfilled schedule." },
  { type: "heading", text: "Build a routine from day one" },
  { type: "paragraph", text: "Puppies thrive on predictable patterns. Offer meals, bathroom breaks, play, and rest at roughly the same times each day. Reward the behaviors you want to see with a soft voice, a small treat, or a favorite toy." },
  { type: "heading", text: "A simple first-day rhythm" },
  { type: "paragraph", text: "Take your puppy outside after waking, eating, and active play." },
  { type: "paragraph", text: "Keep training sessions short and end while they are still engaged." },
  { type: "paragraph", text: "Protect several quiet nap periods throughout the day." },
  { type: "heading", text: "Start their wellness journey early" },
  { type: "paragraph", text: "Schedule a first veterinary visit and ask about vaccinations, parasite prevention, nutrition, and safe socialization. Your veterinarian can help create a plan that fits your puppy's age, breed, and everyday environment." },
  { type: "paragraph", text: "Bring a written list of questions to the first visit." },
  { type: "paragraph", text: "Keep vaccination and parasite-prevention dates somewhere visible." },
  { type: "paragraph", text: "Ask which social experiences are safe before the full vaccine series." },
  { type: "heading", text: "Let trust grow at their pace" },
  { type: "paragraph", text: "The strongest bond is built through hundreds of small, positive moments. Get down on their level, notice their body language, and give them space when they need a break. Patience now creates a confident companion later." },
];

const trainingContent = () => [
  { type: "paragraph", text: "Training works best when it feels like a conversation rather than a correction. Positive reinforcement gives pets a clear path to success while making the learning process enjoyable for everyone involved." },
  { type: "heading", text: "Reward the behavior you want" },
  { type: "paragraph", text: "Notice the moment your pet makes a good choice, then reward it immediately. Timing helps them connect the behavior with the outcome, whether that reward is food, play, or enthusiastic praise." },
  { type: "paragraph", text: "Clear, kind feedback makes the right choice easier to repeat." },
  { type: "paragraph", text: "PetSphere tip: Start with rewards your pet truly values, then gradually vary them as the behavior becomes reliable." },
  { type: "heading", text: "Keep practice short and focused" },
  { type: "paragraph", text: "Two or three minutes of focused practice can be more productive than a long session. End while your pet is still interested, and repeat the same skill in a few calm locations." },
  { type: "heading", text: "A repeatable practice loop" },
  { type: "paragraph", text: "Ask for one simple behavior." },
  { type: "paragraph", text: "Mark the behavior with a word or click." },
  { type: "paragraph", text: "Deliver the reward, then pause before trying again." },
  { type: "heading", text: "Set up the environment for success" },
  { type: "paragraph", text: "Management is part of training. Put tempting items away, use a quiet room for new skills, and make the behavior you want the easiest option available." },
  { type: "paragraph", text: "Reduce distractions before introducing a new cue." },
  { type: "paragraph", text: "Use gates or a lead when supervision is limited." },
  { type: "paragraph", text: "Celebrate small improvements instead of waiting for perfection." },
  { type: "heading", text: "Let trust lead the way" },
  { type: "paragraph", text: "A pet who feels safe is more ready to learn. Give them breaks, avoid forcing interactions, and finish every session with something they already know." },
];

const posts = [
  { id: 1, slug: "new-puppy-care", title: "The Essential Guide to New Puppy Care", subtitle: "A calm, practical guide to making the first days safe, joyful, and full of connection.", excerpt: "Welcoming a new furry friend is an exciting journey. Here is how to make the first days calm, safe, and full of connection.", content: puppyContent(), category: "Pet Health", tags: ["Puppies", "Pet health", "New pet parents", "Training"], image: "/blog-featured-puppy.webp", imageAlt: "Golden puppy relaxing in a bright living room", imageCaption: "A new puppy brings a new rhythm to every room in the house.", author: authors.emily, date: "May 12, 2024", readTime: "8 min read", featured: true, previousSlug: "seasonal-allergies", nextSlug: "cat-body-language", relatedSlugs: ["positive-reinforcement", "cat-body-language", "seasonal-allergies"] },
  { id: 2, slug: "stress-free-grooming", title: "5 Tips for Stress-Free Grooming", subtitle: "Turn bath time and brushing into calm, confidence-building rituals.", excerpt: "Help your pet learn to love bath time with these expert-approved desensitization techniques.", content: trainingContent(), category: "Tutorials", tags: ["Grooming", "Dogs", "Routine"], image: "/blog-featured-puppy.webp", imageAlt: "Dog relaxing during a gentle grooming session", imageCaption: "Patient grooming routines help pets feel safe and understood.", author: authors.mark, date: "May 10, 2024", readTime: "5 min read", featured: false, previousSlug: "cat-body-language", nextSlug: "new-puppy-care", relatedSlugs: ["new-puppy-care", "positive-reinforcement", "seasonal-allergies"] },
  { id: 3, slug: "cat-body-language", title: "Understanding Cat Body Language", subtitle: "Learn the quiet signals behind slow blinks, tail flicks, and curious pauses.", excerpt: "Slow blinks to tail flicks: what your feline companion is actually trying to tell you.", content: trainingContent(), category: "News", tags: ["Cats", "Behavior", "Wellness"], image: "/blog-cat-behavior.webp", imageAlt: "Cat showing relaxed body language", imageCaption: "Learning your cat's signals makes everyday interactions more respectful.", author: authors.sarah, date: "May 8, 2024", readTime: "6 min read", featured: false, previousSlug: "new-puppy-care", nextSlug: "seasonal-allergies", relatedSlugs: ["new-puppy-care", "stress-free-grooming", "seasonal-allergies"] },
  { id: 4, slug: "seasonal-allergies", title: "Seasonal Allergies in Dogs", subtitle: "Spot common triggers early and make allergy season more comfortable.", excerpt: "How to identify and treat common environmental triggers during the spring season.", content: puppyContent(), category: "Pet Health", tags: ["Dogs", "Allergies", "Health"], image: "/blog-dog-health.webp", imageAlt: "Dog resting comfortably at home", imageCaption: "A consistent wellness routine helps you notice changes early.", author: authors.emily, date: "May 5, 2024", readTime: "7 min read", featured: false, previousSlug: "cat-body-language", nextSlug: "positive-reinforcement", relatedSlugs: ["new-puppy-care", "cat-body-language", "positive-reinforcement"] },
  { id: 5, slug: "positive-reinforcement", title: "The Power of Positive Reinforcement", subtitle: "Build confidence and connection with training that makes every small win count.", excerpt: "Why rewards-based training is the most effective way to build a bond with your pet.", content: trainingContent(), category: "Tutorials", tags: ["Training", "Positive reinforcement", "Dogs"], image: "/blog-training.webp", imageAlt: "Dog learning with positive reinforcement", imageCaption: "Short, positive sessions build confidence faster than long lessons.", author: authors.james, date: "May 1, 2024", readTime: "4 min read", featured: false, previousSlug: "seasonal-allergies", nextSlug: "connected-care", relatedSlugs: ["new-puppy-care", "stress-free-grooming", "cat-body-language"] },
  { id: 6, slug: "connected-care", title: "PetSphere Makes Care More Connected", subtitle: "Thoughtful tools for finding and sharing trusted pet care.", excerpt: "Discover the thoughtful updates that make finding and booking trusted care simpler.", content: trainingContent(), category: "Product Updates", tags: ["PetSphere", "Product updates", "Care"], image: "/home-hero-petsphere.webp", imageAlt: "PetSphere pet care experience", imageCaption: "Good tools make it easier for people and pets to feel looked after.", author: authors.nina, date: "Apr 27, 2024", readTime: "3 min read", featured: false, previousSlug: "positive-reinforcement", nextSlug: "busy-pet-parents", relatedSlugs: ["positive-reinforcement", "busy-pet-parents", "new-puppy-care"] },
  { id: 7, slug: "busy-pet-parents", title: "A Better Routine for Busy Pet Parents", subtitle: "Small changes that make everyday care calmer and easier to share.", excerpt: "Small changes that make everyday care calmer, more consistent, and easier to share.", content: puppyContent(), category: "Case Studies", tags: ["Routine", "Families", "Wellness"], image: "/about-hero-dog.webp", imageAlt: "Dog enjoying time with a pet parent", imageCaption: "Simple shared routines create more reliable care.", author: authors.nina, date: "Apr 22, 2024", readTime: "5 min read", featured: false, previousSlug: "connected-care", nextSlug: "choosing-a-sitter", relatedSlugs: ["connected-care", "choosing-a-sitter", "new-puppy-care"] },
  { id: 8, slug: "choosing-a-sitter", title: "How to Choose the Right Pet Sitter", subtitle: "The questions to ask before your pet's first stay.", excerpt: "The questions to ask and signals to look for before your pet's first stay.", content: trainingContent(), category: "News", tags: ["Pet sitting", "Safety", "Care"], image: "/marketplace-cooper.webp", imageAlt: "Friendly dog meeting a trusted caregiver", imageCaption: "A good match starts with open questions and an unhurried introduction.", author: authors.mark, date: "Apr 18, 2024", readTime: "6 min read", featured: false, previousSlug: "busy-pet-parents", nextSlug: "trust-one-walk", relatedSlugs: ["new-puppy-care", "busy-pet-parents", "trust-one-walk"] },
  { id: 9, slug: "trust-one-walk", title: "Building Trust One Walk at a Time", subtitle: "A PetSphere family's journey to finding their perfect care match.", excerpt: "A look inside a PetSphere family's journey to finding their perfect care match.", content: puppyContent(), category: "Case Studies", tags: ["Stories", "Walks", "Pet sitting"], image: "/marketplace-luna.webp", imageAlt: "Pet enjoying a walk with a caregiver", imageCaption: "Trust grows through small, consistent experiences.", author: authors.nina, date: "Apr 12, 2024", readTime: "4 min read", featured: false, previousSlug: "choosing-a-sitter", nextSlug: "new-puppy-care", relatedSlugs: ["choosing-a-sitter", "connected-care", "positive-reinforcement"] },
];

export const blogPosts = posts.map((post) => ({
  ...post,
  unsplashImage: `https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80`,
  imageFallback: `https://picsum.photos/seed/petsphere-${post.slug}/1200/800`,
}));
export const blogCategories = ["All", ...new Set(posts.map((post) => post.category))];
export const featuredPost = blogPosts.find((post) => post.featured) || blogPosts[0];
export const BLOG_STORAGE_KEY = "petsphere-blog-posts";
export const BLOG_UPDATED_EVENT = "petsphere-blog-updated";
let clientPostsCache = blogPosts;
let clientPostsRaw = null;
export function getStoredPosts() {
  if (typeof window === "undefined") return [];
  const saved = window.localStorage.getItem(BLOG_STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read saved blog posts.", error);
    return [];
  }
}
export function getClientPosts() {
  if (typeof window === "undefined") return blogPosts;
  const raw = window.localStorage.getItem(BLOG_STORAGE_KEY);
  if (raw === clientPostsRaw) return clientPostsCache;
  clientPostsRaw = raw;
  const savedPosts = getStoredPosts().filter((post) => post.status !== "draft");
  const savedBySlug = new Map(savedPosts.map((post) => [post.slug, post]));
  const builtInSlugs = new Set(blogPosts.map((post) => post.slug));
  clientPostsCache = [
    ...blogPosts.map((post) => savedBySlug.get(post.slug) || post),
    ...savedPosts.filter((post) => !builtInSlugs.has(post.slug)),
  ];
  return clientPostsCache;
}
export function subscribeToBlogPosts(callback) {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (event) => {
    if (event.key === BLOG_STORAGE_KEY || event.type === BLOG_UPDATED_EVENT) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(BLOG_UPDATED_EVENT, handleStorage);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BLOG_UPDATED_EVENT, handleStorage);
  };
}
export function savePost(post) {
  if (typeof window === "undefined") throw new Error("Posts can only be saved in the browser.");
  const postsBySlug = new Map(getStoredPosts().map((savedPost) => [savedPost.slug, savedPost]));
  const builtInPost = blogPosts.find((savedPost) => savedPost.slug === post.slug);
  if (builtInPost) {
    postsBySlug.set(post.slug, post);
  } else {
    postsBySlug.set(post.slug, post);
  }
  window.localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify([...postsBySlug.values()]));
  window.dispatchEvent(new Event(BLOG_UPDATED_EVENT));
  return post;
}
export function getPostBySlug(slug) { return blogPosts.find((post) => post.slug === slug); }
export function getPostsBySlugs(slugs) { return slugs.map((slug) => getPostBySlug(slug)).filter(Boolean); }
