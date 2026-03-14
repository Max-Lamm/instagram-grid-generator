import React, { useState } from 'react';
import { Download } from 'lucide-react';
import CropModal, { initCropState } from './components/CropModal';
import ImageUpload from './components/ImageUpload';
import useCanvasExport from './hooks/useCanvasExport';

function App() {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [posterImage, setPosterImage] = useState(null);
  const [reelPosition, setReelPosition] = useState('left');

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState(null);
  const [cropState, setCropState] = useState(null);

  // Original image data for re-adjusting
  const [backgroundOriginal, setBackgroundOriginal] = useState(null);
  const [posterOriginal, setPosterOriginal] = useState(null);

  // Drag and drop state
  const [dragOverField, setDragOverField] = useState(null);

  const { canvasRefs, showPreview, handleExport } = useCanvasExport(
    backgroundImage, posterImage, reelPosition
  );

  // Handle file selection (from input or drag&drop)
  const handleFileSelect = async (file, type) => {
    if (!file || !file.type.startsWith('image/')) return;
    const state = await initCropState(file, type);
    setCropType(type);
    setCropState(state);
    setCropModalOpen(true);
  };

  // Reopen crop modal for adjusting
  const handleAdjust = (type) => {
    const original = type === 'background' ? backgroundOriginal : posterOriginal;
    if (!original) return;

    setCropType(type);
    setCropState(original);
    setCropModalOpen(true);
  };

  // Crop confirmed
  const handleCropConfirm = (dataUrl, originalData) => {
    if (cropType === 'background') {
      setBackgroundImage(dataUrl);
      setBackgroundOriginal(originalData);
    } else {
      setPosterImage(dataUrl);
      setPosterOriginal(originalData);
    }
    setCropModalOpen(false);
    setCropState(null);
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setCropState(null);
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
            <ImageUpload
              type="background"
              label="Hintergrundbild"
              targetSize="3240×1920"
              image={backgroundImage}
              hasOriginal={!!backgroundOriginal}
              onFileSelect={handleFileSelect}
              onAdjust={handleAdjust}
              dragOver={dragOverField === 'background'}
              onDragOver={setDragOverField}
              onDragLeave={() => setDragOverField(null)}
              onDrop={handleFileSelect}
            />
            <ImageUpload
              type="poster"
              label="Filmplakat"
              targetSize="790×1122"
              image={posterImage}
              hasOriginal={!!posterOriginal}
              onFileSelect={handleFileSelect}
              onAdjust={handleAdjust}
              dragOver={dragOverField === 'poster'}
              onDragOver={setDragOverField}
              onDragLeave={() => setDragOverField(null)}
              onDrop={handleFileSelect}
            />
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

      {/* Crop Modal */}
      {cropModalOpen && cropState && (
        <CropModal
          cropType={cropType}
          cropState={cropState}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default App;
