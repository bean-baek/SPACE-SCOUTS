// ============================================================
// Space Scouts — content model
// Edit THIS file to add real content. Images live in public/images/,
// referenced here as "/images/...".
// Leave image: "" to show a grey placeholder tile.
//
// Each subcategory has its own `color` theme (one of the keys below —
// add a new one in styles.css :root + a .theme-<name> rule to add more):
//   pink | blue | yellow | lime | khaki
//
// `desc` can be a single string or an array of strings — each array entry
// renders as its own paragraph (blank line between them). Use "\n" inside
// a string for a line break within a paragraph.
// ============================================================
export const DATA = {
  categories: [
    {
      id: "space-supplies",
      label: "SPACE SUPPLIES",
      subcategories: [
        {
          id: "standard-reward",
          label: "STANDARD REWARD",
          live: true,
          color: "pink",
        },
        {
          id: "cocktail-reward",
          label: "COCKTAIL REWARD",
          live: true,
          color: "blue",
        },
        {
          id: "early-bird-reward",
          label: "EARLY-BIRD REWARD",
          live: true,
          color: "yellow",
        },
        { id: "lucky-draw", label: "LUCKY DRAW", live: true, color: "lime" },
        {
          id: "capsule-draw",
          label: "CAPSULE DRAW",
          live: true,
          color: "khaki",
        },
      ],
    },
    { id: "mission-reports", label: "MISSION REPORTS", subcategories: [] },
    { id: "training-center", label: "TRAINING CENTER", subcategories: [] },
  ],

  // Grid + detail items, keyed by subcategory id.
  items: {
    "standard-reward": [
      {
        id: "postcard",
        name: "POSTCARD",
        options: ["사진", "일러스트"],
        meta: "기본 지급품 · 엽서 2종",
        image: "", // TODO: e.g. "/images/postcard.png"
        desc: "새로운 스카우트 대원을 위한 보급품이 도착했어요! \n 대장의 멋진 모습을 담은 사진 엽서와 귀엽게 기록한 일러스트 엽서, 총 두 가지로 준비했습니다. \n 대장과 함께할 우주 탐사 준비 완료!\n소중히 보관하고, 언제든 다음 임무를 기다려 주세요.",
      },
      {
        id: "id-card",
        name: "ID CARD",
        options: ["2026"],
        meta: "기본 지급품 · 1종",
        image: "",
        desc: "스페이스 스카우트를 이끄는 료 대장의 공식 대원증을 준비했어요!\n대장의 모습과 대원 정보가 기록된 특별한 카드로, \n 탐사대의 소중한 자료이자 대장과 함께하는 임무의 증표입니다.\n언제든 꺼내 볼 수 있도록 소중히 보관하고, \n대장과 함께 새로운 우주 탐사를 시작해 보세요.",
      },
      {
        id: "id-photo",
        name: "ID PHOTO",
        options: ["2026"],
        meta: "기본 지급품 · 료 대장 증명사진 1종",
        image: "",
        desc: [
          "스페이스 스카우트를 이끄는 료 대장의 증명사진을 준비했어요!\n어떤 임무도 두렵지 않은 듬직하고 아주 용맹한 표정과\n대장다운 늠름한 모습을 한 장에 담았습니다.",
          "탐사대의 믿음직한 대장 곁에서,\n새로운 미션을 힘차게 시작해 보세요.",
        ],
      },
      {
        id: "stickers",
        name: "STICKERS",
        options: ["펫", "포스터"],
        meta: "기본 지급품 · 스티커 2종",
        image: "",
        desc: "대장의 사랑스러운 펫을 담은 일러스트 스티커와\n스페이스 스카우트의 탐사대원 모집 포스터 스티커, 총 2종을 준비했어요!\n대원이라면 이 모집 포스터를 본 적이 있겠죠?\n바로 이 포스터를 따라 스페이스 스카우트까지 찾아온 대원들을 위해, \n그 특별한 첫 만남을 작은 스티커에 그대로 담았습니다.\n각 스티커는 약 5cm 크기로,\n다이어리나 노트, 휴대폰 케이스 등 원하는 곳에 붙여\n스페이스 스카우트의 흔적을 곳곳에 남겨 보세요.",
      },
    ],

    "cocktail-reward": [
      {
        id: "acrylic-hair-clip",
        name: "ACRYLIC HAIR CLIP",
        options: ["치치", "RYO", "왹료", "료", "왹율", "율이"],
        meta: "칵테일 지급품 · 아크릴 헤어핀 6종",
        image: "",
        desc: [
          "대장의 다양한 모습을 담은 아크릴 헤어핀 6종을 준비했어요!\n귀여운 레터링, 일러스트, 사진 등 여러 가지 스타일로 있어\n취향에 따라 즐겁게 골라볼 수 있습니다.",
          "머리뿐 아니라 가방이나 파우치, 옷에 톡 달아\n스카우트만의 센스로 일상 속 랜덤 기분을 함께해 보세요.",
        ],
      },
    ],

    "early-bird-reward": [
      {
        id: "t-shirt",
        name: "T-SHIRT",
        options: ["화이트", "스카이블루"],
        meta: "선착순 지급품 · 티셔츠 2종",
        image: "",
        desc: [
          "8월 3일과 8월 4일에 가입한 스카우트 대원들을 위한,\n특별한 클리커 키링을 준비했어요!\n스페이스 스카우트의 탐사선에 올라탄 료의 펫을 귀여운 모습으로 담았습니다. \n가방이나 파우치에 달아 두면,\n어디서든 펫과 함께 우주 탐사를 떠날 수 있어요.\n탐사 미션 도중 스트레스받는 일이 생겼다면 버튼을 마구 눌러 보세요!\n경쾌한 클릭 소리와 함께 답답한 기분을 날려 버리고,\n다시 힘차게 임무를 시작해 보세요.",
        ],
      },
      {
        id: "clicker-keyring",
        name: "CLICKER KEYRING",
        options: ["UFO"],
        meta: "선착순 지급품 · 클리커 키링 1종",
        image: "",
        desc: [
          "8월 3일과 8월 4일에 가입한 스카우트 대원들을 위한,\n특별한 클리커 키링을 준비했어요!\n스페이스 스카우트의 탐사선에 올라탄 료의 펫을 귀여운 모습으로 담았습니다. \n가방이나 파우치에 달아 두면, \n어디서든 펫과 함께 우주 탐사를 떠날 수 있어요.\n탐사 미션 도중 스트레스받는 일이 생겼다면 버튼을 마구 눌러 보세요! \n경쾌한 클릭 소리와 함께 답답한 기분을 날려 버리고, \n다시 힘차게 임무를 시작해 보세요.",
        ],
      },
    ],

    "lucky-draw": [
      {
        id: "squishy",
        name: "[H] SQUISHY",
        options: ["핑크", "블루", "그린"],
        meta: "랜덤 보급품 · 말랑이 3종",
        image: "",
        desc: [
          "대장의 사랑스러운 볼 얼굴을 그대로 담은 말랑이 3종을 준비했어요!\n통통 튀는 핑크, 블루, 그린 세 가지 색상 중\n어떤 펫이 배정될지는 대장님의 행운에 달려 있어요.",
          "탐사 미션 도중 스트레스가 쌓였다면 참지 말고 마구 주물러 주세요!\n어려운 임무도 기분 좋게 다시 시작할 수 있을 거예요.",
        ],
      },
    ],

    "capsule-draw": [
      {
        id: "acrylic-clip",
        name: "ACRYLIC CLIP",
        options: ["시온★료", "리쿠★료", "유우시★료", "재희★료", "사쿠야★료"],
        meta: "캡슐 보급품 · 아크릴 집게 5종",
        image: "",
        desc: [
          "대장과 탐사 도중 만난 친구들과 함께한 순간을 담은\n아크릴 집게 5종을 준비했어요!\n각 친구와 대장이 함께 있는 귀여운 일러스트로 제작되었습니다.",
          "약 5cm 크기로,\n다이어리와 사진을 꾸미거나 메모를 고정할 때 사용할 수 있어요.",
        ],
      },
    ],
  },
};

export function findSubcategory(subId) {
  for (const cat of DATA.categories) {
    const sub = cat.subcategories.find((s) => s.id === subId);
    if (sub) return { cat, sub };
  }
  return null;
}
