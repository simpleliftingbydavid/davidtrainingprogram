// ============================================================
// DAVID COACHING — Món mới cho chế độ tự ghi món (11 chất trên 100 g, đúng trạng thái như tên)
// ============================================================
// SINH TỰ ĐỘNG bởi scripts/usda/build-micros.mjs từ scripts/foreign/extra-map.json. Đừng sửa tay.
// Mỗi món lấy cả 11 chất từ MỘT dòng nguồn (USDA SR Legacy, Bảng Úc hoặc Bảng Na Uy), ghi mã gốc.
// null = nguồn không có số liệu chất đó (không đoán). approved false: học viên chưa thấy món này.
// Không thuộc FOODS: trình tạo thực đơn tự động không dùng các món này.

export const EXTRA_FOODS = Object.freeze([
 {
  "name": "Má đùi gà phi lê (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 121,
   "protein": 19.7,
   "carb": 0,
   "fat": 4.1,
   "fiber": 0,
   "potassium": 242,
   "sodium": 95,
   "calcium": 7,
   "magnesium": 23,
   "iron": 0.81,
   "zinc": 1.58
  },
  "note": "Thịt đùi gà bỏ da, bỏ xương (má đùi phi lê): cùng dòng USDA với Đùi gà bỏ da.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173627",
   "name": "Chicken, broilers or fryers, dark meat, thigh, meat only, raw"
  }
 },
 {
  "name": "Sụn ức gà (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 54,
   "protein": 12.5,
   "carb": 0.4,
   "fat": 0.4,
   "fiber": 0,
   "potassium": 170,
   "sodium": 390,
   "calcium": 47,
   "magnesium": 15,
   "iron": 0.3,
   "zinc": 0.3
  },
  "note": "Bảng Nhật (MEXT, bản 8): sụn ức gà sống. Chất xơ là số ước tính (0) của bảng.",
  "approved": true,
  "source": {
   "db": "JP",
   "id": "11236",
   "name": "にわとり [副品目] 軟骨 生 (chicken breast cartilage, raw)"
  }
 },
 {
  "name": "Nho khô",
  "group": "CARB",
  "values": {
   "kcal": 301,
   "protein": 3.3,
   "carb": 80,
   "fat": 0.2,
   "fiber": 3.3,
   "potassium": 746,
   "sodium": 24,
   "calcium": 64,
   "magnesium": 35,
   "iron": 0.98,
   "zinc": 0.37
  },
  "note": "USDA: nho khô vàng, không hạt.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168164",
   "name": "Raisins, golden, seedless"
  }
 },
 {
  "name": "Dưa lưới",
  "group": "CARB",
  "values": {
   "kcal": 34,
   "protein": 0.8,
   "carb": 8.2,
   "fat": 0.2,
   "fiber": 0.9,
   "potassium": 267,
   "sodium": 16,
   "calcium": 9,
   "magnesium": 12,
   "iron": 0.21,
   "zinc": 0.18
  },
  "note": "USDA: dưa cantaloupe.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169092",
   "name": "Melons, cantaloupe, raw"
  }
 },
 {
  "name": "Đào",
  "group": "CARB",
  "values": {
   "kcal": 39,
   "protein": 0.9,
   "carb": 9.5,
   "fat": 0.3,
   "fiber": 1.5,
   "potassium": 190,
   "sodium": 0,
   "calcium": 6,
   "magnesium": 9,
   "iron": 0.25,
   "zinc": 0.17
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169928",
   "name": "Peaches, yellow, raw"
  }
 },
 {
  "name": "Lê",
  "group": "CARB",
  "values": {
   "kcal": 57,
   "protein": 0.4,
   "carb": 15.2,
   "fat": 0.1,
   "fiber": 3.1,
   "potassium": 116,
   "sodium": 1,
   "calcium": 9,
   "magnesium": 7,
   "iron": 0.18,
   "zinc": 0.1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169118",
   "name": "Pears, raw"
  }
 },
 {
  "name": "Dâu tây",
  "group": "CARB",
  "values": {
   "kcal": 32,
   "protein": 0.7,
   "carb": 7.7,
   "fat": 0.3,
   "fiber": 2,
   "potassium": 153,
   "sodium": 1,
   "calcium": 16,
   "magnesium": 13,
   "iron": 0.41,
   "zinc": 0.14
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167762",
   "name": "Strawberries, raw"
  }
 },
 {
  "name": "Việt quất",
  "group": "CARB",
  "values": {
   "kcal": 57,
   "protein": 0.7,
   "carb": 14.5,
   "fat": 0.3,
   "fiber": 2.4,
   "potassium": 77,
   "sodium": 1,
   "calcium": 6,
   "magnesium": 6,
   "iron": 0.28,
   "zinc": 0.16
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171711",
   "name": "Blueberries, raw"
  }
 },
 {
  "name": "Chanh vàng (bỏ vỏ)",
  "group": "CARB",
  "values": {
   "kcal": 29,
   "protein": 1.1,
   "carb": 9.3,
   "fat": 0.3,
   "fiber": 2.8,
   "potassium": 138,
   "sodium": 2,
   "calcium": 26,
   "magnesium": 8,
   "iron": 0.6,
   "zinc": 0.06
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167746",
   "name": "Lemons, raw, without peel"
  }
 },
 {
  "name": "Chanh xanh",
  "group": "CARB",
  "values": {
   "kcal": 30,
   "protein": 0.7,
   "carb": 10.5,
   "fat": 0.2,
   "fiber": 2.8,
   "potassium": 102,
   "sodium": 2,
   "calcium": 33,
   "magnesium": 6,
   "iron": 0.6,
   "zinc": 0.11
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168155",
   "name": "Limes, raw"
  }
 },
 {
  "name": "Chanh dây (ruột)",
  "group": "CARB",
  "values": {
   "kcal": 97,
   "protein": 2.2,
   "carb": 23.4,
   "fat": 0.7,
   "fiber": 10.4,
   "potassium": 348,
   "sodium": 28,
   "calcium": 12,
   "magnesium": 29,
   "iron": 1.6,
   "zinc": 0.1
  },
  "note": "USDA: chanh dây tím.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169108",
   "name": "Passion-fruit, (granadilla), purple, raw"
  }
 },
 {
  "name": "Kiwi xanh",
  "group": "CARB",
  "values": {
   "kcal": 61,
   "protein": 1.1,
   "carb": 14.7,
   "fat": 0.5,
   "fiber": 3,
   "potassium": 312,
   "sodium": 3,
   "calcium": 34,
   "magnesium": 17,
   "iron": 0.31,
   "zinc": 0.14
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168153",
   "name": "Kiwifruit, green, raw"
  }
 },
 {
  "name": "Lựu",
  "group": "CARB",
  "values": {
   "kcal": 83,
   "protein": 1.7,
   "carb": 18.7,
   "fat": 1.2,
   "fiber": 4,
   "potassium": 236,
   "sodium": 3,
   "calcium": 10,
   "magnesium": 12,
   "iron": 0.3,
   "zinc": 0.35
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169134",
   "name": "Pomegranates, raw"
  }
 },
 {
  "name": "Sung tây (tươi)",
  "group": "CARB",
  "values": {
   "kcal": 74,
   "protein": 0.8,
   "carb": 19.2,
   "fat": 0.3,
   "fiber": 2.9,
   "potassium": 232,
   "sodium": 1,
   "calcium": 35,
   "magnesium": 17,
   "iron": 0.37,
   "zinc": 0.15
  },
  "note": "USDA: sung Âu (fig); quả sung Việt Nam là loài khác.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173021",
   "name": "Figs, raw"
  }
 },
 {
  "name": "Chà là khô",
  "group": "CARB",
  "values": {
   "kcal": 277,
   "protein": 1.8,
   "carb": 75,
   "fat": 0.2,
   "fiber": 6.7,
   "potassium": 696,
   "sodium": 1,
   "calcium": 64,
   "magnesium": 54,
   "iron": 0.9,
   "zinc": 0.44
  },
  "note": "USDA: chà là Medjool.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168191",
   "name": "Dates, medjool"
  }
 },
 {
  "name": "Mận tây",
  "group": "CARB",
  "values": {
   "kcal": 46,
   "protein": 0.7,
   "carb": 11.4,
   "fat": 0.3,
   "fiber": 1.4,
   "potassium": 157,
   "sodium": 0,
   "calcium": 6,
   "magnesium": 7,
   "iron": 0.17,
   "zinc": 0.1
  },
  "note": "USDA: mận Âu (plum); không phải mận hồng đào Việt Nam.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169949",
   "name": "Plums, raw"
  }
 },
 {
  "name": "Mơ",
  "group": "CARB",
  "values": {
   "kcal": 48,
   "protein": 1.4,
   "carb": 11.1,
   "fat": 0.4,
   "fiber": 2,
   "potassium": 259,
   "sodium": 1,
   "calcium": 13,
   "magnesium": 10,
   "iron": 0.39,
   "zinc": 0.2
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171697",
   "name": "Apricots, raw"
  }
 },
 {
  "name": "Anh đào (cherry)",
  "group": "CARB",
  "values": {
   "kcal": 63,
   "protein": 1.1,
   "carb": 16,
   "fat": 0.2,
   "fiber": 2.1,
   "potassium": 222,
   "sodium": 0,
   "calcium": 13,
   "magnesium": 11,
   "iron": 0.36,
   "zinc": 0.07
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171719",
   "name": "Cherries, sweet, raw"
  }
 },
 {
  "name": "Nam việt quất (cranberry)",
  "group": "CARB",
  "values": {
   "kcal": 46,
   "protein": 0.5,
   "carb": 12,
   "fat": 0.1,
   "fiber": 3.6,
   "potassium": 80,
   "sodium": 2,
   "calcium": 8,
   "magnesium": 6,
   "iron": 0.23,
   "zinc": 0.09
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171722",
   "name": "Cranberries, raw"
  }
 },
 {
  "name": "Sơn trà (nhót tây)",
  "group": "CARB",
  "values": {
   "kcal": 47,
   "protein": 0.4,
   "carb": 12.1,
   "fat": 0.2,
   "fiber": 1.7,
   "potassium": 266,
   "sodium": 1,
   "calcium": 16,
   "magnesium": 13,
   "iron": 0.28,
   "zinc": 0.05
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169908",
   "name": "Loquats, raw"
  }
 },
 {
  "name": "Vải",
  "group": "CARB",
  "values": {
   "kcal": 66,
   "protein": 0.8,
   "carb": 16.5,
   "fat": 0.4,
   "fiber": 1.3,
   "potassium": 171,
   "sodium": 1,
   "calcium": 5,
   "magnesium": 10,
   "iron": 0.31,
   "zinc": 0.07
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169086",
   "name": "Litchis, raw"
  }
 },
 {
  "name": "Nhãn",
  "group": "CARB",
  "values": {
   "kcal": 60,
   "protein": 1.3,
   "carb": 15.1,
   "fat": 0.1,
   "fiber": 1.1,
   "potassium": 266,
   "sodium": 0,
   "calcium": 1,
   "magnesium": 10,
   "iron": 0.13,
   "zinc": 0.05
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169089",
   "name": "Longans, raw"
  }
 },
 {
  "name": "Chôm chôm",
  "group": "CARB",
  "values": {
   "kcal": 74.6,
   "protein": 1,
   "carb": 18.5,
   "fat": 0.4,
   "fiber": 2.8,
   "potassium": 140,
   "sodium": 2,
   "calcium": 8,
   "magnesium": 10,
   "iron": 0.1,
   "zinc": 0.6
  },
  "note": "USDA chỉ có chôm chôm đóng hộp: dùng bảng Úc.",
  "approved": true,
  "source": {
   "db": "AU",
   "id": "F007612",
   "name": "Rambutan, raw",
   "carbConverted": true
  }
 },
 {
  "name": "Mít",
  "group": "CARB",
  "values": {
   "kcal": 95,
   "protein": 1.7,
   "carb": 23.3,
   "fat": 0.6,
   "fiber": 1.5,
   "potassium": 448,
   "sodium": 2,
   "calcium": 24,
   "magnesium": 29,
   "iron": 0.23,
   "zinc": 0.13
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174687",
   "name": "Jackfruit, raw"
  }
 },
 {
  "name": "Sầu riêng",
  "group": "CARB",
  "values": {
   "kcal": 147,
   "protein": 1.5,
   "carb": 27.1,
   "fat": 5.3,
   "fiber": 3.8,
   "potassium": 436,
   "sodium": 2,
   "calcium": 6,
   "magnesium": 30,
   "iron": 0.43,
   "zinc": 0.28
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168192",
   "name": "Durian, raw or frozen"
  }
 },
 {
  "name": "Dứa (thơm)",
  "group": "CARB",
  "values": {
   "kcal": 50,
   "protein": 0.5,
   "carb": 13.1,
   "fat": 0.1,
   "fiber": 1.4,
   "potassium": 109,
   "sodium": 1,
   "calcium": 13,
   "magnesium": 12,
   "iron": 0.29,
   "zinc": 0.12
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169124",
   "name": "Pineapple, raw, all varieties"
  }
 },
 {
  "name": "Bưởi",
  "group": "CARB",
  "values": {
   "kcal": 38,
   "protein": 0.8,
   "carb": 9.6,
   "fat": 0,
   "fiber": 1,
   "potassium": 216,
   "sodium": 1,
   "calcium": 4,
   "magnesium": 6,
   "iron": 0.11,
   "zinc": 0.08
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167754",
   "name": "Pummelo, raw"
  }
 },
 {
  "name": "Khế",
  "group": "CARB",
  "values": {
   "kcal": 31,
   "protein": 1,
   "carb": 6.7,
   "fat": 0.3,
   "fiber": 2.8,
   "potassium": 133,
   "sodium": 2,
   "calcium": 3,
   "magnesium": 10,
   "iron": 0.08,
   "zinc": 0.12
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171715",
   "name": "Carambola, (starfruit), raw"
  }
 },
 {
  "name": "Hồng giòn",
  "group": "CARB",
  "values": {
   "kcal": 70,
   "protein": 0.6,
   "carb": 18.6,
   "fat": 0.2,
   "fiber": 3.6,
   "potassium": 161,
   "sodium": 1,
   "calcium": 8,
   "magnesium": 9,
   "iron": 0.15,
   "zinc": 0.11
  },
  "note": "USDA: hồng Nhật.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169941",
   "name": "Persimmons, japanese, raw"
  }
 },
 {
  "name": "Me chín",
  "group": "CARB",
  "values": {
   "kcal": 239,
   "protein": 2.8,
   "carb": 62.5,
   "fat": 0.6,
   "fiber": 5.1,
   "potassium": 628,
   "sodium": 28,
   "calcium": 74,
   "magnesium": 92,
   "iron": 2.8,
   "zinc": 0.1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167763",
   "name": "Tamarinds, raw"
  }
 },
 {
  "name": "Hồng xiêm (sapoche)",
  "group": "CARB",
  "values": {
   "kcal": 83,
   "protein": 0.4,
   "carb": 20,
   "fat": 1.1,
   "fiber": 5.3,
   "potassium": 193,
   "sodium": 12,
   "calcium": 21,
   "magnesium": 12,
   "iron": 0.8,
   "zinc": 0.1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167759",
   "name": "Sapodilla, raw"
  }
 },
 {
  "name": "Mãng cầu xiêm",
  "group": "CARB",
  "values": {
   "kcal": 66,
   "protein": 1,
   "carb": 16.8,
   "fat": 0.3,
   "fiber": 3.3,
   "potassium": 278,
   "sodium": 14,
   "calcium": 14,
   "magnesium": 21,
   "iron": 0.6,
   "zinc": 0.1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167761",
   "name": "Soursop, raw"
  }
 },
 {
  "name": "Táo tàu tươi",
  "group": "CARB",
  "values": {
   "kcal": 79,
   "protein": 1.2,
   "carb": 20.2,
   "fat": 0.2,
   "fiber": null,
   "potassium": 250,
   "sodium": 3,
   "calcium": 21,
   "magnesium": 10,
   "iron": 0.48,
   "zinc": 0.05
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168151",
   "name": "Jujube, raw"
  }
 },
 {
  "name": "Nước dừa tươi",
  "group": "KHAC",
  "values": {
   "kcal": 19,
   "protein": 0.7,
   "carb": 3.7,
   "fat": 0.2,
   "fiber": 1.1,
   "potassium": 250,
   "sodium": 105,
   "calcium": 24,
   "magnesium": 25,
   "iron": 0.29,
   "zinc": 0.1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170174",
   "name": "Nuts, coconut water (liquid from coconuts)"
  }
 },
 {
  "name": "Cải bó xôi (rau chân vịt)",
  "group": "RAU",
  "values": {
   "kcal": 23,
   "protein": 2.9,
   "carb": 3.6,
   "fat": 0.4,
   "fiber": 2.2,
   "potassium": 558,
   "sodium": 79,
   "calcium": 99,
   "magnesium": 79,
   "iron": 2.71,
   "zinc": 0.53
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168462",
   "name": "Spinach, raw"
  }
 },
 {
  "name": "Cải xoăn (kale)",
  "group": "RAU",
  "values": {
   "kcal": 35,
   "protein": 2.9,
   "carb": 4.4,
   "fat": 1.5,
   "fiber": 4.1,
   "potassium": 348,
   "sodium": 53,
   "calcium": 254,
   "magnesium": 33,
   "iron": 1.6,
   "zinc": 0.39
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168421",
   "name": "Kale, raw"
  }
 },
 {
  "name": "Súp lơ trắng",
  "group": "RAU",
  "values": {
   "kcal": 25,
   "protein": 1.9,
   "carb": 5,
   "fat": 0.3,
   "fiber": 2,
   "potassium": 299,
   "sodium": 30,
   "calcium": 22,
   "magnesium": 15,
   "iron": 0.42,
   "zinc": 0.27
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169986",
   "name": "Cauliflower, raw"
  }
 },
 {
  "name": "Bắp cải tí hon (Brussels)",
  "group": "RAU",
  "values": {
   "kcal": 43,
   "protein": 3.4,
   "carb": 9,
   "fat": 0.3,
   "fiber": 3.8,
   "potassium": 389,
   "sodium": 25,
   "calcium": 42,
   "magnesium": 23,
   "iron": 1.4,
   "zinc": 0.42
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170383",
   "name": "Brussels sprouts, raw"
  }
 },
 {
  "name": "Ớt chuông đỏ",
  "group": "RAU",
  "values": {
   "kcal": 26,
   "protein": 1,
   "carb": 6,
   "fat": 0.3,
   "fiber": 2.1,
   "potassium": 211,
   "sodium": 4,
   "calcium": 7,
   "magnesium": 12,
   "iron": 0.43,
   "zinc": 0.25
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170108",
   "name": "Peppers, sweet, red, raw"
  }
 },
 {
  "name": "Ớt chuông xanh",
  "group": "RAU",
  "values": {
   "kcal": 20,
   "protein": 0.9,
   "carb": 4.6,
   "fat": 0.2,
   "fiber": 1.7,
   "potassium": 175,
   "sodium": 3,
   "calcium": 10,
   "magnesium": 10,
   "iron": 0.34,
   "zinc": 0.13
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170427",
   "name": "Peppers, sweet, green, raw"
  }
 },
 {
  "name": "Bí ngòi",
  "group": "RAU",
  "values": {
   "kcal": 17,
   "protein": 1.2,
   "carb": 3.1,
   "fat": 0.3,
   "fiber": 1,
   "potassium": 261,
   "sodium": 8,
   "calcium": 16,
   "magnesium": 18,
   "iron": 0.37,
   "zinc": 0.32
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169291",
   "name": "Squash, summer, zucchini, includes skin, raw"
  }
 },
 {
  "name": "Cần tây",
  "group": "RAU",
  "values": {
   "kcal": 14,
   "protein": 0.7,
   "carb": 3,
   "fat": 0.2,
   "fiber": 1.6,
   "potassium": 260,
   "sodium": 80,
   "calcium": 40,
   "magnesium": 11,
   "iron": 0.2,
   "zinc": 0.13
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169988",
   "name": "Celery, raw"
  }
 },
 {
  "name": "Hành tây",
  "group": "RAU",
  "values": {
   "kcal": 40,
   "protein": 1.1,
   "carb": 9.3,
   "fat": 0.1,
   "fiber": 1.7,
   "potassium": 146,
   "sodium": 4,
   "calcium": 23,
   "magnesium": 10,
   "iron": 0.21,
   "zinc": 0.17
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170000",
   "name": "Onions, raw"
  }
 },
 {
  "name": "Tỏi",
  "group": "KHAC",
  "values": {
   "kcal": 149,
   "protein": 6.4,
   "carb": 33.1,
   "fat": 0.5,
   "fiber": 2.1,
   "potassium": 401,
   "sodium": 17,
   "calcium": 181,
   "magnesium": 25,
   "iron": 1.7,
   "zinc": 1.16
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169230",
   "name": "Garlic, raw"
  }
 },
 {
  "name": "Atisô",
  "group": "RAU",
  "values": {
   "kcal": 47,
   "protein": 3.3,
   "carb": 10.5,
   "fat": 0.2,
   "fiber": 5.4,
   "potassium": 370,
   "sodium": 94,
   "calcium": 44,
   "magnesium": 60,
   "iron": 1.28,
   "zinc": 0.49
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169205",
   "name": "Artichokes, (globe or french), raw"
  }
 },
 {
  "name": "Măng tây",
  "group": "RAU",
  "values": {
   "kcal": 20,
   "protein": 2.2,
   "carb": 3.9,
   "fat": 0.1,
   "fiber": 2.1,
   "potassium": 202,
   "sodium": 2,
   "calcium": 24,
   "magnesium": 14,
   "iron": 2.14,
   "zinc": 0.54
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168389",
   "name": "Asparagus, raw"
  }
 },
 {
  "name": "Củ cải đỏ",
  "group": "RAU",
  "values": {
   "kcal": 16,
   "protein": 0.7,
   "carb": 3.4,
   "fat": 0.1,
   "fiber": 1.6,
   "potassium": 233,
   "sodium": 39,
   "calcium": 25,
   "magnesium": 10,
   "iron": 0.34,
   "zinc": 0.28
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169276",
   "name": "Radishes, raw"
  }
 },
 {
  "name": "Củ cải trắng",
  "group": "RAU",
  "values": {
   "kcal": 18,
   "protein": 0.6,
   "carb": 4.1,
   "fat": 0.1,
   "fiber": 1.6,
   "potassium": 227,
   "sodium": 21,
   "calcium": 27,
   "magnesium": 16,
   "iron": 0.4,
   "zinc": 0.15
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168451",
   "name": "Radishes, oriental, raw"
  }
 },
 {
  "name": "Củ dền",
  "group": "RAU",
  "values": {
   "kcal": 43,
   "protein": 1.6,
   "carb": 9.6,
   "fat": 0.2,
   "fiber": 2.8,
   "potassium": 325,
   "sodium": 78,
   "calcium": 16,
   "magnesium": 23,
   "iron": 0.8,
   "zinc": 0.35
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169145",
   "name": "Beets, raw"
  }
 },
 {
  "name": "Cải cầu vồng",
  "group": "RAU",
  "values": {
   "kcal": 19,
   "protein": 1.8,
   "carb": 3.7,
   "fat": 0.2,
   "fiber": 1.6,
   "potassium": 379,
   "sodium": 213,
   "calcium": 51,
   "magnesium": 81,
   "iron": 1.8,
   "zinc": 0.36
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169991",
   "name": "Chard, swiss, raw"
  }
 },
 {
  "name": "Cải bẹ xanh",
  "group": "RAU",
  "values": {
   "kcal": 27,
   "protein": 2.9,
   "carb": 4.7,
   "fat": 0.4,
   "fiber": 3.2,
   "potassium": 384,
   "sodium": 20,
   "calcium": 115,
   "magnesium": 32,
   "iron": 1.64,
   "zinc": 0.25
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169256",
   "name": "Mustard greens, raw"
  }
 },
 {
  "name": "Cải thảo",
  "group": "RAU",
  "values": {
   "kcal": 16,
   "protein": 1.2,
   "carb": 3.2,
   "fat": 0.2,
   "fiber": 1.2,
   "potassium": 238,
   "sodium": 9,
   "calcium": 77,
   "magnesium": 13,
   "iron": 0.31,
   "zinc": 0.23
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169979",
   "name": "Cabbage, chinese (pe-tsai), raw"
  }
 },
 {
  "name": "Cải thìa",
  "group": "RAU",
  "values": {
   "kcal": 13,
   "protein": 1.5,
   "carb": 2.2,
   "fat": 0.2,
   "fiber": 1,
   "potassium": 252,
   "sodium": 65,
   "calcium": 105,
   "magnesium": 19,
   "iron": 0.8,
   "zinc": 0.19
  },
  "note": "Cùng số liệu với \"Cải ngọt\" trong bảng cũ (USDA chỉ có cải thìa).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170390",
   "name": "Cabbage, chinese (pak-choi), raw"
  }
 },
 {
  "name": "Cải làn",
  "group": "RAU",
  "values": {
   "kcal": 26,
   "protein": 1.2,
   "carb": 4.7,
   "fat": 0.8,
   "fiber": 2.6,
   "potassium": 274,
   "sodium": 7,
   "calcium": 105,
   "magnesium": 19,
   "iron": 0.59,
   "zinc": 0.41
  },
  "note": "USDA: chinese broccoli (gai lan).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169404",
   "name": "Broccoli, chinese, raw"
  }
 },
 {
  "name": "Đậu cô ve",
  "group": "RAU",
  "values": {
   "kcal": 31,
   "protein": 1.8,
   "carb": 7,
   "fat": 0.2,
   "fiber": 2.7,
   "potassium": 211,
   "sodium": 6,
   "calcium": 37,
   "magnesium": 25,
   "iron": 1.03,
   "zinc": 0.24
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169961",
   "name": "Beans, snap, green, raw"
  }
 },
 {
  "name": "Đậu đũa",
  "group": "RAU",
  "values": {
   "kcal": 47,
   "protein": 2.8,
   "carb": 8.4,
   "fat": 0.4,
   "fiber": null,
   "potassium": 240,
   "sodium": 4,
   "calcium": 50,
   "magnesium": 44,
   "iron": 0.47,
   "zinc": 0.37
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169222",
   "name": "Yardlong bean, raw"
  }
 },
 {
  "name": "Hành lá",
  "group": "RAU",
  "values": {
   "kcal": 32,
   "protein": 1.8,
   "carb": 7.3,
   "fat": 0.2,
   "fiber": 2.6,
   "potassium": 276,
   "sodium": 16,
   "calcium": 72,
   "magnesium": 20,
   "iron": 1.48,
   "zinc": 0.39
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170005",
   "name": "Onions, spring or scallions (includes tops and bulb), raw"
  }
 },
 {
  "name": "Tỏi tây (boa rô)",
  "group": "RAU",
  "values": {
   "kcal": 61,
   "protein": 1.5,
   "carb": 14.2,
   "fat": 0.3,
   "fiber": 1.8,
   "potassium": 180,
   "sodium": 20,
   "calcium": 59,
   "magnesium": 28,
   "iron": 2.1,
   "zinc": 0.12
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169246",
   "name": "Leeks, (bulb and lower leaf-portion), raw"
  }
 },
 {
  "name": "Hẹ",
  "group": "RAU",
  "values": {
   "kcal": 30,
   "protein": 3.3,
   "carb": 4.4,
   "fat": 0.7,
   "fiber": 2.5,
   "potassium": 296,
   "sodium": 3,
   "calcium": 92,
   "magnesium": 42,
   "iron": 1.6,
   "zinc": 0.56
  },
  "note": "USDA: chives (hẹ tây); hẹ Việt Nam (garlic chives) không có trong các bảng.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169994",
   "name": "Chives, raw"
  }
 },
 {
  "name": "Húng quế",
  "group": "RAU",
  "values": {
   "kcal": 23,
   "protein": 3.2,
   "carb": 2.7,
   "fat": 0.6,
   "fiber": 1.6,
   "potassium": 295,
   "sodium": 4,
   "calcium": 177,
   "magnesium": 64,
   "iron": 3.17,
   "zinc": 0.81
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172232",
   "name": "Basil, fresh"
  }
 },
 {
  "name": "Xà lách",
  "group": "RAU",
  "values": {
   "kcal": 15,
   "protein": 1.4,
   "carb": 2.9,
   "fat": 0.2,
   "fiber": 1.3,
   "potassium": 194,
   "sodium": 28,
   "calcium": 36,
   "magnesium": 13,
   "iron": 0.86,
   "zinc": 0.18
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169249",
   "name": "Lettuce, green leaf, raw"
  }
 },
 {
  "name": "Xà lách búp (iceberg)",
  "group": "RAU",
  "values": {
   "kcal": 14,
   "protein": 0.9,
   "carb": 3,
   "fat": 0.1,
   "fiber": 1.2,
   "potassium": 141,
   "sodium": 10,
   "calcium": 18,
   "magnesium": 7,
   "iron": 0.41,
   "zinc": 0.15
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169248",
   "name": "Lettuce, iceberg (includes crisphead types), raw"
  }
 },
 {
  "name": "Ớt",
  "group": "KHAC",
  "values": {
   "kcal": 40,
   "protein": 1.9,
   "carb": 8.8,
   "fat": 0.4,
   "fiber": 1.5,
   "potassium": 322,
   "sodium": 9,
   "calcium": 14,
   "magnesium": 23,
   "iron": 1.03,
   "zinc": 0.26
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170106",
   "name": "Peppers, hot chili, red, raw"
  }
 },
 {
  "name": "Tiêu đen",
  "group": "KHAC",
  "values": {
   "kcal": 251,
   "protein": 10.4,
   "carb": 64,
   "fat": 3.3,
   "fiber": 25.3,
   "potassium": 1329,
   "sodium": 20,
   "calcium": 443,
   "magnesium": 171,
   "iron": 9.71,
   "zinc": 1.19
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170931",
   "name": "Spices, pepper, black"
  }
 },
 {
  "name": "Bạc hà",
  "group": "RAU",
  "values": {
   "kcal": 70,
   "protein": 3.8,
   "carb": 14.9,
   "fat": 0.9,
   "fiber": 8,
   "potassium": 569,
   "sodium": 31,
   "calcium": 243,
   "magnesium": 80,
   "iron": 5.08,
   "zinc": 1.11
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173474",
   "name": "Peppermint, fresh"
  }
 },
 {
  "name": "Húng lủi",
  "group": "RAU",
  "values": {
   "kcal": 44,
   "protein": 3.3,
   "carb": 8.4,
   "fat": 0.7,
   "fiber": 6.8,
   "potassium": 458,
   "sodium": 30,
   "calcium": 199,
   "magnesium": 63,
   "iron": 11.87,
   "zinc": 1.09
  },
  "note": "USDA: spearmint.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173475",
   "name": "Spearmint, fresh"
  }
 },
 {
  "name": "Lá chùm ngây",
  "group": "RAU",
  "values": {
   "kcal": 64,
   "protein": 9.4,
   "carb": 8.3,
   "fat": 1.4,
   "fiber": 2,
   "potassium": 337,
   "sodium": 9,
   "calcium": 185,
   "magnesium": 42,
   "iron": 4,
   "zinc": 0.6
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168416",
   "name": "Drumstick leaves, raw"
  }
 },
 {
  "name": "Cải cúc (tần ô)",
  "group": "RAU",
  "values": {
   "kcal": 24,
   "protein": 3.4,
   "carb": 3,
   "fat": 0.6,
   "fiber": 3,
   "potassium": 567,
   "sodium": 118,
   "calcium": 117,
   "magnesium": 32,
   "iron": 2.29,
   "zinc": 0.71
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169995",
   "name": "Chrysanthemum, garland, raw"
  }
 },
 {
  "name": "Củ sen",
  "group": "RAU",
  "values": {
   "kcal": 74,
   "protein": 2.6,
   "carb": 17.2,
   "fat": 0.1,
   "fiber": 4.9,
   "potassium": 556,
   "sodium": 40,
   "calcium": 45,
   "magnesium": 23,
   "iron": 1.16,
   "zinc": 0.39
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169250",
   "name": "Lotus root, raw"
  }
 },
 {
  "name": "Đậu rồng",
  "group": "RAU",
  "values": {
   "kcal": 49,
   "protein": 7,
   "carb": 4.3,
   "fat": 0.9,
   "fiber": null,
   "potassium": 223,
   "sodium": 4,
   "calcium": 84,
   "magnesium": 34,
   "iron": 1.5,
   "zinc": 0.39
  },
  "note": "USDA: hạt non của đậu rồng.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170476",
   "name": "Winged beans, immature seeds, raw"
  }
 },
 {
  "name": "Đậu ván",
  "group": "RAU",
  "values": {
   "kcal": 46,
   "protein": 2.1,
   "carb": 9.2,
   "fat": 0.2,
   "fiber": 3.3,
   "potassium": 252,
   "sodium": 2,
   "calcium": 50,
   "magnesium": 40,
   "iron": 0.74,
   "zinc": 0.37
  },
  "note": "USDA: hạt non đậu ván (hyacinth/lablab).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169234",
   "name": "Hyacinth-beans, immature seeds, raw"
  }
 },
 {
  "name": "Cải xoong",
  "group": "RAU",
  "values": {
   "kcal": 11,
   "protein": 2.3,
   "carb": 1.3,
   "fat": 0.1,
   "fiber": 0.5,
   "potassium": 330,
   "sodium": 41,
   "calcium": 120,
   "magnesium": 21,
   "iron": 0.2,
   "zinc": 0.11
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170068",
   "name": "Watercress, raw"
  }
 },
 {
  "name": "Mướp đắng (khổ qua)",
  "group": "RAU",
  "values": {
   "kcal": 17,
   "protein": 1,
   "carb": 3.7,
   "fat": 0.2,
   "fiber": 2.8,
   "potassium": 296,
   "sodium": 5,
   "calcium": 19,
   "magnesium": 17,
   "iron": 0.43,
   "zinc": 0.8
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168393",
   "name": "Balsam-pear (bitter gourd), pods, raw"
  }
 },
 {
  "name": "Rau sam",
  "group": "RAU",
  "values": {
   "kcal": 20,
   "protein": 2,
   "carb": 3.4,
   "fat": 0.4,
   "fiber": null,
   "potassium": 494,
   "sodium": 45,
   "calcium": 65,
   "magnesium": 68,
   "iron": 1.99,
   "zinc": 0.17
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169274",
   "name": "Purslane, raw"
  }
 },
 {
  "name": "Rau lang",
  "group": "RAU",
  "values": {
   "kcal": 42,
   "protein": 2.5,
   "carb": 8.8,
   "fat": 0.5,
   "fiber": 5.3,
   "potassium": 508,
   "sodium": 6,
   "calcium": 78,
   "magnesium": 70,
   "iron": 0.97,
   "zinc": null
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169303",
   "name": "Sweet potato leaves, raw"
  }
 },
 {
  "name": "Mồng tơi",
  "group": "RAU",
  "values": {
   "kcal": 19,
   "protein": 1.8,
   "carb": 3.4,
   "fat": 0.3,
   "fiber": null,
   "potassium": 510,
   "sodium": 24,
   "calcium": 109,
   "magnesium": 65,
   "iron": 1.2,
   "zinc": 0.43
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170474",
   "name": "Vinespinach, (basella), raw"
  }
 },
 {
  "name": "Rau đay",
  "group": "RAU",
  "values": {
   "kcal": 34,
   "protein": 4.7,
   "carb": 5.8,
   "fat": 0.3,
   "fiber": null,
   "potassium": 559,
   "sodium": 8,
   "calcium": 208,
   "magnesium": 64,
   "iron": 4.76,
   "zinc": 0.79
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168419",
   "name": "Jute, potherb, raw"
  }
 },
 {
  "name": "Bông điên điển",
  "group": "RAU",
  "values": {
   "kcal": 27,
   "protein": 1.3,
   "carb": 6.7,
   "fat": 0,
   "fiber": null,
   "potassium": 184,
   "sodium": 15,
   "calcium": 19,
   "magnesium": 12,
   "iron": 0.84,
   "zinc": null
  },
  "note": "USDA: hoa sesbania tươi.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168459",
   "name": "Sesbania flower, raw"
  }
 },
 {
  "name": "Rong biển lá (tươi)",
  "group": "RAU",
  "values": {
   "kcal": 35,
   "protein": 5.8,
   "carb": 5.1,
   "fat": 0.3,
   "fiber": 0.3,
   "potassium": 356,
   "sodium": 48,
   "calcium": 70,
   "magnesium": 2,
   "iron": 1.8,
   "zinc": 1.05
  },
  "note": "USDA: rong biển lá (laver) tươi.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168458",
   "name": "Seaweed, laver, raw"
  }
 },
 {
  "name": "Rong biển wakame",
  "group": "RAU",
  "values": {
   "kcal": 45,
   "protein": 3,
   "carb": 9.1,
   "fat": 0.6,
   "fiber": 0.5,
   "potassium": 50,
   "sodium": 872,
   "calcium": 150,
   "magnesium": 107,
   "iron": 2.18,
   "zinc": 0.38
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170496",
   "name": "Seaweed, wakame, raw"
  }
 },
 {
  "name": "Rong biển kelp",
  "group": "RAU",
  "values": {
   "kcal": 43,
   "protein": 1.7,
   "carb": 9.6,
   "fat": 0.6,
   "fiber": 1.3,
   "potassium": 89,
   "sodium": 233,
   "calcium": 168,
   "magnesium": 121,
   "iron": 2.85,
   "zinc": 1.23
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168457",
   "name": "Seaweed, kelp, raw"
  }
 },
 {
  "name": "Sả",
  "group": "KHAC",
  "values": {
   "kcal": 99,
   "protein": 1.8,
   "carb": 25.3,
   "fat": 0.5,
   "fiber": null,
   "potassium": 723,
   "sodium": 6,
   "calcium": 65,
   "magnesium": 60,
   "iron": 8.17,
   "zinc": 2.23
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168573",
   "name": "Lemon grass (citronella), raw"
  }
 },
 {
  "name": "Gừng tươi",
  "group": "KHAC",
  "values": {
   "kcal": 80,
   "protein": 1.8,
   "carb": 17.8,
   "fat": 0.8,
   "fiber": 2,
   "potassium": 415,
   "sodium": 13,
   "calcium": 16,
   "magnesium": 43,
   "iron": 0.6,
   "zinc": 0.34
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169231",
   "name": "Ginger root, raw"
  }
 },
 {
  "name": "Nghệ bột",
  "group": "KHAC",
  "values": {
   "kcal": 312,
   "protein": 9.7,
   "carb": 67.1,
   "fat": 3.3,
   "fiber": 22.7,
   "potassium": 2080,
   "sodium": 27,
   "calcium": 168,
   "magnesium": 208,
   "iron": 55,
   "zinc": 4.5
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172231",
   "name": "Spices, turmeric, ground"
  }
 },
 {
  "name": "Quế bột",
  "group": "KHAC",
  "values": {
   "kcal": 247,
   "protein": 4,
   "carb": 80.6,
   "fat": 1.2,
   "fiber": 53.1,
   "potassium": 431,
   "sodium": 10,
   "calcium": 1002,
   "magnesium": 60,
   "iron": 8.32,
   "zinc": 1.83
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171320",
   "name": "Spices, cinnamon, ground"
  }
 },
 {
  "name": "Nhục đậu khấu",
  "group": "KHAC",
  "values": {
   "kcal": 525,
   "protein": 5.8,
   "carb": 49.3,
   "fat": 36.3,
   "fiber": 20.8,
   "potassium": 350,
   "sodium": 16,
   "calcium": 184,
   "magnesium": 183,
   "iron": 3.04,
   "zinc": 2.15
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171326",
   "name": "Spices, nutmeg, ground"
  }
 },
 {
  "name": "Ngò rí (rau mùi)",
  "group": "RAU",
  "values": {
   "kcal": 23,
   "protein": 2.1,
   "carb": 3.7,
   "fat": 0.5,
   "fiber": 2.8,
   "potassium": 521,
   "sodium": 46,
   "calcium": 67,
   "magnesium": 26,
   "iron": 1.77,
   "zinc": 0.5
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169997",
   "name": "Coriander (cilantro) leaves, raw"
  }
 },
 {
  "name": "Mùi tây (parsley)",
  "group": "RAU",
  "values": {
   "kcal": 36,
   "protein": 3,
   "carb": 6.3,
   "fat": 0.8,
   "fiber": 3.3,
   "potassium": 554,
   "sodium": 56,
   "calcium": 138,
   "magnesium": 50,
   "iron": 6.2,
   "zinc": 1.07
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170416",
   "name": "Parsley, fresh"
  }
 },
 {
  "name": "Thì là",
  "group": "RAU",
  "values": {
   "kcal": 43,
   "protein": 3.5,
   "carb": 7,
   "fat": 1.1,
   "fiber": 2.1,
   "potassium": 738,
   "sodium": 61,
   "calcium": 208,
   "magnesium": 55,
   "iron": 6.59,
   "zinc": 0.91
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172233",
   "name": "Dill weed, fresh"
  }
 },
 {
  "name": "Hương thảo",
  "group": "RAU",
  "values": {
   "kcal": 131,
   "protein": 3.3,
   "carb": 20.7,
   "fat": 5.9,
   "fiber": 14.1,
   "potassium": 668,
   "sodium": 26,
   "calcium": 317,
   "magnesium": 91,
   "iron": 6.65,
   "zinc": 0.93
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173473",
   "name": "Rosemary, fresh"
  }
 },
 {
  "name": "Cỏ xạ hương",
  "group": "RAU",
  "values": {
   "kcal": 101,
   "protein": 5.6,
   "carb": 24.5,
   "fat": 1.7,
   "fiber": 14,
   "potassium": 609,
   "sodium": 9,
   "calcium": 405,
   "magnesium": 160,
   "iron": 17.45,
   "zinc": 1.81
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173470",
   "name": "Thyme, fresh"
  }
 },
 {
  "name": "Lá oregano khô",
  "group": "KHAC",
  "values": {
   "kcal": 265,
   "protein": 9,
   "carb": 68.9,
   "fat": 4.3,
   "fiber": 42.5,
   "potassium": 1260,
   "sodium": 25,
   "calcium": 1597,
   "magnesium": 270,
   "iron": 36.8,
   "zinc": 2.69
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171328",
   "name": "Spices, oregano, dried"
  }
 },
 {
  "name": "Thì là Ai Cập (cumin)",
  "group": "KHAC",
  "values": {
   "kcal": 375,
   "protein": 17.8,
   "carb": 44.2,
   "fat": 22.3,
   "fiber": 10.5,
   "potassium": 1788,
   "sodium": 168,
   "calcium": 931,
   "magnesium": 366,
   "iron": 66.36,
   "zinc": 4.8
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170923",
   "name": "Spices, cumin seed"
  }
 },
 {
  "name": "Măng tre tươi",
  "group": "RAU",
  "values": {
   "kcal": 27,
   "protein": 2.6,
   "carb": 5.2,
   "fat": 0.3,
   "fiber": 2.2,
   "potassium": 533,
   "sodium": 4,
   "calcium": 13,
   "magnesium": 3,
   "iron": 0.5,
   "zinc": 1.1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169210",
   "name": "Bamboo shoots, raw"
  }
 },
 {
  "name": "Khoai môn",
  "group": "CARB",
  "values": {
   "kcal": 112,
   "protein": 1.5,
   "carb": 26.5,
   "fat": 0.2,
   "fiber": 4.1,
   "potassium": 591,
   "sodium": 11,
   "calcium": 43,
   "magnesium": 33,
   "iron": 0.55,
   "zinc": 0.23
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169308",
   "name": "Taro, raw"
  }
 },
 {
  "name": "Khoai mì (sắn)",
  "group": "CARB",
  "values": {
   "kcal": 160,
   "protein": 1.4,
   "carb": 38.1,
   "fat": 0.3,
   "fiber": 1.8,
   "potassium": 271,
   "sodium": 14,
   "calcium": 16,
   "magnesium": 21,
   "iron": 0.27,
   "zinc": 0.34
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169985",
   "name": "Cassava, raw"
  }
 },
 {
  "name": "Củ đậu (củ sắn)",
  "group": "RAU",
  "values": {
   "kcal": 38,
   "protein": 0.7,
   "carb": 8.8,
   "fat": 0.1,
   "fiber": 4.9,
   "potassium": 150,
   "sodium": 4,
   "calcium": 12,
   "magnesium": 12,
   "iron": 0.6,
   "zinc": 0.16
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170073",
   "name": "Yambean (jicama), raw"
  }
 },
 {
  "name": "Su hào",
  "group": "RAU",
  "values": {
   "kcal": 27,
   "protein": 1.7,
   "carb": 6.2,
   "fat": 0.1,
   "fiber": 3.6,
   "potassium": 350,
   "sodium": 20,
   "calcium": 24,
   "magnesium": 19,
   "iron": 0.4,
   "zinc": 0.03
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168424",
   "name": "Kohlrabi, raw"
  }
 },
 {
  "name": "Su su",
  "group": "RAU",
  "values": {
   "kcal": 19,
   "protein": 0.8,
   "carb": 4.5,
   "fat": 0.1,
   "fiber": 1.7,
   "potassium": 125,
   "sodium": 2,
   "calcium": 17,
   "magnesium": 12,
   "iron": 0.34,
   "zinc": 0.74
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170402",
   "name": "Chayote, fruit, raw"
  }
 },
 {
  "name": "Bắp ngọt (sống)",
  "group": "CARB",
  "values": {
   "kcal": 86,
   "protein": 3.3,
   "carb": 18.7,
   "fat": 1.4,
   "fiber": 2,
   "potassium": 270,
   "sodium": 15,
   "calcium": 2,
   "magnesium": 37,
   "iron": 0.52,
   "zinc": 0.46
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169998",
   "name": "Corn, sweet, yellow, raw"
  }
 },
 {
  "name": "Khoai lang (sống)",
  "group": "CARB",
  "values": {
   "kcal": 86,
   "protein": 1.6,
   "carb": 20.1,
   "fat": 0.1,
   "fiber": 3,
   "potassium": 337,
   "sodium": 55,
   "calcium": 30,
   "magnesium": 25,
   "iron": 0.61,
   "zinc": 0.3
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168482",
   "name": "Sweet potato, raw, unprepared (Includes foods for USDA's Food Distribution Program)"
  }
 },
 {
  "name": "Khoai tây (sống, cả vỏ)",
  "group": "CARB",
  "values": {
   "kcal": 77,
   "protein": 2.1,
   "carb": 17.5,
   "fat": 0.1,
   "fiber": 2.1,
   "potassium": 425,
   "sodium": 6,
   "calcium": 12,
   "magnesium": 23,
   "iron": 0.81,
   "zinc": 0.3
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170026",
   "name": "Potatoes, flesh and skin, raw"
  }
 },
 {
  "name": "Hạt sen tươi",
  "group": "CARB",
  "values": {
   "kcal": 89,
   "protein": 4.1,
   "carb": 17.3,
   "fat": 0.5,
   "fiber": null,
   "potassium": 367,
   "sodium": 1,
   "calcium": 44,
   "magnesium": 56,
   "iron": 0.95,
   "zinc": 0.28
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168591",
   "name": "Seeds, lotus seeds, raw"
  }
 },
 {
  "name": "Hạt sen khô",
  "group": "CARB",
  "values": {
   "kcal": 332,
   "protein": 15.4,
   "carb": 64.5,
   "fat": 2,
   "fiber": null,
   "potassium": 1368,
   "sodium": 5,
   "calcium": 163,
   "magnesium": 210,
   "iron": 3.53,
   "zinc": 1.05
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170149",
   "name": "Seeds, lotus seeds, dried"
  }
 },
 {
  "name": "Đậu xanh (hạt khô)",
  "group": "PROTEIN",
  "values": {
   "kcal": 347,
   "protein": 23.9,
   "carb": 62.6,
   "fat": 1.2,
   "fiber": 16.3,
   "potassium": 1246,
   "sodium": 15,
   "calcium": 132,
   "magnesium": 189,
   "iron": 6.74,
   "zinc": 2.68
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174256",
   "name": "Mung beans, mature seeds, raw"
  }
 },
 {
  "name": "Đậu đen (hạt khô)",
  "group": "PROTEIN",
  "values": {
   "kcal": 341,
   "protein": 21.6,
   "carb": 62.4,
   "fat": 1.4,
   "fiber": 15.5,
   "potassium": 1483,
   "sodium": 5,
   "calcium": 123,
   "magnesium": 171,
   "iron": 5.02,
   "zinc": 3.65
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173734",
   "name": "Beans, black, mature seeds, raw"
  }
 },
 {
  "name": "Đậu nành (hạt khô)",
  "group": "PROTEIN",
  "values": {
   "kcal": 446,
   "protein": 36.5,
   "carb": 30.2,
   "fat": 19.9,
   "fiber": 9.3,
   "potassium": 1797,
   "sodium": 2,
   "calcium": 277,
   "magnesium": 280,
   "iron": 15.7,
   "zinc": 4.89
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174270",
   "name": "Soybeans, mature seeds, raw"
  }
 },
 {
  "name": "Đậu Hà Lan",
  "group": "CARB",
  "values": {
   "kcal": 81,
   "protein": 5.4,
   "carb": 14.5,
   "fat": 0.4,
   "fiber": 5.7,
   "potassium": 244,
   "sodium": 5,
   "calcium": 25,
   "magnesium": 33,
   "iron": 1.47,
   "zinc": 1.24
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170419",
   "name": "Peas, green, raw"
  }
 },
 {
  "name": "Đậu đỏ (hạt khô)",
  "group": "PROTEIN",
  "values": {
   "kcal": 333,
   "protein": 23.6,
   "carb": 60,
   "fat": 0.8,
   "fiber": 24.9,
   "potassium": 1406,
   "sodium": 24,
   "calcium": 143,
   "magnesium": 140,
   "iron": 8.2,
   "zinc": 2.79
  },
  "note": "USDA: đậu thận (kidney beans).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "175193",
   "name": "Beans, kidney, all types, mature seeds, raw"
  }
 },
 {
  "name": "Đậu gà (hạt khô)",
  "group": "PROTEIN",
  "values": {
   "kcal": 378,
   "protein": 20.5,
   "carb": 63,
   "fat": 6,
   "fiber": 12.2,
   "potassium": 718,
   "sodium": 24,
   "calcium": 57,
   "magnesium": 79,
   "iron": 4.31,
   "zinc": 2.76
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173756",
   "name": "Chickpeas (garbanzo beans, bengal gram), mature seeds, raw"
  }
 },
 {
  "name": "Đậu phụ chiên",
  "group": "PROTEIN",
  "values": {
   "kcal": 270,
   "protein": 18.8,
   "carb": 8.9,
   "fat": 20.2,
   "fiber": 3.9,
   "potassium": 146,
   "sodium": 16,
   "calcium": 372,
   "magnesium": 60,
   "iron": 4.87,
   "zinc": 1.99
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172451",
   "name": "Tofu, fried"
  }
 },
 {
  "name": "Nấm bào ngư (nấm sò)",
  "group": "RAU",
  "values": {
   "kcal": 33,
   "protein": 3.3,
   "carb": 6.1,
   "fat": 0.4,
   "fiber": 2.3,
   "potassium": 420,
   "sodium": 18,
   "calcium": 3,
   "magnesium": 18,
   "iron": 1.33,
   "zinc": 0.77
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168580",
   "name": "Mushrooms, oyster, raw"
  }
 },
 {
  "name": "Nấm hương tươi (đông cô)",
  "group": "RAU",
  "values": {
   "kcal": 34,
   "protein": 2.2,
   "carb": 6.8,
   "fat": 0.5,
   "fiber": 2.5,
   "potassium": 304,
   "sodium": 9,
   "calcium": 2,
   "magnesium": 20,
   "iron": 0.41,
   "zinc": 1.03
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169242",
   "name": "Mushrooms, shiitake, raw"
  }
 },
 {
  "name": "Nấm kim châm",
  "group": "RAU",
  "values": {
   "kcal": 37,
   "protein": 2.7,
   "carb": 7.8,
   "fat": 0.3,
   "fiber": 2.7,
   "potassium": 359,
   "sodium": 3,
   "calcium": 0,
   "magnesium": 16,
   "iron": 1.15,
   "zinc": 0.65
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169382",
   "name": "Mushrooms, enoki, raw"
  }
 },
 {
  "name": "Nấm mỡ trắng",
  "group": "RAU",
  "values": {
   "kcal": 22,
   "protein": 3.1,
   "carb": 3.3,
   "fat": 0.3,
   "fiber": 1,
   "potassium": 318,
   "sodium": 5,
   "calcium": 3,
   "magnesium": 9,
   "iron": 0.5,
   "zinc": 0.52
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169251",
   "name": "Mushrooms, white, raw"
  }
 },
 {
  "name": "Nấm mỡ nâu",
  "group": "RAU",
  "values": {
   "kcal": 22,
   "protein": 2.5,
   "carb": 4.3,
   "fat": 0.1,
   "fiber": 0.6,
   "potassium": 448,
   "sodium": 6,
   "calcium": 18,
   "magnesium": 9,
   "iron": 0.4,
   "zinc": 1.1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168434",
   "name": "Mushrooms, brown, italian, or crimini, raw"
  }
 },
 {
  "name": "Nấm portobello",
  "group": "RAU",
  "values": {
   "kcal": 22,
   "protein": 2.1,
   "carb": 3.9,
   "fat": 0.4,
   "fiber": 1.3,
   "potassium": 364,
   "sodium": 9,
   "calcium": 3,
   "magnesium": null,
   "iron": 0.31,
   "zinc": 0.53
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169255",
   "name": "Mushrooms, portabella, raw"
  }
 },
 {
  "name": "Mộc nhĩ tươi (nấm mèo)",
  "group": "RAU",
  "values": {
   "kcal": 25,
   "protein": 0.5,
   "carb": 6.8,
   "fat": 0,
   "fiber": null,
   "potassium": 43,
   "sodium": 9,
   "calcium": 16,
   "magnesium": 25,
   "iron": 0.56,
   "zinc": 0.66
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169237",
   "name": "Jew's ear, (pepeao), raw"
  }
 },
 {
  "name": "Mộc nhĩ khô",
  "group": "RAU",
  "values": {
   "kcal": 284,
   "protein": 9.3,
   "carb": 73,
   "fat": 0.7,
   "fiber": 70.1,
   "potassium": 754,
   "sodium": 35,
   "calcium": 159,
   "magnesium": 83,
   "iron": 5.88,
   "zinc": 1.32
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168581",
   "name": "Fungi, Cloud ears, dried"
  }
 },
 {
  "name": "Nấm mồng gà",
  "group": "RAU",
  "values": {
   "kcal": 32,
   "protein": 1.5,
   "carb": 6.9,
   "fat": 0.5,
   "fiber": 3.8,
   "potassium": 506,
   "sodium": 9,
   "calcium": 15,
   "magnesium": 13,
   "iron": 3.47,
   "zinc": 0.71
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168422",
   "name": "Mushrooms, Chanterelle, raw"
  }
 },
 {
  "name": "Nấm múi (morel)",
  "group": "RAU",
  "values": {
   "kcal": 31,
   "protein": 3.1,
   "carb": 5.1,
   "fat": 0.6,
   "fiber": 2.8,
   "potassium": 411,
   "sodium": 21,
   "calcium": 43,
   "magnesium": 19,
   "iron": 12.18,
   "zinc": 2.03
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168423",
   "name": "Mushrooms, morel, raw"
  }
 },
 {
  "name": "Nấm maitake",
  "group": "RAU",
  "values": {
   "kcal": 31,
   "protein": 1.9,
   "carb": 7,
   "fat": 0.2,
   "fiber": 2.7,
   "potassium": 204,
   "sodium": 1,
   "calcium": 1,
   "magnesium": 10,
   "iron": 0.3,
   "zinc": 0.75
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169403",
   "name": "Mushrooms, maitake, raw"
  }
 },
 {
  "name": "Thịt gà (thịt nạc, sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 119,
   "protein": 21.4,
   "carb": 0,
   "fat": 3.1,
   "fiber": 0,
   "potassium": 229,
   "sodium": 77,
   "calcium": 12,
   "magnesium": 25,
   "iron": 0.89,
   "zinc": 1.54
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171052",
   "name": "Chicken, broilers or fryers, meat only, raw"
  }
 },
 {
  "name": "Thịt gà cả da (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 215,
   "protein": 18.6,
   "carb": 0,
   "fat": 15.1,
   "fiber": 0,
   "potassium": 189,
   "sodium": 70,
   "calcium": 11,
   "magnesium": 20,
   "iron": 0.9,
   "zinc": 1.31
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171447",
   "name": "Chicken, broilers or fryers, meat and skin, raw"
  }
 },
 {
  "name": "Gà tây (thịt nạc, sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 115,
   "protein": 22.6,
   "carb": 0.1,
   "fat": 1.9,
   "fiber": 0,
   "potassium": 235,
   "sodium": 118,
   "calcium": 11,
   "magnesium": 27,
   "iron": 0.86,
   "zinc": 1.84
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171480",
   "name": "Turkey, whole, meat only, raw"
  }
 },
 {
  "name": "Thịt vịt (thịt nạc, sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 135,
   "protein": 18.3,
   "carb": 0.9,
   "fat": 6,
   "fiber": 0,
   "potassium": 271,
   "sodium": 74,
   "calcium": 11,
   "magnesium": 19,
   "iron": 2.4,
   "zinc": 1.9
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172410",
   "name": "Duck, domesticated, meat only, raw"
  }
 },
 {
  "name": "Trứng vịt",
  "group": "PROTEIN",
  "values": {
   "kcal": 185,
   "protein": 12.8,
   "carb": 1.5,
   "fat": 13.8,
   "fiber": 0,
   "potassium": 222,
   "sodium": 146,
   "calcium": 64,
   "magnesium": 17,
   "iron": 3.85,
   "zinc": 1.41
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172189",
   "name": "Egg, duck, whole, fresh, raw"
  }
 },
 {
  "name": "Trứng cút",
  "group": "PROTEIN",
  "values": {
   "kcal": 158,
   "protein": 13.1,
   "carb": 0.4,
   "fat": 11.1,
   "fiber": 0,
   "potassium": 132,
   "sodium": 141,
   "calcium": 64,
   "magnesium": 13,
   "iron": 3.65,
   "zinc": 1.47
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172191",
   "name": "Egg, quail, whole, fresh, raw"
  }
 },
 {
  "name": "Sườn heo (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 277,
   "protein": 15.5,
   "carb": 0,
   "fat": 23.4,
   "fiber": 0,
   "potassium": 242,
   "sodium": 81,
   "calcium": 15,
   "magnesium": 16,
   "iron": 0.91,
   "zinc": 2.5
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167853",
   "name": "Pork, fresh, spareribs, separable lean and fat, raw"
  }
 },
 {
  "name": "Thịt heo xay (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 263,
   "protein": 16.9,
   "carb": 0,
   "fat": 21.2,
   "fiber": 0,
   "potassium": 287,
   "sodium": 56,
   "calcium": 14,
   "magnesium": 19,
   "iron": 0.88,
   "zinc": 2.2
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167902",
   "name": "Pork, fresh, ground, raw"
  }
 },
 {
  "name": "Thịt nạc vai heo (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 148,
   "protein": 19.6,
   "carb": 0,
   "fat": 7.1,
   "fiber": 0,
   "potassium": 341,
   "sodium": 76,
   "calcium": 14,
   "magnesium": 21,
   "iron": 1.22,
   "zinc": 3.14
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167845",
   "name": "Pork, fresh, shoulder, whole, separable lean only, raw"
  }
 },
 {
  "name": "Thịt bò xay 90% nạc (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 176,
   "protein": 20,
   "carb": 0,
   "fat": 10,
   "fiber": 0,
   "potassium": 321,
   "sodium": 66,
   "calcium": 12,
   "magnesium": 20,
   "iron": 2.24,
   "zinc": 4.79
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174030",
   "name": "Beef, ground, 90% lean meat / 10% fat, raw"
  }
 },
 {
  "name": "Thịt bò nạm (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 157,
   "protein": 20.7,
   "carb": 0.6,
   "fat": 7.4,
   "fiber": 0,
   "potassium": 330,
   "sodium": 79,
   "calcium": 5,
   "magnesium": 23,
   "iron": 1.92,
   "zinc": 4.31
  },
  "note": "USDA: ức bò (brisket), phần nạc.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168607",
   "name": "Beef, brisket, whole, separable lean only, all grades, raw"
  }
 },
 {
  "name": "Thịt dê (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 109,
   "protein": 20.6,
   "carb": 0,
   "fat": 2.3,
   "fiber": 0,
   "potassium": 385,
   "sodium": 82,
   "calcium": 13,
   "magnesium": null,
   "iron": 2.83,
   "zinc": 4
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "175303",
   "name": "Game meat, goat, raw"
  }
 },
 {
  "name": "Thịt cừu thăn (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 143,
   "protein": 20.9,
   "carb": 0,
   "fat": 5.9,
   "fiber": 0,
   "potassium": 276,
   "sodium": 68,
   "calcium": 12,
   "magnesium": 27,
   "iron": 1.91,
   "zinc": 3.19
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172491",
   "name": "Lamb, loin, separable lean only, trimmed to 1/4\" fat, choice, raw"
  }
 },
 {
  "name": "Thịt ếch (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 73,
   "protein": 16.4,
   "carb": 0,
   "fat": 0.3,
   "fiber": 0,
   "potassium": 285,
   "sodium": 58,
   "calcium": 18,
   "magnesium": 20,
   "iron": 1.5,
   "zinc": 1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168148",
   "name": "Frog legs, raw"
  }
 },
 {
  "name": "Gan heo (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 134,
   "protein": 21.4,
   "carb": 2.5,
   "fat": 3.7,
   "fiber": 0,
   "potassium": 273,
   "sodium": 87,
   "calcium": 9,
   "magnesium": 18,
   "iron": 23.3,
   "zinc": 5.76
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167862",
   "name": "Pork, fresh, variety meats and by-products, liver, raw"
  }
 },
 {
  "name": "Gan gà (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 119,
   "protein": 16.9,
   "carb": 0.7,
   "fat": 4.8,
   "fiber": 0,
   "potassium": 230,
   "sodium": 71,
   "calcium": 8,
   "magnesium": 19,
   "iron": 8.99,
   "zinc": 2.67
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171060",
   "name": "Chicken, liver, all classes, raw"
  }
 },
 {
  "name": "Gan bò (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 135,
   "protein": 20.4,
   "carb": 3.9,
   "fat": 3.6,
   "fiber": 0,
   "potassium": 313,
   "sodium": 69,
   "calcium": 5,
   "magnesium": 18,
   "iron": 4.9,
   "zinc": 4
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169451",
   "name": "Beef, variety meats and by-products, liver, raw"
  }
 },
 {
  "name": "Ba rọi xông khói (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 393,
   "protein": 13.7,
   "carb": 0,
   "fat": 37.1,
   "fiber": 0,
   "potassium": 201,
   "sodium": 751,
   "calcium": 6,
   "magnesium": 13,
   "iron": 0.38,
   "zinc": 1.14
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168277",
   "name": "Pork, cured, bacon, unprepared"
  }
 },
 {
  "name": "Cá chép (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 127,
   "protein": 17.8,
   "carb": 0,
   "fat": 5.6,
   "fiber": 0,
   "potassium": 333,
   "sodium": 49,
   "calcium": 41,
   "magnesium": 29,
   "iron": 1.24,
   "zinc": 1.48
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171952",
   "name": "Fish, carp, raw"
  }
 },
 {
  "name": "Cá trắm (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 127,
   "protein": 17.8,
   "carb": 0,
   "fat": 5.6,
   "fiber": 0,
   "potassium": 333,
   "sodium": 49,
   "calcium": 41,
   "magnesium": 29,
   "iron": 1.24,
   "zinc": 1.48
  },
  "note": "USDA không có cá trắm: dùng cá chép (cùng họ).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171952",
   "name": "Fish, carp, raw"
  }
 },
 {
  "name": "Cá chim (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 164,
   "protein": 18.5,
   "carb": 0,
   "fat": 9.5,
   "fiber": 0,
   "potassium": 381,
   "sodium": 65,
   "calcium": 22,
   "magnesium": 27,
   "iron": 0.6,
   "zinc": 0.72
  },
  "note": "USDA: cá chim Florida (pompano).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173682",
   "name": "Fish, pompano, florida, raw"
  }
 },
 {
  "name": "Cá mú (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 92,
   "protein": 19.4,
   "carb": 0,
   "fat": 1,
   "fiber": 0,
   "potassium": 483,
   "sodium": 53,
   "calcium": 27,
   "magnesium": 31,
   "iron": 0.89,
   "zinc": 0.48
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171962",
   "name": "Fish, grouper, mixed species, raw"
  }
 },
 {
  "name": "Cá chẽm, cá vược (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 97,
   "protein": 18.4,
   "carb": 0,
   "fat": 2,
   "fiber": 0,
   "potassium": 256,
   "sodium": 68,
   "calcium": 10,
   "magnesium": 41,
   "iron": 0.29,
   "zinc": 0.4
  },
  "note": "USDA: cá vược biển, nhiều loài.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "175142",
   "name": "Fish, sea bass, mixed species, raw"
  }
 },
 {
  "name": "Cá tầm (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 105,
   "protein": 16.1,
   "carb": 0,
   "fat": 4,
   "fiber": 0,
   "potassium": 284,
   "sodium": 54,
   "calcium": 13,
   "magnesium": 35,
   "iron": 0.7,
   "zinc": 0.42
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173701",
   "name": "Fish, sturgeon, mixed species, raw"
  }
 },
 {
  "name": "Cá trích (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 158,
   "protein": 18,
   "carb": 0,
   "fat": 9,
   "fiber": 0,
   "potassium": 327,
   "sodium": 90,
   "calcium": 57,
   "magnesium": 32,
   "iron": 1.1,
   "zinc": 0.99
  },
  "note": "USDA: cá trích Đại Tây Dương.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "175116",
   "name": "Fish, herring, Atlantic, raw"
  }
 },
 {
  "name": "Cá cơm (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 131,
   "protein": 20.4,
   "carb": 0,
   "fat": 4.8,
   "fiber": 0,
   "potassium": 383,
   "sodium": 104,
   "calcium": 147,
   "magnesium": 41,
   "iron": 3.25,
   "zinc": 1.72
  },
  "note": "USDA: cá cơm châu Âu.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174182",
   "name": "Fish, anchovy, european, raw"
  }
 },
 {
  "name": "Cá hồng (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 100,
   "protein": 20.5,
   "carb": 0,
   "fat": 1.3,
   "fiber": 0,
   "potassium": 417,
   "sodium": 64,
   "calcium": 32,
   "magnesium": 32,
   "iron": 0.18,
   "zinc": 0.36
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173698",
   "name": "Fish, snapper, mixed species, raw"
  }
 },
 {
  "name": "Cá tuyết (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 82,
   "protein": 17.8,
   "carb": 0,
   "fat": 0.7,
   "fiber": 0,
   "potassium": 413,
   "sodium": 54,
   "calcium": 16,
   "magnesium": 32,
   "iron": 0.38,
   "zinc": 0.45
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171955",
   "name": "Fish, cod, Atlantic, raw"
  }
 },
 {
  "name": "Cá ngừ đóng hộp ngâm nước",
  "group": "PROTEIN",
  "values": {
   "kcal": 116,
   "protein": 25.5,
   "carb": 0,
   "fat": 0.8,
   "fiber": 0,
   "potassium": 237,
   "sodium": 50,
   "calcium": 11,
   "magnesium": 27,
   "iron": 1.53,
   "zinc": 0.77
  },
  "note": "USDA: loại không muối.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171986",
   "name": "Fish, tuna, light, canned in water, without salt, drained solids"
  }
 },
 {
  "name": "Cá mòi đóng hộp ngâm dầu",
  "group": "PROTEIN",
  "values": {
   "kcal": 208,
   "protein": 24.6,
   "carb": 0,
   "fat": 11.5,
   "fiber": 0,
   "potassium": 397,
   "sodium": 307,
   "calcium": 382,
   "magnesium": 39,
   "iron": 2.92,
   "zinc": 1.31
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "175139",
   "name": "Fish, sardine, Atlantic, canned in oil, drained solids with bone"
  }
 },
 {
  "name": "Cua biển (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 87,
   "protein": 18.1,
   "carb": 0,
   "fat": 1.1,
   "fiber": 0,
   "potassium": 329,
   "sodium": 293,
   "calcium": 89,
   "magnesium": 34,
   "iron": 0.74,
   "zinc": 3.54
  },
  "note": "USDA: cua xanh (blue crab).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174204",
   "name": "Crustaceans, crab, blue, raw"
  }
 },
 {
  "name": "Nghêu (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 86,
   "protein": 14.7,
   "carb": 3.6,
   "fat": 1,
   "fiber": 0,
   "potassium": 46,
   "sodium": 601,
   "calcium": 39,
   "magnesium": 19,
   "iron": 1.62,
   "zinc": 0.51
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174214",
   "name": "Mollusks, clam, mixed species, raw"
  }
 },
 {
  "name": "Hàu (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 81,
   "protein": 9.5,
   "carb": 5,
   "fat": 2.3,
   "fiber": 0,
   "potassium": 168,
   "sodium": 106,
   "calcium": 8,
   "magnesium": 22,
   "iron": 5.11,
   "zinc": 16.62
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174219",
   "name": "Mollusks, oyster, Pacific, raw"
  }
 },
 {
  "name": "Vẹm xanh (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 86,
   "protein": 11.9,
   "carb": 3.7,
   "fat": 2.2,
   "fiber": 0,
   "potassium": 320,
   "sodium": 286,
   "calcium": 26,
   "magnesium": 34,
   "iron": 3.95,
   "zinc": 1.6
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174216",
   "name": "Mollusks, mussel, blue, raw"
  }
 },
 {
  "name": "Ốc (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 90,
   "protein": 16.1,
   "carb": 2,
   "fat": 1.4,
   "fiber": 0,
   "potassium": 382,
   "sodium": 70,
   "calcium": 10,
   "magnesium": 250,
   "iron": 3.5,
   "zinc": 1
  },
  "note": "USDA: ốc sên ăn được (snail).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "167744",
   "name": "Mollusks, snail, raw"
  }
 },
 {
  "name": "Bạch tuộc (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 82,
   "protein": 14.9,
   "carb": 2.2,
   "fat": 1,
   "fiber": 0,
   "potassium": 350,
   "sodium": 230,
   "calcium": 53,
   "magnesium": 30,
   "iron": 5.3,
   "zinc": 1.68
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174218",
   "name": "Mollusks, octopus, common, raw"
  }
 },
 {
  "name": "Sò điệp (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 69,
   "protein": 12.1,
   "carb": 3.2,
   "fat": 0.5,
   "fiber": 0,
   "potassium": 205,
   "sodium": 392,
   "calcium": 6,
   "magnesium": 22,
   "iron": 0.38,
   "zinc": 0.91
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174220",
   "name": "Mollusks, scallop, mixed species, raw"
  }
 },
 {
  "name": "Tôm hùm (sống)",
  "group": "PROTEIN",
  "values": {
   "kcal": 77,
   "protein": 16.5,
   "carb": 0,
   "fat": 0.8,
   "fiber": 0,
   "potassium": 200,
   "sodium": 423,
   "calcium": 84,
   "magnesium": 38,
   "iron": 0.26,
   "zinc": 3.53
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174208",
   "name": "Crustaceans, lobster, northern, raw"
  }
 },
 {
  "name": "Sữa tươi ít béo 2%",
  "group": "PROTEIN",
  "values": {
   "kcal": 50,
   "protein": 3.3,
   "carb": 4.8,
   "fat": 2,
   "fiber": 0,
   "potassium": 140,
   "sodium": 47,
   "calcium": 120,
   "magnesium": 11,
   "iron": 0.02,
   "zinc": 0.48
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172205",
   "name": "Milk, reduced fat, fluid, 2% milkfat, without added vitamin A and vitamin D"
  }
 },
 {
  "name": "Sữa tách béo",
  "group": "PROTEIN",
  "values": {
   "kcal": 35,
   "protein": 3.4,
   "carb": 4.9,
   "fat": 0.2,
   "fiber": 0,
   "potassium": 156,
   "sodium": 42,
   "calcium": 122,
   "magnesium": 11,
   "iron": 0.03,
   "zinc": 0.42
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173432",
   "name": "Milk, nonfat, fluid, without added vitamin A and vitamin D (fat free or skim)"
  }
 },
 {
  "name": "Sữa chua không đường",
  "group": "PROTEIN",
  "values": {
   "kcal": 61,
   "protein": 3.5,
   "carb": 4.7,
   "fat": 3.3,
   "fiber": 0,
   "potassium": 155,
   "sodium": 46,
   "calcium": 121,
   "magnesium": 12,
   "iron": 0.05,
   "zinc": 0.59
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171284",
   "name": "Yogurt, plain, whole milk"
  }
 },
 {
  "name": "Sữa đặc có đường",
  "group": "KHAC",
  "values": {
   "kcal": 321,
   "protein": 7.9,
   "carb": 54.4,
   "fat": 8.7,
   "fiber": 0,
   "potassium": 371,
   "sodium": 127,
   "calcium": 284,
   "magnesium": 26,
   "iron": 0.19,
   "zinc": 0.94
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171275",
   "name": "Milk, canned, condensed, sweetened"
  }
 },
 {
  "name": "Bơ lạt (bơ động vật, có muối)",
  "group": "FAT",
  "values": {
   "kcal": 717,
   "protein": 0.9,
   "carb": 0.1,
   "fat": 81.1,
   "fiber": 0,
   "potassium": 24,
   "sodium": 643,
   "calcium": 24,
   "magnesium": 2,
   "iron": 0.02,
   "zinc": 0.09
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173410",
   "name": "Butter, salted"
  }
 },
 {
  "name": "Phô mai cottage",
  "group": "PROTEIN",
  "values": {
   "kcal": 72,
   "protein": 12.4,
   "carb": 2.7,
   "fat": 1,
   "fiber": 0,
   "potassium": 86,
   "sodium": 406,
   "calcium": 61,
   "magnesium": 5,
   "iron": 0.14,
   "zinc": 0.38
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173417",
   "name": "Cheese, cottage, lowfat, 1% milkfat"
  }
 },
 {
  "name": "Bún khô",
  "group": "CARB",
  "values": {
   "kcal": 364,
   "protein": 6,
   "carb": 80.2,
   "fat": 0.6,
   "fiber": 1.6,
   "potassium": 30,
   "sodium": 182,
   "calcium": 18,
   "magnesium": 12,
   "iron": 0.7,
   "zinc": 0.74
  },
  "note": "Cùng số liệu với \"Bánh phở khô\" (USDA: bún gạo khô).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169742",
   "name": "Rice noodles, dry"
  }
 },
 {
  "name": "Mì trứng khô",
  "group": "CARB",
  "values": {
   "kcal": 384,
   "protein": 14.2,
   "carb": 71.3,
   "fat": 4.4,
   "fiber": 3.3,
   "potassium": 244,
   "sodium": 21,
   "calcium": 35,
   "magnesium": 58,
   "iron": 1.9,
   "zinc": 1.92
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169755",
   "name": "Noodles, egg, dry, unenriched"
  }
 },
 {
  "name": "Bánh tráng (đã nhúng nước)",
  "group": "CARB",
  "values": {
   "kcal": 154.4,
   "protein": 3.3,
   "carb": 33.2,
   "fat": 0.9,
   "fiber": 1,
   "potassium": 65,
   "sodium": 766,
   "calcium": 4,
   "magnesium": 32,
   "iron": 0.23,
   "zinc": 0.66
  },
  "note": "Bảng Úc: bánh tráng đã nhúng nước.",
  "approved": true,
  "source": {
   "db": "AU",
   "id": "F007639",
   "name": "Rice paper wrapper, soaked in water",
   "carbConverted": true
  }
 },
 {
  "name": "Bột gạo",
  "group": "CARB",
  "values": {
   "kcal": 366,
   "protein": 6,
   "carb": 80.1,
   "fat": 1.4,
   "fiber": 2.4,
   "potassium": 76,
   "sodium": 0,
   "calcium": 10,
   "magnesium": 35,
   "iron": 0.35,
   "zinc": 0.8
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169714",
   "name": "Rice flour, white, unenriched"
  }
 },
 {
  "name": "Trân châu khô (bột năng)",
  "group": "CARB",
  "values": {
   "kcal": 358,
   "protein": 0.2,
   "carb": 88.7,
   "fat": 0,
   "fiber": 0.9,
   "potassium": 11,
   "sodium": 1,
   "calcium": 20,
   "magnesium": 1,
   "iron": 1.58,
   "zinc": 0.12
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169717",
   "name": "Tapioca, pearl, dry"
  }
 },
 {
  "name": "Mì Ý khô",
  "group": "CARB",
  "values": {
   "kcal": 371,
   "protein": 13,
   "carb": 74.7,
   "fat": 1.5,
   "fiber": 3.2,
   "potassium": 223,
   "sodium": 6,
   "calcium": 21,
   "magnesium": 53,
   "iron": 3.3,
   "zinc": 1.41
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169736",
   "name": "Pasta, dry, enriched"
  }
 },
 {
  "name": "Mì gói (vắt mì khô)",
  "group": "CARB",
  "values": {
   "kcal": 440,
   "protein": 10.2,
   "carb": 60.3,
   "fat": 17.6,
   "fiber": 2.9,
   "potassium": 181,
   "sodium": 1855,
   "calcium": 21,
   "magnesium": 25,
   "iron": 4.11,
   "zinc": 0.6
  },
  "note": "USDA: mì ramen ăn liền, vắt khô, không gói gia vị riêng.",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171177",
   "name": "Soup, ramen noodle, any flavor, dry"
  }
 },
 {
  "name": "Xôi nếp luộc",
  "group": "CARB",
  "values": {
   "kcal": 97,
   "protein": 2,
   "carb": 21.1,
   "fat": 0.2,
   "fiber": 1,
   "potassium": 10,
   "sodium": 5,
   "calcium": 2,
   "magnesium": 5,
   "iron": 0.14,
   "zinc": 0.41
  },
  "note": "USDA: nếp luộc (loãng hơn xôi hấp trong bảng cũ).",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169711",
   "name": "Rice, white, glutinous, unenriched, cooked"
  }
 },
 {
  "name": "Gạo lứt (sống)",
  "group": "CARB",
  "values": {
   "kcal": 367,
   "protein": 7.5,
   "carb": 76.3,
   "fat": 3.2,
   "fiber": 3.6,
   "potassium": 250,
   "sodium": 5,
   "calcium": 9,
   "magnesium": 116,
   "iron": 1.29,
   "zinc": 2.13
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169703",
   "name": "Rice, brown, long-grain, raw (Includes foods for USDA's Food Distribution Program)"
  }
 },
 {
  "name": "Óc chó",
  "group": "FAT",
  "values": {
   "kcal": 654,
   "protein": 15.2,
   "carb": 13.7,
   "fat": 65.2,
   "fiber": 6.7,
   "potassium": 441,
   "sodium": 2,
   "calcium": 98,
   "magnesium": 158,
   "iron": 2.91,
   "zinc": 3.09
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170187",
   "name": "Nuts, walnuts, english"
  }
 },
 {
  "name": "Hạt dẻ cười",
  "group": "FAT",
  "values": {
   "kcal": 560,
   "protein": 20.2,
   "carb": 27.2,
   "fat": 45.3,
   "fiber": 10.6,
   "potassium": 1025,
   "sodium": 1,
   "calcium": 105,
   "magnesium": 121,
   "iron": 3.92,
   "zinc": 2.2
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170184",
   "name": "Nuts, pistachio nuts, raw"
  }
 },
 {
  "name": "Hạt chia",
  "group": "FAT",
  "values": {
   "kcal": 486,
   "protein": 16.5,
   "carb": 42.1,
   "fat": 30.7,
   "fiber": 34.4,
   "potassium": 407,
   "sodium": 16,
   "calcium": 631,
   "magnesium": 335,
   "iron": 7.72,
   "zinc": 4.58
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170554",
   "name": "Seeds, chia seeds, dried"
  }
 },
 {
  "name": "Hạt hướng dương (nhân)",
  "group": "FAT",
  "values": {
   "kcal": 584,
   "protein": 20.8,
   "carb": 20,
   "fat": 51.5,
   "fiber": 8.6,
   "potassium": 645,
   "sodium": 9,
   "calcium": 78,
   "magnesium": 325,
   "iron": 5.25,
   "zinc": 5
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170562",
   "name": "Seeds, sunflower seed kernels, dried"
  }
 },
 {
  "name": "Hạt bí (nhân)",
  "group": "FAT",
  "values": {
   "kcal": 559,
   "protein": 30.2,
   "carb": 10.7,
   "fat": 49.1,
   "fiber": 6,
   "potassium": 809,
   "sodium": 7,
   "calcium": 46,
   "magnesium": 592,
   "iron": 8.82,
   "zinc": 7.81
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "170556",
   "name": "Seeds, pumpkin and squash seed kernels, dried"
  }
 },
 {
  "name": "Nước mắm",
  "group": "KHAC",
  "values": {
   "kcal": 35,
   "protein": 5.1,
   "carb": 3.6,
   "fat": 0,
   "fiber": 0,
   "potassium": 288,
   "sodium": 7851,
   "calcium": 43,
   "magnesium": 175,
   "iron": 0.78,
   "zinc": 0.2
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174531",
   "name": "Sauce, fish, ready-to-serve"
  }
 },
 {
  "name": "Nước tương",
  "group": "KHAC",
  "values": {
   "kcal": 53,
   "protein": 8.1,
   "carb": 4.9,
   "fat": 0.6,
   "fiber": 0.8,
   "potassium": 435,
   "sodium": 5493,
   "calcium": 33,
   "magnesium": 74,
   "iron": 1.45,
   "zinc": 0.87
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "174277",
   "name": "Soy sauce made from soy and wheat (shoyu)"
  }
 },
 {
  "name": "Muối ăn",
  "group": "KHAC",
  "values": {
   "kcal": 0,
   "protein": 0,
   "carb": 0,
   "fat": 0,
   "fiber": 0,
   "potassium": 8,
   "sodium": 38758,
   "calcium": 24,
   "magnesium": 1,
   "iron": 0.33,
   "zinc": 0.1
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173468",
   "name": "Salt, table"
  }
 },
 {
  "name": "Mật ong",
  "group": "KHAC",
  "values": {
   "kcal": 304,
   "protein": 0.3,
   "carb": 82.4,
   "fat": 0,
   "fiber": 0.2,
   "potassium": 52,
   "sodium": 4,
   "calcium": 6,
   "magnesium": 2,
   "iron": 0.42,
   "zinc": 0.22
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "169640",
   "name": "Honey"
  }
 },
 {
  "name": "Đường nâu",
  "group": "KHAC",
  "values": {
   "kcal": 380,
   "protein": 0.1,
   "carb": 98.1,
   "fat": 0,
   "fiber": 0,
   "potassium": 133,
   "sodium": 28,
   "calcium": 83,
   "magnesium": 9,
   "iron": 0.71,
   "zinc": 0.03
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "168833",
   "name": "Sugars, brown"
  }
 },
 {
  "name": "Giấm táo",
  "group": "KHAC",
  "values": {
   "kcal": 21,
   "protein": 0,
   "carb": 0.9,
   "fat": 0,
   "fiber": 0,
   "potassium": 73,
   "sodium": 5,
   "calcium": 7,
   "magnesium": 5,
   "iron": 0.2,
   "zinc": 0.04
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173469",
   "name": "Vinegar, cider"
  }
 },
 {
  "name": "Giấm balsamic",
  "group": "KHAC",
  "values": {
   "kcal": 88,
   "protein": 0.5,
   "carb": 17,
   "fat": 0,
   "fiber": null,
   "potassium": 112,
   "sodium": 23,
   "calcium": 27,
   "magnesium": 12,
   "iron": 0.72,
   "zinc": 0.08
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "172241",
   "name": "Vinegar, balsamic"
  }
 },
 {
  "name": "Dầu mè",
  "group": "FAT",
  "values": {
   "kcal": 884,
   "protein": 0,
   "carb": 0,
   "fat": 100,
   "fiber": 0,
   "potassium": 0,
   "sodium": 0,
   "calcium": 0,
   "magnesium": 0,
   "iron": 0,
   "zinc": 0
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171016",
   "name": "Oil, sesame, salad or cooking"
  }
 },
 {
  "name": "Dầu đậu phộng",
  "group": "FAT",
  "values": {
   "kcal": 884,
   "protein": 0,
   "carb": 0,
   "fat": 100,
   "fiber": 0,
   "potassium": 0,
   "sodium": 0,
   "calcium": 0,
   "magnesium": 0,
   "iron": 0.03,
   "zinc": 0.01
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171410",
   "name": "Oil, peanut, salad or cooking"
  }
 },
 {
  "name": "Kem dừa",
  "group": "FAT",
  "values": {
   "kcal": 217,
   "protein": 1.6,
   "carb": 1.4,
   "fat": 23.2,
   "fiber": 0,
   "potassium": 130,
   "sodium": 16,
   "calcium": 2,
   "magnesium": 20,
   "iron": 0.51,
   "zinc": 0.26
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "AU",
   "id": "F002982",
   "name": "Coconut, cream, regular fat",
   "carbConverted": true
  }
 },
 {
  "name": "Trà xanh (pha)",
  "group": "KHAC",
  "values": {
   "kcal": 1,
   "protein": 0.2,
   "carb": 0,
   "fat": 0,
   "fiber": 0,
   "potassium": 8,
   "sodium": 1,
   "calcium": 0,
   "magnesium": 1,
   "iron": 0.02,
   "zinc": 0.01
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171917",
   "name": "Beverages, tea, green, brewed, regular"
  }
 },
 {
  "name": "Cà phê đen (pha)",
  "group": "KHAC",
  "values": {
   "kcal": 1,
   "protein": 0.1,
   "carb": 0,
   "fat": 0,
   "fiber": 0,
   "potassium": 49,
   "sodium": 2,
   "calcium": 2,
   "magnesium": 3,
   "iron": 0.01,
   "zinc": 0.02
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "171890",
   "name": "Beverages, coffee, brewed, prepared with tap water"
  }
 },
 {
  "name": "Nước lọc",
  "group": "KHAC",
  "values": {
   "kcal": 0,
   "protein": 0,
   "carb": 0,
   "fat": 0,
   "fiber": 0,
   "potassium": 0,
   "sodium": 4,
   "calcium": 3,
   "magnesium": 1,
   "iron": 0,
   "zinc": 0.01
  },
  "note": "",
  "approved": true,
  "source": {
   "db": "USDA",
   "id": "173647",
   "name": "Beverages, water, tap, drinking"
  }
 }
]);

/** Món có calo lệch quá 15% so với 4×đạm + 4×carb + 9×béo, để David xem. */
export const EXTRA_ENERGY_MISMATCHES = Object.freeze([
 "Lá chùm ngây: 64 kcal, ước theo đa chất 79 kcal",
 "Mộc nhĩ khô: 284 kcal, ước theo đa chất 195 kcal",
 "Giấm táo: 21 kcal, ước theo đa chất 4 kcal",
 "Giấm balsamic: 88 kcal, ước theo đa chất 70 kcal"
]);

/** Bản dịch đã sửa trong danh sách tên của David, và món không có nguồn. */
export const EXTRA_TRANSLATION_FIXES = Object.freeze([
 [
  "Rau ngót",
  "ghi là sawtooth coriander (đó là ngò gai)",
  "rau ngót là katuk (Sauropus androgynus)"
 ],
 [
  "Bồ ngót",
  "ghi là moringa leaves (đó là lá chùm ngây)",
  "bồ ngót là tên khác của rau ngót; lá chùm ngây được thêm thành món riêng"
 ],
 [
  "Rau răm",
  "ghi là coriander (đó là ngò rí)",
  "rau răm là Vietnamese coriander (Persicaria odorata)"
 ],
 [
  "Lá mơ",
  "ghi là Vietnamese coriander (đó là rau răm)",
  "lá mơ là Paederia foetida"
 ],
 [
  "Rau sam",
  "ghi là watercress (đó là cải xoong)",
  "rau sam là purslane"
 ],
 [
  "Điền thanh",
  "ghi là watercress (đó là cải xoong)",
  "điền thanh là Sesbania; đã thêm bông điên điển"
 ],
 [
  "Mồng tơi",
  "ghi là jute leaves (đó là rau đay)",
  "mồng tơi là Malabar spinach (Basella); rau đay được thêm thành món riêng"
 ],
 [
  "Tần ô",
  "ghi là amaranth (đó là rau dền)",
  "tần ô là cải cúc (chrysanthemum greens)"
 ],
 [
  "Hẹ",
  "ghi là leeks (đó là tỏi tây, boa rô)",
  "hẹ là garlic chives"
 ],
 [
  "Tỏi tây",
  "ghi là elephant garlic",
  "tỏi tây (boa rô) là leek"
 ],
 [
  "Mận",
  "ghi là prune (mận khô)",
  "đã thêm mận tây tươi; mận hồng đào Việt Nam (roi) không có trong các bảng"
 ],
 [
  "Nấm mỡ vàng",
  "ghi là chanterelle (đó là nấm mồng gà)",
  "đã thêm nấm mồng gà theo đúng tên"
 ],
 [
  "Nấm mỡ đen",
  "ghi là porcini",
  "porcini là nấm thông (Boletus); không có trong các bảng"
 ],
 [
  "Nấm tai mèo",
  "ghi là blewit",
  "nấm tai mèo là mộc nhĩ (wood ear); đã thêm mộc nhĩ"
 ],
 [
  "Nấm cục",
  "ghi là morel (đó là nấm múi)",
  "nấm cục là truffle; đã thêm nấm múi theo đúng tên"
 ]
]);
export const EXTRA_NO_SOURCE = Object.freeze([
 [
  "Rau ngót, rau răm, lá lốt, kinh giới, rau má, ngò gai, ngò om, tía tô, diếp cá, lá chanh, lá đinh lăng, lá mắc mật, riềng",
  "Rau thơm và lá Việt Nam: USDA, Úc và Na Uy đều không có. Chờ Bảng thành phần thực phẩm Việt Nam."
 ],
 [
  "Cá lóc (cá quả), cá kèo, cá bống, cá rô đồng, cá dầm xanh, cá bớp, cá đuối, cá khoai, cá lăng, cá nục, cá sặc, cá sơn, cá thác lác, cá thìa, cá trê",
  "Cá nước ngọt và cá biển Việt Nam: không có trong các bảng. Cá diêu hồng dùng chung số liệu cá rô phi trong bảng cũ."
 ],
 [
  "Măng cụt, thanh long, mận hồng đào (roi), trái nhàu",
  "Không có dạng tươi trong các bảng (USDA chỉ có măng cụt đóng hộp)."
 ],
 [
  "Lạp xưởng, chả lụa, giò",
  "Không có trong các bảng."
 ],
 [
  "Khoảng 40 loại nấm rừng châu Âu trong danh sách (nấm Caesar, nấm thông, nấm cục…)",
  "Không có trong các bảng, và học viên Việt Nam hiếm khi ăn."
 ]
]);

export const FOOD_DATA_SOURCES = Object.freeze([
  'USDA FoodData Central, SR Legacy (2018-04)',
  "Australian Food Composition Database (Food Standards Australia New Zealand)",
  "The Norwegian Food Composition Table 2022 (Matvaretabellen)",
  'Standard Tables of Food Composition in Japan 2020, 8th ed. (MEXT)',
]);

const BY_NAME = new Map(EXTRA_FOODS.map((food) => [food.name, food]));
/** Món mới theo tên (kể cả chưa duyệt, để tính lại món đã ghi). */
export function getExtraFood(name) { return BY_NAME.get(name) || null; }
/** Món mới học viên được chọn: chỉ món David đã duyệt. */
export function approvedExtraFoods() { return EXTRA_FOODS.filter((food) => food.approved); }
