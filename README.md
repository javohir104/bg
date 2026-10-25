# Telefon Market

Node.js, Express va MongoDB asosidagi telefon marketplace’i. Moslashuvchan sahifa, telefon qidiruvi, narx filtri, brend tanlovi, saralash, savat, sevimlilar, login va e’lon qo‘shish funksiyalari bor.

## Ishga tushirish
1. Node.js 18 yoki undan yangisini o‘rnating.
2. `.env.example` faylidan `.env` nusxa yarating va `MONGODB_URI` hamda `ACCESS_TOKEN_SECRET` qiymatlarini kiriting.
3. `npm install` bajaring.
4. `npm run check` bilan JavaScript sintaksisini tekshiring.
5. `npm start` bajaring.
6. Sayt: `http://localhost:3000`; API holati: `http://localhost:3000/api/health`.

## Mahsulotlar
- API: `GET /products?q=iphone&minPrice=1000000&maxPrice=15000000&sort=price_asc`.
- Qidiruv telefon nomi, brendi va izohidan izlaydi. Narx saralash: `price_asc`, `price_desc`, `newest`.
- E’lon yaratishda `name`, `brand`, `image`, `price`, `description` maydonlari ishlatiladi. `image` — ixtiyoriy HTTPS yoki HTTP rasm URL.
- Database bo‘sh yoki serverga ulanish bo‘lmasa, UI namuna telefonlar ko‘rsatadi. Ular API/database’ga yozilmaydi.

## Xavfsizlik
`.env` faylini GitHub, ZIP arxiv yoki chat orqali ulashmang. `.env.example`-da faqat placeholder qiymatlar bor.

## Postman
`postman/Avtobozor.postman_collection.json` kolleksiyasini import qilib, `baseUrl` qiymatini `http://localhost:3000` qiling.


### Sample phone catalog

Run npm run seed:products once to add eight sample phone listings and photos to MongoDB Atlas. It is safe to rerun.
