import glob
import re
import os

def scale_ui(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Sequential replacement with temp markers to avoid double scaling
    replacements = [
        ('h-32 w-32', 'h-temp36 w-temp36'),
        ('h-24 w-24', 'h-temp28 w-temp28'),
        ('h-12 w-12', 'h-temp14 w-temp14'),
        ('h-10 w-10', 'h-temp12 w-temp12'),
        ('h-8 w-8', 'h-temp10 w-temp10'),
        ('h-7 w-7', 'h-temp9 w-temp9'),
        ('h-6 w-6', 'h-temp8 w-temp8'),
        ('h-5 w-5', 'h-temp7 w-temp7'),
        ('h-4 w-4', 'h-temp6 w-temp6'),
        ('h-3.5 w-3.5', 'h-temp5 w-temp5'),
        ('h-3 w-3', 'h-temp4 w-temp4'),
        ('h-2 w-2', 'h-temp3 w-temp3'),
        ('h-1.5 w-1.5', 'h-temp2.5 w-temp2.5'),
        ('h-1 w-1', 'h-temp2 w-temp2'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    # Finalize replacements
    content = content.replace('h-temp', 'h-')
    content = content.replace('w-temp', 'w-')

    # Chart heights and container widths
    content = content.replace('h-[400px]', 'h-[500px]')
    content = content.replace('h-[300px]', 'h-[450px]')
    content = content.replace('h-[200px]', 'h-[350px]')
    content = content.replace('max-w-[1800px]', 'max-w-[2100px]')
    content = content.replace('max-w-4xl', 'max-w-5xl')
    content = content.replace('p-16', 'p-20')
    content = content.replace('p-10', 'p-12')
    content = content.replace('gap-14', 'gap-16')

    # Button heights
    content = content.replace('h-14', 'h-16')
    content = content.replace('h-12', 'h-14')
    content = content.replace('h-11', 'h-13')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_path = r'c:\Users\kharizma\Downloads\StudentAcademicPlatform-main\StudentAcademicPlatform-main\frontend'
tsx_files = glob.glob(os.path.join(base_path, 'app/**/*.tsx'), recursive=True)
tsx_files += glob.glob(os.path.join(base_path, 'components/**/*.tsx'), recursive=True)

for file in tsx_files:
    scale_ui(file)

print(f"Scaled UI elements in {len(tsx_files)} files.")
