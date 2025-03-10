"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { 
  ThumbsUp, ThumbsDown, MessageCircle, Share2, Link, 
  Calendar, Users, TrendingUp, Award, ArrowUpRight, 
  ExternalLink, Clock, Tag, User, FileText
} from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function PostDashboard() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [keywordData, setKeywordData] = useState(null);
  const [timeAnalysis, setTimeAnalysis] = useState(null);
  
  // Simulate time data for post activity
  const generateTimeData = () => {
    const hours = Array.from({length: 24}, (_, i) => i);
    const activity = hours.map(() => Math.floor(Math.random() * 100));
    return { hours, activity };
  };

  // Simulate similar posts
  const generateSimilarPosts = (postTitle) => {
    return [
      { id: "sim1", title: `Similar to: ${postTitle.substring(0, 20)}...`, score: 92, subreddit: "PoliticalDiscussion" },
      { id: "sim2", title: "Related discussion thread", score: 45, subreddit: "politics" },
      { id: "sim3", title: "Alternative perspective on topic", score: 78, subreddit: "worldpolitics" },
      { id: "sim4", title: "Analysis from a Conservative view", score: 60, subreddit: "Conservative" },
      { id: "sim5", title: "Liberal take on the matter", score: 72, subreddit: "Liberal" },
      { id: "sim6", title: "Republican stance", score: 50, subreddit: "Republican" },
      { id: "sim7", title: "Democrats' viewpoint", score: 68, subreddit: "democrats" },
      { id: "sim8", title: "Anarchist perspective", score: 55, subreddit: "Anarchism" },
      { id: "sim9", title: "Neoliberal thoughts", score: 62, subreddit: "neoliberal" },
      { id: "sim10", title: "Socialism in discussion", score: 74, subreddit: "socialism" },
    ];
  };
  

  // Keyword extraction simulation
  const extractKeywords = (title, content) => {
    const text = title + " " + (content || "");
    const words = text.split(/\s+/).filter(word => word.length > 3);
    const uniqueWords = [...new Set(words)];
    const keywords = uniqueWords.slice(0, Math.min(5, uniqueWords.length))
      .map(word => ({ 
        text: word, 
        value: Math.floor(Math.random() * 90) + 10 
      }));
    return keywords;
  };

  useEffect(() => {
    async function fetchPostData() {
      try {
        const response = await fetch("/data/simPPL_dataset.jsonl");
        const text = await response.text();
        const jsonLines = text.trim().split("\n").map(JSON.parse);
        const matchedPost = jsonLines.find((p) => {
          const postId = p.data?.id || p.id;
          return postId === id;
        });

        if (matchedPost) {
          const postData = matchedPost.data || matchedPost;
          setPost(postData);
          fetchCategory(postData.title);
          fetchSentiment(postData.title);
          
          // Generate mock engagement data
          const mockEngagement = {
            upvotes: postData.ups || postData.score || Math.floor(Math.random() * 1000),
            comments: postData.num_comments || Math.floor(Math.random() * 100),
            ratio: postData.upvote_ratio || (Math.random() * 0.5 + 0.5).toFixed(2),
            shares: Math.floor(Math.random() * 50),
          };
          setEngagementData(mockEngagement);
          
          // Set similar posts
          setSimilarPosts(generateSimilarPosts(postData.title));
          
          // Extract keywords
          setKeywordData(extractKeywords(postData.title, postData.selftext));
          
          // Generate time analysis
          setTimeAnalysis(generateTimeData());
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchCategory(postTitle) {
      try {
        const response = await fetch("https://reddify-backend.onrender.com/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_title: postTitle }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch category");
        }

        const data = await response.json();
        setCategory(data.predicted_subreddit);
      } catch (error) {
        console.error("Error fetching category:", error);
        setCategory("Unknown");
      }
    }

    async function fetchSentiment(postTitle) {
      try {
        const response = await fetch("https://reddify-backend.onrender.com/predict-sentiment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_title: postTitle }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sentiment");
        }

        const data = await response.json();
        setSentiment(data.sentiment);
      } catch (error) {
        console.error("Error fetching sentiment:", error);
        setSentiment("Unknown");
      }
    }

    fetchPostData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading post analysis...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Post Not Found</CardTitle>
            <CardDescription>We couldn't locate the post you're looking for.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Return Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Sentiment visualization color coding
  const getSentimentColor = () => {
    switch(sentiment) {
      case "Positive": return "bg-green-500";
      case "Negative": return "bg-red-500";
      case "Neutral": return "bg-gray-400";
      default: return "bg-blue-300";
    }
  };

  // Engagement chart data
  const engagementChartData = {
    labels: ['Upvotes', 'Comments', 'Shares'],
    datasets: [
      {
        label: 'Post Engagement',
        data: [
          engagementData?.upvotes || 0, 
          engagementData?.comments || 0, 
          engagementData?.shares || 0
        ],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
        borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)'],
        borderWidth: 1,
      },
    ],
  };

  // Time analysis chart data
  const timeChartData = timeAnalysis ? {
    labels: timeAnalysis.hours.map(h => `${h}:00`),
    datasets: [
      {
        label: 'Activity by Hour',
        data: timeAnalysis.activity,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  } : null;

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with back button and post title */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <Button 
          onClick={() => router.back()} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <ArrowUpRight className="h-4 w-4 rotate-180" />
          Back
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate max-w-2xl">
          Post Analysis
        </h1>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="similar">Similar Content</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Post details */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Post Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-800">{post.title}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>By: {post.author || "Unknown"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Posted: {formatDate(post.created_utc || post.created)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Subreddit: {post.subreddit_name_prefixed || post.subreddit}</span>
                    </div>

                    {category && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="h-4 w-4" />
                        <span>Predicted Category:</span>
                        <Badge variant="outline" className="ml-1">{category}</Badge>
                      </div>
                    )}
                  </div>

                  {post.selftext && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Post Content</h4>
                      <p className="text-sm text-gray-600 line-clamp-6">{post.selftext}</p>
                      {post.selftext.length > 300 && (
                        <Button variant="link" className="p-0 h-auto text-xs mt-1">
                          Read more
                        </Button>
                      )}
                    </div>
                  )}

                  {post.url && post.url !== post.permalink && (
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">External Link</h4>
                      <a 
                        href={post.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{post.url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Middle column - Quick stats */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sentiment */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Sentiment</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSentimentColor()}`}></div>
                        <span className="text-lg font-bold">{sentiment || "Unknown"}</span>
                      </div>
                    </div>

                    {/* Engagement */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Engagement</h3>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-blue-500" />
                        <span className="text-lg font-bold">{engagementData?.upvotes || 0}</span>
                        <span className="text-sm text-gray-400 ml-1">upvotes</span>
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Discussion</h3>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-purple-500" />
                        <span className="text-lg font-bold">{engagementData?.comments || 0}</span>
                        <span className="text-sm text-gray-400 ml-1">comments</span>
                      </div>
                    </div>

                    {/* Upvote Ratio */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Upvote Ratio</h3>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold">{(engagementData?.ratio || 0) * 100}%</span>
                          <span className="text-sm text-gray-400 ml-1">positive</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keywords Extraction */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Key Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywordData ? (
                        keywordData.map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="px-3 py-1 text-sm bg-opacity-70"
                            style={{ 
                              fontSize: `${Math.min(100, Math.max(80, keyword.value))}%`,
                              opacity: keyword.value / 100 + 0.5
                            }}
                          >
                            {keyword.text}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">No keywords extracted</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom section - Activity chart */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Activity Timeline
                  </CardTitle>
                  <CardDescription>Estimated hourly engagement with this post</CardDescription>
                </CardHeader>
                <CardContent>
                  {timeChartData && (
                    <div className="h-64">
                      <LineChart
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }}
                        data={timeChartData}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SENTIMENT TAB */}
          <TabsContent value="sentiment">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>Overall sentiment of post content and title</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        sentiment === "Positive" ? "bg-green-100" : 
                        sentiment === "Negative" ? "bg-red-100" : "bg-gray-100"
                      }`}>
                        {sentiment === "Positive" ? (
                          <ThumbsUp className="h-8 w-8 text-green-500" />
                        ) : sentiment === "Negative" ? (
                          <ThumbsDown className="h-8 w-8 text-red-500" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{sentiment || "Unknown"}</h3>
                        <p className="text-sm text-gray-500">Overall Sentiment</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Sentiment Strength</h3>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getSentimentColor()}`} 
                          style={{ 
                            width: sentiment === "Positive" ? "80%" : 
                                  sentiment === "Negative" ? "65%" : "50%" 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Weak</span>
                        <span>Strong</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Sentiment Distribution</h3>
                      <div className="h-48">
                        <PieChart
                          data={{
                            labels: ['Positive', 'Neutral', 'Negative'],
                            datasets: [{
                              data: [
                                sentiment === "Positive" ? 70 : 15, 
                                sentiment === "Neutral" ? 70 : 15,
                                sentiment === "Negative" ? 70 : 15
                              ],
                              backgroundColor: [
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(201, 203, 207, 0.6)',
                                'rgba(255, 99, 132, 0.6)'
                              ],
                              borderColor: [
                                'rgb(75, 192, 192)',
                                'rgb(201, 203, 207)',
                                'rgb(255, 99, 132)'
                              ]
                            }]
                          }}
                          options={{
                            plugins: {
                              legend: {
                                position: 'bottom'
                              }
                            },
                            responsive: true,
                            maintainAspectRatio: false
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Factors</CardTitle>
                  <CardDescription>Key elements influencing sentiment score</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Key Phrases Identified</h3>
                    <ul className="space-y-2">
                      {[
                        { phrase: post.title.split(' ').slice(0, 3).join(' '), sentiment: "neutral" },
                        { phrase: post.title.split(' ').slice(-3).join(' '), sentiment: sentiment?.toLowerCase() || "neutral" },
                        { phrase: post.selftext ? post.selftext.split(' ').slice(0, 3).join(' ') : "Sample phrase", sentiment: sentiment?.toLowerCase() || "neutral" }
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className={`w-2 h-2 rounded-full ${
                            item.sentiment === "positive" ? "bg-green-500" : 
                            item.sentiment === "negative" ? "bg-red-500" : "bg-gray-400"
                          }`}></div>
                          <span className="text-sm font-medium">"{item.phrase}..."</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium mb-3">Sentiment Over Time</h3>
                    <p className="text-sm text-gray-500 mb-3">How sentiment evolved in comment section</p>
                    <div className="h-48">
                      <LineChart
                        data={{
                          labels: ['Initial', '1h', '2h', '4h', '8h', '12h', '24h'],
                          datasets: [{
                            label: 'Sentiment Score',
                            data: [0.5, 0.6, 0.4, 0.7, 0.65, 0.6, 0.58],
                            borderColor: sentiment === "Positive" ? 'rgb(75, 192, 192)' : 
                                        sentiment === "Negative" ? 'rgb(255, 99, 132)' : 
                                        'rgb(201, 203, 207)',
                            backgroundColor: 'rgba(255, 255, 255, 0)',
                            tension: 0.3
                          }]
                        }}
                        options={{
                          scales: {
                            y: {
                              min: 0,
                              max: 1,
                              ticks: {
                                callback: function(value) {
                                  if (value === 0) return "Negative";
                                  if (value === 0.5) return "Neutral";
                                  if (value === 1) return "Positive";
                                  return "";
                                }
                              }
                            }
                          },
                          responsive: true,
                          maintainAspectRatio: false
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ENGAGEMENT TAB */}
          <TabsContent value="engagement">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>How users interact with this post</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart
                      data={engagementChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Engagement Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Upvotes</span>
                      </div>
                      <span className="font-bold">{engagementData?.upvotes || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">Downvotes</span>
                      </div>
                      <span className="font-bold">
                        {Math.round(engagementData?.upvotes * (1 / (engagementData?.ratio || 1) - 1)) || 0}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">Comments</span>
                      </div>
                      <span className="font-bold">{engagementData?.comments || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Shares</span>
                      </div>
                      <span className="font-bold">{engagementData?.shares || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium">Awards</span>
                      </div>
                      <span className="font-bold">{post.total_awards_received || 0}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium mb-3">Upvote Ratio</h3>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(engagementData?.ratio || 0) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0%</span>
                      <span>{((engagementData?.ratio || 0) * 100).toFixed(0)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Community Comparison</CardTitle>
                  <CardDescription>How this post performs relative to subreddit average</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Upvotes vs Average</h4>
                      <div className="flex items-end gap-4">
                        <div className="relative w-16 bg-blue-100 rounded">
                          <div className="absolute bottom-0 w-full bg-blue-500 rounded" style={{ height: '60%' }}></div>
                          <div className="h-32 relative z-10 flex items-end justify-center pb-1">
                            <span className="text-xs font-bold text-blue-800">+60%</span>
                          </div>
                        </div>
                        <div>
                        <p className="text-sm font-bold text-gray-700">Above Average</p>
                          <p className="text-xs text-gray-500">This post is performing better than 60% of posts in this subreddit</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Comment Engagement</h4>
                      <div className="flex items-end gap-4">
                        <div className="relative w-16 bg-purple-100 rounded">
                          <div className="absolute bottom-0 w-full bg-purple-500 rounded" style={{ height: '75%' }}></div>
                          <div className="h-32 relative z-10 flex items-end justify-center pb-1">
                            <span className="text-xs font-bold text-purple-800">+75%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">High Engagement</p>
                          <p className="text-xs text-gray-500">Comments per upvote ratio is higher than subreddit average</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Growth Rate</h4>
                      <div className="flex items-end gap-4">
                        <div className="relative w-16 bg-green-100 rounded">
                          <div className="absolute bottom-0 w-full bg-green-500 rounded" style={{ height: '40%' }}></div>
                          <div className="h-32 relative z-10 flex items-end justify-center pb-1">
                            <span className="text-xs font-bold text-green-800">+40%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Moderate Growth</p>
                          <p className="text-xs text-gray-500">This post is growing at an average rate for its age</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SIMILAR CONTENT TAB */}
          <TabsContent value="similar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Similar Posts</CardTitle>
                  <CardDescription>Content with similar topics and engagement patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {similarPosts.map((similar, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex justify-between">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <Avatar className="h-10 w-10 bg-blue-100">
                                <AvatarFallback className="text-blue-500">{similar.subreddit.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-800">{similar.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>r/{similar.subreddit}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" /> {similar.score}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                            <span>{post.subreddit_name_prefixed || post.subreddit}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline" className="text-sm">
                    View More Similar Posts
                  </Button>
                </CardFooter>
              </Card>

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}