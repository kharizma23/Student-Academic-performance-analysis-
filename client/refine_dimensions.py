import glob
import re
import os

def fix_dimensions(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix h-14 w-12 -> h-12 w-12 or h-14 w-14
    # Let's decide on a target. h-14 w-14 seems better for larger scale.
    content = content.replace('h-14 w-12', 'h-14 w-14')
    content = content.replace('h-16 w-14', 'h-16 w-16')
    content = content.replace('h-12 w-10', 'h-12 w-12')
    content = content.replace('h-10 w-8', 'h-10 w-10')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_path = r'c:\Users\kharizma\Downloads\StudentAcademicPlatform-main\StudentAcademicPlatform-main\frontend'
tsx_files = glob.glob(os.path.join(base_path, 'app/**/*.tsx'), recursive=True)
tsx_files += glob.glob(os.path.join(base_path, 'components/**/*.tsx'), recursive=True)

for file in tsx_files:
    fix_dimensions(file)

print(f"Refined dimensions in {len(tsx_files)} files.")
