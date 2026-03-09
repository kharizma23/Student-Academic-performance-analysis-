import os
import glob
import re

def fix_errors(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the double slash issues caused by the previous replacement
    content = content.replace('bg-white/5/5', 'bg-white/5')
    content = content.replace('bg-white/5/10', 'bg-white/10')
    content = content.replace('bg-white/5/20', 'bg-white/20')
    content = content.replace('bg-white/5/30', 'bg-white/30')
    content = content.replace('bg-white/5/40', 'bg-white/40')
    content = content.replace('bg-white/5/50', 'bg-white/50')
    content = content.replace('bg-white/5/80', 'bg-white/80')
    content = content.replace('bg-white/5/backdrop', 'bg-white/5 backdrop')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

tsx_files = glob.glob('c:/Users/kharizma/Downloads/StudentAcademicPlatform-main/StudentAcademicPlatform-main/frontend/app/**/*.tsx', recursive=True)

for file in tsx_files:
    fix_errors(file)

print(f"Fixed errors in {len(tsx_files)} files.")
