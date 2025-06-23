import React, { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
  className?: string;
}

export const MatrixBackground: React.FC<MatrixBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - mix of katakana, numbers, and symbols
    const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Array to store the y position of each column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    const draw = () => {
      // Black background with slight transparency for trail effect
      ctx.fillStyle = 'rgba(26, 26, 26, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#6ad040'; // Matrix green
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Occasionally display "SIGMA" as a complete word (5% chance)
        let text: string;
        if (Math.random() < 0.05) {
          text = 'SIGMA';
        } else {
          // Random character from the matrix set
          text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }
        
        // Draw the character/word
        // For "SIGMA", draw each letter vertically stacked
        if (text === 'SIGMA') {
          for (let j = 0; j < text.length; j++) {
            ctx.fillText(text[j], i * fontSize, drops[i] + (j * fontSize));
          }
        } else {
          ctx.fillText(text, i * fontSize, drops[i]);
        }

        // Reset drop to top randomly or when it reaches bottom
        if (drops[i] > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Move the drop down
        drops[i] += fontSize;
      }
    };

    // Animation loop
    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
};