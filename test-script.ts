type Variant = {
  value: string;
  options: string[];
};
type SKU = {
  value: string;
  price: number;
  stock: number;
  image: string;
};

type Data = {
  product: {
    publishedAt: string | null;
    name: string;
    basePrice: number;
    virtualPrice: number;
    brandId: number;
    images: string[];
    categories: number[];
    variants: Variant[];
  };
  skus: SKU[];
};

function generateSKUs(variants: Variant[]): SKU[] {
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce<string[]>(
      (acc, curr) =>
        acc.flatMap((x) => curr.map((y) => `${x}${x ? "-" : ""}${y}`)),
      [""],
    );
  }

  const options = variants.map((variant) => variant.options);

  const combinations = getCombinations(options);

  return combinations.map((value) => ({
    value,
    price: 100000,
    stock: 10,
    image: "https://example.com/image1.jpg",
  }));
}

const data: Data = {
  product: {
    publishedAt: new Date().toISOString(),
    name: "Sản phẩm mẫu",
    basePrice: 100000,
    virtualPrice: 120000,
    brandId: 1,
    images: [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg",
    ],
    categories: [1, 2],
    variants: [
      { value: "Màu sắc", options: ["Đen", "Trắng", "Xanh", "Tím"] },
      { value: "Kích thước", options: ["S", "M", "L", "XL"] },
      { value: "Chất liệu", options: ["Cotton", "Polyester", "Len"] },
    ],
  },
  skus: [],
};

const skus = generateSKUs(data.product.variants);
data.skus = skus;
console.log(skus);
