import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import html2canvas from 'html2canvas';
// import { captureJacketDesign, generateJacketFilename } from '@/utils/jacketImageCapture';
import { 
  Palette, 
  Image, 
  RotateCcw, 
  ShoppingCart,
  Eye,
  Trash2
} from 'lucide-react';
import JacketScene from '../components/3D/JacketScene';
import { toast } from '@/components/ui/use-toast';

const CustomConfigurator = () => {
  const { currency, convertPrice, getCurrencySymbol } = useCurrency();
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
  useEffect(() => { currentViewRef.current = currentView; }, [currentView]);
  const sizeChangeTimeoutRef = useRef<NodeJS.Timeout>();
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const jacketSceneRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [customDescription, setCustomDescription] = useState('');
  
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
      let reason = 'Logo placement';
      
      // Add size upgrade cost for larger logos
      if (logo.size > 80) {
        logoCost += sizeUpgradeCost;
        reason = 'Logo placement + Size upgrade';
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
    
    const totalInEUR = basePrice + logoCosts.totalLogoCost + colorCost.cost;
    
    return {
      basePrice: convertPrice(basePrice),
      logoCosts: convertPrice(logoCosts.totalLogoCost),
      colorCost: convertPrice(colorCost.cost),
      total: convertPrice(totalInEUR),
      totalInEUR // Keep EUR value for backend
    };
  }, [basePrice, calculateLogoCosts, calculateColorCost, convertPrice]);

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
          alt="Logo" 
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
              alt="Logo"
              className="opacity-90 drop-shadow-lg pointer-events-none" 
              style={{
                width: `${FIXED_LOGO_SIZE}px`, 
                height: `${FIXED_LOGO_SIZE}px`,
                display: 'block'
              }}
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
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
            className={`px-4 py-2 mt-5 mb-10 rounded-lg font-medium transition-all duration-200 ${
              currentView === 'front'
                ? 'bg-foreground text-background shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            Front View
          </button>
          <button
            onClick={() => setCurrentView('back')}
            className={`px-4 py-2 mt-5 mb-10 rounded-lg font-medium transition-all duration-200 ${
              currentView === 'back'
                ? 'bg-foreground text-background shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            Back View
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
    setSelectedSize('M');
    setCustomDescription('');
  };

  const { addCustomJacketToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    // We'll query the canvas and overlay inside captureView after DOM updates
    setIsAddingToCart(true);
    try {

      // Helper to composite 3D canvas and overlay
      const captureView = async (view: 'front' | 'back') => {
        // Only update props, never unmount JacketScene
        if (currentViewRef.current !== view) {
          setCurrentView(view);
          // Wait for the prop to propagate and the scene to update
          await new Promise(r => setTimeout(r, 100));
        }
        await new Promise(r => requestAnimationFrame(r));
        // Wait for canvas and overlay to be available (poll up to 2s)
        let jacketCanvas = null;
        let overlayContainer = null;
        const maxTries = 40; // 40 x 50ms = 2s
        let tries = 0;
        while (tries < maxTries) {
          jacketCanvas = jacketSceneRef.current?.querySelector('canvas');
          overlayContainer = logoContainerRef.current;
          if (
            jacketCanvas &&
            overlayContainer &&
            jacketCanvas.width > 0 &&
            jacketCanvas.height > 0 &&
            jacketCanvas.getBoundingClientRect().width > 0 &&
            jacketCanvas.getBoundingClientRect().height > 0
          ) {
            break;
          }
          await new Promise(res => setTimeout(res, 50));
          tries++;
        }
        if (!jacketCanvas || !overlayContainer) {
          throw new Error(
            `3D canvas or overlay container not available after view switch (tried ${tries} times, view=${view})`
          );
        }
        if (
          jacketCanvas.width === 0 ||
          jacketCanvas.height === 0 ||
          jacketCanvas.getBoundingClientRect().width === 0 ||
          jacketCanvas.getBoundingClientRect().height === 0
        ) {
          throw new Error(
            `3D canvas is present but has zero size (width=${jacketCanvas.width}, height=${jacketCanvas.height}, rect=${JSON.stringify(jacketCanvas.getBoundingClientRect())}, view=${view})`
          );
        }
        // Optionally scroll into view to force rendering
        if (typeof jacketCanvas.scrollIntoView === 'function') {
          jacketCanvas.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
        // 1. Capture 3D canvas as image
        const jacketDataUrl = jacketCanvas.toDataURL('image/png', 0.92);
        // 2. Capture overlay as image
        const overlayCanvas = await html2canvas(overlayContainer, { backgroundColor: null, useCORS: true, scale: 2 });
        // 3. Composite both onto a new canvas
        const width = jacketCanvas.width;
        const height = jacketCanvas.height;
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = width;
        finalCanvas.height = height;
        const ctx = finalCanvas.getContext('2d');
        if (!ctx) throw new Error('Unable to get canvas context');
        // Draw 3D jacket
        const jacketImg = new window.Image();
        jacketImg.src = jacketDataUrl;
        await new Promise(res => { jacketImg.onload = res; });
        ctx.drawImage(jacketImg, 0, 0, width, height);
        // Draw overlay
        ctx.drawImage(overlayCanvas, 0, 0, width, height);
        return finalCanvas.toDataURL('image/png', 0.92);
      };

      // Capture both front and back
      const frontImage = await captureView('front');
      const backImage = await captureView('back');

      // Validate that we have valid data URLs
      if (!frontImage.startsWith('data:image/') || !backImage.startsWith('data:image/')) {
        throw new Error('Invalid image data captured - not a valid data URL');
      }

      // Create custom jacket item with base64 images
      const customJacket = {
        type: 'custom_jacket' as const,
        name: 'Custom Leather Jacket',
        color: selectedColor,
        size: selectedSize, // Use selected size instead of hardcoded 'M'
        quantity: 1,
        price: calculateTotalCost().totalInEUR, // Send EUR price to backend
        frontImageUrl: frontImage, // Use actual captured front image
        backImageUrl: backImage,   // Use actual captured back image
        logos: logos.map(logo => ({
          id: logo.id,
          src: logo.src,
          position: logo.position,
          view: logo.view
        })),
        customDescription: customDescription || undefined
      };

      await addCustomJacketToCart(customJacket);
      toast({ title: 'Success', description: 'Custom jacket added to cart!' });
      resetConfigurator();
    } catch (error) {
      let errorMessage = 'Failed to add custom jacket to cart';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({ 
        title: 'Error', 
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Custom Jacket Configurator</h1>
            <p className="text-muted-foreground">Design your perfect leather jacket with custom colors and logos</p>
          </div>
        </div>
        
        {/* Preview Section */}
        {/* Removed preview section */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Design Options */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Design Options</h2>
            
            {/* Color Options (primary only; sleeve colors are applied when model supports it) */}
            <div className="mb-8">
              <button
                onClick={() => setShowColorOptions(!showColorOptions)}
                className="flex items-center justify-between w-full text-foreground font-semibold mb-3"
              >
                <div className="flex items-center space-x-2">
                  <Palette size={20} />
                  <span>Colors</span>
                </div>
                <span className={`transform transition-transform ${showColorOptions ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showColorOptions && (
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground text-sm mb-2 block">Primary Color</label>
                    
                    {/* Current Color Display */}
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Current Selection:</div>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-foreground shadow-sm"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {selectedColor === '#000000' && 'Classic Black'}
                          {selectedColor === '#3E2723' && 'Dark Brown'}
                          {selectedColor === '#0A1F3A' && 'Dark Blue'}
                          {selectedColor === '#4A0000' && 'Dark Burgundy'}
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
                  <span>Logo Selection</span>
                </div>
                <span className={`transform transition-transform ${showLogoOptions ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showLogoOptions && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-3">
                    Drag and drop logos from below onto the jacket, or click to select. Then drag the logo on the jacket to position it.
                  </div>
                  
                  {/* Logo Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {availableLogos.map((logoName) => (
                      <div
                        key={logoName}
                        className="relative group cursor-pointer"
                        draggable
                        onDragStart={(e) => handleLogoDragStart(e, logoName)}
                        onClick={() => selectLogo(logoName)}
                      >
                        <div className="w-full h-14 bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-foreground hover:bg-muted/80 transition-all duration-200 overflow-hidden">
                          <img 
                            src={`/icons/${logoName}`}
                            alt={logoName}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallbackIcon = document.createElement('div');
                                fallbackIcon.innerHTML = '<svg class="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                parent.appendChild(fallbackIcon);
                              }
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground text-center mt-1 truncate group-hover:text-foreground transition-colors">
                          {logoName.replace('.png', '').replace('.jpg', '').replace('.jpeg', '').replace('.svg', '').replace('.gif', '')}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Drop Zone Info */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs text-blue-800 space-y-1">
                      <div><strong>Tip:</strong> Drag any logo above and drop it onto the jacket area to apply it.</div>
                    </div>
                  </div>

                  {/* Logo Size Display */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        Logo Size
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {FIXED_LOGO_SIZE}px (Fixed)
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
                      All logos use a consistent {FIXED_LOGO_SIZE}px size for uniform appearance
                    </div>
                  </div>

                  {/* Logo Management */}
                  {logos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          Logo Management
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {logos.length} logo{logos.length !== 1 ? 's' : ''}
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
                                  alt="Logo" 
                                  className="w-6 h-6 rounded border border-border"
                                />
                                <span className="text-sm text-foreground">Logo {logo.id}</span>
                            </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground capitalize">
                                  {logo.view} view
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
                  <span>Custom Instructions</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Add any special requirements, custom details, or specific instructions for your order.
                </div>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe any special requirements, custom details, or specific instructions for your jacket order..."
                  className="w-full h-32 p-3 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
                  maxLength={500}
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Optional - Help us understand your vision better</span>
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
              <span>Reset Design</span>
            </button>
          </div>

          {/* Center - 3D Jacket Display */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <JacketDisplay />
          </div>

          {/* Right Sidebar - Product Info */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Product Details</h2>
            
            <div className="space-y-6">

              <div>
                <h3 className="text-foreground font-semibold mb-2">Custom Leather Jacket</h3>
                <p className="text-muted-foreground text-sm">
                  Premium quality leather jacket with full customization. 
                </p>
              </div>

              <div>
                <h3 className="text-foreground font-semibold mb-2">Features</h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Genuine leather construction</li>
                  <li>• Premium leather finish</li>
                  <li>• YKK metal zippers</li>
                  <li>• Real-time 3D preview</li>
                </ul>
                <div className="bg-muted rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-foreground font-semibold">Price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {getCurrencySymbol()}{calculateTotalCost().total.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-5">All customization costs included</p>
                  <div className="text-xs font-medium text-foreground mb-2">Cost Breakdown:</div>
              
              {/* Base Price */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Base Jacket</span>
                <span className="font-medium">{getCurrencySymbol()}{calculateTotalCost().basePrice.toFixed(2)}</span>
              </div>
              
              {/* Logo Costs */}
              {calculateLogoCosts().totalLogoCost > 0 && (
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Logo Customization</span>
                    <span className="font-medium">{getCurrencySymbol()}{calculateTotalCost().logoCosts.toFixed(2)}</span>
                  </div>
                  {calculateLogoCosts().logoBreakdown.map((logo) => (
                    <div key={logo.id} className="flex justify-between items-center text-xs ml-2">
                      <span className="text-muted-foreground">{logo.reason}</span>
                      <span className="font-medium">{getCurrencySymbol()}{convertPrice(logo.cost).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Color Cost */}
              {calculateColorCost().cost > 0 && (
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-muted-foreground">Premium Color</span>
                  <span className="font-medium">{getCurrencySymbol()}{calculateTotalCost().colorCost.toFixed(2)}</span>
                </div>
              )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-muted-foreground text-sm mb-1 block">Size</label>
                  <select 
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">2X Large (XXL)</option>
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
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                <span>Add to Cart</span>
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