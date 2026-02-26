#!/bin/bash
BASE_URL="https://assets.mcasset.cloud/1.20.1/assets/minecraft/textures"

# 武器
curl -sL "$BASE_URL/item/crossbow.png" -o crossbow.png
curl -sL "$BASE_URL/item/trident.png" -o trident.png
curl -sL "$BASE_URL/item/iron_axe.png" -o iron_axe.png
curl -sL "$BASE_URL/item/mace.png" -o mace.png

# 工具
curl -sL "$BASE_URL/item/golden_pickaxe.png" -o gold_pickaxe.png
curl -sL "$BASE_URL/item/iron_hoe.png" -o iron_hoe.png

# 防具
curl -sL "$BASE_URL/item/iron_helmet.png" -o iron_helmet.png
curl -sL "$BASE_URL/item/iron_chestplate.png" -o iron_chestplate.png
curl -sL "$BASE_URL/item/iron_leggings.png" -o iron_leggings.png
curl -sL "$BASE_URL/item/iron_boots.png" -o iron_boots.png
curl -sL "$BASE_URL/item/shield.png" -o shield.png
curl -sL "$BASE_URL/item/turtle_helmet.png" -o turtle_helmet.png

# 食物
curl -sL "$BASE_URL/item/potato.png" -o potato.png
curl -sL "$BASE_URL/item/cooked_beef.png" -o cooked_beef.png
curl -sL "$BASE_URL/item/cooked_chicken.png" -o cooked_chicken.png
curl -sL "$BASE_URL/item/cookie.png" -o cookie.png
curl -sL "$BASE_URL/item/cake.png" -o cake.png

# 材料
curl -sL "$BASE_URL/item/charcoal.png" -o charcoal.png
curl -sL "$BASE_URL/item/emerald.png" -o emerald.png
curl -sL "$BASE_URL/item/lapis_lazuli.png" -o lapis_lazuli.png
curl -sL "$BASE_URL/item/redstone.png" -o redstone.png
curl -sL "$BASE_URL/item/string.png" -o string.png

echo "Download complete!"
ls *.png | wc -l
