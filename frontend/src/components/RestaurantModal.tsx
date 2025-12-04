import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Star, Clock, UtensilsCrossed } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  is_vegetarian: boolean;
  is_halal: boolean;
  spiciness_level: number;
  image_url: string;
}

interface RestaurantModalProps {
  restaurant: any;
  isOpen: boolean;
  onClose: () => void;
}

export function RestaurantModal({ restaurant, isOpen, onClose }: RestaurantModalProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'menu'>('gallery');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Demo gallery images
  const galleryImages = [
    restaurant?.image,
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop',
  ];

  // Demo menu items
  const demoMenuItems: Record<string, MenuItem[]> = {
    'Appetizers': [
      { id: 1, name: 'Spring Rolls', description: 'Fresh vegetables wrapped in rice paper', price: 8.99, is_vegetarian: true, is_halal: true, spiciness_level: 1, image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=150&fit=crop' },
      { id: 2, name: 'Chicken Wings', description: 'Crispy wings with choice of sauce', price: 12.99, is_vegetarian: false, is_halal: true, spiciness_level: 2, image_url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=200&h=150&fit=crop' },
      { id: 3, name: 'Soup of the Day', description: 'Chef\'s special soup', price: 6.99, is_vegetarian: true, is_halal: true, spiciness_level: 0, image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=150&fit=crop' },
    ],
    'Main Courses': [
      { id: 4, name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with vegetables', price: 24.99, is_vegetarian: false, is_halal: false, spiciness_level: 0, image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=150&fit=crop' },
      { id: 5, name: 'Beef Rendang', description: 'Traditional Malaysian slow-cooked beef', price: 22.99, is_vegetarian: false, is_halal: true, spiciness_level: 3, image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=150&fit=crop' },
      { id: 6, name: 'Vegetarian Pasta', description: 'Penne with seasonal vegetables', price: 18.99, is_vegetarian: true, is_halal: true, spiciness_level: 0, image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=150&fit=crop' },
    ],
    'Desserts': [
      { id: 7, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 9.99, is_vegetarian: true, is_halal: true, spiciness_level: 0, image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200&h=150&fit=crop' },
      { id: 8, name: 'Ice Cream Trio', description: 'Three scoops of artisan ice cream', price: 7.99, is_vegetarian: true, is_halal: true, spiciness_level: 0, image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=150&fit=crop' },
    ],
    'Drinks': [
      { id: 9, name: 'Fresh Orange Juice', description: 'Freshly squeezed oranges', price: 5.99, is_vegetarian: true, is_halal: true, spiciness_level: 0, image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&h=150&fit=crop' },
      { id: 10, name: 'Iced Coffee', description: 'Cold brew coffee with ice', price: 4.99, is_vegetarian: true, is_halal: true, spiciness_level: 0, image_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=200&h=150&fit=crop' },
    ],
  };

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      setActiveTab('gallery');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Scroll to top when tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  if (!isOpen || !restaurant) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 99999
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          maxWidth: '1152px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #059669, #0d9488)',
          color: 'white',
          padding: '24px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>{restaurant.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star style={{ width: '16px', height: '16px', fill: 'white' }} />
                  <span>{restaurant.rating || 4.5}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin style={{ width: '16px', height: '16px' }} />
                  <span>{restaurant.city || 'Kedah'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock style={{ width: '16px', height: '16px' }} />
                  <span>Open now</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ width: '24px', height: '24px', color: 'white' }} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: 'white', flexShrink: 0 }}>
          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'gallery' ? '#059669' : '#6b7280',
              borderBottom: activeTab === 'gallery' ? '2px solid #059669' : 'none',
              background: activeTab === 'gallery' ? '#ecfdf5' : 'white'
            }}
          >
            📸 Gallery
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              color: activeTab === 'menu' ? '#059669' : '#6b7280',
              borderBottom: activeTab === 'menu' ? '2px solid #059669' : 'none',
              background: activeTab === 'menu' ? '#ecfdf5' : 'white'
            }}
          >
            📋 Menu
          </button>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: '#f9fafb'
          }}
        >
          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {galleryImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: '8px', overflow: 'hidden', background: '#e5e7eb' }}>
                  <img
                    src={img}
                    alt={`${restaurant.name} - Image ${idx + 1}`}
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.entries(demoMenuItems).map(([category, items]) => (
                <div key={category} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UtensilsCrossed style={{ width: '24px', height: '24px', color: '#059669' }} />
                    {category}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        <div style={{ width: '96px', height: '96px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#e5e7eb' }}>
                          <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <h4 style={{ fontWeight: 'bold' }}>{item.name}</h4>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669', marginLeft: '8px' }}>
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{item.description}</p>
                          
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {item.is_vegetarian && (
                              <span style={{ fontSize: '12px', padding: '4px 8px', background: '#d1fae5', color: '#065f46', borderRadius: '9999px', fontWeight: 500 }}>
                                🌱 Vegetarian
                              </span>
                            )}
                            {item.is_halal && (
                              <span style={{ fontSize: '12px', padding: '4px 8px', background: '#dbeafe', color: '#1e40af', borderRadius: '9999px', fontWeight: 500 }}>
                                ✅ Halal
                              </span>
                            )}
                            {item.spiciness_level > 0 && (
                              <span style={{ fontSize: '12px', padding: '4px 8px', background: '#fee2e2', color: '#991b1b', borderRadius: '9999px', fontWeight: 500 }}>
                                {'🌶️'.repeat(item.spiciness_level)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
