import os
import re

# Define the root directory for frontend
root_dir = r"c:\Users\kharizma\Downloads\StudentAcademicPlatform-main\StudentAcademicPlatform-main\frontend"

# Replacement maps
replacements = {
    # Tailwind classes
    r'blue-600': 'olive-600',
    r'blue-500': 'olive-500',
    r'blue-400': 'olive-400',
    r'blue-300': 'olive-300',
    r'blue-200': 'olive-200',
    r'blue-100': 'olive-100',
    r'blue-50': 'olive-50',
    r'indigo-600': 'sage-600',
    r'indigo-500': 'sage-400', # Mapping to sage for variety
    r'indigo-400': 'sage-300',
    r'indigo-100': 'sage-100',
    
    # RGBA values (approximate matches for common blue shades in the project)
    r'rgba\(37, 99, 235': 'rgba(94, 125, 47', # Blue-600
    r'rgba\(59, 130, 246': 'rgba(118, 146, 85', # Blue-500
    r'rgba\(30, 64, 175': 'rgba(68, 90, 34',   # Darker blue
    r'rgba\(6, 182, 212': 'rgba(132, 170, 75', # Cyan/Teal to Sage
    r'rgba\(99, 102, 241': 'rgba(111, 127, 104', # Indigo to Sage
}

# Directories to process
target_dirs = [
    os.path.join(root_dir, 'app'),
    os.path.join(root_dir, 'components')
]

# Files to exclude from processing (to avoid breaking logic or node_modules)
exclude_files = ['layout.js', 'layout.tsx'] # We might want to keep layout manual or just be careful

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements.items():
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")

def walk_and_replace():
    for target_dir in target_dirs:
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                if file.endswith(('.tsx', '.ts', '.css', '.js')):
                    process_file(os.path.join(root, file))

if __name__ == "__main__":
    walk_and_replace()
