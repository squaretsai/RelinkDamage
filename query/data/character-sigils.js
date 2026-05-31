const RELINK_CHARACTER_SIGILS = {
  "meta": {
    "title": "Relink 個人專屬因子資料庫",
    "lastUpdated": "2026-05-31",
    "translationPolicy": "已由本機遊戲官方繁中文字串表校正因子名稱；量化數值仍保留外部資料整理補充。"
  },
  "sources": [
    {
      "label": "Local game text tables: system/table/text/ct/text.msg",
      "url": "local:Granblue Fantasy Relink"
    },
    {
      "label": "GameFAQs Character-Specific Sigils",
      "url": "https://gamefaqs.gamespot.com/ps5/308486-granblue-fantasy-relink/faqs/82470/character-specific-sigils"
    },
    {
      "label": "Granblue Fantasy Relink Wiki",
      "url": "https://relink.gbf.wiki/"
    }
  ],
  "characters": [
    {
      "id": "gran-djeeta",
      "nameEn": "Gran / Djeeta",
      "nameZh": "葛蘭 / 吉塔",
      "roleZh": "主角",
      "sigils": [
        {
          "nameEn": "Fearless Drive",
          "nameZh": "英勇強驅",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "增加位階戰藝所產生之技能的冷卻時間縮短量。<br>專用。",
          "values": [
            "Arts Lv.II: 冷卻 -1%",
            "Arts Lv.III: 冷卻 -1.5%",
            "Arts Lv.IV: 冷卻 -2%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Fearless Spirit",
          "nameZh": "英勇氣場",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "Class Lv越高，攻擊力和防禦力越高。<br>專用。",
          "values": [
            "Arts Lv.II: ATK/DEF +10%",
            "Arts Lv.III: ATK/DEF +15%",
            "Arts Lv.IV: ATK/DEF +20%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Fearless Soul+",
          "nameZh": "英勇之魂＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Fearless Drive 與 Fearless Spirit 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Fearless Heart",
          "nameZh": "英勇之心",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "每當Class Lv上升，強化給予傷害，<br>並持續至Class Lv回到Class I。<br>專用。",
          "values": [
            "Arts Lv.II: 傷害 +5%",
            "Arts Lv.III: 傷害 +7%",
            "Arts Lv.IV: 傷害 +10%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "katalina",
      "nameEn": "Katalina",
      "nameZh": "卡塔莉娜",
      "roleZh": "劍士 / 召喚 Ares",
      "sigils": [
        {
          "nameEn": "Guardian's Conviction",
          "nameZh": "守護者的決心",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "召喚艾瑞斯的期間，攻擊被賦予追擊效果，<br>並且提升傷害上限。<br>卡塔莉娜專用。",
          "values": [
            "追擊: 造成基礎傷害 10%",
            "傷害上限 +15%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Guardian's Honor",
          "nameZh": "守護者的傲氣",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "艾瑞斯召喚中，縮短技能的冷卻時間。<br>卡塔莉娜專用。",
          "values": [
            "技能冷卻 -5%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Guardian's Awakening+",
          "nameZh": "守護者的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Guardian's Conviction 與 Guardian's Honor 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Guardian's Warpath",
          "nameZh": "守護者的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "奧義發動時賦予我方全體追加效果。<br>卡塔莉娜專用。",
          "values": [
            "Blades of Frost: Debuff Immunity 45 秒",
            "Realm of Ice: 額外 Enhanced DMG +25%，45 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "rackam",
      "nameEn": "Rackam",
      "nameZh": "拉卡姆",
      "roleZh": "遠程射擊",
      "sigils": [
        {
          "nameEn": "Helmsman's Navigation",
          "nameZh": "操舵士的引領",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "攻擊從3連射變成4連射。<br>拉卡姆專用。",
          "values": [
            "子彈 +1"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Helmsman's Tenacity",
          "nameZh": "操舵士的骨氣",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "增加攻擊的射程距離，<br>並且提升傷害上限。<br>拉卡姆專用。",
          "values": [
            "攻擊距離 +50%",
            "傷害上限 +25%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Helmsman's Awakening+",
          "nameZh": "操舵士的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Helmsman's Navigation 與 Helmsman's Tenacity 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Helmsman's Warpath",
          "nameZh": "操舵士的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "一定時間內成功發動3次節奏扳機，便會賦予給予傷害強化效果。<br>拉卡姆專用。",
          "values": [
            "Enhanced DMG +20%，15 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "io",
      "nameEn": "Io",
      "nameZh": "伊歐",
      "roleZh": "魔法蓄力",
      "sigils": [
        {
          "nameEn": "Mage's Aspiration",
          "nameZh": "魔導士的心願",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "縮短攻擊的蓄力時間。<br>伊歐專用。",
          "values": [
            "蓄力時間 -30%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Mage's Savvy",
          "nameZh": "魔導士的機智",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升高速詠唱狀態下進行攻擊時的傷害上限。<br>伊歐專用。",
          "values": [
            "傷害上限 +50%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Mage's Awakening+",
          "nameZh": "魔導士的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Mage's Aspiration 與 Mage's Savvy 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Mage's Warpath",
          "nameZh": "魔導士的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "在魔力漩渦Lv最大值的蓄力攻擊後，一定時間內<br>賦予給予傷害強化效果。並且有機率無須消耗魔力漩渦，<br>此時還會被賦予全神貫注效果。伊歐專用。",
          "values": [
            "Enhanced DMG +15%，15 秒",
            "50% 機率不消耗 Mystic Vortex 珠"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "eugen",
      "nameEn": "Eugen",
      "nameZh": "尤金",
      "roleZh": "狙擊 / 榴彈",
      "sigils": [
        {
          "nameEn": "Veteran's Insight",
          "nameZh": "老兵的智慧",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升攻擊的威力。<br>尤金專用。",
          "values": [
            "造成傷害 +100%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Veteran's Vision",
          "nameZh": "老兵的慧眼",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "瞄準模式時，縮短攻擊的攻擊間隔。<br>尤金專用。",
          "values": [
            "攻擊間隔 -20%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Veteran's Awakening+",
          "nameZh": "老兵的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Veteran's Insight 與 Veteran's Vision 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Veteran's Warpath",
          "nameZh": "老兵的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "強化瞄準模式中的蓄力攻擊，<br>以及使用該攻擊引爆的榴彈給予傷害。<br>尤金專用。",
          "values": [
            "Enhanced DMG +25%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "rosetta",
      "nameEn": "Rosetta",
      "nameZh": "蘿賽塔",
      "roleZh": "玫瑰設置 / 增益",
      "sigils": [
        {
          "nameEn": "Rose's Blooming",
          "nameZh": "薔薇早開",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "縮短已配置薔薇的攻擊間隔。<br>蘿賽塔專用。",
          "values": [
            "攻擊間隔 -30%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Rose's Profusion",
          "nameZh": "薔薇繚亂",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升薔薇賦予的強化效果性能。<br>蘿賽塔專用。",
          "values": [
            "ATK +10%",
            "DEF +10%",
            "Regen 回復量 +2%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Rose's Awakening+",
          "nameZh": "薔薇的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Rose's Blooming 與 Rose's Profusion 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Rose's Warpath",
          "nameZh": "薔薇的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "提升薔薇量條的減少速度，相對地強化配置薔薇所賦予的<br>各種狀態和自動攻擊的給予傷害。<br>蘿賽塔專用。",
          "values": [
            "玫瑰量表減少速度 +200%",
            "ATK +15% / DEF +15% / Regen +3%",
            "玫瑰自動攻擊 Enhanced DMG +100%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "charlotta",
      "nameEn": "Charlotta",
      "nameZh": "夏綠蒂",
      "roleZh": "高速連擊 / Noble Stance",
      "sigils": [
        {
          "nameEn": "Holy Knight's Luster",
          "nameZh": "聖騎士的劍光",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當在高潔戰勢狀態下使用連按攻擊命中敵人，<br>便會縮短技能的冷卻時間。<br>夏綠蒂專用。",
          "values": [
            "每次命中技能冷卻 -0.5%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Holy Knight's Grandeur",
          "nameZh": "聖騎士的威風",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "若配合敵人的攻擊並抓準時機進行攻擊，<br>便會賦予無敵效果和攻擊UP效果。<br>夏綠蒂專用。",
          "values": [
            "無敵 5 秒",
            "ATK +30%，15 秒"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Holy Knight's Awakening+",
          "nameZh": "聖騎士的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Holy Knight's Luster 與 Holy Knight's Grandeur 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Holy Knight's Warpath",
          "nameZh": "聖騎士的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "在高潔戰勢狀態下發動高貴戰略後，可維持狀態持續攻擊。<br>並且在高潔戰勢狀態下強化給予傷害。<br>夏綠蒂專用。",
          "values": [
            "Noble Stance 攻擊 Enhanced DMG +10%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "ghandagoza",
      "nameEn": "Ghandagoza",
      "nameZh": "剛特克澤",
      "roleZh": "拳鬥 / Eternal Rage",
      "sigils": [
        {
          "nameEn": "Eternal Rage's Mettle",
          "nameZh": "古今無雙的風範",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升攻擊的爆擊機率。<br>依照古今無雙流Lv，強化效果。<br>剛特克澤專用。",
          "values": [
            "暴擊率: Eternal Rage 等級 x 10%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Eternal Rage's Ethos",
          "nameZh": "古今無雙的能人",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升攻擊的傷害上限。<br>剛特克澤專用。",
          "values": [
            "傷害上限 +50%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Eternal Rage's Awakening+",
          "nameZh": "古今無雙的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Eternal Rage's Mettle 與 Eternal Rage's Ethos 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Eternal Rage's Warpath",
          "nameZh": "古今無雙的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "蓄力時間變長，相對地強化正拳擊的給予傷害。<br>剛特克澤專用。",
          "values": [
            "蓄力時間 +100%",
            "Enhanced DMG +100%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "ferry",
      "nameEn": "Ferry",
      "nameZh": "菲莉",
      "roleZh": "使魔 / Onslaught",
      "sigils": [
        {
          "nameEn": "Phantasm's Concord",
          "nameZh": "幽幻羈絆",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升寵物的給予傷害，一定機率賦予寵物的攻擊<br>攻擊DOWN和防禦DOWN效果。<br>菲莉專用。",
          "values": [
            "傷害 +30%",
            "25% 機率賦予 ATK -20% 與 DEF -20%，10 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Phantasm's Harmony",
          "nameZh": "幽幻呼應",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "依照召喚出的寵物數量，提升放開時的<br>攻擊所給予的傷害上限，命中時縮短技能的冷卻時間。<br>菲莉專用。",
          "values": [
            "每隻使魔傷害上限 +15%",
            "每隻使魔技能冷卻 -2%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Phantasm's Awakening+",
          "nameZh": "幽幻的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Phantasm's Concord 與 Phantasm's Harmony 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Phantasm's Warpath",
          "nameZh": "幽幻的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "使用攻擊發動所有寵物的總攻擊命中敵人時，<br>一定時間內賦予給予傷害強化效果，<br>並且寵物們有一定機率不會消失。菲莉專用。",
          "values": [
            "Enhanced DMG +15%，15 秒",
            "50% 機率使魔不被遣散"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "narmaya",
      "nameEn": "Narmaya",
      "nameZh": "娜魯梅亞",
      "roleZh": "架式切換 / 蝴蝶",
      "sigils": [
        {
          "nameEn": "Butterfly's Grace",
          "nameZh": "斬姬夢幻",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "增加連技終擊、連結攻擊賦予的蝴蝶數量。<br>娜魯梅亞專用。",
          "values": [
            "蝴蝶 +1"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Butterfly's Valor",
          "nameZh": "斬姬武藝",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "一定機率不會消耗蝴蝶。<br>娜魯梅亞專用。",
          "values": [
            "50% 機率觸發"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Butterfly's Awakening+",
          "nameZh": "斬姬的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Butterfly's Grace 與 Butterfly's Valor 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Butterfly's Warpath",
          "nameZh": "斬姬的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "降低奧義量條上升量，相對地精準切換架式時，<br>一定時間內賦予給予傷害強化效果、追擊效果。<br>娜魯梅亞專用。",
          "values": [
            "奧義量表獲得量 -50%",
            "Enhanced DMG +15%，15 秒",
            "追擊 10%，15 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "lancelot",
      "nameEn": "Lancelot",
      "nameZh": "蘭斯洛特",
      "roleZh": "雙劍連擊 / 閃避",
      "sigils": [
        {
          "nameEn": "White Dragon's Oath",
          "nameZh": "白龍的誓約",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升攻擊的威力，延長移動距離。<br>蘭斯洛特專用。",
          "values": [
            "傷害 +50%",
            "移動距離 +25%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "White Dragon's Glory",
          "nameZh": "白龍的驕傲",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當攻擊持續命中敵人，所有攻擊的威力便會逐漸上升。<br>但若攻擊間隔超過2.5秒，則會重置效果。<br>蘭斯洛特專用。",
          "values": [
            "造成傷害最高 +50%",
            "重置窗口 2.5 秒"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "White Dragon's Awakening+",
          "nameZh": "白龍的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 White Dragon's Oath 與 White Dragon's Glory 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "White Dragon's Warpath",
          "nameZh": "白龍的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "連技終擊命中時或渦旋迅風中精準閃避成功時，<br>一定時間內賦予給予傷害強化效果。<br>蘭斯洛特專用。",
          "values": [
            "Enhanced DMG +10%，30 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "vane",
      "nameEn": "Vane",
      "nameZh": "范恩",
      "roleZh": "防禦 / Beatdown",
      "sigils": [
        {
          "nameEn": "Hero's Creed",
          "nameZh": "勇士的信念",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當連技終擊命中敵人，便會賦予受到傷害減少效果。<br>范恩專用。",
          "values": [
            "受到傷害 -20%，15 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Hero's Will",
          "nameZh": "勇士的毅力",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當連技終擊命中敵人，便會縮短技能的冷卻時間。<br>范恩專用。",
          "values": [
            "技能冷卻 -3%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Hero's Awakening+",
          "nameZh": "勇士的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Hero's Creed 與 Hero's Will 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Hero's Warpath",
          "nameZh": "勇士的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "強化攻擊的給予傷害，<br>並且使用不會消耗衝擊量條的攻擊進行防禦時，<br>增加衝擊量條的上升量。范恩專用。",
          "values": [
            "Enhanced DMG +30%",
            "Beatdown 量表 +12.5%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "percival",
      "nameEn": "Percival",
      "nameZh": "帕西瓦爾",
      "roleZh": "Schlacht 蓄力 / 招架",
      "sigils": [
        {
          "nameEn": "Lord's Procession",
          "nameZh": "王者的行進",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升攻擊蓄力時的移動速度，<br>並且提升傷害上限。<br>帕西瓦爾專用。",
          "values": [
            "移動速度 +20%",
            "傷害上限 +50%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Lord's Ambition",
          "nameZh": "王者的堅定",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "蓄力反制成功時，<br>回復些許HP，並在一定時間內提升攻擊力。<br>帕西瓦爾專用。",
          "values": [
            "回復最大 HP 8%",
            "ATK +30%，15 秒"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Lord's Awakening+",
          "nameZh": "王者的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Lord's Procession 與 Lord's Ambition 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Lord's Warpath",
          "nameZh": "王者的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "縮短蓄力成功時強化給予傷害，<br>蓄力反制成功時，一定時間內賦予追擊效果。<br>帕西瓦爾專用。",
          "values": [
            "Enhanced DMG +30%",
            "追擊 10%，30 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "siegfried",
      "nameEn": "Siegfried",
      "nameZh": "齊格菲",
      "roleZh": "精準輸入連段",
      "sigils": [
        {
          "nameEn": "Dragonslayer's Dominance",
          "nameZh": "屠龍的勇猛",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當精準複合技命中敵人，<br>便會在一定時間內提升防禦力，受到敵人攻擊時也不會畏怯。<br>齊格菲專用。",
          "values": [
            "DEF +20%，10 秒",
            "不會被敵方攻擊打斷"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Dragonslayer's Ingenuity",
          "nameZh": "屠龍的才智",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "將連技連結到最後，便會縮短技能的冷卻時間。<br>齊格菲專用。",
          "values": [
            "連段終結技: 技能冷卻 -3%",
            "完美執行額外: 技能冷卻 -5%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Dragonslayer's Awakening+",
          "nameZh": "屠龍的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Dragonslayer's Dominance 與 Dragonslayer's Ingenuity 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Dragonslayer's Warpath",
          "nameZh": "屠龍的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "防禦力減少，相對地強化精準攻擊（/攻擊）的給予傷害。<br>齊格菲專用。",
          "values": [
            "Enhanced DMG +40%",
            "DEF -50%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "cagliostro",
      "nameEn": "Cagliostro",
      "nameZh": "卡莉歐斯托蘿",
      "roleZh": "鍊金 / Collapse",
      "sigils": [
        {
          "nameEn": "Founder's Strategy",
          "nameZh": "極致計略",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當以蓄集至最大的攻擊命中敵人，<br>使敵人陷入防禦DOWN狀態。<br>卡莉歐斯托蘿專用。",
          "values": [
            "DEF -30%，15 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Founder's Truth",
          "nameZh": "極致真理",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當連技終擊命中敵人，便會縮短技能的冷卻時間。<br>卡莉歐斯托蘿專用。",
          "values": [
            "技能冷卻 -3%"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Founder's Awakening+",
          "nameZh": "極致的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Founder's Strategy 與 Founder's Truth 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Founder's Warpath",
          "nameZh": "極致的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "連技終擊時，一定時間內賦予給予傷害強化效果。<br>每當在效果時間中使用不同的連技終擊命中敵人，<br>便會進一步提升效果。卡莉歐斯托蘿專用。",
          "values": [
            "Enhanced DMG +10%，20 秒",
            "命中不同終結技後改為 Enhanced DMG +15%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "yodarha",
      "nameEn": "Yodarha",
      "nameZh": "尤達爾拉哈",
      "roleZh": "連段 / Triple Shroud",
      "sigils": [
        {
          "nameEn": "Swordmaster's Prowess",
          "nameZh": "變化自如的快刀",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當連技終擊命中敵人，便會提升攻擊力。<br>連技中斷，就會重置強化效果。<br>尤達爾拉哈專用。",
          "values": [
            "ATK +30%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Swordmaster's Art",
          "nameZh": "變化自如的妖劍士",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "一定機率不會消耗幕。<br>尤達爾拉哈專用。",
          "values": [
            "75% 機率觸發"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Swordmaster's Awakening+",
          "nameZh": "變化自如的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Swordmaster's Prowess 與 Swordmaster's Art 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Swordmaster's Warpath",
          "nameZh": "變化自如的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "使用劍戟殘心縮短連技到達最短狀態時，強化給予傷害。<br>尤達爾拉哈專用。",
          "values": [
            "Enhanced DMG +30%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "zeta",
      "nameEn": "Zeta",
      "nameZh": "瑟塔",
      "roleZh": "空中連段 / Arvess Fermare",
      "sigils": [
        {
          "nameEn": "Crimson's Clout",
          "nameZh": "鮮紅的氣焰",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升亞爾貝斯‧菲爾瑪雷的效果量。<br>瑟塔專用。",
          "values": [
            "造成傷害 +25%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Crimson's Flight",
          "nameZh": "鮮紅的翔舞",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "在跳躍狀態下的連技攻擊變得容易成功。<br>瑟塔專用。",
          "values": [
            "延長高跳迴圈銜接判定窗口"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Crimson's Awakening+",
          "nameZh": "鮮紅的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Crimson's Clout 與 Crimson's Flight 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Crimson's Warpath",
          "nameZh": "鮮紅的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "反擊成功時賦予對象亞爾貝斯‧菲爾瑪雷效果，<br>並且對陷入亞爾貝斯‧菲爾瑪雷狀態的敵人進行攻擊時，<br>強化給予傷害和提升爆擊機率。瑟塔專用。",
          "values": [
            "Enhanced DMG +15%",
            "暴擊率 +100%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "vaseraga",
      "nameEn": "Vaseraga",
      "nameZh": "巴薩拉加",
      "roleZh": "蓄力重擊 / Grynoth",
      "sigils": [
        {
          "nameEn": "Ebony's Presence",
          "nameZh": "冥闇的鋼刃",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升格羅諾斯量條的維持時間。<br>巴薩拉加專用。",
          "values": [
            "Grynoth 量表減少前時間 +100%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Ebony's Poise",
          "nameZh": "冥闇的自若",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "每當蓄力攻擊命中敵人，<br>便會依照攻擊縮短技能的冷卻時間。<br>巴薩拉加專用。",
          "values": [
            "技能冷卻 -0.6% 至 -8%（最大蓄力）"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Ebony's Awakening+",
          "nameZh": "冥闇的覺醒＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Ebony's Presence 與 Ebony's Poise 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Ebony's Warpath",
          "nameZh": "冥闇的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "格羅諾斯量條為1以上時，可按下消耗HP使量條上升，<br>並且，一定時間內賦予給予傷害強化效果。<br>巴薩拉加專用。",
          "values": [
            "消耗 30% HP 填充 Grynoth 量表",
            "Enhanced DMG +30%，45 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "seofon",
      "nameEn": "Seofon",
      "nameZh": "席耶提",
      "roleZh": "DLC / Avatar / Swordshine",
      "sigils": [
        {
          "nameEn": "Spirit Edge's Rally",
          "nameZh": "劍聖的練氣",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "劍神召喚中使用技能，則劍光Lv上升。<br>席耶提專用。",
          "values": [
            "Swordshine 等級 +12.5%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Spirit Edge's Fury",
          "nameZh": "劍聖的閃刃",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "劍神召喚中，提升攻擊力/暈眩值/傷害上限。<br>席耶提專用。",
          "values": [
            "ATK +30%",
            "Stun Power +30%",
            "傷害上限 +50%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Seven-Star Boundary",
          "nameZh": "盡涯的七星",
          "type": "boundary",
          "typeZh": "境界因子",
          "maxLevel": 15,
          "descriptionZh": "最大HP上限變成45000，相對地攻擊力和傷害上限會上升。<br>席耶提專用。",
          "values": [
            "最大 HP 固定 45000",
            "ATK +50%",
            "傷害上限 +100%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Spirit Edge's Warpath",
          "nameZh": "劍聖的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "每當與劍神的聯手攻擊「衍生終擊」命中敵人，<br>便會在一定時間內賦予自身多種強化效果。<br>席耶提專用。",
          "values": [
            "Enhanced DMG +20%",
            "Stout Heart",
            "Debuff Immunity",
            "Drain 30 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "tweyen",
      "nameEn": "Tweyen",
      "nameZh": "蘇恩",
      "roleZh": "DLC / 弓 / Ultrasight",
      "sigils": [
        {
          "nameEn": "Dark Huntress's Volley",
          "nameZh": "魔眼的萬箭",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "在魔眼Lv最大值的狀態下施放蓄滿的多重鎖定射擊，<br>便會在一定時間內賦予給予傷害強化效果，<br>並且一定機率賦予追擊效果。蘇恩專用。",
          "values": [
            "Enhanced DMG +10%，30 秒",
            "30% 機率觸發追擊，30 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Dark Huntress's Surge",
          "nameZh": "魔眼的凜翔",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升一般攻擊的連射速度，以及射擊時的移動速度。<br>蘇恩專用。",
          "values": [
            "射速 +10%",
            "射擊中移動速度 +15%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Two-Crown Boundary",
          "nameZh": "盡涯的二王",
          "type": "boundary",
          "typeZh": "境界因子",
          "maxLevel": 15,
          "descriptionZh": "最大HP上限變成45000，相對地攻擊力和傷害上限會上升。<br>蘇恩專用。",
          "values": [
            "最大 HP 固定 45000",
            "ATK +50%",
            "傷害上限 +100%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Dark Huntress's Warpath",
          "nameZh": "魔眼的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "縮短蓄力攻擊的蓄力時間，強化給予傷害和提升暈眩值。<br>並且一定機率使敵人陷入弱化狀態。<br>蘇恩專用。",
          "values": [
            "蓄力時間 -20%",
            "Enhanced DMG +20%",
            "20% 機率賦予 ATK Down、DEF Down、Burn 或 Poison"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "sandalphon",
      "nameEn": "Sandalphon",
      "nameZh": "聖德芬",
      "roleZh": "DLC / Archangel Gauge",
      "sigils": [
        {
          "nameEn": "Supreme Primarch's Awe",
          "nameZh": "天司長的靈威",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "提升精準攻擊（/攻擊）的傷害上限，<br>增加命中時天司量條的上升量。<br>聖德芬專用。",
          "values": [
            "傷害上限 +20%",
            "量表獲得量 +20%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Supreme Primarch's Nimbus",
          "nameZh": "天司長的風雅",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "極彩之羽狀態結束後回復HP，<br>並且在一定時間內賦予防禦UP效果。<br>聖德芬專用。",
          "values": [
            "回復 HP 50%",
            "DEF +20%，30 秒"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Ain+",
          "nameZh": "Ain＋",
          "type": "boundary",
          "typeZh": "境界因子",
          "maxLevel": 15,
          "descriptionZh": "將最大 HP 固定為 45000，換取攻擊力與傷害上限提升。",
          "values": [
            "最大 HP 固定 45000",
            "ATK +50%",
            "傷害上限 +100%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Supreme Primarch's Warpath",
          "nameZh": "天司長的戰氣",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "精準閃避成功時，增加天司量條上升量/回復量。<br>並且，極彩之羽狀態時還會被賦予給予傷害強化效果。<br>聖德芬專用。",
          "values": [
            "量表獲得量 +20%",
            "Enhanced DMG +25%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    },
    {
      "id": "id",
      "nameEn": "Id",
      "nameZh": "伊度",
      "roleZh": "Versalis Gauge / Dragonform / Godmight",
      "sigils": [
        {
          "nameEn": "Versalis Foundation",
          "nameZh": "替身增長",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "增加攻擊所產生之替身量條的上升量。<br>伊度專用。",
          "values": [
            "Versalis 量表獲得量 +25%"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Versalis Ignition",
          "nameZh": "替身破敵",
          "type": "unique",
          "typeZh": "專屬因子",
          "maxLevel": 15,
          "descriptionZh": "神威一體狀態時，賦予吸收效果和畏怯無效，<br>並提升傷害上限。<br>伊度專用。",
          "values": [
            "以造成傷害 10% 回復 HP",
            "傷害上限 +30%",
            "Stout Heart"
          ],
          "acquisitionZh": "金章交換",
          "translationStatus": "official",
          "notesZh": "官方繁中說明已套用，量化數值仍為整理補充。"
        },
        {
          "nameEn": "Versalis Soul+",
          "nameZh": "替身之魂＋",
          "type": "awakening",
          "typeZh": "覺醒合併因子",
          "maxLevel": 15,
          "descriptionZh": "同時獲得 Versalis Foundation 與 Versalis Ignition 的效果。",
          "values": [
            "取得時即為最大效果"
          ],
          "acquisitionZh": "因子鍊成 / 轉換",
          "translationStatus": "official"
        },
        {
          "nameEn": "Versalis Heart",
          "nameZh": "替身之心",
          "type": "warpath",
          "typeZh": "戰氣因子",
          "maxLevel": 15,
          "descriptionZh": "提升替身量條的減少速度，相對地在龍人化狀態和神威一體狀態中，<br>賦予給予傷害強化效果，並且可維持變身狀態直到量條歸零。<br>伊度專用。",
          "values": [
            "Dragonform/Godmight 中 Versalis 量表消耗 +200%",
            "Dragonform/Godmight 中 Enhanced DMG +10%",
            "量表耗盡前不能變身或解除變身"
          ],
          "acquisitionZh": "謝洛萬事屋交換",
          "translationStatus": "official",
          "notesZh": "來源表列名稱為 Versalis Heart，分類上納入戰氣查詢。 / 官方繁中說明已套用，量化數值仍為整理補充。"
        }
      ]
    }
  ]
};
