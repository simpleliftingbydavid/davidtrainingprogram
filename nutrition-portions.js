// ============================================================
// DAVID COACHING — Khẩu phần quen thuộc (gram)
// ============================================================
// SINH TỰ ĐỘNG bởi scripts/usda/build-micros.mjs từ scripts/usda/portion-map.json.
// source USDA: gram lấy từ food_portion của USDA SR Legacy. grams null: khẩu phần kiểu Việt chờ
// David điền. approved false: học viên chưa thấy khẩu phần này.

export const PORTIONS = Object.freeze([
  {
    "id": "trung-ga-nguyen-qua--1-qua-to",
    "food": "Trứng gà nguyên quả",
    "label": "1 quả to",
    "note": "",
    "approved": true,
    "grams": 50,
    "source": {
      "db": "USDA",
      "fdcId": 171287,
      "measure": "1 large"
    }
  },
  {
    "id": "trung-ga-nguyen-qua--1-qua-vua",
    "food": "Trứng gà nguyên quả",
    "label": "1 quả vừa",
    "note": "",
    "approved": true,
    "grams": 44,
    "source": {
      "db": "USDA",
      "fdcId": 171287,
      "measure": "1 medium"
    }
  },
  {
    "id": "long-trang-trung--long-trang-1-qua-to",
    "food": "Lòng trắng trứng",
    "label": "Lòng trắng 1 quả to",
    "note": "",
    "approved": true,
    "grams": 33,
    "source": {
      "db": "USDA",
      "fdcId": 172183,
      "measure": "1 large"
    }
  },
  {
    "id": "chuoi--1-qua-vua",
    "food": "Chuối",
    "label": "1 quả vừa",
    "note": "USDA: chuối dài 18–20 cm.",
    "approved": true,
    "grams": 118,
    "source": {
      "db": "USDA",
      "fdcId": 173944,
      "measure": "1 medium (7\" to 7-7/8\" long)"
    }
  },
  {
    "id": "chuoi--1-qua-nho",
    "food": "Chuối",
    "label": "1 quả nhỏ",
    "note": "USDA: chuối dài 15–17 cm.",
    "approved": true,
    "grams": 101,
    "source": {
      "db": "USDA",
      "fdcId": 173944,
      "measure": "1 small (6\" to 6-7/8\" long)"
    }
  },
  {
    "id": "tao--1-qua-vua",
    "food": "Táo",
    "label": "1 quả vừa",
    "note": "USDA: đường kính 7,5 cm.",
    "approved": true,
    "grams": 182,
    "source": {
      "db": "USDA",
      "fdcId": 171688,
      "measure": "1 medium (3\" dia)"
    }
  },
  {
    "id": "cam--1-qua-vua",
    "food": "Cam",
    "label": "1 quả vừa",
    "note": "USDA: đường kính 6,7 cm, phần ăn được.",
    "approved": true,
    "grams": 131,
    "source": {
      "db": "USDA",
      "fdcId": 169097,
      "measure": "1 fruit (2-5/8\" dia)"
    }
  },
  {
    "id": "oi--1-qua-nho",
    "food": "Ổi",
    "label": "1 quả nhỏ",
    "note": "USDA: ổi Mỹ nhỏ; ổi Việt Nam thường to hơn.",
    "approved": true,
    "grams": 55,
    "source": {
      "db": "USDA",
      "fdcId": 173044,
      "measure": "1 fruit, without refuse"
    }
  },
  {
    "id": "xoai-chin--1-qua-phan-an-duoc",
    "food": "Xoài chín",
    "label": "1 quả (phần ăn được)",
    "note": "",
    "approved": true,
    "grams": 336,
    "source": {
      "db": "USDA",
      "fdcId": 169910,
      "measure": "1 fruit without refuse"
    }
  },
  {
    "id": "banh-mi-trang--1-lat-banh-mi-sandwich",
    "food": "Bánh mì trắng",
    "label": "1 lát bánh mì sandwich",
    "note": "",
    "approved": true,
    "grams": 29,
    "source": {
      "db": "USDA",
      "fdcId": 174924,
      "measure": "1 slice"
    }
  },
  {
    "id": "banh-mi-nguyen-cam--1-lat",
    "food": "Bánh mì nguyên cám",
    "label": "1 lát",
    "note": "",
    "approved": true,
    "grams": 32,
    "source": {
      "db": "USDA",
      "fdcId": 172688,
      "measure": "1 slice"
    }
  },
  {
    "id": "khoai-lang-luoc--1-cu-vua",
    "food": "Khoai lang (luộc)",
    "label": "1 củ vừa",
    "note": "",
    "approved": true,
    "grams": 151,
    "source": {
      "db": "USDA",
      "fdcId": 168484,
      "measure": "1 medium"
    }
  },
  {
    "id": "khoai-tay-luoc--1-cu-vua",
    "food": "Khoai tây (luộc)",
    "label": "1 củ vừa",
    "note": "",
    "approved": true,
    "grams": 167,
    "source": {
      "db": "USDA",
      "fdcId": 170440,
      "measure": "1 medium (2-1/4\" to 3-1/4\" dia.)"
    }
  },
  {
    "id": "bap-ngot-luoc--1-trai-vua-phan-hat",
    "food": "Bắp ngọt (luộc)",
    "label": "1 trái vừa (phần hạt)",
    "note": "",
    "approved": true,
    "grams": 103,
    "source": {
      "db": "USDA",
      "fdcId": 169999,
      "measure": "1 ear medium (6-3/4\" to 7-1/2\" long)"
    }
  },
  {
    "id": "dau-an-oliu-dau-nanh--1-thia-canh",
    "food": "Dầu ăn (oliu, đậu nành)",
    "label": "1 thìa canh",
    "note": "",
    "approved": true,
    "grams": 13.5,
    "source": {
      "db": "USDA",
      "fdcId": 171413,
      "measure": "1 tablespoon"
    }
  },
  {
    "id": "dau-an-oliu-dau-nanh--1-thia-ca-phe",
    "food": "Dầu ăn (oliu, đậu nành)",
    "label": "1 thìa cà phê",
    "note": "",
    "approved": true,
    "grams": 4.5,
    "source": {
      "db": "USDA",
      "fdcId": 171413,
      "measure": "1 tsp"
    }
  },
  {
    "id": "bo-dau-phong--2-thia-canh",
    "food": "Bơ đậu phộng",
    "label": "2 thìa canh",
    "note": "",
    "approved": true,
    "grams": 32,
    "source": {
      "db": "USDA",
      "fdcId": 172470,
      "measure": "2 tbsp"
    }
  },
  {
    "id": "me-vung--1-thia-canh",
    "food": "Mè (vừng)",
    "label": "1 thìa canh",
    "note": "",
    "approved": true,
    "grams": 9,
    "source": {
      "db": "USDA",
      "fdcId": 170150,
      "measure": "1 tbsp"
    }
  },
  {
    "id": "duong-trang--1-thia-ca-phe",
    "food": "Đường trắng",
    "label": "1 thìa cà phê",
    "note": "",
    "approved": true,
    "grams": 4.2,
    "source": {
      "db": "USDA",
      "fdcId": 169655,
      "measure": "1 tsp"
    }
  },
  {
    "id": "hanh-nhan--23-hat-28-g",
    "food": "Hạnh nhân",
    "label": "23 hạt (28 g)",
    "note": "",
    "approved": true,
    "grams": 28.35,
    "source": {
      "db": "USDA",
      "fdcId": 170567,
      "measure": "1 oz (23 whole kernels)"
    }
  },
  {
    "id": "sua-tuoi-khong-duong--1-coc-240-ml",
    "food": "Sữa tươi không đường",
    "label": "1 cốc 240 ml",
    "note": "",
    "approved": true,
    "grams": 244,
    "source": {
      "db": "USDA",
      "fdcId": 172217,
      "measure": "1 cup"
    }
  },
  {
    "id": "sua-dau-nanh-khong-duong--1-coc-240-ml",
    "food": "Sữa đậu nành không đường",
    "label": "1 cốc 240 ml",
    "note": "",
    "approved": true,
    "grams": 243,
    "source": {
      "db": "USDA",
      "fdcId": 172446,
      "measure": "1 cup"
    }
  },
  {
    "id": "sua-chua-hy-lap-khong-duong--1-hop-170-g",
    "food": "Sữa chua Hy Lạp không đường",
    "label": "1 hộp 170 g",
    "note": "",
    "approved": true,
    "grams": 170,
    "source": {
      "db": "USDA",
      "fdcId": 170894,
      "measure": "1 container"
    }
  },
  {
    "id": "pho-mai-cheddar--1-lat",
    "food": "Phô mai cheddar",
    "label": "1 lát",
    "note": "",
    "approved": true,
    "grams": 28,
    "source": {
      "db": "USDA",
      "fdcId": 173414,
      "measure": "1 slice (1 oz)"
    }
  },
  {
    "id": "cream-cheese--1-thia-canh",
    "food": "Cream cheese",
    "label": "1 thìa canh",
    "note": "",
    "approved": true,
    "grams": 14.5,
    "source": {
      "db": "USDA",
      "fdcId": 173418,
      "measure": "1 tbsp"
    }
  },
  {
    "id": "nuoc-cot-dua--1-thia-canh",
    "food": "Nước cốt dừa",
    "label": "1 thìa canh",
    "note": "",
    "approved": true,
    "grams": 15,
    "source": {
      "db": "USDA",
      "fdcId": 170172,
      "measure": "1 tbsp"
    }
  },
  {
    "id": "qua-bo--1-qua-phan-an-duoc",
    "food": "Quả bơ",
    "label": "1 quả (phần ăn được)",
    "note": "",
    "approved": true,
    "grams": 201,
    "source": {
      "db": "USDA",
      "fdcId": 171705,
      "measure": "1 avocado, NS as to Florida or California"
    }
  },
  {
    "id": "ca-chua--1-qua-vua",
    "food": "Cà chua",
    "label": "1 quả vừa",
    "note": "",
    "approved": true,
    "grams": 123,
    "source": {
      "db": "USDA",
      "fdcId": 170457,
      "measure": "1 medium whole (2-3/5\" dia)"
    }
  },
  {
    "id": "ca-rot--1-cu-vua",
    "food": "Cà rốt",
    "label": "1 củ vừa",
    "note": "",
    "approved": true,
    "grams": 61,
    "source": {
      "db": "USDA",
      "fdcId": 170393,
      "measure": "1 medium"
    }
  },
  {
    "id": "ca-ro-phi--1-mieng-phi-le",
    "food": "Cá rô phi",
    "label": "1 miếng phi lê",
    "note": "",
    "approved": true,
    "grams": 116,
    "source": {
      "db": "USDA",
      "fdcId": 175176,
      "measure": "1 fillet"
    }
  },
  {
    "id": "dau-bap--8-qua",
    "food": "Đậu bắp",
    "label": "8 quả",
    "note": "",
    "approved": true,
    "grams": 95,
    "source": {
      "db": "USDA",
      "fdcId": 169260,
      "measure": "8 pods (3\" long)"
    }
  },
  {
    "id": "com-trang-chin--1-chen-com",
    "food": "Cơm trắng (chín)",
    "label": "1 chén cơm",
    "note": "Chén vừa theo tháp dinh dưỡng (2 × 55 g). Chén đầy có thể nặng hơn.",
    "approved": true,
    "refs": [
      {
        "title": "Viện Dinh dưỡng Quốc gia: đơn vị ăn của tháp dinh dưỡng",
        "url": "https://viendinhduong.vn/vi/article/tin-tuc/huong-dan-su-dung-thap-dinh-duong-cho-nguoi-cao-tuoi-68baa5e00ca85001dd026ee2",
        "kind": "nhà nước"
      },
      {
        "title": "Khoa Dinh dưỡng ĐH Đông Á: đơn vị của tháp dinh dưỡng",
        "url": "https://dinhduong.donga.edu.vn/thong-tin-chi-tiet/huong-dan-su-dung-cac-don-vi-cua-thap-dinh-duong-de-uoc-luong-thuc-pham-22441",
        "kind": "đại học"
      },
      {
        "title": "Vinmec: ½ bát cơm ≈ 55 g",
        "url": "https://www.vinmec.com/vie/bai-viet/thap-dinh-duong-cho-tre-tu-6-11-tuoi-vi",
        "kind": "bệnh viện (nguồn phụ)"
      }
    ],
    "grams": 110,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "com-gao-lut-chin--1-chen-com",
    "food": "Cơm gạo lứt (chín)",
    "label": "1 chén cơm",
    "note": "David chốt 2026-11-03: cùng cỡ chén với cơm trắng; cơm gạo lứt nặng hơn khoảng 28% theo USDA (202 g so với 158 g mỗi cup).",
    "approved": true,
    "refs": [
      {
        "title": "Viện Dinh dưỡng Quốc gia: đơn vị ăn của tháp dinh dưỡng",
        "url": "https://viendinhduong.vn/vi/article/tin-tuc/huong-dan-su-dung-thap-dinh-duong-cho-nguoi-cao-tuoi-68baa5e00ca85001dd026ee2",
        "kind": "nhà nước"
      },
      {
        "title": "USDA FoodData Central, SR Legacy: khối lượng 1 cup",
        "url": "https://fdc.nal.usda.gov/",
        "kind": "nhà nước"
      }
    ],
    "grams": 140,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "banh-mi-trang--1-o-banh-mi",
    "food": "Bánh mì trắng",
    "label": "1 ổ bánh mì",
    "note": "Ổ không nhân, cỡ thường. USDA FNDDS 82 g, ĐH Đông Á khoảng 76 g (½ ổ ≈ 38 g).",
    "approved": true,
    "refs": [
      {
        "title": "USDA FNDDS 2021–2023 (FDC 2707610): bánh mì Pháp, 1 ổ cỡ một người ăn = 82 g",
        "url": "https://fdc.nal.usda.gov/",
        "kind": "nhà nước"
      },
      {
        "title": "Khoa Dinh dưỡng ĐH Đông Á: đơn vị của tháp dinh dưỡng",
        "url": "https://dinhduong.donga.edu.vn/thong-tin-chi-tiet/huong-dan-su-dung-cac-don-vi-cua-thap-dinh-duong-de-uoc-luong-thuc-pham-22441",
        "kind": "đại học"
      },
      {
        "title": "Viện Dinh dưỡng Quốc gia: đơn vị ăn của tháp dinh dưỡng",
        "url": "https://viendinhduong.vn/vi/article/tin-tuc/huong-dan-su-dung-thap-dinh-duong-cho-nguoi-cao-tuoi-68baa5e00ca85001dd026ee2",
        "kind": "nhà nước"
      }
    ],
    "grams": 85,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "uc-ga-bo-da-song--1-long-ban-tay",
    "food": "Ức gà bỏ da (sống)",
    "label": "1 lòng bàn tay",
    "note": "Theo nguồn chính thống (David chốt 2026-11-03): 1 lòng bàn tay = 3 oz ≈ 85 g đã nấu, tức khoảng 115 g sống.",
    "approved": true,
    "refs": [
      {
        "title": "CDC: 3 oz thịt, cá = lòng bàn tay (không tính ngón)",
        "url": "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html",
        "kind": "nhà nước"
      },
      {
        "title": "USDA, Nutritive Value of Foods: 3 oz thịt cá chín = lòng bàn tay người lớn",
        "url": "https://www.ars.usda.gov/is/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf",
        "kind": "nhà nước"
      },
      {
        "title": "American Heart Association: khẩu phần đạm khoảng 3 oz chín, cỡ lòng bàn tay",
        "url": "https://heart.org/en/healthy-living/healthy-eating/cooking-skills/preparing/making-the-healthy-cut-fish-poultry-and-lean-meats",
        "kind": "hiệp hội chuyên môn"
      }
    ],
    "grams": 115,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "dui-ga-bo-da-song--1-long-ban-tay",
    "food": "Đùi gà bỏ da (sống)",
    "label": "1 lòng bàn tay",
    "note": "Theo nguồn chính thống (David chốt 2026-11-03): 1 lòng bàn tay = 3 oz ≈ 85 g đã nấu, tức khoảng 115 g sống.",
    "approved": true,
    "refs": [
      {
        "title": "CDC: 3 oz thịt, cá = lòng bàn tay (không tính ngón)",
        "url": "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html",
        "kind": "nhà nước"
      },
      {
        "title": "USDA, Nutritive Value of Foods: 3 oz thịt cá chín = lòng bàn tay người lớn",
        "url": "https://www.ars.usda.gov/is/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf",
        "kind": "nhà nước"
      },
      {
        "title": "American Heart Association: khẩu phần đạm khoảng 3 oz chín, cỡ lòng bàn tay",
        "url": "https://heart.org/en/healthy-living/healthy-eating/cooking-skills/preparing/making-the-healthy-cut-fish-poultry-and-lean-meats",
        "kind": "hiệp hội chuyên môn"
      }
    ],
    "grams": 115,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "thit-heo-than-nac--1-long-ban-tay",
    "food": "Thịt heo thăn nạc",
    "label": "1 lòng bàn tay",
    "note": "Theo nguồn chính thống (David chốt 2026-11-03): 1 lòng bàn tay = 3 oz ≈ 85 g đã nấu, tức khoảng 120 g sống.",
    "approved": true,
    "refs": [
      {
        "title": "CDC: 3 oz thịt, cá = lòng bàn tay (không tính ngón)",
        "url": "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html",
        "kind": "nhà nước"
      },
      {
        "title": "USDA, Nutritive Value of Foods: 3 oz thịt cá chín = lòng bàn tay người lớn",
        "url": "https://www.ars.usda.gov/is/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf",
        "kind": "nhà nước"
      },
      {
        "title": "American Heart Association: khẩu phần đạm khoảng 3 oz chín, cỡ lòng bàn tay",
        "url": "https://heart.org/en/healthy-living/healthy-eating/cooking-skills/preparing/making-the-healthy-cut-fish-poultry-and-lean-meats",
        "kind": "hiệp hội chuyên môn"
      }
    ],
    "grams": 120,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "thit-bo-than--1-long-ban-tay",
    "food": "Thịt bò thăn",
    "label": "1 lòng bàn tay",
    "note": "Theo nguồn chính thống (David chốt 2026-11-03): 1 lòng bàn tay = 3 oz ≈ 85 g đã nấu, tức khoảng 120 g sống.",
    "approved": true,
    "refs": [
      {
        "title": "CDC: 3 oz thịt, cá = lòng bàn tay (không tính ngón)",
        "url": "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html",
        "kind": "nhà nước"
      },
      {
        "title": "USDA, Nutritive Value of Foods: 3 oz thịt cá chín = lòng bàn tay người lớn",
        "url": "https://www.ars.usda.gov/is/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf",
        "kind": "nhà nước"
      },
      {
        "title": "American Heart Association: khẩu phần đạm khoảng 3 oz chín, cỡ lòng bàn tay",
        "url": "https://heart.org/en/healthy-living/healthy-eating/cooking-skills/preparing/making-the-healthy-cut-fish-poultry-and-lean-meats",
        "kind": "hiệp hội chuyên môn"
      }
    ],
    "grams": 120,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "thit-bo-bap--1-long-ban-tay",
    "food": "Thịt bò bắp",
    "label": "1 lòng bàn tay",
    "note": "Theo nguồn chính thống (David chốt 2026-11-03): 1 lòng bàn tay = 3 oz ≈ 85 g đã nấu, tức khoảng 125 g sống.",
    "approved": true,
    "refs": [
      {
        "title": "CDC: 3 oz thịt, cá = lòng bàn tay (không tính ngón)",
        "url": "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html",
        "kind": "nhà nước"
      },
      {
        "title": "USDA, Nutritive Value of Foods: 3 oz thịt cá chín = lòng bàn tay người lớn",
        "url": "https://www.ars.usda.gov/is/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf",
        "kind": "nhà nước"
      },
      {
        "title": "American Heart Association: khẩu phần đạm khoảng 3 oz chín, cỡ lòng bàn tay",
        "url": "https://heart.org/en/healthy-living/healthy-eating/cooking-skills/preparing/making-the-healthy-cut-fish-poultry-and-lean-meats",
        "kind": "hiệp hội chuyên môn"
      }
    ],
    "grams": 125,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "ca-basa-fillet--1-long-ban-tay",
    "food": "Cá basa fillet",
    "label": "1 lòng bàn tay",
    "note": "Theo nguồn chính thống (David chốt 2026-11-03): 1 lòng bàn tay = 3 oz ≈ 85 g đã nấu, tức khoảng 105 g sống.",
    "approved": true,
    "refs": [
      {
        "title": "CDC: 3 oz thịt, cá = lòng bàn tay (không tính ngón)",
        "url": "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html",
        "kind": "nhà nước"
      },
      {
        "title": "USDA, Nutritive Value of Foods: 3 oz thịt cá chín = lòng bàn tay người lớn",
        "url": "https://www.ars.usda.gov/is/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf",
        "kind": "nhà nước"
      },
      {
        "title": "American Heart Association: khẩu phần đạm khoảng 3 oz chín, cỡ lòng bàn tay",
        "url": "https://heart.org/en/healthy-living/healthy-eating/cooking-skills/preparing/making-the-healthy-cut-fish-poultry-and-lean-meats",
        "kind": "hiệp hội chuyên môn"
      }
    ],
    "grams": 105,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "ca-hoi-fillet--1-long-ban-tay",
    "food": "Cá hồi fillet",
    "label": "1 lòng bàn tay",
    "note": "Theo nguồn chính thống (David chốt 2026-11-03): 1 lòng bàn tay = 3 oz ≈ 85 g đã nấu, tức khoảng 105 g sống.",
    "approved": true,
    "refs": [
      {
        "title": "CDC: 3 oz thịt, cá = lòng bàn tay (không tính ngón)",
        "url": "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html",
        "kind": "nhà nước"
      },
      {
        "title": "USDA, Nutritive Value of Foods: 3 oz thịt cá chín = lòng bàn tay người lớn",
        "url": "https://www.ars.usda.gov/is/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf",
        "kind": "nhà nước"
      },
      {
        "title": "American Heart Association: khẩu phần đạm khoảng 3 oz chín, cỡ lòng bàn tay",
        "url": "https://heart.org/en/healthy-living/healthy-eating/cooking-skills/preparing/making-the-healthy-cut-fish-poultry-and-lean-meats",
        "kind": "hiệp hội chuyên môn"
      }
    ],
    "grams": 105,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "ca-thu--1-long-ban-tay",
    "food": "Cá thu",
    "label": "1 lòng bàn tay",
    "note": "Theo nguồn chính thống (David chốt 2026-11-03): 1 lòng bàn tay = 3 oz ≈ 85 g đã nấu, tức khoảng 105 g sống.",
    "approved": true,
    "refs": [
      {
        "title": "CDC: 3 oz thịt, cá = lòng bàn tay (không tính ngón)",
        "url": "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html",
        "kind": "nhà nước"
      },
      {
        "title": "USDA, Nutritive Value of Foods: 3 oz thịt cá chín = lòng bàn tay người lớn",
        "url": "https://www.ars.usda.gov/is/np/NutritiveValueofFoods/NutritiveValueofFoods.pdf",
        "kind": "nhà nước"
      },
      {
        "title": "American Heart Association: khẩu phần đạm khoảng 3 oz chín, cỡ lòng bàn tay",
        "url": "https://heart.org/en/healthy-living/healthy-eating/cooking-skills/preparing/making-the-healthy-cut-fish-poultry-and-lean-meats",
        "kind": "hiệp hội chuyên môn"
      }
    ],
    "grams": 105,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "whey-protein-isolate-bot--1-muong",
    "food": "Whey protein isolate (bột)",
    "label": "1 muỗng",
    "note": "USDA FNDDS: 1 muỗng không rõ hãng = 26 g; giữ 30 g (lệch 4 g). Muỗng mỗi hãng khác nhau: xem nhãn.",
    "approved": true,
    "refs": [
      {
        "title": "USDA FNDDS 2021–2023 (FDC 2710742): bột whey, 1 muỗng không rõ hãng = 26 g",
        "url": "https://fdc.nal.usda.gov/",
        "kind": "nhà nước"
      },
      {
        "title": "Theo nhãn: Optimum Nutrition Gold Standard 100% Isolate, 1 muỗng = 30 g",
        "url": "",
        "kind": "nhãn sản phẩm"
      }
    ],
    "grams": 30,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "sua-tuoi-khong-duong--1-hop-180-ml",
    "food": "Sữa tươi không đường",
    "label": "1 hộp 180 ml",
    "note": "180 ml × 1,031 g/ml = 185,6 g.",
    "approved": true,
    "refs": [
      {
        "title": "Theo nhãn: hộp 180 ml",
        "url": "",
        "kind": "nhãn sản phẩm"
      },
      {
        "title": "USDA FNDDS 2021–2023 (FDC 2705385): sữa tươi nguyên kem 1 fl oz = 30,5 g",
        "url": "https://fdc.nal.usda.gov/",
        "kind": "nhà nước"
      }
    ],
    "grams": 185,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "sua-chua-hy-lap-khong-duong--1-hu-nho",
    "food": "Sữa chua Hy Lạp không đường",
    "label": "1 hũ nhỏ",
    "note": "Viện Dinh dưỡng: 100 g sữa chua = 1 đơn vị ăn; hũ 100 g là quy cách phổ biến.",
    "approved": true,
    "refs": [
      {
        "title": "Viện Dinh dưỡng Quốc gia: đơn vị ăn của tháp dinh dưỡng",
        "url": "https://viendinhduong.vn/vi/article/tin-tuc/huong-dan-su-dung-thap-dinh-duong-cho-nguoi-cao-tuoi-68baa5e00ca85001dd026ee2",
        "kind": "nhà nước"
      },
      {
        "title": "Theo nhãn: hũ sữa chua 100 g (quy cách phổ biến ở Việt Nam)",
        "url": "",
        "kind": "nhãn sản phẩm"
      }
    ],
    "grams": 100,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "rau-muong--1-chen-rau-da-nau",
    "food": "Rau muống",
    "label": "1 chén rau đã nấu",
    "note": "David chốt 2026-11-03 theo Viện Dinh dưỡng (½ bát con rau luộc ≈ 80 g). USDA cho 98 g mỗi cup rau muống thái khúc.",
    "approved": true,
    "refs": [
      {
        "title": "Viện Dinh dưỡng Quốc gia: đơn vị ăn của tháp dinh dưỡng",
        "url": "https://viendinhduong.vn/vi/article/tin-tuc/huong-dan-su-dung-thap-dinh-duong-cho-nguoi-cao-tuoi-68baa5e00ca85001dd026ee2",
        "kind": "nhà nước"
      },
      {
        "title": "USDA FoodData Central, SR Legacy: khối lượng 1 cup",
        "url": "https://fdc.nal.usda.gov/",
        "kind": "nhà nước"
      }
    ],
    "grams": 160,
    "source": {
      "db": "David"
    }
  },
  {
    "id": "cai-ngot--1-chen-rau-da-nau",
    "food": "Cải ngọt",
    "label": "1 chén rau đã nấu",
    "note": "Rau luộc, ép nhẹ trong chén.",
    "approved": true,
    "refs": [
      {
        "title": "Viện Dinh dưỡng Quốc gia: đơn vị ăn của tháp dinh dưỡng",
        "url": "https://viendinhduong.vn/vi/article/tin-tuc/huong-dan-su-dung-thap-dinh-duong-cho-nguoi-cao-tuoi-68baa5e00ca85001dd026ee2",
        "kind": "nhà nước"
      },
      {
        "title": "USDA SR Legacy: cải thìa luộc 1 cup = 170 g",
        "url": "https://fdc.nal.usda.gov/",
        "kind": "nhà nước"
      }
    ],
    "grams": 160,
    "source": {
      "db": "David"
    }
  }
]);

/** Khẩu phần học viên dùng được cho một món: đã duyệt và có gram. */
export function portionsFor(food) {
  return PORTIONS.filter((portion) => portion.food === food && portion.approved && portion.grams > 0);
}
