# Block Library / Biblioteca de bloques

Library version **v1.9** · Live tool: https://dreamcreatorstudio.github.io/prompt-builder

Each block has a short key and numbered options. A **recipe** records the library version, one option per block, the platform and the separator:

`v1.9 | PHOTO1 GLOW1 AGE1 ETHN1 EXPR2 HAIR1 STYLE9 EYES2 SKIN3 BODY2 OUTFIT22 ACC0 CAM1 ANGLE1 LIGHT1 BG6 | perchance | one`

Spanish keys work too: `v1.9 | FOTO1 BRI1 EDAD1 ETN1 EXP2 CAB1 PEI9 OJO2 PIEL3 CUE2 VES22 ACC0 CAM1 ANG1 LUZ1 FON6 | perchance | one`

New options are always added at the end of a block and existing numbers never change, so old recipes keep working.

## B1 · PHOTO / FOTO — Photo engine / Motor fotográfico
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Realistic DSLR | Realista DSLR | RAW photo, photorealistic, real photograph, Canon EOS R5, 85mm lens, f/2.0, shallow depth of field, natural film grain, sharp focus, 8k uhd |
| 2 | Fashion editorial | Editorial de moda | high-end fashion editorial photograph, medium format camera, 80mm lens, f/4, crisp detail, magazine quality, photorealistic |
| 3 | Studio catalog | Catálogo de estudio | clean commercial catalog photograph, 50mm lens, f/8, everything in sharp focus, even exposure, photorealistic |

## B2 · GLOW / BRI — Skin glow / Brillo de piel
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Natural matte | Natural mate | natural matte skin finish, soft diffuse highlights |
| 2 | Healthy glow | Glow saludable | healthy dewy skin glow, subtle natural sheen on cheekbones and shoulders |
| 3 | Post-workout | Post-entreno | light post-workout glow, faint natural sheen of perspiration |

## B3 · AGE / EDAD — Model age / Edad de la modelo
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | 25 | 25 años | a 25-year-old woman, adult facial features |
| 2 | 30 | 30 años | a 30-year-old woman, adult facial features |
| 3 | 35 | 35 años | a 35-year-old woman, mature adult features |
| 4 | 40 | 40 años | a 40-year-old woman, mature adult features |
| 5 | 45 | 45 años | a 45-year-old woman, graceful mature features |
| 6 | 50 | 50 años | a 50-year-old woman, graceful mature features, subtle laugh lines |

## B3.5 · ETHN / ETN — Heritage / Origen
| # | EN | ES | Prompt text |
|---|---|---|---|
| 0 | Unspecified | Sin especificar | (none) |
| 1 | Slavic | Eslava | Slavic heritage |
| 2 | Nordic | Nórdica | Nordic Scandinavian heritage |
| 3 | Russian | Rusa | Russian heritage |
| 4 | Latina | Latina | Latina heritage |
| 5 | Mediterranean | Mediterránea | Mediterranean heritage |
| 6 | Celtic | Celta | Celtic Irish heritage |
| 7 | Afro-Caribbean | Afrocaribeña | Afro-Caribbean heritage |
| 8 | African | Africana | African heritage |
| 9 | Middle Eastern | Medio Oriente | Middle Eastern heritage |
| 10 | South Asian | Sur de Asia | South Asian heritage |
| 11 | East Asian | Asia oriental | East Asian heritage |
| 12 | Southeast Asian | Sudeste asiático | Southeast Asian heritage |
| 13 | Mixed | Mixta | mixed heritage |
| 14 | Greek | Griega | Greek heritage |
| 15 | Native American | Indígena norteamericana | Native American First Nations heritage |

## B3.3 · EXPR / EXP — Expression / Expresión
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Confident | Segura | confident relaxed expression, soft natural smile |
| 2 | Cheerful | Alegre | bright friendly smile |
| 3 | Elegant | Elegante | calm self-assured gaze |
| 4 | Serene | Serena | serene warm expression |
| 5 | Playful | Divertida | playful laughing expression |
| 6 | Sweet & confident | Dulce y segura | sweet gentle expression, calm self-assured gaze, soft smile |

## B3.1 · HAIR / CAB — Hair color / Color de cabello
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Honey blonde | Rubia miel | honey-blonde hair |
| 2 | Platinum blonde | Rubia platino | platinum blonde hair |
| 3 | Redhead | Pelirroja | copper-red hair |
| 4 | Auburn | Caoba | auburn hair |
| 5 | Chestnut | Castaño | chestnut-brown hair |
| 6 | Ash brown | Castaño ceniza | ash-brown hair |
| 7 | Black | Negro | jet-black hair |
| 8 | Silver grey | Gris plata | silver-grey hair |
| 9 | Pastel blue | Azul pastel | pastel blue dyed hair |
| 10 | Electric blue | Azul eléctrico | vivid electric-blue dyed hair |
| 11 | Pink | Rosa | soft pink dyed hair |
| 12 | Lavender | Lavanda | lavender purple dyed hair |
| 13 | Mint green | Verde menta | mint green dyed hair |
| 14 | Blue-violet ombré | Degradado azul-violeta | blue to violet ombré dyed hair |
| 15 | Rainbow | Multicolor arcoíris | rainbow multicolor dyed hair in pastel streaks |
| 16 | Copper chestnut | Castaño cobrizo | chestnut-brown hair with copper and caramel highlights |

## B3.4 · STYLE / PEI — Hairstyle / Peinado
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Sleek straight | Liso perfecto | sleek straight hair |
| 2 | Straight | Liso natural | straight hair |
| 3 | Subtle waves | Ondas sutiles | subtle natural waves |
| 4 | Wavy | Ondulado | wavy hair |
| 5 | Beach waves | Ondas de playa | loose beach waves |
| 6 | Curly | Rizado | curly hair |
| 7 | Coily / afro | Muy rizado / afro | coily hair, afro hair |
| 8 | High ponytail | Coleta alta | high ponytail |
| 9 | Neat bun | Moño pulido | neat hair bun |
| 10 | Messy bun | Moño suelto | loose messy bun with face-framing strands |
| 11 | Pixie cut | Corte pixie | pixie cut |
| 12 | Short bob | Bob corto | short bob cut |
| 13 | Vine-strand waves | Ondas con enredaderas | long loose softly tousled hair with trailing thin vines and tiny white blossoms hanging like strands, small green leaves tucked in |
| 14 | Straight vine strands | Lisa con enredaderas | long straight loose hair with trailing thin vines and tiny white blossoms hanging like strands, small green leaves tucked in |

## B3.2 · EYES / OJO — Eyes / Ojos
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Blue | Azules | clear blue eyes |
| 2 | Green | Verdes | green eyes |
| 3 | Brown | Marrones | warm brown eyes |
| 4 | Hazel | Avellana | hazel eyes |
| 5 | Grey | Grises | grey eyes |
| 6 | Amber gold | Ámbar dorado | luminous amber-gold eyes |
| 7 | Magic green | Verde mágico | glowing vivid emerald-green eyes with a subtle magical light |
| 8 | Vivid sapphire | Zafiro intenso | luminous vivid sapphire-blue eyes |

## B4 · SKIN / PIEL — Skin tone / Piel y tono
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Porcelain | Porcelana | fair porcelain skin with warm pink undertones, natural skin texture, visible pores |
| 2 | Fair, freckles | Clara con pecas | fair skin with light freckles across the nose and cheeks, natural skin texture |
| 3 | Olive | Oliva | olive skin tone with golden undertones, natural skin texture |
| 4 | Tan | Morena | warm tan brown skin, natural skin texture, subtle color variation |
| 5 | Deep | Oscura | deep brown skin with rich undertones, natural skin texture |

## B5 · BODY / CUE — Body / Cuerpo
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Athletic fit | Fitness atlética | fit athletic adult build, toned shoulders and arms, defined core, strong toned legs |
| 2 | Lean pilates | Pilates esbelta | lean slender adult physique with long toned muscles, graceful upright posture |
| 3 | Runner | Corredora | lean runner's build, defined legs, athletic adult proportions |
| 4 | Natural | Natural | healthy natural adult body, soft curves, relaxed posture |

## B6 · OUTFIT / VES — Outfit / Vestuario
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Denim + white crop | Denim + crop blanco | white ribbed cotton crop top, high-waisted light-wash denim shorts, white canvas sneakers |
| 2 | Black athletic | Deportivo negro | black sports crop top, matching high-waisted biker shorts, running shoes |
| 3 | Summer linen | Lino verano | cream linen button-up crop top, high-waisted linen shorts, leather sandals |
| 4 | Pastel knit | Punto pastel | sage green knit crop cardigan, high-waisted white tailored shorts, minimalist sandals |
| 5 | Yoga set | Yoga set | dusty rose yoga set, fitted long-sleeve crop top and full-length leggings, barefoot |
| 6 | Galactic heroine | Heroína galáctica | original superhero costume, full-coverage silver and teal bodysuit with geometric armor plates, short flowing cape, star emblem on the chest, knee-high boots |
| 7 | Storm captain | Capitana tormenta | original superhero costume, full-coverage navy bodysuit with gold lightning-bolt piping, high collar, fingerless gloves, utility belt, armored boots |
| 8 | Legend warrior | Guerrera de leyenda | original fantasy warrior costume, bronze breastplate over a long crimson tunic, leather bracers, ornate belt, sandal boots, round shield on her back |
| 9 | Pirate | Pirata | pirate captain costume, white billowy blouse, burgundy brocade vest, tricorn hat, wide leather belt, tall boots, fitted dark trousers |
| 10 | Astronaut | Astronauta | modern white astronaut suit with orange accents, mission patches, helmet held under one arm |
| 11 | Samurai | Samurái | samurai-inspired costume, dark lacquered armor pieces over an indigo hakama and kimono, red cord details |
| 12 | Flamenco | Flamenca | traditional red flamenco dress with white polka dots, ruffled sleeves and tiers, flower in the hair, shawl with fringe |
| 13 | Cowgirl | Vaquera | western cowgirl outfit, suede fringe jacket, plaid shirt, high-waisted jeans, cowboy hat and boots |
| 14 | Steampunk | Steampunk | steampunk explorer outfit, brown leather corset vest over a cream blouse, brass goggles on the hat, long skirt with buckles, gloves |
| 15 | Forest elf | Elfa del bosque | original forest elf costume, long moss-green layered dress with leaf embroidery, hooded cape, elegant pointed ears, wooden bow |
| 16 | Race driver | Piloto de carreras | racing driver suit, red and white fireproof jumpsuit with sponsor-free patches, helmet held at the hip |
| 17 | Dominican carnival | Carnaval dominicano | Dominican carnival Diablo Cojuelo costume, vibrant full-coverage satin suit covered in mirrors, bells and ribbons, ornate horned mask held in her hand |
| 18 | Brazil baiana | Baiana de Brasil | traditional Bahian samba-school baiana costume, wide hoop skirt with lace layers, embroidered blouse, colorful head wrap, bead necklaces |
| 19 | Barranquilla cumbia | Cumbia de Barranquilla | Barranquilla carnival cumbia dancer outfit, long red, yellow and blue pollera skirt with ruffles, off-shoulder ruffled blouse, flower crown |
| 20 | Oruro morenada | Morenada de Oruro | Oruro carnival morenada dancer costume, embroidered layered pollera skirt, sequined shawl, bowler hat |
| 21 | Puno Candelaria | Candelaria de Puno | Candelaria festival dancer outfit from Puno, multiple bright layered polleras, embroidered jacket, bowler hat, woven shawl |
| 22 | Venice carnival | Carnaval de Venecia | Venetian carnival gown, brocade bodice with long full skirt, ornate Colombina half-mask, feathered headpiece |
| 23 | Retro soda shop | Cafetería retro | 1950s retro soda-shop outfit, mint and cream letterman cardigan, mustard plaid pleated skirt, white ankle socks, penny loafers |
| 24 | 70s mystery sleuth | Detective años 70 | 1970s amateur detective outfit, mustard corduroy jacket, teal turtleneck, brown bell-bottom trousers, platform boots, flashlight in hand |
| 25 | Farm-town hero | Heroína de pueblo | small-town farm outfit, forest green flannel shirt, worn denim jacket, straight jeans, leather work boots |
| 26 | Emerald heroine (cape) | Heroína esmeralda (capa) | original superhero costume, full-coverage emerald and silver bodysuit, short silver cape, stylized leaf emblem on the chest, knee-high silver boots |
| 27 | Emerald heroine (no cape) | Heroína esmeralda (sin capa) | original superhero costume, full-coverage emerald and silver bodysuit with sleek armored panels, stylized leaf emblem on the chest, silver gauntlets, knee-high silver boots, no cape |
| 28 | Forest princess (short) | Princesa del bosque (corto) | original forest princess outfit, dress made of layered green leaves, vine-laced bodice, puffed leaf sleeves, ruffled knee-length leaf skirt, vine-wrapped heeled sandals, no wings |
| 29 | Forest princess (gown) | Princesa del bosque (largo) | original forest princess gown made of layered green leaves, vine-laced bodice, puffed leaf sleeves, flowing full-length leaf skirt with tiny white blossoms, no wings |

## B6.1 · ACC / ACC — Accessories / Accesorios (choose several: `ACC1+3`; `ACC0` = none)
| # | EN | ES | Prompt text |
|---|---|---|---|
| 0 | None | Ninguno | (none) |
| 1 | Emerald necklace | Collar esmeralda | emerald pendant necklace on a fine gold chain |
| 2 | Gold hoops | Aros dorados | small gold hoop earrings |
| 3 | Sports watch | Reloj deportivo | minimalist sports watch |
| 4 | Cap | Gorra | beige baseball cap |
| 5 | Sunglasses | Gafas de sol | oversized tortoiseshell sunglasses |
| 6 | Straw hat | Sombrero de paja | wide-brim straw hat |
| 7 | Silk scarf | Pañuelo de seda | patterned silk scarf |
| 8 | Pearl earrings | Aretes de perla | small pearl stud earrings |
| 9 | Gold bracelets | Pulseras doradas | stack of thin gold bracelets |
| 10 | Tote bag | Bolso tote | canvas tote bag on the shoulder |
| 11 | Yoga mat | Esterilla de yoga | rolled yoga mat under one arm |

## B7 · CAM / CAM — Framing & pose / Encuadre y pose
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Full body 3/4 | Cuerpo entero 3/4 | full body shot, head to toe framing, standing relaxed, three-quarter turn, looking at camera |
| 2 | Half body | Medio cuerpo | medium shot from the waist up, looking at camera |
| 3 | Portrait | Retrato | close-up portrait, head and shoulders |
| 4 | Walking | Caminando | full body shot, walking toward camera, natural mid-stride motion |
| 5 | Seated | Sentada | full body shot, sitting casually on a low wooden stool, relaxed posture |
| 6 | Confident stance | Postura segura | full body shot, standing tall, confident regal posture, shoulders back, chin slightly raised, looking at camera |

## B7.1 · ANGLE / ANG — Camera angle / Ángulo de cámara
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Eye-level | A la altura de los ojos | eye-level shot, neutral natural perspective |
| 2 | Low angle | Contrapicado | low angle shot looking up at the subject, powerful heroic perspective |
| 3 | High angle | Picado | high angle shot looking down at the subject |
| 4 | Bird's-eye / top-down | Cenital | bird's-eye view, top-down overhead shot |
| 5 | Worm's-eye | Nadir | worm's-eye view from the ground looking straight up, dramatic height |
| 6 | Dutch angle | Ángulo holandés | dutch angle, tilted horizon, dynamic tension |
| 7 | Over-the-shoulder | Sobre el hombro | over-the-shoulder shot, blurred shoulder in the foreground |
| 8 | Profile / side view | Perfil | side view profile shot |
| 9 | Hip level | Altura de cadera | hip-level shot, camera at waist height |
| 10 | Knee level | Altura de rodilla | knee-level shot, camera low near the knees |
| 11 | Aerial drone | Dron aéreo | aerial drone shot from high above |
| 12 | POV | Punto de vista (POV) | first-person point of view shot |

## B8 · LIGHT / LUZ — Lighting / Luz
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | Soft studio | Estudio suave | soft even studio lighting, large softbox, gentle shadows |
| 2 | Golden hour | Hora dorada | warm golden hour sunlight, soft rim light |
| 3 | Window | Ventana | soft natural window light from the side |
| 4 | Overcast | Nublado | bright overcast daylight, soft shadowless light |

## B11 · BG / FON — Background / Fondo
| # | EN | ES | Prompt text |
|---|---|---|---|
| 1 | White void | Void blanco | seamless pure white background, infinite white studio void, soft contact shadow on the floor |
| 2 | Neutral grey | Gris neutro | seamless light grey studio backdrop |
| 3 | Paris | París | Paris cityscape with the Eiffel Tower in the background, creamy bokeh |
| 4 | Beach | Playa | tropical beach at sunset, palm trees, soft ocean bokeh |
| 5 | Yoga studio | Sala de yoga | bright yoga studio, light wooden floor, large windows, green plants |
| 6 | City street | Calle urbana | sunny city street, modern storefronts, soft background blur |
| 7 | Palace garden | Palacio jardín | sunlit marble palace conservatory, white columns and arches, climbing roses, polished marble floor, scattered softly glowing blue petals |
| 8 | Cloud terrace | Terraza en las nubes | ivy-covered stone arcade on a palace terrace above the clouds, bright sky |

## B0 · NEG — Negative prompt
```
cartoon, anime, 3d render, plastic skin, airbrushed, deformed hands, extra fingers, distorted anatomy, blurry, watermark, text, logo, cropped feet, teenager, childlike features
```

## Combination notes / Notas de combinación
Shown as notes, grouped by kind; the tool never changes your choices. / Se muestran como notas por tipo; la herramienta nunca cambia tu elección.

**Incompatible**
- Cap and straw hat together: pick one headwear.
- This outfit already includes headwear (tricorn, cowboy hat, bowler hat or feathered headpiece); a cap or straw hat will clash.
- ANGLE 8 (profile) vs. this framing, which asks for a three-quarter turn or looking at the camera.

**Out of frame / Fuera de encuadre**
- Half-body and portrait framings crop the lower body: shorts, footwear and leg details from OUTFIT or BODY won't show.

**Needs testing / Requiere pruebas**
- Top-down or worm's-eye with a head-and-shoulders portrait can give unusual crops. Test with a fixed seed.
- An aerial drone shot over a studio backdrop is unusual; models may add a landscape. Test it.
- POV plus 'looking at camera' may read as a selfie. Test it.

