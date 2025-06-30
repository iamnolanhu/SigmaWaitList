import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface Track {
  id: string
  title: string
  artist: string
}

interface MusicPlayerContextType {
  // State
  isPlaying: boolean
  isMuted: boolean
  currentTrack: number
  isShuffled: boolean
  playedTracks: number[]
  tracks: Track[]
  
  // Actions
  togglePlay: () => void
  toggleMute: () => void
  toggleShuffle: () => void
  nextTrack: () => void
  prevTrack: () => void
  selectTrack: (index: number) => void
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext)
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
}

interface MusicPlayerProviderProps {
  children: ReactNode
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isShuffled, setIsShuffled] = useState(true)
  const [playedTracks, setPlayedTracks] = useState<number[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasAutoPlayed = useRef(false)

  // YouTube music tracks
  const tracks: Track[] = [
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

  // Initialize and autoplay on mount
  useEffect(() => {
    if (!hasAutoPlayed.current) {
      hasAutoPlayed.current = true
      
      // Select random track
      const randomTrack = Math.floor(Math.random() * tracks.length)
      setCurrentTrack(randomTrack)
      setPlayedTracks([randomTrack])
      
      // Start autoplay after a short delay
      const timer = setTimeout(() => {
        if (iframeRef.current) {
          setIsPlaying(true)
          const videoId = tracks[randomTrack].id
          iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = ''
      }
    }
  }, [])

  const getNextShuffledTrack = () => {
    const unplayedTracks = tracks
      .map((_, index) => index)
      .filter(index => !playedTracks.includes(index) || playedTracks.length >= tracks.length)
    
    if (unplayedTracks.length === 0) {
      // All tracks played, reset and continue shuffling
      setPlayedTracks([currentTrack])
      const availableTracks = tracks.map((_, index) => index).filter(index => index !== currentTrack)
      return availableTracks[Math.floor(Math.random() * availableTracks.length)]
    }
    
    return unplayedTracks[Math.floor(Math.random() * unplayedTracks.length)]
  }

  const switchTrack = (newTrackIndex: number) => {
    setCurrentTrack(newTrackIndex)
    setIsPlaying(true)
    
    // Update played tracks for shuffle
    if (isShuffled) {
      setPlayedTracks(prev => [...prev, newTrackIndex])
    }
    
    // Reload iframe with new video and auto-play
    if (iframeRef.current) {
      const newVideoId = tracks[newTrackIndex].id
      iframeRef.current.src = `https://www.youtube.com/embed/${newVideoId}?enablejsapi=1&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
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

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled)
    if (!isShuffled) {
      setPlayedTracks([currentTrack])
    }
  }

  const nextTrack = () => {
    const newTrack = isShuffled ? getNextShuffledTrack() : (currentTrack + 1) % tracks.length
    switchTrack(newTrack)
  }

  const prevTrack = () => {
    const newTrack = isShuffled ? getNextShuffledTrack() : (currentTrack - 1 + tracks.length) % tracks.length
    switchTrack(newTrack)
  }

  const selectTrack = (index: number) => {
    switchTrack(index)
  }

  const value: MusicPlayerContextType = {
    isPlaying,
    isMuted,
    currentTrack,
    isShuffled,
    playedTracks,
    tracks,
    togglePlay,
    toggleMute,
    toggleShuffle,
    nextTrack,
    prevTrack,
    selectTrack
  }

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {/* Hidden iframe for YouTube player */}
      <iframe
        ref={iframeRef}
        className="sr-only"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}
      />
    </MusicPlayerContext.Provider>
  )
}