# Host SaucerPay on Vercel

The web app serves real SaucerSwap quotes without any secrets. Hosting the web
app does not deploy the Solidity contract. See [testnet deployment](DEPLOYMENT.md)
to enable invoice creation and payment.

## Deploy from GitHub

Import this repository into your Vercel account with these settings:

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root Directory | `packages/nextjs` |
| Include source files outside the Root Directory | Enabled |
| Node.js | 22.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Next.js default (`.next`) |

The frontend imports the sibling `packages/checkout` npm workspace. Keep the
repository root lockfile and workspace packages available during the build.
No environment variables are required for the quote demo. Once deployed, use
the public production URL in your own README and project metadata.

Optional server-side variables are `HEDERA_NETWORK`, `HEDERA_TOKEN_ID` and
`HEDERA_CHECKOUT_ADDRESS`. Mainnet remains read-only in the reference UI.
Never upload `HEDERA_PRIVATE_KEY` or the Hardhat `.env` to Vercel.

## Package the demo for a CLI deployment

For hosts that expect Next.js at the upload root, the repository includes a
packaging script:

```bash
node scripts/prepare-vercel.mjs
```

It prints a new temporary directory. The script copies tracked frontend and
checkout source, links the checkout npm workspace, creates a lockfile, and
supplies the Next.js build configuration. It excludes local environment files,
contract deployment credentials and build artifacts. Commit new frontend files
before packaging them so they are included by `git ls-files`.

Deploy that printed directory with an authenticated Vercel CLI:

```bash
npx vercel@59.25.0 deploy /path/printed/by/the/script --prod --yes
```

Vercel CLI 59.25.0 also offers `deploy --temporary --yes` without an account.
That mode builds locally and returns a public demo URL, an expiration timestamp
and a private claim link. The owner must claim the deployment before it expires
to keep it available. Never commit or publish the claim link or `.vercel` state.

## Verify the hosted app

```bash
SMOKE_ORIGIN=https://your-site.vercel.app npm run smoke
```

Also request a real quote in both network modes and open the app on mobile.
Successful HTTP checks and quotes verify hosting, not an executed payment.

References: [Vercel monorepos](https://vercel.com/docs/monorepos) and
[files outside the root directory](https://vercel.com/docs/monorepos/monorepo-faq).
