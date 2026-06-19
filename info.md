<!DOCTYPE html>

<html class="light" lang="de"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kilian Siebert - Portfolio</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,400&amp;family=Inter:wght@600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-primary-fixed-variant": "#3c4a3c",
                        "inverse-on-surface": "#f2f1ee",
                        "secondary-fixed": "#f1dede",
                        "tertiary": "#545d63",
                        "sage-muted": "#849483",
                        "petal-pink": "#E8D5D5",
                        "on-background": "#1a1c1a",
                        "surface-tint": "#536253",
                        "on-tertiary-container": "#fbfdff",
                        "tertiary-fixed": "#dae4eb",
                        "on-primary": "#ffffff",
                        "on-primary-fixed": "#111f13",
                        "surface-container-high": "#e9e8e5",
                        "secondary-container": "#eedbdb",
                        "inverse-surface": "#2f312f",
                        "charcoal-text": "#333732",
                        "secondary": "#695b5b",
                        "on-secondary-fixed-variant": "#504444",
                        "mist-blue": "#D1DBE2",
                        "on-secondary": "#ffffff",
                        "on-surface-variant": "#434842",
                        "background": "#faf9f6",
                        "surface-variant": "#e3e2e0",
                        "surface": "#faf9f6",
                        "outline": "#747872",
                        "cream-base": "#FAF9F6",
                        "surface-bright": "#faf9f6",
                        "tertiary-fixed-dim": "#bec8cf",
                        "on-secondary-container": "#6d5f5f",
                        "outline-variant": "#c4c8c0",
                        "surface-container": "#efeeeb",
                        "on-primary-container": "#f7fff3",
                        "primary-container": "#697969",
                        "on-tertiary": "#ffffff",
                        "on-error-container": "#93000a",
                        "error": "#ba1a1a",
                        "primary": "#516051",
                        "error-container": "#ffdad6",
                        "on-tertiary-fixed": "#131d22",
                        "primary-fixed-dim": "#bacbb8",
                        "tertiary-container": "#6c767c",
                        "surface-container-highest": "#e3e2e0",
                        "surface-container-lowest": "#ffffff",
                        "surface-container-low": "#f4f3f1",
                        "on-secondary-fixed": "#231919",
                        "secondary-fixed-dim": "#d5c2c2",
                        "primary-fixed": "#d6e7d4",
                        "surface-dim": "#dbdad7",
                        "on-error": "#ffffff",
                        "on-surface": "#1a1c1a",
                        "on-tertiary-fixed-variant": "#3e484e",
                        "inverse-primary": "#bacbb8"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "container-max": "1280px",
                        "unit": "8px",
                        "margin-mobile": "20px",
                        "margin-desktop": "64px",
                        "section-gap": "120px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "body-lg": ["Newsreader"],
                        "body-md": ["Newsreader"],
                        "display-lg-mobile": ["Newsreader"],
                        "display-lg": ["Newsreader"],
                        "headline-md": ["Newsreader"],
                        "label-caps": ["Inter"]
                    },
                    "fontSize": {
                        "body-lg": ["20px", {"lineHeight": "32px", "fontWeight": "400"}],
                        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                        "display-lg-mobile": ["40px", {"lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "300"}],
                        "display-lg": ["64px", {"lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "300"}],
                        "headline-md": ["32px", {"lineHeight": "40px", "fontWeight": "400"}],
                        "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.08em", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
<style>
        body { scroll-behavior: smooth; }
        .glass-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
        }
        .ambient-shadow {
            box-shadow: 0 10px 40px -10px rgba(81, 96, 81, 0.1);
        }
        .video-tint {
            position: absolute;
            inset: 0;
            background: rgba(209, 219, 226, 0.15); /* mist-blue tint */
            pointer-events: none;
        }
    </style>
</head>
<body class="bg-cream-base text-charcoal-text font-body-md antialiased overflow-x-hidden selection:bg-sage-muted selection:text-cream-base">
<!-- TopNavBar Shared Component -->
<nav class="bg-cream-base/80 dark:bg-background/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-mist-blue/20 dark:border-outline-variant/10">
<div class="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-6 max-w-container-max mx-auto">
<a class="font-headline-md text-headline-md text-charcoal-text dark:text-inverse-on-surface tracking-tighter" href="#">
                Kilian Siebert
            </a>
<div class="hidden md:flex gap-gutter items-center">
<a class="text-charcoal-text dark:text-surface-variant font-body-md text-body-md uppercase tracking-widest hover:text-sage-muted transition-colors duration-300 cursor-pointer transition-opacity active:opacity-70" href="#arbeiten">ARBEITEN</a>
<a class="text-primary font-bold border-b border-primary pb-1 font-body-md text-body-md uppercase tracking-widest hover:text-sage-muted transition-colors duration-300 cursor-pointer transition-opacity active:opacity-70" href="#ueber-mich">ÜBER MICH</a>
<a class="text-charcoal-text dark:text-surface-variant font-body-md text-body-md uppercase tracking-widest hover:text-sage-muted transition-colors duration-300 cursor-pointer transition-opacity active:opacity-70" href="#journal">JOURNAL</a>
<a class="text-charcoal-text dark:text-surface-variant font-body-md text-body-md uppercase tracking-widest hover:text-sage-muted transition-colors duration-300 cursor-pointer transition-opacity active:opacity-70" href="#kontakt">KONTAKT</a>
</div>
<!-- Mobile Menu Toggle (Simplified) -->
<button class="md:hidden text-charcoal-text flex items-center">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">menu</span>
</button>
</div>
</nav>
<main>
<!-- Hero Section -->
<section class="relative w-full h-screen flex items-center justify-center overflow-hidden">
<!-- Simulated Video Loop Background (Using image placeholder with tint for prototype) -->
<div class="absolute inset-0 w-full h-full">
<img alt="High-resolution cinematic landscape of a real mountain region at sunset." class="w-full h-full object-cover" data-alt="A cinematic, slow-motion landscape shot of a serene misty morning over a calm lake, surrounded by subtle sage green foliage and cream-colored fog. The lighting is soft and ethereal, mimicking the Synesthetic Light aesthetic with expansive white space and tonal serenity. The overall mood is reflective, quiet, and highly polished, suitable for a premium digital portfolio." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa6cuWrZoVnseT88St5ag3h4CVdRkPbBO48lGOs7tFXuyJmmtLF8g4tStIrJTPtY2FO7voxDvoySVQ76TaK48_xgf8xMgd7BYBIrAKAQcS9dp5OL6LpqngnxpIChbu8bO9R35gqXcd4ltTUQdxM_iTg5IZaOfBq-zqAzXZ-PwyYXL5DJC_ohnkZm9R19ZiH9uu7QJuzSQDYwzljhJIpYRWznkKpkH8_WAzsrHVp8Hf4vQruyU8s7e9EvhdTaziuQvN3RAOx9psiPo"/>
<div class="video-tint bg-gradient-to-b from-charcoal-text/40 to-transparent"></div>
</div>
<div class="relative z-10 text-center px-margin-mobile flex flex-col items-center">
<h1 class="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-cream-base mix-blend-difference mb-6">Kilian Siebert</h1>
<p class="font-body-lg text-body-lg text-cream-base max-w-lg mx-auto tracking-wide [text-shadow:_0_2px_10px_rgba(0,0,0,0.3)]">Capturing quiet moments in a loud world.</p>
</div>
<!-- Scroll Cue -->
<div class="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70 animate-pulse">
<span class="font-label-caps text-label-caps text-cream-base tracking-widest">SCROLL</span>
<span class="material-symbols-outlined text-cream-base font-light">arrow_downward</span>
</div>
</section>
<!-- Intro Section -->
<section class="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" id="ueber-mich">
<div class="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
<div class="md:col-span-5 md:col-start-2 relative">
<div class="aspect-[4/5] rounded-lg overflow-hidden border border-mist-blue/30 ambient-shadow">
<img alt="Portrait Kilian" class="w-full h-full object-cover filter contrast-125 saturate-50" data-alt="A sophisticated, minimalist portrait of a young creative professional standing in soft, diffused morning light. The background is a clean, slightly frosted cream-toned wall that blends seamlessly with the Synesthetic Light aesthetic. The subject is thoughtfully composed, exuding calm and intentionality, wearing simple, textured clothing in muted tones of mist blue and charcoal. High-end editorial photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG-ZWvE9OuoZn2eqIKgTAuSeqeEL3RwYoCcRiXx3KQxfBHCl6559A-N6NW1UzrwEjaZrX2U7dLE9U8aIDOKI_LEmPQymjpanZWuvNUR3BMkLAH-g0083aW9VPpOmbsLIElzn30gw_s9rIyRpWGnLo_vNMKR8i78JHt58hvDH_6sw1fILeNlloeiu661ahZzkQT69RAw7FIrX6oKFL1HVBSQxU613tP35ONpk7G8G0U9FjtrO_2qmwxmEGmmiJc8r5mPxS3fbMz1LI"/>
</div>
</div>
<div class="md:col-span-5 md:col-start-8 mt-12 md:mt-0">
<h2 class="font-headline-md text-headline-md text-primary mb-8">Über Mich</h2>
<p class="font-body-lg text-body-lg text-charcoal-text/80 mb-8 leading-relaxed">
                        Ich bin Kilian, ein Fotograf und Filmemacher mit einer Schwäche für das Unscheinbare. Meine Arbeit ist ein ständiger Versuch, die Poesie im Alltäglichen zu finden und Geschichten zu erzählen, die atmen können. Durch die Linse suche ich nach der Verbindung zwischen Menschen, Orten und dem stillen Dialog, der sie verbindet.
                    </p>
<a class="inline-flex items-center gap-2 border-b border-primary pb-1 text-primary hover:text-sage-muted transition-colors font-label-caps text-label-caps" href="#kontakt">
                        MEHR ERFAHREN <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
</div>
</section>
<!-- Was Ich Mache Section (Bento Grid) -->
<section class="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-surface-container-low rounded-xl mx-4 md:mx-auto" id="arbeiten">
<div class="text-center mb-16">
<h2 class="font-headline-md text-headline-md text-primary mb-4">Was Ich Mache</h2>
<p class="font-body-md text-body-md text-charcoal-text/60">Disziplinen &amp; Fokus</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter h-auto md:h-[600px]">
<!-- Tile 1 -->
<div class="group relative rounded-lg overflow-hidden h-64 md:h-full border border-mist-blue/20">
<img alt="Menschen" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="A candid, emotive portrait shot in a highly stylized, minimalist setting with soft, glowing ambient light. The scene captures a genuine moment of human connection, framed within a glassmorphism aesthetic featuring muted pastel backgrounds in petal pink and cream. The imagery is quiet, editorial, and deeply personal, reflecting a high-end photography portfolio." src="https://lh3.googleusercontent.com/aida-public/AB6AXuApGL0tWsvpjALvnC_ZxI_HkK0SkLHfwOfN777feFBxsxSVikx7IiLZqXorjbaNCOZ4aQ9w_WChuCtYBKHyL7i7Fqg17EVYH8xQBOL6W866KVBgd5jAHfUXLMy1ghv45OE03fmjoLVZOuyG2VCHbhQg0zUXBC9NVBZhjuoz-bssbK0PBA27YhRvd3FaePt7K7KG4fx3Rsfeij2F8_8ZyzbgNX-w1djNmVvDibXrOEAcpAd4ZOD_SjlkGeKNGZbBV4G3mqUlV7tGyew"/>
<div class="video-tint"></div>
<div class="absolute inset-0 bg-gradient-to-t from-charcoal-text/80 to-transparent flex items-end p-8">
<h3 class="font-headline-md text-headline-md text-cream-base">Menschen</h3>
</div>
</div>
<!-- Tile 2 -->
<div class="group relative rounded-lg overflow-hidden h-64 md:h-full border border-mist-blue/20">
<img alt="Reisen" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="A vast, minimalist landscape shot featuring a solitary figure walking along a misty coastal path. The color palette is dominated by soft sage greens, mist blues, and airy creams, creating a sense of boundless space and tonal serenity. The aesthetic is highly polished and editorial, evoking a sense of quiet exploration and intentionality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4ycnV04L7edW7tJp-mzQwPAraS5U4f7bOTxQ0V6eOVWNvauVMFpyRMBEB6u__OTTgej41Mdh6wnnseXM-6NWbsEPGtfku3vABFhCkuP8kLlmRtNi5ILPhDZS7mqXvf5UDIpO1Ho37fyFPg_qApEn9S5g-YgMQZ7oJdGgslbomkQNHZZHKhgWD8QvPWmdDNaQ7GaYl1wIlwn0iQZIqU1I2_W78JFh4LkUBBR1CvxDcILdsCdauCI9yewMvUrPIzAnwBty0pUb4lbY"/>
<div class="video-tint"></div>
<div class="absolute inset-0 bg-gradient-to-t from-charcoal-text/80 to-transparent flex items-end p-8">
<h3 class="font-headline-md text-headline-md text-cream-base">Reisen</h3>
</div>
</div>
<!-- Tile 3 -->
<div class="group relative rounded-lg overflow-hidden h-64 md:h-full border border-mist-blue/20">
<img alt="Sport" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" data-alt="An abstract, high-end action shot of an athlete in motion, captured with a slow shutter speed to create a sense of elegant, sweeping movement. The environment is flooded with soft morning light, diffusing the background into abstract patches of cream and muted mist blue. The aesthetic leans heavily into minimalism and Synesthetic Light, focusing on the poetry of movement rather than raw intensity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh0D4Ox824EDvd9DJbqE2-aH3HkvGHhs1tGN4_7_LtozCaTqVmWORKXwP-x1wACvm79nhBeOsXApuVHLOrSwYpIziM2RgthbseL4egFEI5r1CNPha97wP6GVa6w8Dmo1mfu4pQtV8q8HyY79SMZ481s8KcPUCvJ_x-L7bgpMVs8qEytB3Anh6PdoKOcFizK6n6Bsh3D1-e8Q--85t-G-WR3q8ed_ln4I8nC15UKTnGuaSiOEBrDPnmVMDAzB9OtBCYmwCnzMjCr50"/>
<div class="video-tint"></div>
<div class="absolute inset-0 bg-gradient-to-t from-charcoal-text/80 to-transparent flex items-end p-8">
<h3 class="font-headline-md text-headline-md text-cream-base">Sport</h3>
</div>
</div>
</div>
</section>
<!-- Fakten-Strip -->
<section class="py-24 px-margin-mobile md:px-margin-desktop bg-surface border-y border-mist-blue/20">
<div class="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-mist-blue/30">
<div class="py-4">
<div class="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">3x</div>
<div class="font-label-caps text-label-caps text-charcoal-text/60 tracking-widest">MITTELDISTANZ</div>
</div>
<div class="py-4">
<div class="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">14</div>
<div class="font-label-caps text-label-caps text-charcoal-text/60 tracking-widest">LÄNDER BEREIST</div>
</div>
<div class="py-4">
<div class="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">2021</div>
<div class="font-label-caps text-label-caps text-charcoal-text/60 tracking-widest">SEIT DEM DABEI</div>
</div>
</div>
</section>
<!-- Split CTA Section -->
<section class="min-h-[819px] flex flex-col md:flex-row">
<div class="w-full md:w-1/2 relative h-[512px] md:h-auto">
<img alt="Workspace" class="w-full h-full object-cover" data-alt="A highly curated, minimalist workspace bathed in natural, soft morning light. The scene features subtle glassmorphism elements, a sleek camera resting on a pristine cream-colored desk, and faint shadows that add depth without visual noise. The palette is strictly limited to cream base, mist blue, and sage accents, embodying the Synesthetic Light design system's gallery-like perfection." src="https://lh3.googleusercontent.com/aida-public/AB6AXuACilQM3GcNWtYFCCP-9SSeVXQhg14rOjzTvVZ0QqJ86urxPRTaaUv2CSmcMRDyr7z5JSW_atDzJ71HuQmhoS-8YgpPNTGC1DojD0FYS-joUGRHwbWuMQHAnbuLQmuLJlLsMuipAkLHyVwX4f9qHgFJ7PAHre-sB6QVMD7HCFvwdgYZR0XIthfaZdvMbchfgplx-q8LCcwvMfFy76gb0T4y6JrinthTthW9zQ7mA58BoVZeEx--x2ZwdoTZ06PRaosNOvlBkMJj_WQ"/>
<div class="video-tint"></div>
</div>
<div class="w-full md:w-1/2 bg-secondary-fixed/50 flex items-center justify-center p-margin-mobile md:p-margin-desktop">
<div class="max-w-md text-center md:text-left">
<h2 class="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">Lass uns was erschaffen.</h2>
<p class="font-body-lg text-body-lg text-charcoal-text/70 mb-10">Egal ob Kunde oder Marke – ich bin immer auf der Suche nach der nächsten Geschichte, die es wert ist, erzählt zu werden.</p>
<button class="bg-primary text-cream-base font-label-caps text-label-caps px-8 py-4 rounded-md hover:bg-surface-tint transition-colors ambient-shadow">
                        PROJEKT STARTEN
                    </button>
</div>
</div>
</section>
</main>
<!-- Footer Shared Component -->
<footer class="bg-surface-container-low dark:bg-inverse-surface w-full py-section-gap border-t border-mist-blue/30 dark:border-outline-variant/20">
<div class="flex flex-col md:flex-row justify-between items-start md:items-center px-margin-mobile md:px-margin-desktop gap-gutter max-w-container-max mx-auto">
<div class="mb-8 md:mb-0">
<span class="font-headline-md text-headline-md text-charcoal-text dark:text-inverse-on-surface block mb-2">Kilian Siebert</span>
<span class="font-label-caps text-label-caps text-on-surface-variant dark:text-surface-variant">© Kilian Siebert. All rights reserved.</span>
</div>
<div class="flex flex-wrap gap-8 font-label-caps text-label-caps">
<a class="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline" href="#">Instagram</a>
<a class="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline" href="#">Strava</a>
<a class="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline" href="#">Impressum</a>
<a class="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline" href="#">Datenschutz</a>
</div>
</div>
</footer>
</body></html>