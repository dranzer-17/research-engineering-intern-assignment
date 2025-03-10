"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Flame, TrendingUp, Star, Clock } from 'lucide-react';
import PostCard from "@/components/ui/PostCard";
import ChatButton from "@/components/ui/ChatButton";
import { useRouter } from 'next/navigation';


export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("hot");
  const [searchValue, setSearchValue] = useState("");
  const [visiblePosts, setVisiblePosts] = useState(10);
  const router = useRouter();
  
  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        console.log('Attempting to fetch from: /data/simPPL_dataset.jsonl');
        
        const response = await fetch('/data/simPPL_dataset.jsonl');
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to load dataset: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Response text length:', text.length);
        console.log('First 100 chars:', text.substring(0, 100));
        
        if (!text.trim()) {
          console.error('Empty response received');
          return;
        }
        
        const jsonLines = text.trim().split('\n');
        console.log('Number of JSON lines:', jsonLines.length);
        
        try {
          if (jsonLines.length > 0) {
            const firstItem = JSON.parse(jsonLines[0]);
            console.log('First item parsed successfully:', firstItem.kind, firstItem.data?.title);
          }
          
          const data = jsonLines.map((line, index) => {
            try {
              return JSON.parse(line);
            } catch (parseError) {
              console.error(`Error parsing line ${index}:`, parseError);
              console.log('Problematic line:', line.substring(0, 100) + '...');
              return null;
            }
          }).filter(item => item !== null);
          
          console.log('Successfully parsed items:', data.length);
          setPosts(data);
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
        }
      } catch (error) {
        console.error('Error loading dataset:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);
  
  // Filter posts based on search - updated for nested data structure
  const filteredPosts = posts.filter(post => {
    const postData = post.data || post;
    return (
      postData.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
      postData.selftext?.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  // Sort posts based on active filter
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (activeFilter) {
      case "hot":
        return (b.score || 0) - (a.score || 0);
      case "new":
        return (b.created_utc || 0) - (a.created_utc || 0);
      case "top":
        return (b.upvote_ratio || 0) - (a.upvote_ratio || 0);
      case "rising":
        const aRising = (a.score || 0) * (1 / (Date.now()/1000 - (a.created_utc || 0) + 1));
        const bRising = (b.score || 0) * (1 / (Date.now()/1000 - (b.created_utc || 0) + 1));
        return bRising - aRising;
      default:
        return (b.score || 0) - (a.score || 0);
    }
  });

  // Get only the visible posts based on the current pagination state
  const displayPosts = sortedPosts.slice(0, visiblePosts);
  
  // Handle loading more posts
  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + 10);
  };


  return (
   
    <div className="min-h-screen bg-gray-100">
       
      {/* Header/Navbar */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-red-500">Reddify</h1>
            <span className="text-sm text-gray-500">by Kavish Shah</span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Reddit"
                className="pl-10 w-full"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
          
          
          <div className="flex items-center space-x-4">
            <Button variant="outline">Log In</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        <div className="md:flex gap-6">
          {/* Left sidebar */}
          <div className="md:w-3/4">
            {/* Filter tabs */}
            <Card className="mb-4" >
              <Tabs defaultValue="hot" onValueChange={setActiveFilter}>
                <TabsList className="w-full justify-start border-b rounded-none">
                  <TabsTrigger value="hot" className="flex items-center">
                    <Flame className="h-4 w-4 mr-1 text-orange-500" />
                    Hot
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-500" />
                    New
                  </TabsTrigger>
                  <TabsTrigger value="top" className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    Top
                  </TabsTrigger>
                  <TabsTrigger value="rising" className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    Rising
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Card>

              {/* Posts */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading posts...</span>
                </div>
              ) : displayPosts.length > 0 ? (
                <>
                {displayPosts.map((post) => {
                    const postData = post.data || post;
                    const postId = postData.id || `post-${postData.created_utc}-${postData.author}`;

                    return (
                        <Link key={postId} href={`/post/${postId}`} passHref>                        
                            <div className="cursor-pointer transition-transform hover:scale-[1.01]">
                                <PostCard post={post} />
                            </div>
                        </Link>
                    );
                })}
                                
                  {/* Load More Button */}
                  {visiblePosts < sortedPosts.length && (
                    <div className="flex justify-center my-4">
                      <Button 
                        onClick={handleLoadMore}
                        variant="outline"
                        className="px-8"
                      >
                        Load More Posts
                      </Button>
                    </div>
                  )}
                </>
              ) : (

              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <h3 className="text-xl font-medium mb-2">No posts found</h3>
                  <p className="text-gray-500">
                    {searchValue 
                      ? `No posts matching "${searchValue}"` 
                      : "Seems like there are no posts available."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="md:w-1/4 space-y-4 mt-4 md:mt-0">
            <Card>
              <CardHeader>
                <CardTitle >Made with &hearts;</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  by Kavish for simPPL
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">1.</span> Be respectful
                </div>
                <div className="text-sm">
                  <span className="font-medium">2.</span> No harassment
                </div>
                <div className="text-sm">
                  <span className="font-medium">3.</span> No spam
                </div>
                <div className="text-sm">
                  <span className="font-medium">4.</span> Follow Reddiquette
                </div>
              </CardContent>
            </Card>

            
          </div>
        </div>
      </main>
      
      {/* Chat Button Component */}
      <ChatButton />
   
    </div>
     
  );
}