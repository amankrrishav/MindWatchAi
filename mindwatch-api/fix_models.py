import re

with open("app/db/models.py", "r") as f:
    lines = f.readlines()

new_lines = []
has_imported_mapped = False

for line in lines:
    if "from sqlalchemy.orm import" in line and not has_imported_mapped:
        line = line.replace("import ", "import Mapped, ")
        has_imported_mapped = True
    elif "from sqlalchemy import" in line and not has_imported_mapped:
        new_lines.append("from sqlalchemy.orm import Mapped, mapped_column\n")
        has_imported_mapped = True
        
    # Match lines like:   id = Column(Integer, primary_key=True...)
    match = re.match(r"^(\s+)([a-zA-Z0-9_]+)\s*=\s*(Column\(.*)$", line)
    if match:
        indent = match.group(1)
        name = match.group(2)
        col_def = match.group(3)
        
        # Determine type
        if "Integer" in col_def:
            t = "int"
        elif "Float" in col_def:
            t = "float"
        elif "String" in col_def or "Text" in col_def:
            t = "str"
        elif "Boolean" in col_def:
            t = "bool"
        elif "DateTime" in col_def:
            t = "datetime"
        elif "JSON" in col_def:
            t = "dict | list"
        else:
            t = "Any"
            
        # Optional check: nullable=True or default
        if "nullable=True" in col_def or ("default=" in col_def and "server_default=" not in col_def):
            if t != "Any":
                t = f"{t} | None"
                
        new_lines.append(f"{indent}{name}: Mapped[{t}] = {col_def}\n")
    else:
        new_lines.append(line)

with open("app/db/models.py", "w") as f:
    f.writelines(new_lines)
