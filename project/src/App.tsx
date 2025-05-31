import React, { useState } from 'react';
import { Loader2, Download, History, Sparkles, Bird } from 'lucide-react';
import ExamplePrompts from './components/ExamplePrompts';
import ImageHistory from './components/ImageHistory';
import { HistoryItem } from './types';

function App() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

 const API_BASE_URL = "http://localhost:9000";

const generateImage = async () => {
  if (!prompt.trim()) {
    setError("Please enter a description");
    return;
  }

  setIsLoading(true);
  setError(null);
  // Clear the current image so the UI updates when a new one is loaded
  setCurrentImage(null);

  try {
    // Call text2image API endpoint with the correct port
    const response = await fetch(`${API_BASE_URL}/text2image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate image");
    }

    const data = await response.json();

    // Get the actual image using the returned path
    const imageUrl = `${API_BASE_URL}/get_image?path=${encodeURIComponent(
      data.image_path
    )}`;

    // Add a timestamp or random parameter to force image refresh
    const refreshedUrl = `${imageUrl}&t=${Date.now()}`;

    setCurrentImage(refreshedUrl);
    setHistory((prev) => [
      ...prev,
      { prompt, image: refreshedUrl, timestamp: new Date().toISOString() },
    ]);
  } catch (err) {
    setError("Failed to generate image. Please try again.");
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};

const handleDownload = async () => {
  if (!currentImage) return;

  try {
    const response = await fetch(currentImage);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bird-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    setError("Failed to download image");
    console.error(err);
  }
};

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=2000&q=80')`,
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <Bird className="w-12 h-12 text-white mr-3" />
          <h1 className="text-5xl font-bold text-white">
            Bird Image Generator
          </h1>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
            <div className="mb-6">
              <label
                htmlFor="prompt"
                className="block text-lg font-medium text-gray-800 mb-3"
              >
                Describe the bird you want to generate
              </label>
              <textarea
                id="prompt"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a detailed description of the bird..."
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              <button
                onClick={generateImage}
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center disabled:opacity-50 shadow-lg hover:shadow-blue-500/30"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                Generate Image
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-700 hover:text-gray-900 flex items-center px-4 py-2 rounded-xl hover:bg-white/50 transition-all"
              >
                <History className="w-5 h-5 mr-2" />
                History
              </button>
            </div>

            {error && (
              <div className="text-red-600 mb-4 text-sm bg-red-50/50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {currentImage && (
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={currentImage}
                  alt="Generated bird"
                  className="w-full"
                />
                <button
                  onClick={handleDownload}
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-white transition-all"
                >
                  <Download className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>

          <ExamplePrompts onSelect={setPrompt} />

          {showHistory && (
            <ImageHistory
              history={history}
              onSelect={(item) => setPrompt(item.prompt)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;