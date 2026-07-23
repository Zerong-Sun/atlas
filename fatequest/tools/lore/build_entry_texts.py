#!/usr/bin/env python3
"""Build city entry texts and un-stub entry events.

Reads city tables + marco-polo-lore.json, generates:
- content/i18n/en.json: ev.*.entry.{title,body,choice.*} keys
- content/tables/events/entry.json: unstubbed events with lore refs

Tier-based word budgets (STORY_REQUIREMENTS.md §2):
  metropolis: 300-400w  source from place lore
  city:       150-200w  source from place lore (or authored)
  town:        80-120w  authored or hybrid from lore
  station:     40-60w   authored one-liner
"""
from __future__ import annotations

import json
import re
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TABLES = ROOT / "content" / "tables"
BOOKS = ROOT / "assets" / "books"

# ---- load sources ----
def load_cities():
    cities: list[dict] = []
    for fn in sorted((TABLES / "cities").glob("*.json")):
        d = json.loads(fn.read_text(encoding="utf-8"))
        cities.extend(d["records"])
    return cities

def load_lore():
    p = BOOKS / "marco-polo-lore.json"
    if not p.exists():
        print("WARNING: marco-polo-lore.json missing, all entries will be authored")
        return {}, {}
    d = json.loads(p.read_text(encoding="utf-8"))
    places = {x["id"]: x for x in d["places"]}
    stories = {x["id"]: x for x in d["stories"]}
    return places, stories

PLACES, STORIES = load_lore()

# ---- text helpers ----
def strip_polo(body: str) -> str:
    body = re.sub(r"\s+", " ", body).strip()
    # Remove relic annotation markers
    body = re.sub(r"\{[^}]+\}", "", body)
    return body

def trim_at_sentence(body: str, max_words: int) -> str:
    words = body.split()
    if len(words) <= max_words:
        return body
    cut = " ".join(words[:max_words])
    for punct in (". ", "; ", "! ", "? "):
        idx = cut.rfind(punct)
        if idx > len(cut) * 0.5:
            return cut[: idx + 1]
    return cut

def tier_budget(tier: str) -> int:
    return {"metropolis": 380, "city": 190, "town": 115, "station": 55}[tier]

# ---- city-specific lore text lookup ----
# A few alias: the city id may differ slightly from the lore place id
ID_TO_LORE = {
    "baldacum": "baudas",
    "tauris": "tauris",
    "ormus": "descent-to-the-city-of-hormos",
    "balc": "balc",
    "samarcanda": "samarcan",
    "badashan": "badashan",
    "cascar": "cascar",
    "cotan": "a-province-called-cotan",
    "lop": "lop",
    "sachiu": "sachiu",
    "chandu": "chandu",
    "campichu": "campichu",
    "cambaluc": "cambaluc-2",
    "kinsay": "great-city-of-kinsay",
    "nanghin": "yangiu",
    "zayton": "great-haven-of-zayton",
    "caracoron": "caracoron",  # steppe
    "etzina": "etzina",
    "fuju": "fuju",
    "kenjanfu": "kenjanfu",
    "sindafu": "sindafu",
    "caiju": "caiju", 
    "coigangiu": "coigangiu", 
    "coiganju": "coiganju", 
    "siju": "siju", 
    "tiju": "tiju", 
    "paukin": "paukin", 
    "sinju": "sinjumatu", 
    "chinghianfu": "chinghianfu", 
    "chinginju": "chinginju", 
    "chinangli": "chinangli",
    "cacanfu": "cacanfu",
    "cachanfu": "cachanfu", 
    "saianfu": "saianfu",
    "suju": "suju",
    "tanpiju": "tanpiju",
    "linju": "linju",
    "sinjumatu": "sinjumatu",
    "mien": "mien",
}

AUTHORED_ENTRIES: dict[str, str] = {
    "accon": "Acre — the last bastion of the Crusader kingdom, a fortified port where Latin, Greek, and Arabic merchants trade under the watch of the Templars' tower. Pilgrims embark here for Jerusalem; Venetian galleys unload woolens and load spices for the return voyage.",
    "alexandria": "Alexandria, the ancient port of the Pharaohs, now a Mamluk customs gate. The lighthouse is a ruin, but the harbors still teem with ships carrying Indian pepper, Syrian glass, and Egyptian grain to every corner of the Mediterranean.",
    "antiochia": "Antioch — once the third city of Rome, now a frontier town of the Mamluk sultanate. Its walls still stand, scarred by a century of crusades and counter-sieges. Silk from Aleppo and wool from Anatolia change hands in its covered bazaar.",
    "babylonia-cairus": "Cairo, which the Latins call Babylonia. The greatest city of the Mamluk realm: a hundred minarets rise above the Nile, the citadel of Salah al-Din crowns the hill, and the spice markets of the Khan al-Khalili never sleep.",
    "basora": "Basra — where the Tigris and Euphrates meet before emptying into the Persian Gulf. A city of canals and palm groves, famous for its dates and its pearl divers. Ships bound for India and Hormuz load cargo here.",
    "berrhoea": "Aleppo, known to the Franks as Berrhoea. The caravanserais of this ancient trading city receive caravans from Baghdad, Damascus, and Anatolia. Its soap-makers and silk-weavers are famous as far as Venice.",
    "bethleem": "Bethlehem — a small town on a hill, holy to Christians as the birthplace of the Lord. Pilgrims come to see the Grotto of the Nativity; the road from Jerusalem is short but steep, and the monasteries offer bread and shelter.",
    "caffa": "Caffa, the Genoese colony on the Crimean shore. From here, Tatar slaves, Russian furs, and Black Sea grain flow west to Constantinople and beyond. The harbor freezes in winter, but the trade never stops.",
    "camadi": "Camadi — ruins of an ancient Persian city on the edge of the desert. The caravans stop here for water from a single deep well; little else remains besides broken columns and the name.",
    "constantinopolis": "Constantinople, the Queen of Cities. The dome of Hagia Sophia still rises above the Golden Horn, but the Latin emperors have stripped her of treasure. Venetian and Genoese merchants own the best quarters; the Greek merchants watch from Galata with envy.",
    "ctesiphon": "Ctesiphon — the ghost of Sassanian glory. The great arch of the Taq-i-Kisra still stands, the largest brick span in the world, but the palace halls are empty now, and the Tigris has shifted its course away from the ruins.",
    "damascus": "Damascus — the garden city of the Umayyads. Canals fed by the Barada River water orchards of apricot and almond within the walls. Its steel blades, woven brocades, and crystallized fruits are prized from Cordoba to Cambaluc.",
    "edessa": "Edessa — an ancient Christian city on the edge of the Turcoman steppe. Once home to the fabled Mandylion, now a frontier fortress. The caravans from Mosul water their camels here before crossing into Anatolia.",
    "ephesus": "Ephesus — the harbor that silted up. The great Temple of Artemis is a memory; the Apostle John's basilica draws a trickle of pilgrims. Silk from the inland valleys still reaches the remaining wharves, bound for Smyrna and the sea.",
    "hierusalem": "Jerusalem — the city that three faiths call holy. The Dome of the Rock glitters above the Western Wall; the Holy Sepulchre echoes with Latin, Greek, Armenian, and Coptic chant. Pilgrims pay a tax at the gate; the Mamluk guard watches from the Citadel.",
    "ispahan": "Isfahan — the garden city of the Persian plateau. Its Friday Mosque with twin domes, its covered bridges, and its workshops of tile, miniature, and carpet draw merchants and scholars from all the Ilkhan's lands.",
    "kerman": "Kerman — a city on the desert's edge, famed for its steel blades and its swift horses. The caravans to Hormuz rest here; the wind from the Dasht-i-Lut carries a fine dust that settles on every surface.",
    "kiovia": "Kiev — the mother of Russian cities, now a tributary of the Golden Horde. Its golden domes still shine above the Dnieper, but the Tatar baskak collects the taxes, and the river trade has slowed.",
    "moscovia": "Moscow — a wooden fortress on a northern river, deep in the forests of Rus. The Grand Prince pays homage to the Khan at Sarai; sable furs and forest honey flow south in tribute.",
    "nicaea": "Nicaea — the city of the Creed, where the bishops of Christendom once defined the faith. Now a modest Byzantine town behind double walls, guarding the eastern shore of the lake. The road to Constantinople passes through its gates.",
    "ninive": "Mosul, which the Latins call Nineveh after the ancient city across the Tigris. A great bridge of boats spans the river; the workshops weave the gold-threaded cloth called muslin, and the Christians and Muslims trade in uneasy peace.",
    "novogardia": "Novgorod — the great trading republic of the north, where the Hansa merchants buy Russian wax, honey, and fur. The frozen lakes serve as winter highways; the birch-bark letters of the townsfolk carry business and gossip alike.",
    "petra": "Petra — the rose-red city of the Nabateans, carved into the living rock. Now a way-station on the Hajj road, its temples and tombs shelter caravans bound for Mecca and Damascus. The Bedouin guard the passes for a toll.",
    "smyrna": "Smyrna — the port of western Anatolia, where silk from the inland valleys is baled for Genoese galleys. The castle on the hill flies the flag of whichever power last took the city; below, Turkish, Greek, and Frankish merchants count coins in three languages.",
    "tana-azov": "Tana — the Venetian trading post at the mouth of the Don. From here the overland route to Sarai and the Volga begins. Slaves, wax, and dried fish are the staples; the Cuman steppe stretches north without a hill for a hundred leagues.",
    "tarsus": "Tarsus — the birthplace of the Apostle Paul, now a town of the Armenian kingdom. The Cydnus River still flows through the city, cool from the Taurus snows. Cotton grows in the plain, and the caravans to the Cilician Gates stock up here.",
    "trapezus": "Trebizond — the last outpost of the Byzantine Empire on the Black Sea. The Comnenus emperors hold court in a citadel above the harbor; the Genoese and Venetian merchants compete for alum, silk, and furs from the Caucasus.",
    "tripolis": "Tripoli — a Crusader county now under Mamluk rule. The harbor fort, built by Raymond of Saint-Gilles, still stands; silk and sugar from the coastal plantations are loaded for Europe.",
    "tyrus": "Tyre — the ancient Phoenician island-city, now joined to the mainland by a sandy causeway. Alexander's siege ramp still shapes the shore. Glassblowers work the white sands; the Venetian consul keeps a counting-house by the water.",
    "cabul": "Kabul — a fortress city in the eastern mountains, gateway to India. The Khyber caravans assemble here; lapis lazuli from Badakhshan and spices from Delhi change hands in the covered bazaar.",
    "delli": "Delhi — the capital of the Sultanate, a city of mosques, minarets, and markets that swallows caravans from Khorasan and Bengal alike. The Sultan's cavalry — ten thousand Turkic horsemen — patrols the walls.",
    "keshimur": "Kashmir — a valley ringed by snow peaks, where the saffron fields bloom in autumn and the shawl-weavers work wool finer than silk. The people are mostly idolaters, but a few Muslims have settled in the towns.",
    "merva": "Merv — the Queen of the World in its day, now a ghost of ruined walls and silted canals. The Mongol rider left nothing standing a generation ago, but the oasis still waters a few caravans between Bokhara and Persia.",
    "pein": "Pein — a small oasis on the southern Silk Road, halfway between Khotan and Charchan. Dates, melons, and a spring of slightly bitter water. The desert on either side stretches five days' journey without a well.",
    "taican": "Taican — a market town in the eastern foothills, famous for its salt mines and its melons. The road from Balkh climbs here before the Pamir; caravans stock up on salt blocks and dried fruit for the high passes.",
    "yarcan": "Yarkand — an oasis kingdom of the Tarim basin, where six roads meet. Its markets trade Khotanese jade, Kashgarian carpets, and Tibetan musk. The ruler pays tribute to the Khan, but governs in his own name.",
    "aden": "Aden — the great port of the Yemen, where the Red Sea meets the Indian Ocean. The harbor is guarded by an iron chain; dhows from Malabar, Zanzibar, and Hormuz discharge cargo under the fortress walls. All goods that pass to Alexandria must pass through Aden first.",
    "axuma": "Axum — an ancient Christian kingdom in the Ethiopian highlands, now a shadow of its former glory. The obelisks still stand, and the Church still prays in Ge'ez, but the Red Sea trade has shifted to Aden.",
    "cail": "Kayal — a port on the Coromandel coast, where the pearl fisheries bring up the finest gems known to man. The king wears nothing but a loincloth, but his pearls could buy a fleet; foreign merchants are treated with honor.",
    "calatu": "Qalhat — a port on the Omani coast, ruled by a queen who governs in the name of Hormuz. The harbor is deep and well-sheltered; horses and dates are exported to India, and spices return from Malabar.",
    "cambaet": "Cambay — a great port of Gujarat, where the tides rise and fall so fiercely that ships must be beached and refloated twice a day. Cotton, indigo, and leather goods fill the warehouses; the merchants are sharp and wealthy.",
    "coilum": "Kollam — the pepper port of Malabar. The trees grow wild on the hills behind the city; every ship that sails for Aden or Hormuz carries pepper in its hold. The Christians of St. Thomas have churches here with crosses carved in stone.",
    "dongola": "Dongola — a Nubian kingdom on the upper Nile, Christian since the sixth century. The cathedral of painted saints overlooks the river; caravans bring gold and ivory from the interior and slaves from the pagan south.",
    "dufar": "Dhofar — the frankincense coast of southern Arabia. The trees weep their white resin onto the hillsides; the harbors ship it to every temple and church in the known world. The monsoon brings rain that turns the hills green for three months of the year.",
    "esher": "Al-Shihr — a fishing port on the Hadhramaut coast, where the best-quality frankincense is landed. The castle on the cliff watches the Indian Ocean; dhows from Malabar and Aden call here for water and supplies.",
    "maabar": "Maabar — the Coromandel coast, the land of pearls and temples. The pagodas rise in tiered pyramids carved with a thousand gods. The kings measure their wealth in elephants; the pearl divers hold their breath longer than any man in Christendom.",
    "mecha": "Mecca — the holy city of Islam, forbidden to Christians. The Kaaba stands in the center of the great mosque, draped in black silk; the well of Zamzam waters the pilgrims who circle it. The city lives on the Hajj; its merchants sell water and prayer-beads.",
    "medina": "Medina — the City of the Prophet, second in holiness only to Mecca. The green dome of the Prophet's mosque rises above the palm groves. Pilgrims visit the tomb before continuing to Mecca; the road between the two holy cities is the busiest in Arabia.",
    "melibar": "Malabar — the pepper coast of India, where the monsoon brings rain that falls for three months without ceasing. The pepper vines climb the jack trees; the black gold loads into Arab dhows bound for Aden and the markets of the Mediterranean.",
    "semenat": "Somnath — the temple city of Gujarat, where the idol draws pilgrims from across India. The brahmins shave their heads and beat drums; the treasury holds more gold than any sultan's palace.",
    "tana": "Thane — an island fortress near the coast of Gujarat, under the rule of a Hindu raja. Rice, cotton, and sugar cane grow in the estuary; the monsoon dhows shelter in the creeks during the season of storms.",
    "camul": "Hami — the first oasis east of the Great Desert, where the traveler who has survived the sand begins to breathe again. The people are idolaters who offer their wives to passing strangers as a mark of hospitality — a custom the Great Khan has forbidden in vain.",
    "charchan": "Charchan — a small oasis on the southern Silk Road at the edge of the Taklamakan. Poplars line the irrigation ditches; the people grow melons and keep sheep. The desert beyond is the worst stretch of the journey — five days without a drop of water.",
    "sapurgan": "Shibarghan — a market town on the road between Balkh and the mountains, famous for its melons. The best are sliced and dried into thin spirals that can cross the desert without spoiling. Two days to the east, the road begins to climb.",
    "samara": "Samara — a kingdom on the northern coast of Sumatra, ruled by a king who claims descent from Alexander. The people eat rice and fish; the forests are full of elephants and rhinoceros. Ships from China and India call here for water and trade.",
    "egrigaia": "Egrigaia — the province the Mongols call the Tangut heartland, where the Yellow River bends around the Ordos. A land of walled cities and Buddhist monasteries; the King of the Tanguts once ruled here before Chinghis came.",
    "tenduc": "Tenduc — the land of Prester John's descendants, according to the tales. A Nestorian Christian prince rules here under the Great Khan; the churches have crosses, and the people keep the faith in a sea of idolaters.",
    "bochara": "Bokhara — the dome of Islam in Central Asia, where the madrasas teach law and theology to students from every corner of the Khan's lands. Carpets, silk, and the finest paper come from its workshops; the citadel has never fallen to assault.",
}

STATION_TEXTS = {
    "cacanfu": "Hejian — a post-station on the imperial highway. The post-horses are changed; the innkeeper serves millet porridge and salted vegetables.",
    "cachanfu": "Puzhou — a walled town on the right bank of the Yellow River. The ferrymen know every sandbar; in flood season they refuse to cross.",
    "caiju": "Guazhou — the last station before the Great Desert, where the road divides. The Tangut merchants stock water-skins and hire extra camels here.",
    "chinangli": "Cangzhou — a salt-producing town on the Grand Canal. The brine-pans stretch for miles; the salt tax is collected at the imperial warehouse.",
    "chinghianfu": "Zhenjiang — a city of bridges and canals on the south bank of the Yangtze. The Nestorians have two churches here; the bells ring across the water.",
    "chinginju": "Changzhou — a market town in the rich country south of the Yangtze. Silk and rice are the principal goods; the canal brings everything else.",
    "coigangiu": "Huaiyin — a boat-town on the Grand Canal. Every family keeps a sampan; the children learn to row before they learn to walk.",
    "coiganju": "Huai'an — a junction where the canal meets the Huai River. The grain fleet anchors here for customs inspection; the inns are fuller than the temples.",
    "etzina": "Khara-Khoto — the Black City of the Tangut, now a ruin half-buried in sand. The caravans still stop at a well outside the walls; no one stays after dark.",
    "fuju": "Fuzhou — a port in the far south of Manzi, where the merchants trade in sugar, camphor, and ships' timbers. The junks sail from here to Zayton and the islands beyond.",
    "kenjanfu": "Xi'an — the ancient capital of a thousand years, where the walls encircle more ground than any city in Cathay except Cambaluc. The Nestorian stele stands in a temple courtyard; the silk merchants set out from here for the western road.",
    "linju": "Lingxian — a small walled town on the northern plain. The garrison inspects every traveler's papers; the tea-house outside the east gate is warmer than the official inn.",
    "mien": "Pagan — the capital of the Burmese kingdom, a plain of a thousand pagodas. The temples are coated in gold leaf; the king keeps five thousand war elephants and pays tribute to the Great Khan.",
    "paukin": "Baoying — a canal town where the boats tie up for the night. The watchman beats the hour on a wooden block; mist rises from the water before dawn.",
    "saianfu": "Xiangyang — the fortress that held out for three years against the Mongol siege. The walls are scarred but rebuilt; the memory of the catapults is fresh.",
    "siju": "Pizhou — a ferry-town where the imperial highway crosses a broad river. The inn sells millet wine and boiled river-crab; the boatmen gossip in the common room.",
    "sindafu": "Chengdu — the capital of Sichuan, a city of bridges and river mist. Silk brocade, wax, and cinnamon are the chief trade goods; the temples ring the city like a rosary.",
    "sinju": "Yizheng — a canal junction between the Yangtze and the Huai. The customs house works day and night; the smell of river-fish frying drifts across the water.",
    "sinjumatu": "Jining — a canal town in the northern plain, where the grain boats ride low in the water. The innkeeper boasts that his noodle soup has traveled further than any Khan.",
    "suju": "Suzhou — the city of gardens and silk-looms, where every street follows a canal. The bridges are so numerous that a boat can pass under a different arch every hundred paces.",
    "tanpiju": "Tonglu — a river-town in the hills of Manzi, where the bamboo rafts tie up alongside the stone wharves. The hills are terraced with tea; the river runs clear and fast.",
    "tiju": "Gaoyou — a post-station on the Grand Canal. The lake to the west is full of fish; the road east leads to the salt fields and the sea.",
    "chamba": "Champa — a kingdom on the coast of Annam, rich in aloewood and elephant tusks. The king pays tribute to the Great Khan; his ships sail to China every year with tribute elephants.",
    "java-major": "Java the Great — an island kingdom of immense wealth, where pepper, nutmeg, and cloves grow in the volcanic soil. The Shahbandar of the port-taxes every ship that enters; no man has ever sailed around the island.",
    "pentam": "Bintan — an island in the straits south of the Malay Peninsula. Wood, water, and fresh fruit are the only trade; the sea-people who live here build their houses on stilts above the tide.",
}

def city_body(city: dict) -> str:
    cid = city["id"]
    tier = city["tier"]
    lore_id = city.get("lore", {}).get("placeId")
    if lore_id:
        # Use lore id from city table, but try ID_TO_LORE alias first
        lookup = ID_TO_LORE.get(cid, lore_id)
        place = PLACES.get(lookup) or PLACES.get(lore_id)
        if place:
            body = strip_polo(place["body"])
            budget = tier_budget(tier)
            return trim_at_sentence(body, budget)
    # Authored fallback
    if cid in AUTHORED_ENTRIES:
        return trim_at_sentence(AUTHORED_ENTRIES[cid], tier_budget(tier))
    if cid in STATION_TEXTS:
        return STATION_TEXTS[cid]
    # last resort
    return f"The city of {cid}."

def city_title(city: dict) -> str:
    cid = city["id"]
    lore_id = city.get("lore", {}).get("placeId")
    if lore_id:
        lookup = ID_TO_LORE.get(cid, lore_id)
        place = PLACES.get(lookup) or PLACES.get(lore_id)
        if place:
            t = place["title"]
            # Simplify long titles
            t = re.sub(r",\s*and First.*", "", t)
            t = re.sub(r",\s*.*Despatch.*", "", t)
            t = re.sub(r"\s+", " ", t).strip()
            if len(t) > 80:
                t = "Arriving at " + place.get("placeNames", [cid])[0]
            return t
    # Use medieval name
    med = city.get("name", "").replace("city.", "").replace(".name", "")
    med = med.replace("-", " ").title()
    return f"Arriving at {med}"

def choice_label(city: dict, idx: int) -> str:
    tier = city["tier"]
    if tier in ("metro", "metropolis", "city"):
        options = ["Rest and look about", "Visit the market", "Ask for news"]
    else:
        options = ["Pass through", "Rest a while"]
    return options[idx % len(options)]

# ---- main ----
def main():
    cities = load_cities()
    en = json.loads((ROOT / "content/i18n/en.json").read_text(encoding="utf-8"))
    entry = json.loads((TABLES / "events/entry.json").read_text(encoding="utf-8"))
    
    added = 0
    # Build lookup by event id → city
    ev_to_city = {f"ev-{c['id']}-entry": c for c in cities if f"ev-{c['id']}-entry"}

    for rec in entry["records"]:
        eid = rec["id"]
        city = ev_to_city.get(eid)
        if not city:
            continue
        prefix = eid.replace("-", ".")  # ev-accon-entry → ev.accon.entry

        # title
        tkey = f"{prefix}.title"
        if tkey not in en:
            en[tkey] = city_title(city)
            added += 1
        # body
        bkey = f"{prefix}.body"
        if bkey not in en:
            en[bkey] = city_body(city)
            added += 1
        # choice labels
        for i, ch in enumerate(rec.get("choices", [])):
            lkey = ch["label"]
            if lkey not in en:
                en[lkey] = choice_label(city, i)
                added += 1

        # un-stub
        if rec.get("stub"):
            rec.pop("stub", None)
            added += 1

    # Write back
    i18n_path = ROOT / "content/i18n/en.json"
    i18n_path.write_text(json.dumps(en, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    entry_path = TABLES / "events/entry.json"
    entry_path.write_text(json.dumps(entry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Added {added} en keys, unstubbed {sum(1 for r in entry['records'] if not r.get('stub'))} events")
    leftovers = [r["id"] for r in entry["records"] if r.get("stub")]
    if leftovers:
        print(f"Still stubbed ({len(leftovers)}): {leftovers[:10]}...")

if __name__ == "__main__":
    main()
