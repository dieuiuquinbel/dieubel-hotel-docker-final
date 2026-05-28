// Chức năng: Lắp middleware, route public, route user và route admin.
// Bộ lắp route và middleware cho backend.
// File này gắn middleware, route công khai, route khách hàng và route quản trị.
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ketNoiDb = require("./config/coSoDuLieu");
const { yeuCauDangNhap } = require("./middleware/xacThuc.middleware");
const {
  dangNhapTaiKhoan,
  dangKyTaiKhoan,
  guiLaiOtpEmail,
  xacMinhOtpEmail,
} = require("./modules/auth/xacThuc.service");
const {
  taoDatPhong,
  layHoaDonTheoId,
  layDanhSachHoaDon,
} = require("./modules/bookings/datPhong.service");
const {
  xacNhanThanhToanDemo,
} = require("./modules/payments/thanhToan.service");
const {
  THU_MUC_HOA_DON,
  damBaoHoaDonTrongThuMucAdmin,
} = require("./modules/invoices/hoaDon.service");
const {
  TRANG_THAI_DAT_PHONG,
  layDatPhongCuaNguoiDung,
  layTatCaDatPhong,
  capNhatTrangThaiDatPhong,
  xacNhanThanhToan,
  luuGhiChuAdmin,
  guiPhanHoiKhachHang,
  taoYeuCauHoanTien,
  layYeuCauHoanTienCuaToi,
  layTatCaYeuCauHoanTien,
  capNhatYeuCauHoanTien,
  guiYeuCauHoTro,
  layYeuCauHoTroCuaToi,
  layTatCaYeuCauHoTro,
  capNhatYeuCauHoTro,
  layBaoCaoDoanhThu,
} = require("./modules/bookings/quanLyDatPhong.service");
const {
  layDanhSachPhong,
  layPhongNoiBat,
  layPhongTheoId,
  taoPhongAdmin,
} = require("./modules/rooms/phong.service");
const {
  taoDanhGiaPhong,
  layDanhGiaCuaPhong,
} = require("./modules/rooms/danhGia.service");
const {
  layDanhSachVoucher,
  layVoucherCuaNguoiDung,
  luuVoucherChoNguoiDung,
} = require("./modules/vouchers/voucher.service");
const {
  layTongQuanQuanTri,
  layDanhSachKhachHang,
  layChiTietKhachHang,
  taoKhachHang,
  capNhatKhachHang,
  capNhatTrangThaiKhachHang,
  xoaKhachHang,
} = require("./modules/admin/quanTri.service");

const ungDung = express();
const CHO_PHEP_THANH_TOAN_DEMO = process.env.ENABLE_DEMO_PAYMENT === "true";
const uploadsRoot = path.join(__dirname, "..", "uploads");
const roomUploadsDir = path.join(uploadsRoot, "rooms");

if (!fs.existsSync(roomUploadsDir)) {
  fs.mkdirSync(roomUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, roomUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeBase =
      path
        .basename(file.originalname || "room")
        .replace(path.extname(file.originalname || ""), "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "room";

    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const uploadRoomImages = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (req, file, cb) => {
    if (!String(file.mimetype || "").startsWith("image/")) {
      cb(new Error("Chi chap nhan file anh."));
      return;
    }

    cb(null, true);
  },
}).fields([
  { name: "cover_image", maxCount: 1 },
  { name: "gallery_images", maxCount: 7 },
]);

ungDung.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

ungDung.use(express.json());
ungDung.use("/uploads", express.static(uploadsRoot));

function yeuCauQuanTri(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Ban khong co quyen han nay.",
    });
  }

  return next();
}

ungDung.get("/api/health", async (req, res) => {
  try {
    const [rows] = await ketNoiDb.query("SELECT 1 AS ok");
    res.json({
      message: "Backend is running",
      database: "connected",
      result: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Backend is running, but database connection failed",
      error: error.message,
    });
  }
});

ungDung.post("/api/auth/register", async (req, res) => {
  try {
    const session = await dangKyTaiKhoan(req.body);
    res.status(201).json({
      message: "Tao tai khoan thanh cong. Vui long xac minh email bang ma OTP.",
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tao tai khoan",
    });
  }
});

ungDung.post("/api/auth/verify-email", async (req, res) => {
  try {
    const session = await xacMinhOtpEmail(req.body);
    res.json({
      message: "Xac minh email thanh cong",
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the xac minh email",
    });
  }
});

ungDung.post("/api/auth/resend-otp", async (req, res) => {
  try {
    const result = await guiLaiOtpEmail(req.body);
    res.json({
      message: "Da gui lai ma OTP",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the gui lai OTP",
    });
  }
});

ungDung.post("/api/auth/login", async (req, res) => {
  try {
    const session = await dangNhapTaiKhoan(req.body);
    res.json({
      message: "Dang nhap thanh cong",
      data: session,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the dang nhap",
    });
  }
});

ungDung.get("/api/auth/me", yeuCauDangNhap, async (req, res) => {
  res.json({
    data: req.user,
  });
});

ungDung.get("/api/rooms", async (req, res) => {
  try {
    const payload = await layDanhSachPhong(req.query);
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
});

ungDung.get("/api/rooms/featured", async (req, res) => {
  try {
    const data = await layPhongNoiBat(req.query.limit);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch featured rooms",
      error: error.message,
    });
  }
});

ungDung.get("/api/rooms/:id", async (req, res) => {
  try {
    const room = await layPhongTheoId(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    return res.json({ data: room });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch room detail",
      error: error.message,
    });
  }
});

ungDung.get("/api/rooms/:id/reviews", async (req, res) => {
  try {
    const roomId = req.params.id;
    const data = await layDanhGiaCuaPhong(roomId);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch room reviews",
      error: error.message,
    });
  }
});

ungDung.get("/api/vouchers", async (req, res) => {
  try {
    const data = await layDanhSachVoucher(req.user?.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai danh sach voucher",
    });
  }
});

ungDung.get("/api/me/vouchers", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layVoucherCuaNguoiDung(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai kho voucher",
    });
  }
});

ungDung.post("/api/me/vouchers", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await luuVoucherChoNguoiDung(req.user.id, req.body.code);
    res.status(201).json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the luu voucher",
    });
  }
});

ungDung.post("/api/bookings", yeuCauDangNhap, async (req, res) => {
  try {
    const result = await taoDatPhong({
      user: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: "Dat phong thanh cong",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the dat phong",
    });
  }
});

ungDung.post("/api/bookings/public-checkin", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Thieu ma token check-in." });
  }

  const connection = await ketNoiDb.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT b.*, r.room_name, r.hotel_name, u.full_name, u.email
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       JOIN users u ON u.id = b.user_id
       WHERE b.checkin_qr_token = ? LIMIT 1`,
      [token]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Ma QR check-in khong hop le hoac khong ton tai." });
    }

    const booking = rows[0];

    if (booking.booking_status === "checked_in") {
      await connection.commit();
      return res.json({
        message: "Quy khach da nhan phong tu truoc.",
        data: {
          bookingCode: booking.booking_code,
          guestName: booking.full_name,
          guestEmail: booking.email,
          roomName: booking.room_name,
          hotelName: booking.hotel_name,
          checkIn: booking.check_in_date,
          checkOut: booking.check_out_date,
          bookingStatus: "checked_in",
        }
      });
    }

    if (booking.booking_status !== "confirmed") {
      await connection.rollback();
      return res.status(400).json({
        message: `Don hang o trang thai '${booking.booking_status}', khong the check-in.`
      });
    }

    await connection.query(
      `UPDATE bookings
       SET booking_status = 'checked_in',
           checked_in_at = NOW()
       WHERE id = ?`,
      [booking.id]
    );

    await connection.query(
      `INSERT INTO booking_status_logs (booking_id, old_status, new_status, note, changed_by)
       VALUES (?, 'confirmed', 'checked_in', 'Check-in tu dong bang cach quet ma QR Mạng LAN', ?)`,
      [booking.id, booking.user_id]
    );

    await connection.commit();

    return res.json({
      message: "Check-in thanh cong!",
      data: {
        bookingCode: booking.booking_code,
        guestName: booking.full_name,
        guestEmail: booking.email,
        roomName: booking.room_name,
        hotelName: booking.hotel_name,
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        bookingStatus: "checked_in",
      }
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      message: "Loi he thong khi check-in.",
      error: error.message
    });
  } finally {
    connection.release();
  }
});

ungDung.get("/api/bookings/my", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layDatPhongCuaNguoiDung(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai danh sach dat phong",
    });
  }
});

ungDung.post(
  "/api/bookings/:id/feedbacks",
  yeuCauDangNhap,
  async (req, res) => {
    try {
      const data = await guiPhanHoiKhachHang({
        user: req.user,
        bookingCode: req.params.id,
        payload: req.body,
      });

      res.status(201).json({
        message: "Da gui phan hoi",
        data,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the gui phan hoi",
      });
    }
  },
);

ungDung.post(
  "/api/bookings/:id/reviews",
  yeuCauDangNhap,
  async (req, res) => {
    try {
      const { rating, content } = req.body;
      const data = await taoDanhGiaPhong({
        user: req.user,
        bookingCode: req.params.id,
        rating,
        content,
      });

      res.status(201).json({
        message: "Đánh giá phòng thành công",
        data,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Không thể gửi đánh giá phòng.",
      });
    }
  },
);

ungDung.get("/api/me/refund-requests", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layYeuCauHoanTienCuaToi(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai danh sach yeu cau hoan tien",
    });
  }
});

ungDung.post(
  "/api/bookings/:id/refund-requests",
  yeuCauDangNhap,
  async (req, res) => {
    try {
      const data = await taoYeuCauHoanTien({
        user: req.user,
        bookingCode: req.params.id,
        payload: req.body,
      });

      res.status(201).json({
        message: "Da tao yeu cau huy/hoan tien",
        data,
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tao yeu cau hoan tien",
      });
    }
  },
);

ungDung.get("/api/me/support-tickets", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await layYeuCauHoTroCuaToi(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the tai yeu cau ho tro",
    });
  }
});

ungDung.post("/api/me/support-tickets", yeuCauDangNhap, async (req, res) => {
  try {
    const data = await guiYeuCauHoTro({
      user: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: "Da gui yeu cau ho tro",
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the gui yeu cau ho tro",
    });
  }
});

ungDung.patch("/api/bookings/:id/status", yeuCauDangNhap, async (req, res) => {
  try {
    const trangThaiKhachDuocTuCapNhat = [
      TRANG_THAI_DAT_PHONG.CANCELLED,
      TRANG_THAI_DAT_PHONG.CHECKED_OUT,
    ];
    if (!trangThaiKhachDuocTuCapNhat.includes(req.body.status)) {
      return res.status(403).json({
        message: "Ban khong co quyen cap nhat trang thai nay.",
      });
    }

    const data = await capNhatTrangThaiDatPhong({
      bookingCode: req.params.id,
      status: req.body.status,
      note: req.body.note,
      userId: req.user.id,
    });

    res.json({ data });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the cap nhat trang thai",
    });
  }
});

ungDung.post(
  "/api/bookings/:id/payments/confirm",
  yeuCauDangNhap,
  async (req, res) => {
    try {
      const data = await xacNhanThanhToan({
        bookingCode: req.params.id,
        method: req.body.method,
        paymentCode: req.body.paymentCode,
        voucherCode: req.body.voucherCode,
        userId: req.user.id,
      });

      res.status(201).json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the xac nhan thanh toan",
      });
    }
  },
);

ungDung.post("/api/payments/demo-confirm", yeuCauDangNhap, async (req, res) => {
  if (!CHO_PHEP_THANH_TOAN_DEMO) {
    return res.status(404).json({
      message: "Tinh nang nay da bi tat.",
    });
  }

  try {
    const result = await xacNhanThanhToanDemo({
      user: req.user,
      payload: req.body,
    });

    res.status(201).json({
      message: "Da ghi nhan thanh toan demo",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Khong the ghi nhan thanh toan demo",
    });
  }
});

ungDung.get(
  "/api/admin/invoices",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const invoices = await layDanhSachHoaDon();
      res.json({
        data: {
          invoices,
          directory: THU_MUC_HOA_DON,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Khong the tai danh sach hoa don",
        error: error.message,
      });
    }
  },
);

ungDung.get(
  "/api/admin/overview",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await layTongQuanQuanTri();
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tai tong quan quan tri",
      });
    }
  },
);

ungDung.get(
  "/api/admin/customers",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await layDanhSachKhachHang(req.query);
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tai danh sach khach hang",
      });
    }
  },
);

ungDung.post(
  "/api/admin/customers",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await taoKhachHang({
        payload: req.body,
        adminId: req.user.id,
      });
      res.status(201).json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tao khach hang",
      });
    }
  },
);

ungDung.get(
  "/api/admin/customers/:id",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await layChiTietKhachHang(req.params.id);
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tai thong tin khach hang",
      });
    }
  },
);

ungDung.patch(
  "/api/admin/customers/:id",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await capNhatKhachHang({
        userId: req.params.id,
        payload: req.body,
        adminId: req.user.id,
      });
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the cap nhat khach hang",
      });
    }
  },
);

ungDung.patch(
  "/api/admin/customers/:id/status",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await capNhatTrangThaiKhachHang({
        userId: req.params.id,
        status: req.body.status,
        adminId: req.user.id,
      });
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the cap nhat trang thai khach hang",
      });
    }
  },
);

ungDung.delete(
  "/api/admin/customers/:id",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await xoaKhachHang({
        userId: req.params.id,
        adminId: req.user.id,
      });
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the xoa khach hang",
      });
    }
  },
);

ungDung.get(
  "/api/admin/bookings",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await layTatCaDatPhong();
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tai danh sach dat phong",
      });
    }
  },
);

ungDung.post(
  "/api/admin/rooms",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    uploadRoomImages(req, res, async (uploadError) => {
      if (uploadError) {
        return res.status(400).json({
          message: uploadError.message || "Khong tai len duoc anh phong",
        });
      }

      try {
        const coverImage = req.files?.cover_image?.[0];
        const galleryImages = req.files?.gallery_images || [];
        const data = await taoPhongAdmin({
          ...req.body,
          image_url: coverImage
            ? `/uploads/rooms/${coverImage.filename}`
            : req.body.image_url,
          gallery: galleryImages.length
            ? galleryImages.map((file) => `/uploads/rooms/${file.filename}`)
            : req.body.gallery,
        });
        res.status(201).json({ data });
      } catch (error) {
        res.status(error.status || 500).json({
          message: error.message || "Khong the tao phong",
        });
      }
    });
  },
);

ungDung.get(
  "/api/admin/refund-requests",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await layTatCaYeuCauHoanTien();
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tai yeu cau hoan tien",
      });
    }
  },
);

ungDung.patch(
  "/api/admin/refund-requests/:id",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await capNhatYeuCauHoanTien({
        refundId: req.params.id,
        status: req.body.status,
        note: req.body.note,
        adminId: req.user.id,
      });

      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the cap nhat yeu cau hoan tien",
      });
    }
  },
);

ungDung.get(
  "/api/admin/support-tickets",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await layTatCaYeuCauHoTro();
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tai yeu cau ho tro",
      });
    }
  },
);

ungDung.patch(
  "/api/admin/support-tickets/:id",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await capNhatYeuCauHoTro({
        ticketId: req.params.id,
        status: req.body.status,
        reply: req.body.reply,
        adminId: req.user.id,
      });

      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the cap nhat yeu cau ho tro",
      });
    }
  },
);

ungDung.get(
  "/api/admin/revenue-report",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await layBaoCaoDoanhThu({
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to,
      });
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the tai bao cao doanh thu",
      });
    }
  },
);

ungDung.patch(
  "/api/admin/bookings/:id/status",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await capNhatTrangThaiDatPhong({
        bookingCode: req.params.id,
        status: req.body.status,
        note: req.body.note,
        adminId: req.user.id,
      });
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the cap nhat trang thai",
      });
    }
  },
);

ungDung.post(
  "/api/admin/bookings/:id/payments/confirm",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await xacNhanThanhToan({
        bookingCode: req.params.id,
        method: req.body.method,
        paymentCode: req.body.paymentCode,
        voucherCode: req.body.voucherCode,
        adminId: req.user.id,
      });
      res.status(201).json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the xac nhan thanh toan",
      });
    }
  },
);

ungDung.patch(
  "/api/admin/bookings/:id/note",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const data = await luuGhiChuAdmin({
        bookingCode: req.params.id,
        note: req.body.note,
        adminId: req.user.id,
      });
      res.json({ data });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || "Khong the luu ghi chu",
      });
    }
  },
);

ungDung.get(
  "/api/admin/invoices/:id/download",
  yeuCauDangNhap,
  yeuCauQuanTri,
  async (req, res) => {
    try {
      const invoice = await layHoaDonTheoId(req.params.id);

      if (!invoice) {
        return res.status(404).json({
          message: "Khong tim thay hoa don",
        });
      }

      const duongDanDaLuu = await damBaoHoaDonTrongThuMucAdmin(invoice);
      res.setHeader("X-Invoice-Admin-Path", duongDanDaLuu);
      return res.download(duongDanDaLuu, `${invoice.invoice_code}.html`);
    } catch (error) {
      return res.status(500).json({
        message: "Khong the tai hoa don",
        error: error.message,
      });
    }
  },
);

module.exports = ungDung;
