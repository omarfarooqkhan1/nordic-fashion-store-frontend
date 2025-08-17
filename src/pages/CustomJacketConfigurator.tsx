import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { captureJacketDesign, generateJacketFilename } from '@/utils/jacketImageCapture';
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
  const sizeChangeTimeoutRef = useRef<NodeJS.Timeout>();
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const jacketSceneRef = useRef<HTMLDivElement>(null);
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
      id: Date.now(),
      src: `/icons/${src}`, // Construct full path to public/icons folder
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

  const JacketDisplay = () => (
    <div className="space-y-4">
      {/* View Toggle Buttons */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setCurrentView('front')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentView === 'front'
              ? 'bg-foreground text-background shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          Front View
        </button>
        <button
          onClick={() => setCurrentView('back')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentView === 'back'
              ? 'bg-foreground text-background shadow-lg'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          Back View
        </button>
      </div>

      {/* Jacket Canvas */}
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

  const resetConfigurator = () => {
    setSelectedColor('#000000');
    setLogos([]);
    setSelectedLogoId(null);
    setCustomDescription('');
  };

  const { addCustomJacketToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    console.log('🎯 handleAddToCart called');
    
    if (!jacketSceneRef.current || !logoContainerRef.current) {
      console.error('❌ Refs not available');
      toast({ title: 'Error', description: 'Cannot capture jacket design', variant: 'destructive' });
      return;
    }

    setIsAddingToCart(true);
    try {
      console.log('Starting jacket capture...');
      console.log('Jacket scene ref:', jacketSceneRef.current);
      console.log('Logo container ref:', logoContainerRef.current);
      console.log('Jacket scene dimensions:', {
        width: jacketSceneRef.current.offsetWidth,
        height: jacketSceneRef.current.offsetHeight
      });
      
      // Capture both front and back views
      const { frontImage, backImage } = await captureJacketDesign(
        jacketSceneRef.current,
        logoContainerRef.current,
        { quality: 0.9, scale: 2 }
      );
      
      console.log('Jacket captured successfully:', { 
        frontImageLength: frontImage.length, 
        backImageLength: backImage.length,
        frontImageStartsWith: frontImage.substring(0, 100),
        backImageStartsWith: backImage.substring(0, 100)
      });
      
      // Validate that we have valid data URLs
      if (!frontImage.startsWith('data:image/') || !backImage.startsWith('data:image/')) {
        throw new Error('Invalid image data captured - not a valid data URL');
      }
      
      console.log('Image validation passed - both are valid data URLs');

      // Create custom jacket item with base64 images
      const customJacket = {
        type: 'custom_jacket' as const,
        name: 'Custom Leather Jacket',
        color: selectedColor,
        size: 'M', // Default size, can be made selectable
        quantity: 1,
        price: calculateTotalCost().total,
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
      
      console.log('Custom jacket object created, sending to backend...');

      // Add to cart (backend will handle Cloudinary upload)
      await addCustomJacketToCart(customJacket);
      
      toast({ title: 'Success', description: 'Custom jacket added to cart!' });
      
      // Reset configurator after successful add
      resetConfigurator();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Provide more specific error information
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Custom Jacket Configurator</h1>
            <p className="text-muted-foreground">Design your perfect leather jacket with custom colors and logos</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">${calculateTotalCost().total.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
            
            {/* Cost Breakdown */}
            <div className="mt-3 p-3 bg-muted rounded-lg text-left min-w-[200px]">
              <div className="text-xs font-medium text-foreground mb-2">Cost Breakdown:</div>
              
              {/* Base Price */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Base Jacket</span>
                <span className="font-medium">${basePrice}</span>
              </div>
              
              {/* Logo Costs */}
              {calculateLogoCosts().totalLogoCost > 0 && (
                <div className="space-y-1 mt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Logo Customization</span>
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
                  <span className="text-muted-foreground">Premium Color</span>
                  <span className="font-medium">${calculateColorCost().cost}</span>
        </div>
      )}
    </div>
          </div>
        </div>
        
        {/* Preview Section */}
        {/* Removed preview section */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Design Options */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Design Options</h2>
            
            {/* 3D Interaction Info */}
            <div className="mb-8">
              <h3 className="text-foreground font-semibold mb-3">3D Controls</h3>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>Drag</strong> to rotate</p>
                  <p>• <strong>Scroll</strong> to zoom</p>
                  <p>• <strong>360°</strong> viewing</p>
                </div>
              </div>
            </div>

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
                      <div><strong>Tip:</strong> Drag any logo above and drop it onto the jacket area to apply it.</div>
                      <div><strong>Boundary:</strong> Logos are automatically constrained to stay within the jacket area (10% to 90% of canvas).</div>
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
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">3D Leather Jacket</h2>
              <p className="text-muted-foreground">Rotate and zoom to explore your custom design</p>
            </div>
            <JacketDisplay />
          </div>

          {/* Right Sidebar - Product Info */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Product Details</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-foreground font-semibold mb-2">Custom Leather Jacket</h3>
                <p className="text-muted-foreground text-sm">
                  Premium quality leather jacket with full 3D customization. 
                  Individual arm color designs and authentic details. 
                  Rotate and explore every angle in real-time.
                </p>
              </div>

              <div>
                <h3 className="text-foreground font-semibold mb-2">Features</h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Genuine leather construction</li>
                  <li>• Individual arm color customization</li>
                  <li>• Premium leather finish</li>
                  <li>• Chest pockets with zippers</li>
                  <li>• Adjustable waist belt</li>
                  <li>• YKK metal zippers</li>
                  <li>• Real-time 3D preview</li>
                </ul>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-foreground font-semibold">Price:</span>
                  <span className="text-2xl font-bold text-green-600">€89.99</span>
                </div>
                <p className="text-muted-foreground text-xs">All customization costs included</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-muted-foreground text-sm mb-1 block">Size</label>
                  <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring">
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