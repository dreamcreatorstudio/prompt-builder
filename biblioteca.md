# Biblioteca de Bloques — Menú numerado
**Fecha:** 4 oct 2026 · **Versión:** 1.0
La misma biblioteca está en el mezclador: https://dreamcreatorstudio.github.io/prompt-builder

## Cómo se usa
- Cada bloque tiene una **clave corta** (CAB, OJO, VES, FON…) y opciones **numeradas**.
- Una **receta** es una línea como: `FOTO1 BRI2 MOD1 CAB5 OJO2 PIEL1 CUE1 VES1 ACC0 CAM1 LUZ1 FON1`
- En un chat con Claude, ChatGPT o Gemini basta con escribir: `/receta CAB=2 OJO=1 FON=3` y solo cambian esos bloques.
- `/menu CAB` muestra las opciones del bloque; `/variar VES n=3` entrega 3 prompts cambiando solo el vestuario.
- **Separador recomendado:** cada bloque en su propia línea terminada en coma. El salto de línea se lee como un espacio y no altera el prompt. Evita puntos (....) y los signos `| [ ] { } ( )` como separadores.
- Reglas de contenido: modelos claramente adultas, ficticias, sin desnudos ni contenido sexual.

## B1 · FOTO — Motor fotográfico
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Realista DSLR | RAW photo, photorealistic, real photograph, Canon EOS R5, 85mm lens, f/2.0, shallow depth of field, natural film grain, sharp focus, 8k uhd |
| 2 | Editorial de moda | high-end fashion editorial photograph, medium format camera, 80mm lens, f/4, crisp detail, magazine quality, photorealistic |
| 3 | Catálogo de estudio | clean commercial catalog photograph, 50mm lens, f/8, everything in sharp focus, even exposure, photorealistic |

## B2 · BRI — Brillo de piel
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Natural mate | natural matte skin finish, soft diffuse highlights |
| 2 | Glow saludable | healthy dewy skin glow, subtle natural sheen on cheekbones and shoulders |
| 3 | Post-entreno | light post-workout glow, faint natural sheen of perspiration |

## B3 · MOD — Modelo y expresión
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | 30 años, segura | a 30-year-old woman, mature adult facial features, confident relaxed expression, soft natural smile |
| 2 | 35 años, elegante | a 35-year-old woman, elegant mature features, calm self-assured gaze |
| 3 | 28 años, alegre | a 28-year-old woman, adult facial features, bright friendly smile |
| 4 | 40 años, serena | a 40-year-old woman, graceful mature features, serene warm expression |

## B3.1 · CAB — Cabello
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Rubia | long wavy honey-blonde hair |
| 2 | Pelirroja | long copper-red hair with soft waves |
| 3 | Negro | sleek long jet-black hair |
| 4 | Castaño | shoulder-length chestnut-brown hair |
| 5 | Moño suelto | ash-brown hair in a loose messy bun with face-framing strands |

## B3.2 · OJO — Ojos
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Azules | clear blue eyes |
| 2 | Verdes | green eyes |
| 3 | Marrones | warm brown eyes |
| 4 | Avellana | hazel eyes |
| 5 | Grises | grey eyes |

## B4 · PIEL — Piel y tono
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Porcelana | fair porcelain skin with warm pink undertones, natural skin texture, visible pores |
| 2 | Clara con pecas | fair skin with light freckles across the nose and cheeks, natural skin texture |
| 3 | Oliva | olive skin tone with golden undertones, natural skin texture |
| 4 | Morena | warm tan brown skin, natural skin texture, subtle color variation |
| 5 | Oscura | deep brown skin with rich undertones, natural skin texture |

## B5 · CUE — Cuerpo
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Fitness atlética | fit athletic adult build, toned shoulders and arms, defined core, strong toned legs |
| 2 | Pilates esbelta | lean slender adult physique with long toned muscles, graceful upright posture |
| 3 | Corredora | lean runner's build, defined legs, athletic adult proportions |
| 4 | Natural | healthy natural adult body, soft curves, relaxed posture |

## B6 · VES — Vestuario
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Denim + crop blanco | white ribbed cotton crop top, high-waisted light-wash denim shorts, white canvas sneakers |
| 2 | Deportivo negro | black sports crop top, matching high-waisted biker shorts, running shoes |
| 3 | Lino verano | cream linen button-up crop top, high-waisted linen shorts, leather sandals |
| 4 | Punto pastel | sage green knit crop cardigan, high-waisted white tailored shorts, minimalist sandals |
| 5 | Yoga set | dusty rose yoga set, fitted long-sleeve crop top and full-length leggings, barefoot |
| 6 | Heroína galáctica | original superhero costume, full-coverage silver and teal bodysuit with geometric armor plates, short flowing cape, star emblem on the chest, knee-high boots |
| 7 | Capitana tormenta | original superhero costume, full-coverage navy bodysuit with gold lightning-bolt piping, high collar, fingerless gloves, utility belt, armored boots |
| 8 | Guerrera de leyenda | original fantasy warrior costume, bronze breastplate over a long crimson tunic, leather bracers, ornate belt, sandal boots, round shield on her back |
| 9 | Pirata | pirate captain costume, white billowy blouse, burgundy brocade vest, tricorn hat, wide leather belt, tall boots, fitted dark trousers |
| 10 | Astronauta | modern white astronaut suit with orange accents, mission patches, helmet held under one arm |
| 11 | Samurái | samurai-inspired costume, dark lacquered armor pieces over an indigo hakama and kimono, red cord details |
| 12 | Flamenca | traditional red flamenco dress with white polka dots, ruffled sleeves and tiers, flower in the hair, shawl with fringe |
| 13 | Vaquera | western cowgirl outfit, suede fringe jacket, plaid shirt, high-waisted jeans, cowboy hat and boots |
| 14 | Steampunk | steampunk explorer outfit, brown leather corset vest over a cream blouse, brass goggles on the hat, long skirt with buckles, gloves |
| 15 | Elfa del bosque | original forest elf costume, long moss-green layered dress with leaf embroidery, hooded cape, elegant pointed ears, wooden bow |
| 16 | Piloto de carreras | racing driver suit, red and white fireproof jumpsuit with sponsor-free patches, helmet held at the hip |
| 17 | Carnaval dominicano | Dominican carnival Diablo Cojuelo costume, vibrant full-coverage satin suit covered in mirrors, bells and ribbons, ornate horned mask held in her hand |

## B6.1 · ACC — Accesorios
| # | Opción | Texto (inglés) |
|---|---|---|
| 0 | Ninguno | (sin accesorios) |
| 1 | Collar esmeralda | emerald pendant necklace on a fine gold chain |
| 2 | Aros dorados | small gold hoop earrings |
| 3 | Reloj deportivo | minimalist sports watch |
| 4 | Gorra | beige baseball cap |

## B7 · CAM — Cámara y pose
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Cuerpo entero 3/4 | full body shot, head to toe framing, standing relaxed, three-quarter turn, looking at camera |
| 2 | Medio cuerpo | medium shot from the waist up, eye-level camera, looking at camera |
| 3 | Retrato | close-up portrait, head and shoulders, eye-level camera |
| 4 | Caminando | full body shot, walking toward camera, natural mid-stride motion |
| 5 | Sentada | full body shot, sitting casually on a low wooden stool, relaxed posture |

## B8 · LUZ — Luz
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Estudio suave | soft even studio lighting, large softbox, gentle shadows |
| 2 | Hora dorada | warm golden hour sunlight, soft rim light |
| 3 | Ventana | soft natural window light from the side |
| 4 | Nublado | bright overcast daylight, soft shadowless light |

## B11 · FON — Fondo / background
| # | Opción | Texto (inglés) |
|---|---|---|
| 1 | Void blanco | seamless pure white background, infinite white studio void, soft contact shadow on the floor |
| 2 | Gris neutro | seamless light grey studio backdrop |
| 3 | París | Paris cityscape with the Eiffel Tower in the background, creamy bokeh |
| 4 | Playa | tropical beach at sunset, palm trees, soft ocean bokeh |
| 5 | Sala de yoga | bright yoga studio, light wooden floor, large windows, green plants |
| 6 | Calle urbana | sunny city street, modern storefronts, soft background blur |

## B0 · NEG — Prompt negativo (fijo)
```
cartoon, anime, 3d render, plastic skin, airbrushed, deformed hands, extra fingers, distorted anatomy, blurry, watermark, text, logo, cropped feet, teenager, childlike features
```

## Receta inicial (ejemplo)
`FOTO1 BRI2 MOD1 CAB5 OJO2 PIEL1 CUE1 VES1 ACC0 CAM1 LUZ1 FON1`
Modelo fitness de 30 años, piel porcelana, moño suelto, ojos verdes, short denim + crop top blanco, cuerpo entero, luz de estudio, **void blanco**.

## Cómo crecer la biblioteca
1. Prueba una opción nueva cambiando un solo bloque y con el mismo seed.
2. Si sale bien (★4–5), agrégala al final del bloque con el siguiente número. No renumeres las opciones existentes, para que las recetas viejas sigan funcionando.
3. Anota en el registro de pruebas: receta, plataforma, seed y ★.
