#!/bin/bash
# Bu skript src/app/(public) qovluğundakı bütün kodları public_code.txt faylına yazır.

find src/app/\(public\) -type f ! -name ".*" -exec sh -c 'echo "=== FILE: {} ==="; cat "{}"; echo ""; echo ""' \; > public_code.txt
echo "Uğurla tamamlandı! Bütün kodlar 'public_code.txt' faylına yazıldı."
