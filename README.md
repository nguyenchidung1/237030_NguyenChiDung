237030_NguyenChiDung

## Đề tài
Xây dựng và triển khai hệ thống quản lý món ăn trên nền tảng đám mây.

## Công nghệ
React (Vite), Node.js, Express, MongoDB Atlas, Git/GitHub, Docker, Docker Hub, Render.

## Cấu trúc dự án
- `backend/`: REST API (Express + Mongoose)
- `frontend/`: giao diện React

## Cài đặt và chạy
### Backend
```
cd backend
npm install
cp .env.example .env   # điền thông tin kết nối
npm start
```
### Frontend
```
cd frontend
npm install
npm run dev
```


## Cơ sở dữ liệu
- Dịch vụ: MongoDB Atlas (Free M0)
- Database: `237030_NguyenChiDung`
- Collection: `foods`
- Dữ liệu mẫu: `docs/sample-data.json`
- Cấu hình: sao chép `backend/.env.example` thành `backend/.env` rồi điền chuỗi kết nối.

| Trường | Ý nghĩa |
|---|---|
| foodId | Mã món ăn |
| name | Tên món ăn |
| category | Loại món ăn |
| cuisine | Ẩm thực/vùng miền |
| ingredients | Danh sách nguyên liệu |
| price | Giá bán |
| quantity | Số lượng hiện có |
| description | Mô tả món ăn |
| imageUrl | Đường dẫn hình ảnh |