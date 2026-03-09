import glob
import re
import os

def free_size_ui(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Increase Gaps for more "breathing room"
    content = content.replace('gap-16', 'gap-20')
    content = content.replace('gap-14', 'gap-18')
    content = content.replace('gap-12', 'gap-16')
    content = content.replace('gap-10', 'gap-14')
    content = content.replace('gap-8', 'gap-12')
    content = content.replace('gap-6', 'gap-10')
    content = content.replace('gap-4', 'gap-8')
    content = content.replace('gap-3', 'gap-6')
    content = content.replace('gap-2', 'gap-4')

    # 2. Add shrink-0 to common icon usage patterns to prevent congestion
    # Pattern: className="h-X w-X text-Y ..." -> className="h-X w-X shrink-0 text-Y ..."
    content = re.sub(r'(className="h-\d+ w-\d+)(?!.*shrink-0)', r'\1 shrink-0', content)
    
    # Generic Lucide icon components often used like <Icon className="..." />
    icons = ['ShieldCheck', 'Activity', 'Users', 'GraduationCap', 'Target', 'Award', 'AlertTriangle', 
             'TrendingUp', 'Layers', 'Briefcase', 'Zap', 'RefreshCw', 'Search', 'ChevronRight', 
             'ArrowUpRight', 'TrendingDown', 'Trash2', 'UserCircle', 'FileText', 'Mail', 'Bell', 
             'Globe', 'LayoutGrid', 'Plus', 'BrainCircuit', 'Sparkles', 'MessageSquare', 'LogOut', 'Settings2', 'X']
    
    for icon in icons:
        # Avoid double shrink-0
        pattern = rf'<{icon}([^>]*className="[^"]*)(?!.*shrink-0)([^"]*")'
        content = re.sub(pattern, rf'<{icon}\1 shrink-0\2', content)

    # 3. Increase Modal Widths
    content = content.replace('max-w-6xl', 'max-w-7xl')
    content = content.replace('max-w-5xl', 'max-w-7xl')
    content = content.replace('max-w-4xl', 'max-w-6xl')
    content = content.replace('w-64', 'w-80') # System terminal width

    # 4. Increase Main Padding
    content = content.replace('p-12 md:p-20', 'p-16 md:p-24')
    content = content.replace('p-10 md:p-16', 'p-14 md:p-20')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_path = r'c:\Users\kharizma\Downloads\StudentAcademicPlatform-main\StudentAcademicPlatform-main\frontend'
tsx_files = glob.glob(os.path.join(base_path, 'app/**/*.tsx'), recursive=True)
tsx_files += glob.glob(os.path.join(base_path, 'components/**/*.tsx'), recursive=True)

for file in tsx_files:
    free_size_ui(file)

print(f"Applied free-size optimizations to {len(tsx_files)} files.")
