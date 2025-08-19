import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import html2canvas from 'html2canvas';
// import { captureJacketDesign, generateJacketFilename } from '@/utils/jacketImageCapture';
import { 
  Palette, 
  Image, 
  RotateCcw, 
  ShoppingCart,
  Trash2
} from 'lucide-react';
import JacketScene from '../components/3D/JacketScene';
import { toast } from '@/components/ui/use-toast';

const CustomConfigurator = () => {
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [logos, setLogos] = useState<Array<{
    id: string;
    src: string;
    position: { x: number; y: number };
    size: number;
    view: 'front' | 'back';
  }>>([]);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  const [showColorOptions, setShowColorOptions] = useState(true);
  const [showLogoOptions, setShowLogoOptions] = useState(true);
  const [availableLogos, setAvailableLogos] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
  // Keep JacketScene always mounted, only update props
  // Use a ref to store the current view for captureView to avoid remounts
  const currentViewRef = useRef<'front' | 'back'>('front');
  useEffect(() => { 
    currentViewRef.current = currentView; 
  }, [currentView]);
  const sizeChangeTimeoutRef = useRef<NodeJS.Timeout>();
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const jacketSceneRef = useRef<HTMLDivElement>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  
  // Fixed logo size - no more adjustable sizing
  const FIXED_LOGO_SIZE = 48; // 48px fixed size for all logos

  // Cost calculation system
  const basePrice = 199.99; // Base jacket price
  const baseLogoCost = 15.99; // Cost per logo
  const sizeUpgradeCost = 25.99; // Cost for larger logo sizes
  const premiumColorCost = 29.99; // Cost for premium colors

  // Cost calculation functions
  const calculateLogoCosts = useCallback(() => {
    let totalLogoCost = 0;
    let logoBreakdown: Array<{ id: string; cost: number; reason: string }> = [];
    
    logos.forEach(logo => {
      let logoCost = baseLogoCost; // Base logo cost
      let reason = t('customJacket.logoPlacement');
      
      // Add size upgrade cost for larger logos
      if (logo.size > 80) {
        logoCost += sizeUpgradeCost;
        reason = t('customJacket.logoPlacementSizeUpgrade');
      }
      
      totalLogoCost += logoCost;
      logoBreakdown.push({ id: logo.id, cost: logoCost, reason });
    });
    
    return { totalLogoCost, logoBreakdown };
  }, [logos]);

  const calculateColorCost = useCallback(() => {
    // Premium colors cost extra
    const premiumColors = ['#0A1F3A', '#4A0000']; // Dark blue and burgundy
    if (premiumColors.includes(selectedColor)) {
      return { cost: premiumColorCost, isPremium: true };
    }
    return { cost: 0, isPremium: false };
  }, [selectedColor]);

  const calculateTotalCost = useCallback(() => {
    const logoCosts = calculateLogoCosts();
    const colorCost = calculateColorCost();
    
    return {
      basePrice,
      logoCosts: logoCosts.totalLogoCost,
      colorCost: colorCost.cost,
      total: basePrice + logoCosts.totalLogoCost + colorCost.cost
    };
  }, [basePrice, calculateLogoCosts, calculateColorCost]);

  // Custom slider styles
  const sliderStyles: React.CSSProperties = {
    WebkitAppearance: 'none' as const,
    appearance: 'none' as const,
    height: '8px',
    borderRadius: '4px',
    background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
    outline: 'none',
    cursor: 'pointer',
  };

  const thumbStyles: React.CSSProperties = {
    WebkitAppearance: 'none' as const,
    appearance: 'none' as const,
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#3b82f6',
    cursor: 'pointer',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  // Dynamically load logos from public/icons folder
  useEffect(() => {
    const loadLogos = async () => {
      try {
        // Use import.meta.glob to dynamically import all images from public/icons
        const logoModules = import.meta.glob('/public/icons/*.{png,jpg,jpeg,svg,gif}', { eager: true });
        
        const logoPaths = Object.keys(logoModules).map(path => {
          // Extract just the filename from the full path
          const filename = path.split('/').pop();
          return filename || '';
        }).filter(filename => filename.length > 0);
        
        setAvailableLogos(logoPaths);
      } catch (error) {
        console.warn('Could not load logos dynamically, using fallback:', error);
        // Fallback to some common logo names if dynamic loading fails
        setAvailableLogos(['logo1.png', 'logo2.png', 'logo3.png']);
      }
    };

    loadLogos();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (sizeChangeTimeoutRef.current) {
        clearTimeout(sizeChangeTimeoutRef.current);
      }
    };
  }, []);

  const handleLogoDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const logoName = event.dataTransfer.getData('text/plain');
    if (logoName) {
      addLogo(logoName);
    }
  };

  const handleLogoDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleLogoDragStart = (event: React.DragEvent, logoName: string) => {
    event.dataTransfer.setData('text/plain', logoName);
  };

  const selectLogo = (logoName: string) => {
    addLogo(logoName);
  };

  const addLogo = (src: string) => {
    const newLogo = {
      id: Date.now().toString(),
      src: `/icons/${src}`,
      position: { x: 50, y: 50 },
      size: FIXED_LOGO_SIZE,
      view: currentView
    };
    setLogos(prev => [...prev, newLogo]);
    setSelectedLogoId(newLogo.id);
  };

  const updateLogoPosition = useCallback((logoId: string, newPosition: { x: number; y: number }) => {
    // Constrain logo position to stay within jacket boundaries
    const constrainedPosition = {
      x: Math.max(10, Math.min(90, newPosition.x)), // Keep within 10% to 90% of canvas
      y: Math.max(10, Math.min(90, newPosition.y))  // Keep within 10% to 90% of canvas
    };
    
    setLogos(prev => {
      const logoIndex = prev.findIndex(logo => logo.id === logoId);
      if (logoIndex === -1) return prev;
      
      const currentLogo = prev[logoIndex];
      // Only update if position actually changed
      if (Math.abs(currentLogo.position.x - constrainedPosition.x) < 0.1 && 
          Math.abs(currentLogo.position.y - constrainedPosition.y) < 0.1) {
        return prev;
      }
      
      const newLogos = [...prev];
      newLogos[logoIndex] = { ...currentLogo, position: constrainedPosition };
      return newLogos;
    });
  }, []);

  const updateLogoSize = useCallback((logoId: string, newSize: number) => {
    setLogos(prev => {
      const logoIndex = prev.findIndex(logo => logo.id === logoId);
      if (logoIndex === -1) return prev;
      
      const currentLogo = prev[logoIndex];
      if (currentLogo.size === newSize) return prev;
      
      const newLogos = [...prev];
      newLogos[logoIndex] = { ...currentLogo, size: newSize };
      return newLogos;
    });
  }, []);

  const deleteLogo = (logoId: string) => {
    setLogos(prev => prev.filter(logo => logo.id !== logoId));
    if (selectedLogoId === logoId) {
      setSelectedLogoId(null);
    }
  };

  const moveLogoToView = (logoId: string, newView: 'front' | 'back') => {
    setLogos(prev => prev.map(logo => 
      logo.id === logoId 
        ? { ...logo, view: newView }
        : logo
    ));
  };

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (selectedLogoId) {
      event.preventDefault();
      event.stopPropagation();
      
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      
      // Check if click is within jacket boundaries (10% to 90% of canvas)
      if (x >= 10 && x <= 90 && y >= 10 && y <= 90) {
        updateLogoPosition(selectedLogoId, { x, y });
      } else {
        // If outside boundaries, snap to nearest valid position
        const constrainedX = Math.max(10, Math.min(90, x));
        const constrainedY = Math.max(10, Math.min(90, y));
        updateLogoPosition(selectedLogoId, { x: constrainedX, y: constrainedY });
      }
    }
  }, [selectedLogoId, updateLogoPosition]);

  // Memoized logo display to prevent re-renders
  const LogoDisplay = useMemo(() => {
    const currentViewLogos = logos.filter(logo => logo.view === currentView);
    
    return currentViewLogos.map(logo => (
      <div 
        key={logo.id}
        className={`absolute pointer-events-auto z-10 cursor-pointer transition-all duration-200 ${
          selectedLogoId === logo.id ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
        }`}
        style={{ 
          left: `${logo.position.x}%`, 
          top: `${logo.position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedLogoId(logo.id);
        }}
      >
        <img 
          src={logo.src} 
          alt={t('customJacket.logo')} 
          className="opacity-90 drop-shadow-lg pointer-events-none" 
          style={{ width: `${FIXED_LOGO_SIZE}px`, height: `${FIXED_LOGO_SIZE}px` }}
          draggable={false}
        />
      </div>
    ));
  }, [logos, currentView, selectedLogoId, FIXED_LOGO_SIZE]);

  // Separate Logo Overlay Component to prevent jacket re-renders
  const LogoOverlay = useMemo(() => {
    const currentViewLogos = logos.filter(logo => logo.view === currentView);
    
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {currentViewLogos.map(logo => (
          <div 
            key={logo.id}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 ${
              selectedLogoId === logo.id ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
            }`}
            style={{ 
              left: `${logo.position.x}%`, 
              top: `${logo.position.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedLogoId(logo.id);
            }}
          >
            <img 
              src={logo.src} 
              alt={t('customJacket.logo')}
              className="opacity-90 drop-shadow-lg pointer-events-none" 
              style={{
                width: `${FIXED_LOGO_SIZE}px`, 
                height: `${FIXED_LOGO_SIZE}px`,
                display: 'block'
              }}
              draggable={false}
              onError={(e) => {
                console.error('Failed to load logo:', logo.src);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Logo loaded successfully:', logo.src);
              }}
            />
        </div>
        ))}
      </div>
    );
  }, [logos, currentView, selectedLogoId, FIXED_LOGO_SIZE]);

  const colors = [
    '#000000', // Classic Black
    '#3E2723', // Dark Brown
    '#0A1F3A', // Dark Blue
    '#4A0000'  // Very Dark Burgundy
  ];

  const handleLogoClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const JacketDisplay = () => {
    // Only update props, never unmount/remount JacketScene
    return (
      <div className="space-y-2">
        {/* View Toggle Buttons */}
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentView('front')}
            className={`px-4 py-2 mt-20 mb-10 rounded-lg font-medium transition-all duration-200 ${
              currentView === 'front'
                ? 'bg-foreground text-background shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
                              {t('customJacket.frontView')}
          </button>
          <button
            onClick={() => setCurrentView('back')}
            className={`px-4 py-2 mt-20 mb-10 rounded-lg font-medium transition-all duration-200 ${
              currentView === 'back'
                ? 'bg-foreground text-background shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
                              {t('customJacket.backView')}
          </button>
        </div>

        {/* Jacket Canvas - always mounted */}
        <div 
          className="relative"
          onDrop={handleLogoDrop}
          onDragOver={handleLogoDragOver}
          onClick={handleCanvasClick}
        >
          <div ref={jacketSceneRef} data-jacket-canvas>
            <JacketScene 
              bodyColor={selectedColor} 
              view={currentView}
            />
          </div>
          <div ref={logoContainerRef} data-jacket-canvas className="absolute inset-0 pointer-events-none">
            {LogoOverlay}
          </div>
        </div>
      </div>
    );
  };

  const resetConfigurator = () => {
    setSelectedColor('#000000');
    setLogos([]);
    setSelectedLogoId(null);
    setCustomDescription('');
    setSelectedSize('M');
  };

  const { addCustomJacketToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Enhanced image capture that properly composites 3D canvas with logo overlays
  const captureView = async (view: 'front' | 'back') => {
    console.log(`🎯 Capturing ${view} view...`);
    
    // Switch to the target view if needed
    if (currentView !== view) {
      console.log(`🔄 Switching from ${currentView} to ${view} view...`);
      setCurrentView(view);
      
      // Wait for the 3D scene to render the new view
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`✅ View switched to ${view}`);
    }
    
    // Additional wait to ensure 3D scene is fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Wait for the next frame to ensure rendering is complete
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Get the 3D canvas
    const jacketCanvas = jacketSceneRef.current?.querySelector('canvas');
    console.log(`🎨 Canvas element:`, jacketCanvas);
    
    if (!jacketCanvas) {
      throw new Error(`3D canvas not found for ${view} view`);
    }
    
    // Ensure canvas has proper dimensions
    console.log(`📏 Canvas dimensions: ${jacketCanvas.width}x${jacketCanvas.height}`);
    if (jacketCanvas.width === 0 || jacketCanvas.height === 0) {
      throw new Error(`3D canvas has invalid dimensions for ${view} view`);
    }
    
    // Get the canvas bounding rect for accurate positioning
    const canvasRect = jacketCanvas.getBoundingClientRect();
    console.log(`📐 Canvas rect:`, canvasRect);
    
    // Capture the 3D canvas as base image
    console.log(`📸 Capturing base canvas...`);
    const baseImageDataUrl = jacketCanvas.toDataURL('image/png', 0.9);
    console.log(`✅ Base image captured, length: ${baseImageDataUrl.length}`);
    
    // Create a new canvas to composite the final image
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = jacketCanvas.width;
    finalCanvas.height = jacketCanvas.height;
    const ctx = finalCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context for image composition');
    }
    
    // Load the base jacket image
    const baseImage = document.createElement('img');
    baseImage.crossOrigin = 'anonymous';
    
    await new Promise<void>((resolve, reject) => {
      baseImage.onload = () => resolve();
      baseImage.onerror = () => reject(new Error('Failed to load base jacket image'));
      baseImage.src = baseImageDataUrl;
    });
    
    // Draw the base jacket image
    ctx.drawImage(baseImage, 0, 0, finalCanvas.width, finalCanvas.height);
    console.log(`✅ Base jacket image drawn to final canvas`);
    
    // Get logos for the current view
    const currentViewLogos = logos.filter(logo => logo.view === view);
    console.log(`🎯 Found ${currentViewLogos.length} logos for ${view} view`);
    
    // Overlay logos on the canvas with proper positioning
    for (const logo of currentViewLogos) {
      try {
        console.log(`🎨 Processing logo ${logo.id}:`, logo);
        
        // Load the logo image
        const logoImage = document.createElement('img');
        logoImage.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          logoImage.onload = () => resolve();
          logoImage.onerror = () => reject(new Error(`Failed to load logo ${logo.id}`));
          logoImage.src = logo.src;
        });
        
        // Calculate logo position in pixels based on percentage positioning
        // The logo.position.x and y are percentages (0-100) relative to the canvas
        const logoX = (logo.position.x / 100) * finalCanvas.width;
        const logoY = (logo.position.y / 100) * finalCanvas.height;
        
        console.log(`📍 Logo ${logo.id} positioned at ${logo.position.x}%, ${logo.position.y}% -> pixels: (${logoX}, ${logoY})`);
        
        // Draw the logo at the calculated position, centered on the position point
        ctx.drawImage(
          logoImage,
          logoX - (logo.size / 2), // Center the logo horizontally
          logoY - (logo.size / 2), // Center the logo vertically
          logo.size,
          logo.size
        );
        
        console.log(`✅ Logo ${logo.id} overlaid successfully at pixel position (${logoX}, ${logoY})`);
        
      } catch (logoError) {
        console.warn(`⚠️ Failed to overlay logo ${logo.id}:`, logoError);
        // Continue with other logos even if one fails
      }
    }
    
    const finalImageDataUrl = finalCanvas.toDataURL('image/png', 0.9);
    console.log(`🎉 Final ${view} image captured, length: ${finalImageDataUrl.length}`);
    return finalImageDataUrl;
  };

  const handleAddToCart = async () => {
    console.log('🎯 handleAddToCart called');
    setIsAddingToCart(true);
    
    try {

      // Capture both front and back views
      console.log('📸 Capturing front view...');
      const frontImage = await captureView('front');
      
      console.log('📸 Capturing back view...');
      const backImage = await captureView('back');

      // Validate captured images
      if (!frontImage.startsWith('data:image/') || !backImage.startsWith('data:image/')) {
        throw new Error('Failed to capture valid jacket images');
      }

      console.log('✅ Images captured successfully');
      console.log('Front image size:', frontImage.length);
      console.log('Back image size:', backImage.length);

      // Create custom jacket item
      const customJacket = {
        type: 'custom_jacket' as const,
        name: 'Custom Leather Jacket',
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
        price: calculateTotalCost().total,
        frontImageUrl: frontImage,
        backImageUrl: backImage,
        logos: logos.map(logo => ({
          id: logo.id,
          src: logo.src,
          position: logo.position,
          view: logo.view
        })),
        customDescription: customDescription || undefined
      };

      // Add to cart
      await addCustomJacketToCart(customJacket);
      toast({ 
        title: t('customJacket.success'), 
        description: t('customJacket.addedToCart') 
      });
      
      // Reset the configurator
      resetConfigurator();
      
    } catch (error) {
      console.error('❌ Error adding custom jacket to cart:', error);
      
      let errorMessage = t('customJacket.captureFailed');
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: t('customJacket.captureFailedTitle'), 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('customJacket.configurator')}</h1>
            <p className="text-muted-foreground">{t('customJacket.designDescription')}</p>
          </div>
        </div>
        
        {/* Preview Section */}
        {/* Removed preview section */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Design Options */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">{t('customJacket.designOptions')}</h2>
            
            {/* Color Options (primary only; sleeve colors are applied when model supports it) */}
            <div className="mb-8">
              <button
                onClick={() => setShowColorOptions(!showColorOptions)}
                className="flex items-center justify-between w-full text-foreground font-semibold mb-3"
              >
                <div className="flex items-center space-x-2">
                  <Palette size={20} />
                  <span>{t('customJacket.colors')}</span>
                </div>
                <span className={`transform transition-transform ${showColorOptions ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showColorOptions && (
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground text-sm mb-2 block">{t('customJacket.primaryColor')}</label>
                    
                    {/* Current Color Display */}
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">{t('customJacket.currentSelection')}</div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-foreground shadow-sm"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {selectedColor === '#000000' && t('customJacket.classicBlack')}
                          {selectedColor === '#3E2723' && t('customJacket.darkBrown')}
                          {selectedColor === '#0A1F3A' && t('customJacket.darkBlue')}
                          {selectedColor === '#4A0000' && t('customJacket.darkBurgundy')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                            selectedColor === color ? 'border-foreground' : 'border-border'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logo Selection */}
            <div className="mb-8">
                        <button
                onClick={() => setShowLogoOptions(!showLogoOptions)}
                className="flex items-center justify-between w-full text-foreground font-semibold mb-3"
              >
                <div className="flex items-center space-x-2">
                  <Image size={20} />
                  <span>{t('customJacket.logoSelection')}</span>
                </div>
                <span className={`transform transition-transform ${showLogoOptions ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showLogoOptions && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-3">
                    {t('customJacket.logoInstructions')}
                  </div>
                  
                  {/* Logo Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {availableLogos.map((logoName) => (
                      <div
                        key={logoName}
                        className="relative group cursor-pointer"
                        draggable
                        onDragStart={(e) => handleLogoDragStart(e, logoName)}
                        onClick={() => selectLogo(logoName)}
                      >
                        <div className="w-full h-16 bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-foreground hover:bg-muted/80 transition-all duration-200">
                          <Image size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <div className="text-xs text-muted-foreground text-center mt-1 truncate group-hover:text-foreground transition-colors">
                          {logoName}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Drop Zone Info */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs text-blue-800 space-y-1">
                      <div><strong>{t('customJacket.tip')}</strong> {t('customJacket.tipText')}</div>
                    </div>
                  </div>

                  {/* Logo Size Display */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        {t('customJacket.logoSize')}
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {FIXED_LOGO_SIZE}px (Fixed)
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
                      {t('customJacket.logoSizeDescription').replace('{size}', FIXED_LOGO_SIZE.toString())}
                    </div>
                  </div>

                  {/* Logo Management */}
                  {logos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          {t('customJacket.logoManagement')}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {logos.length} {logos.length === 1 ? t('customJacket.logo') : t('customJacket.logos')}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {logos.map((logo) => (
                          <div 
                            key={logo.id}
                            className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                              selectedLogoId === logo.id 
                                ? 'border-foreground bg-foreground/5 shadow-sm' 
                                : 'border-border hover:border-foreground/50 hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedLogoId(logo.id)}
                        >
                          <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img 
                                  src={logo.src} 
                                  alt={t('customJacket.logo')} 
                                  className="w-6 h-6 rounded border border-border"
                                />
                                <span className="text-sm text-foreground">{t('customJacket.logo')} {logo.id}</span>
                            </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground capitalize">
                                  {logo.view} {t('customJacket.view')}
                                </span>
                                <button
                                  onClick={() => deleteLogo(logo.id)}
                                  className="text-destructive hover:text-destructive/80 transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                          </div>
                          </div>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Description */}
            <div className="mb-8">
              <div className="flex items-center justify-between w-full text-foreground font-semibold mb-3">
                <div className="flex items-center space-x-2">
                  <span>📝</span>
                  <span>{t('customJacket.customInstructions')}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {t('customJacket.customInstructionsDescription')}
                </div>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder={t('customJacket.customInstructionsPlaceholder')}
                  className="w-full h-32 p-3 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{t('customJacket.optionalHelp')}</span>
                  <span>{customDescription.length}/500</span>
                </div>
              </div>
            </div>







            {/* Reset Button */}
            <button
              onClick={resetConfigurator}
              className="w-full px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>{t('customJacket.resetDesign')}</span>
            </button>
          </div>

          {/* Center - 3D Jacket Display */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <JacketDisplay />
          </div>

          {/* Right Sidebar - Product Info */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">{t('customJacket.productDetails')}</h2>
            
            <div className="space-y-6">

              <div>
                <h3 className="text-foreground font-semibold mb-2">{t('customJacket.customLeatherJacket')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('customJacket.premiumQualityDescription')}
                </p>
              </div>

              <div>
                <h3 className="text-foreground font-semibold mb-2">{t('customJacket.features')}</h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• {t('customJacket.genuineLeatherConstruction')}</li>
                  <li>• {t('customJacket.premiumLeatherFinish')}</li>
                  <li>• {t('customJacket.ykkMetalZippers')}</li>
                  <li>• {t('customJacket.realTime3dPreview')}</li>
                </ul>
                <div className="bg-muted rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-foreground font-semibold">{t('customJacket.price')}</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${calculateTotalCost().total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-5">{t('customJacket.allCostsIncluded')}</p>
                  <div className="text-xs font-medium text-foreground mb-2">{t('customJacket.costBreakdown')}</div>
              
              {/* Base Price */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t('customJacket.baseJacket')}</span>
                <span className="font-medium">${basePrice}</span>
              </div>
              
              {/* Logo Costs */}
              {calculateLogoCosts().totalLogoCost > 0 && (
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{t('customJacket.logoCustomization')}</span>
                    <span className="font-medium">${calculateLogoCosts().totalLogoCost}</span>
                  </div>
                  {calculateLogoCosts().logoBreakdown.map((logo) => (
                    <div key={logo.id} className="flex justify-between items-center text-xs ml-2">
                      <span className="text-muted-foreground">{logo.reason}</span>
                      <span className="font-medium">${logo.cost}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Color Cost */}
              {calculateColorCost().cost > 0 && (
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-muted-foreground">{t('customJacket.premiumColor')}</span>
                  <span className="font-medium">${calculateColorCost().cost}</span>
                </div>
              )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-muted-foreground text-sm mb-1 block">{t('customJacket.size')}</label>
                  <select 
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    <option value="S">{t('customJacket.small')} (S)</option>
                    <option value="M">{t('customJacket.medium')} (M)</option>
                    <option value="L">{t('customJacket.large')} (L)</option>
                    <option value="XL">{t('customJacket.extraLarge')} (XL)</option>
                    <option value="XXL">{t('customJacket.twoXLarge')} (XXL)</option>
                  </select>
                </div>
              </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('customJacket.addingToCart')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                <span>{t('customJacket.addToCart')}</span>
                  </>
                )}
                </button>
              </div>
            </div>
          </div>
        
        {/* Preview Section */}
        {/* Removed preview section */}
        </div>
      </div>
    </div>
  );
};

export default CustomConfigurator;