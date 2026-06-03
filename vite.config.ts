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
      '/api/baidu': {
        target: 'https://api.xunjinlu.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/baidu/, '/api/rebang/baidu.php'),
        secure: false,
      },
      '/api/bilibili': {
        target: 'https://api.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bilibili/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            proxyReq.setHeader('Referer', 'https://www.bilibili.com')
            proxyReq.setHeader('Origin', 'https://www.bilibili.com')
          })
        },
      },
      '/api/zhihu': {
        target: 'https://api.xunjinlu.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zhihu/, '/api/rebang/zhihu.php'),
        secure: false,
      },
      '/api/wallstreetcn': {
        target: 'https://api.wallstreetcn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wallstreetcn/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            proxyReq.setHeader('Referer', 'https://wallstreetcn.com/')
          })
        },
      },
      '/api/yicai': {
        target: 'https://www.yicai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yicai/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            proxyReq.setHeader('Referer', 'https://www.yicai.com/')
          })
        },
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
      '/api/qqmusic': {
        target: 'https://c.y.qq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/qqmusic/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            proxyReq.setHeader('Referer', 'https://y.qq.com')
          })
        },
      },
      '/api/wangyiyun': {
        target: 'https://music.163.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wangyiyun/, ''),
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/537.36')
            proxyReq.setHeader('Referer', 'https://music.163.com/')
          })
        },
      },
      '/api/book': {
        target: 'https://gutendex.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/book/, '/books'),
        secure: false,
      },
    },
  },
})
