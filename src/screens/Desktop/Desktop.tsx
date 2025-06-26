import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { MatrixBackground } from "../../components/MatrixBackground";
import { Volume2, VolumeX, Github, Twitter } from "lucide-react";

export const Desktop = (): JSX.Element => {
  const [isMuted, setIsMuted] = useState(false); // Start unmuted
  const videoRef = useRef<HTMLVideoElement>(null);

  // Try to play video with sound on component mount
  useEffect(() => {
    const playVideoWithSound = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.muted = false;
          await videoRef.current.play();
          setIsMuted(false);
        } catch (error) {
          // If autoplay with sound fails, fallback to muted autoplay
          console.log("Autoplay with sound blocked, falling back to muted");
          videoRef.current.muted = true;
          setIsMuted(true);
          try {
            await videoRef.current.play();
          } catch (mutedError) {
            console.log("Muted autoplay also failed");
          }
        }
      }
    };

    playVideoWithSound();
  }, []);

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
      image: "legalPaper.svg", // You can change this to any image path
    },
    {
      id: 2,
      title: "Branding",
      description:
        "Brand that doesn't look like Canva threw up",
      image: "/branding.svg", // You can change this to a different image
    },
    {
      id: 3,
      title: "Website",
      description:
        "Website that converts (not just exists), brings all the Sigma to your backyard",
      image: "/website.svg", // You can change this to another different image
    },
    {
      id: 4,
      title: "Payment Processing",
      description:
        "Payment processing that WORKS",
      image: "/payment.svg", // You can change this to another different image
    },
      {
      id: 5,
      title: "Business Banking",
      description:
        "Skip the bank small talk and get your business running",
      image: "/businessBanking.svg", // You can change this to another different image
    },
      {
      id: 6,
      title: "Marketing",
      description:
        "Marketing that runs itself, promoting your business is now a piece of cake",
      image: "/sigmaguy.svg", // You can change this to another different image
    },
  ];

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Nolan Hu",
      role: "Backend Developer",
      bio: "Full-stack wizard who turns coffee into code. Built 3 unicorns before breakfast.",
      image: "/nolanPFP.png",
      github: "https://github.com/iamnolanhu",
      twitter: "https://x.com/its_nolan_hu"
    },
    {
      id: 2,
      name: "Apoorva",
      role: "Product Designer and Front-End Sigma",
      bio: "The product designer who sees opportunities where others see problems. Pure sigma energy..",
      image: "/apovaPFP.jpg",
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
      image: "/suzannaPFP.png",
      github: "https://github.com/codesuzyworld",
      twitter: "https://x.com/CodesSuzy19017"
    }
  ];

  // Tech stack data
  const techStack = [
    {
      name: "Bolt",
      description: "AI-powered development platform",
      logo: "/boltnewLogo.svg",
      color: "#6ad040"
    },
    {
      name: "Next.js",
      description: "React framework for production",
      logo: "/nextJSLogo.svg",
      color: "#ffffff"
    },
    {
      name: "Supabase",
      description: "Open source Postgres Development Platform.",
      logo: "/supabaseLogo.svg",
      color: "#3ecf8e"
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
                  href="#feature"
                  className="text-[#b7ffab] hover:text-[#6ad040] transition-all duration-300 font-['Space_Mono'] text-sm lg:text-base hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50"
                >
                  Features
                </a>
                <a
                  href="#team"
                  className="text-[#b7ffab] hover:text-[#6ad040] transition-all duration-300 font-['Space_Mono'] text-sm lg:text-base hover:drop-shadow-lg hover:drop-shadow-[#6ad040]/50"
                >
                  About Team Sigma
                </a>
              </nav>

              <Button className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_6px_rgba(106,208,64,0.5)] border border-[#6ad040]/30">
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
              <p className="font-['Orbitron'] font-semibold text-[#ffff] text-sm sm:text-base lg:text-lg uppercase tracking-wider mb-10 drop-shadow-lg drop-shadow-[#6ad040]/20 matrix-glow">
                AI Business automation for Sigmas
              </p>

              {/* Powered by Bolt text */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-['Space_Mono'] text-[#b7ffab] text-xs sm:text-sm opacity-70">Built with</span>
                <img src="/boltnewLogo.svg" alt="Bolt" className="w-16 h-6 sm:w-20 sm:h-8 object-contain" />
                <span className="font-['Space_Mono'] text-[#b7ffab] text-xs sm:text-sm opacity-70">For the Sigmas</span>
              </div>
              {/* Heading and subtext - responsive */}

                <h1 className="font-['Orbitron'] font-semibold text-[#b7ffab] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight mb-6 drop-shadow-2xl drop-shadow-[#6ad040]/50 animate-pulse">
                  JOIN THE WAITLIST
                </h1>

              {/* Email input and button - responsive */}
              <div className="max-w-lg mx-auto space-y-4">
                <div className="relative">
                  <Input
                    className="w-full h-12 lg:h-14 px-6 bg-black/40 backdrop-blur-md border-2 border-[#6ad040]/50 rounded-full text-[#b7ffab] font-['Space_Grotesk'] font-bold text-center placeholder:text-[#b7ffab]/60 text focus-visible:ring-2 focus-visible:ring-[#6ad040] focus-visible:border-[#6ad040] focus-visible:shadow-lg focus-visible:shadow-[#6ad040]/30 transition-all duration-300"
                    placeholder="youremail@sigma.com"
                  />
                </div>

                <Button className="w-full sm:w-auto bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-lg lg:text-xl px-8 lg:px-12 py-3 lg:py-4 rounded-full border-2 border-[#6ad040]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6ad040]/60 active:scale-95">
                  Join Waitlist
                </Button>
              </div>
            </div>
            
            <div className="mb-8 lg:mb-12">
              <p className="font-['Space_Mono'] text-[#b7ffab] text-center text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90 drop-shadow-lg mb-4">
                POV: you want to start a business but every tutorial means you gotta listen to some based sigma said 
              </p>
              
              {/* Bold "what if we just did all of it" text with glitch effect */}
              <p 
                className="font-['Orbitron'] font-black text-[#b7ffab] text-lg sm:text-xl lg:text-2xl text-center max-w-2xl mx-auto leading-relaxed drop-shadow-xl drop-shadow-[#6ad040]/60 glitch-hover cursor-pointer"
                data-text="'what if we just... did all of it?'"
              >
                'what if we just... did all of it?'
              </p>
            </div>
            
            {/* Video/image placeholder - responsive */}
            <div className="mb-12 lg:mb-16">
              <Card className="w-full max-w-2xl mx-auto aspect-video bg-black/40 backdrop-blur-md rounded-3xl border border-[#6ad040]/50 overflow-hidden hover:border-[#6ad040] transition-all duration-300 hover:shadow-2xl hover:shadow-[#6ad040]/30 group">
                <CardContent className="p-0 h-full flex items-center justify-center relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-3xl"
                    autoPlay
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
              <div id="feature" className="mb-16 lg:mb-24">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="font-['Orbitron'] font-black text-[#ffff] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                  BASED SIGMA FEATURES
                </h2>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  Based Sigma helps you build your business from scratch.
                </p>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  0 to CEO while you sleep.
                </p>
              </div>
            <div  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-24">
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
                        className="w-22 h-24 lg:w-26 lg:h-30 mb-4 lg:mb-6 opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 filter group-hover:drop-shadow-lg group-hover:drop-shadow-[#6ad040]/50"
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

            {/* Tech Stack Section */}
            <div className="mb-16 lg:mb-24">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="font-['Orbitron'] font-black text-[#ffff] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                  TECH STACK
                </h2>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  Built with cutting-edge technology for maximum sigma performance.
                </p>
              </div>

              {/* Tech Stack Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {techStack.map((tech, index) => (
                  <div key={index} className="relative group">
                    <div className="relative bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-6 lg:p-8 h-full transition-all duration-500 hover:border-[#6ad040] hover:shadow-2xl hover:shadow-[#6ad040]/30 hover:bg-black/50 hover:scale-105 hover:-translate-y-2 text-center">
                      {/* Matrix-style glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6ad040]/10 via-transparent to-[#6ad040]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        {/* Logo/Icon */}
                        <div className="flex justify-center items-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <img src={tech.logo} alt={tech.name} className="w-36 h-16 lg:w-40 lg:h-20 object-contain" />
                        </div>

                        {/* Tech Name */}
                        {/* <h3 className="font-['Orbitron'] font-black text-[#b7ffab] text-xl lg:text-2xl mb-3 group-hover:text-[#6ad040] transition-colors duration-300 group-hover:drop-shadow-lg">
                          {tech.name}
                        </h3> */}

                        {/* Description */}
                        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                          {tech.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Sigma Section */}
            <div id="team" className="mb-16 lg:mb-24">
              {/* Section Header */}
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="font-['Orbitron'] font-black text-[#ffff] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight mb-4 drop-shadow-2xl drop-shadow-[#6ad040]/50 matrix-glow">
                  TEAM SIGMA
                </h2>
                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                  Meet the absolute legends building the future of business automation. Pure sigma energy, zero corporate BS.
                </p>
              </div>
              </div>

              {/* Team Members Grid - 2 per row with more space */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
                {teamMembers.map((member) => (
                  <div key={member.id} className="relative group">
                    <div className="relative bg-black/30 backdrop-blur-md rounded-2xl border border-[#6ad040]/40 p-8 lg:p-10 h-full transition-all duration-500 hover:border-[#6ad040] hover:shadow-2xl hover:shadow-[#6ad040]/30 hover:bg-black/50 hover:scale-105 hover:-translate-y-2">
                      {/* Matrix-style glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6ad040]/10 via-transparent to-[#6ad040]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10 text-center">
                        {/* Profile Image */}
                        <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-[#6ad040]/50 group-hover:border-[#6ad040] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#6ad040]/50">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        {/* Name */}
                        <h3 className="font-['Orbitron'] font-bold text-[#b7ffab] text-xl lg:text-2xl mb-3 group-hover:text-[#6ad040] transition-colors duration-300">
                          {member.name}
                        </h3>

                        {/* Role */}
                        <p className="font-['Space_Grotesk'] font-bold text-[#6ad040] text-base lg:text-lg mb-4 uppercase tracking-wide">
                          {member.role}
                        </p>

                        {/* Bio */}
                        <p className="font-['Space_Mono'] text-[#b7ffab] text-sm lg:text-base leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300 mb-6">
                          {member.bio}
                        </p>

                        {/* Social Icons */}
                        <div className="flex justify-center gap-4">
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/60 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 group/icon"
                          >
                            <Github className="w-5 h-5 text-[#b7ffab] group-hover/icon:text-[#6ad040] transition-colors duration-300" />
                          </a>
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full border border-[#6ad040]/50 flex items-center justify-center hover:bg-black/60 hover:border-[#6ad040] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#6ad040]/50 group/icon"
                          >
                            <Twitter className="w-5 h-5 text-[#b7ffab] group-hover/icon:text-[#6ad040] transition-colors duration-300" />
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
                  Want to become a CEO overnight?
                </p>
            <Button className="bg-[#6ad040] hover:bg-[#79e74c] text-[#161616] font-['Orbitron'] font-black text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_6px_rgba(106,208,64,0.5)] border border-[#6ad040]/30">
              Try Sigma NOW
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
                Home
              </a>
              <a
                href="#feature"
                className="text-[#b7ffab] hover:text-[#6ad040] transition-colors font-['Space_Mono'] text-sm"
              >
                Features
              </a>
              <a
                href="#team"
                className="text-[#b7ffab] hover:text-[#6ad040] transition-colors font-['Space_Mono'] text-sm"
              >
                Team
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