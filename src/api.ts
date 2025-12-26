// This is the in-memory cache for our trending data.
let trendingData: any[] = [];
let lastUpdated: Date | null = null;

// List of crypto "metas" to search for on Twitter.
const METAS_TO_SEARCH = [
  '#SocialFi',
  '#DePIN',
  '#GameFi',
  '#AI',
  '#ICO',
  '#AttentionFi',
  '#RWA',
  '#DeFi',
  '#Layer1',
  '#Layer2',
];

export const fetchTrendingData = async () => {
  console.log('Attempting to fetch trending data...');
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken || bearerToken === 'YOUR_TOKEN_HERE') {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!! Twitter Bearer Token is not configured.');
    console.error('!!! Please create a .env file in the server/ directory');
    console.error('!!! and add your token: TWITTER_BEARER_TOKEN=YOUR_TOKEN_HERE');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    // Keep placeholder data if API key is not set
    trendingData = [
      {
        rank: 1,
        name: 'Misconfigured',
        category: 'Error',
        tweet_volume: 'Please add Twitter API Key',
      },
    ];
    lastUpdated = new Date();
    return;
  }

  console.log('Fetching trending data from Twitter API...');
  try {
    const twitterClient = new TwitterApi(bearerToken).readOnly;

    // Join all metas with OR for a single API query
    const query = METAS_TO_SEARCH.join(' OR ');

    // We need the 'entities' field to accurately count hashtags from the response.
    // We fetch the maximum number of results to get a good sample.
    const response = await twitterClient.v2.search(query, {
      'tweet.fields': 'entities',
      max_results: 100, // Max results per page
    });

    // Initialize a map to store counts for each meta
    const metaTweetCounts = new Map<string, number>();
    METAS_TO_SEARCH.forEach(meta => {
      metaTweetCounts.set(meta.toLowerCase(), 0);
    });

    // The actual tweets are in the 'data' property of the response
    const tweets = response.data?.data || [];

    // Process each tweet to count the occurrences of our target hashtags
    for (const tweet of tweets) {
      if (tweet.entities?.hashtags) {
        for (const hashtag of tweet.entities.hashtags) {
          const currentTag = '#' + hashtag.tag.toLowerCase();
          if (metaTweetCounts.has(currentTag)) {
            metaTweetCounts.set(currentTag, metaTweetCounts.get(currentTag)! + 1);
          }
        }
      }
    }

    // Convert map to array, sort, and format for the frontend
    const sortedMetas = Array.from(metaTweetCounts.entries())
      .map(([meta, count]) => ({
        // Find the original casing for the name from our source array
        name: METAS_TO_SEARCH.find(m => m.toLowerCase() === meta)!,
        tweet_count: count,
      }))
      .filter(meta => meta.tweet_count > 0)
      .sort((a, b) => b.tweet_count - a.tweet_count);

    // Process the data and assign ranks
    trendingData = sortedMetas.map((item, index) => ({
      rank: index + 1,
      name: item.name,
      category: 'Meta',
      tweet_volume: `${item.tweet_count.toLocaleString()} Mentions in Last 100 Tweets`,
    }));
    
    if (trendingData.length === 0) {
        console.log('No trending data found in the last 100 tweets for the given metas.');
        trendingData = [
            {
                rank: 1,
                name: "No recent data",
                category: "Info",
                tweet_volume: "No mentions found in recent tweets"
            }
        ]
    }

    lastUpdated = new Date();
    console.log('Trending data updated from Twitter API.');
  } catch (error: any) {
    console.error('Failed to fetch trending data from Twitter. Full error:');
    console.error(error);

    let errorMessage = 'Could not fetch from Twitter. Check server logs for details.';
    if (error?.code === 429) {
        errorMessage = 'Twitter API rate limit exceeded. Please try again later.';
    }

    // Provide fallback data in case of an API error
    trendingData = [
      {
        rank: 1,
        name: 'API Error',
        category: 'Error',
        tweet_volume: errorMessage,
      },
    ];
    lastUpdated = new Date();
  }
};

export const getTrendingData = () => {
  return {
    data: trendingData,
    lastUpdated,
  };
};
