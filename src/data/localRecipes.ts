import { Recipe } from "@/types";

export const localRecipes: Recipe[] = [
  {
    label: "Phở Bò Tái",
    image:
      "https://cdn.tgdd.vn/Files/2022/01/25/1412805/cach-nau-pho-bo-nam-dinh-chuan-vi-thom-ngon-nhu-hang-quan-202201250313281452.jpg",
    calories: 456,
    totalTime: 30,
    source: "Nutrio DB",
    ingredientLines: ["Bánh phở", "Thịt bò", "Nước dùng", "Rau thơm"],
    yield: 1
  },
  {
    label: "Cơm Tấm Sườn",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg",
    calories: 650,
    totalTime: 45,
    source: "Saigon Food",
    ingredientLines: ["Cơm tấm", "Sườn cốt lết", "Chả trứng", "Nước mắm"],
    yield: 1
  },
  {
    label: "Gỏi Cuốn Tôm",
    image: "https://cdn.tgdd.vn/2021/08/CookRecipe/Avatar/goi-cuon-tom-thit-thumbnail-1.jpg",
    calories: 195,
    totalTime: 15,
    source: "Healthy VN",
    ingredientLines: ["Bánh tráng", "Tôm", "Thịt luộc", "Rau sống"],
    yield: 3
  }
];
