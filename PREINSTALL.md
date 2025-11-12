# 🚀 Imlil.dev - Quick Start Development Guide

> **Simplified setup guide for Imlil.dev VS Code extension development**

## ⚡ Quick Start (5 minutes)

### Prerequisites Check
```bash
# Check Node.js version (requires 20.19.2)
node --version  # Should be v20.19.2

# Check pnpm (install if missing)
pnpm --version  # Should be 10.8.1 or later
# Install: npm install -g pnpm@10.8.1
```

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/imlildev/imlildev-vscode.git
cd imlildev-vscode

# Install all dependencies (this may take 5-10 minutes)
pnpm install
```

### 2. Build the Extension
```bash
# Build everything (webview UI + extension)
pnpm build
```

### 3. Run in Development
```bash
# Press F5 in VS Code, or:
code .  # Open in VS Code
# Then press F5 to start debugging
```

**That's it!** The extension will open in a new VS Code window.

---

## 📦 Installation Methods

### Option 1: Native Development (Recommended)
**Best for**: MacOS, Linux, Windows with WSL

**Requirements:**
- Node.js 20.19.2 ([download](https://nodejs.org/))
- pnpm 10.8.1+ (`npm install -g pnpm@10.8.1`)
- VS Code with extensions:
  - [ESBuild Problem Matchers](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers) (required)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (recommended)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (recommended)

**Setup:**
```bash
git clone https://github.com/imlildev/imlildev-vscode.git
cd imlildev-vscode
pnpm install
pnpm build
```

### Option 2: Devcontainer (Windows Recommended)
**Best for**: Windows without WSL, standardized environments

**Requirements:**
- Docker Desktop
- VS Code
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

**Setup:**
1. Open project in VS Code
2. Click "Reopen in Container" when prompted
3. Wait for container to build (first time: 5-10 minutes)
4. Press F5 to start debugging

**Benefits:**
- ✅ No local Node.js installation needed
- ✅ Consistent environment across all machines
- ✅ All dependencies pre-installed

### Option 3: Nix Flake (NixOS/Nix Users)
**Best for**: NixOS users, reproducible environments

**Requirements:**
- Nix with flakes enabled
- direnv (`nix profile install nixpkgs#direnv`)
- VS Code with [mkhl.direnv](https://marketplace.visualstudio.com/items?itemName=mkhl.direnv) extension

**Setup:**
```bash
git clone https://github.com/imlildev/imlildev-vscode.git
cd imlildev-vscode
direnv allow  # Auto-loads Nix environment
pnpm install
pnpm build
```

---

## 🛠️ Development Commands

### Essential Commands
```bash
# Install dependencies
pnpm install

# Build the extension
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm check-types

# Format code
pnpm format
```

### Build & Package
```bash
# Build production .vsix file
pnpm build
# Output: bin/imlil-dev-*.vsix

# Install built extension locally
code --install-extension "$(ls -1v bin/imlil-dev-*.vsix | tail -n1)"
```

### Development Workflow
```bash
# 1. Make changes to code
# 2. Press F5 in VS Code (auto-reloads)
# 3. Test in new VS Code window
# 4. Repeat!
```

**Hot Reload:**
- ✅ Webview UI changes → Auto-reloads immediately
- ✅ Extension code changes → Auto-reloads extension host
- ⚠️ No need to restart debugger manually

---

## 🏗️ Project Structure

```
imlildev-vscode/
├── src/                          # Core extension code
│   ├── api/                      # API handlers
│   │   └── providers/
│   │       └── embedapi/       # ✨ EmbedAPI integration
│   ├── core/                     # Core functionality
│   ├── services/                 # Service implementations
│   │   └── code-index/
│   │       └── embedders/
│   │           └── embedapi.ts  # ✨ EmbedAPI embedder
│   └── package.json              # Extension manifest
├── webview-ui/                   # Frontend React app
│   ├── src/
│   │   ├── i18n/                 # Translations (ar/, fr/, en/)
│   │   └── components/           # React components
│   └── package.json
├── packages/                     # Shared packages
│   ├── types/                    # TypeScript types
│   └── ...
├── apps/                         # Applications
│   └── vscode-e2e/              # E2E tests
└── package.json                  # Root workspace config
```

---

## 🔧 Configuration

### EmbedAPI Setup (For Testing)

To test with EmbedAPI backend:

1. **Get EmbedAPI Token** from your EmbedAPI dashboard
2. **Configure in VS Code Settings**:
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run: `Imlil.dev: Add API Key`
   - Select "EmbedAPI" provider
   - Paste your token

3. **Or set environment variable**:
   ```bash
   export EMBEDAPI_TOKEN="your-token-here"
   ```

### Local Backend Testing

To test against local EmbedAPI backend:

1. **Set environment variable**:
   ```bash
   export EMBEDAPI_BASE_URL="http://localhost:3000"
   ```

2. **Use launch configuration**:
   - Go to Run and Debug (`Ctrl+Shift+D`)
   - Select "Run Extension [Local Backend]"
   - Press F5

---

## 🧪 Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Tests
```bash
# Extension tests only
pnpm --filter imlil-dev test

# Webview UI tests only
pnpm --filter webview-ui test

# E2E tests
pnpm --filter vscode-e2e test
```

### Test Coverage
```bash
# Generate coverage report
pnpm test -- --coverage
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Node version mismatch"**
```bash
# Use nvm to switch Node versions
nvm install 20.19.2
nvm use 20.19.2
```

**2. "pnpm not found"**
```bash
# Install pnpm globally
npm install -g pnpm@10.8.1

# Or use corepack (Node 16.10+)
corepack enable
corepack prepare pnpm@10.8.1 --activate
```

**3. "Build errors"**
```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**4. "Extension not loading"**
- Check VS Code Developer Tools: `Help > Toggle Developer Tools`
- Look for errors in Output panel: `View > Output > "Imlil.dev"`
- Try reloading window: `Developer: Reload Window`

**5. "Webview not updating"**
- Right-click in webview → "Inspect Element"
- Check browser console for errors
- Try hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`

### Debug Tips

**Extension Code:**
```typescript
// Use console.log for debugging
console.log("Debug message", data);

// Check Output panel in VS Code
// View > Output > Select "Imlil.dev"
```

**Webview Code:**
```typescript
// Use browser dev tools
// Right-click in webview → Inspect Element
console.log("Webview debug", data);
```

---

## 📚 Additional Resources

### Documentation
- **Full Development Guide**: See [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Migration Plan**: See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)
- **Implementation Status**: See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
- **EmbedAPI Integration**: See [EMBEDAPI_INTEGRATION_POINTS.md](./EMBEDAPI_INTEGRATION_POINTS.md)

### Key Files to Know
- `src/api/index.ts` - Main API handler routing
- `src/api/providers/embedapi/` - EmbedAPI integration
- `webview-ui/src/index.tsx` - Webview entry point
- `src/package.json` - Extension manifest

### VS Code Extensions (Recommended)
Install via VS Code Extensions panel or:
```bash
code --install-extension connor4312.esbuild-problem-matchers
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

---

## 🚀 Quick Reference

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Build | `pnpm build` |
| Run | Press `F5` in VS Code |
| Test | `pnpm test` |
| Lint | `pnpm lint` |
| Type Check | `pnpm check-types` |
| Format | `pnpm format` |
| Package | `pnpm build` (creates .vsix) |

---

## ✅ Pre-Flight Checklist

Before starting development, ensure:

- [ ] Node.js 20.19.2 installed (`node --version`)
- [ ] pnpm 10.8.1+ installed (`pnpm --version`)
- [ ] Repository cloned (`git clone ...`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] Build successful (`pnpm build`)
- [ ] VS Code extensions installed (ESBuild Problem Matchers)
- [ ] Can run extension (`F5` works)

---

## 🎯 Next Steps

1. **Read the code**: Start with `src/api/index.ts` to understand routing
2. **Check EmbedAPI integration**: See `src/api/providers/embedapi/`
3. **Explore webview**: Check `webview-ui/src/` for UI code
4. **Run tests**: `pnpm test` to see what's tested
5. **Make a change**: Edit something and see it hot-reload!

---

**Need Help?**
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guide
- See [TROUBLESHOOTING](#-troubleshooting) section above
- Review [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for current progress

**Happy Coding! 🚀**

