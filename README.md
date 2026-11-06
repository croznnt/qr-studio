# QR Studio

Trang web tạo mã QR tối giản bằng tiếng Việt. Hỗ trợ đường link, văn bản Unicode, email và WiFi. Đổi màu, tải PNG ở kích thước 512, 1024 hoặc 2048 pixel và tải SVG. Nội dung được xử lý trong trình duyệt, không gửi lên máy chủ.

## Phát triển

```sh
npm ci
npm run build
npm start
```

Mở http://localhost:4173. Tệp app.js đã được đóng gói sẵn nên có thể mở index.html trực tiếp. Font Google là tùy chọn và có font hệ thống thay thế.

## GitHub Pages

Trong Settings > Pages, chọn Deploy from a branch, nhánh main, thư mục / (root), rồi Save. GitHub phục vụ index.html cùng các tài nguyên tĩnh. Không cần API key hoặc backend.

QR tĩnh không tự hết hạn. Khả năng truy cập đường link phụ thuộc website đích. Luôn quét thử trước khi in.

## Thư viện

Sử dụng [node-qrcode](https://github.com/soldair/node-qrcode), giấy phép MIT. Giữ THIRD-PARTY-LICENSE.txt khi phân phối.
