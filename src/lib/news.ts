export interface NewsArticle {
  title: string;
  description: string;
  image_url: string;
  link: string;
}

export async function fetchTopNews(category: string = 'top'): Promise<NewsArticle[]> {
  const API_KEY = 'pub_58ffc089888543dd93de0892d0305440';
  const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&language=en&category=${category}&image=1`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    const articles = data.results
      .filter((item: any) => item.image_url && item.title)
      .slice(0, 5)
      .map((item: any) => ({
        title: item.title,
        description: item.description || item.content || 'No description available.',
        image_url: item.image_url,
        link: item.link
      }));
      
    return articles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}
