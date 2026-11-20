# GC01

## My Social Media App — TikTok Theme

> **Tema yang dipilih: TikTok.** Post diperlakukan sebagai "video" pendek: `content` = caption, `tags` = hashtag, `imgUrl` = cover. Feed tampil full-screen & di-swipe vertikal (For You), dengan tombol like / comment di sisi kanan.

My Social Media App adalah sebuah aplikasi client(mobile)-server. Challenge ini juga merupakan salah satu aplikasi mobile pertama dan terakhir kamu, jadi kerjakan dengan baik sebagai bekal portofolio kamu. Pada challenge ini, kamu diminta untuk membuat aplikasi client(mobile)-server dengan detail sebagai berikut:

### Struktur Folder
- [x] server: untuk menyimpan aplikasi server GraphQL kamu 
- [x] app: untuk menyimpan aplikasi mobile React Native kamu


### Fitur
- [x] Fitur Register
- [x] Fitur Login
- [x] FItur Add Post
- [x] Fitur Show Post (berdasarkan yang paling baru)
- [x] Fitur Comment Post (Embedded Document)
- [x] Fitur search user berdasarkan nama atau username
- [x] Fitur follow
- [x] Menampilkan Followers dan Following dari setiap user (Reference with $lookup)
- [x] Fitur Like Post
- [x] Menampilkan total like dari setiap post


---

## Tech Stack
| Layer | Teknologi |
|---|---|
| Server | Node.js (ESM), Apollo Server, GraphQL, MongoDB (native driver), Redis (ioredis), JWT, bcryptjs |
| Client | React Native (Expo), React Navigation, Apollo Client, expo-secure-store |

## Deployment Links (isi setelah deploy — Day 5)
- GraphQL server: `https://api.<domain-kamu>`
- Expo build / publish: `<link expo>`

## Skema Data
- **users**: `_id, name, username (unique), email (unique, format email), password (min 5, di-hash bcrypt)`
- **posts**: `_id, content (required), tags[], imgUrl, authorId, comments[] (embedded: content, username, createdAt, updatedAt), likes[] (embedded: username, createdAt, updatedAt), createdAt, updatedAt`
- **follows**: `_id, followingId (yang di-follow), followerId (yang mem-follow), createdAt, updatedAt` (unique per pasangan)

## GraphQL API
Semua operation selain `register` & `login` butuh header `Authorization: Bearer <accessToken>`.

| Operation | Tipe | Keterangan |
|---|---|---|
| `register(input)` | Mutation | username/email unik, email valid, password min 5 |
| `login(username, password)` | Mutation | mengembalikan `accessToken` + `user` |
| `getPosts` | Query | terbaru dulu, + author (`$lookup`), **di-cache Redis** |
| `getPostById(id)` | Query | + author (`$lookup`), comments & likes (embedded) |
| `addPost(input)` | Mutation | author diambil dari token, **invalidate cache** |
| `commentPost(postId, content)` | Mutation | embedded document |
| `likePost(postId)` | Mutation | embedded document; menekan lagi = unlike. Ada `likesCount` |
| `searchUsers(keyword)` | Query | name/username, partial & case-insensitive |
| `followUser(followingId)` | Mutation | tidak bisa follow diri sendiri / dobel |
| `getUserById(id)` | Query | profil + `followers` & `followings` (`$lookup` ke `follows` lalu `users`) |

Catatan: cache `getPosts` juga di-invalidate saat comment/like supaya angka di feed tidak basi (syarat minimum hanya Add Post).

## Menjalankan Lokal

### Server
```bash
cd server
cp .env.example .env      # sesuaikan MONGO_URI, REDIS_URL, JWT_SECRET
npm install
npm run seed              # (opsional) data demo, password semua user: 12345
npm run dev               # http://localhost:3000
```
Butuh MongoDB (lokal / Atlas) dan Redis. Jika Redis mati, server tetap jalan tanpa cache.

### Mobile app
```bash
cd app
cp .env.example .env      # isi EXPO_PUBLIC_API_URL
npm install
npx expo install --fix    # samakan versi package dengan SDK Expo Go kamu
npx expo start
```
`EXPO_PUBLIC_API_URL`: Android emulator `http://10.0.2.2:3000`, iOS simulator `http://localhost:3000`, HP asli `http://<IP-LAN-komputer>:3000`.

## Panduan Deployment (Day 5)

**1. Server di AWS EC2**
1. Launch EC2 Ubuntu 22.04/24.04, security group buka port 22, 80, 443.
2. Install Node 20+, `git clone` repo, `cd server && npm ci`.
3. Pakai MongoDB Atlas (`MONGO_URI`) dan Redis (Redis Cloud / `apt install redis-server`), isi `server/.env` termasuk `JWT_SECRET` yang acak.
4. Jalankan dengan pm2: `npm i -g pm2 && pm2 start index.js --name tiktok-server && pm2 save && pm2 startup`.

**2. Domain pointing**
Di DNS domain kamu buat **A record** `api.<domain>` → Elastic IP EC2.

**3. SSL (Nginx + Let's Encrypt)**
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
# /etc/nginx/sites-available/tiktok  ->  server_name api.<domain>;  location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
sudo ln -s /etc/nginx/sites-available/tiktok /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.<domain>
```

**4. Publish mobile**
Set `EXPO_PUBLIC_API_URL=https://api.<domain>` lalu `npx eas-cli build -p android --profile preview` (APK) atau `npx eas-cli update`. Taruh link hasilnya di bagian *Deployment Links* di atas.
