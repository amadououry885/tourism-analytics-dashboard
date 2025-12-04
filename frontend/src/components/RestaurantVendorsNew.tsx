import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Star, Users, Search, Heart, ChevronRight, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RestaurantModal } from './RestaurantModal';
import demoData from '../data/restaurants.demo.json';

// City name mappings
const cityNames: Record<string, string> = {
  'langkawi': 'Langkawi',
  'alor-setar': 'Alor Setar', 
  'sungai-petani': 'Sungai Petani',
  'kulim': 'Kulim',
  'jitra': 'Jitra'
};

interface Restaurant {
  id: number;
  name: string;
  city: string;
  cuisine: string;
  rating: number;
  reviews: number;
  priceRange: string;
  image: string;
  specialty: string;
  visitors: number;
  isLive?: boolean;
  isFavorite?: boolean;
  badges?: string[];
}

interface RestaurantVendorsProps {
  timeRange?: string;
  selectedCity: string;
}

export function RestaurantVendors({ selectedCity }: RestaurantVendorsProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(demoData.results || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('rating');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter categories
  const filterCategories = {
    'Filters': ['Colunger', 'Help', 'Ratlns', 'Desryocs', 'MigriblLsats', 'Squarls', 'Coontaty', 'Raylitt', 'Csonits'],
    'Foxture': ['Dspurrels', 'Vauls', 'Palor', 'Palgs'],
    'Categories': ['Nrame', 'Cogtet', 'Dglegants', 'Complants', 'Matens', 'Slpants', 'Pa