# Chay du an bang Docker Desktop

## Yeu cau

- Cai Docker Desktop.
- Mo Docker Desktop truoc khi chay lenh.
- Chay lenh tai thu muc goc du an.

## Chay du an

```powershell
docker compose up --build
```

Chay nen:

```powershell
docker compose up --build -d
```

Dia chi sau khi chay:

```text
Website: http://localhost:5714
Backend health check: http://localhost:5000/api/health
MySQL tren may host: 127.0.0.1:3307
```

Tai khoan admin website:

```text
admin / admin123
```

## Ket noi MySQL Workbench 8.0

Tao connection:

```text
Connection Name: DieuBel Docker MySQL
Hostname: 127.0.0.1
Port: 3307
Username: root
Password: 123456
Default Schema: hotel_booking_db
```

Schema can xem la `hotel_booking_db`.

## Dung va reset database

Dung container:

```powershell
docker compose down
```

Xem log:

```powershell
docker compose logs -f
```

Xoa database cu va import lai tu cac file trong `database/`:

```powershell
docker compose down -v
docker compose up --build
```

Lenh `docker compose down -v` se xoa volume MySQL cua project.
Neu may khac da tung chay project va thay chu tieng Viet bi loi kieu `riÃªng`,
hay chay lai dung 2 lenh tren de xoa volume cu va nap lai database voi charset UTF-8.

## File can gui cho nguoi khac

Gui ca thu muc project, bao gom:

```text
docker-compose.yml
backend/.env
backend/Dockerfile
frontend/Dockerfile
database/
backend/
frontend/
```

`backend/.env` trong ban nay la file demo cong khai. Docker Compose van truyen bien moi truong truc tiep trong `docker-compose.yml`, nen nguoi nhan chi can chay `docker compose up --build`.
