#!/bin/bash
set -e
D=/mnt/c/Users/allko/Downloads/DKFLEED
S=$D/site; I=$S/assets/img
mkdir -p $I $S/assets/css $S/assets/js
T=$(mktemp -d)
C=$T/coin.png
# Circular cut-out of the coin from the original logo (original token.png is never modified)
convert $D/token.png -crop 1094x1094+85+53 +repage \( -size 1094x1094 xc:black -fill white -draw 'circle 547,547 547,2' -blur 0x1 \) -alpha off -compose CopyOpacity -composite $C
Q() { convert "$1" -strip +dither -colors 255 -define png:compression-level=9 PNG8:"$1" 2>/dev/null || true; }
convert $C -resize 640x640 -strip -quality 82 $I/token-coin-640.webp
convert $C -resize 360x360 -strip -quality 80 $I/token-coin-360.webp
convert $C -resize 128x128 -strip -quality 80 $I/token-coin-128.webp
convert $C -resize 512x512 -strip PNG32:$S/icon-512.png
convert $C -resize 192x192 -strip PNG32:$S/icon-192.png
convert -size 512x512 xc:'#05060f' \( $C -resize 410x410 \) -gravity center -composite -strip $S/icon-maskable-512.png
convert -size 180x180 xc:'#05060f' \( $C -resize 168x168 \) -gravity center -composite -strip $S/apple-touch-icon.png
convert $C -resize 32x32 -strip PNG32:$S/favicon-32.png
convert $C \( -clone 0 -resize 16x16 \) \( -clone 0 -resize 32x32 \) \( -clone 0 -resize 48x48 \) -delete 0 $S/favicon.ico
F=/usr/share/fonts/truetype/dejavu
convert -size 1200x630 radial-gradient:'#1a2a6c-#05060f' \
  \( -size 1200x630 xc:none -fill 'rgba(255,40,40,0.35)' -draw 'circle 1150,80 1150,420' -blur 0x60 \) -composite \
  \( $C -resize 470x470 \) -gravity west -geometry +70+0 -composite \
  -gravity northwest -font $F/DejaVuSans-Bold.ttf -pointsize 78 -fill '#ff3b3b' -stroke '#ffd36b' -strokewidth 2 -annotate +580+180 'D.K. FLEED' \
  -stroke none -fill '#ffd36b' -pointsize 25 -kerning 4 -annotate +584+285 'THE MEME FROM DEEP SPACE' \
  -fill '#e8ecff' -pointsize 24 -kerning 2 -annotate +584+350 '$DKF  ·  Meme token on Solana' \
  -fill '#9fb0ff' -pointsize 22 -kerning 3 -annotate +584+410 'COMMUNITY FIRST. TOKEN NEXT.' \
  -strip -quality 88 $S/og-image.jpg
for f in $S/icon-192.png $S/icon-512.png $S/icon-maskable-512.png $S/apple-touch-icon.png; do Q $f; done
rm -rf $T
ls -la $S $I
