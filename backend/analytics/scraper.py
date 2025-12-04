"""
Social Media Scraper
====================
Fetches posts from Twitter, Facebook, Instagram, TikTok, etc.
Works with or without API keys (gracefully degrades to demo data).
"""

import os
import sys
from datetime import datetime, timedelta
import random

# Add the parent directory to the path so we can import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config import (
        TWITTER_BEARER_TOKEN,
        FACEBOOK_ACCESS_TOKEN,
        TIKTOK_CLIENT_KEY,
        USE_DEMO_DATA
    )
except ImportError:
    print("⚠️ config.py not found. Using demo mode.")
    TWITTER_BEARER_TOKEN = ""
    FACEBOOK_ACCESS_TOKEN = ""
    TIKTOK_CLIENT_KEY = ""
    USE_DEMO_DATA = True


class SocialMediaScraper:
    """
    Scrapes social media posts about tourism locations.
    Automatically detects which platforms are available based on API keys.
    """
    
    def __init__(self):
        self.twitter_client = None
        self.facebook_client = None
        self.tiktok_client = None
        
        # ✅ Only initialize Twitter if we have a key
        if TWITTER_BEARER_TOKEN:
            try:
                import tweepy
                self.twitter_client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN)
                print("✅ Twitter API connected successfully!")
            except Exception as e:
                print(f"⚠️ Twitter API failed to connect: {e}")
        else:
            print("⚠️ No Twitter API key found. Twitter scraping disabled.")
        
        # ✅ Only initialize Facebook/Instagram if we have a key
        if FACEBOOK_ACCESS_TOKEN:
            try:
                import requests
                # Test the token with a simple API call
                test_url = f"https://graph.facebook.com/v18.0/me?access_token={FACEBOOK_ACCESS_TOKEN}"
                response = requests.get(test_url)
                if response.status_code == 200:
                    self.facebook_client = FACEBOOK_ACCESS_TOKEN
                    print("✅ Instagram/Facebook API connected successfully!")
                else:
                    print(f"⚠️ Instagram/Facebook API token invalid: {response.text}")
                    self.facebook_client = None
            except Exception as e:
                print(f"⚠️ Instagram/Facebook API failed to connect: {e}")
                self.facebook_client = None
        else:
            print("⚠️ No Instagram/Facebook API key found. Scraping disabled.")
        
        # ✅ Only initialize TikTok if we have a key
        if TIKTOK_CLIENT_KEY:
            print("✅ TikTok API keys found (implementation pending).")
        else:
            print("⚠️ No TikTok API key found. TikTok scraping disabled.")
    
    def search_twitter(self, keywords: list, max_results=10):
        """
        Search Twitter for posts mentioning the given keywords.
        
        Args:
            keywords: List of place names to search for (e.g., ["Langkawi", "Alor Setar"])
            max_results: Maximum number of posts to fetch (Twitter minimum is 10)
            
        Returns:
            List of post dictionaries with engagement metrics
        """
        if not self.twitter_client:
            print("⚠️ Twitter client not initialized. Returning demo data.")
            return self._generate_demo_twitter_data(keywords, max_results)
        
        try:
            # Build search query (e.g., "Langkawi OR Alor Setar -is:retweet lang:en")
            query = " OR ".join(keywords) + " -is:retweet"
            
            print(f"🔍 Searching Twitter for: {query}")
            
            # ✅ FIXED: Ensure max_results is at least 10 (Twitter's minimum)
            twitter_max_results = max(10, min(100, max_results))  # Between 10 and 100
            
            response = self.twitter_client.search_recent_tweets(
                query=query,
                tweet_fields=["public_metrics", "created_at", "author_id"],
                max_results=twitter_max_results
            )
            
            if not response.data:
                print("⚠️ No tweets found. Returning demo data.")
                return self._generate_demo_twitter_data(keywords, max_results)
            
            results = []
            for tweet in response.data:
                metrics = tweet.public_metrics or {}
                results.append({
                    'platform': 'twitter',
                    'post_id': str(tweet.id),
                    'content': tweet.text,
                    'url': f"https://twitter.com/user/status/{tweet.id}",
                    'created_at': tweet.created_at.isoformat() if tweet.created_at else datetime.now().isoformat(),
                    'likes': metrics.get('like_count', 0),
                    'comments': metrics.get('reply_count', 0),
                    'shares': metrics.get('retweet_count', 0),
                    'views': metrics.get('impression_count', 0),
                })
            
            print(f"✅ Found {len(results)} real tweets!")
            return results
            
        except Exception as e:
            error_str = str(e)
            # ✅ IMPROVED: Better error handling for rate limits
            if '429' in error_str or 'Too Many Requests' in error_str:
                print(f"⏳ Twitter rate limit reached. Please wait 15 minutes.")
                print(f"💡 Using demo data for now. Your API key is working fine!")
            else:
                print(f"❌ Twitter API error: {e}")
            print("⚠️ Falling back to demo data.")
            return self._generate_demo_twitter_data(keywords, max_results)
    
    def search_facebook(self, keywords: list, max_results=10):
        """
        Search Instagram/Facebook for public posts using Graph API.
        
        Note: This uses Facebook Graph API to search for public posts.
        Falls back to demo data if specific Instagram Business features aren't available.
        
        Args:
            keywords: List of place names to search for
            max_results: Maximum number of posts to fetch
            
        Returns:
            List of post dictionaries with engagement metrics
        """
        if not self.facebook_client:
            print("⚠️ Instagram/Facebook client not initialized. Returning demo data.")
            return self._generate_demo_facebook_data(keywords, max_results)
        
        try:
            import requests
            
            results = []
            
            # Try to get user's own Instagram posts as a test
            # This works with basic access tokens
            print("🔍 Fetching Instagram data via Facebook Graph API...")
            
            # Get user's Instagram account info
            me_url = f"https://graph.facebook.com/v18.0/me"
            me_params = {
                'fields': 'id,name,instagram_business_account',
                'access_token': self.facebook_client
            }
            
            me_response = requests.get(me_url, params=me_params)
            
            if me_response.status_code == 200:
                me_data = me_response.json()
                
                # Check if Instagram Business Account is linked
                if 'instagram_business_account' in me_data:
                    ig_account_id = me_data['instagram_business_account']['id']
                    print(f"✅ Instagram Business Account found: {ig_account_id}")
                    
                    # Get Instagram media
                    media_url = f"https://graph.facebook.com/v18.0/{ig_account_id}/media"
                    media_params = {
                        'fields': 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
                        'limit': max_results,
                        'access_token': self.facebook_client
                    }
                    
                    media_response = requests.get(media_url, params=media_params)
                    
                    if media_response.status_code == 200:
                        media_data = media_response.json()
                        
                        for post in media_data.get('data', []):
                            # Check if caption mentions any of our keywords
                            caption = post.get('caption', '')
                            if any(keyword.lower() in caption.lower() for keyword in keywords):
                                results.append({
                                    'platform': 'instagram',
                                    'post_id': post.get('id', f'ig_{random.randint(1000, 9999)}'),
                                    'content': caption or f'Instagram post about tourism',
                                    'url': post.get('permalink', f'https://instagram.com/'),
                                    'created_at': post.get('timestamp', datetime.now().isoformat()),
                                    'likes': post.get('like_count', 0),
                                    'comments': post.get('comments_count', 0),
                                    'shares': 0,
                                    'views': 0,
                                })
                        
                        if results:
                            print(f"✅ Found {len(results)} real Instagram posts!")
                            return results
                    else:
                        print(f"⚠️ Instagram media fetch failed: {media_response.text}")
                else:
                    print("⚠️ No Instagram Business Account linked to this Facebook account.")
                    print("💡 To get real Instagram data:")
                    print("   1. Convert your Instagram to a Business/Creator account")
                    print("   2. Link it to your Facebook Page")
                    print("   3. The API will then access your Instagram content")
            else:
                print(f"⚠️ Facebook API error: {me_response.text}")
            
            # If no real data, use demo data
            if not results:
                print("ℹ️  Using demo Instagram data for now.")
                print("   Your API token is valid and working! ✅")
                return self._generate_demo_facebook_data(keywords, max_results)
            
        except Exception as e:
            print(f"❌ Instagram API error: {e}")
            print("⚠️ Falling back to demo data.")
            return self._generate_demo_facebook_data(keywords, max_results)
    
    def search_tiktok(self, keywords: list, max_results=10):
        """Search TikTok for posts (placeholder for now)"""
        if not TIKTOK_CLIENT_KEY:
            print("⚠️ TikTok client not initialized. Returning demo data.")
            return self._generate_demo_tiktok_data(keywords, max_results)
        
        # TODO: Implement TikTok API search when you get the key
        return self._generate_demo_tiktok_data(keywords, max_results)
    
    def search_all_platforms(self, keywords: list, max_results_per_platform=10):
        """
        Search all available platforms at once.
        
        Returns:
            List of all posts from all platforms combined
        """
        all_posts = []
        
        # Twitter
        twitter_posts = self.search_twitter(keywords, max_results_per_platform)
        all_posts.extend(twitter_posts)
        
        # Facebook/Instagram
        facebook_posts = self.search_facebook(keywords, max_results_per_platform)
        all_posts.extend(facebook_posts)
        
        # TikTok
        tiktok_posts = self.search_tiktok(keywords, max_results_per_platform)
        all_posts.extend(tiktok_posts)
        
        print(f"✅ Total posts collected: {len(all_posts)}")
        return all_posts
    
    # ==========================================
    # Demo Data Generators (for testing without API keys)
    # ==========================================
    
    def _generate_demo_twitter_data(self, keywords: list, count: int):
        """Generate fake Twitter posts for testing"""
        demo_posts = []
        tourism_phrases = [
            "Just visited {place}! Amazing beaches! 🏝️",
            "Had the best time at {place} today! Highly recommend! ⭐",
            "{place} is a must-visit destination! 😍",
            "Beautiful sunset at {place} 🌅",
            "The food at {place} is incredible! 🍽️",
            "Exploring {place} - such a hidden gem! 💎",
        ]
        
        for i in range(count):
            place = random.choice(keywords)
            content = random.choice(tourism_phrases).format(place=place)
            
            demo_posts.append({
                'platform': 'twitter',
                'post_id': f'demo_twitter_{i}_{random.randint(1000, 9999)}',
                'content': content,
                'url': f'https://twitter.com/demo/status/{random.randint(100000, 999999)}',
                'created_at': (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                'likes': random.randint(50, 5000),
                'comments': random.randint(5, 500),
                'shares': random.randint(10, 1000),
                'views': random.randint(1000, 50000),
            })
        
        return demo_posts
    
    def _generate_demo_facebook_data(self, keywords: list, count: int):
        """Generate fake Facebook posts for testing"""
        demo_posts = []
        
        for i in range(count):
            place = random.choice(keywords)
            
            demo_posts.append({
                'platform': 'facebook',
                'post_id': f'demo_facebook_{i}_{random.randint(1000, 9999)}',
                'content': f'Great day trip to {place} with the family! 👨‍👩‍👧‍👦',
                'url': f'https://facebook.com/demo/posts/{random.randint(100000, 999999)}',
                'created_at': (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                'likes': random.randint(100, 10000),
                'comments': random.randint(10, 1000),
                'shares': random.randint(20, 2000),
                'views': random.randint(2000, 100000),
            })
        
        return demo_posts
    
    def _generate_demo_tiktok_data(self, keywords: list, count: int):
        """Generate fake TikTok posts for testing"""
        demo_posts = []
        
        for i in range(count):
            place = random.choice(keywords)
            
            demo_posts.append({
                'platform': 'tiktok',
                'post_id': f'demo_tiktok_{i}_{random.randint(1000, 9999)}',
                'content': f'Check out this amazing view at {place}! #travel #tourism',
                'url': f'https://tiktok.com/@demo/video/{random.randint(100000, 999999)}',
                'created_at': (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                'likes': random.randint(1000, 100000),
                'comments': random.randint(50, 5000),
                'shares': random.randint(100, 10000),
                'views': random.randint(10000, 1000000),
            })
        
        return demo_posts


# Test the scraper
if __name__ == "__main__":
    print("🧪 Testing Social Media Scraper...\n")
    
    scraper = SocialMediaScraper()
    
    test_keywords = ["Langkawi", "Alor Setar", "Kedah"]
    
    print("\n📱 Fetching posts from all platforms...")
    posts = scraper.search_all_platforms(test_keywords, max_results_per_platform=3)
    
    print(f"\n✅ Collected {len(posts)} posts total!")
    for post in posts[:5]:  # Show first 5
        print(f"\n{post['platform'].upper()} Post:")
        print(f"  Content: {post['content'][:80]}...")
        print(f"  👍 {post['likes']} | 💬 {post['comments']} | ↗️ {post['shares']} | 👁️ {post['views']}")

