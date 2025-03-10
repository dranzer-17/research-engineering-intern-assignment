import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Bookmark, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function PostCard({ post }) {
  // Handle both direct and nested data structure
  const postData = post.data || post;
  
  // Convert timestamp to relative time (like "2 hours ago")
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'some time ago';
    // Check if timestamp is a number or string that can be parsed
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get the first letter of username for avatar fallback
  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  // Helper function to truncate long text
  const truncateText = (text, maxLength = 300) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Detect if post has media
  const hasMedia = postData.url && (
    postData.url.endsWith('.jpg') || 
    postData.url.endsWith('.jpeg') || 
    postData.url.endsWith('.png') || 
    postData.url.endsWith('.gif')
  );

  return (
    <Card className="mb-4 hover:border-gray-400 transition-all">
      {/* Voting sidebar */}
      <div className="flex">
        <div className="flex flex-col items-center p-2 bg-gray-50 rounded-l w-12">
          <Button variant="ghost" size="sm" className="text-orange-500 p-0">
            <ThumbsUp size={16} />
          </Button>
          <span className="font-medium text-sm">{postData.score || 0}</span>
          <Button variant="ghost" size="sm" className="text-gray-500 p-0">
            <ThumbsDown size={16} />
          </Button>
        </div>

        <div className="w-full">
          {/* Post header */}
          <div className="p-3 pb-1">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              {postData.subreddit && (
                <>
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarFallback className="bg-orange-500 text-white text-xs">
                      r/
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold mr-1">r/{postData.subreddit}</span>
                </>
              )}
              <span className="mr-1">•</span>
              <span>Posted by u/{postData.author || 'unknown'}</span>
              <span className="mx-1">•</span>
              <span>{getRelativeTime(postData.created_utc)}</span>

              {postData.upvote_ratio && (
                <>
                  <span className="mx-1">•</span>
                  <span>{Math.round(postData.upvote_ratio * 100)}% Upvoted</span>
                </>
              )}
            </div>

            <h2 className="text-lg font-medium mb-2">{postData.title}</h2>

            {postData.link_flair_text && (
              <Badge className="mb-2 bg-blue-500" variant="secondary">
                {postData.link_flair_text}
              </Badge>
            )}
          </div>

          {/* Post content */}
          <CardContent className="p-3 pt-0">
            {hasMedia ? (
              <div className="bg-gray-100 rounded-md overflow-hidden max-h-96 flex items-center justify-center">
                <img 
                  src={postData.url} 
                  alt={postData.title}
                  className="max-w-full max-h-96 object-contain"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/600/400";
                    e.target.alt = "Image couldn't load";
                  }}
                />
              </div>
            ) : postData.selftext ? (
              <div className="text-sm text-gray-800">
                {truncateText(postData.selftext)}
              </div>
            ) : postData.url ? (
              <a 
                href={postData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {postData.url}
              </a>
            ) : null}
          </CardContent>

          {/* Post footer - actions */}
          <CardFooter className="p-2 border-t text-gray-500">
            <div className="flex space-x-4 text-xs w-full">
              <Button variant="ghost" size="sm" className="flex items-center">
                <MessageSquare size={16} className="mr-1" />
                {postData.num_comments || 0} Comments
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center">
                <Share2 size={16} className="mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center">
                <Bookmark size={16} className="mr-1" />
                Save
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center">
                <Award size={16} className="mr-1" />
                Award
              </Button>
            </div>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}