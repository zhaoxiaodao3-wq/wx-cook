// === 枚举常量 ===
export const CATEGORIES = ['全部', '早餐', '午餐', '晚餐', '甜点'] as const
export const CATEGORY_MAP: Record<string, string> = {
  '全部': 'all', '早餐': 'breakfast', '午餐': 'lunch', '晚餐': 'dinner', '甜点': 'dessert'
}
export const CATEGORY_REVERSE_MAP: Record<string, string> = {
  'breakfast': '早餐', 'lunch': '午餐', 'dinner': '晚餐', 'dessert': '甜点'
}

export const CUISINES = ['川菜', '粤菜', '鲁菜', '苏菜', '其他']
export const TAGS = ['减脂', '素食', '精选', '快手菜']
export const DIFFICULTIES = ['简单', '中等', '困难']

// === 类型定义 ===
export interface User {
  id: string
  name: string
  avatar: string
  bio: string
}

export interface Ingredient {
  name: string
  amount: string
  unit: string
}

export interface Step {
  id: number
  desc: string
  image?: string
}

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  date: string
}

export interface Suggestion {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  date: string
}

export interface Recipe {
  id: string
  title: string
  coverImage: string
  author: User
  rating: number
  ratingCount: number
  createdAt: string
  duration: number
  difficulty: '简单' | '中等' | '困难'
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert'
  cuisine: string
  tags: string[]
  servings: number
  ingredients: Ingredient[]
  steps: Step[]
  tips: string
  crowd: string
  reviews: Review[]
  suggestions: Suggestion[]
}

// === Mock 用户 ===
const mockAuthor: User = {
  id: 'user-001', name: '小食光',
  avatar: 'https://picsum.photos/200/200?random=1',
  bio: '厨房里的治愈时光'
}
const mockAuthor2: User = {
  id: 'user-002', name: '厨厨子',
  avatar: 'https://picsum.photos/200/200?random=2',
  bio: '爱做饭的程序员'
}
const mockAuthor3: User = {
  id: 'user-003', name: '慢慢',
  avatar: 'https://picsum.photos/200/200?random=3',
  bio: '慢工出细活'
}

// === Mock 菜谱 ===
export const mockRecipes: Recipe[] = [
  {
    id: 'r1', title: '番茄炒蛋',
    coverImage: 'https://picsum.photos/600/400?random=10',
    author: mockAuthor, rating: 4.2, ratingCount: 15,
    createdAt: '2026-05-20T10:00:00Z', duration: 15, difficulty: '简单',
    category: 'lunch', cuisine: '川菜', tags: ['快手菜', '精选'], servings: 2,
    ingredients: [
      { name: '番茄', amount: '2', unit: '个' },
      { name: '鸡蛋', amount: '3', unit: '个' },
      { name: '葱花', amount: '适量', unit: '' },
      { name: '盐', amount: '适量', unit: '' },
    ],
    steps: [
      { id: 1, desc: '番茄切块，鸡蛋打散加少许盐搅匀。' },
      { id: 2, desc: '热锅凉油，倒入蛋液炒至凝固盛出。' },
      { id: 3, desc: '锅中余油炒番茄出汁，倒回鸡蛋翻炒均匀。' },
      { id: 4, desc: '加盐调味，撒葱花出锅。' },
    ],
    tips: '番茄选熟透的更容易出汁，炒蛋油温不要太高。', crowd: '家常必备',
    reviews: [
      { id: 'rv1', userId: 'u2', userName: '厨厨子', userAvatar: 'https://picsum.photos/200/200?random=2', rating: 5, date: '2026-05-22T08:00:00Z' },
      { id: 'rv2', userId: 'u3', userName: '慢慢', userAvatar: 'https://picsum.photos/200/200?random=3', rating: 4, date: '2026-05-23T12:00:00Z' },
    ],
    suggestions: [
      { id: 's1', userId: 'u2', userName: '厨厨子', userAvatar: 'https://picsum.photos/200/200?random=2', content: '加点白糖可以提鲜', date: '2026-05-22T08:05:00Z' },
    ],
  },
  {
    id: 'r2', title: '日式照烧鸡腿',
    coverImage: 'https://picsum.photos/600/400?random=11',
    author: mockAuthor2, rating: 4.7, ratingCount: 23,
    createdAt: '2026-05-18T14:00:00Z', duration: 30, difficulty: '中等',
    category: 'dinner', cuisine: '其他', tags: ['精选', '减脂'], servings: 2,
    ingredients: [
      { name: '鸡腿', amount: '2', unit: '只' },
      { name: '生抽', amount: '2', unit: '勺' },
      { name: '蜂蜜', amount: '1', unit: '勺' },
      { name: '料酒', amount: '1', unit: '勺' },
      { name: '姜片', amount: '3', unit: '片' },
    ],
    steps: [
      { id: 1, desc: '鸡腿去骨，用刀背拍松，牙签扎孔方便入味。' },
      { id: 2, desc: '生抽、蜂蜜、料酒调成照烧汁，腌制鸡腿20分钟。' },
      { id: 3, desc: '平底锅少油，鸡皮面朝下煎至金黄翻面。' },
      { id: 4, desc: '倒入剩余酱汁小火收汁，切片装盘。' },
    ],
    tips: '煎的时候用锅铲压一压鸡腿，让皮更酥脆。', crowd: '健身党友好',
    reviews: [
      { id: 'rv3', userId: 'u1', userName: '小食光', userAvatar: 'https://picsum.photos/200/200?random=1', rating: 5, date: '2026-05-20T10:00:00Z' },
    ],
    suggestions: [],
  },
  {
    id: 'r3', title: '芒果椰奶西米露',
    coverImage: 'https://picsum.photos/600/400?random=12',
    author: mockAuthor3, rating: 4.5, ratingCount: 8,
    createdAt: '2026-06-01T09:00:00Z', duration: 25, difficulty: '简单',
    category: 'dessert', cuisine: '粤菜', tags: ['素食'], servings: 4,
    ingredients: [
      { name: '西米', amount: '100', unit: 'g' },
      { name: '芒果', amount: '2', unit: '个' },
      { name: '椰奶', amount: '200', unit: 'ml' },
      { name: '冰糖', amount: '适量', unit: '' },
    ],
    steps: [
      { id: 1, desc: '水开后下西米，煮至中间剩小白点，关火焖10分钟至全透明。' },
      { id: 2, desc: '西米过冷水沥干。芒果一半切丁，一半打成果泥。' },
      { id: 3, desc: '椰奶加冰糖小火加热至融化，冷却。' },
      { id: 4, desc: '碗底铺西米，倒入椰奶，放芒果泥和芒果丁。' },
    ],
    tips: '西米一定要水开了再下锅，冷水下会糊成一团。', crowd: '夏日解暑神器',
    reviews: [], suggestions: [],
  },
  {
    id: 'r4', title: '水煮牛肉',
    coverImage: 'https://picsum.photos/600/400?random=13',
    author: mockAuthor, rating: 4.8, ratingCount: 31,
    createdAt: '2026-05-15T16:00:00Z', duration: 40, difficulty: '困难',
    category: 'dinner', cuisine: '川菜', tags: ['精选'], servings: 3,
    ingredients: [
      { name: '牛里脊', amount: '300', unit: 'g' },
      { name: '豆芽', amount: '200', unit: 'g' },
      { name: '干辣椒', amount: '10', unit: '个' },
      { name: '花椒', amount: '1', unit: '把' },
      { name: '郫县豆瓣酱', amount: '2', unit: '勺' },
      { name: '蒜末', amount: '适量', unit: '' },
    ],
    steps: [
      { id: 1, desc: '牛肉逆纹切薄片，加料酒、淀粉、蛋清腌制15分钟。' },
      { id: 2, desc: '豆芽焯水铺碗底。干辣椒剪段去籽。' },
      { id: 3, desc: '锅中炒香豆瓣酱，加水煮开后滑入牛肉片，变色即捞出。' },
      { id: 4, desc: '牛肉铺在豆芽上，撒蒜末、辣椒段、花椒，浇热油激香。' },
    ],
    tips: '牛肉要逆纹切口感才嫩，焯水时间不超过30秒。', crowd: '无辣不欢',
    reviews: [], suggestions: [],
  },
  {
    id: 'r5', title: '葱油拌面',
    coverImage: 'https://picsum.photos/600/400?random=14',
    author: mockAuthor2, rating: 3.9, ratingCount: 12,
    createdAt: '2026-05-28T07:00:00Z', duration: 20, difficulty: '简单',
    category: 'breakfast', cuisine: '苏菜', tags: ['快手菜', '素食'], servings: 1,
    ingredients: [
      { name: '面条', amount: '150', unit: 'g' },
      { name: '小葱', amount: '5', unit: '根' },
      { name: '生抽', amount: '2', unit: '勺' },
      { name: '老抽', amount: '1', unit: '勺' },
      { name: '白糖', amount: '半勺', unit: '' },
      { name: '食用油', amount: '3', unit: '勺' },
    ],
    steps: [
      { id: 1, desc: '小葱切段，葱白和葱绿分开。面条煮熟过凉水。' },
      { id: 2, desc: '小火炸葱白至微黄，加入葱绿炸至焦黄，捞出葱段。' },
      { id: 3, desc: '关火后倒入生抽、老抽、白糖搅匀，葱油即成。' },
      { id: 4, desc: '葱油拌入面条，放上炸葱段即可。' },
    ],
    tips: '炸葱全程小火，火大了葱会苦。葱油可以多做一些冷藏保存。', crowd: '懒人早餐首选',
    reviews: [], suggestions: [],
  },
  {
    id: 'r6', title: '松饼',
    coverImage: 'https://picsum.photos/600/400?random=15',
    author: mockAuthor3, rating: 4.0, ratingCount: 19,
    createdAt: '2026-06-02T08:00:00Z', duration: 30, difficulty: '中等',
    category: 'breakfast', cuisine: '其他', tags: ['精选'], servings: 4,
    ingredients: [
      { name: '低筋面粉', amount: '200', unit: 'g' },
      { name: '鸡蛋', amount: '2', unit: '个' },
      { name: '牛奶', amount: '180', unit: 'ml' },
      { name: '泡打粉', amount: '5', unit: 'g' },
      { name: '黄油', amount: '30', unit: 'g' },
      { name: '蜂蜜/枫糖浆', amount: '适量', unit: '' },
    ],
    steps: [
      { id: 1, desc: '面粉和泡打粉过筛混合。黄油融化备用。' },
      { id: 2, desc: '鸡蛋打散，加入牛奶和融化的黄油搅匀。' },
      { id: 3, desc: '液体倒入粉类，z字形搅拌至无干粉（面糊略粗糙即可，不要过度搅拌）。' },
      { id: 4, desc: '不粘锅小火，舀一勺面糊，表面冒泡时翻面，再煎30秒。' },
      { id: 5, desc: '叠放淋蜂蜜或枫糖浆，搭配水果。' },
    ],
    tips: '面糊静置10分钟效果更好。锅温太高会外焦里生，全程一定要小火。', crowd: '周末 brunch 必备',
    reviews: [], suggestions: [],
  },
]
