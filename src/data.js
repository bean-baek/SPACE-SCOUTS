// ============================================================
// Space Scouts — content model
// Edit THIS file to add real content. Images live in public/images/,
// referenced here as "/images/...". Product photos live in public/items/,
// referenced here as "/items/...".
// Leave image: "" to show a grey placeholder tile.
//
// For items whose photo changes per option (color variants etc.), add an
// `images` object mapping each option label to its photo path. ItemDetail
// shows `images[selectedOption]` when the shopper clicks a chip, falling
// back to `image` for any option without its own photo yet.
// A path can also be an array (e.g. [front, back]) to get a swipeable
// slider with dots for that option instead of a single static photo.
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
        image: "/items/squishy.png",
        images: {
          핑크: "/items/squishy.png",
          그린: "/items/squishy_green.png",
        },
        desc: [
          "대장의 사랑스러운 볼 얼굴을 그대로 담은 말랑이 3종을 준비했어요!\n통통 튀는 핑크, 블루, 그린 세 가지 색상 중\n어떤 펫이 배정될지는 대장님의 행운에 달려 있어요.",
          "탐사 미션 도중 스트레스가 쌓였다면 참지 말고 마구 주물러 주세요!\n어려운 임무도 기분 좋게 다시 시작할 수 있을 거예요.",
        ],
      },
      {
        id: "hand-fan",
        name: "[★] HAND FAN",
        options: ["별", "우주인"],
        meta: "랜덤 보급품 · 부채 2종",
        image: "/items/hand-fan-star.png",
        images: {
          별: "/items/hand-fan-star.png",
          우주인: "/items/hand-fan-start.png",
        },
        desc: [
          "반짝이는 별의 모습을 한 대장과\n늠름하게 우주복을 입은 대장을 담은 부채 2종을 준비했어요!\n\n서로 다른 매력의 대장을 감상하며 시원한 바람까지 즐길 수 있습니다. \n뜨거운 햇빛 아래에서 탐사 임무를 이어가야 하는 대원이라면~\n꼭 챙겨야 할 여름철 필수품이에요.\n\n더위가 몰려올 때마다 힘차게 부채질하고, \n대장과 함께 시원하게 여름 탐사를 이겨 내세요.",
        ],
      },
      {
        id: "sticker-pack",
        name: "[N] STICKER PACK",
        options: ["파스텔", "네온"],
        meta: "랜덤 보급품 · 스티커팩 2종",
        image: "",
        desc: [
          "부드럽고 사랑스러운 느낌과 시선을 사로잡는 강렬한 느낌,\n서로 다른 매력을 가진 스티커 팩 2종을 준비했어요!\n각 팩에는 대장과 스페이스 스카우트의 세계를 담은 \n조각 스티커 7종이 알차게 들어 있습니다. \n다이어리와 노트, 휴대폰 케이스부터 탐사 장비까지 \n원하는 곳에 자유롭게 붙여 보세요.\n\n스티커를 하나만 붙여도!\n평범한 물건이 단숨에 스페이스 스카우트 대원의 소지품으로 변신합니다. \n대원만의 방식으로 곳곳에 탐사대의 표시를 남겨 보세요.",
        ],
      },
      {
        id: "acrylic-keyring",
        name: "[U] ACRYLIC KEYRING",
        options: ["괴물", "똥", "대장", "펫"],
        meta: "랜덤 보급품 · 아크릴 키링 4종",
        image: "",
        desc: [
          "평범한 아크릴 키링은 이제 그만!\n\n작은 아크릴 파츠들이 데롱데롱 연결된 귀여운 구성으로,\n보기만 해도 기분 좋아지는 아크릴 키링 4종을 준비했어요.\n\n대장의 다양한 모습은 물론, \n대장이 처치한 외계 젤리 괴물들,\n그리고 사랑스러운 대장의 펫까지 알차게 담아 더욱 특별합니다. \n\n여러 일러스트 파츠가 함께 달려 있어, \n작은 키링 하나에도 스페이스 스카우트의 세계가 가득 느껴져요.\n가방이나 파우치, 열쇠에 달아 두면\n\n어디서든 대장과 함께 탐사를 떠나는 기분을 즐길 수 있습니다. \n흔들릴 때마다 귀엽게 반짝이는 파츠들을 보고 있으면\n절로 행복해질 거예요.",
        ],
      },
      {
        id: "button-pin-set",
        name: "[K] BUTTON PIN SET",
        options: ["핑크", "옐로우", "그린"],
        meta: "랜덤 보급품 · 핀버튼 4종세트 3종",
        image: "/items/button-pin-set-pink.png",
        images: {
          핑크: "/items/button-pin-set-pink.png",
          옐로우: "/items/button-pin-set-yellow.png",
          그린: "/items/button-pin-set.png",
        },
        desc: [
          "각기 다른 매력을 담은 핀 버튼 4종 세트를 세 가지 색상으로 준비했어요!\n\n대원마다 마음에 드는 색을 골라 \n가방이나 파우치, 대원복에 달고 자신만의 개성을 마음껏 표현해 보세요.\n\n핀 버튼은 귀여운 알약 모양 패키지 안에 쏙 들어 있습니다. \n\n포장된 모습 그대로 가방에 달아 키링처럼 사용해도 귀엽고, \n패키지를 열어 핀 버튼을 하나씩 꺼내 원하는 곳에 달아도 좋아요.\n\n단, 진짜 알약과 무척 닮았으니 절대 헷갈리지 않도록 주의해 주세요! \n\n대원 전용 장식품일 뿐, 먹을 수 없는 특별 보급품입니다.",
        ],
      },
      {
        id: "acrylic-stand",
        name: "[E] POUCH ",
        options: ["핑크", "블루", "그린"],
        image: "/items/pouch_ping_front.png",
        images: {
          핑크: ["/items/pouch_ping_front.png", "/items/pouch_pink_back.png"],
          블루: ["/items/pouch_front.png", "/items/pouch_back.png"],
        },
      },
      {
        id: "pillow-case",
        name: "[R] PILLOW CASE",
        options: ["말티즈"],
        meta: "랜덤 보급품 · 베개커버 1종",
        image: "/items/pillow-case_front.png",
        images: {
          말티즈: ["/items/pillow-case_front.png", "/items/pillow-case_back.png"],
        },
        desc: [
          "대장을 꼭 닮은 사랑스러운 말티즈들이 우글우글 모여 있는 \n양면 베개 커버를 준비했어요! ",
          "넉넉한 50×70cm 크기로, \n앞면과 뒷면을 번갈아 사용하며 서로 다른 매력을 즐길 수 있습니다.",
          "보기만 해도 포근하고 귀여운 말티즈들 덕분에, \n베개에 머리를 대는 순간 잠이 솔솔 찾아올 거예요.",
          "긴 탐사 미션을 무사히 마치려면 충분한 체력 회복은 필수! ",
          "말티즈 친구들과 함께 편안히 쉬고, \n다음 임무를 위한 에너지를 가득 충전해 주세요.",
          "대장의 재치 있는 인사도 잊지 마세요. おやすみNASAい！",
        ],
      },
      {
        id: "tarpaulin-bag",
        name: "[I] TARPAULIN BAG",
        options: ["그린"],
        meta: "랜덤 보급품 · 타포린 백 1종",
        image: "/items/taporinbag_font.png",
        images: {
          그린: ["/items/taporinbag_font.png", "/items/tarporinbag_back.png"],
        },
        desc: [
          "대장의 멋진 모습을 가득 담은 대형 타포린 백을 준비했어요!\n 약 51×37cm의 넉넉한 크기로 제작되어, \n임무에 필요한 장비와 소지품을 무리 없이 담을 수 있습니다.",
          "튼튼한 가방에 탐사 준비물을 가득 챙기고, \n대장과 함께 어디든 힘차게 출발해 보세요. ",
          "스페이스 스카우트 대원이라면 우주 탐사를 떠날 때 \n절대 빼놓을 수 없는 필수품이겠죠?",
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
