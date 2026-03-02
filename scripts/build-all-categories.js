#!/usr/bin/env node

/**
 * build-all-categories.js
 *
 * Merges fresh scrape data with existing category JSON files for all
 * TV & Audio categories (excluding TVs, which is handled separately).
 *
 * For each category:
 *   1. Reads the existing JSON from data/scrape/
 *   2. Merges in fresh scraped products
 *   3. Deduplicates by product ID (extracted from URL)
 *   4. Normalizes all products to use `productUrl` (not `url`)
 *   5. Ensures all products have required fields with defaults
 *   6. Sorts by brand (asc) then price (asc)
 *   7. Updates totalProducts count
 *   8. Writes updated JSON back
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'scrape');

// ---------------------------------------------------------------------------
// Fresh scrape data per category
// ---------------------------------------------------------------------------

const FRESH_DATA = {
  soundbars: [
    {"name":"SONOS Beam (Gen 2) Compact Sound Bar with Dolby Atmos, Alexa & Google Assistant - Black","brand":"SONOS","price":449,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":334,"productUrl":"https://www.currys.co.uk/products/sonos-beam-gen-2-compact-sound-bar-with-dolby-atmos-alexa-and-google-assistant-black-10230379.html","imageUrl":"https://media.currys.biz/i/currysprod/10230379?$g-small$&fmt=auto","specs":["Dolby Atmos","Supports High-Resolution Audio","Compatible with SONOS multi-room","HDMI","2 year guarantee"]},
    {"name":"HISENSE HS214 2.1 All-in-one Sound Bar","brand":"HISENSE","price":69,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":271,"productUrl":"https://www.currys.co.uk/products/hisense-hs214-2.1-allinone-sound-bar-10244299.html","imageUrl":"https://media.currys.biz/i/currysprod/10244299?$g-small$&fmt=auto","specs":["Built-in subwoofer","Audio power: 108 W","HDMI / Optical / Coaxial"]},
    {"name":"SONOS Ray Compact Sound Bar - Black","brand":"SONOS","price":199,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":60,"productUrl":"https://www.currys.co.uk/products/sonos-ray-compact-sound-bar-black-10238584.html","imageUrl":"https://media.currys.biz/i/currysprod/M10238584_black?$g-small$&fmt=auto","specs":["Supports High-Resolution Audio","Compatible with SONOS multi-room","Optical","2 year guarantee"]},
    {"name":"SONOS Arc Ultra Sound Bar with Dolby Atmos & Amazon Alexa - Black","brand":"SONOS","price":999,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":308,"productUrl":"https://www.currys.co.uk/products/sonos-arc-ultra-sound-bar-with-dolby-atmos-and-amazon-alexa-black-10270746.html","imageUrl":"https://media.currys.biz/i/currysprod/M10270732_black_001?$g-small$&fmt=auto","specs":["Dolby Atmos","Adaptive / optimized audio","Supports High-Resolution Audio","Compatible with SONOS multi-room","HDMI","2 year guarantee"]},
    {"name":"SAMSUNG HW-S50B/XU 3.0 All-in-One Sound Bar - Dark Grey","brand":"SAMSUNG","price":189,"wasPrice":0,"savings":0,"rating":4.5,"reviewCount":252,"productUrl":"https://www.currys.co.uk/products/samsung-hws50bxu-3.0-allinone-sound-bar-dark-grey-10238562.html","imageUrl":"https://media.currys.biz/i/currysprod/10238562?$g-small$&fmt=auto","specs":["DTS:X","Audio power: 140 W","Adaptive / optimized audio","HDMI"]},
    {"name":"JBL BAR 1000 7.1.4 Wireless Sound Bar with Dolby Atmos","brand":"JBL","price":849.97,"wasPrice":899,"savings":49.03,"rating":4.8,"reviewCount":116,"productUrl":"https://www.currys.co.uk/products/jbl-bar-1000-7.1.4-wireless-sound-bar-with-dolby-atmos-10244363.html","imageUrl":"https://media.currys.biz/i/currysprod/10244363?$g-small$&fmt=auto","specs":["Dolby Atmos & DTS:X","Wireless subwoofer","Audio power: 880 W","4K pass-through","2 year guarantee"]},
    {"name":"HISENSE AX5100Q 5.1 Wireless Sound Bar with Dolby Atmos","brand":"HISENSE","price":179,"wasPrice":229,"savings":50,"rating":4.5,"reviewCount":33,"productUrl":"https://www.currys.co.uk/products/hisense-ax5100q-5.1-wireless-sound-bar-with-dolby-atmos-10280658.html","imageUrl":"https://media.currys.biz/i/currysprod/10280658?$g-small$&fmt=auto","specs":["Dolby Atmos & DTS:X","Wireless subwoofer & rear speakers","Audio power: 580 W","Adaptive / optimized audio","4K pass-through","HDMI / Optical"]},
    {"name":"HISENSE HS3100 3.1 Wireless Compact Sound Bar with DTS Virtual:X","brand":"HISENSE","price":99,"wasPrice":149,"savings":50,"rating":4.7,"reviewCount":89,"productUrl":"https://www.currys.co.uk/products/hisense-hs3100-3.1-wireless-compact-sound-bar-with-dts-virtualx-10266538.html","imageUrl":"https://media.currys.biz/i/currysprod/10266538?$g-small$&fmt=auto","specs":["DTS Virtual:X","Wireless subwoofer","Audio power: 480 W","Adaptive / optimized audio","HDMI / Optical"]},
    {"name":"LG US60TR 5.1 Wireless Sound Bar","brand":"LG","price":299,"wasPrice":399,"savings":100,"rating":4.6,"reviewCount":83,"productUrl":"https://www.currys.co.uk/products/lg-us60tr-5.1-wireless-sound-bar-10262669.html","imageUrl":"https://media.currys.biz/i/currysprod/10262669?$g-small$&fmt=auto","specs":["Wireless subwoofer & rear speakers","Audio power: 440 W","Adaptive / optimized audio","HDMI / Optical"]},
    {"name":"SAMSUNG HW-B400F/XU 2.0 All-in-One Sound Bar","brand":"SAMSUNG","price":99,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":36,"productUrl":"https://www.currys.co.uk/products/samsung-hwb400fxu-2.0-allinone-sound-bar-10282182.html","imageUrl":"https://media.currys.biz/i/currysprod/10282182?$g-small$&fmt=auto","specs":["Number of speakers: 4","Built-in subwoofer","Audio power: 40 W","HDMI / Optical"]},
    {"name":"SAMSUNG HW-B450F/XU 2.1 Wireless Sound Bar with DTS Virtual:X","brand":"SAMSUNG","price":219,"wasPrice":0,"savings":0,"rating":5,"reviewCount":5,"productUrl":"https://www.currys.co.uk/products/samsung-hwb450fxu-2.1-wireless-sound-bar-with-dts-virtualx-10282179.html","imageUrl":"https://media.currys.biz/i/currysprod/10282179?$g-small$&fmt=auto","specs":["Number of speakers: 3","DTS Virtual:X","Wireless subwoofer","Audio power: 300 W","HDMI / Optical / USB"]},
    {"name":"SAMSUNG HW-S60D/XU 5.0 All-in-One Sound Bar with Dolby Atmos, DTS Virtual:X & Amazon Alexa - Black","brand":"SAMSUNG","price":389,"wasPrice":399,"savings":10,"rating":4.6,"reviewCount":197,"productUrl":"https://www.currys.co.uk/products/samsung-hws60dxu-5.0-allinone-sound-bar-with-dolby-atmos-dts-virtualx-and-amazon-alexa-black-10263880.html","imageUrl":"https://media.currys.biz/i/currysprod/10263880?$g-small$&fmt=auto","specs":["Number of speakers: 7","Dolby Atmos & DTS Virtual:X","Built-in subwoofer","Audio power: 200 W","Adaptive / optimized audio","HDMI"]},
    {"name":"SAMSUNG HW-Q600F/XU 3.1.2 Wireless Sound Bar with Dolby Atmos","brand":"SAMSUNG","price":499,"wasPrice":549,"savings":50,"rating":4.9,"reviewCount":20,"productUrl":"https://www.currys.co.uk/products/samsung-hwq600fxu-3.1.2-wireless-sound-bar-with-dolby-atmos-10282181.html","imageUrl":"https://media.currys.biz/i/currysprod/10282181?$g-small$&fmt=auto","specs":["Number of speakers: 9","Dolby Atmos & DTS:X","Wireless subwoofer","Audio power: 380 W","Adaptive / optimized audio","4K pass-through"]},
    {"name":"SAMSUNG HW-Q930F/XU 9.1.4 Wireless Sound Bar with Dolby Atmos & DTS Virtual:X","brand":"SAMSUNG","price":999,"wasPrice":0,"savings":0,"rating":5,"reviewCount":14,"productUrl":"https://www.currys.co.uk/products/samsung-hwq930fxu-9.1.4-wireless-sound-bar-with-dolby-atmos-and-dts-virtualx-10282178.html","imageUrl":"https://media.currys.biz/i/currysprod/10282178?$g-small$&fmt=auto","specs":["Number of speakers: 17","Dolby Atmos & DTS Virtual:X","Wireless subwoofer & rear speakers","Audio power: 580 W","Adaptive / optimized audio","Supports High-Resolution Audio with 4K pass-through"]},
    {"name":"SONY HT-S20R 5.1 Sound Bar","brand":"SONY","price":249,"wasPrice":0,"savings":0,"rating":4.5,"reviewCount":226,"productUrl":"https://www.currys.co.uk/products/sony-hts20r-5.1-sound-bar-10207764.html","imageUrl":"https://media.currys.biz/i/currysprod/10207764?$g-small$&fmt=auto","specs":["Bluetooth","Wired subwoofer & rear speakers","Audio power: 400 W","4K pass-through","HDMI / Optical"]},
    {"name":"SONY HT-S2000 3.1 All-in-One Sound Bar with Dolby Atmos & DTS Virtual:X","brand":"SONY","price":399,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":453,"productUrl":"https://www.currys.co.uk/products/sony-hts2000-3.1-allinone-sound-bar-with-dolby-atmos-and-dts-virtualx-10250527.html","imageUrl":"https://media.currys.biz/i/currysprod/10250527?$g-small$&fmt=auto","specs":["Number of speakers: 5","Dolby Atmos & DTS Virtual:X","Built-in subwoofer","Audio power: 250 W","Adaptive / optimized audio","HDMI / Optical"]},
    {"name":"SONY HT-SF150 2.0 Sound Bar","brand":"SONY","price":129,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":548,"productUrl":"https://www.currys.co.uk/products/sony-htsf150-2.0-sound-bar-10176938.html","imageUrl":"https://media.currys.biz/i/currysprod/10176938?$g-small$&fmt=auto","specs":["Audio power: 120 W","HDMI / Optical"]},
    {"name":"SONY HT-S400 2.1 Wireless Sound Bar","brand":"SONY","price":249,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":51,"productUrl":"https://www.currys.co.uk/products/sony-hts400-2.1-wireless-sound-bar-10236857.html","imageUrl":"https://media.currys.biz/i/currysprod/10236857?$g-small$&fmt=auto","specs":["Wireless subwoofer","Audio power: 330 W","HDMI / Optical"]},
    {"name":"SONY BRAVIA Theatre Bar 9 (HT-A9000) 13.0 Sound Bar with Dolby Atmos","brand":"SONY","price":1399,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":48,"productUrl":"https://www.currys.co.uk/products/sony-bravia-theatre-bar-9-13.0-sound-bar-with-dolby-atmos-10264006.html","imageUrl":"https://media.currys.biz/i/currysprod/10264006?$g-small$&fmt=auto","specs":["Number of speakers: 13","Dolby Atmos & DTS:X","Audio power: 585 W","Adaptive / optimized audio","Supports High-Resolution Audio with 8K pass-through"]},
    {"name":"SONY BRAVIA Theatre Bar 60 3.1.2 Wireless Sound Bar with Dolby Atmos & DTS Virtual:X","brand":"SONY","price":499,"wasPrice":0,"savings":0,"rating":4.5,"reviewCount":21,"productUrl":"https://www.currys.co.uk/products/sony-bravia-theatre-bar-60-3.1.2-wireless-sound-bar-with-dolby-atmos-and-dts-virtualx-10282356.html","imageUrl":"https://media.currys.biz/i/currysprod/10282356?$g-small$&fmt=auto","specs":["Number of speakers: 6","Dolby Atmos & DTS Virtual:X","Wireless subwoofer","Audio power: 350 W","Adaptive / optimized audio","Supports High-Resolution Audio"]},
    {"name":"SONY BRAVIA Theatre Bar 8 (HT-A8000) 11.0 Sound Bar with Dolby Atmos","brand":"SONY","price":999,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":9,"productUrl":"https://www.currys.co.uk/products/sony-bravia-theatre-bar-8-11.0-sound-bar-with-dolby-atmos-10264002.html","imageUrl":"https://media.currys.biz/i/currysprod/10264002?$g-small$&fmt=auto","specs":["Number of speakers: 13","Dolby Atmos & DTS:X","Audio power: 495 W","Adaptive / optimized audio","Supports High-Resolution Audio with 8K pass-through"]},
    {"name":"SONY HT-A3000 3.1 All-in-One Sound Bar with Dolby Atmos","brand":"SONY","price":599,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":453,"productUrl":"https://www.currys.co.uk/products/sony-hta3000-3.1-allinone-sound-bar-with-dolby-atmos-10242949.html","imageUrl":"https://media.currys.biz/i/currysprod/10242949?$g-small$&fmt=auto","specs":["Number of speakers: 5","Dolby Atmos / DTS:X","Built-in subwoofer","Audio power: 240 W","Adaptive / optimized audio","Supports High-Resolution Audio"]},
    {"name":"SONY HT-S40R 5.1 Sound Bar","brand":"SONY","price":349,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":198,"productUrl":"https://www.currys.co.uk/products/sony-hts40r-5.1-sound-bar-10222525.html","imageUrl":"https://media.currys.biz/i/currysprod/10222525?$g-small$&fmt=auto","specs":["Wired subwoofer & rear speakers","Audio power: 600 W","4K pass-through","HDMI / Optical"]},
    {"name":"LG US20A 2.0 Compact Sound Bar","brand":"LG","price":79.99,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":19,"productUrl":"https://www.currys.co.uk/products/lg-us20a-2.0-compact-sound-bar-10282047.html","imageUrl":"https://media.currys.biz/i/currysprod/10282047?$g-small$&fmt=auto","specs":["Number of speakers: 2","Audio power: 50 W Peak / 50 W RMS","Adaptive / optimized audio","HDMI"]},
    {"name":"LG SQM1 2.0 Compact Sound Bar","brand":"LG","price":59.99,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":37,"productUrl":"https://www.currys.co.uk/products/lg-sqm1-2.0-compact-sound-bar-10267031.html","imageUrl":"https://media.currys.biz/i/currysprod/10267031?$g-small$&fmt=auto","specs":["Number of speakers: 2","Audio power: 40 W","Adaptive / optimized audio","Optical"]},
    {"name":"LG SQC1 2.1 Wireless Compact Sound Bar","brand":"LG","price":129.99,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":88,"productUrl":"https://www.currys.co.uk/products/lg-sqc1-2.1-wireless-compact-sound-bar-10248390.html","imageUrl":"https://media.currys.biz/i/currysprod/10248390?$g-small$&fmt=auto","specs":["Number of speakers: 3","Wireless subwoofer","Audio power: 160 W RMS","Adaptive / optimized audio","Optical"]},
    {"name":"LG US40T 2.1 Wireless Sound Bar","brand":"LG","price":199,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":69,"productUrl":"https://www.currys.co.uk/products/lg-us40t-2.1-wireless-sound-bar-10262742.html","imageUrl":"https://media.currys.biz/i/currysprod/10262742?$g-small$&fmt=auto","specs":["Number of speakers: 3","Wireless subwoofer","Audio power: 300 W","Adaptive / optimized audio","HDMI / Optical"]},
    {"name":"LG US95TR 9.1.5 Wireless Sound Bar with Dolby Atmos","brand":"LG","price":1399,"wasPrice":1499,"savings":100,"rating":5,"reviewCount":24,"productUrl":"https://www.currys.co.uk/products/lg-us95tr-9.1.5-wireless-sound-bar-with-dolby-atmos-10262748.html","imageUrl":"https://media.currys.biz/i/currysprod/10262748?$g-small$&fmt=auto","specs":["Number of speakers: 17","Dolby Atmos & DTS:X","Wireless subwoofer & rear speakers","Audio power: 810 W","Noise-distortion cancelling technology","Supports High-Resolution Audio with 4K pass-through","2 year guarantee"]},
    {"name":"LG US70TR 5.1.1 Wireless Sound Bar with Dolby Atmos","brand":"LG","price":699,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":49,"productUrl":"https://www.currys.co.uk/products/lg-us70tr-5.1.1-wireless-sound-bar-with-dolby-atmos-10262662.html","imageUrl":"https://media.currys.biz/i/currysprod/10262662?$g-small$&fmt=auto","specs":["Number of speakers: 9","Dolby Atmos & DTS:X","Wireless subwoofer & rear speakers","Audio power: 500 W","Adaptive / optimized audio","Supports High-Resolution Audio with 4K pass-through"]},
    {"name":"LG US77TY 3.1.3 Wireless Sound Bar with Dolby Atmos","brand":"LG","price":599,"wasPrice":899,"savings":300,"rating":4.8,"reviewCount":5,"productUrl":"https://www.currys.co.uk/products/lg-us77ty-3.1.3-wireless-sound-bar-with-dolby-atmos-10262666.html","imageUrl":"https://media.currys.biz/i/currysprod/10262666?$g-small$&fmt=auto","specs":["Number of speakers: 9","Dolby Atmos & DTS:X","Wireless subwoofer","Audio power: 400 W","Adaptive / optimized audio","Supports High-Resolution Audio with 4K pass-through"]},
    {"name":"LG USC9S 3.1.3 Wireless Sound Bar with Dolby Atmos","brand":"LG","price":799,"wasPrice":999,"savings":200,"rating":4.6,"reviewCount":76,"productUrl":"https://www.currys.co.uk/products/lg-usc9s-3.1.3-wireless-sound-bar-with-dolby-atmos-10248732.html","imageUrl":"https://media.currys.biz/i/currysprod/10248732?$g-small$&fmt=auto","specs":["Number of speakers: 9","Dolby Atmos & DTS:X","Wireless subwoofer","Audio power: 400 W","Meridian technology","Supports High-Resolution Audio with 4K pass-through","Chromecast / AirPlay built-in","HDMI / Optical","2 year guarantee"]},
    {"name":"LG USG10TY 3.1 Wireless Sound Bar with Dolby Atmos","brand":"LG","price":999,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":30,"productUrl":"https://www.currys.co.uk/products/lg-usg10ty-3.1-wireless-sound-bar-with-dolby-atmos-10262670.html","imageUrl":"https://media.currys.biz/i/currysprod/10262670?$g-small$&fmt=auto","specs":["Number of speakers: 8","Dolby Atmos & DTS:X","Wireless subwoofer","Audio power: 420 W","Adaptive / optimized audio","2 year guarantee"]},
    {"name":"LG US80TR 5.1.3 Wireless Sound Bar with Dolby Atmos","brand":"LG","price":1099,"wasPrice":0,"savings":0,"rating":4.5,"reviewCount":48,"productUrl":"https://www.currys.co.uk/products/lg-us80tr-5.1.3-wireless-sound-bar-with-dolby-atmos-10281500.html","imageUrl":"https://media.currys.biz/i/currysprod/10281500?$g-small$&fmt=auto","specs":["Number of speakers: 11","Dolby Atmos & DTS:X","Wireless subwoofer & rear speakers","Audio power: 580 W","Adaptive / optimized audio","Supports High-Resolution Audio with 4K pass-through","Compatible with AirPlay / Chromecast / Spotify Connect"]},
    {"name":"LG US40TR 4.1 Wireless Sound Bar","brand":"LG","price":249,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":9,"productUrl":"https://www.currys.co.uk/products/lg-us40tr-4.1-wireless-sound-bar-10281503.html","imageUrl":"https://media.currys.biz/i/currysprod/10281503?$g-small$&fmt=auto","specs":["Number of speakers: 5","Wireless subwoofer & rear speakers","Audio power: 400 W","Adaptive / optimized audio","HDMI / Optical"]},
    {"name":"BOSE Smart Ultra 5.1.2 Soundbar with Dolby Atmos & Amazon Alexa - Black","brand":"BOSE","price":629,"wasPrice":899,"savings":270,"rating":4.6,"reviewCount":32,"productUrl":"https://www.currys.co.uk/products/bose-smart-ultra-5.1.2-soundbar-with-dolby-atmos-and-amazon-alexa-black-10254954.html","imageUrl":"https://media.currys.biz/i/currysprod/M10254944_black?$g-small$&fmt=auto","specs":["Number of speakers: 5","Dolby Atmos","Chromecast built-in","HDMI / Optical","2 year guarantee"]},
    {"name":"BOSE TV Speaker","brand":"BOSE","price":269,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":502,"productUrl":"https://www.currys.co.uk/products/bose-tv-speaker-10207493.html","imageUrl":"https://media.currys.biz/i/currysprod/10207493?$g-small$&fmt=auto","specs":["HDMI / Optical","2 year guarantee"]},
    {"name":"BOSE Smart Compact Sound Bar with Dolby Atmos & Amazon Alexa","brand":"BOSE","price":499,"wasPrice":0,"savings":0,"rating":4.1,"reviewCount":18,"productUrl":"https://www.currys.co.uk/products/bose-smart-compact-sound-bar-with-dolby-atmos-and-amazon-alexa-10269117.html","imageUrl":"https://media.currys.biz/i/currysprod/10269117?$g-small$&fmt=auto","specs":["Number of speakers: 5","Dolby Atmos","Compatible with other Bose speakers / Chromecast / AirPlay","HDMI / Optical","2 year guarantee"]},
    {"name":"BOSE Smart Ultra 5.1.2 Soundbar with Dolby Atmos & Amazon Alexa - White","brand":"BOSE","price":629,"wasPrice":899,"savings":270,"rating":4.6,"reviewCount":32,"productUrl":"https://www.currys.co.uk/products/bose-smart-ultra-5.1.2-soundbar-with-dolby-atmos-and-amazon-alexa-white-10254944.html","imageUrl":"https://media.currys.biz/i/currysprod/M10254944_white?$g-small$&fmt=auto","specs":["Number of speakers: 5","Dolby Atmos","Chromecast built-in","HDMI / Optical","2 year guarantee"]},
    {"name":"BOSE Smart Ultra 5.1.2 Soundbar & Bass Module 700 (Black) Bundle","brand":"BOSE","price":1698,"wasPrice":0,"savings":0,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/bose-smart-ultra-5.1.2-soundbar-with-dolby-atmos-and-amazon-alexa-and-bass-module-700-black-bundle-10261769.html","imageUrl":"https://media.currys.biz/i/currysprod/10261769?$g-small$&fmt=auto","specs":["Number of speakers: 5","Dolby Atmos","Chromecast built-in","HDMI / Optical","2 year guarantee"]},
    {"name":"BOSE Smart Ultra 5.1.2 Soundbar & Bass Module 700 (White) Bundle","brand":"BOSE","price":1698,"wasPrice":0,"savings":0,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/bose-smart-ultra-5.1.2-soundbar-with-dolby-atmos-and-amazon-alexa-and-bass-module-700-white-bundle-10261770.html","imageUrl":"https://media.currys.biz/i/currysprod/10261770?$g-small$&fmt=auto","specs":["Number of speakers: 5","Dolby Atmos","Chromecast built-in","HDMI / Optical","2 year guarantee"]},
    {"name":"BOSE Smart Compact Sound Bar & Bass Module 500 Bundle","brand":"BOSE","price":948,"wasPrice":0,"savings":0,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/bose-smart-compact-sound-bar-and-bass-module-500-bundle-10291032.html","imageUrl":"https://media.currys.biz/i/currysprod/10291032?$g-small$&fmt=auto","specs":["Number of speakers: 5","Dolby Atmos","Compatible with other Bose speakers / Chromecast / AirPlay","HDMI / Optical","2 year guarantee"]}
  ],

  'speakers-hifi': [
    {"name":"MAJORITY Pulse 3 Portable Bluetooth Megasound Party Speaker - Black","brand":"MAJORITY","price":99,"wasPrice":199,"savings":100,"rating":4.7,"reviewCount":70,"productUrl":"https://www.currys.co.uk/products/majority-pulse-3-portable-bluetooth-megasound-party-speaker-black-10283851.html","imageUrl":"https://media.currys.biz/i/currysprod/10283851?$g-small$&fmt=auto","specs":["Bluetooth","LED party lights / Karaoke mode","Output power: 200 W","Up to 6 hours battery life","USB / Aux-in","3 year guarantee"]},
    {"name":"MAJORITY Pulse 1 Portable Bluetooth Megasound Party Speaker - Black","brand":"MAJORITY","price":49.99,"wasPrice":99.99,"savings":50,"rating":4.6,"reviewCount":79,"productUrl":"https://www.currys.co.uk/products/majority-pulse-1-portable-bluetooth-megasound-party-speaker-black-10283837.html","imageUrl":"https://media.currys.biz/i/currysprod/10283837?$g-small$&fmt=auto","specs":["LED party lights / Karaoke mode","Up to 10 hours battery life","Bluetooth","Aux-in / USB","3 year guarantee"]},
    {"name":"JBL Partybox 320 Bluetooth Megasound Party Speaker - Black","brand":"JBL","price":529,"wasPrice":0,"savings":0,"rating":4.9,"reviewCount":189,"productUrl":"https://www.currys.co.uk/products/jbl-partybox-320-bluetooth-megasound-party-speaker-black-10261824.html","imageUrl":"https://media.currys.biz/i/currysprod/M10261824_black?$g-small$&fmt=auto","specs":["Water resistant","JBL Original Pro Sound for powerful audio","LED party lights / Karaoke mode","Up to 18 hours battery life","Pair up to 100 speakers","2 year guarantee"]},
    {"name":"MARSHALL Middleton Portable Bluetooth Speaker - Black","brand":"MARSHALL","price":139.97,"wasPrice":259,"savings":119.03,"rating":5,"reviewCount":14,"productUrl":"https://www.currys.co.uk/products/marshall-middleton-portable-bluetooth-speaker-black-10248002.html","imageUrl":"https://media.currys.biz/i/currysprod/10248002?$g-small$&fmt=auto","specs":["Water resistant","Up to 20 hours battery life","Pair 100+ speakers","Bluetooth","2 year guarantee"]},
    {"name":"JBL Flip 7 Portable Bluetooth Speaker - Black","brand":"JBL","price":113,"wasPrice":129,"savings":16,"rating":4.9,"reviewCount":167,"productUrl":"https://www.currys.co.uk/products/jbl-flip-7-portable-bluetooth-speaker-black-10278564.html","imageUrl":"https://www.currys.biz/i/currysprod/M10278544_black?$g-small$&fmt=auto","specs":["Waterproof","JBL Pro Sound with AI Sound Boost","Up to 14 hours battery life","Pair 100+ speakers","Bluetooth","2 year guarantee"]},
    {"name":"JBL Partybox Club 120 Bluetooth Megasound Party Speaker - Black","brand":"JBL","price":349,"wasPrice":0,"savings":0,"rating":4.9,"reviewCount":196,"productUrl":"https://www.currys.co.uk/products/jbl-partybox-club-120-bluetooth-megasound-party-speaker-black-10261827.html","imageUrl":"https://media.currys.biz/i/currysprod/M10261827_black?$g-small$&fmt=auto","specs":["Water resistant","JBL Original Pro Sound for powerful audio","LED party lights / Karaoke mode","Up to 12 hours battery life","Pair up to 100 speakers","Bluetooth","Aux-in / 1/4 jack / USB smartphone charging","2 year guarantee"]},
    {"name":"LG xboom Grab Portable Bluetooth Speaker - Black","brand":"LG","price":79,"wasPrice":129,"savings":50,"rating":4.9,"reviewCount":17,"productUrl":"https://www.currys.co.uk/products/lg-xboom-grab-portable-bluetooth-speaker-black-10282591.html","imageUrl":"https://www.currys.biz/i/currysprod/M10282591_black?$g-small$&fmt=auto","specs":["Water resistant","Up to 20 hours battery life","Wirelessly connect to other Auracast speakers","Bluetooth","Aux-in"]},
    {"name":"MAJORITY Pulse 5 Portable Bluetooth Megasound Party Speaker - Black","brand":"MAJORITY","price":499,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":63,"productUrl":"https://www.currys.co.uk/products/majority-pulse-5-portable-bluetooth-megasound-party-speaker-black-10283852.html","imageUrl":"https://www.currys.biz/i/currysprod/10283852?$g-small$&fmt=auto","specs":["Bluetooth","LED party lights / Karaoke mode","Output power: 600 W","Up to 8 hours battery life","USB / Aux-in","3 year guarantee"]},
    {"name":"MARSHALL Acton III Bluetooth Speaker - Midnight Blue","brand":"MARSHALL","price":259,"wasPrice":0,"savings":0,"rating":5,"reviewCount":1,"productUrl":"https://www.currys.co.uk/products/marshall-acton-iii-bluetooth-speaker-midnight-blue-10283846.html","imageUrl":"https://www.currys.biz/i/currysprod/M10240152_blue?$g-small$&fmt=auto","specs":["Dynamic Loudness for rich & clear sound","Bluetooth","Aux-in","2 year guarantee"]},
    {"name":"SONY ULT FIELD 1 Portable Bluetooth Speaker - Black","brand":"SONY","price":89.99,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":185,"productUrl":"https://www.currys.co.uk/products/sony-ult-field-1-portable-bluetooth-speaker-black-10262651.html","imageUrl":"https://www.currys.biz/i/currysprod/M10262624_black?$g-small$&fmt=auto","specs":["Waterproof","Up to 12 hours battery life","Pair up to 2 speakers","Bluetooth"]},
    {"name":"JBL Xtreme 3 Portable Bluetooth Speaker - Black","brand":"JBL","price":179,"wasPrice":249,"savings":70,"rating":4.8,"reviewCount":239,"productUrl":"https://www.currys.co.uk/products/jbl-xtreme-3-portable-bluetooth-speaker-black-10283954.html","imageUrl":"https://www.currys.biz/i/currysprod/10283954?$g-small$&fmt=auto","specs":["Waterproof","JBL Pro Sound for powerful audio","Up to 15 hours battery life","Bluetooth","USB smartphone charging","2 year guarantee"]},
    {"name":"JVC UX-D327B Wireless Traditional Hi-Fi System - Black","brand":"JVC","price":79,"wasPrice":99,"savings":20,"rating":4.5,"reviewCount":1016,"productUrl":"https://www.currys.co.uk/products/jvc-uxd327b-wireless-traditional-hifi-system-black-10156009.html","imageUrl":"https://www.currys.biz/i/currysprod/10156009?$g-small$&fmt=auto","specs":["CD player","DAB / FM radio","Bluetooth","USB / Aux-in"]},
    {"name":"JBL Go 4 Portable Bluetooth Speaker - Black","brand":"JBL","price":39.99,"wasPrice":0,"savings":0,"rating":4.9,"reviewCount":309,"productUrl":"https://www.currys.co.uk/products/jbl-go-4-portable-bluetooth-speaker-black-10261760.html","imageUrl":"https://www.currys.biz/i/currysprod/M10261760_black?$g-small$&fmt=auto","specs":["Waterproof","JBL Pro Sound for powerful audio","Up to 7 hours battery life","Bluetooth","2 year guarantee"]},
    {"name":"JBL Boombox 3 WiFi Portable Wireless Speaker - Black","brand":"JBL","price":329.97,"wasPrice":549,"savings":219.03,"rating":4.8,"reviewCount":870,"productUrl":"https://www.currys.co.uk/products/jbl-boombox-3-wifi-portable-wireless-speaker-black-10251399.html","imageUrl":"https://www.currys.biz/i/currysprod/10251399?$g-small$&fmt=auto","specs":["Waterproof","Up to 24 hours battery life","Wirelessly connect to other Chromecast speakers","WiFi / Bluetooth / Apple AirPlay","USB smartphone charging","2 year guarantee"]},
    {"name":"HISENSE Party Storm Bluetooth Megasound Party Speaker - Black","brand":"HISENSE","price":169,"wasPrice":249,"savings":80,"rating":3.8,"reviewCount":5,"productUrl":"https://www.currys.co.uk/products/hisense-party-storm-bluetooth-megasound-party-speaker-black-10284343.html","imageUrl":"https://www.currys.biz/i/currysprod/10284343?$g-small$&fmt=auto","specs":["Bluetooth","LED party lights / Karaoke mode / DJ mode","Output power: 300 W","Up to 15 hours battery life","USB / Aux-in / Mic"]},
    {"name":"DENON DM-41DAB Wireless Traditional Hi-Fi System - Black","brand":"DENON","price":399,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":797,"productUrl":"https://www.currys.co.uk/products/denon-dm41dab-wireless-traditional-hifi-system-black-10193373.html","imageUrl":"https://www.currys.biz/i/currysprod/M10164499_black?$g-small$&fmt=auto","specs":["CD player","DAB / FM radio","Bluetooth","Output power: 60 W","Aux-in / RCA / Optical","2 year guarantee"]},
    {"name":"JVC RD-D325B Bluetooth Flat Panel Hi-Fi System - Dark Grey","brand":"JVC","price":99,"wasPrice":129,"savings":30,"rating":4.8,"reviewCount":11,"productUrl":"https://www.currys.co.uk/products/jvc-rdd325b-bluetooth-flat-panel-hifi-system-dark-grey-10275671.html","imageUrl":"https://www.currys.biz/i/currysprod/10275671?$g-small$&fmt=auto","specs":["CD player & DAB+ / FM radio","Bluetooth","Output power: 10 W","USB / RCA"]},
    {"name":"BOSE SoundLink Flex (2nd Gen) Portable Bluetooth Speaker - Black","brand":"BOSE","price":119,"wasPrice":149,"savings":30,"rating":4.8,"reviewCount":284,"productUrl":"https://www.currys.co.uk/products/bose-soundlink-flex-2nd-gen-portable-bluetooth-speaker-black-10268804.html","imageUrl":"https://www.currys.biz/i/currysprod/M10268793_black?$g-small$&fmt=auto","specs":["Waterproof","Up to 12 hours battery life","Pair up to 2 speakers","Bluetooth","2 year guarantee"]},
    {"name":"SONOS Era 100 Wireless Multi-room Speaker with Amazon Alexa - White","brand":"SONOS","price":199,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":86,"productUrl":"https://www.currys.co.uk/products/sonos-era-100-wireless-multiroom-speaker-with-amazon-alexa-white-10247701.html","imageUrl":"https://www.currys.biz/i/currysprod/10247701?$g-small$&fmt=auto","specs":["Wirelessly connect to other Sonos speakers","WiFi / Bluetooth / Apple AirPlay 2","USB Type-C port","2 year guarantee"]},
    {"name":"JVC XS-D629BM 2.0 Bluetooth Bookshelf Speakers - Walnut","brand":"JVC","price":99.99,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":485,"productUrl":"https://www.currys.co.uk/products/jvc-xsd629bm-2.0-bluetooth-bookshelf-speakers-walnut-10189179.html","imageUrl":"https://www.currys.biz/i/currysprod/10189179?$g-small$&fmt=auto","specs":["Output power: 60 W","Bluetooth","RCA / USB","Bass & treble EQ","Includes remote control"]}
  ],

  headphones: [
    {"name":"SAMSUNG Galaxy Buds4 Pro Wireless Bluetooth Noise-Cancelling Earbuds - Black","brand":"SAMSUNG","price":219,"wasPrice":0,"savings":0,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/samsung-galaxy-buds4-pro-wireless-bluetooth-noisecancelling-earbuds-black-10299058.html","imageUrl":"https://media.currys.biz/i/currysprod/M10299058_black?$g-small$&fmt=auto","specs":["True wireless earbuds","Active noise-cancelling","Battery life: Up to 7 hours (30 hours with case)","Water & sweat resistant (IP57)","Microphone / volume / playback & functions control"]},
    {"name":"SAMSUNG Galaxy Buds4 Wireless Bluetooth Noise-Cancelling Earbuds - White","brand":"SAMSUNG","price":159,"wasPrice":0,"savings":0,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/samsung-galaxy-buds4-wireless-bluetooth-noisecancelling-earbuds-white-10299090.html","imageUrl":"https://media.currys.biz/i/currysprod/M10299090_white?$g-small$&fmt=auto","specs":["True wireless earbuds","Active noise-cancelling","Battery life: Up to 6 hours (30 hours with case)","Water & sweat resistant (IP54)","Microphone / volume / playback & functions control"]},
    {"name":"SONY WH-1000XM6 Wireless Bluetooth Noise-Cancelling Headphones - Black","brand":"SONY","price":399,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":175,"productUrl":"https://www.currys.co.uk/products/sony-wh1000xm6-wireless-bluetooth-noisecancelling-headphones-black-10282441.html","imageUrl":"https://media.currys.biz/i/currysprod/M10282426_black?$g-small$&fmt=auto","specs":["Over-ear headphones","Active noise-cancelling","Battery life: Up to 30 hours","Quick charging","Microphone / volume / playback & functions control"]},
    {"name":"SOUNDCORE Q21i Wireless Bluetooth Noise-Cancelling Headphones - Black","brand":"SOUNDCORE","price":59.99,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":494,"productUrl":"https://www.currys.co.uk/products/soundcore-q21i-wireless-bluetooth-noisecancelling-headphones-black-10280657.html","imageUrl":"https://media.currys.biz/i/currysprod/10280657?$g-small$&fmt=auto","specs":["Over-ear headphones","Active noise-cancelling","Battery life: Up to 40 hours","Bluetooth multipoint for switching between devices","Support for High-Resolution Audio","Microphone / volume / playback & functions control","2 year guarantee"]},
    {"name":"SOUNDCORE AeroClip Wireless Bluetooth Earbuds - White","brand":"SOUNDCORE","price":129.99,"wasPrice":0,"savings":0,"rating":4,"reviewCount":26,"productUrl":"https://www.currys.co.uk/products/soundcore-aeroclip-wireless-bluetooth-earbuds-white-10294392.html","imageUrl":"https://media.currys.biz/i/currysprod/10294392?$g-small$&fmt=auto","specs":["True wireless open-ear clip-on earbuds","Battery life: Up to 8 hours (32 hours with case)","Water & sweat resistant (IPX4)","Bluetooth multipoint for switching between devices","Support for High-Resolution Audio","Microphone / volume / playback & functions control","2 year guarantee"]},
    {"name":"SONY WH-CH720N Wireless Bluetooth Noise-Cancelling Headphones - Black","brand":"SONY","price":69.99,"wasPrice":74.99,"savings":5,"rating":4.5,"reviewCount":1970,"productUrl":"https://www.currys.co.uk/products/sony-whch720n-wireless-bluetooth-noisecancelling-headphones-black-10247676.html","imageUrl":"https://media.currys.biz/i/currysprod/M10247673_Black?$g-small$&fmt=auto","specs":["Over-ear headphones","Active noise-cancelling with quick attention mode","Battery life: Up to 35 hours","Bluetooth multipoint for switching between devices","Quick charging","Microphone / volume / playback & functions control"]},
    {"name":"JBL Tune 720BT Wireless Bluetooth Headphones - Black","brand":"JBL","price":38,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":242,"productUrl":"https://www.currys.co.uk/products/jbl-tune-720bt-wireless-bluetooth-headphones-black-10254754.html","imageUrl":"https://media.currys.biz/i/currysprod/M10254754_black?$g-small$&fmt=auto","specs":["Over-ear headphones","Battery life: Up to 76 hours","Bluetooth multipoint for switching between devices","Microphone / volume / playback & functions control","2 year guarantee"]},
    {"name":"APPLE AirPods Pro 3 - White","brand":"APPLE","price":219,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":233,"productUrl":"https://www.currys.co.uk/products/apple-airpods-pro-3-white-10291174.html","imageUrl":"https://media.currys.biz/i/currysprod/10291174?$g-small$&fmt=auto","specs":["True wireless earbuds","Adjustable active noise-cancelling","Battery life: Up to 8 hours","Water & sweat resistant (IP57)","Qi wireless charging compatible","Quick charging","Microphone / volume / playback & functions control"]},
    {"name":"BOSE QuietComfort Ultra Wireless Bluetooth Noise-Cancelling Headphones - Black","brand":"BOSE","price":299,"wasPrice":449,"savings":150,"rating":4.7,"reviewCount":487,"productUrl":"https://www.currys.co.uk/products/bose-quietcomfort-ultra-wireless-bluetooth-noisecancelling-headphones-black-10254908.html","imageUrl":"https://media.currys.biz/i/currysprod/M10254905_black?$g-small$&fmt=auto","specs":["Over-ear headphones","Active noise-cancelling with quick attention mode","Battery life: Up to 24 hours","Noise-cancelling mics for clear calls","Foldable","Microphone / volume / playback & functions control","2 year guarantee"]},
    {"name":"APPLE AirPods 4 with Active Noise Cancellation - White","brand":"APPLE","price":169,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":302,"productUrl":"https://www.currys.co.uk/products/apple-airpods-4-with-active-noise-cancellation-white-10270519.html","imageUrl":"https://media.currys.biz/i/currysprod/10270519?$g-small$&fmt=auto","specs":["True wireless earbuds","Adjustable active noise-cancelling","Battery life: Up to 4 hours (20 hours with case)","Water & sweat resistant (IP54)","Qi wireless charging compatible","Microphone / playback & functions control"]},
    {"name":"JBL Live Beam 3 Wireless Bluetooth Noise-Cancelling Earbuds - Black","brand":"JBL","price":149,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":111,"productUrl":"https://www.currys.co.uk/products/jbl-live-beam-3-wireless-bluetooth-noisecancelling-earbuds-black-10275466.html","imageUrl":"https://media.currys.biz/i/currysprod/M10275466_black?$g-small$&fmt=auto","specs":["True wireless earbuds","Active noise-cancelling with quick attention mode","Battery life: Up to 10 hours (40 hours with case)","Water & sweat resistant (IP55)","Bluetooth multipoint for switching between devices","Microphone / playback & functions control"]},
    {"name":"SONY WH-CH520C Wireless Bluetooth Headphones - Beige","brand":"SONY","price":34.99,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":222,"productUrl":"https://www.currys.co.uk/products/sony-whch520c-wireless-bluetooth-headphones-beige-10247635.html","imageUrl":"https://media.currys.biz/i/currysprod/M10247634_Cream?$g-small$&fmt=auto","specs":["On-ear headphones","Passive noise-isolating","Battery life: Up to 50 hours","Bluetooth multipoint for switching between devices","Quick charging","Microphone / volume / playback & functions control"]},
    {"name":"BOSE QuietComfort Ultra Wireless Bluetooth Noise-Cancelling Earbuds - Black","brand":"BOSE","price":199,"wasPrice":299,"savings":100,"rating":4.7,"reviewCount":487,"productUrl":"https://www.currys.co.uk/products/bose-quietcomfort-ultra-wireless-bluetooth-noisecancelling-earbuds-black-10254893.html","imageUrl":"https://media.currys.biz/i/currysprod/M10254893_black?$g-small$&fmt=auto","specs":["True wireless earbuds","Adjustable active noise-cancelling","Battery life: Up to 6 hours (24 hours with case)","Water & sweat resistant (IPX4)","Extra controls on the app","Noise-cancelling mics for clear calls","Microphone / volume / playback & functions control","2 year guarantee"]},
    {"name":"SONY WH-CH520L Wireless Bluetooth Headphones - Blue","brand":"SONY","price":34.99,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":303,"productUrl":"https://www.currys.co.uk/products/sony-whch520l-wireless-bluetooth-headphones-blue-10247634.html","imageUrl":"https://media.currys.biz/i/currysprod/M10247634_blue?$g-small$&fmt=auto","specs":["On-ear headphones","Passive noise-isolating","Battery life: Up to 50 hours","Bluetooth multipoint for switching between devices","Quick charging","Microphone / volume / playback & functions control"]},
    {"name":"APPLE AirPods 4 - White","brand":"APPLE","price":119,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":749,"productUrl":"https://www.currys.co.uk/products/apple-airpods-4-white-10270517.html","imageUrl":"https://media.currys.biz/i/currysprod/10270517?$g-small$&fmt=auto","specs":["True wireless earbuds","Battery life: Up to 5 hours (30 hours with case)","Water & sweat resistant (IP54)","Quick charging","Microphone / playback & functions control"]}
  ],

  'dvd-blu-ray': [
    {"name":"SONY DVPSR760HB DVD Player","brand":"SONY","price":39,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":2873,"productUrl":"https://www.currys.co.uk/products/sony-dvpsr760hb-dvd-player-12872098.html","imageUrl":"https://media.currys.biz/i/currysprod/12872098?$g-small$&fmt=auto","specs":["Plays DVDs","HDMI"]},
    {"name":"PANASONIC DP-UB159EB 4K Ultra HD Blu-ray & DVD Player","brand":"PANASONIC","price":149.99,"wasPrice":0,"savings":0,"rating":4.5,"reviewCount":235,"productUrl":"https://www.currys.co.uk/products/panasonic-dpub159eb-4k-ultra-hd-bluray-and-dvd-player-10191562.html","imageUrl":"https://media.currys.biz/i/currysprod/10191562?$g-small$&fmt=auto","specs":["Plays 4K Blu-ray discs / DVDs","HDR: HDR10+ / HDR10 / Hybrid Log-Gamma (HLG)","Supports Dolby Atmos / DTS: X / High-Resolution Audio","Ethernet","4K pass-through"]},
    {"name":"PANASONIC DMR-EX97EB-K DVD Player with Freeview HD Recorder - 500 GB HDD","brand":"PANASONIC","price":279,"wasPrice":319,"savings":40,"rating":4.5,"reviewCount":888,"productUrl":"https://www.currys.co.uk/products/panasonic-dmrex97ebk-dvd-player-with-freeview-hd-recorder-500-gb-hdd-10138707.html","imageUrl":"https://media.currys.biz/i/currysprod/10138707?$g-small$&fmt=auto","specs":["Plays DVDs","Records to HDD","Up to 258 hours of SD / 129 hours HD recording","Ethernet"]},
    {"name":"PANASONIC DMR-PWT655EB Smart 3D Blu-ray & DVD Player with Freeview Play Recorder - 1 TB HDD","brand":"PANASONIC","price":359,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":438,"productUrl":"https://www.currys.co.uk/products/panasonic-dmrpwt655eb-smart-3d-bluray-and-dvd-player-with-freeview-play-recorder-1-tb-hdd-10139364.html","imageUrl":"https://media.currys.biz/i/currysprod/10139364?$g-small$&fmt=auto","specs":["Plays Blu-ray discs / DVDs with upscaling","Records to HDD","Up to 518 hours of SD / 259 hours HD recording","Catch-up TV & Streaming","WiFi / Ethernet"]},
    {"name":"SONY UBPX700KB.CEK Smart 4K Ultra HD Blu-ray & DVD Player","brand":"SONY","price":269,"wasPrice":0,"savings":0,"rating":4.9,"reviewCount":9,"productUrl":"https://www.currys.co.uk/products/sony-ubpx700kb.cek-smart-4k-ultra-hd-bluray-and-dvd-player-10284393.html","imageUrl":"https://media.currys.biz/i/currysprod/10284393?$g-small$&fmt=auto","specs":["Plays Blu-ray discs / DVDs with upscaling","HDR: Dolby Vision / HDR10","Supports Dolby Atmos / DTS: X / High-Resolution Audio","HDMI / USB","4K pass-through"]},
    {"name":"PANASONIC DP-UB820EBK Smart 4K Ultra HD Blu-ray & DVD Player","brand":"PANASONIC","price":349,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":616,"productUrl":"https://www.currys.co.uk/products/panasonic-dpub820ebk-smart-4k-ultra-hd-bluray-and-dvd-player-10179416.html","imageUrl":"https://media.currys.biz/i/currysprod/10179416?$g-small$&fmt=auto","specs":["Plays 4K Blu-ray discs / DVDs","HDR: Dolby Vision","Supports High-Resolution Audio","Catch-up TV & 4K Streaming","WiFi / Bluetooth","4K pass-through"]},
    {"name":"OAKCASTLE DVD175 Portable DVD Player - Black","brand":"OAKCASTLE","price":119,"wasPrice":0,"savings":0,"rating":5,"reviewCount":41,"productUrl":"https://www.currys.co.uk/products/oakcastle-dvd175-portable-dvd-player-black-10258694.html","imageUrl":"https://media.currys.biz/i/currysprod/10258694?$g-small$&fmt=auto","specs":["15.6\" screen","Up to 6 hours battery life","USB / Memory card slot","Includes car charger","3 year guarantee"]},
    {"name":"PANASONIC DP-UB450EB 4K Ultra HD Blu-ray & DVD Player","brand":"PANASONIC","price":199,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":206,"productUrl":"https://www.currys.co.uk/products/panasonic-dpub450eb-4k-ultra-hd-bluray-and-dvd-player-10191561.html","imageUrl":"https://media.currys.biz/i/currysprod/10191561?$g-small$&fmt=auto","specs":["Plays 4K Blu-ray discs / DVDs","HDR: Dolby Vision / HDR10+ / HDR10 / Hybrid Log-Gamma (HLG)","Supports Dolby Atmos / DTS: X / High-Resolution Audio","Ethernet","4K pass-through"]},
    {"name":"PANASONIC DMP-BDT167EB Smart 3D Blu-ray & DVD Player","brand":"PANASONIC","price":79.99,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":1023,"productUrl":"https://www.currys.co.uk/products/panasonic-dmpbdt167eb-smart-3d-bluray-and-dvd-player-10143726.html","imageUrl":"https://media.currys.biz/i/currysprod/10143726?$g-small$&fmt=auto","specs":["Plays Blu-ray discs / DVDs","Catch-up TV & Streaming","Ethernet"]},
    {"name":"MAJORITY Scholars SCH-DVD-BLK UK DVD Player","brand":"MAJORITY","price":27.99,"wasPrice":0,"savings":0,"rating":4.9,"reviewCount":885,"productUrl":"https://www.currys.co.uk/products/majority-scholars-schdvdblk-uk-dvd-player-10241742.html","imageUrl":"https://media.currys.biz/i/currysprod/10241742?$g-small$&fmt=auto","specs":["Plays DVDs","HDMI / USB","3 year guarantee"]},
    {"name":"OAKCASTLE DVD120 Portable DVD Player - Black","brand":"OAKCASTLE","price":90,"wasPrice":0,"savings":0,"rating":5,"reviewCount":32,"productUrl":"https://www.currys.co.uk/products/oakcastle-dvd120-portable-dvd-player-black-10258693.html","imageUrl":"https://media.currys.biz/i/currysprod/10258693?$g-small$&fmt=auto","specs":["10.5\" screen","Up to 5 hours battery life","USB / Memory card slot","Includes car charger","3 year guarantee"]},
    {"name":"GROOV-E GVDP01BK Portable DVD Player - Black","brand":"GROOV-E","price":69,"wasPrice":79.99,"savings":10.99,"rating":3.5,"reviewCount":2,"productUrl":"https://www.currys.co.uk/products/groove-gvdp01bk-portable-dvd-player-black-10285336.html","imageUrl":"https://media.currys.biz/i/currysprod/10285336?$g-small$&fmt=auto","specs":["7\" screen","Up to 2.5 hours battery life","USB / Memory card slot","Includes car charger"]},
    {"name":"PANASONIC DMR-BWT850EB Smart 3D Blu-ray & DVD Player - 1 TB HDD","brand":"PANASONIC","price":549,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":370,"productUrl":"https://www.currys.co.uk/products/panasonic-dmrbwt850eb-smart-3d-bluray-and-dvd-player-1-tb-hdd-10143734.html","imageUrl":"https://media.currys.biz/i/currysprod/10143734?$g-small$&fmt=auto","specs":["Plays Blu-ray discs / DVDs with upscaling","Records to HDD","Up to 518 hours of SD / 259 hours HD recording","Catch-up TV & Streaming","WiFi / Ethernet"]},
    {"name":"GROOV-E GVDP03BK Multi Regional DVD Player","brand":"GROOV-E","price":33.98,"wasPrice":33.99,"savings":0.01,"rating":2.6,"reviewCount":7,"productUrl":"https://www.currys.co.uk/products/groove-gvdp03bk-multi-regional-dvd-player-10285338.html","imageUrl":"https://media.currys.biz/i/currysprod/10285338?$g-small$&fmt=auto","specs":["Plays DVDs","HDMI / USB"]},
    {"name":"LEXIBOOK DVDP6PA Portable DVD Player - Paw Patrol","brand":"LEXIBOOK","price":84.99,"wasPrice":0,"savings":0,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/lexibook-dvdp6pa-portable-dvd-player-paw-patrol-10218845.html","imageUrl":"https://media.currys.biz/i/currysprod/10218845?$g-small$&fmt=auto","specs":["7\" screen","USB port","Includes car charger"]},
    {"name":"GROOV-E GVDP02BK Portable DVD Player - Black","brand":"GROOV-E","price":89.99,"wasPrice":100,"savings":10.01,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/groove-gvdp02bk-portable-dvd-player-black-10285337.html","imageUrl":"https://media.currys.biz/i/currysprod/10285337?$g-small$&fmt=auto","specs":["10.1\" screen","Up to 2.5 hours battery life","USB / Memory card slot","Includes car charger"]},
    {"name":"SONY BDP-S1700/K Blu-ray & DVD Player","brand":"SONY","price":79,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":33,"productUrl":"https://www.currys.co.uk/products/sony-bdps1700k-bluray-and-dvd-player-10284401.html","imageUrl":"https://media.currys.biz/i/currysprod/10284401?$g-small$&fmt=auto","specs":["Plays Blu-ray discs / DVDs with upscaling","Supports High-Resolution Audio","HDMI / USB"]},
    {"name":"LEXIBOOK DVDP6AV Portable DVD Player - Avengers","brand":"LEXIBOOK","price":95,"wasPrice":0,"savings":0,"rating":5,"reviewCount":2,"productUrl":"https://www.currys.co.uk/products/lexibook-dvdp6av-portable-dvd-player-avengers-10218847.html","imageUrl":"https://media.currys.biz/i/currysprod/10218847?$g-small$&fmt=auto","specs":["7\" screen","USB port","Includes car charger","2 year guarantee"]}
  ],

  'digital-smart-tv': [
    {"name":"HUMAX Aura EZ FHR-6000T Freely Smart 4K Ultra HD Digital TV Recorder - 2 TB","brand":"HUMAX","price":249.99,"wasPrice":0,"savings":0,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/humax-aura-ez-fhr6000t-freely-smart-4k-ultra-hd-digital-tv-recorder-2-tb-10290616.html","imageUrl":"https://media.currys.biz/i/currysprod/10290616?$g-small$&fmt=auto","specs":[]},
    {"name":"FREESAT UHD-X Smart 4K Ultra HD Set Top Box","brand":"FREESAT","price":99,"wasPrice":129.99,"savings":30.99,"rating":4.3,"reviewCount":4130,"productUrl":"https://www.currys.co.uk/products/freesat-uhdx-smart-4k-ultra-hd-set-top-box-10207047.html","imageUrl":"https://media.currys.biz/i/currysprod/10207047?$g-small$&fmt=auto","specs":[]},
    {"name":"MANHATTAN T4-R Freeview Play 4K Ultra HD Digital TV Recorder - 500 GB","brand":"MANHATTAN","price":169.99,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":131,"productUrl":"https://www.currys.co.uk/products/manhattan-t4r-freeview-play-4k-ultra-hd-digital-tv-recorder-500-gb-10251001.html","imageUrl":"https://media.currys.biz/i/currysprod/10251001?$g-small$&fmt=auto","specs":[]},
    {"name":"AMAZON Fire TV Stick 4K Max (2025) with Alexa Voice Remote","brand":"AMAZON","price":69.99,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":2357,"productUrl":"https://www.currys.co.uk/products/amazon-fire-tv-stick-4k-max-2025-with-alexa-voice-remote-10275955.html","imageUrl":"https://media.currys.biz/i/currysprod/10275955?$g-small$&fmt=auto","specs":[]},
    {"name":"AMAZON Fire TV Stick 4K Select (2025) with Alexa Voice Remote","brand":"AMAZON","price":49.99,"wasPrice":0,"savings":0,"rating":3.7,"reviewCount":20,"productUrl":"https://www.currys.co.uk/products/amazon-fire-tv-stick-4k-select-2025-with-alexa-voice-remote-10292571.html","imageUrl":"https://media.currys.biz/i/currysprod/10292571?$g-small$&fmt=auto","specs":[]},
    {"name":"ROKU HD Streaming Stick","brand":"ROKU","price":29.99,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":33,"productUrl":"https://www.currys.co.uk/products/roku-hd-streaming-stick-10286603.html","imageUrl":"https://media.currys.biz/i/currysprod/10286603?$g-small$&fmt=auto","specs":[]},
    {"name":"MANHATTAN T4 Freeview Play Smart 4K Ultra HD Set Top Box","brand":"MANHATTAN","price":69.99,"wasPrice":0,"savings":0,"rating":4.4,"reviewCount":27,"productUrl":"https://www.currys.co.uk/products/manhattan-t4-freeview-play-smart-4k-ultra-hd-set-top-box-10250515.html","imageUrl":"https://media.currys.biz/i/currysprod/10250515?$g-small$&fmt=auto","specs":[]},
    {"name":"AMAZON Fire TV Stick HD with Alexa Voice Remote (2024)","brand":"AMAZON","price":39.99,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":36,"productUrl":"https://www.currys.co.uk/products/amazon-fire-tv-stick-hd-with-alexa-voice-remote-2024-10272322.html","imageUrl":"https://media.currys.biz/i/currysprod/10272322?$g-small$&fmt=auto","specs":[]},
    {"name":"AMAZON Fire TV Stick 4K Plus (2nd Gen) with Alexa Voice Remote","brand":"AMAZON","price":59.99,"wasPrice":0,"savings":0,"rating":0,"reviewCount":0,"productUrl":"https://www.currys.co.uk/products/amazon-fire-tv-stick-4k-plus-2nd-gen-with-alexa-voice-remote-10297976.html","imageUrl":"https://media.currys.biz/i/currysprod/10297976?$g-small$&fmt=auto","specs":[]},
    {"name":"GOOGLE TV Streamer 4K - Porcelain","brand":"GOOGLE","price":99.99,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":27,"productUrl":"https://www.currys.co.uk/products/google-tv-streamer-4k-porcelain-10271847.html","imageUrl":"https://media.currys.biz/i/currysprod/10271847?$g-small$&fmt=auto","specs":[]},
    {"name":"MANHATTAN SX Freesat HD Set Top Box","brand":"MANHATTAN","price":72.99,"wasPrice":0,"savings":0,"rating":4.6,"reviewCount":1090,"productUrl":"https://www.currys.co.uk/products/manhattan-sx-freesat-hd-set-top-box-10178725.html","imageUrl":"https://media.currys.biz/i/currysprod/10178725?$g-small$&fmt=auto","specs":[]},
    {"name":"FREESAT UHD-4X Smart 4K Ultra HD Digital TV Recorder - 500 GB","brand":"FREESAT","price":229.99,"wasPrice":0,"savings":0,"rating":4.3,"reviewCount":4130,"productUrl":"https://www.currys.co.uk/products/freesat-uhd4x-smart-4k-ultra-hd-digital-tv-recorder-500-gb-10207036.html","imageUrl":"https://media.currys.biz/i/currysprod/10207036?$g-small$&fmt=auto","specs":[]},
    {"name":"ROKU Streaming Stick 4K","brand":"ROKU","price":49.99,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":1105,"productUrl":"https://www.currys.co.uk/products/roku-streaming-stick-4k-10234065.html","imageUrl":"https://media.currys.biz/i/currysprod/10234065?$g-small$&fmt=auto","specs":[]},
    {"name":"AMAZON Fire TV Stick 4K with Alexa Voice Remote (2024)","brand":"AMAZON","price":59.99,"wasPrice":0,"savings":0,"rating":4.7,"reviewCount":2357,"productUrl":"https://www.currys.co.uk/products/amazon-fire-tv-stick-4k-with-alexa-voice-remote-2024-10272200.html","imageUrl":"https://media.currys.biz/i/currysprod/10272200?$g-small$&fmt=auto","specs":[]},
    {"name":"APPLE TV 4K (3rd generation) - 64 GB","brand":"APPLE","price":139,"wasPrice":0,"savings":0,"rating":4.8,"reviewCount":161,"productUrl":"https://www.currys.co.uk/products/apple-tv-4k-3rd-generation-64-gb-10244890.html","imageUrl":"https://media.currys.biz/i/currysprod/10244890?$g-small$&fmt=auto","specs":[]}
  ]
};

// tv-accessories has no fresh data to merge -- include it for normalization only
// (empty array means: normalize existing products, don't add new ones)
FRESH_DATA['tv-accessories'] = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract product ID from a Currys product URL.
 * e.g. "https://www.currys.co.uk/products/some-product-name-10282178.html" => "10282178"
 * Also handles legacy IDs like "12872098".
 */
function extractProductId(url) {
  if (!url) return null;
  const match = url.match(/(\d{7,8})\.html$/);
  return match ? match[1] : null;
}

/**
 * Count how many "meaningful" fields a product has filled.
 * Used to decide whether fresh data is richer than existing data.
 */
function richness(product) {
  let score = 0;
  if (product.specs && product.specs.length > 0) score += product.specs.length;
  if (product.rating && product.rating > 0) score += 2;
  if (product.reviewCount && product.reviewCount > 0) score += 1;
  if (product.wasPrice && product.wasPrice > 0) score += 1;
  if (product.savings && product.savings > 0) score += 1;
  if (product.badges && product.badges.length > 0) score += 1;
  if (product.offers && product.offers.length > 0) score += 1;
  if (product.imageUrl) score += 1;
  return score;
}

/**
 * Normalize a product object to the canonical schema.
 * - Renames `url` to `productUrl`
 * - Adds missing fields with defaults
 * - Normalizes wasPrice/savings (0 => null for consistency with existing data where appropriate, but we keep numeric)
 */
function normalizeProduct(product) {
  const normalized = { ...product };

  // Rename url -> productUrl
  if (normalized.url && !normalized.productUrl) {
    normalized.productUrl = normalized.url;
  }
  delete normalized.url;

  // Ensure all required fields exist with defaults
  if (normalized.name === undefined) normalized.name = '';
  if (normalized.brand === undefined) normalized.brand = '';
  if (normalized.price === undefined) normalized.price = 0;
  if (normalized.wasPrice === undefined || normalized.wasPrice === 0) normalized.wasPrice = null;
  if (normalized.savings === undefined || normalized.savings === 0) normalized.savings = null;
  if (normalized.rating === undefined) normalized.rating = 0;
  if (normalized.reviewCount === undefined) normalized.reviewCount = 0;
  if (normalized.productUrl === undefined) normalized.productUrl = '';
  if (normalized.imageUrl === undefined) normalized.imageUrl = '';
  if (normalized.badges === undefined) normalized.badges = [];
  if (normalized.deliveryFree === undefined) normalized.deliveryFree = false;
  if (normalized.specs === undefined) normalized.specs = [];
  if (normalized.energyRating === undefined) normalized.energyRating = null;
  if (normalized.offers === undefined) normalized.offers = [];

  return normalized;
}

/**
 * Sort products: brand ascending (case-insensitive), then price ascending.
 */
function sortProducts(products) {
  return products.sort((a, b) => {
    const brandA = (a.brand || '').toUpperCase();
    const brandB = (b.brand || '').toUpperCase();
    if (brandA < brandB) return -1;
    if (brandA > brandB) return 1;
    return (a.price || 0) - (b.price || 0);
  });
}

// ---------------------------------------------------------------------------
// Main processing
// ---------------------------------------------------------------------------

const CATEGORY_FILES = {
  soundbars: 'soundbars.json',
  headphones: 'headphones.json',
  'speakers-hifi': 'speakers-hifi.json',
  'tv-accessories': 'tv-accessories.json',
  'dvd-blu-ray': 'dvd-blu-ray.json',
  'digital-smart-tv': 'digital-smart-tv.json'
};

const results = [];

for (const [categoryKey, filename] of Object.entries(CATEGORY_FILES)) {
  const filePath = path.join(DATA_DIR, filename);

  // 1. Read existing JSON
  let existingData;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    existingData = JSON.parse(raw);
  } catch (err) {
    console.error(`[ERROR] Could not read ${filePath}: ${err.message}`);
    continue;
  }

  const existingProducts = existingData.products || [];
  const freshProducts = FRESH_DATA[categoryKey] || [];

  console.log(`\n--- ${categoryKey} (${filename}) ---`);
  console.log(`  Existing products: ${existingProducts.length}`);
  console.log(`  Fresh products:    ${freshProducts.length}`);

  // 2. Build a map of existing products by ID
  const productMap = new Map();

  for (const product of existingProducts) {
    const url = product.productUrl || product.url || '';
    const id = extractProductId(url);
    if (id) {
      productMap.set(id, normalizeProduct(product));
    } else {
      // Product without a parseable ID -- keep it but normalize
      const fallbackKey = `__no_id_${productMap.size}`;
      productMap.set(fallbackKey, normalizeProduct(product));
    }
  }

  // 3. Merge fresh products (prefer fresh if richer)
  let freshAdded = 0;
  let freshUpdated = 0;
  let freshSkipped = 0;

  for (const freshProduct of freshProducts) {
    const url = freshProduct.productUrl || freshProduct.url || '';
    const id = extractProductId(url);
    if (!id) {
      console.warn(`  [WARN] Could not extract product ID from: ${url}`);
      continue;
    }

    const normalizedFresh = normalizeProduct(freshProduct);

    if (productMap.has(id)) {
      // Duplicate -- compare richness
      const existing = productMap.get(id);
      if (richness(normalizedFresh) >= richness(existing)) {
        // Preserve fields from existing that fresh might not have
        // (e.g. badges, deliveryFree, offers from original scrape)
        const merged = {
          ...existing,
          ...normalizedFresh,
          // Keep existing badges if fresh has none
          badges: normalizedFresh.badges && normalizedFresh.badges.length > 0
            ? normalizedFresh.badges
            : existing.badges || [],
          // Keep existing deliveryFree if fresh doesn't specify
          deliveryFree: normalizedFresh.deliveryFree !== undefined
            ? normalizedFresh.deliveryFree
            : existing.deliveryFree,
          // Keep existing offers if fresh has none
          offers: normalizedFresh.offers && normalizedFresh.offers.length > 0
            ? normalizedFresh.offers
            : existing.offers || [],
          // Keep existing energyRating if fresh doesn't have one
          energyRating: normalizedFresh.energyRating !== null
            ? normalizedFresh.energyRating
            : existing.energyRating
        };
        productMap.set(id, merged);
        freshUpdated++;
      } else {
        // Existing is richer -- keep existing but still normalize
        freshSkipped++;
      }
    } else {
      // New product
      productMap.set(id, normalizedFresh);
      freshAdded++;
    }
  }

  console.log(`  Fresh added:   ${freshAdded}`);
  console.log(`  Fresh updated: ${freshUpdated}`);
  console.log(`  Fresh skipped: ${freshSkipped} (existing was richer)`);

  // 4. Collect all products, sort, and write back
  const allProducts = sortProducts(Array.from(productMap.values()));

  console.log(`  Final products: ${allProducts.length}`);

  // 5. Update the JSON (preserve all metadata, only update products + totalProducts)
  existingData.products = allProducts;
  existingData.totalProducts = allProducts.length;

  // 6. Write file
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2) + '\n', 'utf8');
  console.log(`  Written to: ${filePath}`);

  results.push({
    category: categoryKey,
    file: filename,
    existingCount: existingProducts.length,
    freshCount: freshProducts.length,
    added: freshAdded,
    updated: freshUpdated,
    skipped: freshSkipped,
    finalCount: allProducts.length
  });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n============================================');
console.log('             BUILD SUMMARY');
console.log('============================================');
console.log('');

const header = 'Category'.padEnd(20) +
  'Existing'.padStart(10) +
  'Fresh'.padStart(8) +
  'Added'.padStart(8) +
  'Updated'.padStart(10) +
  'Skipped'.padStart(10) +
  'Final'.padStart(8);

console.log(header);
console.log('-'.repeat(header.length));

for (const r of results) {
  console.log(
    r.category.padEnd(20) +
    String(r.existingCount).padStart(10) +
    String(r.freshCount).padStart(8) +
    String(r.added).padStart(8) +
    String(r.updated).padStart(10) +
    String(r.skipped).padStart(10) +
    String(r.finalCount).padStart(8)
  );
}

console.log('');
console.log('All categories processed successfully.');
