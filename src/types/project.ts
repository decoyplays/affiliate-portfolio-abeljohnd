export type PortfolioFilter =
  | 'All'
  | 'TikTok Affiliate'
  | 'Shopee Affiliate'
  | 'Tech Products'
  | 'Computer'
  | 'Accessories';

export interface Project {
  id: string;
  title: string;
  category: string;
  platform: 'TikTok Affiliate' | 'Shopee Affiliate';
  video: string;
  thumbnail: string;
  description: string;
  services: string[];
  filters: Exclude<PortfolioFilter, 'All'>[];
}