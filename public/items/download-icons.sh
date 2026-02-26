#!/bin/bash
BASE_URL="https://assets.mcasset.cloud/1.20.1/assets/minecraft/textures"

# 武器
curl -sL "$BASE_URL/item/wooden_sword.png" -o iron_sword.png  # 用木剑代替
curl -sL "$BASE_URL/item/stone_sword.png" -o stone_sword.png
curl -sL "$BASE_URL/item/iron_sword.png" -o iron_sword.png
curl -sL "$BASE_URL/item/diamond_sword.png" -o diamond_sword.png
curl -sL "$BASE_URL/item/bow.png" -o bow.png
curl -sL "$BASE_URL/item/bow_pulling_0.png" -o bow_pulling.png

# 工具
curl -sL "$BASE_URL/item/wooden_pickaxe.png" -o wood_pickaxe.png
curl -sL "$BASE_URL/item/stone_pickaxe.png" -o stone_pickaxe.png
curl -sL "$BASE_URL/item/iron_pickaxe.png" -o iron_pickaxe.png
curl -sL "$BASE_URL/item/diamond_pickaxe.png" -o diamond_pickaxe.png
curl -sL "$BASE_URL/item/wooden_shovel.png" -o wood_shovel.png
curl -sL "$BASE_URL/item/iron_shovel.png" -o iron_shovel.png

# 食物
curl -sL "$BASE_URL/item/apple.png" -o apple.png
curl -sL "$BASE_URL/item/bread.png" -o bread.png
curl -sL "$BASE_URL/item/carrot.png" -o carrot.png
curl -sL "$BASE_URL/item/golden_apple.png" -o golden_apple.png
curl -sL "$BASE_URL/item/cooked_porkchop.png" -o cooked_pork.png

# 材料
curl -sL "$BASE_URL/item/coal.png" -o coal.png
curl -sL "$BASE_URL/item/iron_ingot.png" -o iron_ingot.png
curl -sL "$BASE_URL/item/gold_ingot.png" -o gold_ingot.png
curl -sL "$BASE_URL/item/diamond.png" -o diamond.png
curl -sL "$BASE_URL/item/stick.png" -o stick.png

echo "Download complete!"
ls -lh *.png | wc -l
