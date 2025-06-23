import React, { useState, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { MatrixBackground } from "../../components/MatrixBackground";
import { Volume2, VolumeX, Github, Twitter } from "lucide-react";

export const Desktop = (): JSX.Element => {
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Feature card data for mapping - now with different images
  const featureCards = [
    {
      id: 1,
      title: "Legal Paper work",
      description:
        "Boring but necessary. Based Sigma will handle it all for you.",
      image: "/SigmaGuy.svg", // You can change this to any image path
    },
    {
      id: 2,
      title: "Branding",
      description:
        "Brand that doesn't look like Canva threw up",
      image: "/SigmaGuy.svg", // You can change this to a different image
    },
    {
      id: 3,
      title: "Website",
      description:
        "Website that converts (not just exists), brings all the Sigma to your backyard",
      image: "/SigmaGuy.svg", // You can change this to another different image
    },
    {
      id: 4,
      title: "Payment Processing",
      description:
        "Payment processing that WORKS",
      image: "/SigmaGuy.svg", // You can change this to another different image
    },
      {
      id: 5,
      title: "Business Banking",
      description:
        "Skip the bank small talk and get your business running",
      image: "/SigmaGuy.svg", // You can change this to another different image
    },
      {
      id: 6,
      title: "Marketing",
      description:
        "Marketing that runs itself, promoting your business is now a piece of cake",
      image: "/SigmaGuy.svg", // You can change this to another different image
    },
  ];

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Sigma888",
      role: "Lead Developer",
      bio: "Full-stack wizard who turns coffee into code. Built 3 unicorns before breakfast.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      github: "https://github.com/alexchen",
      twitter: "https://twitter.com/alexchen"
    },
    {
      id: 2,
      name: "Apoorva",
      role: "Product Designer",
      bio: "UX/UI genius who makes interfaces so smooth they're basically illegal.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      github: "https://github.com/sarahkim",
      twitter: "https://twitter.com/sarahkim"
    },
    {
      id: 3,
      name: "Honey B",
      role: "Marketing Wizard",
      bio: "The guy who sees opportunities where others see problems. Pure sigma energy.",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      github: "https://github.com/marcusj",
      twitter: "https://twitter.com/marcusj"
    },
    {
      id: 4,
      name: "Suzanna Codes",
      role: "Designer and Front-End Developer",
      bio: "A sigma designer that is obsessed with coffee and making websites. Based in Toronto!",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      github: "https://github.com/codesuzyworld",
      twitter: "https://x.com/CodesSuzy19017"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] relative overflow-hidden">
      {/* Matrix Background Animation */}
      <MatrixBackground />
      
      {/* Subtle overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/80 via-[#1a1a1a]/60 to-[#1a1a1a]/80 pointer-events-none z-[1]" />

      {/* Top radial gradient accent */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vw] h-[60vh] pointer-events-none z-[2]">
        <div className="w-full h-full rounded-full [background:radial-gradient(50%_50%_at_50%_50%,rgba(106,208,64,0.15)_0%,rgba(106,208,64,0.08)_30%,rgba(27,27,27,0)_70%)]" />
      </div>

      {/* Main content container - responsive */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header/Navigation - responsive */}
        <header className="w-full bg-black/60 backdrop-blur-md border-b border-[#6ad040]/20 shadow-lg shadow-[#6ad040]/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="w-20 h-6 sm:w-28 sm:h-8 bg-[url(/SigmaLogo.svg)] bg-contain bg-no-repeat bg-center filter drop-shadow-lg" />
            
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-8">
                <a
                  href="#"
                  className="text-[#b7ffab] hover:text-[#6ad040] transition-all duration-300 font-['Space_Mono'] text-sm lg:text-base hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50"
                >
                  About Team Sigma
                </a>
                <a
                  href="#"
                  className="text-[#b7ffab] hover:text-[#6ad040] transition-all duration-300 font-['Space_Mono'] text-sm lg:text-base hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50"
                >
                  Contact Us
                </a>
              </nav>

              <Button className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#6ad040]/50 border border-[#6ad040]/30">
                Try Sigma
              </Button>
            </div>
          </div>
        </header>

        {/* Main content - responsive */}
        <main className="flex-1 container mx-auto px-4 py-8 lg:py-16 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Waitlist section - responsive */}
            <div className="text-center mb-12 lg:mb-16">
              {/* Logo - responsive */}
              <div className="w-48 h-12 sm:w-64 sm:h-16 lg:w-80 lg:h-20 mx-auto mb-4 bg-[url(/SigmaLogo.svg)] bg-contain bg-no-repeat bg-center filter drop-shadow-2xl drop-shadow-[#6ad040]/30" />
              
              {/* Tagline under logo */}
              <p className="font-['Orbitron'] font-semibold text-[#ffff] text-sm sm:text-base lg:text-lg uppercase tracking-wider mb-8 drop-shadow-lg drop-shadow-[#6ad040]/20 matrix-glow">
                Business automation for Sigmas
              </p>

              {/* Heading and subtext - responsive */}
              <div className="mb-8 lg:mb-12">
                <h1 className="font-['Orbitron'] font-semibold text-[#b7ffab] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight mb-6 drop-shadow-2xl drop-shadow-[#6ad040]/50 animate-pulse">
                  JOIN THE WAITLIST
                </h1>

                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-md mx-auto leading-relaxed opacity-90 drop-shadow-lg mb-4">
                  POV: you want to start a business but every tutorial means you gotta listen to some based sigma said 
                </p>
                
                {/* Bold "what if we just did all of it" text */}
                <p className="font-['Orbitron'] font-black text-[#6ad040] text-lg sm:text-xl lg:text-2xl max-w-md mx-auto leading-relaxed drop-shadow-xl drop-shadow-[#6ad040]/60 matrix-pulse">
                  'what if we just... did all of it?'
                </p>
              </div>

              {/* Email input and button - responsive */}
              <div className="max-w-lg mx-auto space-y-4">
                <div className="relative">
                  <Input
                    className="w-full h-12 lg:h-14 px-6 bg-black/40 backdrop-blur-md border-2 border-[#6ad040]/50 rounded-full text-[#b7ffab] font-['Space_Grotesk'] font-bold text-center placeholder:text-[#b7ffab]/60 focus-visible:ring-2 focus-visible:ring-[#6ad040] focus-visible:border-[#6ad040] focus-visible:shadow-lg focus-visible:shadow-[#6ad040]/30 transition-all duration-300"
                    placeholder="your@email.com"
                  />
                </div>

                <Button className="w-full sm:w-auto bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-lg lg:text-xl px-8 lg:px-12 py-3 lg:py-4 rounded-full border-2 border-[#6ad040]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60 active:scale-95">
                  Join Waitlist
                </Button>
              </div>
            </div>

            {/* Video/image placeholder - responsive */}
            <div className="mb-12 lg:mb-16">
              <Card className="w-full max-w-2xl mx-auto aspect-video bg-black/40 backdrop-blur-md rounded-3xl border border-[#6ad040]/50 overflow-hidden hover:border-[#6ad040] transition-all duration-300 hover:shadow-2xl hover:shadow-[#6ad040]/30 group">
                <CardContent className="p-0 h-full flex items-center justify-center relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-3xl"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  >
                    <source src="/sigma_draft_1.mp4" type="video/mp4" />
                    {/* Fallback for browsers that don't support video */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-[#b7ffab]/70 font-['Space_Mono'] text-sm lg:text-base group-hover:text-[#6ad040] transition-colors duration-300">
                        Sigma Demo Video
                      </div>
                    </div>
                  </video>
                  
                  {/* Mute/Unmute Button */}
                  <button
                    onClick={toggleMute}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/80 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 z-20"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-[#b7ffab] hover:text-[#6ad040] transition-colors duration-300" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-[#6ad040] hover:text-[#79e74c] transition-colors duration-300" />
                    )}
                  </button>
                  
                  {/* Subtle matrix overlay on video */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6ad040]/5 via-transparent to-[#6ad040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </CardContent>
              </Card>
            </div>

            {/* Feature cards section - responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-24">
              {featureCards.map((card, index) => (
                <div key={index} className="relative group">
                  <div className="relative bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6 lg:p-8 h-full transition-all duration-500 hover:border-[#6ad040] hover:shadow-2xl hover:shadow-[#6ad040]/30 hover:bg-black/50 hover:scale-105 hover:-translate-y-2">
                    {/* Matrix-style glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6ad040]/10 via-transparent to-[#6ad040]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Card number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 lg:w-16 lg:h-16 bg-black/80 backdrop-blur-md rounded-full border border-[#6ad040]/60 flex items-center justify-center group-hover:border-[#6ad040] transition-all duration-300 group-hover:shadow-xl group-hover:shadow-[#6ad040]/50 z-10">
                      <span className="font-['Azeret_Mono'] font-medium text-[#b7ffab] text-lg lg:text-2xl group-hover:text-[#6ad040] transition-colors duration-300">
                        {card.id}
                      </span>
                    </div>

                    <div className="pt-6 lg:pt-8 relative z-10">
                      {/* Icon - now uses the image from the card data */}
                      <img
                        className="w-12 h-14 lg:w-16 lg:h-20 mb-4 lg:mb-6 opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 filter group-hover:drop-shadow-lg group-hover:drop-shadow-[#6ad040]/50"
                        alt="Feature icon"
                        src={card.image}
                      />

                      {/* Title */}
                      <h3 className="font-['Orbitron'] font-black text-[#79e84c] text-lg lg:text-xl xl:text-2xl mb-3 lg:mb-4 group-hover:text-[#6ad040] transition-colors duration-300 group-hover:drop-shadow-lg">
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Team Sigma Section */}
            <div className="mb-16 lg:mb-24">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="font-['Orbitron'] font-black text-[#ffff] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                  TEAM SIGMA
                </h2>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  Meet the absolute legends building the future of business automation. Pure sigma energy, zero corporate BS.
                </p>
              </div>

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {teamMembers.map((member) => (
                  <div key={member.id} className="relative group">
                    <div className="relative bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6 h-full transition-all duration-500 hover:border-[#6ad040] hover:shadow-2xl hover:shadow-[#6ad040]/30 hover:bg-black/50 hover:scale-105 hover:-translate-y-2">
                      {/* Matrix-style glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6ad040]/10 via-transparent to-[#6ad040]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10 text-center">
                        {/* Profile Image */}
                        <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-[#6ad040]/50 group-hover:border-[#6ad040] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#6ad040]/50">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Name */}
                        <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-lg lg:text-xl mb-2 group-hover:text-[#6ad040] transition-colors duration-300">
                          {member.name}
                        </h3>

                        {/* Role */}
                        <p className="font-['Space_Grotesk'] font-bold text-[#6ad040] text-sm lg:text-base mb-3 uppercase tracking-wide">
                          {member.role}
                        </p>

                        {/* Bio */}
                        <p className="font-['Space_Mono'] text-[#b7ffab] text-xs lg:text-sm leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300 mb-4">
                          {member.bio}
                        </p>

                        {/* Social Icons */}
                        <div className="flex justify-center gap-3">
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/60 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 group/icon"
                          >
                            <Github className="w-4 h-4 text-[#b7ffab] group-hover/icon:text-[#6ad040] transition-colors duration-300" />
                          </a>
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/60 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 group/icon"
                          >
                            <Twitter className="w-4 h-4 text-[#b7ffab] group-hover/icon:text-[#6ad040] transition-colors duration-300" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action under team section */}
              <div className="text-center mt-12 lg:mt-16">
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base mb-6 opacity-90">
                  Want to join the sigma squad? We're always looking for based individuals.
                </p>
                <Button className="bg-transparent hover:bg-[#6ad040]/10 text-[#6ad040] border-2 border-[#6ad040] hover:border-[#79e74c] font-['Orbitron'] font-bold text-sm lg:text-base px-6 lg:px-8 py-2 lg:py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#6ad040]/30">
                  Join Team Sigma
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile navigation */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl border border-[#6ad040]/30 p-4 shadow-xl shadow-[#6ad040]/20 z-50">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <a
                href="#"
                className="text-[#b7ffab] hover:text-[#6ad040] transition-colors font-['Space_Mono'] text-sm"
              >
                About
              </a>
              <a
                href="#"
                className="text-[#b7ffab] hover:text-[#6ad040] transition-colors font-['Space_Mono'] text-sm"
              >
                Contact
              </a>
            </div>
            <Button className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-sm px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#6ad040]/50 border border-[#6ad040]/30">
              Try Sigma
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};