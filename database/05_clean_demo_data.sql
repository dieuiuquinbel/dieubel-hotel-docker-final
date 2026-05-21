-- Reset lịch sử giao dịch demo và làm mới dữ liệu phòng.
-- Chạy file này sau các file schema/seed ban đầu.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE booking_services;
TRUNCATE TABLE invoices;
TRUNCATE TABLE bookings;
SET FOREIGN_KEY_CHECKS = 1;

UPDATE rooms
SET description = CASE slug
  WHEN 'ha-thanh-lake-view-deluxe-lake-view' THEN 'Phòng deluxe hướng hồ, phù hợp cho cặp đôi hoặc khách công tác cần không gian yên tĩnh.'
  WHEN 'moonlight-tay-ho-superior-city-view' THEN 'Phòng superior có cửa sổ lớn, gần khu Hồ Tây và thuận tiện di chuyển vào trung tâm.'
  WHEN 'old-quarter-boutique-standard-cozy-room' THEN 'Phòng nhỏ gọn ngay khu phố cổ, phù hợp cho chuyến đi ngắn ngày hoặc khách thích khám phá ẩm thực.'
  WHEN 'da-nang-beach-resort-ocean-suite' THEN 'Suite rộng với tầm nhìn biển, ban công thoáng và tiện nghi phù hợp cho kỳ nghỉ cao cấp.'
  WHEN 'da-nang-riverside-hotel-family-balcony-room' THEN 'Phòng gia đình có ban công, gần sông Hàn và các điểm vui chơi buổi tối.'
  WHEN 'saigon-riverside-hotel-family-river-suite' THEN 'Suite gia đình rộng, có khu tiếp khách riêng và bữa sáng tiện lợi cho cả nhóm.'
  WHEN 'saigon-central-loft-business-deluxe' THEN 'Phòng deluxe dành cho chuyến công tác, nằm ngay trung tâm và dễ kết nối các quận chính.'
  WHEN 'hoi-an-lantern-stay-garden-superior' THEN 'Phòng view vườn, không gian nhẹ nhàng và phù hợp kỳ nghỉ thư giãn tại Hội An.'
  WHEN 'phu-quoc-pearl-resort-island-pool-villa' THEN 'Villa riêng có hồ bơi, phù hợp cho gia đình hoặc cặp đôi muốn nghỉ dưỡng riêng tư.'
  WHEN 'sunset-phu-quoc-hideaway-family-garden-bungalow' THEN 'Bungalow sân vườn rộng rãi, yên tĩnh và gần bãi biển.'
  WHEN 'nha-trang-ocean-pearl-superior-sea-view' THEN 'Phòng view biển, gần quảng trường và các nhà hàng ven biển Nha Trang.'
  WHEN 'nha-trang-marina-hotel-deluxe-balcony-room' THEN 'Phòng deluxe có ban công, phù hợp cho chuyến đi ngắn ngày hoặc kỳ nghỉ cuối tuần.'
  WHEN 'da-lat-pine-valley-lodge-attic-standard-room' THEN 'Phòng áp mái ấm cúng, gần rừng thông và các quán cà phê yên tĩnh.'
  WHEN 'da-lat-misty-villa-family-pine-suite' THEN 'Suite gia đình nhìn đồi thông, có khu tiếp khách riêng và không gian nghỉ ngơi thoải mái.'
  WHEN 'sa-pa-cloud-nine-lodge-mountain-deluxe' THEN 'Phòng deluxe ngắm núi, phù hợp kỳ nghỉ yên tĩnh và săn mây.'
  WHEN 'sa-pa-terrace-retreat-suite-valley-view' THEN 'Suite nhìn thung lũng, có ban công và bữa sáng địa phương.'
  WHEN 'dieubel-grand-hoan-kiem-executive-deluxe' THEN 'Phòng deluxe gần hồ Hoàn Kiếm, phù hợp cho khách công tác hoặc kỳ nghỉ ngắn ngày.'
  WHEN 'westlake-maison-dieubel-family-lake-suite' THEN 'Suite gia đình rộng, nhìn Hồ Tây, có khu tiếp khách và ban công thoáng.'
  WHEN 'capital-nest-hotel-standard-urban-room' THEN 'Phòng tiêu chuẩn gọn gàng, vị trí thuận tiện để di chuyển trong trung tâm Hà Nội.'
  WHEN 'my-khe-azure-resort-premier-ocean-deluxe' THEN 'Phòng deluxe view biển Mỹ Khê, có cửa kính lớn và phong cách nghỉ dưỡng hiện đại.'
  WHEN 'han-river-boutique-superior-river-room' THEN 'Phòng superior nhìn sông Hàn, gần cầu Rồng và khu ẩm thực đêm.'
  WHEN 'son-tra-family-villa-garden-family-room' THEN 'Phòng gia đình nhìn vườn, yên tĩnh, gần biển và bán đảo Sơn Trà.'
  WHEN 'ben-thanh-city-hotel-business-superior' THEN 'Phòng business gần trung tâm, phù hợp cho công tác và mua sắm cuối tuần.'
  WHEN 'saigon-sky-residence-executive-suite' THEN 'Suite cao tầng nhìn thành phố, có góc làm việc riêng và phòng khách.'
  WHEN 'thao-dien-urban-stay-standard-studio' THEN 'Studio tối giản gần khu Thảo Điền, phù hợp cho chuyến đi tiết kiệm.'
  WHEN 'hoi-an-riverside-maison-lantern-deluxe' THEN 'Phòng deluxe gần sông Hoài, dễ đi bộ đến phố cổ và chợ đêm.'
  WHEN 'tra-que-garden-retreat-family-garden-suite' THEN 'Suite gia đình giữa không gian vườn, phù hợp kỳ nghỉ yên tĩnh.'
  WHEN 'an-bang-beach-house-superior-beach-room' THEN 'Phòng superior gần biển An Bàng, không gian thoáng và nhiều ánh sáng tự nhiên.'
  WHEN 'phu-quoc-coral-bay-deluxe-sunset-room' THEN 'Phòng deluxe gần biển Ông Lang, có tầm nhìn hoàng hôn và không gian riêng tư.'
  WHEN 'nha-trang-bayfront-dieubel-suite-ocean-panorama' THEN 'Suite rộng nhìn toàn cảnh vịnh Nha Trang, có phòng khách và bữa sáng.'
  WHEN 'da-lat-rosewood-house-superior-garden-room' THEN 'Phòng superior nhìn vườn, nội thất ấm áp và gần trung tâm Đà Lạt.'
  WHEN 'da-lat-cloud-villa-premium-family-villa' THEN 'Villa gia đình có sân vườn, view đồi thông và khu bếp nhỏ tiện lợi.'
  WHEN 'sa-pa-horizon-lodge-standard-valley-room' THEN 'Phòng tiêu chuẩn gọn gàng, có cửa sổ nhìn thung lũng và gần trung tâm.'
  WHEN 'sa-pa-silver-mist-family-mountain-suite' THEN 'Suite gia đình nhìn núi, có ban công rộng và bữa sáng địa phương.'
  ELSE description
END
WHERE slug IN (
  'ha-thanh-lake-view-deluxe-lake-view',
  'moonlight-tay-ho-superior-city-view',
  'old-quarter-boutique-standard-cozy-room',
  'da-nang-beach-resort-ocean-suite',
  'da-nang-riverside-hotel-family-balcony-room',
  'saigon-riverside-hotel-family-river-suite',
  'saigon-central-loft-business-deluxe',
  'hoi-an-lantern-stay-garden-superior',
  'phu-quoc-pearl-resort-island-pool-villa',
  'sunset-phu-quoc-hideaway-family-garden-bungalow',
  'nha-trang-ocean-pearl-superior-sea-view',
  'nha-trang-marina-hotel-deluxe-balcony-room',
  'da-lat-pine-valley-lodge-attic-standard-room',
  'da-lat-misty-villa-family-pine-suite',
  'sa-pa-cloud-nine-lodge-mountain-deluxe',
  'sa-pa-terrace-retreat-suite-valley-view',
  'dieubel-grand-hoan-kiem-executive-deluxe',
  'westlake-maison-dieubel-family-lake-suite',
  'capital-nest-hotel-standard-urban-room',
  'my-khe-azure-resort-premier-ocean-deluxe',
  'han-river-boutique-superior-river-room',
  'son-tra-family-villa-garden-family-room',
  'ben-thanh-city-hotel-business-superior',
  'saigon-sky-residence-executive-suite',
  'thao-dien-urban-stay-standard-studio',
  'hoi-an-riverside-maison-lantern-deluxe',
  'tra-que-garden-retreat-family-garden-suite',
  'an-bang-beach-house-superior-beach-room',
  'phu-quoc-coral-bay-deluxe-sunset-room',
  'nha-trang-bayfront-dieubel-suite-ocean-panorama',
  'da-lat-rosewood-house-superior-garden-room',
  'da-lat-cloud-villa-premium-family-villa',
  'sa-pa-horizon-lodge-standard-valley-room',
  'sa-pa-silver-mist-family-mountain-suite'
);

INSERT INTO rooms (
  hotel_name,
  room_name,
  slug,
  city,
  address,
  room_type,
  description,
  amenities_json,
  image_url,
  gallery_json,
  price_per_night,
  rating_avg,
  total_reviews,
  max_guests,
  inventory_count,
  breakfast_included,
  free_cancellation,
  is_active
) VALUES
('Lotte View Residence', 'Premier City Suite', 'lotte-view-residence-premier-city-suite', 'Ha Noi', '54 Lieu Giai, Ba Dinh, Ha Noi', 'suite', 'Suite hiện đại gần khu ngoại giao, có phòng khách riêng và tầm nhìn thành phố.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'parking'), 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80'), 1520000, 9.1, 204, 3, 5, TRUE, TRUE, TRUE),
('Trang An Eco Lodge', 'Family Garden Bungalow', 'trang-an-eco-lodge-family-garden-bungalow', 'Ninh Binh', 'Trang An, Hoa Lu, Ninh Binh', 'family', 'Bungalow sân vườn gần danh thắng Tràng An, phù hợp gia đình thích không gian thiên nhiên.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'parking', 'balcony'), 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80'), 980000, 8.9, 132, 5, 6, TRUE, TRUE, TRUE),
('Hue Imperial Boutique', 'Superior Heritage Room', 'hue-imperial-boutique-superior-heritage-room', 'Hue', '23 Le Loi, Hue', 'superior', 'Phòng gần sông Hương, nội thất ấm và thuận tiện tham quan Đại Nội.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'balcony'), 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'), 720000, 8.6, 98, 2, 8, TRUE, TRUE, TRUE),
('Quy Nhon Blue Coast', 'Deluxe Sea Breeze', 'quy-nhon-blue-coast-deluxe-sea-breeze', 'Quy Nhon', 'An Duong Vuong, Quy Nhon', 'deluxe', 'Phòng deluxe gần biển Quy Nhơn, có ánh sáng tự nhiên và không gian nghỉ dưỡng thoáng.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool'), 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'), 1180000, 8.8, 141, 3, 7, TRUE, TRUE, TRUE),
('Mui Ne Sand Resort', 'Ocean Family Suite', 'mui-ne-sand-resort-ocean-family-suite', 'Mui Ne', 'Nguyen Dinh Chieu, Mui Ne, Phan Thiet', 'family', 'Suite gia đình gần biển Mũi Né, phù hợp nghỉ dưỡng cuối tuần và nhóm bạn.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool', 'parking'), 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'), 1620000, 9.0, 188, 5, 5, TRUE, TRUE, TRUE),
('Can Tho Riverside Stay', 'Standard River Room', 'can-tho-riverside-stay-standard-river-room', 'Can Tho', 'Hai Ba Trung, Ninh Kieu, Can Tho', 'standard', 'Phòng tiêu chuẩn gần bến Ninh Kiều, phù hợp khách khám phá miền Tây ngắn ngày.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast'), 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'), 560000, 8.2, 77, 2, 10, TRUE, TRUE, TRUE),
('Ha Long Marina Hotel', 'Bay View Deluxe', 'ha-long-marina-hotel-bay-view-deluxe', 'Ha Long', 'Bai Chay, Ha Long, Quang Ninh', 'deluxe', 'Phòng deluxe nhìn vịnh, gần khu Bãi Cháy và các bến du thuyền.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'parking', 'balcony'), 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'), 1340000, 9.1, 215, 3, 6, TRUE, TRUE, TRUE),
('Vung Tau Lighthouse Hotel', 'Superior Coast Room', 'vung-tau-lighthouse-hotel-superior-coast-room', 'Vung Tau', 'Ha Long, Ward 2, Vung Tau', 'superior', 'Phòng superior gần biển, dễ di chuyển đến hải đăng và các quán hải sản.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'parking'), 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80'), 780000, 8.4, 104, 2, 9, TRUE, TRUE, TRUE),
('Tam Dao Cloud Hotel', 'Mountain Standard Room', 'tam-dao-cloud-hotel-mountain-standard-room', 'Tam Dao', 'Tam Dao Town, Vinh Phuc', 'standard', 'Phòng nhìn núi, khí hậu mát và phù hợp cho chuyến nghỉ ngắn gần Hà Nội.', JSON_ARRAY('wifi', 'breakfast', 'balcony'), 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'), 640000, 8.3, 86, 2, 7, TRUE, FALSE, TRUE),
('Con Dao Quiet Bay', 'Private Beach Suite', 'con-dao-quiet-bay-private-beach-suite', 'Con Dao', 'Co Ong, Con Dao', 'suite', 'Suite riêng tư gần biển, phù hợp kỳ nghỉ yên tĩnh và trải nghiệm đảo.', JSON_ARRAY('wifi', 'air_conditioner', 'breakfast', 'pool', 'parking'), 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', JSON_ARRAY('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'), 2380000, 9.4, 176, 3, 4, TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE
  hotel_name = VALUES(hotel_name),
  room_name = VALUES(room_name),
  city = VALUES(city),
  address = VALUES(address),
  room_type = VALUES(room_type),
  description = VALUES(description),
  amenities_json = VALUES(amenities_json),
  image_url = VALUES(image_url),
  gallery_json = VALUES(gallery_json),
  price_per_night = VALUES(price_per_night),
  rating_avg = VALUES(rating_avg),
  total_reviews = VALUES(total_reviews),
  max_guests = VALUES(max_guests),
  inventory_count = VALUES(inventory_count),
  breakfast_included = VALUES(breakfast_included),
  free_cancellation = VALUES(free_cancellation),
  is_active = VALUES(is_active);
