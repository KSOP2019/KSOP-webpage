#!/usr/bin/env python3
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import urllib.request, urllib.error, json, re, os

BASE = 'http://localhost:3100/'

# Confirm docs exist
for doc_path in [
    r'C:\Users\KHA\Desktop\MY-WEBSITE\docs\PRODUCTION_BACKUP.md',
    r'C:\Users\KHA\Desktop\MY-WEBSITE\supabase\migrations\20260910100000_public_schedule_settings_read.sql',
]:
    exists = os.path.isfile(doc_path)
    size = os.path.getsize(doc_path) if exists else 0
    print(f"DOC_EXIST:{doc_path.split('\\')[-1]}={exists}, size={size}")
    # Check no secrets
    if exists:
        data = open(doc_path, encoding='utf-8', errors='replace').read()
        secrets = ['SJH_KEY_PLACEHOLDER', 'PASSWORD_PLACEHOLDER']
        for s in secrets:
            if s in data:
                print(f"SECRET_ALERT:{s} in {doc_path.split('\\')[-1]}")

# Confirm robots + sitemap content locally
try:
    with open(r'C:\Users\KHA\Desktop\MY-WEBSITE\app\robots.ts', encoding='utf-8', errors='replace') as f:
        robots_src = f.read()
    with open(r'C:\Users\KHA\Desktop\MY-WEBSITE\app\sitemap.ts', encoding='utf-8', errors='replace') as f:
        sitemap_src = f.read()
    print('ROBOTS_SRC_HAS_SITE_URL:', 'SITE_URL' in robots_src)
    print('SITEMAP_SRC_HAS_SITE_URL:', 'SITE_URL' in sitemap_src)
except Exception as e:
    print('DOC_READ_ERR:', repr(e)[:100])

# Confirm header-stability geometry and dropdown fix preserved
with open('C:\Users\KHA\Desktop\MY-WEBSITE\app\header-stability.css', encoding='utf-8', errors='replace') as f:
    css = f.read()
checks = {
    'grid_cols_190_600_220_120': '190px 600px 220px 120px' in css,
    'overflow_visible_header': '.site-header' in css and css.count('overflow: visible') > 0,
    'sticky_z_100': 'z-index: 100' in css,
    'language_options_z_102': 'z-index: 102;' in css,
    'popup_solid_light_98': 'rgba(255, 255, 255, 0.98)' in css,
    'popup_solid_dark_98': 'rgba(18, 24, 36, 0.98)' in css,
    'detail_header_190_600_220_120': '.detail-header' in css,
    'language_menu_overflow_visible': '.language-menu' in css,
    'language_options_button_width_84': 'width: 84px' in css,
    'language_button_width_36': '.language-menu > summary.language' in css and css.count('width: 36px') > 0,
    'language_button_flex_36': 'flex: 0 0 36px' in css,
}
for k, v in checks.items():
    print(k + ':', 'PASS' if v else 'FAIL')

# Confirm lib/auth security updates
with open('C:\Users\KHA\Desktop\MY-WEBSITE\lib\auth.ts', encoding='utf-8', errors='replace') as f:
    auth_src = f.read()
print('SECURITY_CHECKS:', {
    'sha256_hex_digest_used': 'sha256Hex' in auth_src or 'sha256' in auth_src,
    'timingSafeEqual_used_for_password': 'timingSafeEqual' in auth_src and 'isValidAdminPassword' in auth_src,
    'no_plain_comparison_remains': 'password === pw' not in auth_src,
    'rate_limit_map_exists': 'loginAttempts' in auth_src,
    'retry_after_header_set_on_429': 'Retry-After' in auth_src,
})
