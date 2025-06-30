import React, { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Shuffle } from 'lucide-react'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'

interface MusicPlayerProps {
  className?: string
  variant?: 'full' | 'navbar'
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ className = '', variant = 'full' }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    isPlaying,
    isMuted,
    currentTrack,
    isShuffled,
    tracks,
    togglePlay,
    toggleMute,
    toggleShuffle,
    nextTrack,
    prevTrack,
    selectTrack
  } = useMusicPlayer()

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Navbar variant - compact version
  if (variant === 'navbar') {
    return (
      <div className={`relative ${className}`}>
        {/* Compact Music Player */}
        <div className="flex items-center gap-2">
          {/* Track Info */}
          <div className="hidden sm:flex items-center gap-2 min-w-0 w-48">
            <div className="w-6 h-6 bg-[#6ad040]/20 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-[#6ad040] text-xs">🎵</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-['Space_Mono'] text-[#b7ffab] text-xs font-bold truncate">
                {tracks[currentTrack].title}
              </p>
              <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs truncate">
                {tracks[currentTrack].artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Shuffle Toggle - Moved to left */}
            <button
              onClick={toggleShuffle}
              className={`p-1 transition-colors ${
                isShuffled 
                  ? 'text-[#6ad040] hover:text-[#79e74c]' 
                  : 'text-[#b7ffab]/40 hover:text-[#b7ffab]'
              }`}
              title={isShuffled ? 'Shuffle On' : 'Shuffle Off'}
            >
              <Shuffle className="w-3 h-3" />
            </button>

            {/* Previous Track */}
            <button
              onClick={prevTrack}
              className="p-1 text-[#b7ffab] hover:text-[#6ad040] transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-3 h-3" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1 bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] rounded transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={nextTrack}
              className="p-1 text-[#b7ffab] hover:text-[#6ad040] transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-3 h-3" />
            </button>

            {/* Expand/Collapse */}
            <button
              onClick={toggleExpand}
              className="p-1 text-[#b7ffab] hover:text-[#6ad040] transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Expanded View - Track List */}
          {isExpanded && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-black/90 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 shadow-2xl shadow-[#6ad040]/20 py-3 z-50">
              <div className="px-3 pb-2 border-b border-[#6ad040]/20 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Space_Mono'] text-[#b7ffab] text-sm font-bold">
                      {tracks[currentTrack].title}
                    </p>
                    <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs">
                      {tracks[currentTrack].artist}
                    </p>
                  </div>
                  {isShuffled && (
                    <div className="flex items-center gap-1 text-[#6ad040] text-xs">
                      <Shuffle className="w-3 h-3" />
                      <span className="font-['Space_Mono']">ON</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto px-3">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={`text-left p-2 rounded-lg transition-colors ${
                      currentTrack === index
                        ? 'bg-[#6ad040]/20 text-[#6ad040] border border-[#6ad040]/40'
                        : 'text-[#b7ffab] hover:bg-[#6ad040]/10'
                    }`}
                  >
                    <p className="font-['Space_Mono'] text-xs font-bold truncate">
                      {track.title}
                    </p>
                    <p className="font-['Space_Mono'] text-xs opacity-60 truncate">
                      {track.artist}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Full variant - original implementation
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${className}`}>
      {/* Music Player UI */}
      <div className={`bg-black/90 backdrop-blur-md border-t border-[#6ad040]/40 transition-all duration-300 ${
        isExpanded ? 'h-32' : 'h-16'
      }`}>
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-[#6ad040]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#6ad040] text-lg">🎵</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm font-bold truncate">
                  {tracks[currentTrack].title}
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs truncate">
                  {tracks[currentTrack].artist}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Previous Track */}
              <button
                onClick={prevTrack}
                className="p-2 text-[#b7ffab] hover:text-[#6ad040] transition-colors"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] rounded-full transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={nextTrack}
                className="p-2 text-[#b7ffab] hover:text-[#6ad040] transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="p-2 text-[#b7ffab] hover:text-[#6ad040] transition-colors hidden sm:block"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* Expand/Collapse */}
              <button
                onClick={toggleExpand}
                className="p-2 text-[#b7ffab] hover:text-[#6ad040] transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded View - Track List */}
          {isExpanded && (
            <div className="mt-2 border-t border-[#6ad040]/20 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-20 overflow-y-auto">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={`text-left p-2 rounded-lg transition-colors ${
                      currentTrack === index
                        ? 'bg-[#6ad040]/20 text-[#6ad040] border border-[#6ad040]/40'
                        : 'text-[#b7ffab] hover:bg-[#6ad040]/10'
                    }`}
                  >
                    <p className="font-['Space_Mono'] text-xs font-bold truncate">
                      {track.title}
                    </p>
                    <p className="font-['Space_Mono'] text-xs opacity-60 truncate">
                      {track.artist}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}