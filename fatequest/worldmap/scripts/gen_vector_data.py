#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fatequest — Medieval European Known-World (Oikoumene) vector data generator.

Produces curated GeoJSON + CSV for the world as known to medieval Europeans:
cities, mountain ranges, rivers, seas, and the T-O tripartite regions.

Coordinates are REAL modern lon/lat (EPSG:4326) so the data aligns with real
coastlines / DEM. Names use the medieval Latin/known forms. This is the
"known world" scope (oikoumene): Europe, the Mediterranean, North Africa,
the Near East, Persia, Arabia and India — the edges of the medieval mappa mundi.

Everything is data-driven and reproducible. No network required.
"""
import json, csv, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA = os.path.join(ROOT, "data")
os.makedirs(DATA, exist_ok=True)

# ---------------------------------------------------------------------------
# Extent of the oikoumene (medieval known world)
# ---------------------------------------------------------------------------

# 2026-07 EAST EXTENSION — see fatequest/docs/ARCHITECTURE.md §4.1
#
# The original bbox stopped at 100E, which put Chandu, Cambaluc, Kinsay and
# Zayton — the last four cities of the GDD §16.4 trunk corridor — outside the
# map entirely. 27 of the 44 city-class places in marco-polo-lore.json are in
# China, so the original extent discarded the thickest half of the corpus.
#
# East  100 -> 122  reaches Zayton (118.6E), the corridor's terminus.
# South   0 -> -8   reaches Java/Sumatra, the maritime line's far end.
#
# The mappa mundi CONCEIT is unchanged: still east-up, still Jerusalem-centred,
# still an encircling Ocean. Medieval maps did draw Serica/Cathay at the far
# east — reaching Zayton is faithful to the genre, not a departure from it.
BBOX = {"west": -20.0, "south": -8.0, "east": 122.0, "north": 66.0}

# ---------------------------------------------------------------------------
# CITIES  (medieval name, modern name, lat, lon, part[Asia/Europa/Africa],
#          tier 1..3 importance, note)
# ---------------------------------------------------------------------------
CITIES = [
    # --- Sacred center + great capitals -----------------------------------
    ("Hierusalem", "Jerusalem", 31.778, 35.235, "Asia", 1, "Umbilicus mundi — the navel of the world, center of the mappa mundi"),
    ("Roma", "Rome", 41.902, 12.496, "Europa", 1, "Seat of the Papacy and the old Empire"),
    ("Constantinopolis", "Istanbul", 41.008, 28.978, "Europa", 1, "New Rome, capital of the Greeks"),
    ("Alexandria", "Alexandria", 31.200, 29.918, "Africa", 1, "Great port of Egypt, seat of a Patriarch"),
    ("Antiochia", "Antakya", 36.202, 36.161, "Asia", 1, "Chief city of Syria, crusader principality"),
    ("Babylonia (Cairus)", "Cairo", 30.044, 31.236, "Africa", 1, "'Babylon of Egypt', seat of the Sultan"),
    ("Baldacum", "Baghdad", 33.315, 44.366, "Asia", 1, "Baghdad, seat of the Caliph of the East"),
    ("Damascus", "Damascus", 33.513, 36.292, "Asia", 1, "Great city of Syria"),
    ("Mecha", "Mecca", 21.423, 39.826, "Asia", 2, "Holy city of the Saracens"),
    ("Medina", "Medina", 24.470, 39.611, "Asia", 3, "City of the Prophet"),
    # --- Latin West -------------------------------------------------------
    ("Parisius", "Paris", 48.857, 2.352, "Europa", 1, "Capital of the Franks, great university"),
    ("Londinium", "London", 51.507, -0.128, "Europa", 1, "Chief city of the English"),
    ("Colonia", "Cologne", 50.938, 6.960, "Europa", 2, "Holy city of the Rhine, relics of the Magi"),
    ("Aquisgranum", "Aachen", 50.776, 6.084, "Europa", 2, "Charlemagne's imperial seat"),
    ("Venetia", "Venice", 45.438, 12.336, "Europa", 1, "Queen of the Adriatic, gate to the East"),
    ("Ianua", "Genoa", 44.406, 8.933, "Europa", 2, "Maritime republic, Levant trade"),
    ("Florentia", "Florence", 43.769, 11.256, "Europa", 2, "Banking city of Tuscany"),
    ("Mediolanum", "Milan", 45.464, 9.190, "Europa", 2, "Great city of Lombardy"),
    ("Neapolis", "Naples", 40.851, 14.268, "Europa", 2, "Capital of the southern kingdom"),
    ("Ravenna", "Ravenna", 44.418, 12.203, "Europa", 3, "Old exarchate capital"),
    ("Pisa", "Pisa", 43.716, 10.401, "Europa", 3, "Maritime republic of Tuscany"),
    ("Bononia", "Bologna", 44.494, 11.343, "Europa", 3, "Oldest university"),
    ("Panormus", "Palermo", 38.116, 13.361, "Europa", 2, "Capital of Sicily"),
    ("Salernum", "Salerno", 40.681, 14.759, "Europa", 3, "Famed medical school"),
    ("Corduba", "Cordoba", 37.888, -4.779, "Europa", 2, "Great city of al-Andalus"),
    ("Toletum", "Toledo", 39.858, -4.024, "Europa", 2, "City of translators"),
    ("Hispalis", "Seville", 37.389, -5.994, "Europa", 3, "Andalusian port"),
    ("Granata", "Granada", 37.177, -3.598, "Europa", 3, "Last Moorish emirate"),
    ("Compostella", "Santiago de Compostela", 42.881, -8.545, "Europa", 2, "Pilgrimage to St James"),
    ("Olisipo", "Lisbon", 38.722, -9.139, "Europa", 3, "Atlantic port of Portugal"),
    ("Caesaraugusta", "Zaragoza", 41.649, -0.887, "Europa", 3, "City of the Ebro"),
    ("Barcino", "Barcelona", 41.385, 2.173, "Europa", 3, "Catalan sea-port"),
    ("Massilia", "Marseille", 43.296, 5.370, "Europa", 3, "Ancient Greek port of Gaul"),
    ("Tolosa", "Toulouse", 43.605, 1.444, "Europa", 3, "City of the Garonne"),
    ("Avinio", "Avignon", 43.949, 4.806, "Europa", 2, "Second seat of the Popes"),
    ("Remi", "Reims", 49.258, 4.032, "Europa", 3, "Coronation city of French kings"),
    ("Rothomagus", "Rouen", 49.443, 1.099, "Europa", 3, "Capital of Normandy"),
    ("Brugae", "Bruges", 51.209, 3.224, "Europa", 2, "Cloth and banking of Flanders"),
    ("Gandavum", "Ghent", 51.054, 3.717, "Europa", 3, "Flemish cloth town"),
    ("Argentoratum", "Strasbourg", 48.573, 7.752, "Europa", 3, "Free city of the Rhine"),
    ("Moguntia", "Mainz", 49.993, 8.247, "Europa", 3, "Archbishopric of the Rhine"),
    ("Treveris", "Trier", 49.759, 6.644, "Europa", 3, "Oldest city of Germany"),
    ("Ratisbona", "Regensburg", 49.019, 12.098, "Europa", 3, "Danube trade city"),
    ("Norimberga", "Nuremberg", 49.454, 11.077, "Europa", 3, "Imperial free city"),
    ("Lubeca", "Lübeck", 53.866, 10.687, "Europa", 2, "Queen of the Hanseatic League"),
    ("Hammaburg", "Hamburg", 53.551, 9.993, "Europa", 3, "Hanseatic Elbe port"),
    ("Vindobona", "Vienna", 48.208, 16.373, "Europa", 2, "Danube seat of the dukes"),
    ("Praga", "Prague", 50.076, 14.438, "Europa", 2, "Capital of Bohemia"),
    ("Cracovia", "Kraków", 50.062, 19.937, "Europa", 2, "Capital of Poland"),
    ("Kiovia", "Kyiv", 50.451, 30.523, "Europa", 2, "Mother of the Rus' cities"),
    ("Novogardia", "Novgorod", 58.521, 31.271, "Europa", 3, "Northern Rus' republic"),
    ("Moscovia", "Moscow", 55.751, 37.618, "Europa", 3, "Rising Rus' principality"),
    ("Cantuaria", "Canterbury", 51.279, 1.083, "Europa", 3, "Seat of the English Church"),
    ("Eboracum", "York", 53.960, -1.081, "Europa", 3, "Northern English see"),
    ("Dublinia", "Dublin", 53.350, -6.260, "Europa", 3, "Norse-Irish port"),
    ("Edinburgum", "Edinburgh", 55.953, -3.188, "Europa", 3, "Seat of the Scots"),
    # --- Greek / Byzantine world -----------------------------------------
    ("Thessalonica", "Thessaloniki", 40.640, 22.944, "Europa", 2, "Second city of the Greeks"),
    ("Athenae", "Athens", 37.984, 23.728, "Europa", 3, "Ancient seat of philosophy"),
    ("Nicaea", "İznik", 40.428, 29.719, "Asia", 3, "City of the great Councils"),
    ("Smyrna", "İzmir", 38.419, 27.129, "Asia", 3, "Aegean port"),
    ("Ephesus", "Selçuk", 37.941, 27.341, "Asia", 3, "City of the Seven Sleepers"),
    ("Trapezus", "Trabzon", 41.005, 39.723, "Asia", 2, "Empire on the Black Sea"),
    ("Caffa", "Feodosia", 45.031, 35.382, "Europa", 3, "Genoese colony of Crimea"),
    # Disambiguated 2026-07: "Tana" was two different real places — the Venetian
    # Black Sea colony at the Tanais mouth, and Polo's Tana (Thane, in India).
    # Both are authentic medieval names, but ids must be unique and Polo's is the
    # one the lore references, so the Venetian one carries the qualifier.
    ("Tana (Azov)", "Azov", 47.112, 39.423, "Europa", 3, "Mouth of the Tanais, Silk Road terminus; the Venetian La Tana"),
    # --- Levant / Holy Land / crusader states -----------------------------
    ("Accon", "Acre", 32.928, 35.082, "Asia", 2, "Chief crusader port"),
    ("Tyrus", "Tyre", 33.271, 35.194, "Asia", 3, "Phoenician sea-city"),
    ("Tripolis", "Tripoli (Lebanon)", 34.436, 35.844, "Asia", 3, "Crusader county"),
    ("Berrhoea", "Aleppo", 36.202, 37.134, "Asia", 2, "Great Syrian trade city"),
    ("Edessa", "Şanlıurfa", 37.158, 38.791, "Asia", 3, "First crusader county"),
    ("Bethleem", "Bethlehem", 31.705, 35.203, "Asia", 3, "Birthplace of Christ"),
    ("Petra", "Petra", 30.329, 35.444, "Asia", 3, "Rock city of Arabia"),
    ("Tarsus", "Tarsus", 36.917, 34.895, "Asia", 3, "Birthplace of St Paul"),
    # --- Mesopotamia / Persia / the East ---------------------------------
    ("Ninive", "Mosul", 36.360, 43.152, "Asia", 3, "Ancient Nineveh of the Assyrians"),
    ("Ctesiphon", "Ctesiphon", 33.093, 44.581, "Asia", 3, "Old Persian capital"),
    ("Basora", "Basra", 30.508, 47.784, "Asia", 3, "Gulf port of Mesopotamia"),
    ("Tauris", "Tabriz", 38.080, 46.293, "Asia", 2, "Great city of the Mongol Ilkhans"),
    ("Ispahan", "Isfahan", 32.654, 51.668, "Asia", 3, "City of central Persia"),
    ("Ormus", "Hormuz", 27.100, 56.461, "Asia", 2, "Spice-emporium of the Gulf"),
    ("Merva", "Merv", 37.660, 62.192, "Asia", 3, "Silk Road oasis of Khorasan"),
    ("Bochara", "Bukhara", 39.767, 64.421, "Asia", 3, "Learned city of Transoxiana"),
    ("Samarcanda", "Samarkand", 39.654, 66.960, "Asia", 2, "Capital of Tamerlane"),
    ("Cabul", "Kabul", 34.528, 69.172, "Asia", 3, "Gate to India"),
    ("Delli", "Delhi", 28.651, 77.231, "Asia", 2, "Sultanate of India"),
    ("Aden", "Aden", 12.788, 45.030, "Asia", 3, "Arabian gate of the Indian Ocean"),
    # --- Africa (Libya) ---------------------------------------------------
    ("Carthago", "Carthage/Tunis", 36.853, 10.323, "Africa", 2, "Old rival of Rome, now Tunis"),
    ("Cairoan", "Kairouan", 35.681, 10.100, "Africa", 3, "Holy city of the Maghreb"),
    ("Tripolis Barbariae", "Tripoli (Libya)", 32.887, 13.191, "Africa", 3, "Barbary coast port"),
    ("Fessa", "Fès", 34.033, -5.000, "Africa", 2, "Learned capital of Morocco"),
    ("Marrochium", "Marrakesh", 31.630, -7.981, "Africa", 3, "Almohad capital"),
    ("Ceuta", "Ceuta", 35.889, -5.320, "Africa", 3, "Strait fortress"),
    ("Tingis", "Tangier", 35.783, -5.813, "Africa", 3, "Pillar of Hercules, African side"),
    ("Tombuctu", "Timbuktu", 16.775, -3.009, "Africa", 3, "Gold city beyond the sand-sea"),
    ("Dongola", "Dongola", 19.170, 30.482, "Africa", 3, "Christian Nubian kingdom"),
    ("Axuma", "Axum", 14.130, 38.719, "Africa", 3, "Realm of Prester John (Ethiopia)"),
    # --- Iberia / Atlantic extra -----------------------------------------
    ("Salmantica", "Salamanca", 40.965, -5.664, "Europa", 3, "University of Castile"),
    ("Conimbriga", "Coimbra", 40.211, -8.429, "Europa", 3, "Portuguese see"),

    # =====================================================================
    # EAST EXTENSION (2026-07) — the Polo corridor
    #
    # Medieval names here are Marco Polo's own forms as they reached Europe
    # in the Yule-Cordier translation. That is not a stylistic choice: these
    # ARE the names by which medieval Christendom knew these places, so they
    # belong in the name_medieval column exactly like Baldacum or Hierusalem.
    # Each entry is backed by a chapter in marco-polo-lore.json.
    # tier 1 = GDD 16.4 trunk metropolis, 2 = chaptered city, 3 = lesser node
    # =====================================================================

    # --- Persia & the descent to the Ocean --------------------------------
    ("Yasdi", "Yazd", 31.898, 54.368, "Asia", 2, "City of silk-weaving on the desert road"),
    ("Kerman", "Kerman", 30.284, 57.078, "Asia", 2, "Kingdom of turquoise and fine steel"),
    ("Camadi", "Jiroft (ruins)", 28.675, 57.740, "Asia", 3, "A city laid in ruins by the Carauna robbers"),
    ("Cobinan", "Kuhbanan", 31.409, 56.279, "Asia", 3, "Where mirrors of steel and tutty are made"),

    # --- Khorasan & the Hindu Kush ----------------------------------------
    ("Sapurgan", "Shibarghan", 36.665, 65.752, "Asia", 3, "Land of the best melons in the world"),
    ("Balc", "Balkh", 36.758, 66.897, "Asia", 1, "Noble and great city, once greater still"),
    ("Taican", "Taloqan", 36.736, 69.535, "Asia", 3, "Market town below the mountains of salt"),
    ("Badashan", "Badakhshan (Faizabad)", 37.112, 70.579, "Asia", 2, "Whence come the balas rubies and the lapis"),
    ("Keshimur", "Srinagar", 34.084, 74.797, "Asia", 2, "Province of enchanters who darken the day"),

    # --- The Silk Road: Kashgaria & the Taklamakan ------------------------
    ("Cascar", "Kashgar", 39.467, 75.994, "Asia", 1, "Where the roads of the north and south divide"),
    ("Yarcan", "Yarkand", 38.417, 77.243, "Asia", 3, "Province of five days' journey"),
    ("Cotan", "Khotan", 37.110, 79.927, "Asia", 1, "Province of jade, cotton and vineyards"),
    ("Pein", "Keriya", 36.860, 81.670, "Asia", 3, "Where the rivers yield chalcedony and jasper"),
    ("Charchan", "Qiemo", 38.150, 85.533, "Asia", 3, "Last town before the Great Desert"),
    ("Lop", "Charkhlik (Ruoqiang)", 39.017, 88.167, "Asia", 1, "The town at the edge of the Desert of Lop"),
    ("Sachiu", "Dunhuang", 40.142, 94.662, "Asia", 2, "City of Tangut where the dead are burned"),
    ("Camul", "Hami", 42.827, 93.515, "Asia", 3, "Province of music, sport and famous hospitality"),

    # --- Tangut, the steppe and the Kaan's summer country ------------------
    ("Campichu", "Zhangye", 38.933, 100.450, "Asia", 2, "Chief city of Tangut, full of idol-monasteries"),
    ("Etzina", "Khara-Khoto (ruins)", 41.767, 101.067, "Asia", 3, "Last provisioning before forty days of desert"),
    ("Caracoron", "Karakorum (ruins)", 47.198, 102.832, "Asia", 2, "First seat of the Tartar Kaans"),
    ("Egrigaia", "Yinchuan", 38.487, 106.232, "Asia", 3, "Where the finest camlets of camel-hair are made"),
    ("Tenduc", "Tokto / Hohhot", 40.274, 111.194, "Asia", 3, "Province said to be the land of Prester John"),
    ("Chandu", "Shangdu (Xanadu, ruins)", 42.359, 116.183, "Asia", 1, "The Kaan's summer palace of marble and cane"),

    # --- Cathay: the Kaan's realm -----------------------------------------
    ("Cambaluc", "Beijing", 39.904, 116.407, "Asia", 1, "The Great Kaan's capital; seat of the paper money"),
    ("Kenjanfu", "Xi'an", 34.341, 108.940, "Asia", 2, "Great and noble city, seat of a king's son"),
    ("Sindafu", "Chengdu", 30.659, 104.065, "Asia", 2, "City divided by a river of bridges"),
    ("Saianfu", "Xiangyang", 32.009, 112.122, "Asia", 2, "Held out three years until the mangonels came"),
    ("Coiganju", "Huai'an", 33.502, 119.150, "Asia", 3, "Entry to Manzi, great store of salt"),
    ("Nanghin", "Nanjing", 32.060, 118.797, "Asia", 2, "Noble province of great wealth"),
    ("Sinjumatu", "Jining", 35.415, 116.587, "Asia", 3, "River-city of vast shipping"),

    # --- Manzi: the southern kingdom --------------------------------------
    ("Kinsay", "Hangzhou", 30.274, 120.155, "Asia", 1, "The City of Heaven; greatest city in the world"),
    ("Suju", "Suzhou", 31.299, 120.585, "Asia", 2, "City of ginger and six thousand stone bridges"),
    ("Fuju", "Fuzhou", 26.075, 119.297, "Asia", 2, "Great river-city of the sugar trade"),
    ("Zayton", "Quanzhou", 24.874, 118.593, "Asia", 1, "Haven of all the ships of India; the world's great port"),

    # --- The Grand Canal corridor -----------------------------------------
    # Polo lists these in an unbroken sequence between Cambaluc and Kinsay.
    # They are the densest stretch of city chapters in the whole book, so the
    # trunk corridor is thin without them.
    ("Cachanfu", "Puzhou (Yongji)", 34.865, 110.338, "Asia", 3, "City on the Caramoran, of silk and gold cloth"),
    ("Cacanfu", "Hejian", 38.446, 116.089, "Asia", 3, "Noble city of trade and handicraft"),
    ("Chinangli", "Cangzhou", 38.304, 116.857, "Asia", 3, "City on a great river, much shipping"),
    ("Linju", "Lingxian", 37.333, 116.573, "Asia", 3, "City of the river country"),
    ("Siju", "Pizhou", 34.311, 117.954, "Asia", 3, "City of great game and hunting"),
    ("Coigangiu", "Huaiyin", 33.583, 119.028, "Asia", 3, "Salt city at the river mouth"),
    ("Paukin", "Baoying", 33.234, 119.311, "Asia", 3, "City of silk and of the canal"),
    ("Tiju", "Gaoyou", 32.785, 119.443, "Asia", 3, "Canal city of fish and fowl"),
    ("Caiju", "Guazhou", 32.253, 119.400, "Asia", 3, "Where the grain fleet enters the great river"),
    ("Sinju", "Yizheng", 32.272, 119.182, "Asia", 3, "River port of vast shipping"),
    ("Chinghianfu", "Zhenjiang", 32.188, 119.425, "Asia", 3, "City with two Nestorian churches"),
    ("Chinginju", "Changzhou", 31.811, 119.974, "Asia", 3, "Where the Alans were slaughtered in their sleep"),
    ("Tanpiju", "Tonglu", 29.808, 119.687, "Asia", 3, "Fair city under the walls of Kinsay"),
    ("Mien", "Bagan (Pagan)", 21.171, 94.860, "Asia", 3, "Kingdom of the gold and silver towers"),

    # --- The Indies and the southern seas ---------------------------------
    ("Chamba", "Champa (Qui Nhon)", 13.776, 109.223, "Asia", 3, "Kingdom of aloeswood and elephants"),
    ("Pentam", "Bintan", 1.083, 104.450, "Asia", 3, "Island on the strait toward Java"),
    ("Java Major", "Java (Jakarta)", -6.200, 106.817, "Asia", 2, "Greatest island in the world; source of the spices"),
    ("Samara", "Sumatra (Banda Aceh)", 5.548, 95.324, "Asia", 3, "Where the pole-star is no longer seen"),
    ("Maabar", "Coromandel (Nagapattinam)", 10.766, 79.843, "Asia", 2, "The finest province in the world; pearl fishery"),
    ("Cail", "Kayalpattinam", 8.568, 78.123, "Asia", 3, "Great port for all ships from the west"),
    ("Coilum", "Kollam (Quilon)", 8.893, 76.600, "Asia", 3, "Whence comes the brazil, ginger and indigo"),
    ("Melibar", "Malabar (Kozhikode)", 11.259, 75.780, "Asia", 2, "Kingdom of pepper and of corsairs"),
    ("Tana", "Thane", 19.197, 72.970, "Asia", 3, "Great kingdom of incense and buckram"),
    ("Cambaet", "Khambhat (Cambay)", 22.313, 72.620, "Asia", 3, "Kingdom of indigo and fine leather"),
    ("Semenat", "Somnath", 20.888, 70.401, "Asia", 3, "Kingdom of great trade, its people idolaters"),

    # --- Arabia Felix: the Ocean's western shore --------------------------
    ("Dufar", "Salalah (Dhofar)", 17.019, 54.089, "Asia", 3, "City whence the white incense is shipped"),
    ("Esher", "Ash-Shihr", 14.761, 49.601, "Asia", 3, "Port of frankincense and of horses for India"),
    ("Calatu", "Qalhat", 22.700, 59.372, "Asia", 3, "City at the mouth of the Gulf, subject to Hormos"),
]

# ---------------------------------------------------------------------------
# MOUNTAIN RANGES  (medieval name, modern name, [ (lon,lat), ... ] spine,
#                   peak_m, trend, note)  — spine drawn W->E or as noted
# ---------------------------------------------------------------------------
MOUNTAINS = [
    ("Alpes", "Alps", [(6.0,45.9),(7.5,45.9),(9.5,46.5),(11.5,47.0),(13.5,47.1),(15.5,47.2)], 4808, "WSW–ENE", "Great snow-wall guarding Italy"),
    ("Pyrenaei Montes", "Pyrenees", [(-1.6,43.3),(0.7,42.7),(2.9,42.4)], 3404, "W–E", "Wall between Gaul and Spain"),
    ("Apenninus", "Apennines", [(9.2,44.3),(11.0,43.4),(13.3,42.6),(15.0,41.5),(16.2,40.0)], 2912, "NW–SE", "Spine of Italy"),
    ("Carpates", "Carpathians", [(18.9,49.3),(20.5,49.2),(22.5,48.3),(24.5,47.7),(25.5,46.5),(24.6,45.4)], 2655, "arc", "Bow of the Danube lands"),
    ("Caucasus", "Caucasus", [(40.0,43.5),(42.5,43.3),(45.0,42.8),(47.5,41.5)], 5642, "WNW–ESE", "Barrier of Gog and Magog, gate of Derbent"),
    ("Taurus", "Taurus", [(29.5,37.0),(32.0,37.2),(34.5,37.3),(37.0,37.6)], 3756, "W–E", "Southern wall of Anatolia"),
    ("Atlas", "Atlas", [(-8.0,31.2),(-5.5,32.0),(-2.5,33.2),(0.5,34.5),(4.0,35.5)], 4167, "SW–NE", "Mountains of Mauretania"),
    ("Haemus", "Balkan (Stara Planina)", [(22.9,42.8),(25.0,42.8),(27.0,42.8)], 2376, "W–E", "Range of Thrace"),
    ("Rhodope", "Rhodope", [(24.0,41.6),(25.5,41.5)], 2191, "W–E", "Border of Thrace and Macedon"),
    ("Montes Cantabri", "Cantabrian Mts", [(-6.5,43.1),(-4.0,43.1),(-3.7,43.0)], 2650, "W–E", "North wall of Spain"),
    ("Mons Ararat", "Mt Ararat", [(43.9,39.6),(44.3,39.7)], 5137, "peak", "Where Noah's Ark came to rest"),
    ("Mons Aetna", "Mt Etna", [(15.0,37.75)], 3357, "peak", "Fire-mountain of Sicily"),
    ("Vesuvius", "Mt Vesuvius", [(14.43,40.82)], 1281, "peak", "Burning mountain over Naples"),
    ("Libanus", "Mount Lebanon", [(35.7,33.4),(36.0,34.0),(36.3,34.5)], 3088, "N–S", "Cedar range of the Holy Land"),
    ("Mons Sinai", "Sinai massif", [(33.97,28.54)], 2629, "peak", "Mountain of the Law"),
    ("Zagros", "Zagros", [(46.0,35.0),(48.5,33.0),(51.0,31.0),(53.5,29.5)], 4409, "NW–SE", "Wall of Persia"),
    ("Montes Elburz", "Alborz (Damavand)", [(50.0,36.2),(52.1,35.95),(54.0,36.4)], 5610, "W–E", "Range south of the Caspian"),
    ("Caucasus Indicus", "Hindu Kush", [(66.0,35.0),(69.0,35.5),(71.5,36.2)], 7708, "SW–NE", "The Indian Caucasus of Alexander"),
    ("Imaus", "Himalaya (western edge)", [(74.0,35.5),(77.0,34.0),(80.0,30.5)], 8000, "NW–SE", "Great range dividing the two Scythias"),
    ("Montes Riphaei", "Ural (mythic north)", [(60.0,66.0),(59.5,62.0),(59.0,58.0)], 1895, "N–S", "Mythical northern mountains, source of Boreas"),
    ("Montes Lunae", "Mountains of the Moon", [(29.5,1.0),(30.0,0.6),(30.2,0.3)], 5109, "N–S", "Fabled source of the Nile, at the far south of the known world"),
    # --- East extension (2026-07) ----------------------------------------
    ("Pamier", "Pamir", [(71.5,38.5),(73.5,38.3),(75.0,38.6)], 7495, "W–E", "The highest place in the world; twelve days without habitation, where fire burns pale"),
    ("Belor", "Bolor / Karakoram", [(75.0,36.3),(76.5,35.9),(78.0,35.4)], 8611, "NW–SE", "Wild highland north of Keshimur"),
    ("Montes Thian", "Tian Shan", [(78.0,42.4),(82.0,42.9),(86.0,43.3),(88.5,43.2)], 7439, "W–E", "Snow range dividing the two Turkestans"),
    ("Cuenlun", "Kunlun", [(80.0,36.1),(84.0,36.3),(88.0,36.0),(91.0,35.5)], 7167, "W–E", "South wall of the Desert of Lop"),
    ("Mons Altay", "Altai", [(87.5,49.0),(90.5,49.4),(94.0,49.2)], 4506, "NW–SE", "Where the Kaans of the line of Chinghis are carried for burial"),
]

# ---------------------------------------------------------------------------
# RIVERS  (medieval name, modern name, [ (lon,lat) source->mouth ], note)
# ---------------------------------------------------------------------------
RIVERS = [
    ("Nilus", "Nile", [(31.5,15.6),(32.5,19.6),(31.2,24.1),(31.2,27.2),(31.1,30.0),(31.0,31.4)], "River of Egypt, one of the four rivers of Paradise"),
    ("Danubius", "Danube", [(8.6,48.0),(12.1,48.8),(16.4,48.1),(19.0,47.5),(21.6,46.2),(25.4,45.4),(28.7,45.2)], "Great river dividing the northern nations"),
    ("Rhenus", "Rhine", [(9.5,46.5),(7.6,47.6),(8.2,49.0),(6.96,50.9),(6.1,51.8)], "Border of Gaul and Germany"),
    ("Rhodanus", "Rhône", [(8.1,46.3),(5.9,45.8),(4.8,45.0),(4.7,43.7)], "River of southern Gaul"),
    ("Sequana", "Seine", [(4.7,47.7),(3.0,48.5),(2.35,48.85),(0.7,49.4)], "River of Paris"),
    ("Liger", "Loire", [(4.2,44.9),(2.6,47.0),(-0.5,47.4),(-2.1,47.3)], "Long river of France"),
    ("Garumna", "Garonne", [(0.6,42.8),(1.0,43.9),(-0.6,45.0)], "River of Aquitaine"),
    ("Tiberis", "Tiber", [(12.0,43.7),(12.5,42.4),(12.5,41.9)], "River of Rome"),
    ("Padus", "Po", [(7.7,44.9),(9.7,45.1),(11.6,45.0),(12.3,44.9)], "Great river of Lombardy"),
    ("Tamesis", "Thames", [(-1.7,51.7),(-0.13,51.5),(0.7,51.5)], "River of London"),
    ("Albis", "Elbe", [(15.5,50.8),(13.8,51.5),(11.6,52.4),(9.99,53.55)], "River of the Saxons"),
    ("Tagus", "Tagus", [(-1.7,40.4),(-5.0,39.9),(-8.0,39.5),(-9.14,38.7)], "Golden river of Iberia"),
    ("Iberus", "Ebro", [(-3.8,42.9),(-0.9,41.6),(0.9,40.7)], "River that named Iberia"),
    ("Baetis", "Guadalquivir", [(-3.0,38.0),(-5.0,37.5),(-6.3,36.9)], "River of Andalusia"),
    ("Tanais", "Don", [(39.7,52.0),(41.0,49.5),(40.5,47.5),(39.4,47.1)], "Ancient boundary of Europe and Asia"),
    ("Borysthenes", "Dnieper", [(31.0,54.8),(30.5,50.4),(33.5,48.5),(32.4,46.6)], "Great river of the Rus'"),
    ("Rha", "Volga", [(35.0,57.0),(45.0,52.0),(47.0,48.5),(48.0,46.3)], "Greatest river, flowing to the Caspian"),
    ("Tigris", "Tigris", [(41.0,37.5),(43.1,36.3),(44.4,33.3),(47.4,31.0)], "River of Mesopotamia"),
    ("Euphrates", "Euphrates", [(38.5,39.0),(38.8,36.8),(40.0,35.0),(44.6,32.5),(47.4,31.0)], "Great river of the East, river of Paradise"),
    ("Iordanes", "Jordan", [(35.6,33.2),(35.57,32.7),(35.5,31.8),(35.45,31.5)], "River of baptism"),
    ("Indus", "Indus", [(72.0,34.0),(71.5,31.5),(70.5,28.0),(68.0,25.5),(67.3,24.0)], "Eastern river of India"),
    ("Ganges", "Ganges", [(78.0,30.0),(80.5,27.0),(83.0,25.5),(87.0,25.0),(88.5,23.0)], "Sacred river of the Indies, river of Paradise"),
    ("Oxus", "Amu Darya", [(71.0,37.5),(66.0,37.5),(63.5,40.0),(61.0,43.0)], "River of Transoxiana"),
    # --- East extension (2026-07) ----------------------------------------
    ("Caramoran", "Yellow River (Huang He)", [(96.5,34.5),(101.5,36.0),(103.5,36.1),(107.0,37.5),(110.5,37.8),(110.4,34.9),(114.0,34.8),(116.5,36.2),(118.8,37.8)], "The Black River; Polo's Caramoran, dividing Cathay from Manzi"),
    ("Kian", "Yangtze (Chang Jiang)", [(91.0,33.5),(97.0,31.5),(101.5,29.0),(104.5,29.6),(108.5,30.0),(112.0,30.4),(115.9,29.7),(118.8,32.1),(121.5,31.4)], "Greatest river in the world; more ships than all Christendom"),
    ("Pulisanghin", "Yongding River", [(115.5,40.3),(116.2,39.85),(117.0,39.3)], "Spanned by the great stone bridge west of Cambaluc"),
    ("Brahmaputra", "Brahmaputra", [(82.0,30.5),(88.0,29.4),(92.0,29.0),(95.0,27.8),(90.5,24.0)], "River of the farther Indies"),
]

# ---------------------------------------------------------------------------
# SEAS  (label point + medieval name)
# ---------------------------------------------------------------------------
SEAS = [
    ("Mare Mediterraneum", "Mediterranean Sea", 35.0, 18.0, "Mare Nostrum / Mare Magnum"),
    ("Mare Adriaticum", "Adriatic Sea", 43.0, 15.0, "Gulf of Venice"),
    ("Mare Aegaeum", "Aegean Sea", 38.0, 25.0, "Sea of the Greek isles"),
    ("Mare Tyrrhenum", "Tyrrhenian Sea", 40.0, 12.0, "Sea west of Italy"),
    ("Mare Ionium", "Ionian Sea", 38.0, 18.5, "Between Italy and Greece"),
    ("Pontus Euxinus", "Black Sea", 43.3, 34.0, "The Hospitable Sea"),
    ("Palus Maeotis", "Sea of Azov", 46.2, 37.0, "Marsh at the mouth of the Tanais"),
    ("Mare Caspium", "Caspian Sea", 41.5, 51.0, "Often drawn as a gulf of the Ocean"),
    ("Mare Rubrum", "Red Sea", 20.0, 38.0, "Sea crossed by Moses"),
    ("Sinus Persicus", "Persian Gulf", 27.5, 51.0, "Gulf of Persia"),
    ("Mare Indicum", "Arabian / Indian Sea", 14.0, 63.0, "The eastern Ocean of the Indies"),
    ("Oceanus Atlanticus", "Atlantic Ocean", 40.0, -16.0, "The encircling Western Ocean"),
    ("Mare Germanicum", "North Sea", 56.0, 3.0, "Sea of the Germans"),
    ("Mare Balticum", "Baltic Sea", 58.0, 19.0, "Mare Suevicum"),
    ("Mare Britannicum", "English Channel / Celtic Sea", 49.0, -6.0, "Sea of Britain"),
    ("Oceanus Hyperboreus", "Arctic (frozen) Ocean", 65.5, 40.0, "The frozen Northern Ocean"),
    # --- East extension (2026-07) ----------------------------------------
    ("Oceanus Orientalis", "Eastern Ocean", 30.0, 121.0, "The encircling Ocean at the world's eastern edge"),
    ("Mare Cin", "China Sea", 18.0, 114.0, "Sea of Chin, sailed by the great junks of Manzi"),
    ("Sinus Gangeticus", "Bay of Bengal", 15.0, 88.0, "Gulf between the two Indies"),
    ("Mare Sinicum Meridionale", "Java Sea", -4.0, 111.0, "Sea of the spice islands"),
]

# ---------------------------------------------------------------------------
# REGIONS  (T-O tripartite + named lands: label points)
# ---------------------------------------------------------------------------
REGIONS = [
    ("ASIA", "Asia", 40.0, 62.0, "part", "Half the world; at the top (east) of the mappa mundi, land of Paradise"),
    ("EUROPA", "Europe", 50.0, 15.0, "part", "Lower-left quarter of the tripartite world"),
    ("AFRICA (LIBYA)", "Africa", 22.0, 18.0, "part", "Lower-right quarter, south of the Mediterranean"),
    ("Hispania", "Iberia", 40.0, -4.0, "land", ""),
    ("Gallia", "France", 47.0, 2.5, "land", ""),
    ("Germania", "Germany", 51.0, 10.0, "land", ""),
    ("Italia", "Italy", 43.0, 12.5, "land", ""),
    ("Britannia", "Britain", 53.0, -2.0, "land", ""),
    ("Hibernia", "Ireland", 53.3, -8.0, "land", ""),
    ("Scandia", "Scandinavia", 62.0, 14.0, "land", "Thule, the edge of the north"),
    ("Graecia", "Greece", 39.5, 22.0, "land", ""),
    ("Scythia", "Scythia", 55.0, 55.0, "land", "Land of Gog and Magog"),
    ("Sarmatia", "Sarmatia", 52.0, 35.0, "land", ""),
    ("Terra Sancta", "Holy Land", 31.9, 35.4, "land", ""),
    ("Arabia", "Arabia", 23.0, 45.0, "land", "Arabia Felix, Deserta, Petraea"),
    ("Persia", "Persia", 32.0, 53.0, "land", ""),
    ("India", "India", 22.0, 79.0, "land", "Land of marvels, spices and Prester John"),
    ("Aegyptus", "Egypt", 26.0, 30.0, "land", ""),
    ("Aethiopia", "Ethiopia", 10.0, 40.0, "land", "Land of the burnt-faced men"),
    ("Mauretania", "Maghreb", 32.0, -4.0, "land", ""),
    ("Aethiopia interior", "Sub-Saharan Africa", 12.0, 5.0, "land", "The unknown south, terra incognita"),
    # Paradisus MUST stay at the far-east edge of the map — that is the whole
    # point of it. The 2026-07 east extension moved the edge from 100E to 122E,
    # so Paradise moves with it, out into the eastern Ocean beyond Cathay.
    # (At its old 92E it would now sit mid-map, in Tibet, which reads as a
    # placement error rather than as the world's edge.)
    ("Paradisus", "Earthly Paradise", 33.0, 121.3, "land", "The Garden of Eden, on an island in the far-eastern Ocean"),

    # --- East extension (2026-07) ----------------------------------------
    ("Cathay", "North China", 38.0, 113.0, "land", "The Great Kaan's realm, north of the great river"),
    ("Manzi", "South China", 27.5, 115.0, "land", "The southern kingdom, taken from the Sung"),
    ("Tangut", "Hexi / Gansu", 38.5, 99.0, "land", "Province of idolaters on the desert road"),
    ("Tebet", "Tibet", 31.0, 88.0, "land", "Land of great mastiffs, salt money and wild cane"),
    ("Turchestan", "Turkestan", 42.0, 80.0, "land", "Great Turkey, realm of Caidu"),
    ("Tartaria", "Mongolia", 47.0, 105.0, "land", "The steppe whence the Tartars came"),
    ("India Major", "Coromandel & the Deccan", 14.0, 78.0, "land", "The greatest of the three Indies"),
    ("India Minor", "Indochina & the Isles", 12.0, 103.0, "land", "The farther India, toward Chamba and Java"),
    ("Java", "Java & the Spice Isles", -6.5, 110.0, "land", "Whence come pepper, nutmeg, clove and galingale"),
]

# ---------------------------------------------------------------------------
# Writers
# ---------------------------------------------------------------------------
def fc(features):
    return {"type": "FeatureCollection",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": features}

def write_json(name, obj):
    p = os.path.join(DATA, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    print("wrote", name, os.path.getsize(p), "bytes")

# cities
feats = []
for i,(ml,mod,lat,lon,part,tier,note) in enumerate(CITIES):
    feats.append({"type":"Feature","id":f"city-{i}",
        "properties":{"name_medieval":ml,"name_modern":mod,"part":part,"tier":tier,"note":note,
                      "is_center": ml.startswith("Hierusalem")},
        "geometry":{"type":"Point","coordinates":[round(lon,4),round(lat,4)]}})
write_json("cities.geojson", fc(feats))

with open(os.path.join(DATA,"cities.csv"),"w",newline="",encoding="utf-8") as f:
    w=csv.writer(f); w.writerow(["name_medieval","name_modern","lat","lon","part","tier","note"])
    for ml,mod,lat,lon,part,tier,note in CITIES: w.writerow([ml,mod,lat,lon,part,tier,note])
print("wrote cities.csv")

# mountains
feats=[]
for i,(ml,mod,spine,peak,trend,note) in enumerate(MOUNTAINS):
    geom = {"type":"Point","coordinates":list(spine[0])} if len(spine)==1 else \
           {"type":"LineString","coordinates":[list(p) for p in spine]}
    feats.append({"type":"Feature","id":f"mtn-{i}",
        "properties":{"name_medieval":ml,"name_modern":mod,"peak_m":peak,"trend":trend,"note":note},
        "geometry":geom})
write_json("mountains.geojson", fc(feats))

# rivers
feats=[]
for i,(ml,mod,pts,note) in enumerate(RIVERS):
    feats.append({"type":"Feature","id":f"riv-{i}",
        "properties":{"name_medieval":ml,"name_modern":mod,"note":note},
        "geometry":{"type":"LineString","coordinates":[list(p) for p in pts]}})
write_json("rivers.geojson", fc(feats))

# seas
feats=[]
for i,(ml,mod,lat,lon,note) in enumerate(SEAS):
    feats.append({"type":"Feature","id":f"sea-{i}",
        "properties":{"name_medieval":ml,"name_modern":mod,"note":note},
        "geometry":{"type":"Point","coordinates":[lon,lat]}})
write_json("seas.geojson", fc(feats))

# regions
feats=[]
for i,(ml,mod,lat,lon,kind,note) in enumerate(REGIONS):
    feats.append({"type":"Feature","id":f"reg-{i}",
        "properties":{"name_medieval":ml,"name_modern":mod,"kind":kind,"note":note},
        "geometry":{"type":"Point","coordinates":[lon,lat]}})
write_json("regions.geojson", fc(feats))

# world config
cfg = {
  "project":"fatequest",
  "title":"Medieval European Known World (Oikoumene)",
  "worldview":"mappa mundi — east-oriented, Jerusalem-centered, encircling Ocean",
  "crs":"EPSG:4326 (WGS84 lon/lat)",
  "bbox":BBOX,
  "center_of_world":{"name":"Hierusalem/Jerusalem","lat":31.778,"lon":35.235},
  "orientation_note":"Medieval maps put EAST at the top. Rotate rendering -90deg (east-up) for the authentic look.",
  "counts":{"cities":len(CITIES),"mountains":len(MOUNTAINS),"rivers":len(RIVERS),"seas":len(SEAS),"regions":len(REGIONS)},
  "data_license":"Curated content CC0 / public-domain facts. Real coastline/DEM to be sourced from Natural Earth (public domain) & GEBCO/ETOPO — see scripts/build_real_terrain.py"
}
write_json("world_config.json", cfg)
print("DONE")
