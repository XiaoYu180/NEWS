import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/douyin': {
        target: 'https://api.xunjinlu.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/douyin/, '/api/rebang/douyin.php'),
        secure: false,
      },
      '/api/weibo': {
        target: 'https://api.xunjinlu.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weibo/, '/api/rebang/weibo.php'),
        secure: false,
      },
      '/api/bilibili': {
        target: 'https://api.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bilibili/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Referer', 'https://www.bilibili.com')
          })
        },
      },
      '/api/zhihu': {
        target: 'https://api.xunjinlu.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zhihu/, '/api/rebang/zhihu.php'),
        secure: false,
      },
      '/api/aihot': {
        target: 'https://aihot.virxact.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aihot/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0')
            proxyReq.setHeader('Accept', 'application/json')
            proxyReq.setHeader('Referer', 'https://aihot.virxact.com/')
          })
        },
      },
      '/api/ipgeo': {
        target: 'https://ipapi.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ipgeo/, ''),
        secure: false,
      },
    },
  },
})
