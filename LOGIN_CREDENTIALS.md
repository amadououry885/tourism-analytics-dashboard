# 🔐 Login Credentials - Tourism Analytics Dashboard

**Last Updated:** December 30, 2025  
**Status:** ✅ All accounts tested and working

---

## 📋 How to Login

**Login URL:** `http://localhost:3000/business/signin` or `http://localhost:3000/admin/signin`

**Login Method:** Use **USERNAME** (not email) and password

---

## 👨‍💼 ADMIN ACCOUNT

| Username | Password | Email | Owns |
|----------|----------|-------|------|
| `admin` | `admin123` | admin@example.com | 97 restaurants, 62 accommodations |

**Access:** Full admin portal, can manage all content and approve users

---

## 🍽️ VENDOR ACCOUNTS (Restaurant Owners)

| Username | Password | Email | Owns |
|----------|----------|-------|------|
| `OuryRestau` | `vendor123` | amadouodiallo77@gmail.com | **1 restaurant** (OuryRestau) |
| `vendor1` | `vendor123` | vendor1@example.com | 0 restaurants |
| `vendor2` | `vendor123` | vendor2@example.com | 0 restaurants |

**Access:** Vendor portal to manage their restaurants, toggle open/close status

---

## 🏨 STAY OWNER ACCOUNTS (Accommodation Owners)

| Username | Password | Email | Owns |
|----------|----------|-------|------|
| `stayowner1` | `stay123` | stay@example.com | 0 accommodations |
| `stayowner2` | `stay123` | stay2@test.com | 0 accommodations |
| `NaimFOOD` | `stay123` | hasib.naeim08@gmail.com | 0 accommodations |

**Access:** Stay owner portal to manage their accommodations, toggle open/close status

---

## ✅ Verification Status

All accounts have been tested with successful login:
- ✅ Admin login works
- ✅ Vendor logins work
- ✅ Stay owner logins work
- ✅ All passwords verified
- ✅ All accounts approved and active

---

## 🎯 Account with Real Business

**For testing open/close functionality:**

**Username:** `OuryRestau`  
**Password:** `vendor123`  
**Owns:** 1 restaurant called "OuryRestau" in Langkawi

This account can:
1. Login to vendor portal
2. See "OuryRestau" restaurant listed
3. Toggle open/close status
4. Changes will appear in public Food tab with OPEN/CLOSED badge

---

## 🔧 API Login Example

```bash
# Login request
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Returns JWT tokens:
# {
#   "access": "eyJ...",
#   "refresh": "eyJ..."
# }
```

---

## 📝 Notes

- Login uses **username**, not email
- All accounts are approved and active
- JWT tokens expire after 5 hours (access) / 1 day (refresh)
- Admin accounts auto-approve on registration
- Vendor/stay owner accounts require admin approval (but these are pre-approved)
