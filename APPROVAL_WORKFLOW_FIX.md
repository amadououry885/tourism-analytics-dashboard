# Approval Workflow Correction - Complete ✅

## Date
November 11, 2025

## Changes Applied

### 1. Registration Policy ✅
- **Vendor and Stay Owner**: Require admin approval before accessing protected endpoints
- **Admin**: Auto-approved (handled in User model's save() method)
- **Tourists**: Anonymous/unauthenticated public users - no accounts needed, read-only access

### 2. User Model (No Changes)
- Roles: `admin`, `vendor`, `stay_owner`
- Field: `is_approved` (boolean)
- Only vendor and stay_owner require approval

### 3. Admin Approval Endpoints ✅

#### Updated: `approve_user()`
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_user(request, user_id):
    """Only vendor and stay_owner can be approved"""
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can approve users'}, 
                       status=403)
    
    user = get_object_or_404(User, id=user_id)
    
    # Restrict to vendor and stay_owner only
    if user.role not in ('vendor', 'stay_owner'):
        return Response(
            {'detail': f'Only vendor or stay_owner accounts can be approved. User has role: {user.role}'},
            status=400
        )
    
    user.is_approved = True
    user.is_active = True
    user.save(update_fields=['is_approved', 'is_active'])
    return Response({'message': f'User {user.username} approved successfully'})
```

#### Updated: `reject_user()`
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_user(request, user_id):
    """Only vendor and stay_owner can be rejected"""
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can reject users'}, 
                       status=403)
    
    user = get_object_or_404(User, id=user_id)
    
    # Restrict to vendor and stay_owner only
    if user.role not in ('vendor', 'stay_owner'):
        return Response(
            {'detail': f'Only vendor or stay_owner accounts can be rejected. User has role: {user.role}'},
            status=400
        )
    
    user.is_active = False
    user.is_approved = False
    user.save(update_fields=['is_active', 'is_approved'])
    return Response({'message': f'User {user.username} rejected/deactivated successfully'})
```

### 4. Pending Users Filtering ✅

#### Updated: `pending_users()`
```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_users(request):
    """
    Only returns vendor and stay_owner roles pending approval.
    Tourists are anonymous and never appear here.
    """
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can view pending users'}, 
                       status=403)
    
    # Filter to only vendor and stay_owner with is_approved=False
    users = User.objects.filter(
        role__in=['vendor', 'stay_owner'],
        is_approved=False
    ).order_by('-date_joined')
    
    return Response(UserSerializer(users, many=True).data)
```

### 5. Registration Message Update ✅

```python
def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    # Role-specific messages
    if user.role in ('vendor', 'stay_owner'):
        message = 'Registration successful. Please wait for admin approval.'
    elif user.role == 'admin':
        message = 'Registration successful. Admin account activated.'
    else:
        message = 'Registration successful.'
    
    return Response({'message': message, 'user': UserSerializer(user).data})
```

---

## Testing Results ✅

### Test 1: Admin Cannot Approve Admin
```bash
curl -X POST http://localhost:8001/api/auth/admin/users/1/approve/ \
  -H "Authorization: Bearer <admin_token>"
```
✅ **Result**: `400 Bad Request`
```json
{
  "detail": "Only vendor or stay_owner accounts can be approved. User has role: admin"
}
```

### Test 2: Pending Users Only Shows Vendor/Stay_Owner
```bash
curl http://localhost:8001/api/auth/admin/users/pending/ \
  -H "Authorization: Bearer <admin_token>"
```
✅ **Result**: Only users with `role in ['vendor', 'stay_owner']` and `is_approved=False`
```json
[
  {
    "id": 3,
    "username": "stayowner1",
    "role": "stay_owner",
    "is_approved": false
  }
]
```

### Test 3: Register Stay_Owner
```bash
curl -X POST http://localhost:8001/api/auth/register/ \
  -d '{"username":"stayowner1","role":"stay_owner",...}'
```
✅ **Result**: 
```json
{
  "message": "Registration successful. Please wait for admin approval.",
  "user": {
    "role": "stay_owner",
    "is_approved": false
  }
}
```

### Test 4: Approve Stay_Owner
```bash
curl -X POST http://localhost:8001/api/auth/admin/users/3/approve/ \
  -H "Authorization: Bearer <admin_token>"
```
✅ **Result**: User approved, `is_approved=true`, `is_active=true`

### Test 5: Stay_Owner Creates Stay
```bash
curl -X POST http://localhost:8001/api/stays/ \
  -H "Authorization: Bearer <stayowner_token>" \
  -d '{"name":"Beachfront Villa",...}'
```
✅ **Result**: Stay created with `owner=3, owner_username="stayowner1"`

### Test 6: Reject Vendor
```bash
curl -X POST http://localhost:8001/api/auth/admin/users/4/reject/ \
  -H "Authorization: Bearer <admin_token>"
```
✅ **Result**: `is_active=false`, `is_approved=false`

### Test 7: Rejected Vendor Cannot Login
```bash
curl -X POST http://localhost:8001/api/auth/login/ \
  -d '{"username":"vendor2","password":"vendor2pass"}'
```
✅ **Result**: `401 Unauthorized` - "No active account found with the given credentials"

---

## Permission Matrix (Unchanged)

| User Role | Approval Required | Places | Events | Routes | Vendors | Stays |
|-----------|------------------|--------|--------|--------|---------|-------|
| **Admin** | No (auto-approved) | Full CRUD | Full CRUD | Full CRUD | Read all | Read all |
| **Vendor (approved)** | Yes | Read | Read | Read | CRUD own | Read active |
| **Stay_Owner (approved)** | Yes | Read | Read | Read | Read active | CRUD own |
| **Vendor (unapproved)** | Pending | Read | Read | Read | No access | Read active |
| **Stay_Owner (unapproved)** | Pending | Read | Read | Read | Read active | No access |
| **Tourist (anonymous)** | N/A | Read | Read | Read | Read active | Read active |

---

## Approval Workflow Summary

```
┌─────────────────────────────────────────────────────────┐
│                  User Registration                       │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                    ↓
    Role: vendor                      Role: stay_owner
    is_approved = False               is_approved = False
        ↓                                    ↓
        └─────────────────┬─────────────────┘
                          ↓
        ┌─────────────────────────────────────┐
        │   Appears in Admin Pending Queue    │
        └─────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                    ↓
    Admin Approves                     Admin Rejects
    is_approved = True                 is_active = False
    is_active = True                   is_approved = False
        ↓                                    ↓
    Can create/manage                  Cannot login
    own resources                      Account disabled
```

**Admin Users**: Auto-approved on creation (model save() method)  
**Tourists**: No accounts - anonymous read-only access

---

## Files Modified

1. **backend/users/views.py**
   - `pending_users()` - Filter to vendor/stay_owner only
   - `approve_user()` - Reject non-vendor/stay_owner with 400
   - `reject_user()` - Reject non-vendor/stay_owner with 400
   - `UserRegistrationView.create()` - Role-specific messages

---

## Frontend Integration Notes

### Admin Dashboard - User Approval Page
- **GET** `/api/auth/admin/users/pending/` returns only vendor and stay_owner
- **Never** show admin users in approval queue
- **Never** show tourists (they don't have accounts)
- Display only "Vendor" and "Stay Owner" roles

### Example Frontend Filter
```typescript
// No filtering needed - backend already filters
const pendingUsers = await fetch('/api/auth/admin/users/pending/')
// Response only contains vendor and stay_owner with is_approved=false
```

---

## Error Responses

### Attempting to Approve Admin
```json
{
  "detail": "Only vendor or stay_owner accounts can be approved. User has role: admin"
}
```
**Status**: `400 Bad Request`

### Attempting to Reject Admin
```json
{
  "detail": "Only vendor or stay_owner accounts can be rejected. User has role: admin"
}
```
**Status**: `400 Bad Request`

---

## Summary

✅ Only vendor and stay_owner require approval  
✅ Admin accounts are auto-approved  
✅ Tourists are anonymous (no accounts)  
✅ Approval/rejection restricted to vendor/stay_owner roles  
✅ Pending queue filters to vendor/stay_owner only  
✅ All existing RBAC rules maintained  
✅ All tests passing  

**Status**: Complete and tested  
**Date**: November 11, 2025
