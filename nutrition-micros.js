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
  "Bánh phở tươi: kcal 130 (USDA 108), carb 29 (USDA 24)",
  "Bánh mì nguyên cám: protein 9 (USDA 12.5)",
  "Yến mạch (khô): protein 13 (USDA 16.9)",
  "Khoai lang (luộc): kcal 90 (USDA 76), carb 21 (USDA 17.7)",
  "Thịt heo thăn nạc: kcal 143 (USDA 109), fat 5 (USDA 2.2)",
  "Thịt bò thăn: fat 5 (USDA 6.5)",
  "Sữa đậu nành không đường: kcal 33 (USDA 54), carb 1.3 (USDA 6.3)",
  "Đậu phộng rang: carb 16 (USDA 21.3)",
  "Phô mai cheddar: carb 1.3 (USDA 3.4)",
  "Cream cheese: carb 4 (USDA 5.5)",
  "Cải ngọt: carb 3.5 (USDA 2.2)",
  "Nấm rơm: protein 2.8 (USDA 3.8)"
]);
