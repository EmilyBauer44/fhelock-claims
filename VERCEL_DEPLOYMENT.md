# Vercel Deployment Guide for FHELock Claims

## Prerequisites

1. A Vercel account (free tier available)
2. GitHub repository access
3. Environment variables ready

## Step-by-Step Deployment Instructions

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project" or "Import Project"

### Step 2: Import GitHub Repository

1. Select "Import Git Repository"
2. Choose "EmilyBauer44/fhelock-claims" from the list
3. Click "Import"

### Step 3: Configure Project Settings

1. **Project Name**: `fhelock-claims`
2. **Framework Preset**: Select "Vite"
3. **Root Directory**: Leave as default (./)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

### Step 4: Set Environment Variables

In the Vercel dashboard, go to Settings > Environment Variables and add:

```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=your_rpc_endpoint_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key
```

### Step 5: Configure Build Settings

1. Go to Settings > General
2. Set **Node.js Version**: 18.x
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Set **Install Command**: `npm install`

### Step 6: Deploy

1. Click "Deploy" button
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at the provided Vercel URL

### Step 7: Custom Domain (Optional)

1. Go to Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate to be issued

## Post-Deployment Configuration

### Smart Contract Deployment

1. Deploy the FHELockClaims contract to Sepolia testnet
2. Update `src/contracts/contract-info.json` with the deployed contract address
3. Commit and push changes to trigger automatic redeployment

### Environment Variables for Production

Make sure these are set in Vercel dashboard:

- `NEXT_PUBLIC_CHAIN_ID`: 11155111 (Sepolia testnet)
- `NEXT_PUBLIC_RPC_URL`: Your preferred RPC endpoint
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID
- `NEXT_PUBLIC_INFURA_API_KEY`: Your Infura API key

### Monitoring and Analytics

1. Enable Vercel Analytics in the dashboard
2. Monitor build logs for any issues
3. Set up error tracking if needed

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Node.js version (should be 18.x)
2. **Environment Variables**: Ensure all required variables are set
3. **Wallet Connection**: Verify WalletConnect project ID is correct
4. **Contract Interaction**: Ensure contract is deployed and address is correct

### Build Optimization

1. Enable Vercel's automatic optimizations
2. Use Vercel's Edge Functions if needed
3. Configure caching headers for static assets

## Security Considerations

1. Never commit private keys or sensitive data
2. Use environment variables for all configuration
3. Enable Vercel's security headers
4. Regularly update dependencies

## Performance Optimization

1. Enable Vercel's automatic image optimization
2. Use Vercel's CDN for global distribution
3. Configure proper caching strategies
4. Monitor Core Web Vitals

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs in Vercel dashboard
3. Contact Vercel support if needed

## Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Build settings optimized
- [ ] Smart contract deployed
- [ ] Contract address updated
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled
- [ ] Performance monitoring set up
- [ ] Security headers configured
- [ ] Error tracking enabled

## Next Steps After Deployment

1. Test all wallet connections
2. Verify contract interactions
3. Test FHE encryption functionality
4. Monitor user experience
5. Set up monitoring and alerts
6. Plan for scaling if needed