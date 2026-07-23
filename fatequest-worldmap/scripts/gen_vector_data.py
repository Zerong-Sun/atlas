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
BBOX = {"west": -20.0, "south": 0.0, "east": 100.0, "north": 66.0}

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
    ("Tana", "Azov", 47.112, 39.423, "Europa", 3, "Mouth of the Tanais, Silk Road terminus"),
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
    ("Paradisus", "Earthly Paradise", 34.0, 92.0, "land", "The Garden of Eden, at the far East of the world"),
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
