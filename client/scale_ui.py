import glob
import re

def scale_ui(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Font sizes: Replace hardcoded pixel sizes with scaling rem classes
    content = content.replace('text-[8px]', 'text-xs')
    content = content.replace('text-[9px]', 'text-xs')
    content = content.replace('text-[10px]', 'text-sm')
    content = content.replace('text-[11px]', 'text-base')
    content = content.replace('text-[12px]', 'text-lg')

    # Also slightly bump text-xs to text-sm in the admin dashboard navigation specific classes if still present
    # since navigation tabs usually benefit from being very clear.
    # Actually, the above replacements will handle text-[10px].

    # Safe sequential replacement for icons
    content = content.replace('h-6 w-6', 'h-temp8 w-temp8')
    content = content.replace('h-5 w-5', 'h-temp7 w-temp7')
    content = content.replace('h-4 w-4', 'h-temp6 w-temp6')
    content = content.replace('h-3.5 w-3.5', 'h-temp5 w-temp5')
    content = content.replace('h-3 w-3', 'h-temp4 w-temp4')

    content = content.replace('h-temp8 w-temp8', 'h-8 w-8')
    content = content.replace('h-temp7 w-temp7', 'h-7 w-7')
    content = content.replace('h-temp6 w-temp6', 'h-6 w-6')
    content = content.replace('h-temp5 w-temp5', 'h-5 w-5')
    content = content.replace('h-temp4 w-temp4', 'h-4 w-4')

    # Fix specific Rechart sizes if any (e.g., PieChart innerRadius if too small on massive screens)
    # This might be too specific, but let's let Tailwind handle container sizing as Recharts is responsive.
    # Just bump the height of the ResponsiveContainers from h-[300px] to h-[400px] so graphs are clearly visible.
    content = content.replace('h-[300px]', 'h-[400px]')
    content = content.replace('h-[200px]', 'h-[300px]')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

tsx_files = glob.glob('c:/Users/kharizma/Downloads/StudentAcademicPlatform-main/StudentAcademicPlatform-main/frontend/app/**/*.tsx', recursive=True)
for file in tsx_files:
    scale_ui(file)

print(f"Scaled UI elements in {len(tsx_files)} files.")
