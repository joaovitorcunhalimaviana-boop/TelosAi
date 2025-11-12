#!/usr/bin/env python3
"""
Fix Next.js 15+ async params in API routes
Converts { params }: { params: { id: string } } to { params }: { params: Promise<{ id: string }> }
"""

import re
import sys

files_to_fix = [
    "app/api/paciente/[id]/completeness/route.ts",
    "app/api/paciente/[id]/pesquisa/route.ts",
    "app/api/paciente/[id]/route.ts",
    "app/api/paciente/[id]/timeline/route.ts",
    "app/api/templates/[id]/apply/route.ts",
]

def fix_file(filepath):
    print(f"Fixing {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Pattern 1: Fix function parameter type definition
    # { params }: { params: { id: string } } -> { params }: { params: Promise<{ id: string }> }
    content = re.sub(
        r'\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{\s*id:\s*string;?\s*\}\s*\}',
        '{ params }: { params: Promise<{ id: string }> }',
        content
    )

    # Pattern 2: Fix params access
    # const patientId = params.id; -> const { id: patientId } = await params;
    # const { id } = params; -> const { id } = await params;

    # First, find all instances where we access params.id or destructure params
    lines = content.split('\n')
    new_lines = []

    for i, line in enumerate(lines):
        # Check if this line accesses params
        if 'params.id' in line or re.match(r'\s*const\s+\{\s*id\s*\}\s*=\s*params', line):
            # Check if we haven't already awaited it
            if 'await params' not in line:
                # Pattern: const varName = params.id;
                match1 = re.match(r'(\s*)const\s+(\w+)\s*=\s*params\.id;?', line)
                if match1:
                    indent, var_name = match1.groups()
                    new_line = f'{indent}const {{ id: {var_name} }} = await params;'
                    new_lines.append(new_line)
                    continue

                # Pattern: const { id } = params;
                match2 = re.match(r'(\s*)const\s+\{\s*id\s*\}\s*=\s*params;?', line)
                if match2:
                    indent = match2.group(1)
                    new_line = f'{indent}const {{ id }} = await params;'
                    new_lines.append(new_line)
                    continue

        new_lines.append(line)

    content = '\n'.join(new_lines)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [OK] Fixed {filepath}")
        return True
    else:
        print(f"  [-] No changes needed for {filepath}")
        return False

def main():
    fixed_count = 0
    for filepath in files_to_fix:
        try:
            if fix_file(filepath):
                fixed_count += 1
        except Exception as e:
            print(f"  [ERROR] Error fixing {filepath}: {e}")

    print(f"\n[OK] Fixed {fixed_count} file(s)")

if __name__ == '__main__':
    main()
