import React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { MatrixBackground } from "../../components/MatrixBackground";

export const Desktop = (): JSX.Element => {
  // Feature card data for mapping - now with different images
  const featureCards = [
    {
      id: 1,
      title: "Join Waitlist",
      description:
        "Be Sigma. Get the latest Sigma news and early access to our first build",
      image: "/SigmaGuy.svg", // You can change this to any image path
    },
    {
      id: 2,
      title: "Join Waitlist",
      description:
        "Be Sigma. Get the latest Sigma news and early access to our first build",
      image: "/SigmaGuy.svg", // You can change this to a different image
    },
    {
      id: 3,
      title: "Join Waitlist",
      description:
        "Be Sigma. Get the latest Sigma news and early access to our first build",
      image: "/SigmaGuy.svg", // You can change this to another different image
    },
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
        </header>

        {/* Main content - responsive */}
        <main className="flex-1 container mx-auto px-4 py-8 lg:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Waitlist section - responsive */}
            <div className="text-center mb-12 lg:mb-16">
              {/* Logo - responsive */}
              <div className="w-48 h-12 sm:w-64 sm:h-16 lg:w-80 lg:h-20 mx-auto mb-8 bg-[url(/SigmaLogo.svg)] bg-contain bg-no-repeat bg-center filter drop-shadow-2xl drop-shadow-[#6ad040]/30" />

              {/* Heading and subtext - responsive */}
              <div className="mb-8 lg:mb-12">
                <h1 className="font-['Orbitron'] font-semibold text-[#b7ffab] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight mb-6 drop-shadow-2xl drop-shadow-[#6ad040]/50 animate-pulse">
                  JOIN THE WAITLIST
                </h1>

                <p className="font-['Space_Mono'] text-[#b7ffab] text-sm sm:text-base lg:text-lg max-w-md mx-auto leading-relaxed opacity-90 drop-shadow-lg">
                  Be Sigma. Get the latest Sigma news and early access to our
                  first build
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
                  <div className="text-[#b7ffab]/70 font-['Space_Mono'] text-sm lg:text-base group-hover:text-[#6ad040] transition-colors duration-300">
                    Video Content Placeholder
                  </div>
                  {/* Subtle matrix overlay on video placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6ad040]/5 via-transparent to-[#6ad040]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </CardContent>
              </Card>
            </div>

            {/* Feature cards section - responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
          </div>
        </main>

        {/* Mobile navigation */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-2xl border border-[#6ad040]/30 p-4 shadow-xl shadow-[#6ad040]/20">
          <div className="flex justify-center gap-6">
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
        </div>
      </div>
    </div>
  );
};