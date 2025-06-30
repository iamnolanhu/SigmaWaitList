import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Track {
  id: string
  title: string
  src: string
}

interface MusicPlayerProps {
  className?: string
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ className = '' }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.3) // Start at 30% volume
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // Placeholder tracks - you can replace these with your actual audio files
  const tracks: Track[] = [
    {
      id: '1',
      title: 'Sigma Energy',
      src: '/music/sigma-energy.mp3' // You'll need to add your audio files here
    },
    {
      id: '2', 
      title: 'Matrix Flow',
      src: '/music/matrix-flow.mp3'
    },
    {
      id: '3',
      title: 'Digital Pulse',
      src: '/music/digital-pulse.mp3'
    }
  ]

  const currentTrack = tracks[currentTrackIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      // Auto-play next track
      nextTrack()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentTrackIndex])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.log('Audio play failed:', error)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length
    setCurrentTrackIndex(nextIndex)
    setIsPlaying(false)
  }

  const prevTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(prevIndex)
    setIsPlaying(false)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/40 px-4 py-2 ${className}`}>
      <audio
        ref={audioRef}
        src={currentTrack?.src}
        preload="metadata"
      />

      {/* Previous Track */}
      <button
        onClick={prevTrack}
        className="w-6 h-6 flex items-center justify-center text-[#b7ffab] hover:text-[#6ad040] transition-colors"
        title="Previous track"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] rounded-full transition-all duration-300 hover:scale-105"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      {/* Next Track */}
      <button
        onClick={nextTrack}
        className="w-6 h-6 flex items-center justify-center text-[#b7ffab] hover:text-[#6ad040] transition-colors"
        title="Next track"
      >
        <SkipForward className="w-4 h-4" />
      </button>

      {/* Track Info */}
      <div className="hidden sm:flex flex-col min-w-0 mx-2">
        <div className="font-['Space_Grotesk'] text-[#b7ffab] text-xs font-bold truncate">
          {currentTrack?.title || 'No Track'}
        </div>
        <div className="font-['Space_Mono'] text-[#6ad040] text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Volume Control */}
      <div className="hidden md:flex items-center gap-1">
        <button
          onClick={toggleMute}
          className="w-6 h-6 flex items-center justify-center text-[#b7ffab] hover:text-[#6ad040] transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 h-1 bg-black/50 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #6ad040 0%, #6ad040 ${(isMuted ? 0 : volume) * 100}%, rgba(0,0,0,0.5) ${(isMuted ? 0 : volume) * 100}%, rgba(0,0,0,0.5) 100%)`
          }}
        />
      </div>

      {/* Progress Bar (mobile hidden) */}
      {duration > 0 && (
        <div className="hidden lg:flex items-center gap-2 ml-2">
          <div className="w-20 h-1 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6ad040] to-[#79e74c] transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6ad040;
          cursor: pointer;
          border: 2px solid #161616;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6ad040;
          cursor: pointer;
          border: 2px solid #161616;
        }
      `}</style>
    </div>
  )
}