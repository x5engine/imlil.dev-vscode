# 🚀 Quick Start - Development Mode

## What You Need

### 1. Prerequisites

```bash
# Check Node.js version (must be 20.19.2)
node --version
# If not installed or wrong version:
# - Download from https://nodejs.org/
# - Or use nvm: nvm install 20.19.2 && nvm use 20.19.2

# Check pnpm (must be 10.8.1+)
pnpm --version
# If not installed:
npm install -g pnpm@10.8.1
# Or use corepack:
corepack enable
corepack prepare pnpm@10.8.1 --activate
```

### 2. VS Code Extensions (Recommended)

Install these VS Code extensions for the best development experience:

```bash
# Install via command line:
code --install-extension connor4312.esbuild-problem-matchers
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

Or install manually:

- **ESBuild Problem Matchers** (required) - Shows build errors in VS Code
- **ESLint** (recommended) - Code linting
- **Prettier** (recommended) - Code formatting

---

## 🎯 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# In the project root directory
pnpm install
```

This will:

- Install all npm packages
- Set up the workspace
- Install Git hooks (Husky)

**Time**: 5-10 minutes (first time)

### Step 2: Build the Extension

```bash
# Build everything (webview UI + extension code)
pnpm build
```

This will:

- Build the React webview UI
- Compile TypeScript
- Bundle the extension
- Create output files in `dist/` and `out/`

**Time**: 1-2 minutes

### Step 3: Run in Development Mode

**Important: Use Node 20.19.2**

Before opening the project, make sure you're using the correct Node version:

```bash
# Switch to Node 20.19.2 (required!)
nvm use 20.19.2

# Verify it's active
node --version  # Should show v20.19.2
```

**In VS Code:**

1. **Open the project** in VS Code (from the terminal with Node 20.19.2 active):

    ```bash
    code .
    ```

2. **Press `F5`** (or go to Run → Start Debugging)

3. **A new VS Code window will open** with the extension loaded!

**That's it!** 🎉

**Note:** The `.nvmrc` file in the project specifies Node 20.19.2. If you use tools like `direnv`, they can automatically switch versions when you enter the directory.

---

## 🔥 Hot Reload

The extension supports hot reloading:

- ✅ **Webview UI changes** → Auto-reloads immediately (no restart needed)
- ✅ **Extension code changes** → Auto-reloads extension host (no restart needed)
- ⚠️ **No need to press F5 again** - just save your files!

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test embedapi-handler.spec.ts
```

### Check Code Quality

```bash
# Lint code
pnpm lint

# Type check
pnpm check-types

# Format code
pnpm format
```

---

## 🔧 Configuration

### EmbedAPI Token (For Testing)

To test with EmbedAPI:

1. **Get your EmbedAPI token** from https://app.embedapi.com
2. **Configure in VS Code**:

    - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
    - Run: `Imlil.dev: Add API Key`
    - Select "EmbedAPI"
    - Paste your token

3. **Or set environment variable**:
    ```bash
    export EMBEDAPI_TOKEN="your-token-here"
    ```

### Local Backend Testing

To test against local EmbedAPI backend:

```bash
export EMBEDAPI_BASE_URL="http://localhost:3000"
```

Then press F5 to run.

---

## 📁 Project Structure

```
imlildev-vscode/
├── src/                    # Extension code
│   ├── api/providers/embedapi/  # EmbedAPI integration
│   ├── core/billing/      # Billing system
│   └── package.json       # Extension manifest
├── webview-ui/            # React frontend
│   └── src/               # React components
├── docs/                  # Documentation
└── package.json           # Root workspace config
```

---

## 🐛 Troubleshooting

### "Node version mismatch"

```bash
# Use nvm to switch versions
nvm install 20.19.2
nvm use 20.19.2
```

### "pnpm not found"

```bash
# Install pnpm globally
npm install -g pnpm@10.8.1

# Or use corepack (Node 16.10+)
corepack enable
corepack prepare pnpm@10.8.1 --activate
```

### "Build errors"

```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### "Extension not loading"

1. Check VS Code Developer Tools: `Help > Toggle Developer Tools`
2. Look for errors in Output panel: `View > Output > "Imlil.dev"`
3. Try reloading window: `Developer: Reload Window`

### "Webview not updating"

1. Right-click in webview → "Inspect Element"
2. Check browser console for errors
3. Try hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`

---

## 🎯 Quick Commands Reference

| Task                 | Command               |
| -------------------- | --------------------- |
| Install dependencies | `pnpm install`        |
| Build extension      | `pnpm build`          |
| Run in dev mode      | Press `F5` in VS Code |
| Run tests            | `pnpm test`           |
| Lint code            | `pnpm lint`           |
| Type check           | `pnpm check-types`    |
| Format code          | `pnpm format`         |

---

## ✅ Pre-Flight Checklist

Before starting development:

- [ ] Node.js 20.19.2 installed (`node --version`)
- [ ] pnpm 10.8.1+ installed (`pnpm --version`)
- [ ] VS Code installed
- [ ] ESBuild Problem Matchers extension installed
- [ ] Dependencies installed (`pnpm install`)
- [ ] Build successful (`pnpm build`)
- [ ] Can run extension (`F5` works)

---

## 📚 Next Steps

1. **Read the code**: Start with `src/api/index.ts` to understand routing
2. **Check EmbedAPI integration**: See `src/api/providers/embedapi/`
3. **Explore webview**: Check `webview-ui/src/` for UI code
4. **Run tests**: `pnpm test` to see what's tested
5. **Make a change**: Edit something and see it hot-reload!

---

## 🔗 More Documentation

- **Full Development Guide**: [PREINSTALL.md](./PREINSTALL.md)
- **EmbedAPI Integration**: [docs/EMBEDAPI_INTEGRATION.md](./docs/EMBEDAPI_INTEGRATION.md)
- **Billing Guide**: [docs/BILLING.md](./docs/BILLING.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)

---

**Happy Coding! 🚀**
