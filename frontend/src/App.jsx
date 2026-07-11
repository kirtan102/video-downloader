import React, { useState, useEffect } from 'react';
import { API_BASE } from './config';
import { 
  Download, 
  Link2, 
  Clock, 
  User, 
  Calendar, 
  FileVideo, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';

// Helper to format duration in seconds (e.g. 125 -> 02:05)
const formatDuration = (seconds) => {
  if (!seconds) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper to format filesize in bytes to MB/GB
const formatFilesize = (bytes) => {
  if (!bytes) return 'N/A';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
};

// Helper to format upload date (e.g. YYYYMMDD -> YYYY-MM-DD)
const formatDate = (dateStr) => {
  if (!dateStr || dateStr.length !== 8) return 'Unknown';
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
};

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Simulated download state
  const [downloadJob, setDownloadJob] = useState(null);

  // Clean form
  const handleReset = () => {
    setUrl('');
    setMetadata(null);
    setError(null);
    setDownloadJob(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setMetadata(null);
    setDownloadJob(null);

    try {
      const response = await fetch(`${API_BASE}/api/video/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.success) {
        setMetadata(result.data);
      } else {
        setError(result.message || 'Failed to extract video information.');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Triggers the real download in the browser and starts the UI progress visualization
  const startDownload = (qualityOption) => {
    if (downloadJob && downloadJob.state !== 'completed') return;

    setDownloadJob({
      quality: qualityOption.quality,
      formatId: qualityOption.formatId,
      ext: qualityOption.ext,
      filesize: qualityOption.filesize,
      progress: 0,
      speed: 0, // MB/s
      eta: 0, // seconds
      state: 'downloading', // downloading, merging, completed
    });

    // Trigger the real browser download
    const downloadUrl = `${API_BASE}/api/video/download?url=${encodeURIComponent(url)}&formatId=${qualityOption.formatId}`;
    window.location.href = downloadUrl;
  };

  useEffect(() => {
    if (!downloadJob || downloadJob.state === 'completed') return;

    let timer;
    if (downloadJob.state === 'downloading') {
      timer = setInterval(() => {
        setDownloadJob(prev => {
          if (!prev) return null;
          
          const newProgress = Math.min(prev.progress + Math.random() * 8 + 3, 100);
          const currentSpeed = (Math.random() * 5 + 3).toFixed(1); // 3 - 8 MB/s
          
          let nextState = 'downloading';
          if (newProgress >= 100) {
            nextState = 'merging';
          }

          // Calculate ETA
          const remainingPercent = 100 - newProgress;
          const totalSizeMB = prev.filesize ? prev.filesize / (1024 * 1024) : 150; // default to 150MB if null
          const remainingMB = (totalSizeMB * remainingPercent) / 100;
          const etaSecs = Math.ceil(remainingMB / parseFloat(currentSpeed));

          return {
            ...prev,
            progress: parseFloat(newProgress.toFixed(1)),
            speed: currentSpeed,
            eta: Math.max(etaSecs, 0),
            state: nextState
          };
        });
      }, 500);
    } else if (downloadJob.state === 'merging') {
      // Simulate FFmpeg merging audio & video streams (takes about 3 seconds)
      timer = setTimeout(() => {
        setDownloadJob(prev => ({
          ...prev,
          progress: 100,
          state: 'completed'
        }));
      }, 3000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [downloadJob]);

  return (
    <div className="relative min-h-screen w-full bg-pacblue-50 flex flex-col items-center justify-between">
      
      {/* Ambient background blur blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-pacblue-200/20 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-pacblue-300/10 blur-[100px] pointer-events-none z-0"></div>

      {/* Sticky Header / Navbar */}
      <header className="sticky top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-pacblue-100/50 px-6 py-4 flex items-center justify-between">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-pacblue-100/40 border border-pacblue-200/30 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M7 4.14v15.72a1 1 0 0 0 1.5.86l11.79-7.86a1 1 0 0 0 0-1.72L8.5 3.28a1 1 0 0 0-1.5.86z" fill="url(#logo-grad-header)"/>
                <path d="M12.5 7.5v4.5h2.5L11.5 16.5L8.5 12h2.5V7.5h1.5z" fill="#ffffff" stroke="#ffffff" strokeWidth="0.5" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="logo-grad-header" x1="7" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#31bfdf"/>
                    <stop offset="1" stop-color="#1582a5"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-pacblue-950">
              Vid<span className="text-pacblue-500">ora</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-pacblue-800">
            <a href="#" className="hover:text-pacblue-500 transition duration-155">Home</a>
            <a href="#" className="hover:text-pacblue-500 transition duration-155">How it Works</a>
            <a href="#" className="hover:text-pacblue-500 transition duration-155">Supported Sites</a>
            <a href="#" className="hover:text-pacblue-500 transition duration-155">Developer API</a>
          </nav>

          {/* Github Button */}
          <div className="hidden md:flex items-center">
            <a 
              href="#" 
              className="inline-flex items-center space-x-2 bg-pacblue-950 hover:bg-pacblue-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition duration-150"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>Github</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-pacblue-800 hover:bg-pacblue-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-pacblue-100 shadow-lg flex flex-col p-6 space-y-4 md:hidden animate-fade-in">
            <a href="#" className="text-sm font-medium text-pacblue-800 hover:text-pacblue-500 transition">Home</a>
            <a href="#" className="text-sm font-medium text-pacblue-800 hover:text-pacblue-500 transition">How it Works</a>
            <a href="#" className="text-sm font-medium text-pacblue-800 hover:text-pacblue-500 transition">Supported Sites</a>
            <a href="#" className="text-sm font-medium text-pacblue-800 hover:text-pacblue-500 transition">Developer API</a>
            <a 
              href="#" 
              className="inline-flex items-center justify-center space-x-2 bg-pacblue-950 hover:bg-pacblue-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition duration-150 w-full"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>Github</span>
            </a>
          </div>
        )}
      </header>

      {/* Content wrapper */}
      <main className="relative z-10 w-full max-w-4xl flex-grow flex flex-col items-center justify-start px-6 pt-16 md:pt-24">
        
        {/* Intro Hero Section */}
        <div className="text-center mb-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-pacblue-955 leading-tight">
            Download Any Video <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-pacblue-500 to-pacblue-600 bg-clip-text text-transparent">
              Instantly
            </span>
          </h1>
          <p className="text-pacblue-900/70 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Get high-quality video and audio formats from your favorite platforms in one click.
          </p>
        </div>

        {/* Input Bar Card */}
        <div className="w-full glass rounded-3xl p-6 md:p-8 mb-8 border border-pacblue-200/50">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pacblue-500/50" />
              <input
                type="text"
                placeholder="Paste video URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="w-full bg-white border border-pacblue-100 rounded-2xl py-4 pl-12 pr-4 text-pacblue-955 placeholder-pacblue-400 focus:outline-none focus:border-pacblue-500/50 focus:ring-1 focus:ring-pacblue-500/30 transition duration-205 text-sm md:text-base shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="glow-button flex items-center justify-center bg-gradient-to-r from-pacblue-500 to-pacblue-600 hover:from-pacblue-650 hover:to-pacblue-750 text-white font-bold px-8 py-4 rounded-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-md shadow-pacblue-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="w-4 h-4 ml-2 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Tips under input */}
          <div className="flex items-center space-x-2 mt-4 text-xs text-pacblue-900/60">
            <Sparkles className="w-3.5 h-3.5 text-pacblue-500" />
            <span>Format details are automatically parsed and structured on request</span>
          </div>
        </div>

        {/* Loading Spinner Area */}
        {loading && (
          <div className="w-full glass rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-pacblue-500 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-pacblue-955">Inspecting video media formats...</p>
              <p className="text-xs text-pacblue-800/70">Fetching available video qualities</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start space-x-3 text-rose-800 mb-8 animate-pulse-slow">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-bold">Extraction Error</p>
              <p className="text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {/* Metadata Details & Qualities Card */}
        {metadata && (
          <div className="w-full space-y-6">
            
            {/* Top control bar */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-pacblue-850">Analysis Results</span>
              <button 
                onClick={handleReset} 
                className="flex items-center text-xs text-pacblue-800 hover:text-pacblue-955 bg-white border border-pacblue-200 px-3 py-1.5 rounded-lg transition duration-200 cursor-pointer hover:bg-pacblue-50"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-pacblue-500" />
                Clear
              </button>
            </div>

            {/* Two-column responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Metadata Details */}
              <div className="lg:col-span-5 glass rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-pacblue-100 border border-pacblue-200 shadow-inner group">
                    {metadata.thumbnail ? (
                      <img 
                        src={metadata.thumbnail} 
                        alt={metadata.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => { e.target.src = ''; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pacblue-100">
                        <FileVideo className="w-12 h-12 text-pacblue-300" />
                      </div>
                    )}
                    
                    {/* Duration Overlay */}
                    {metadata.duration && (
                      <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-filter blur-md border border-pacblue-200/50 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md flex items-center text-pacblue-955 space-x-1 shadow-sm">
                        <Clock className="w-3 h-3 text-pacblue-500" />
                        <span>{formatDuration(metadata.duration)}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Creator */}
                  <div className="mt-4 space-y-2">
                    <h2 className="text-lg font-bold leading-snug line-clamp-2 text-pacblue-955">
                      {metadata.title || 'Untitled Video'}
                    </h2>
                    
                    {/* Channel & Upload Date badges */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {metadata.uploader && (
                        <div className="flex items-center space-x-1 bg-pacblue-100/50 text-pacblue-800 border border-pacblue-200/40 px-2.5 py-1 rounded-md">
                          <User className="w-3 h-3 text-pacblue-500" />
                          <span>{metadata.uploader}</span>
                        </div>
                      )}
                      {metadata.upload_date && (
                        <div className="flex items-center space-x-1 bg-pacblue-100/50 border border-pacblue-200/40 px-2.5 py-1 rounded-md text-pacblue-800">
                          <Calendar className="w-3 h-3 text-pacblue-500" />
                          <span>{formatDate(metadata.upload_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description info */}
                {metadata.description && (
                  <div className="mt-4 pt-4 border-t border-pacblue-100/70">
                    <p className="text-xs text-pacblue-800/80 leading-relaxed">
                      {showFullDesc 
                        ? metadata.description 
                        : `${metadata.description.substring(0, 120)}${metadata.description.length > 120 ? '...' : ''}`
                      }
                    </p>
                    {metadata.description.length > 120 && (
                      <button 
                        onClick={() => setShowFullDesc(!showFullDesc)} 
                        className="text-[10px] font-bold text-pacblue-500 hover:text-pacblue-600 mt-2 block focus:outline-none cursor-pointer"
                      >
                        {showFullDesc ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Download Formats */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Qualities Table Card */}
                <div className="glass rounded-3xl p-5 md:p-6 space-y-4 flex-grow">
                  <h3 className="text-sm font-bold text-pacblue-850 flex items-center space-x-2">
                    <FileVideo className="w-4 h-4 text-pacblue-500" />
                    <span>Select Resolution</span>
                  </h3>

                  <div className="overflow-hidden border border-pacblue-200 rounded-2xl">
                    <table className="w-full text-left text-xs md:text-sm">
                      <thead className="bg-pacblue-100/50 border-b border-pacblue-200 text-pacblue-850 font-semibold">
                        <tr>
                          <th className="p-3 md:p-4">Resolution</th>
                          <th className="p-3 md:p-4">Extension</th>
                          <th className="p-3 md:p-4">Est. Size</th>
                          <th className="p-3 md:p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pacblue-100 bg-white">
                        {metadata.qualities && metadata.qualities.length > 0 ? (
                          metadata.qualities.map((q, idx) => (
                            <tr key={idx} className="hover:bg-pacblue-50/50 transition duration-150">
                              <td className="p-3 md:p-4 font-semibold text-pacblue-955">
                                <span className="bg-pacblue-50 border border-pacblue-100 px-2 py-0.5 rounded text-[10px] md:text-xs text-pacblue-800 mr-2">
                                  Video
                                </span>
                                {q.quality}p
                              </td>
                              <td className="p-3 md:p-4 text-pacblue-800 uppercase font-mono">{q.ext || 'N/A'}</td>
                              <td className="p-3 md:p-4 text-pacblue-800 font-mono">{formatFilesize(q.filesize)}</td>
                              <td className="p-3 md:p-4 text-right">
                                <button
                                  onClick={() => startDownload(q)}
                                  disabled={downloadJob && downloadJob.state !== 'completed'}
                                  className="inline-flex items-center justify-center bg-pacblue-50 hover:bg-pacblue-500 text-pacblue-850 hover:text-white border border-pacblue-200/50 hover:border-transparent font-semibold px-3 py-1.5 rounded-xl text-xs transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                  <Download className="w-3.5 h-3.5 mr-1" />
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-8 text-center text-pacblue-400">
                              No compatible video qualities extracted.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Simulated Download Progress Card (Visible when download job starts) */}
                {downloadJob && (
                  <div className="glass rounded-3xl p-5 md:p-6 border-l-4 border-l-pacblue-500 space-y-4">
                    
                    {/* Header of job */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {downloadJob.state === 'downloading' && (
                          <Loader2 className="w-4 h-4 text-pacblue-500 animate-spin" />
                        )}
                        {downloadJob.state === 'merging' && (
                          <RefreshCw className="w-4 h-4 text-pacblue-600 animate-spin" />
                        )}
                        {downloadJob.state === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                        )}
                        
                        <span className="text-xs font-bold uppercase tracking-wider text-pacblue-955">
                          {downloadJob.state === 'downloading' && 'Downloading Stream...'}
                          {downloadJob.state === 'merging' && 'Merging Streams...'}
                          {downloadJob.state === 'completed' && 'Download Complete!'}
                        </span>
                      </div>
                      
                      {downloadJob.state === 'downloading' && (
                        <span className="text-xs text-pacblue-800 font-mono">
                          {downloadJob.speed} MB/s
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full bg-pacblue-100 rounded-full h-2 overflow-hidden border border-pacblue-200">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ease-out ${
                            downloadJob.state === 'completed' 
                              ? 'bg-emerald-500' 
                              : downloadJob.state === 'merging' 
                              ? 'bg-gradient-to-r from-pacblue-500 to-pacblue-300 animate-pulse' 
                              : 'bg-gradient-to-r from-pacblue-500 to-pacblue-600'
                          }`}
                          style={{ width: `${downloadJob.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] md:text-xs text-pacblue-800 font-mono">
                        <span>{downloadJob.progress}%</span>
                        {downloadJob.state === 'downloading' && (
                          <span>ETA: {downloadJob.eta}s</span>
                        )}
                        {downloadJob.state === 'merging' && (
                          <span className="text-pacblue-600">Merging video + audio streams</span>
                        )}
                        {downloadJob.state === 'completed' && (
                          <span className="text-emerald-600 font-bold">Successfully saved to downloads</span>
                        )}
                      </div>
                    </div>

                    {/* Details of downloaded format */}
                    <div className="bg-pacblue-50/50 border border-pacblue-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono text-pacblue-800">
                      <span>Format ID: {downloadJob.formatId || 'N/A'}</span>
                      <span>Quality: {downloadJob.quality}p</span>
                      <span>Size: {formatFilesize(downloadJob.filesize)}</span>
                    </div>

                    {/* Notification info */}
                    {downloadJob.state === 'completed' && (
                      <div className="text-[10px] md:text-xs text-pacblue-400 text-center">
                        This download was simulated according to the roadmap in the project specs.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full flex items-center justify-center py-8 border-t border-pacblue-100/50 text-xs text-pacblue-800/60 bg-white/70 backdrop-blur-md">
        <div>
          © {new Date().getFullYear()} Vidora. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default App;
