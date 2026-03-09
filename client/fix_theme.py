import os
import glob
import re

def fix_colors(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Core background overrides
    content = content.replace('bg-[#F8FAFC]', 'bg-transparent')
    content = content.replace('bg-[#f8fafc]', 'bg-transparent')
    
    # Shadows
    content = content.replace('shadow-slate-200/50', 'shadow-black/40')
    content = content.replace('shadow-slate-200', 'shadow-black/40')
    
    # Borders
    content = content.replace('border-slate-100', 'border-white/10')
    content = content.replace('border-slate-200', 'border-white/10')
    content = content.replace('border-slate-50', 'border-white/5')
    
    # Backgrounds
    content = content.replace('bg-slate-50', 'bg-white/5')
    content = content.replace('bg-slate-100', 'bg-white/10')
    content = content.replace('bg-white', 'bg-white/5')
    
    # Text colors
    content = content.replace('text-slate-900', 'text-white')
    content = content.replace('text-slate-800', 'text-slate-100')
    content = content.replace('text-slate-700', 'text-slate-200')
    content = content.replace('text-slate-600', 'text-slate-300')

    # Card background overrides to use glass-card
    content = re.sub(r'className="([^"]*)border-none shadow-2xl shadow-black/40 rounded-\[2\.5rem\]', r'className="\1glass-card border-none shadow-2xl rounded-[2.5rem]', content)
    
    # Also for admin/page.tsx specific cards
    content = re.sub(r'className="([^"]*)bg-white/5([^"]*)"', r'className="\1bg-white/5\2"', content)

    # Revert text-white to text-slate-800 in specific components if they look weird, but let's just do bulk replace for now
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

tsx_files = glob.glob('c:/Users/kharizma/Downloads/StudentAcademicPlatform-main/StudentAcademicPlatform-main/frontend/app/**/*.tsx', recursive=True)

for file in tsx_files:
    fix_colors(file)

print(f"Updated {len(tsx_files)} files.")
