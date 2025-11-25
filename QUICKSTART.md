# 🚀 Quick Start Guide - DenetimPro

## Get Running in 3 Minutes

### Step 1: Add Gemini API Key (Optional)

Edit `.env`:
```env
VITE_GEMINI_API_KEY=your-api-key-here
```

Get key from: https://makersuite.google.com/app/apikey

> **Note:** App works without AI features. Just skip AI-related features if no key is set.

### Step 2: Run the App

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Step 3: Test the Flow

1. **Landing Page** - Click "Ücretsiz Dene"
2. **Register** - Create an account
   - Email: test@example.com
   - Password: password123
   - Name: Test User
3. **Dashboard** - You're in! 🎉
4. **Create Audit** - Click the "+" button
5. **Upload Data** - Click "Demo Veriyi Analiz Et"
6. **View Results** - Navigate through tabs

## 🗄️ Database

✅ **Already configured!** The Supabase database is ready with all tables and security policies.

Schema includes:
- User profiles with subscription tracking
- Audit records with status management
- Risk findings and issues
- Transaction history
- AI chat messages
- Report content with versioning
- Penalty analyses

## 🔐 Authentication

✅ **Real authentication** via Supabase Auth

- Users can register and login
- Sessions persist across page refreshes
- Row Level Security protects user data
- Logout works properly

## 📊 Features Available

### ✅ Working Now
- Landing page with pricing
- User registration & login
- Dashboard with stats
- Audit creation/deletion
- Multiple audits support
- Data persistence (everything saves to database)
- Real-time updates
- Responsive design
- Error boundaries

### 🔧 Ready to Implement
These features are **structurally ready** but need business logic from original code:

1. **XML Upload** - File input exists, needs parser
2. **Risk Analysis** - Database ready, needs logic from original code
3. **AI Features** - API configured, needs prompt integration
4. **Report Generation** - Editor ready, needs AI connection
5. **Penalty Simulation** - Database table ready, needs calculation logic

## 🎯 Next Development Steps

### Add Risk Detection (Easy - 15 minutes)

The analysis logic from the original code can be dropped in:

```typescript
// In Views.tsx -> UploadView component
// Replace the mock analysis with real logic:

import { useAuditIssues, useAuditTransactions } from '../../hooks/useAuditData';

const handleAnalyze = async () => {
  // 1. Generate mock transactions (or parse XML)
  const transactions = generateMockData(audit.id);

  // 2. Detect issues (copy logic from original)
  const issues = detectRisks(transactions);

  // 3. Save to database
  await saveTransactions(transactions);
  await saveIssues(issues);

  // 4. Update audit status
  await updateAudit(audit.id, { data_loaded: true });
};
```

### Add AI Features (Easy - 10 minutes)

```typescript
// In Views.tsx -> AIAssistantView
import { GEMINI_API_URL } from '../../lib/gemini';
import { useChatMessages } from '../../hooks/useAuditData';

const { messages, addMessage } = useChatMessages(audit?.id);

const sendMessage = async (text: string) => {
  await addMessage('user', text);

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }]
    })
  });

  const data = await response.json();
  await addMessage('ai', data.candidates[0].content.parts[0].text);
};
```

## 🔍 Troubleshooting

### Can't login?
- Check console for errors
- Verify Supabase URL in `.env`
- Try clearing browser cache

### Database errors?
- Schema is already applied
- RLS policies are set
- Check browser console for details

### Build fails?
```bash
npm install
npm run build
```
Should show: `✓ built in ~6s`

## 📝 Environment Variables

Required:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Optional (for AI features):
```env
VITE_GEMINI_API_KEY=your-gemini-key
```

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js` or component classes

### Add Features
1. Create new component in `src/components/`
2. Add route in `App.tsx`
3. Create database table if needed
4. Build custom hook in `src/hooks/`

### Modify Database
```sql
-- In Supabase SQL Editor
ALTER TABLE audits ADD COLUMN your_field text;
```

Then update TypeScript types in `src/lib/supabase.ts`

## 🚀 Deploy

### Vercel (Recommended)
```bash
npm run build
# Upload dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

Add environment variables in hosting dashboard.

## 📚 Learn More

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Full technical details
- [Supabase Docs](https://supabase.com/docs) - Database & auth
- [React Hooks](https://react.dev/reference/react) - State management
- [TypeScript](https://www.typescriptlang.org/docs/) - Type safety

## 💡 Tips

1. **Use React DevTools** - Inspect component state
2. **Check Supabase Dashboard** - View database in real-time
3. **Console Logs** - All errors logged to browser console
4. **TypeScript** - Catches errors before runtime

## ✅ Success Checklist

- [ ] App runs on localhost
- [ ] Can create account
- [ ] Can login
- [ ] Can create audit
- [ ] Dashboard shows data
- [ ] No console errors

If all checked, you're good to go! 🎉

---

**Need Help?**
- Check IMPLEMENTATION.md for architecture details
- View browser console for errors
- Check Supabase logs in dashboard
