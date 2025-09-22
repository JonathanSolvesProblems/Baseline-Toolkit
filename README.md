# 🛡️ Baseline Toolkit

A comprehensive monorepo toolkit for helping developers safely adopt modern web features using [Baseline](https://web.dev/baseline/) data. This professional-grade developer toolkit provides real-time linting, CI/CD enforcement, visual reporting, and upgrade guidance.

## 🚀 Features

**Core Features:**
- Real-time VS Code linting with tooltips and autofix suggestions
- CLI tool for CI/CD integration with GitHub Actions
- Interactive dashboard for visualizing Baseline compatibility
- Shared core library for consistent feature analysis
- Configuration system with project-level settings
- Upgrade advisor for modernizing legacy code

**Design Elements:**
- Professional Apple-level design aesthetics with clean, sophisticated UI
- Comprehensive color system with primary, secondary, success, warning, and error states
- Responsive design optimized for all screen sizes
- Smooth animations and micro-interactions for enhanced user experience
- Consistent 8px spacing system and modern typography

## 📦 Packages

### `@baseline-toolkit/core`
Shared analysis engine that powers all tools in the toolkit.

**Key Features:**
- CSS and JavaScript AST parsing using CSSTree and Acorn
- Integration with `web-features` and `compute-baseline` packages
- TypeScript-first with comprehensive type definitions
- Configurable analysis rules and feature filtering

### `@baseline-toolkit/cli`
Command-line tool for CI/CD integration and batch analysis.

```bash
# Check current directory
npx baseline-check src/

# Generate JSON report
npx baseline-check --json --output report.json

# Get upgrade suggestions
npx baseline-upgrade src/
```

### `@baseline-toolkit/extension` (VS Code)
Real-time linting extension for Visual Studio Code.

**Features:**
- Live diagnostics with squiggly underlines
- Detailed hover tooltips with browser support info
- Code actions for common fixes and fallbacks
- Configurable warning levels and ignored features

### `@baseline-toolkit/dashboard`
Web dashboard for visualizing compatibility reports.

**Features:**
- Interactive charts showing feature distribution
- Per-file analysis with safety scores
- Filterable views for different baseline statuses
- Export capabilities for reports and documentation

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and pnpm 8+
- VS Code (for extension development)

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd baseline-toolkit
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Development

```bash
# Start development mode for all packages
pnpm dev

# Run specific package in dev mode
pnpm -F @baseline-toolkit/dashboard dev

# Test specific package
pnpm -F @baseline-toolkit/core test
```

## 📋 Usage

### CLI Usage

```bash
# Basic analysis
baseline-check src/

# With custom config
baseline-check src/ --config baseline.config.json

# CI/CD integration
baseline-check src/ --json --fail-on-risky
```

### VS Code Extension

1. Open VS Code in your project
2. Install the Baseline Toolkit extension
3. Open CSS/JS files to see real-time compatibility warnings
4. Hover over features for detailed browser support info
5. Use quick fixes for common compatibility issues

### Dashboard

```bash
# Start dashboard
cd packages/dashboard
pnpm dev

# Build for production
pnpm build
```

Visit `http://localhost:3000` to view the interactive dashboard.

### GitHub Action

```yaml
# .github/workflows/baseline.yml
name: Baseline Check
on: [pull_request]

jobs:
  baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ./.github/actions/baseline-check
        with:
          path: 'src/'
          fail-on-risky: 'true'
          comment-pr: 'true'
```

## ⚙️ Configuration

Create a `baseline.config.json` file in your project root:

```json
{
  "rules": {
    "allowLow": false,
    "blockFalse": true
  },
  "ignore": [
    "css-container-queries",
    "idle-detection"
  ]
}
```

### Configuration Options

- `rules.allowLow`: Allow features with 'low' baseline status
- `rules.blockFalse`: Block features with 'false' baseline status
- `ignore`: Array of feature IDs to ignore during analysis

## 🧪 Testing

The toolkit includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test suite
pnpm -F @baseline-toolkit/core test
```

## 🏗️ Architecture

### Monorepo Structure
```
packages/
├── core/           # Shared analysis engine
├── cli/            # Command-line tool
├── extension/      # VS Code extension
└── dashboard/      # Web dashboard
```

### Technology Stack
- **TypeScript**: Strict typing throughout
- **Vite**: Modern build tooling
- **React**: Dashboard UI framework  
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization
- **CSSTree & Acorn**: AST parsing
- **Jest**: Testing framework
- **ESLint & Prettier**: Code quality

## 📊 Baseline Integration

The toolkit integrates with official Baseline data sources:

- **web-features**: Comprehensive feature database
- **compute-baseline**: Real-time baseline status computation
- **Browser Compat Data (BCD)**: Detailed browser support information

### Feature Analysis Process

1. **Parse** CSS/JS files using AST parsers
2. **Extract** feature usage from syntax trees
3. **Map** features to Baseline database entries
4. **Compute** baseline status and browser support
5. **Generate** actionable reports with recommendations

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass
5. Submit a pull request

### Development Guidelines

- Follow TypeScript strict mode
- Maintain test coverage above 80%
- Use conventional commit messages
- Add JSDoc comments for public APIs
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Baseline Documentation](https://web.dev/baseline/)
- [Web Features Database](https://github.com/web-platform-dx/web-features)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

Built with ❤️ for the web development community. Making modern web features accessible and safe for everyone.