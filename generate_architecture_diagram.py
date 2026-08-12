from PIL import Image, ImageDraw, ImageFont
import os

width, height = 1400, 980
img = Image.new('RGB', (width, height), 'white')
d = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype('arial.ttf', 20)
    title_font = ImageFont.truetype('arialbd.ttf', 30)
except Exception:
    font = ImageFont.load_default()
    title_font = font

# Helpers

def text_size(txt, fnt):
    bbox = d.textbbox((0, 0), txt, font=fnt)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_box(x0, y0, x1, y1, title, items):
    d.rectangle([x0, y0, x1, y1], fill='#F8F8F8', outline='black', width=2)
    title_w, title_h = text_size(title, title_font)
    d.text((x0 + (x1 - x0 - title_w) / 2, y0 + 14), title, fill='black', font=title_font)
    y = y0 + 56
    for item in items:
        d.text((x0 + 24, y), item, fill='black', font=font)
        _, line_h = text_size(item, font)
        y += line_h + 8


def draw_arrow(x0, y0, x1, y1):
    d.line((x0, y0, x1, y1), fill='black', width=4)
    if y1 > y0:
        p = [(x1, y1), (x1 - 12, y1 - 20), (x1 + 12, y1 - 20)]
    else:
        p = [(x1, y1), (x1 - 12, y1 + 20), (x1 + 12, y1 + 20)]
    d.polygon(p, fill='black')

# Boxes
users = (110, 60, width-110, 190)
frontend = (170, 240, width-170, 330)
backend = (220, 410, width-520, 600)
database = (260, 690, width-260, 880)
sec = (width-390, 430, width-110, 600)

# Draw boxes
users_items = ['Employee', 'HR/Admin']
draw_box(*users, 'Users', users_items)
frontend_items = ['React.js', 'Bootstrap']
draw_box(*frontend, 'Frontend', frontend_items)
backend_items = ['FastAPI REST API', 'Authentication', 'Employee Exit Request Management', 'HR Approval', 'Clearance', 'Exit Interview', 'Audit Logging']
draw_box(*backend, 'Backend', backend_items)
database_items = ['MySQL 8', 'Users', 'Employees', 'Departments', 'Exit Requests', 'Approvals', 'Clearances', 'Exit Interviews', 'Audit Logs']
draw_box(*database, 'Database', database_items)
security_items = ['Password Hashing', 'Role-Based Access Control', 'Input Validation', 'HTTPS', 'Audit Logs']
draw_box(*sec, 'Security', security_items)

# Arrows and labels
center_x = width / 2
arrow_x = center_x
labels = [
    ('Employee / HR Admin', users[3] + 14),
    ('React.js Frontend', frontend[3] + 14),
    ('Axios / HTTP', (frontend[3] + backend[1]) / 2),
    ('FastAPI REST API', backend[3] + 14),
    ('SQLAlchemy ORM', (backend[3] + database[1]) / 2),
    ('MySQL Database', database[3] + 14)
]

draw_arrow(arrow_x, users[3] + 4, arrow_x, frontend[1] - 4)
draw_arrow(arrow_x, frontend[3] + 4, arrow_x, backend[1] - 4)
draw_arrow(arrow_x, backend[3] + 4, arrow_x, database[1] - 4)

for text, y in labels:
    tw, th = text_size(text, font)
    d.text((arrow_x + 24, y - th / 2), text, fill='black', font=font)

security_mid_y = (sec[1] + sec[3]) / 2
backend_target_y = backend[1] + 120
draw_arrow(sec[0], security_mid_y, backend[2], backend_target_y)

path = os.path.join('docs', 'diagrams', 'architecture.png')
img.save(path, 'PNG')
print(path)
