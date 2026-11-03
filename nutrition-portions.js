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
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "com-gao-lut-chin--1-chen-com",
    "food": "Cơm gạo lứt (chín)",
    "label": "1 chén cơm",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "bun-tuoi--phan-bun-cua-1-to",
    "food": "Bún tươi",
    "label": "Phần bún của 1 tô",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "banh-pho-tuoi--phan-banh-cua-1-to-pho",
    "food": "Bánh phở tươi",
    "label": "Phần bánh của 1 tô phở",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "gao-nep-xoi-chin--1-goi-xoi",
    "food": "Gạo nếp (xôi chín)",
    "label": "1 gói xôi",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "banh-mi-trang--1-o-banh-mi",
    "food": "Bánh mì trắng",
    "label": "1 ổ bánh mì",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "uc-ga-bo-da-song--1-long-ban-tay",
    "food": "Ức gà bỏ da (sống)",
    "label": "1 lòng bàn tay",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "dui-ga-bo-da-song--1-long-ban-tay",
    "food": "Đùi gà bỏ da (sống)",
    "label": "1 lòng bàn tay",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "thit-heo-than-nac--1-long-ban-tay",
    "food": "Thịt heo thăn nạc",
    "label": "1 lòng bàn tay",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "thit-bo-than--1-long-ban-tay",
    "food": "Thịt bò thăn",
    "label": "1 lòng bàn tay",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "thit-bo-bap--1-long-ban-tay",
    "food": "Thịt bò bắp",
    "label": "1 lòng bàn tay",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "ca-basa-fillet--1-long-ban-tay",
    "food": "Cá basa fillet",
    "label": "1 lòng bàn tay",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "ca-hoi-fillet--1-long-ban-tay",
    "food": "Cá hồi fillet",
    "label": "1 lòng bàn tay",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "ca-thu--1-long-ban-tay",
    "food": "Cá thu",
    "label": "1 lòng bàn tay",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "dau-phu-trang--1-bia-dau",
    "food": "Đậu phụ trắng",
    "label": "1 bìa đậu",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "whey-protein-isolate-bot--1-muong",
    "food": "Whey protein isolate (bột)",
    "label": "1 muỗng",
    "note": "Theo muỗng của hãng, xem nhãn.",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "sua-tuoi-khong-duong--1-hop-180-ml",
    "food": "Sữa tươi không đường",
    "label": "1 hộp 180 ml",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "sua-chua-hy-lap-khong-duong--1-hu-nho",
    "food": "Sữa chua Hy Lạp không đường",
    "label": "1 hũ nhỏ",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "rau-muong--1-chen-rau-da-nau",
    "food": "Rau muống",
    "label": "1 chén rau đã nấu",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  },
  {
    "id": "cai-ngot--1-chen-rau-da-nau",
    "food": "Cải ngọt",
    "label": "1 chén rau đã nấu",
    "note": "",
    "approved": false,
    "grams": null,
    "source": null
  }
]);

/** Khẩu phần học viên dùng được cho một món: đã duyệt và có gram. */
export function portionsFor(food) {
  return PORTIONS.filter((portion) => portion.food === food && portion.approved && portion.grams > 0);
}
