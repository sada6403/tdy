import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const PremiumBackground = () => {
    const { theme } = useTheme();
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: null, y: null });
    const requestRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const initCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', initCanvas);
        initCanvas();

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; // Slow drift velocity X
                this.vy = (Math.random() - 0.5) * 0.5; // Slow drift velocity Y
                this.size = Math.random() * 3 + 1; // Base size

                // 20% slight blur/glow effect
                this.blur = Math.random() > 0.8 ? 10 : 0;

                // 15% are stars, rest are bubbles/dots
                this.type = Math.random() > 0.85 ? 'star' : 'bubble';

                // Type specific adjustments
                if (this.type === 'bubble') {
                    // Bubbles can be slightly larger and more transparent (outline)
                    if (Math.random() > 0.7) {
                        this.size = Math.random() * 12 + 2;
                        this.isOutline = true;
                    } else {
                        this.isOutline = false;
                    }
                }

                // Color palette selection based on Theme
                // This is set during INIT, so if theme changes, particles need re-init
                const isDark = theme === 'dark';
                if (isDark) {
                    const colors = ['255, 255, 255', '224, 247, 250', '200, 230, 255'];
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                } else {
                    // Light Mode Colors: Emerald, Soft Blue, Slate
                    const colors = ['16, 185, 129', '59, 130, 246', '100, 116, 139'];
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                }

                this.startOpacity = Math.random() * 0.3 + 0.1; // Base opacity
                this.opacity = this.startOpacity;
            }

            draw() {
                ctx.beginPath();
                ctx.shadowBlur = this.blur;
                ctx.shadowColor = `rgba(${this.color}, 1)`;

                if (this.type === 'star') {
                    // Draw 4-point star
                    const outerRadius = this.size * 2;
                    const innerRadius = this.size * 0.5;
                    for (let i = 0; i < 4; i++) {
                        ctx.lineTo(Math.cos((i * Math.PI) / 2) * outerRadius + this.x, Math.sin((i * Math.PI) / 2) * outerRadius + this.y);
                        ctx.lineTo(Math.cos(((i * Math.PI) / 2) + Math.PI / 4) * innerRadius + this.x, Math.sin(((i * Math.PI) / 2) + Math.PI / 4) * innerRadius + this.y);
                    }
                    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                    ctx.fill();
                } else if (this.isOutline) {
                    // Bubble outline
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(${this.color}, ${this.opacity * 0.5})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                } else {
                    // Standard dot
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                    ctx.fill();
                }

                ctx.shadowBlur = 0; // Reset
                ctx.closePath();
            }

            update() {
                // 1. Idle Movement
                this.x += this.vx;
                this.y += this.vy;

                // 2. Mouse Interaction
                if (mouseRef.current.x != null) {
                    let dx = mouseRef.current.x - this.x;
                    let dy = mouseRef.current.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    const attractionRadius = 220;
                    const repulsionRadius = 30; // Closer than this = repulsion

                    if (distance < attractionRadius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        let force = (attractionRadius - distance) / attractionRadius; // 0 to 1

                        if (distance < repulsionRadius) {
                            // Repulsion (Push away if too close)
                            const repulsionForce = (repulsionRadius - distance) / repulsionRadius;
                            this.vx -= forceDirectionX * repulsionForce * 2; // Stronger push
                            this.vy -= forceDirectionY * repulsionForce * 2;
                        } else {
                            // Attraction (Pull towards)
                            // Variable strength: stronger when closer (but not too close), weaker at edge
                            const attractionStrength = 0.8;
                            this.vx += forceDirectionX * force * attractionStrength * 0.1;
                            this.vy += forceDirectionY * force * attractionStrength * 0.1;
                        }
                    }
                }

                // Friction / Damping to prevent infinite accel
                this.vx *= 0.98;
                this.vy *= 0.98;

                // Maintain minimum movement (drift)
                // If velocity drops too low, nudge it back towards random drift speed
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed < 0.2) {
                    this.vx += (Math.random() - 0.5) * 0.05;
                    this.vy += (Math.random() - 0.5) * 0.05;
                }

                // 3. Edge Wrapping
                if (this.x > width + 20) this.x = -20;
                if (this.x < -20) this.x = width + 20;
                if (this.y > height + 20) this.y = -20;
                if (this.y < -20) this.y = height + 20;
            }
        }

        // Initialize Particles
        const initParticles = () => {
            particlesRef.current = [];
            let numberOfParticles = (width * height) / 12000; // Density balanced
            if (numberOfParticles < 60) numberOfParticles = 60;
            if (numberOfParticles > 150) numberOfParticles = 150;

            for (let i = 0; i < numberOfParticles; i++) {
                particlesRef.current.push(new Particle());
            }
        };

        // Initialize on mount and when theme changes to update colors
        initParticles();

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Dynamic connection color based on theme
            const isDark = theme === 'dark';
            const connectionColor = isDark ? '200, 230, 255' : '100, 116, 139'; // Light Blue vs Slate
            const connectionOpacityFactor = isDark ? 0.15 : 0.10;

            // Draw Connections
            for (let a = 0; a < particlesRef.current.length; a++) {
                for (let b = a; b < particlesRef.current.length; b++) {
                    let dx = particlesRef.current[a].x - particlesRef.current[b].x;
                    let dy = particlesRef.current[a].y - particlesRef.current[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        let opacity = 1 - distance / 100;
                        ctx.strokeStyle = `rgba(${connectionColor}, ${opacity * connectionOpacityFactor})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesRef.current[a].x, particlesRef.current[a].y);
                        ctx.lineTo(particlesRef.current[b].x, particlesRef.current[b].y);
                        ctx.stroke();
                    }
                }
            }

            // Update and Draw Particles
            particlesRef.current.forEach(particle => {
                particle.update();
                particle.draw();
            });

            requestRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Mouse Handlers
        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouseRef.current.x = null;
            mouseRef.current.y = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', initCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(requestRef.current);
        };
    }, [theme]); // Important: Re-run effect when theme changes

    return (
        <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-500 ${theme === 'dark' ? 'bg-[#070B12]' : 'bg-slate-50'}`}>
            {/* Subtle Gradient Drift Effect */}
            <div className={`absolute inset-0 w-[200%] h-full animate-drift bg-gradient-to-r opacity-50 ${theme === 'dark' ? 'from-transparent via-emerald-900/10 to-transparent' : 'from-transparent via-emerald-500/5 to-transparent'}`}></div>

            {/* Canvas Layer */}
            <canvas ref={canvasRef} className="absolute inset-0 block" />
        </div>
    );
};

export default PremiumBackground;
