import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Image as ImageIcon, ZoomIn, ZoomOut, Move, X, Check } from 'lucide-react';

function App() {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [posterImage, setPosterImage] = useState(null);
  const [reelPosition, setReelPosition] = useState('left');
  const [showPreview, setShowPreview] = useState(false);
  
  // Cropping modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState(null); // 'background' or 'poster'
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropImageDimensions, setCropImageDimensions] = useState({ width: 0, height: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropZoomInput, setCropZoomInput] = useState('100');
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Drag and drop state
  const [dragOverField, setDragOverField] = useState(null);
  
  const canvasRefs = {
    preview: useRef(null),
    export1: useRef(null),
    export2: useRef(null),
    export3: useRef(null),
    crop: useRef(null)
  };

  const TARGET_BG_WIDTH = 3240;
  const TARGET_BG_HEIGHT = 1920;
  const POSTER_WIDTH = 790;
  const POSTER_HEIGHT = 1122;
  const POST_WIDTH = 1080;
  const REEL_HEIGHT = 1920;
  const IMAGE_POST_HEIGHT = 1350;

  // Calculate minimum zoom to prevent black borders
  const getMinZoom = (imgWidth, imgHeight, targetWidth, targetHeight) => {
    const targetAspect = targetWidth / targetHeight;
    const imgAspect = imgWidth / imgHeight;
    
    if (imgAspect > targetAspect) {
      return targetHeight / imgHeight;
    } else {
      return targetWidth / imgWidth;
    }
  };

  // Get target dimensions based on crop type
  const getTargetDimensions = () => {
    if (cropType === 'background') {
      return { width: TARGET_BG_WIDTH, height: TARGET_BG_HEIGHT };
    } else {
      return { width: POSTER_WIDTH, height: POSTER_HEIGHT };
    }
  };

  // Handle file selection (click or drop)
  const handleFileSelect = (file, type) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const { width: targetWidth, height: targetHeight } = 
          type === 'background' 
            ? { width: TARGET_BG_WIDTH, height: TARGET_BG_HEIGHT }
            : { width: POSTER_WIDTH, height: POSTER_HEIGHT };
        
        // Calculate minimum zoom for background (to prevent black borders)
        let calculatedMinZoom = 1;
        if (type === 'background') {
          calculatedMinZoom = getMinZoom(img.width, img.height, targetWidth, targetHeight);
        }
        
        setCropImageSrc(event.target.result);
        setCropImageDimensions({ width: img.width, height: img.height });
        setCropType(type);
        setMinZoom(calculatedMinZoom);
        setMaxZoom(3);
        setCropZoom(calculatedMinZoom);
        setCropZoomInput(Math.round(calculatedMinZoom * 100).toString());
        setCropPosition({ x: 0, y: 0 });
        setCropModalOpen(true);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload with click
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    handleFileSelect(file, type);
  };

  // Handle zoom slider change
  const handleZoomSliderChange = (value) => {
    const newZoom = parseFloat(value);
    setCropZoom(newZoom);
    setCropZoomInput(Math.round(newZoom * 100).toString());
  };

  // Handle zoom input field change
  const handleZoomInputChange = (e) => {
    setCropZoomInput(e.target.value);
  };

  // Handle zoom input field blur/enter
  const handleZoomInputCommit = () => {
    let percent = parseInt(cropZoomInput);
    if (isNaN(percent)) {
      percent = Math.round(cropZoom * 100);
    }
    
    const newZoom = Math.max(minZoom, Math.min(maxZoom, percent / 100));
    setCropZoom(newZoom);
    setCropZoomInput(Math.round(newZoom * 100).toString());
  };

  // Drag and drop handlers
  const handleDragOver = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverField(type);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverField(null);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverField(null);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file, type);
  };

  // Cropping canvas drawing
  useEffect(() => {
    if (!cropModalOpen || !cropImageSrc) return;

    const canvas = canvasRefs.crop.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const { width: targetWidth, height: targetHeight } = getTargetDimensions();
      const targetAspect = targetWidth / targetHeight;
      
      // Canvas size for display (scaled down for modal)
      const displayScale = 0.3;
      canvas.width = targetWidth * displayScale;
      canvas.height = targetHeight * displayScale;
      
      // Calculate how the image should be scaled
      const imgAspect = img.width / img.height;
      let scale = cropZoom;
      
      if (cropType === 'background') {
        // Background: fill mode (scale to cover)
        if (imgAspect > targetAspect) {
          scale *= targetHeight / img.height;
        } else {
          scale *= targetWidth / img.width;
        }
      } else {
        // Poster: contain mode (scale to fit)
        if (imgAspect > targetAspect) {
          scale *= targetWidth / img.width;
        } else {
          scale *= targetHeight / img.height;
        }
      }
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Constrain pan position to prevent black borders (for background)
      let constrainedX = cropPosition.x;
      let constrainedY = cropPosition.y;
      
      if (cropType === 'background') {
        const maxOffsetX = Math.max(0, (scaledWidth - targetWidth) / 2);
        const maxOffsetY = Math.max(0, (scaledHeight - targetHeight) / 2);
        constrainedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, cropPosition.x));
        constrainedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, cropPosition.y));
        
        // Update position if it was constrained
        if (constrainedX !== cropPosition.x || constrainedY !== cropPosition.y) {
          setCropPosition({ x: constrainedX, y: constrainedY });
        }
      }
      
      // Clear canvas with appropriate background
      if (cropType === 'background') {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Transparent background for poster - use checkerboard pattern
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw checkerboard pattern
        const checkSize = 10;
        for (let y = 0; y < canvas.height; y += checkSize) {
          for (let x = 0; x < canvas.width; x += checkSize) {
            ctx.fillStyle = ((x / checkSize) + (y / checkSize)) % 2 === 0 ? '#e0e0e0' : '#f5f5f5';
            ctx.fillRect(x, y, checkSize, checkSize);
          }
        }
      }
      
      // Draw image with zoom and pan
      const x = (canvas.width / 2) + (constrainedX * displayScale);
      const y = (canvas.height / 2) + (constrainedY * displayScale);
      
      ctx.drawImage(
        img,
        x - (scaledWidth * displayScale) / 2,
        y - (scaledHeight * displayScale) / 2,
        scaledWidth * displayScale,
        scaledHeight * displayScale
      );
      
      // Draw crop area overlay
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Draw corner markers
      ctx.setLineDash([]);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      const cornerSize = 20;
      
      // Top-left
      ctx.beginPath();
      ctx.moveTo(0, cornerSize);
      ctx.lineTo(0, 0);
      ctx.lineTo(cornerSize, 0);
      ctx.stroke();
      
      // Top-right
      ctx.beginPath();
      ctx.moveTo(canvas.width - cornerSize, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, cornerSize);
      ctx.stroke();
      
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - cornerSize);
      ctx.lineTo(0, canvas.height);
      ctx.lineTo(cornerSize, canvas.height);
      ctx.stroke();
      
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(canvas.width - cornerSize, canvas.height);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(canvas.width, canvas.height - cornerSize);
      ctx.stroke();
    };
    
    img.src = cropImageSrc;
  }, [cropModalOpen, cropImageSrc, cropZoom, cropPosition, cropType]);

  // Handle crop confirmation
  const handleCropConfirm = () => {
    const { width: targetWidth, height: targetHeight } = getTargetDimensions();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const img = new Image();
    img.onload = () => {
      const targetAspect = targetWidth / targetHeight;
      const imgAspect = img.width / img.height;
      
      let scale = cropZoom;
      
      if (cropType === 'background') {
        // Background: fill mode
        if (imgAspect > targetAspect) {
          scale *= targetHeight / img.height;
        } else {
          scale *= targetWidth / img.width;
        }
      } else {
        // Poster: contain mode
        if (imgAspect > targetAspect) {
          scale *= targetWidth / img.width;
        } else {
          scale *= targetHeight / img.height;
        }
      }
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Constrain position for background
      let constrainedX = cropPosition.x;
      let constrainedY = cropPosition.y;
      
      if (cropType === 'background') {
        const maxOffsetX = Math.max(0, (scaledWidth - targetWidth) / 2);
        const maxOffsetY = Math.max(0, (scaledHeight - targetHeight) / 2);
        constrainedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, cropPosition.x));
        constrainedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, cropPosition.y));
      }
      
      const x = (canvas.width / 2) + constrainedX;
      const y = (canvas.height / 2) + constrainedY;
      
      // For poster, clear to transparent
      if (cropType !== 'background') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(
        img,
        x - scaledWidth / 2,
        y - scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
      
      const dataUrl = canvas.toDataURL('image/png');
      
      if (cropType === 'background') {
        setBackgroundImage(dataUrl);
      } else {
        setPosterImage(dataUrl);
      }
      
      setCropModalOpen(false);
      setCropImageSrc(null);
    };
    
    img.src = cropImageSrc;
  };

  // Canvas drag handlers
  const handleCanvasMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setCropPosition(prev => ({
      x: prev.x + deltaX / 0.3, // Adjust for display scale
      y: prev.y + deltaY / 0.3
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Draw preview and export canvases
  useEffect(() => {
    if (!backgroundImage || !posterImage) return;

    const bgImg = new Image();
    const posterImg = new Image();
    
    let bgLoaded = false;
    let posterLoaded = false;

    const drawAll = () => {
      if (!bgLoaded || !posterLoaded) return;

      let posterX;
      if (reelPosition === 'left') {
        posterX = POST_WIDTH / 2 - POSTER_WIDTH / 2;
      } else if (reelPosition === 'center') {
        posterX = POST_WIDTH + POST_WIDTH / 2 - POSTER_WIDTH / 2;
      } else {
        posterX = POST_WIDTH * 2 + POST_WIDTH / 2 - POSTER_WIDTH / 2;
      }
      
      const posterY = TARGET_BG_HEIGHT / 2 - POSTER_HEIGHT / 2;

      const previewCanvas = canvasRefs.preview.current;
      if (previewCanvas) {
        const previewCtx = previewCanvas.getContext('2d');
        const scale = 0.25;
        previewCanvas.width = TARGET_BG_WIDTH * scale;
        previewCanvas.height = IMAGE_POST_HEIGHT * scale;
        
        const cropY = (TARGET_BG_HEIGHT - IMAGE_POST_HEIGHT) / 2;
        previewCtx.drawImage(
          bgImg,
          0, cropY, TARGET_BG_WIDTH, IMAGE_POST_HEIGHT,
          0, 0, TARGET_BG_WIDTH * scale, IMAGE_POST_HEIGHT * scale
        );
        
        previewCtx.drawImage(
          posterImg,
          posterX * scale,
          (posterY - cropY) * scale,
          POSTER_WIDTH * scale,
          POSTER_HEIGHT * scale
        );

        previewCtx.strokeStyle = '#ffffff';
        previewCtx.lineWidth = 2;
        previewCtx.setLineDash([5, 5]);
        previewCtx.beginPath();
        previewCtx.moveTo(POST_WIDTH * scale, 0);
        previewCtx.lineTo(POST_WIDTH * scale, IMAGE_POST_HEIGHT * scale);
        previewCtx.moveTo(POST_WIDTH * 2 * scale, 0);
        previewCtx.lineTo(POST_WIDTH * 2 * scale, IMAGE_POST_HEIGHT * scale);
        previewCtx.stroke();
      }

      const positions = ['left', 'center', 'right'];
      positions.forEach((pos, idx) => {
        const canvas = canvasRefs[`export${idx + 1}`].current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const isReel = pos === reelPosition;
        const xOffset = idx * POST_WIDTH;

        if (isReel) {
          canvas.width = POST_WIDTH;
          canvas.height = REEL_HEIGHT;
          ctx.drawImage(bgImg, xOffset, 0, POST_WIDTH, REEL_HEIGHT, 0, 0, POST_WIDTH, REEL_HEIGHT);
          
          const localPosterX = posterX - xOffset;
          ctx.drawImage(posterImg, localPosterX, posterY, POSTER_WIDTH, POSTER_HEIGHT);
        } else {
          canvas.width = POST_WIDTH;
          canvas.height = IMAGE_POST_HEIGHT;
          const cropY = (TARGET_BG_HEIGHT - IMAGE_POST_HEIGHT) / 2;
          ctx.drawImage(bgImg, xOffset, cropY, POST_WIDTH, IMAGE_POST_HEIGHT, 0, 0, POST_WIDTH, IMAGE_POST_HEIGHT);
          
          if (pos === reelPosition) {
            const localPosterX = posterX - xOffset;
            const localPosterY = posterY - cropY;
            ctx.drawImage(posterImg, localPosterX, localPosterY, POSTER_WIDTH, POSTER_HEIGHT);
          }
        }
      });

      setShowPreview(true);
    };

    bgImg.onload = () => {
      bgLoaded = true;
      drawAll();
    };
    
    posterImg.onload = () => {
      posterLoaded = true;
      drawAll();
    };

    bgImg.src = backgroundImage;
    posterImg.src = posterImage;
  }, [backgroundImage, posterImage, reelPosition]);

  // Export images as ZIP
  const handleExport = async () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    const positions = ['left', 'center', 'right'];
    const files = [];
    
    for (let idx = 0; idx < positions.length; idx++) {
      const pos = positions[idx];
      const canvas = canvasRefs[`export${idx + 1}`].current;
      if (!canvas) continue;

      let fileNum;
      if (pos === 'right') fileNum = 1;
      else if (pos === 'center') fileNum = 2;
      else fileNum = 3;

      const isReel = pos === reelPosition;
      const filename = `${dateStr}_${fileNum}${isReel ? '_reel' : ''}.png`;

      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      files.push({ filename, blob });
    }

    await createZipAndDownload(files, `${dateStr}_instagram-posts.zip`);
  };

  const createZipAndDownload = async (files, zipFilename) => {
    const JSZip = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
    const zip = new JSZip.default();
    
    files.forEach(({ filename, blob }) => {
      zip.file(filename, blob);
    });
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canExport = backgroundImage && posterImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Instagram Grid Post Generator</h1>
          <p className="text-gray-600 mb-8">Erstelle nahtlose 3er-Grid-Posts mit Filmplakat-Overlay</p>

          {/* Upload Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Background Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Hintergrundbild (3240×1920)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'background')}
                  className="hidden"
                  id="bg-upload"
                />
                <label
                  htmlFor="bg-upload"
                  onDragOver={(e) => handleDragOver(e, 'background')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'background')}
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition ${
                    dragOverField === 'background'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {backgroundImage ? (
                    <img src={backgroundImage} alt="Background" className="h-full object-contain" />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Klicken oder Drag & Drop</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Poster Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Filmplakat (790×1122)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'poster')}
                  className="hidden"
                  id="poster-upload"
                />
                <label
                  htmlFor="poster-upload"
                  onDragOver={(e) => handleDragOver(e, 'poster')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'poster')}
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition ${
                    dragOverField === 'poster'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {posterImage ? (
                    <img src={posterImage} alt="Poster" className="h-full object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Klicken oder Drag & Drop</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Position Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Reel Position
            </label>
            <div className="flex gap-4">
              {['left', 'center', 'right'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setReelPosition(pos)}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
                    reelPosition === pos
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Reel {pos === 'left' ? 'Links' : pos === 'center' ? 'Mitte' : 'Rechts'}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Grid-Vorschau</h2>
              <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
                <canvas ref={canvasRefs.preview} className="max-w-full rounded shadow-lg" />
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Gestrichelte Linien zeigen die Post-Grenzen im Instagram-Grid
              </p>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-center">
            <button
              onClick={handleExport}
              disabled={!canExport}
              className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition ${
                canExport
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-6 h-6" />
              ZIP-Datei Exportieren
            </button>
          </div>

          {canExport && (
            <p className="text-sm text-gray-600 text-center mt-4">
              ZIP enthält: {new Date().toISOString().split('T')[0]}_1.png, _2.png, _3_reel.png
            </p>
          )}
        </div>

        {/* Hidden export canvases */}
        <div className="hidden">
          <canvas ref={canvasRefs.export1} />
          <canvas ref={canvasRefs.export2} />
          <canvas ref={canvasRefs.export3} />
        </div>
      </div>

      {/* Cropping Modal */}
      {cropModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {cropType === 'background' ? 'Hintergrundbild' : 'Filmplakat'} anpassen
              </h2>
              <button
                onClick={() => setCropModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 flex justify-center bg-black rounded-lg overflow-hidden">
              <canvas
                ref={canvasRefs.crop}
                onMouseDown={handleCanvasMouseDown}
                className="cursor-move"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <ZoomOut className="w-5 h-5 text-gray-600" />
                <input
                  type="range"
                  min={minZoom}
                  max={maxZoom}
                  step="0.01"
                  value={cropZoom}
                  onChange={(e) => handleZoomSliderChange(e.target.value)}
                  className="flex-1"
                />
                <ZoomIn className="w-5 h-5 text-gray-600" />
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={cropZoomInput}
                    onChange={handleZoomInputChange}
                    onBlur={handleZoomInputCommit}
                    onKeyDown={(e) => e.key === 'Enter' && handleZoomInputCommit()}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Move className="w-4 h-4" />
                <span>Bild mit der Maus verschieben</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCropModalOpen(false)}
                className="flex-1 py-3 px-6 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex-1 py-3 px-6 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Übernehmen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
