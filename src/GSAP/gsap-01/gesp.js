
gsap.registerPlugin(ScrollTrigger);

gsap.to(".hero-title", {
    scale: 1.5,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

gsap.to(".hero-bg", {
    yPercnt: 30,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

const rows = document.querySelectorAll('.parallax-row');

rows.forEach((row, index) => {
    const text = row.querySelector('.parallax-text');
    const image = row.querySelector('.parallax-image');
    const isEven = index % 2 !== 0;

    gsap.from(text, {
        x: isEven ? 100 : -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: row,
            srart: "top 80%",
        }
    });

    gsap.from(image, {
        x: isEven ? -150 : 150,
        opacity: 0.8,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: row,
            srart: "top 80%",
        }
    });

    gsap.from(image, {
        y: -80,
        ease: "none",
        scrollTrigger: {
            trigger: row,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});


const btn = document.getElementById('explodeBtn');
const cards = gsap.utils.toArray('.card');
let isExploded = false;

btn.addEventListener("click", () => {
    if (!isExploded) {
        cards.forEach((card, i) => {
            const angle = (i / cards.length) * Math.PI * 2;
            const distance = 350;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const rotation = (Math.random() - 0.5) * 45;

            gsap.to(card, {
                x: x,
                y: y,
                rotation: rotation,
                opacity: 1,
                pointerEvents: "auto",
                duration: 0.8,
                delay: i * 0.05,
                ease: "back.out(1.5)"
            });
        });

        btn.innerText = "收回卡片";
        gsap.to(btn, { opacity: 0.5, duration: 0.3 });
        isExploded = true;

    } else {
        cards.forEach((card, i) => {
            gsap.to(card, {
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 0,
                PointerEvents: "none",
                duration: 0.5,
                delay: i * 0.03,
                ease: "power2.in"
            });
        });

        btn.innerText = "点击记忆卡";
        gsap.to(btn, {
            opacity: 1,
            duration: 0.3
        });
        isExploded = false;
    }
});