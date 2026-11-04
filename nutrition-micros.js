// ============================================================
// DAVID COACHING — Vi chất của bảng thực phẩm (mg trên 100 g, đúng trạng thái như tên món)
// ============================================================
// SINH TỰ ĐỘNG bởi scripts/usda/build-micros.mjs từ USDA FoodData Central (SR Legacy 2018-04,
// dữ liệu công khai). Đừng sửa tay: sửa scripts/usda/food-map.json rồi chạy lại script.
// Khi có Bảng thành phần thực phẩm Việt Nam, scripts/import-vn-foods.mjs ghi đè các món khớp.
//
// null = chưa có số liệu đáng tin (không đoán). Calo và đa chất vẫn lấy từ nutrition-foods.js;
// usdaMacros chỉ để đối chiếu trên trang duyệt.

export const MICRO_KEYS = Object.freeze(["potassium","sodium","calcium","magnesium","iron","zinc"]);
/** 9 vitamin trên 100 g: A µg RAE, C mg, D µg, E mg, K µg, B1 mg, B6 mg, folate µg DFE, B12 µg. */
export const VITAMIN_KEYS = Object.freeze(["vitaminA","vitaminC","vitaminD","vitaminE","vitaminK","vitaminB1","vitaminB6","folate","vitaminB12"]);

export const FOOD_MICROS = Object.freeze({
  "Cơm trắng (chín)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169757,
      "description": "Rice, white, long-grain, regular, unenriched, cooked without salt"
    },
    "note": "USDA: gạo tẻ hạt dài không bổ sung vi chất, nấu không muối.",
    "micros": {
      "potassium": 35,
      "sodium": 1,
      "calcium": 10,
      "magnesium": 12,
      "iron": 0.2,
      "zinc": 0.49
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.04,
      "vitaminK": 0,
      "vitaminB1": 0.02,
      "vitaminB6": 0.09,
      "folate": 3,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 130,
      "protein": 2.69,
      "carb": 28.17,
      "fat": 0.28,
      "fiber": 0.4
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cơm gạo lứt (chín)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169704,
      "description": "Rice, brown, long-grain, cooked (Includes foods for USDA's Food Distribution Program)"
    },
    "note": "",
    "micros": {
      "potassium": 86,
      "sodium": 4,
      "calcium": 3,
      "magnesium": 39,
      "iron": 0.56,
      "zinc": 0.71
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.17,
      "vitaminK": 0.2,
      "vitaminB1": 0.18,
      "vitaminB6": 0.12,
      "folate": 9,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 123,
      "protein": 2.74,
      "carb": 25.58,
      "fat": 0.97,
      "fiber": 1.6
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bún tươi": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168914,
      "description": "Rice noodles, cooked"
    },
    "note": "USDA: bún gạo luộc.",
    "micros": {
      "potassium": 4,
      "sodium": 19,
      "calcium": 4,
      "magnesium": 3,
      "iron": 0.14,
      "zinc": 0.25
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.03,
      "vitaminK": 0,
      "vitaminB1": 0.02,
      "vitaminB6": 0.01,
      "folate": 1,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 108,
      "protein": 1.79,
      "carb": 24.01,
      "fat": 0.2,
      "fiber": 1
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bánh phở tươi": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168914,
      "description": "Rice noodles, cooked"
    },
    "note": "USDA không có bánh phở tươi riêng: dùng bún gạo luộc.",
    "micros": {
      "potassium": 4,
      "sodium": 19,
      "calcium": 4,
      "magnesium": 3,
      "iron": 0.14,
      "zinc": 0.25
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.03,
      "vitaminK": 0,
      "vitaminB1": 0.02,
      "vitaminB6": 0.01,
      "folate": 1,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 108,
      "protein": 1.79,
      "carb": 24.01,
      "fat": 0.2,
      "fiber": 1
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bánh phở khô": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169742,
      "description": "Rice noodles, dry"
    },
    "note": "",
    "micros": {
      "potassium": 30,
      "sodium": 182,
      "calcium": 18,
      "magnesium": 12,
      "iron": 0.7,
      "zinc": 0.74
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.11,
      "vitaminK": 0,
      "vitaminB1": 0.03,
      "vitaminB6": 0.02,
      "folate": 3,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 364,
      "protein": 5.95,
      "carb": 80.18,
      "fat": 0.56,
      "fiber": 1.6
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Miến dong (khô)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 174258,
      "description": "Noodles, chinese, cellophane or long rice (mung beans), dehydrated"
    },
    "note": "USDA chỉ có miến đậu xanh khô; miến dong làm từ củ dong nên vi chất có thể khác.",
    "micros": {
      "potassium": 10,
      "sodium": 10,
      "calcium": 25,
      "magnesium": 3,
      "iron": 2.17,
      "zinc": 0.41
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.13,
      "vitaminK": 0,
      "vitaminB1": 0.15,
      "vitaminB6": 0.05,
      "folate": 2,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 351,
      "protein": 0.16,
      "carb": 86.09,
      "fat": 0.06,
      "fiber": 0.5
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bánh mì trắng": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 174924,
      "description": "Bread, white, commercially prepared (includes soft bread crumbs)"
    },
    "note": "USDA: bánh mì làm từ bột mì có bổ sung sắt; bánh mì Việt Nam có thể khác.",
    "micros": {
      "potassium": 126,
      "sodium": 490,
      "calcium": 144,
      "magnesium": 23,
      "iron": 3.61,
      "zinc": 0.74
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.22,
      "vitaminK": 0.2,
      "vitaminB1": 0.53,
      "vitaminB6": 0.09,
      "folate": 171,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 266,
      "protein": 8.85,
      "carb": 49.42,
      "fat": 3.33,
      "fiber": 2.7
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bánh mì nguyên cám": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 172688,
      "description": "Bread, whole-wheat, commercially prepared"
    },
    "note": "USDA: bánh mì nguyên cám đóng gói của Mỹ.",
    "micros": {
      "potassium": 254,
      "sodium": 455,
      "calcium": 161,
      "magnesium": 75,
      "iron": 2.47,
      "zinc": 1.77
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 2.66,
      "vitaminK": 7.8,
      "vitaminB1": 0.39,
      "vitaminB6": 0.22,
      "folate": 42,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 252,
      "protein": 12.45,
      "carb": 42.71,
      "fat": 3.5,
      "fiber": 6
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Yến mạch (khô)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169705,
      "description": "Oats (Includes foods for USDA's Food Distribution Program)"
    },
    "note": "",
    "micros": {
      "potassium": 429,
      "sodium": 2,
      "calcium": 54,
      "magnesium": 177,
      "iron": 4.72,
      "zinc": 3.97
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": 0.76,
      "vitaminB6": 0.12,
      "folate": 56,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 389,
      "protein": 16.89,
      "carb": 66.27,
      "fat": 6.9,
      "fiber": 10.6
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Khoai lang (luộc)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168484,
      "description": "Sweet potato, cooked, boiled, without skin"
    },
    "note": "",
    "micros": {
      "potassium": 230,
      "sodium": 27,
      "calcium": 27,
      "magnesium": 18,
      "iron": 0.72,
      "zinc": 0.2
    },
    "vitamins": {
      "vitaminA": 787,
      "vitaminC": 12.8,
      "vitaminD": 0,
      "vitaminE": 0.94,
      "vitaminK": 2.1,
      "vitaminB1": 0.06,
      "vitaminB6": 0.17,
      "folate": 6,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 76,
      "protein": 1.37,
      "carb": 17.72,
      "fat": 0.14,
      "fiber": 2.5
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Khoai tây (luộc)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170440,
      "description": "Potatoes, boiled, cooked without skin, flesh, without salt"
    },
    "note": "",
    "micros": {
      "potassium": 328,
      "sodium": 5,
      "calcium": 8,
      "magnesium": 20,
      "iron": 0.31,
      "zinc": 0.27
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 7.4,
      "vitaminD": 0,
      "vitaminE": 0.01,
      "vitaminK": 2.2,
      "vitaminB1": 0.1,
      "vitaminB6": 0.27,
      "folate": 9,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 86,
      "protein": 1.71,
      "carb": 20.01,
      "fat": 0.1,
      "fiber": 1.8
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bắp ngọt (luộc)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169999,
      "description": "Corn, sweet, yellow, cooked, boiled, drained, without salt"
    },
    "note": "",
    "micros": {
      "potassium": 218,
      "sodium": 1,
      "calcium": 3,
      "magnesium": 26,
      "iron": 0.45,
      "zinc": 0.62
    },
    "vitamins": {
      "vitaminA": 13,
      "vitaminC": 5.5,
      "vitaminD": 0,
      "vitaminE": 0.09,
      "vitaminK": 0.4,
      "vitaminB1": 0.09,
      "vitaminB6": 0.14,
      "folate": 23,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 96,
      "protein": 3.41,
      "carb": 20.98,
      "fat": 1.5,
      "fiber": 2.4
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Chuối": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 173944,
      "description": "Bananas, raw"
    },
    "note": "",
    "micros": {
      "potassium": 358,
      "sodium": 1,
      "calcium": 5,
      "magnesium": 27,
      "iron": 0.26,
      "zinc": 0.15
    },
    "vitamins": {
      "vitaminA": 3,
      "vitaminC": 8.7,
      "vitaminD": 0,
      "vitaminE": 0.1,
      "vitaminK": 0.5,
      "vitaminB1": 0.03,
      "vitaminB6": 0.37,
      "folate": 20,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 89,
      "protein": 1.09,
      "carb": 22.84,
      "fat": 0.33,
      "fiber": 2.6
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Táo": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 171688,
      "description": "Apples, raw, with skin (Includes foods for USDA's Food Distribution Program)"
    },
    "note": "",
    "micros": {
      "potassium": 107,
      "sodium": 1,
      "calcium": 6,
      "magnesium": 5,
      "iron": 0.12,
      "zinc": 0.04
    },
    "vitamins": {
      "vitaminA": 3,
      "vitaminC": 4.6,
      "vitaminD": 0,
      "vitaminE": 0.18,
      "vitaminK": 2.2,
      "vitaminB1": 0.02,
      "vitaminB6": 0.04,
      "folate": 3,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 52,
      "protein": 0.26,
      "carb": 13.81,
      "fat": 0.17,
      "fiber": 2.4
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cam": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169097,
      "description": "Oranges, raw, all commercial varieties"
    },
    "note": "",
    "micros": {
      "potassium": 181,
      "sodium": 0,
      "calcium": 40,
      "magnesium": 10,
      "iron": 0.1,
      "zinc": 0.07
    },
    "vitamins": {
      "vitaminA": 11,
      "vitaminC": 53.2,
      "vitaminD": 0,
      "vitaminE": 0.18,
      "vitaminK": 0,
      "vitaminB1": 0.09,
      "vitaminB6": 0.06,
      "folate": 30,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 47,
      "protein": 0.94,
      "carb": 11.75,
      "fat": 0.12,
      "fiber": 2.4
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Xoài chín": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169910,
      "description": "Mangos, raw"
    },
    "note": "",
    "micros": {
      "potassium": 168,
      "sodium": 1,
      "calcium": 11,
      "magnesium": 10,
      "iron": 0.16,
      "zinc": 0.09
    },
    "vitamins": {
      "vitaminA": 54,
      "vitaminC": 36.4,
      "vitaminD": 0,
      "vitaminE": 0.9,
      "vitaminK": 4.2,
      "vitaminB1": 0.03,
      "vitaminB6": 0.12,
      "folate": 43,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 60,
      "protein": 0.82,
      "carb": 14.98,
      "fat": 0.38,
      "fiber": 1.6
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Thanh long ruột trắng": {
    "source": null,
    "note": "USDA không có thanh long. Chờ bảng thành phần thực phẩm Việt Nam.",
    "micros": {
      "potassium": null,
      "sodium": null,
      "calcium": null,
      "magnesium": null,
      "iron": null,
      "zinc": null
    },
    "vitamins": {
      "vitaminA": null,
      "vitaminC": null,
      "vitaminD": null,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": null,
      "vitaminB6": null,
      "folate": null,
      "vitaminB12": null
    },
    "microSource": {
      "potassium": null,
      "sodium": null,
      "calcium": null,
      "magnesium": null,
      "iron": null,
      "zinc": null
    }
  },
  "Ổi": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 173044,
      "description": "Guavas, common, raw"
    },
    "note": "",
    "micros": {
      "potassium": 417,
      "sodium": 2,
      "calcium": 18,
      "magnesium": 22,
      "iron": 0.26,
      "zinc": 0.23
    },
    "vitamins": {
      "vitaminA": 31,
      "vitaminC": 228.3,
      "vitaminD": 0,
      "vitaminE": 0.73,
      "vitaminK": 2.6,
      "vitaminB1": 0.07,
      "vitaminB6": 0.11,
      "folate": 49,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 68,
      "protein": 2.55,
      "carb": 14.32,
      "fat": 0.95,
      "fiber": 5.4
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Đu đủ chín": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169926,
      "description": "Papayas, raw"
    },
    "note": "",
    "micros": {
      "potassium": 182,
      "sodium": 8,
      "calcium": 20,
      "magnesium": 21,
      "iron": 0.25,
      "zinc": 0.08
    },
    "vitamins": {
      "vitaminA": 47,
      "vitaminC": 60.9,
      "vitaminD": 0,
      "vitaminE": 0.3,
      "vitaminK": 2.6,
      "vitaminB1": 0.02,
      "vitaminB6": 0.04,
      "folate": 37,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 43,
      "protein": 0.47,
      "carb": 10.82,
      "fat": 0.26,
      "fiber": 1.7
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Dưa hấu": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 167765,
      "description": "Watermelon, raw"
    },
    "note": "",
    "micros": {
      "potassium": 112,
      "sodium": 1,
      "calcium": 7,
      "magnesium": 10,
      "iron": 0.24,
      "zinc": 0.1
    },
    "vitamins": {
      "vitaminA": 28,
      "vitaminC": 8.1,
      "vitaminD": 0,
      "vitaminE": 0.05,
      "vitaminK": 0.1,
      "vitaminB1": 0.03,
      "vitaminB6": 0.05,
      "folate": 3,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 30,
      "protein": 0.61,
      "carb": 7.55,
      "fat": 0.15,
      "fiber": 0.4
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Nho": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 174683,
      "description": "Grapes, red or green (European type, such as Thompson seedless), raw"
    },
    "note": "",
    "micros": {
      "potassium": 191,
      "sodium": 2,
      "calcium": 10,
      "magnesium": 7,
      "iron": 0.36,
      "zinc": 0.07
    },
    "vitamins": {
      "vitaminA": 3,
      "vitaminC": 3.2,
      "vitaminD": 0,
      "vitaminE": 0.19,
      "vitaminK": 14.6,
      "vitaminB1": 0.07,
      "vitaminB6": 0.09,
      "folate": 2,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 69,
      "protein": 0.72,
      "carb": 18.1,
      "fat": 0.16,
      "fiber": 0.9
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Gạo nếp (xôi chín)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168883,
      "description": "Rice, white, glutinous, unenriched, uncooked",
      "scaled": 0.477
    },
    "note": "Xôi hấp đặc hơn nếp luộc của USDA: vi chất lấy từ gạo nếp sống, nhân theo tỉ lệ carb của xôi trong bảng (ước tính).",
    "micros": {
      "potassium": 36.8,
      "sodium": 3.3,
      "calcium": 5.3,
      "magnesium": 11,
      "iron": 0.76,
      "zinc": 0.57
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": 0.09,
      "vitaminB6": 0.05,
      "folate": 3.3,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 370,
      "protein": 6.81,
      "carb": 81.68,
      "fat": 0.55,
      "fiber": 2.8
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Đường trắng": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169655,
      "description": "Sugars, granulated"
    },
    "note": "",
    "micros": {
      "potassium": 2,
      "sodium": 1,
      "calcium": 1,
      "magnesium": 0,
      "iron": 0.05,
      "zinc": 0.01
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0,
      "vitaminK": 0,
      "vitaminB1": 0,
      "vitaminB6": 0,
      "folate": 0,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 387,
      "protein": 0,
      "carb": 99.98,
      "fat": 0,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Ức gà bỏ da (sống)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 171077,
      "description": "Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw"
    },
    "note": "",
    "micros": {
      "potassium": 334,
      "sodium": 45,
      "calcium": 5,
      "magnesium": 28,
      "iron": 0.37,
      "zinc": 0.68
    },
    "vitamins": {
      "vitaminA": 9,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.56,
      "vitaminK": 0,
      "vitaminB1": 0.09,
      "vitaminB6": 0.81,
      "folate": 9,
      "vitaminB12": 0.21
    },
    "usdaMacros": {
      "kcal": 120,
      "protein": 22.5,
      "carb": 0,
      "fat": 2.62,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Đùi gà bỏ da (sống)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 173627,
      "description": "Chicken, broilers or fryers, dark meat, thigh, meat only, raw"
    },
    "note": "",
    "micros": {
      "potassium": 242,
      "sodium": 95,
      "calcium": 7,
      "magnesium": 23,
      "iron": 0.81,
      "zinc": 1.58
    },
    "vitamins": {
      "vitaminA": 7,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.18,
      "vitaminK": 2.9,
      "vitaminB1": 0.09,
      "vitaminB6": 0.45,
      "folate": 4,
      "vitaminB12": 0.61
    },
    "usdaMacros": {
      "kcal": 121,
      "protein": 19.66,
      "carb": 0,
      "fat": 4.12,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Thịt heo thăn nạc": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168249,
      "description": "Pork, fresh, loin, tenderloin, separable lean only, raw"
    },
    "note": "",
    "micros": {
      "potassium": 399,
      "sodium": 53,
      "calcium": 5,
      "magnesium": 27,
      "iron": 0.98,
      "zinc": 1.89
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0.2,
      "vitaminE": 0.22,
      "vitaminK": 0,
      "vitaminB1": 1,
      "vitaminB6": 0.78,
      "folate": 0,
      "vitaminB12": 0.51
    },
    "usdaMacros": {
      "kcal": 109,
      "protein": 20.95,
      "carb": 0,
      "fat": 2.17,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Thịt heo ba chỉ": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 167812,
      "description": "Pork, fresh, belly, raw"
    },
    "note": "",
    "micros": {
      "potassium": 185,
      "sodium": 32,
      "calcium": 5,
      "magnesium": 4,
      "iron": 0.52,
      "zinc": 1.02
    },
    "vitamins": {
      "vitaminA": 3,
      "vitaminC": 0.3,
      "vitaminD": null,
      "vitaminE": 0.39,
      "vitaminK": 0,
      "vitaminB1": 0.4,
      "vitaminB6": 0.13,
      "folate": 1,
      "vitaminB12": 0.84
    },
    "usdaMacros": {
      "kcal": 518,
      "protein": 9.34,
      "carb": 0,
      "fat": 53.01,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Thịt bò thăn": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 171812,
      "description": "Beef, tenderloin, steak, separable lean only, trimmed to 1/8\" fat, all grades, raw"
    },
    "note": "",
    "micros": {
      "potassium": 347,
      "sodium": 56,
      "calcium": 24,
      "magnesium": 23,
      "iron": 1.6,
      "zinc": 4.01
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": null,
      "vitaminE": 0.32,
      "vitaminK": 1.3,
      "vitaminB1": 0.07,
      "vitaminB6": 0.62,
      "folate": 13,
      "vitaminB12": 1.09
    },
    "usdaMacros": {
      "kcal": 153,
      "protein": 22.12,
      "carb": 0,
      "fat": 6.52,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Thịt bò bắp": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169441,
      "description": "Beef, shank crosscuts, separable lean only, trimmed to 1/4\" fat, choice, raw"
    },
    "note": "",
    "micros": {
      "potassium": 387,
      "sodium": 63,
      "calcium": 20,
      "magnesium": 14,
      "iron": 2.32,
      "zinc": 6.94
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": null,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": 0.1,
      "vitaminB6": 0.47,
      "folate": 8,
      "vitaminB12": 3.33
    },
    "usdaMacros": {
      "kcal": 128,
      "protein": 21.75,
      "carb": 0,
      "fat": 3.85,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cá basa fillet": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 175165,
      "description": "Fish, catfish, channel, farmed, raw"
    },
    "note": "USDA không có cá basa: dùng cá nheo nuôi (cùng bộ cá da trơn).",
    "micros": {
      "potassium": 302,
      "sodium": 98,
      "calcium": 8,
      "magnesium": 19,
      "iron": 0.23,
      "zinc": 0.48
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0.2,
      "vitaminE": 0.81,
      "vitaminK": 2.1,
      "vitaminB1": 0.02,
      "vitaminB6": 0.15,
      "folate": 10,
      "vitaminB12": 2.88
    },
    "usdaMacros": {
      "kcal": 119,
      "protein": 15.23,
      "carb": 0,
      "fat": 5.94,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cá hồi fillet": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 175167,
      "description": "Fish, salmon, Atlantic, farmed, raw"
    },
    "note": "",
    "micros": {
      "potassium": 363,
      "sodium": 59,
      "calcium": 9,
      "magnesium": 27,
      "iron": 0.34,
      "zinc": 0.36
    },
    "vitamins": {
      "vitaminA": 58,
      "vitaminC": 3.9,
      "vitaminD": 11,
      "vitaminE": 3.55,
      "vitaminK": 0.5,
      "vitaminB1": 0.21,
      "vitaminB6": 0.64,
      "folate": 26,
      "vitaminB12": 3.23
    },
    "usdaMacros": {
      "kcal": 208,
      "protein": 20.42,
      "carb": 0,
      "fat": 13.42,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cá thu": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 175119,
      "description": "Fish, mackerel, Atlantic, raw"
    },
    "note": "USDA: cá thu Đại Tây Dương.",
    "micros": {
      "potassium": 314,
      "sodium": 90,
      "calcium": 12,
      "magnesium": 76,
      "iron": 1.63,
      "zinc": 0.63
    },
    "vitamins": {
      "vitaminA": 50,
      "vitaminC": 0.4,
      "vitaminD": 16.1,
      "vitaminE": 1.52,
      "vitaminK": 5,
      "vitaminB1": 0.18,
      "vitaminB6": 0.4,
      "folate": 1,
      "vitaminB12": 8.71
    },
    "usdaMacros": {
      "kcal": 205,
      "protein": 18.6,
      "carb": 0,
      "fat": 13.89,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cá ngừ tươi": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 175159,
      "description": "Fish, tuna, fresh, yellowfin, raw"
    },
    "note": "",
    "micros": {
      "potassium": 441,
      "sodium": 45,
      "calcium": 4,
      "magnesium": 35,
      "iron": 0.77,
      "zinc": 0.37
    },
    "vitamins": {
      "vitaminA": 18,
      "vitaminC": 0,
      "vitaminD": 1.7,
      "vitaminE": 0.24,
      "vitaminK": 0.1,
      "vitaminB1": 0.12,
      "vitaminB6": 0.93,
      "folate": 2,
      "vitaminB12": 2.08
    },
    "usdaMacros": {
      "kcal": 109,
      "protein": 24.4,
      "carb": 0,
      "fat": 0.49,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cá rô phi": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 175176,
      "description": "Fish, tilapia, raw"
    },
    "note": "",
    "micros": {
      "potassium": 302,
      "sodium": 52,
      "calcium": 10,
      "magnesium": 27,
      "iron": 0.56,
      "zinc": 0.33
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 3.1,
      "vitaminE": 0.4,
      "vitaminK": 1.4,
      "vitaminB1": 0.04,
      "vitaminB6": 0.16,
      "folate": 24,
      "vitaminB12": 1.58
    },
    "usdaMacros": {
      "kcal": 96,
      "protein": 20.08,
      "carb": 0,
      "fat": 1.7,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Tôm bỏ vỏ": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 175179,
      "description": "Crustaceans, shrimp, raw"
    },
    "note": "",
    "micros": {
      "potassium": 264,
      "sodium": 119,
      "calcium": 64,
      "magnesium": 35,
      "iron": 0.52,
      "zinc": 1.34
    },
    "vitamins": {
      "vitaminA": null,
      "vitaminC": null,
      "vitaminD": null,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": null,
      "vitaminB6": null,
      "folate": null,
      "vitaminB12": null
    },
    "usdaMacros": {
      "kcal": 85,
      "protein": 20.1,
      "carb": 0,
      "fat": 0.51,
      "fiber": null
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Mực tươi": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 174223,
      "description": "Mollusks, squid, mixed species, raw"
    },
    "note": "",
    "micros": {
      "potassium": 246,
      "sodium": 44,
      "calcium": 32,
      "magnesium": 33,
      "iron": 0.68,
      "zinc": 1.53
    },
    "vitamins": {
      "vitaminA": 10,
      "vitaminC": 4.7,
      "vitaminD": 0,
      "vitaminE": 1.2,
      "vitaminK": 0,
      "vitaminB1": 0.02,
      "vitaminB6": 0.06,
      "folate": 5,
      "vitaminB12": 1.3
    },
    "usdaMacros": {
      "kcal": 92,
      "protein": 15.58,
      "carb": 3.08,
      "fat": 1.38,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Trứng gà nguyên quả": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 171287,
      "description": "Egg, whole, raw, fresh"
    },
    "note": "",
    "micros": {
      "potassium": 138,
      "sodium": 142,
      "calcium": 56,
      "magnesium": 12,
      "iron": 1.75,
      "zinc": 1.29
    },
    "vitamins": {
      "vitaminA": 160,
      "vitaminC": 0,
      "vitaminD": 2,
      "vitaminE": 1.05,
      "vitaminK": 0.3,
      "vitaminB1": 0.04,
      "vitaminB6": 0.17,
      "folate": 47,
      "vitaminB12": 0.89
    },
    "usdaMacros": {
      "kcal": 143,
      "protein": 12.56,
      "carb": 0.72,
      "fat": 9.51,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Lòng trắng trứng": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 172183,
      "description": "Egg, white, raw, fresh"
    },
    "note": "",
    "micros": {
      "potassium": 163,
      "sodium": 166,
      "calcium": 7,
      "magnesium": 11,
      "iron": 0.08,
      "zinc": 0.03
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0,
      "vitaminK": 0,
      "vitaminB1": 0,
      "vitaminB6": 0.01,
      "folate": 4,
      "vitaminB12": 0.09
    },
    "usdaMacros": {
      "kcal": 52,
      "protein": 10.9,
      "carb": 0.73,
      "fat": 0.17,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Đậu phụ trắng": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 172476,
      "description": "Tofu, raw, regular, prepared with calcium sulfate"
    },
    "note": "USDA: đậu phụ làm bằng thạch cao (canxi sunfat), nên canxi cao; đậu phụ làm bằng nước chua có ít canxi hơn.",
    "micros": {
      "potassium": 121,
      "sodium": 7,
      "calcium": 350,
      "magnesium": 30,
      "iron": 5.36,
      "zinc": 0.8
    },
    "vitamins": {
      "vitaminA": null,
      "vitaminC": 0.1,
      "vitaminD": 0,
      "vitaminE": 0.01,
      "vitaminK": 2.4,
      "vitaminB1": 0.08,
      "vitaminB6": 0.05,
      "folate": 15,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 76,
      "protein": 8.08,
      "carb": 1.87,
      "fat": 4.78,
      "fiber": 0.3
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Edamame (luộc)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168411,
      "description": "Edamame, frozen, prepared"
    },
    "note": "",
    "micros": {
      "potassium": 436,
      "sodium": 6,
      "calcium": 63,
      "magnesium": 64,
      "iron": 2.27,
      "zinc": 1.37
    },
    "vitamins": {
      "vitaminA": 15,
      "vitaminC": 6.1,
      "vitaminD": 0,
      "vitaminE": 0.68,
      "vitaminK": 26.7,
      "vitaminB1": 0.2,
      "vitaminB6": 0.1,
      "folate": 311,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 121,
      "protein": 11.91,
      "carb": 8.91,
      "fat": 5.2,
      "fiber": 5.2
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Sữa đậu nành không đường": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 172446,
      "description": "Soymilk, original and vanilla, unfortified"
    },
    "note": "USDA không có sữa đậu nành không đường, không bổ sung: dùng loại thường (có đường).",
    "micros": {
      "potassium": 118,
      "sodium": 51,
      "calcium": 25,
      "magnesium": 25,
      "iron": 0.64,
      "zinc": 0.12
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.11,
      "vitaminK": 3,
      "vitaminB1": 0.06,
      "vitaminB6": 0.08,
      "folate": 18,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 54,
      "protein": 3.27,
      "carb": 6.28,
      "fat": 1.75,
      "fiber": 0.6
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Sữa tươi không đường": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 172217,
      "description": "Milk, whole, 3.25% milkfat, without added vitamin A and vitamin D"
    },
    "note": "",
    "micros": {
      "potassium": 132,
      "sodium": 43,
      "calcium": 113,
      "magnesium": 10,
      "iron": 0.03,
      "zinc": 0.37
    },
    "vitamins": {
      "vitaminA": 46,
      "vitaminC": 0,
      "vitaminD": 0.1,
      "vitaminE": 0.07,
      "vitaminK": 0.3,
      "vitaminB1": 0.05,
      "vitaminB6": 0.04,
      "folate": 5,
      "vitaminB12": 0.45
    },
    "usdaMacros": {
      "kcal": 61,
      "protein": 3.15,
      "carb": 4.78,
      "fat": 3.27,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Sữa chua Hy Lạp không đường": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170894,
      "description": "Yogurt, Greek, plain, nonfat (Includes foods for USDA's Food Distribution Program)"
    },
    "note": "USDA: loại không béo.",
    "micros": {
      "potassium": 141,
      "sodium": 36,
      "calcium": 110,
      "magnesium": 11,
      "iron": 0.07,
      "zinc": 0.52
    },
    "vitamins": {
      "vitaminA": 1,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.01,
      "vitaminK": 0,
      "vitaminB1": 0.02,
      "vitaminB6": 0.06,
      "folate": 7,
      "vitaminB12": 0.75
    },
    "usdaMacros": {
      "kcal": 59,
      "protein": 10.19,
      "carb": 3.6,
      "fat": 0.39,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Whey protein isolate (bột)": {
    "source": null,
    "note": "Vi chất của whey khác nhiều theo hãng: xem nhãn sản phẩm.",
    "micros": {
      "potassium": 480,
      "sodium": 200,
      "calcium": 420,
      "magnesium": 78,
      "iron": 0.49,
      "zinc": 0.25
    },
    "vitamins": {
      "vitaminA": null,
      "vitaminC": null,
      "vitaminD": null,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": null,
      "vitaminB6": null,
      "folate": null,
      "vitaminB12": null
    },
    "microSource": {
      "potassium": "AU",
      "sodium": "AU",
      "calcium": "AU",
      "magnesium": "AU",
      "iron": "AU",
      "zinc": "AU"
    },
    "foreign": {
      "source": "AU",
      "id": "F007493",
      "name": "Protein powder, whey based, protein >70%, unfortified",
      "note": "Úc: bột whey, đạm trên 70%, không bổ sung vi chất. Loại có bổ sung vi chất hoặc của hãng khác: xem nhãn."
    }
  },
  "Chả lụa": {
    "source": null,
    "note": "USDA không có chả lụa. Chờ bảng thành phần thực phẩm Việt Nam.",
    "micros": {
      "potassium": null,
      "sodium": null,
      "calcium": null,
      "magnesium": null,
      "iron": null,
      "zinc": null
    },
    "vitamins": {
      "vitaminA": null,
      "vitaminC": null,
      "vitaminD": null,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": null,
      "vitaminB6": null,
      "folate": null,
      "vitaminB12": null
    },
    "microSource": {
      "potassium": null,
      "sodium": null,
      "calcium": null,
      "magnesium": null,
      "iron": null,
      "zinc": null
    }
  },
  "Dầu ăn (oliu, đậu nành)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 171413,
      "description": "Oil, olive, salad or cooking"
    },
    "note": "",
    "micros": {
      "potassium": 1,
      "sodium": 2,
      "calcium": 1,
      "magnesium": 0,
      "iron": 0.56,
      "zinc": 0
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 14.35,
      "vitaminK": 60.2,
      "vitaminB1": 0,
      "vitaminB6": 0,
      "folate": 0,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 884,
      "protein": 0,
      "carb": 0,
      "fat": 100,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bơ đậu phộng": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 172470,
      "description": "Peanut butter, smooth style, without salt"
    },
    "note": "USDA: loại không muối; loại có muối có natri cao hơn nhiều.",
    "micros": {
      "potassium": 558,
      "sodium": 17,
      "calcium": 49,
      "magnesium": 168,
      "iron": 1.74,
      "zinc": 2.51
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 9.1,
      "vitaminK": 0.3,
      "vitaminB1": 0.15,
      "vitaminB6": 0.44,
      "folate": 87,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 598,
      "protein": 22.21,
      "carb": 22.31,
      "fat": 51.36,
      "fiber": 5
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Đậu phộng rang": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 173806,
      "description": "Peanuts, all types, dry-roasted, without salt"
    },
    "note": "USDA: rang khô, không muối.",
    "micros": {
      "potassium": 634,
      "sodium": 6,
      "calcium": 58,
      "magnesium": 178,
      "iron": 1.58,
      "zinc": 2.77
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 4.93,
      "vitaminK": 0,
      "vitaminB1": 0.15,
      "vitaminB6": 0.47,
      "folate": 97,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 587,
      "protein": 24.35,
      "carb": 21.26,
      "fat": 49.66,
      "fiber": 8.4
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Hạnh nhân": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170567,
      "description": "Nuts, almonds"
    },
    "note": "",
    "micros": {
      "potassium": 733,
      "sodium": 1,
      "calcium": 269,
      "magnesium": 270,
      "iron": 3.71,
      "zinc": 3.12
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 25.63,
      "vitaminK": 0,
      "vitaminB1": 0.21,
      "vitaminB6": 0.14,
      "folate": 44,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 579,
      "protein": 21.15,
      "carb": 21.55,
      "fat": 49.93,
      "fiber": 12.5
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Hạt điều": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170162,
      "description": "Nuts, cashew nuts, raw"
    },
    "note": "",
    "micros": {
      "potassium": 660,
      "sodium": 12,
      "calcium": 37,
      "magnesium": 292,
      "iron": 6.68,
      "zinc": 5.78
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0.5,
      "vitaminD": 0,
      "vitaminE": 0.9,
      "vitaminK": 34.1,
      "vitaminB1": 0.42,
      "vitaminB6": 0.42,
      "folate": 25,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 553,
      "protein": 18.22,
      "carb": 30.19,
      "fat": 43.85,
      "fiber": 3.3
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Mè (vừng)": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170150,
      "description": "Seeds, sesame seeds, whole, dried"
    },
    "note": "",
    "micros": {
      "potassium": 468,
      "sodium": 11,
      "calcium": 975,
      "magnesium": 351,
      "iron": 14.55,
      "zinc": 7.75
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.25,
      "vitaminK": 0,
      "vitaminB1": 0.79,
      "vitaminB6": 0.79,
      "folate": 97,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 573,
      "protein": 17.73,
      "carb": 23.45,
      "fat": 49.67,
      "fiber": 11.8
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Quả bơ": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 171705,
      "description": "Avocados, raw, all commercial varieties"
    },
    "note": "",
    "micros": {
      "potassium": 485,
      "sodium": 7,
      "calcium": 12,
      "magnesium": 29,
      "iron": 0.55,
      "zinc": 0.64
    },
    "vitamins": {
      "vitaminA": 7,
      "vitaminC": 10,
      "vitaminD": 0,
      "vitaminE": 2.07,
      "vitaminK": 21,
      "vitaminB1": 0.07,
      "vitaminB6": 0.26,
      "folate": 81,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 160,
      "protein": 2,
      "carb": 8.53,
      "fat": 14.66,
      "fiber": 6.7
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Phô mai cheddar": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 173414,
      "description": "Cheese, cheddar (Includes foods for USDA's Food Distribution Program)"
    },
    "note": "",
    "micros": {
      "potassium": 76,
      "sodium": 653,
      "calcium": 710,
      "magnesium": 27,
      "iron": 0.14,
      "zinc": 3.64
    },
    "vitamins": {
      "vitaminA": 337,
      "vitaminC": 0,
      "vitaminD": 0.6,
      "vitaminE": 0.71,
      "vitaminK": 2.4,
      "vitaminB1": 0.03,
      "vitaminB6": 0.07,
      "folate": 27,
      "vitaminB12": 1.1
    },
    "usdaMacros": {
      "kcal": 403,
      "protein": 22.87,
      "carb": 3.37,
      "fat": 33.31,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Phô mai mozzarella": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170845,
      "description": "Cheese, mozzarella, whole milk"
    },
    "note": "",
    "micros": {
      "potassium": 76,
      "sodium": 486,
      "calcium": 505,
      "magnesium": 20,
      "iron": 0.44,
      "zinc": 2.92
    },
    "vitamins": {
      "vitaminA": 179,
      "vitaminC": 0,
      "vitaminD": 0.4,
      "vitaminE": 0.19,
      "vitaminK": 2.3,
      "vitaminB1": 0.03,
      "vitaminB6": 0.04,
      "folate": 7,
      "vitaminB12": 2.28
    },
    "usdaMacros": {
      "kcal": 299,
      "protein": 22.17,
      "carb": 2.4,
      "fat": 22.14,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cream cheese": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 173418,
      "description": "Cheese, cream"
    },
    "note": "",
    "micros": {
      "potassium": 132,
      "sodium": 314,
      "calcium": 97,
      "magnesium": 9,
      "iron": 0.11,
      "zinc": 0.5
    },
    "vitamins": {
      "vitaminA": 308,
      "vitaminC": 0,
      "vitaminD": 0,
      "vitaminE": 0.86,
      "vitaminK": 2.1,
      "vitaminB1": 0.02,
      "vitaminB6": 0.06,
      "folate": 9,
      "vitaminB12": 0.22
    },
    "usdaMacros": {
      "kcal": 350,
      "protein": 6.15,
      "carb": 5.52,
      "fat": 34.44,
      "fiber": 0
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Nước cốt dừa": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170172,
      "description": "Nuts, coconut milk, raw (liquid expressed from grated meat and water)"
    },
    "note": "",
    "micros": {
      "potassium": 263,
      "sodium": 15,
      "calcium": 16,
      "magnesium": 37,
      "iron": 1.64,
      "zinc": 0.67
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 2.8,
      "vitaminD": 0,
      "vitaminE": 0.15,
      "vitaminK": 0.1,
      "vitaminB1": 0.03,
      "vitaminB6": 0.03,
      "folate": 16,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 230,
      "protein": 2.29,
      "carb": 5.54,
      "fat": 23.84,
      "fiber": 2.2
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Dừa nạo": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170169,
      "description": "Nuts, coconut meat, raw"
    },
    "note": "USDA: cùi dừa tươi.",
    "micros": {
      "potassium": 356,
      "sodium": 20,
      "calcium": 14,
      "magnesium": 32,
      "iron": 2.43,
      "zinc": 1.1
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 3.3,
      "vitaminD": 0,
      "vitaminE": 0.24,
      "vitaminK": 0.2,
      "vitaminB1": 0.07,
      "vitaminB6": 0.05,
      "folate": 26,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 354,
      "protein": 3.33,
      "carb": 15.23,
      "fat": 33.49,
      "fiber": 9
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Rau muống": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169301,
      "description": "Water convolvulus,raw"
    },
    "note": "",
    "micros": {
      "potassium": 312,
      "sodium": 113,
      "calcium": 77,
      "magnesium": 71,
      "iron": 1.67,
      "zinc": 0.18
    },
    "vitamins": {
      "vitaminA": 315,
      "vitaminC": 55,
      "vitaminD": 0,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": 0.03,
      "vitaminB6": 0.1,
      "folate": 57,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 19,
      "protein": 2.6,
      "carb": 3.13,
      "fat": 0.2,
      "fiber": 2.1
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cải ngọt": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170390,
      "description": "Cabbage, chinese (pak-choi), raw"
    },
    "note": "USDA không có cải ngọt: dùng cải thìa (cùng loài).",
    "micros": {
      "potassium": 252,
      "sodium": 65,
      "calcium": 105,
      "magnesium": 19,
      "iron": 0.8,
      "zinc": 0.19
    },
    "vitamins": {
      "vitaminA": 223,
      "vitaminC": 45,
      "vitaminD": 0,
      "vitaminE": 0.09,
      "vitaminK": 45.5,
      "vitaminB1": 0.04,
      "vitaminB6": 0.19,
      "folate": 66,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 13,
      "protein": 1.5,
      "carb": 2.18,
      "fat": 0.2,
      "fiber": 1
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Súp lơ xanh": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170379,
      "description": "Broccoli, raw"
    },
    "note": "",
    "micros": {
      "potassium": 316,
      "sodium": 33,
      "calcium": 47,
      "magnesium": 21,
      "iron": 0.73,
      "zinc": 0.41
    },
    "vitamins": {
      "vitaminA": 31,
      "vitaminC": 89.2,
      "vitaminD": 0,
      "vitaminE": 0.78,
      "vitaminK": 101.6,
      "vitaminB1": 0.07,
      "vitaminB6": 0.18,
      "folate": 63,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 34,
      "protein": 2.82,
      "carb": 6.64,
      "fat": 0.37,
      "fiber": 2.6
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bắp cải": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169975,
      "description": "Cabbage, raw"
    },
    "note": "",
    "micros": {
      "potassium": 170,
      "sodium": 18,
      "calcium": 40,
      "magnesium": 12,
      "iron": 0.47,
      "zinc": 0.18
    },
    "vitamins": {
      "vitaminA": 5,
      "vitaminC": 36.6,
      "vitaminD": 0,
      "vitaminE": 0.15,
      "vitaminK": 76,
      "vitaminB1": 0.06,
      "vitaminB6": 0.12,
      "folate": 43,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 25,
      "protein": 1.28,
      "carb": 5.8,
      "fat": 0.1,
      "fiber": 2.5
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Dưa leo": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168409,
      "description": "Cucumber, with peel, raw"
    },
    "note": "",
    "micros": {
      "potassium": 147,
      "sodium": 2,
      "calcium": 16,
      "magnesium": 13,
      "iron": 0.28,
      "zinc": 0.2
    },
    "vitamins": {
      "vitaminA": 5,
      "vitaminC": 2.8,
      "vitaminD": 0,
      "vitaminE": 0.03,
      "vitaminK": 16.4,
      "vitaminB1": 0.03,
      "vitaminB6": 0.04,
      "folate": 7,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 15,
      "protein": 0.65,
      "carb": 3.63,
      "fat": 0.11,
      "fiber": 0.5
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cà chua": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170457,
      "description": "Tomatoes, red, ripe, raw, year round average"
    },
    "note": "",
    "micros": {
      "potassium": 237,
      "sodium": 5,
      "calcium": 10,
      "magnesium": 11,
      "iron": 0.27,
      "zinc": 0.17
    },
    "vitamins": {
      "vitaminA": 42,
      "vitaminC": 13.7,
      "vitaminD": 0,
      "vitaminE": 0.54,
      "vitaminK": 7.9,
      "vitaminB1": 0.04,
      "vitaminB6": 0.08,
      "folate": 15,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 18,
      "protein": 0.88,
      "carb": 3.89,
      "fat": 0.2,
      "fiber": 1.2
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Giá đỗ": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169957,
      "description": "Mung beans, mature seeds, sprouted, raw"
    },
    "note": "",
    "micros": {
      "potassium": 149,
      "sodium": 6,
      "calcium": 13,
      "magnesium": 21,
      "iron": 0.91,
      "zinc": 0.41
    },
    "vitamins": {
      "vitaminA": 1,
      "vitaminC": 13.2,
      "vitaminD": 0,
      "vitaminE": 0.1,
      "vitaminK": 33,
      "vitaminB1": 0.08,
      "vitaminB6": 0.09,
      "folate": 61,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 30,
      "protein": 3.04,
      "carb": 5.94,
      "fat": 0.18,
      "fiber": 1.8
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Rau dền": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168385,
      "description": "Amaranth leaves, raw"
    },
    "note": "",
    "micros": {
      "potassium": 611,
      "sodium": 20,
      "calcium": 215,
      "magnesium": 55,
      "iron": 2.32,
      "zinc": 0.9
    },
    "vitamins": {
      "vitaminA": 146,
      "vitaminC": 43.3,
      "vitaminD": 0,
      "vitaminE": null,
      "vitaminK": 1140,
      "vitaminB1": 0.03,
      "vitaminB6": 0.19,
      "folate": 85,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 23,
      "protein": 2.46,
      "carb": 4.02,
      "fat": 0.33,
      "fiber": null
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Mướp": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168414,
      "description": "Gourd, dishcloth (towelgourd), raw"
    },
    "note": "",
    "micros": {
      "potassium": 139,
      "sodium": 3,
      "calcium": 20,
      "magnesium": 14,
      "iron": 0.36,
      "zinc": 0.07
    },
    "vitamins": {
      "vitaminA": null,
      "vitaminC": 12,
      "vitaminD": 0,
      "vitaminE": 0.1,
      "vitaminK": 0.7,
      "vitaminB1": 0.05,
      "vitaminB6": 0.04,
      "folate": 7,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 20,
      "protein": 1.2,
      "carb": 4.35,
      "fat": 0.2,
      "fiber": 1.1
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bí xanh": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170069,
      "description": "Waxgourd, (chinese preserving melon), raw"
    },
    "note": "",
    "micros": {
      "potassium": 6,
      "sodium": 111,
      "calcium": 19,
      "magnesium": 10,
      "iron": 0.4,
      "zinc": 0.61
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 13,
      "vitaminD": 0,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": 0.04,
      "vitaminB6": 0.04,
      "folate": 5,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 13,
      "protein": 0.4,
      "carb": 3,
      "fat": 0.2,
      "fiber": 2.9
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Bí đỏ": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168448,
      "description": "Pumpkin, raw"
    },
    "note": "",
    "micros": {
      "potassium": 340,
      "sodium": 1,
      "calcium": 21,
      "magnesium": 12,
      "iron": 0.8,
      "zinc": 0.32
    },
    "vitamins": {
      "vitaminA": 426,
      "vitaminC": 9,
      "vitaminD": 0,
      "vitaminE": 1.06,
      "vitaminK": 1.1,
      "vitaminB1": 0.05,
      "vitaminB6": 0.06,
      "folate": 16,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 26,
      "protein": 1,
      "carb": 6.5,
      "fat": 0.1,
      "fiber": 0.5
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cà rốt": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 170393,
      "description": "Carrots, raw"
    },
    "note": "",
    "micros": {
      "potassium": 320,
      "sodium": 69,
      "calcium": 33,
      "magnesium": 12,
      "iron": 0.3,
      "zinc": 0.24
    },
    "vitamins": {
      "vitaminA": 835,
      "vitaminC": 5.9,
      "vitaminD": 0,
      "vitaminE": 0.66,
      "vitaminK": 13.2,
      "vitaminB1": 0.07,
      "vitaminB6": 0.14,
      "folate": 19,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 41,
      "protein": 0.93,
      "carb": 9.58,
      "fat": 0.24,
      "fiber": 2.8
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Nấm rơm": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 168582,
      "description": "Mushrooms, straw, canned, drained solids"
    },
    "note": "USDA chỉ có nấm rơm đóng hộp: natri bỏ trống vì muối ngâm.",
    "micros": {
      "potassium": 78,
      "sodium": null,
      "calcium": 10,
      "magnesium": 7,
      "iron": 1.43,
      "zinc": 0.67
    },
    "vitamins": {
      "vitaminA": 0,
      "vitaminC": 0,
      "vitaminD": null,
      "vitaminE": null,
      "vitaminK": null,
      "vitaminB1": 0.01,
      "vitaminB6": 0.01,
      "folate": 38,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 32,
      "protein": 3.83,
      "carb": 4.64,
      "fat": 0.68,
      "fiber": 2.5
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": null,
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Cà tím": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169228,
      "description": "Eggplant, raw"
    },
    "note": "",
    "micros": {
      "potassium": 229,
      "sodium": 2,
      "calcium": 9,
      "magnesium": 14,
      "iron": 0.23,
      "zinc": 0.16
    },
    "vitamins": {
      "vitaminA": 1,
      "vitaminC": 2.2,
      "vitaminD": 0,
      "vitaminE": 0.3,
      "vitaminK": 3.5,
      "vitaminB1": 0.04,
      "vitaminB6": 0.08,
      "folate": 22,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 25,
      "protein": 0.98,
      "carb": 5.88,
      "fat": 0.18,
      "fiber": 3
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  },
  "Đậu bắp": {
    "source": {
      "db": "USDA",
      "dataset": "SR Legacy 2018-04",
      "fdcId": 169260,
      "description": "Okra, raw"
    },
    "note": "",
    "micros": {
      "potassium": 299,
      "sodium": 7,
      "calcium": 82,
      "magnesium": 57,
      "iron": 0.62,
      "zinc": 0.58
    },
    "vitamins": {
      "vitaminA": 36,
      "vitaminC": 23,
      "vitaminD": 0,
      "vitaminE": 0.27,
      "vitaminK": 31.3,
      "vitaminB1": 0.2,
      "vitaminB6": 0.22,
      "folate": 60,
      "vitaminB12": 0
    },
    "usdaMacros": {
      "kcal": 33,
      "protein": 1.93,
      "carb": 7.45,
      "fat": 0.19,
      "fiber": 3.2
    },
    "microSource": {
      "potassium": "USDA",
      "sodium": "USDA",
      "calcium": "USDA",
      "magnesium": "USDA",
      "iron": "USDA",
      "zinc": "USDA"
    }
  }
});

/** Món có calo/đa chất trong bảng lệch quá 15% so với USDA, chờ David quyết. */
export const MACRO_MISMATCHES = Object.freeze([
  "Bánh phở tươi: kcal 130 (USDA 108), carb 29 (USDA 24) · David giữ số cũ (2026-11-03): dòng USDA là món khác.",
  "Sữa đậu nành không đường: kcal 33 (USDA 54), carb 1.3 (USDA 6.3) · David giữ số cũ (2026-11-03): dòng USDA là món khác.",
  "Cải ngọt: carb 3.5 (USDA 2.2) · David giữ số cũ (2026-11-03): dòng USDA là món khác.",
  "Nấm rơm: protein 2.8 (USDA 3.8) · David giữ số cũ (2026-11-03): dòng USDA là món khác."
]);
