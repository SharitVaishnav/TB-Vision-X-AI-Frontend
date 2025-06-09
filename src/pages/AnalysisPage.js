import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AnalysisPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentComment, setCurrentComment] = useState(0);

  const loadingComments = [
    "Analyzing your chest X-ray image...",
    "Processing the image for TB detection...",
    "Generating GradCAM visualization for better understanding...",
    "Creating LIME explanation to highlight important regions...",
    "Almost there! Finalizing the results...",
    "Preparing detailed analysis report..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setCurrentComment((prev) => (prev + 1) % loadingComments.length);
      }, 3000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setPrediction(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('model', 'densenet');

    try {
      const response = await fetch('https://tb-vision-x-ai-backend.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data || typeof data.prediction !== 'number' || !data.class) {
        throw new Error('Invalid prediction data received from server');
      }

      setPrediction(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 mb-8 group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
              TB Vision X-AI Analysis
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Advanced tuberculosis detection using explainable AI technology with GradCAM and LIME visualizations
            </p>
          </div>

          {/* Upload Section */}
          <div className="flex flex-col items-center gap-8 mb-12">
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label 
              htmlFor="file-upload"
              className={`
                inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300 
                ${loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                }
              `}
              style={{ pointerEvents: loading ? 'none' : 'auto' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload X-Ray Image
            </label>

            {/* Image Preview */}
            {previewUrl && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white rounded-2xl p-2 shadow-lg">
                  <img
                    src={previewUrl}
                    alt="X-Ray Preview"
                    className="max-w-full max-h-96 rounded-xl object-contain"
                  />
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className={`
                flex items-center gap-3 px-12 py-4 rounded-2xl font-semibold text-lg transition-all duration-300
                ${(!selectedFile || loading)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:-translate-y-1'
                }
              `}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="w-full max-w-2xl p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center gap-6 py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-xl text-blue-600 font-medium text-center animate-pulse">
                  {loadingComments[currentComment]}
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {prediction && prediction.prediction !== undefined && (
            <div className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100">
              <h2 className="text-3xl font-bold text-blue-800 mb-8 flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Analysis Results
              </h2>
              
              {/* Prediction Summary */}
              <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-white/50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Prediction: <span className="text-blue-600">{prediction.class}</span>
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Confidence: <span className="font-semibold text-green-600">{(prediction.prediction * 100).toFixed(2)}%</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-medium">AI Powered</span>
                  </div>
                </div>
              </div>
              
              {/* Visualizations */}
              <div className="flex flex-col lg:flex-row gap-8">
                {/* GradCAM Visualization */}
                {prediction.gradcam && (
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/50 h-full">
                      <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        GradCAM Visualization
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Heat map showing which regions the AI focused on for decision making
                      </p>
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                        <div className="relative bg-gray-50 rounded-xl p-2">
                          <img
                            src={`data:image/png;base64,${prediction.gradcam}`}
                            alt="GradCAM Visualization"
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* LIME Explanation */}
                {prediction.lime && (
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/50 h-full">
                      <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        LIME Explanation
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Local interpretable model explaining the prediction with highlighted segments
                      </p>
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                        <div className="relative bg-gray-50 rounded-xl p-2">
                          <img
                            src={`data:image/png;base64,${prediction.lime}`}
                            alt="LIME Explanation"
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalysisPage; 
