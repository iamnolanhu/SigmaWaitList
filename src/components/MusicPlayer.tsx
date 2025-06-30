import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react'

interface MusicPlayerProps {
  className?: string
  variant?: 'full' | 'navbar'
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ className = '', variant = 'full' }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // YouTube music tracks - you can replace these with your preferred tracks
  const tracks = [
    { id: 'MISvCT2xIZ4', title: 'are you a sigma?', artist: 'Honey B' },
    { id: 'D5H4TnDEJXM', title: '99 tabs open', artist: 'Honey B' },
    { id: 'iMoqzDPZYE8', title: 'aura', artist: 'Honey B' },
    { id: 'jvLMvso-MEU', title: 'really really?', artist: 'Honey B' },
    { id: 'zovIx38xT3A', title: 'mine', artist: 'Honey B' },
    { id: 'ltbsbxM-dOE', title: 'Infinite Empire', artist: 'Honey B' },
    { id: 'JwVa39FgKls', title: 'No', artist: 'Honey B' },
    { id: 'o1_CTv_CSdE', title: 'No Ls', artist: 'Honey B' },
    { id: 'kKgYvEImA1Y', title: 'Web Only', artist: 'Honey B' },
    { id: 'xKmfCwjI164', title: 'Lone Web', artist: 'Honey B' },
    { id: 'DzkkfL4kcsY', title: 'I am', artist: 'Honey B' },
    { id: 'taA_XC3o3EE', title: 'Lone Wolf Vibes', artist: 'Honey B' },
    { id: 'Gkb3z7VgW24', title: 'Pro Autonomy (2)', artist: 'Honey B' },
    { id: '81dxJoQJSNY', title: 'Pro Autonomy', artist: 'YouTube Playlist' },
    { id: 's8yvg9pDg1Y', title: 'Sigma Status', artist: 'YouTube Playlist' },
    { id: 'aQyYK3i_qrQ', title: 'Sigma State of Mind', artist: 'YouTube Playlist' },
    { id: 'QwwsBE1bIg8', title: 'untitled sigma 2', artist: 'YouTube Playlist' },
    { id: 'JRBDRPueq0Q', title: 'untitled sigma', artist: 'YouTube Playlist' },
    { id: 'j71NU1qE9yc', title: 'a song', artist: 'YouTube Playlist' }
  ]

  const currentVideoId = tracks[currentTrack].id

  // Function to switch tracks and ensure auto-play
  const switchTrack = (newTrackIndex: number) => {
    const newTrack = newTrackIndex
    setCurrentTrack(newTrack)
    setIsPlaying(true)
    
    // Reload iframe with new video and auto-play
    if (iframeRef.current) {
      const newVideoId = tracks[newTrack].id
      iframeRef.current.src = `https://www.youtube.com/embed/${newVideoId}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Send message to iframe to play/pause
    if (iframeRef.current) {
      const message = isPlaying ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}'
      iframeRef.current.contentWindow?.postMessage(message, '*')
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (iframeRef.current) {
      const message = isMuted ? '{"event":"command","func":"unMute","args":""}' : '{"event":"command","func":"mute","args":""}'
      iframeRef.current.contentWindow?.postMessage(message, '*')
    }
  }

  const nextTrack = () => {
    const newTrack = (currentTrack + 1) % tracks.length
    switchTrack(newTrack)
  }

  const prevTrack = () => {
    const newTrack = (currentTrack - 1 + tracks.length) % tracks.length
    switchTrack(newTrack)
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Handle track selection from expanded view
  const selectTrack = (index: number) => {
    switchTrack(index)
  }

  // Navbar variant - compact version
  if (variant === 'navbar') {
    return (
      <div className={`relative ${className}`}>
        {/* YouTube iframe (hidden but functional) */}
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${currentVideoId}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`}
          className="sr-only"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

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
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm font-bold">
                  {tracks[currentTrack].title}
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab]/60 text-xs">
                  {tracks[currentTrack].artist}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto px-3">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => switchTrack(index)}
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
      {/* YouTube iframe (hidden but functional) */}
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${currentVideoId}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`}
        className="sr-only"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

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
                    onClick={() => switchTrack(index)}
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