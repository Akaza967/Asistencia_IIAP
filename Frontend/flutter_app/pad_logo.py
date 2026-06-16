import os
from PIL import Image, ImageDraw

def main():
    logo_path = 'assets/logo_asistenciaiiap.png'
    out_path = 'assets/logo_padded.png'
    
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} does not exist.")
        return

    # Load the original logo (1024x1024)
    img = Image.open(logo_path).convert("RGBA")
    w, h = img.size
    print(f"Original logo dimensions: {w}x{h}")

    # 1. Apply rounded corners mask to match the ClipRRect in Flutter (12% corner radius)
    radius = int(w * 0.12)  # 123 pixels for 1024x1024
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    
    # Apply the mask to the image's alpha channel
    img.putalpha(mask)

    # 2. Resize the rounded logo to 480x480 to fit the Android 12 circle safe zone
    # and keep a very high-quality resolution (not blurry).
    target_size = 480
    print(f"Resizing logo to: {target_size}x{target_size}")
    resized_img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)

    # 3. Create a 1024x1024 transparent canvas (larger canvas = sharper native rendering)
    canvas_size = 1024
    canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))

    # Center the resized logo on the canvas
    x = (canvas_size - target_size) // 2
    y = (canvas_size - target_size) // 2
    canvas.paste(resized_img, (x, y))

    # Save the output image
    canvas.save(out_path)
    print(f"Padded logo with rounded corners saved successfully at {out_path}")

if __name__ == '__main__':
    main()
