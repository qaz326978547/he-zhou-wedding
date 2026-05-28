export const WEDDING = {
  couple: {
    groom: 'HE Bean',
    bride: 'Katherine Zhou',
  },
  date: '2026-11-14',
  dateDisplay: '2026 年 11 月 14 日（星期六）',
  time: '12:00',
  timezone: 'Asia/Taipei',
  // 2026-11-14 12:00 UTC+8 = 04:00 UTC
  countdownTarget: new Date('2026-11-14T04:00:00Z'),

  venue: {
    name: '全國大飯店 2F',
    address: '台灣臺中市西區館前路 57 號',
    googleMapsUrl: 'https://maps.app.goo.gl/CQz5TGweR5N8CgsQA',
    transport: '可搭乘大眾運輸或自行開車前往，詳細停車與交通資訊將於婚禮前更新。',
    notes: '婚禮當日相關流程與座位資訊將透過 LINE 官方帳號通知。',
  },

  story: [
    {
      year: '2019',
      title: '初識',
      description: '命運讓我們相遇，一個微笑改變了一切。',
      image: '/assets/story/2019.jpg',
    },
    {
      year: '2021',
      title: '初次旅行',
      description: '第一次一起出發，探索世界的每個角落。',
      image: '/assets/story/2021.jpg',
    },
    {
      year: '2024',
      title: '求婚',
      description: '在最美的時刻，我問了那個最重要的問題。',
      image: '/assets/story/2024.jpg',
    },
    {
      year: '2026',
      title: '婚禮',
      description: '感謝您的陪伴，見證我們最幸福的時刻。',
      image: '/assets/story/2026.jpg',
    },
  ],

  line: {
    url: 'https://line.me/R/ti/p/@516hdace',
    qrCodePath: '/assets/line/qr-code.png',
    description: '婚禮流程、座位資訊、當日通知將透過 LINE 官方帳號發布',
  },

  music: {
    src: '/assets/music/bg-music.mp3',
  },

  rsvpSuccess: {
    message: '謝謝您的回覆，我們已收到您的出席資訊，期待在婚禮當天與您相見。',
  },
} as const
