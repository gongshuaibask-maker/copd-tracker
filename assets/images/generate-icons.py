"""COPD App Icon Generator — SVG to PNG conversion"""
import cairosvg
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SVG_PATH = os.path.join(BASE_DIR, 'icon.svg')

with open(SVG_PATH, 'r', encoding='utf-8') as f:
    svg_data = f.read()

sizes = [48, 96, 180, 512, 1024]

for size in sizes:
    out_path = os.path.join(BASE_DIR, f'icon-{size}.png')
    cairosvg.svg2png(
        bytestring=svg_data.encode('utf-8'),
        write_to=out_path,
        output_width=size,
        output_height=size,
    )
    print(f'✅ Generated icon-{size}.png ({size}×{size})')

# Also generate the main icon.png (1024×1024)
main_icon = os.path.join(BASE_DIR, 'icon.png')
cairosvg.svg2png(
    bytestring=svg_data.encode('utf-8'),
    write_to=main_icon,
    output_width=1024,
    output_height=1024,
)
print('✅ Generated icon.png (1024×1024) — main app icon')
print('\n🎉 All icons generated successfully!')
