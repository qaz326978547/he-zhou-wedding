# Quickstart: 婚宴座位安排

```bash
# backend
cd backend
npm install
npx prisma migrate dev        # 套用 add_seating migration
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

1. 開啟 `http://localhost:5173/admin/login` 登入
2. 進入 `http://localhost:5173/admin/seating`
3. 點選任一桌 → 於右側（手機為下方）面板新增賓客、調整人數或換桌
