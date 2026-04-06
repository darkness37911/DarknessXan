// Animated aurora background
(function() {
    const cv  = document.getElementById('bg-canvas');
    if (!cv) return;

    const ctx = cv.getContext('2d');
    let W, H, t = 0, particles = [];

    function resize() {
        W = cv.width  = innerWidth;
        H = cv.height = innerHeight;
        particles = Array.from({ length: 50 }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            r:  Math.random() * 1.2 + 0.3,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            a:  Math.random() * 0.35 + 0.07,
        }));
    }

    function frame() {
        ctx.clearRect(0, 0, W, H);
        t += 0.003;

        [
            { x: W * (0.2 + 0.08 * Math.sin(t * 0.7)),   y: H * (0.4 + 0.10 * Math.cos(t * 0.5)),  r: W * 0.28, a: 0.065 },
            { x: W * (0.6 + 0.09 * Math.cos(t * 0.9)),   y: H * (0.3 + 0.08 * Math.sin(t * 0.6)),  r: W * 0.22, a: 0.050 },
            { x: W * (0.82 + 0.05 * Math.sin(t * 0.55)), y: H * (0.65 + 0.07 * Math.cos(t * 0.8)), r: W * 0.20, a: 0.040 },
        ].forEach(function(b) {
            const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            g.addColorStop(0,   'rgba(20,97,220,' + b.a + ')');
            g.addColorStop(0.5, 'rgba(77,166,255,' + (b.a * 0.5) + ')');
            g.addColorStop(1,   'rgba(0,0,0,0)');

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        });

        particles.forEach(function(p) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(77,166,255,' + p.a + ')';
            ctx.fill();
        });

        requestAnimationFrame(frame);
    }

    addEventListener('resize', resize);
    resize();
    frame();
})();
