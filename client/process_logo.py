from PIL import Image
import os

def process_logo():
    input_path = 'public/logo.jpg'
    output_path = 'public/logo.png'
    
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return

    img = Image.open(input_path).convert('RGBA')
    data = img.getdata()

    new_data = []
    # Theme primary green: #5e7d2f -> (94, 125, 47)
    target_color = (94, 125, 47)

    for item in data:
        # Calculate pixel intensity (brightness)
        intensity = sum(item[:3]) / 3.0
        
        # The logo is a black silhouette on a light blue background.
        # Dark pixels correspond to the logo.
        if intensity < 180: 
            # It's part of the logo. 
            # Make it the target color, mapping intensity to transparency for smooth edges
            alpha = int(255 * (1 - (intensity / 180)))
            new_data.append((target_color[0], target_color[1], target_color[2], alpha))
        else:
            # It's the background. Make it completely transparent.
            new_data.append((255, 255, 255, 0))

    img.putdata(new_data)
    img.save(output_path, 'PNG')
    print(f"Successfully processed logo and saved to {output_path}")

if __name__ == "__main__":
    process_logo()
