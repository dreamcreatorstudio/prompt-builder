# Single source of truth for Prompt Builder: blocks, options (EN/ES labels), prompt text.
BLOCKS = [
 dict(id="B1", key=("PHOTO","FOTO"), name=("Photo engine","Motor fotográfico"), hue="--h1", opts=[
  ("Realistic DSLR","Realista DSLR","RAW photo, photorealistic, real photograph, Canon EOS R5, 85mm lens, f/2.0, shallow depth of field, natural film grain, sharp focus, 8k uhd"),
  ("Fashion editorial","Editorial de moda","high-end fashion editorial photograph, medium format camera, 80mm lens, f/4, crisp detail, magazine quality, photorealistic"),
  ("Studio catalog","Catálogo de estudio","clean commercial catalog photograph, 50mm lens, f/8, everything in sharp focus, even exposure, photorealistic")]),
 dict(id="B2", key=("GLOW","BRI"), name=("Skin glow","Brillo de piel"), hue="--h2", opts=[
  ("Natural matte","Natural mate","natural matte skin finish, soft diffuse highlights"),
  ("Healthy glow","Glow saludable","healthy dewy skin glow, subtle natural sheen on cheekbones and shoulders"),
  ("Post-workout","Post-entreno","light post-workout glow, faint natural sheen of perspiration")]),
 dict(id="B3", key=("AGE","EDAD"), name=("Model age","Edad de la modelo"), hue="--h3", opts=[
  ("25","25 años","a 25-year-old woman, adult facial features"),
  ("30","30 años","a 30-year-old woman, adult facial features"),
  ("35","35 años","a 35-year-old woman, mature adult features"),
  ("40","40 años","a 40-year-old woman, mature adult features"),
  ("45","45 años","a 45-year-old woman, graceful mature features"),
  ("50","50 años","a 50-year-old woman, graceful mature features, subtle laugh lines")]),
 dict(id="B3.5", key=("ETHN","ETN"), name=("Heritage","Origen"), hue="--h3", zero=True, opts=[
  ("Unspecified","Sin especificar",""),
  ("Slavic","Eslava","Slavic heritage"),
  ("Nordic","Nórdica","Nordic Scandinavian heritage"),
  ("Russian","Rusa","Russian heritage"),
  ("Latina","Latina","Latina heritage"),
  ("Mediterranean","Mediterránea","Mediterranean heritage"),
  ("Celtic","Celta","Celtic Irish heritage"),
  ("Afro-Caribbean","Afrocaribeña","Afro-Caribbean heritage"),
  ("African","Africana","African heritage"),
  ("Middle Eastern","Medio Oriente","Middle Eastern heritage"),
  ("South Asian","Sur de Asia","South Asian heritage"),
  ("East Asian","Asia oriental","East Asian heritage"),
  ("Southeast Asian","Sudeste asiático","Southeast Asian heritage"),
  ("Mixed","Mixta","mixed heritage")]),
 dict(id="B3.3", key=("EXPR","EXP"), name=("Expression","Expresión"), hue="--h3", opts=[
  ("Confident","Segura","confident relaxed expression, soft natural smile"),
  ("Cheerful","Alegre","bright friendly smile"),
  ("Elegant","Elegante","calm self-assured gaze"),
  ("Serene","Serena","serene warm expression"),
  ("Playful","Divertida","playful laughing expression")]),
 dict(id="B3.1", key=("HAIR","CAB"), name=("Hair color","Color de cabello"), hue="--h3", opts=[
  ("Honey blonde","Rubia miel","honey-blonde hair"),
  ("Platinum blonde","Rubia platino","platinum blonde hair"),
  ("Redhead","Pelirroja","copper-red hair"),
  ("Auburn","Caoba","auburn hair"),
  ("Chestnut","Castaño","chestnut-brown hair"),
  ("Ash brown","Castaño ceniza","ash-brown hair"),
  ("Black","Negro","jet-black hair"),
  ("Silver grey","Gris plata","silver-grey hair")]),
 dict(id="B3.4", key=("STYLE","PEI"), name=("Hairstyle","Peinado"), hue="--h3", opts=[
  ("Sleek straight","Liso perfecto","sleek straight hair"),
  ("Straight","Liso natural","straight hair"),
  ("Subtle waves","Ondas sutiles","subtle natural waves"),
  ("Wavy","Ondulado","wavy hair"),
  ("Beach waves","Ondas de playa","loose beach waves"),
  ("Curly","Rizado","curly hair"),
  ("Coily / afro","Muy rizado / afro","coily hair, afro hair"),
  ("High ponytail","Coleta alta","high ponytail"),
  ("Neat bun","Moño pulido","neat hair bun"),
  ("Messy bun","Moño suelto","loose messy bun with face-framing strands"),
  ("Pixie cut","Corte pixie","pixie cut"),
  ("Short bob","Bob corto","short bob cut")]),
 dict(id="B3.2", key=("EYES","OJO"), name=("Eyes","Ojos"), hue="--h3", opts=[
  ("Blue","Azules","clear blue eyes"),("Green","Verdes","green eyes"),("Brown","Marrones","warm brown eyes"),("Hazel","Avellana","hazel eyes"),("Grey","Grises","grey eyes")]),
 dict(id="B4", key=("SKIN","PIEL"), name=("Skin tone","Piel y tono"), hue="--h4", opts=[
  ("Porcelain","Porcelana","fair porcelain skin with warm pink undertones, natural skin texture, visible pores"),
  ("Fair, freckles","Clara con pecas","fair skin with light freckles across the nose and cheeks, natural skin texture"),
  ("Olive","Oliva","olive skin tone with golden undertones, natural skin texture"),
  ("Tan","Morena","warm tan brown skin, natural skin texture, subtle color variation"),
  ("Deep","Oscura","deep brown skin with rich undertones, natural skin texture")]),
 dict(id="B5", key=("BODY","CUE"), name=("Body","Cuerpo"), hue="--h5", opts=[
  ("Athletic fit","Fitness atlética","fit athletic adult build, toned shoulders and arms, defined core, strong toned legs"),
  ("Lean pilates","Pilates esbelta","lean slender adult physique with long toned muscles, graceful upright posture"),
  ("Runner","Corredora","lean runner's build, defined legs, athletic adult proportions"),
  ("Natural","Natural","healthy natural adult body, soft curves, relaxed posture")]),
 dict(id="B6", key=("OUTFIT","VES"), name=("Outfit","Vestuario"), hue="--h6", opts=[
  ("Denim + white crop","Denim + crop blanco","white ribbed cotton crop top, high-waisted light-wash denim shorts, white canvas sneakers"),
  ("Black athletic","Deportivo negro","black sports crop top, matching high-waisted biker shorts, running shoes"),
  ("Summer linen","Lino verano","cream linen button-up crop top, high-waisted linen shorts, leather sandals"),
  ("Pastel knit","Punto pastel","sage green knit crop cardigan, high-waisted white tailored shorts, minimalist sandals"),
  ("Yoga set","Yoga set","dusty rose yoga set, fitted long-sleeve crop top and full-length leggings, barefoot"),
  ("Galactic heroine","Heroína galáctica","original superhero costume, full-coverage silver and teal bodysuit with geometric armor plates, short flowing cape, star emblem on the chest, knee-high boots"),
  ("Storm captain","Capitana tormenta","original superhero costume, full-coverage navy bodysuit with gold lightning-bolt piping, high collar, fingerless gloves, utility belt, armored boots"),
  ("Legend warrior","Guerrera de leyenda","original fantasy warrior costume, bronze breastplate over a long crimson tunic, leather bracers, ornate belt, sandal boots, round shield on her back"),
  ("Pirate","Pirata","pirate captain costume, white billowy blouse, burgundy brocade vest, tricorn hat, wide leather belt, tall boots, fitted dark trousers"),
  ("Astronaut","Astronauta","modern white astronaut suit with orange accents, mission patches, helmet held under one arm"),
  ("Samurai","Samurái","samurai-inspired costume, dark lacquered armor pieces over an indigo hakama and kimono, red cord details"),
  ("Flamenco","Flamenca","traditional red flamenco dress with white polka dots, ruffled sleeves and tiers, flower in the hair, shawl with fringe"),
  ("Cowgirl","Vaquera","western cowgirl outfit, suede fringe jacket, plaid shirt, high-waisted jeans, cowboy hat and boots"),
  ("Steampunk","Steampunk","steampunk explorer outfit, brown leather corset vest over a cream blouse, brass goggles on the hat, long skirt with buckles, gloves"),
  ("Forest elf","Elfa del bosque","original forest elf costume, long moss-green layered dress with leaf embroidery, hooded cape, elegant pointed ears, wooden bow"),
  ("Race driver","Piloto de carreras","racing driver suit, red and white fireproof jumpsuit with sponsor-free patches, helmet held at the hip"),
  ("Dominican carnival","Carnaval dominicano","Dominican carnival Diablo Cojuelo costume, vibrant full-coverage satin suit covered in mirrors, bells and ribbons, ornate horned mask held in her hand"),
  ("Brazil baiana","Baiana de Brasil","traditional Bahian samba-school baiana costume, wide hoop skirt with lace layers, embroidered blouse, colorful head wrap, bead necklaces"),
  ("Barranquilla cumbia","Cumbia de Barranquilla","Barranquilla carnival cumbia dancer outfit, long red, yellow and blue pollera skirt with ruffles, off-shoulder ruffled blouse, flower crown"),
  ("Oruro morenada","Morenada de Oruro","Oruro carnival morenada dancer costume, embroidered layered pollera skirt, sequined shawl, bowler hat"),
  ("Puno Candelaria","Candelaria de Puno","Candelaria festival dancer outfit from Puno, multiple bright layered polleras, embroidered jacket, bowler hat, woven shawl"),
  ("Venice carnival","Carnaval de Venecia","Venetian carnival gown, brocade bodice with long full skirt, ornate Colombina half-mask, feathered headpiece")]),
 dict(id="B6.1", key=("ACC","ACC"), name=("Accessories","Accesorios"), hue="--h6", zero=True, multi=True, opts=[
  ("None","Ninguno",""),("Emerald necklace","Collar esmeralda","emerald pendant necklace on a fine gold chain"),("Gold hoops","Aros dorados","small gold hoop earrings"),("Sports watch","Reloj deportivo","minimalist sports watch"),("Cap","Gorra","beige baseball cap"),
  ("Sunglasses","Gafas de sol","oversized tortoiseshell sunglasses"),
  ("Straw hat","Sombrero de paja","wide-brim straw hat"),
  ("Silk scarf","Pañuelo de seda","patterned silk scarf"),
  ("Pearl earrings","Aretes de perla","small pearl stud earrings"),
  ("Gold bracelets","Pulseras doradas","stack of thin gold bracelets"),
  ("Tote bag","Bolso tote","canvas tote bag on the shoulder"),
  ("Yoga mat","Esterilla de yoga","rolled yoga mat under one arm")]),
 dict(id="B7", key=("CAM","CAM"), name=("Framing & pose","Encuadre y pose"), hue="--h7", opts=[
  ("Full body 3/4","Cuerpo entero 3/4","full body shot, head to toe framing, standing relaxed, three-quarter turn, looking at camera"),
  ("Half body","Medio cuerpo","medium shot from the waist up, looking at camera"),
  ("Portrait","Retrato","close-up portrait, head and shoulders"),
  ("Walking","Caminando","full body shot, walking toward camera, natural mid-stride motion"),
  ("Seated","Sentada","full body shot, sitting casually on a low wooden stool, relaxed posture")]),
 dict(id="B7.1", key=("ANGLE","ANG"), name=("Camera angle","Ángulo de cámara"), hue="--h7", opts=[
  ("Eye-level","A la altura de los ojos","eye-level shot, neutral natural perspective"),
  ("Low angle","Contrapicado","low angle shot looking up at the subject, powerful heroic perspective"),
  ("High angle","Picado","high angle shot looking down at the subject"),
  ("Bird's-eye / top-down","Cenital","bird's-eye view, top-down overhead shot"),
  ("Worm's-eye","Nadir","worm's-eye view from the ground looking straight up, dramatic height"),
  ("Dutch angle","Ángulo holandés","dutch angle, tilted horizon, dynamic tension"),
  ("Over-the-shoulder","Sobre el hombro","over-the-shoulder shot, blurred shoulder in the foreground"),
  ("Profile / side view","Perfil","side view profile shot"),
  ("Hip level","Altura de cadera","hip-level shot, camera at waist height"),
  ("Knee level","Altura de rodilla","knee-level shot, camera low near the knees"),
  ("Aerial drone","Dron aéreo","aerial drone shot from high above"),
  ("POV","Punto de vista (POV)","first-person point of view shot")]),
 dict(id="B8", key=("LIGHT","LUZ"), name=("Lighting","Luz"), hue="--h8", opts=[
  ("Soft studio","Estudio suave","soft even studio lighting, large softbox, gentle shadows"),
  ("Golden hour","Hora dorada","warm golden hour sunlight, soft rim light"),
  ("Window","Ventana","soft natural window light from the side"),
  ("Overcast","Nublado","bright overcast daylight, soft shadowless light")]),
 dict(id="B11", key=("BG","FON"), name=("Background","Fondo"), hue="--h4", opts=[
  ("White void","Void blanco","seamless pure white background, infinite white studio void, soft contact shadow on the floor"),
  ("Neutral grey","Gris neutro","seamless light grey studio backdrop"),
  ("Paris","París","Paris cityscape with the Eiffel Tower in the background, creamy bokeh"),
  ("Beach","Playa","tropical beach at sunset, palm trees, soft ocean bokeh"),
  ("Yoga studio","Sala de yoga","bright yoga studio, light wooden floor, large windows, green plants"),
  ("City street","Calle urbana","sunny city street, modern storefronts, soft background blur")]),
]
NEG = "cartoon, anime, 3d render, plastic skin, airbrushed, deformed hands, extra fingers, distorted anatomy, blurry, watermark, text, logo, cropped feet, teenager, childlike features"
DEFAULT = {"B1":0,"B2":0,"B3":0,"B3.5":1,"B3.3":1,"B3.1":0,"B3.4":8,"B3.2":1,"B4":2,"B5":1,"B6":21,"B6.1":[],"B7":0,"B7.1":0,"B8":0,"B11":5}  # Venice carnival in the city (chosen by Alex)

# Library version: bump when any prompt text changes, so recipes record which texts they used.
LIB_VERSION = "1.7"   # 1.7: new HERITAGE block (ETHN), Slavic by default; 1.6: accessories allow several (ACC1+3) and 7 new ones; 1.5: new default base; 1.4: outfits 18–22; 1.3: yoga catalog base

PLATFORMS = {  # separator default + transforms applied to the prompt text
    "venice":    {"label": "Venice AI",    "sep": "nl"},
    "seaart":    {"label": "SeaArt",       "sep": "nl", "weights": ["B6", "B11"]},
    "perchance": {"label": "Perchance AI", "sep": "one", "drop": ["8k uhd", "RAW photo", "real photograph", "natural film grain", "magazine quality"]},
    "gen":       {"label": "Generic",      "sep": "nl"},
}
DEFAULT_PLATFORM = "perchance"
# How blocks are joined. Frozen per version together with the platform rules and defaults.
SEPARATORS = {
    "nl":    {"joiner": ",\n"},
    "one":   {"joiner": ", "},
    "tag":   {"joiner": ",\n", "prefix": True},
    "break": {"joiner": ",\nBREAK\n"},
}

# Notes about block combinations. Shown as notes, grouped by kind; the tool never changes the user's choices.
#   incompatible : the two blocks ask for opposite things
#   out_of_frame : details that the chosen framing will not show
#   test         : may work, but depends on the model — try it with a fixed seed
# A rule matches when block a is one of a_opts and (if given) block b is one of b_opts. Indexes are 0-based.
CONFLICTS = [
    dict(kind="incompatible", a="B6.1", a_opts=[4], b="B6.1", b_opts=[6],
         en="Cap and straw hat together: pick one headwear.",
         es="Gorra y sombrero de paja a la vez: elige una sola prenda para la cabeza."),
    dict(kind="incompatible", a="B6.1", a_opts=[4, 6], b="B6", b_opts=[8, 12, 19, 20, 21],
         en="This outfit already includes headwear (tricorn, cowboy hat, bowler hat or feathered headpiece); a cap or straw hat will clash.",
         es="Este vestuario ya incluye algo en la cabeza (tricornio, sombrero vaquero, bombín o tocado de plumas); la gorra o el sombrero de paja chocarán."),
    dict(kind="incompatible", a="B7.1", a_opts=[7], b="B7", b_opts=[0, 1],
         en="ANGLE 8 (profile) vs. this framing, which asks for a three-quarter turn or looking at the camera.",
         es="ÁNGULO 8 (perfil) frente a este encuadre, que pide giro de tres cuartos o mirar a cámara."),
    dict(kind="out_of_frame", a="B7", a_opts=[1, 2],
         en="Half-body and portrait framings crop the lower body: shorts, footwear and leg details from OUTFIT or BODY won't show.",
         es="El medio cuerpo y el retrato recortan la parte baja: el short, el calzado y los detalles de piernas de VESTUARIO o CUERPO no se verán."),
    dict(kind="test", a="B7.1", a_opts=[3, 4], b="B7", b_opts=[2],
         en="Top-down or worm's-eye with a head-and-shoulders portrait can give unusual crops. Test with a fixed seed.",
         es="Cenital o nadir con un retrato de cabeza y hombros puede dar recortes raros. Pruébalo con un seed fijo."),
    dict(kind="test", a="B7.1", a_opts=[10], b="B11", b_opts=[0, 1],
         en="An aerial drone shot over a studio backdrop is unusual; models may add a landscape. Test it.",
         es="Un plano de dron sobre un fondo de estudio es poco común; el modelo puede inventar un paisaje. Pruébalo."),
    dict(kind="test", a="B7.1", a_opts=[11], b="B7", b_opts=[0, 1],
         en="POV plus 'looking at camera' may read as a selfie. Test it.",
         es="POV más 'mirando a cámara' puede salir como selfie. Pruébalo."),
]
