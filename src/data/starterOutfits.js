export const STARTER_OUTFIT_SLOTS = [
  {
    id: "hat",
    label: "Hat",
    options: [
      { id: "hat-none", label: "No hat" },
      { id: "round-cap", label: "Round cap" },
      { id: "wide-brim", label: "Wide-brim hat" },
      { id: "tricorn", label: "Tricorn" }
    ]
  },
  {
    id: "shirt",
    label: "Shirt",
    options: [
      { id: "basic-tunic", label: "Basic tunic" },
      { id: "linen-shirt", label: "Linen shirt" },
      { id: "work-shirt", label: "Work shirt" },
      { id: "blue-vest", label: "Blue vest" }
    ]
  },
  {
    id: "pants",
    label: "Pants",
    options: [
      { id: "plain-trousers", label: "Plain trousers" },
      { id: "work-breeches", label: "Work breeches" },
      { id: "navy-breeches", label: "Navy breeches" },
      { id: "striped-trousers", label: "Striped trousers" }
    ]
  },
  {
    id: "socks",
    label: "Socks",
    options: [
      { id: "wool-socks", label: "Wool socks" },
      { id: "striped-socks", label: "Striped socks" },
      { id: "blue-socks", label: "Blue wool" },
      { id: "charcoal-socks", label: "Charcoal wool" }
    ]
  },
  {
    id: "shoes",
    label: "Shoes",
    options: [
      { id: "simple-shoes", label: "Simple shoes" },
      { id: "work-boots", label: "Work boots" },
      { id: "buckled-shoes", label: "Buckled shoes" },
      { id: "riding-boots", label: "Riding boots" }
    ]
  }
];

export function createDefaultOutfit() {
  return {
    hat: "hat-none",
    shirt: "basic-tunic",
    pants: "plain-trousers",
    socks: "wool-socks",
    shoes: "simple-shoes"
  };
}
