document.addEventListener("DOMContentLoaded", () => {

// loader
    const loader = document.querySelector(".story-loader");

    setTimeout(() => {

        if (loader) {
            loader.classList.add("loaded");
        }

    }, 1600);

// scroll reveal
    const revealElements =
        document.querySelectorAll(".reveal");


    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("is-visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.15,

                rootMargin:
                    "0px 0px -70px 0px"
            }
        );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });

// image parallax
    const mainImage =
        document.querySelector(".story-main-image img");


    if (mainImage) {

        let ticking = false;


        window.addEventListener("scroll", () => {

            if (!ticking) {

                window.requestAnimationFrame(() => {

                    const rect =
                        mainImage.getBoundingClientRect();


                    const viewport =
                        window.innerHeight;


                    if (
                        rect.top < viewport &&
                        rect.bottom > 0
                    ) {

                        const progress =
                            (viewport - rect.top) /
                            (viewport + rect.height);


                        const move =
                            (progress - 0.5) * 18;


                        mainImage.style.transform =
                            `scale(1.04) translateY(${move}px)`;

                    }


                    ticking = false;

                });


                ticking = true;

            }

        });

    }

// hero mouse movement
    const hero =
        document.querySelector(".story-hero");

    const decoration =
        document.querySelector(".hero-decoration");


    if (hero && decoration) {

        hero.addEventListener("mousemove", event => {

            const rect =
                hero.getBoundingClientRect();


            const x =
                (event.clientX - rect.left) /
                rect.width - 0.5;


            const y =
                (event.clientY - rect.top) /
                rect.height - 0.5;


            decoration.style.transform =
                `translate(${x * 15}px, ${y * 15}px)`;

        });


        hero.addEventListener("mouseleave", () => {

            decoration.style.transform =
                "translate(0, 0)";

        });

    }


// shade card micro parallax
    const shadeStage =
        document.querySelector(".shade-stage");

    const shadeCards =
        document.querySelectorAll(".shade-card");


    if (shadeStage && shadeCards.length) {

        shadeStage.addEventListener(
            "mousemove",
            event => {

                const rect =
                    shadeStage.getBoundingClientRect();


                const x =
                    (event.clientX - rect.left) /
                    rect.width - 0.5;


                shadeCards.forEach((card, index) => {

                    const amount =
                        (index + 1) * 2;


                    card.style.setProperty(
                        "--mouse-x",
                        `${x * amount}px`
                    );

                });

            }
        );


        shadeStage.addEventListener(
            "mouseleave",
            () => {

                shadeCards.forEach(card => {

                    card.style.setProperty(
                        "--mouse-x",
                        "0px"
                    );

                });

            }
        );

    }

// smooth shade float
    shadeCards.forEach((card, index) => {

        const image =
            card.querySelector(".shade-image img");


        if (!image) return;


        image.animate(
            [
                {
                    transform:
                        "scale(.85) translateY(0)"
                },
                {
                    transform:
                        "scale(.85) translateY(-5px)"
                },
                {
                    transform:
                        "scale(.85) translateY(0)"
                }
            ],
            {
                duration:
                    4000 + index * 500,

                iterations: Infinity,

                easing:
                    "ease-in-out"
            }
        );

    });

});