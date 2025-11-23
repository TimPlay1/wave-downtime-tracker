# Security Guidelines

## Environment Variables Setup

### Required Variables

1. **MONGODB_URI** - MongoDB connection string
   - **NEVER** commit this to Git
   - Set on Render.com: Dashboard → Service → Environment → Add Variable
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`

2. **ADMIN_KEY** - Admin API authentication key
   - Generate strong random key (32+ characters)
   - Required for `/admin/*` endpoints
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Setting up on Render.com

1. Go to your service on https://dashboard.render.com/
2. Click **Environment** tab
3. Add variables:
   ```
   MONGODB_URI = <your-mongodb-connection-string>
   ADMIN_KEY = <your-generated-admin-key>
   ```
4. Click **Save Changes**
5. Service will auto-redeploy

## MongoDB Security

### Best Practices

1. **IP Whitelist**: 
   - In MongoDB Atlas, add only Render.com IP ranges
   - Never use `0.0.0.0/0` (allow all)

2. **Database User**:
   - Create dedicated user with minimal permissions
   - Only `readWrite` access to `wave-chat` database
   - Strong password (16+ characters, mixed case, numbers, symbols)

3. **Connection String**:
   - Always use environment variables
   - Never hardcode in source code
   - Rotate credentials periodically

### Setting up MongoDB Atlas

1. Go to https://cloud.mongodb.com/
2. Create new database user:
   - Click **Database Access**
   - **Add New Database User**
   - Username: `wavechat-prod` (or similar)
   - Password: **Generate strong password**
   - Permissions: **Read and write to specific database** → `wave-chat`
   - Save password in secure location

3. Whitelist Render IPs:
   - Click **Network Access**
   - **Add IP Address**
   - Get Render's outbound IPs from: https://render.com/docs/static-outbound-ip-addresses
   - Add each IP individually

4. Get connection string:
   - Click **Database** → **Connect**
   - Choose **Connect your application**
   - Copy connection string
   - Replace `<password>` with your user's password
   - Set as MONGODB_URI on Render

## Admin API Security

### Protected Endpoints

These endpoints require `ADMIN_KEY` in request body:

- `POST /admin/clear-bans` - Clear all bans
- `POST /admin/clear-users` - Clear all users
- `POST /admin/unban-ip` - Remove IP ban

### Example Request

```bash
curl -X POST https://your-server.onrender.com/admin/clear-bans \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your_admin_key_here"}'
```

### Security Notes

- **Never** share ADMIN_KEY
- Use HTTPS only
- Consider IP whitelisting for admin endpoints
- Rotate ADMIN_KEY if compromised

## Additional Security Measures

### Implemented

✅ Environment variables for secrets
✅ MongoDB credentials not in code
✅ Admin key authentication
✅ Browser fingerprinting
✅ IP-based banning
✅ Session token validation
✅ XSS protection (HTML escaping)
✅ Message rate limiting (5s cooldown)
✅ Auto-moderation (links, mentions, CAPS, non-English)

### Recommended Improvements

- [ ] Add rate limiting for API endpoints
- [ ] Implement CORS whitelist for specific domains
- [ ] Add CSP (Content Security Policy) headers
- [ ] Increase Device Code length (8+ characters)
- [ ] Add Device Code expiration (auto-delete after 10 minutes)
- [ ] Validate x-forwarded-for against trusted proxies
- [ ] Add request logging/monitoring
- [ ] Implement 2FA for admin operations

## Incident Response

If credentials are compromised:

1. **Immediately** rotate MongoDB password
2. Generate new ADMIN_KEY
3. Update environment variables on Render
4. Review MongoDB access logs
5. Check for unauthorized data access
6. Clear all sessions: `POST /admin/clear-users`

## Contact

For security issues, contact: [your-email]
