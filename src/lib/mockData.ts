import { VideoCardData, Restaurant, TravelItinerary } from '@/types'

export const FOOD_VIDEOS: VideoCardData[] = [
  {
    id: 'food1',
    scenario: 'food',
    title: '贵州酸汤鱼的正确打开方式🔥 当地人教你选鱼',
    author: '@贵州美食探店',
    videoFile: 'food1.mp4',
    likes: '12.3万',
    comments: '2841',
  },
  {
    id: 'food2',
    scenario: 'food',
    title: '在家复刻网红酸汤，太上头了！配方全在这',
    author: '@美食up主小辣',
    videoFile: 'food2.mp4',
    likes: '8.7万',
    comments: '1523',
  },
  {
    id: 'food3',
    scenario: 'food',
    title: '在贵州黔东南，一锅红酸汤几乎可以搭配任何肉类或时蔬',
    author: '@舌尖上的味道',
    videoFile: 'food3.mp4',
    likes: '23.1万',
    comments: '4302',
  },
]

export const TRAVEL_VIDEOS: VideoCardData[] = [
  {
    id: 'travel1',
    scenario: 'travel',
    title: '贵州凯里，这才是真正的苗族古村 不是景区',
    author: '@行摄中国',
    videoFile: 'travel1.mp4',
    likes: '34.5万',
    comments: '6721',
  },
  {
    id: 'travel2',
    scenario: 'travel',
    title: '为了这几个镜头，我特意去了一趟贵州 #旅行推荐官',
    author: '@陈非晚',
    videoFile: 'travel2.mp4',
    likes: '18.9万',
    comments: '3104',
  },
  {
    id: 'travel3',
    scenario: 'travel',
    title: '看似欧洲！实则贵州…… 永远期待洋芋国的夏天！',
    author: '@尼克君',
    videoFile: 'travel3.mp4',
    likes: '9.2万',
    comments: '1876',
  },
  {
    id: 'travel4',
    scenario: 'travel',
    title: '觉得日子没盼头的，就去趟贵州吧，去一趟也许就想通了',
    author: '@旅游管家六六',
    videoFile: 'travel4.mp4',
    likes: '41.3万',
    comments: '8923',
  },
]

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    name: '苗家酸汤鱼（南山路店）',
    rating: 4.8,
    distance: '1.2km',
    specialty: '招牌酸汤鱼、苗家腊肉',
    address: '南山区南山路88号',
  },
  {
    name: '黔味道贵州私房菜',
    rating: 4.6,
    distance: '2.1km',
    specialty: '酸汤牛肉、折耳根炒腊肉',
    address: '福田区深南大道1688号',
  },
  {
    name: '凯里人家（科技园店）',
    rating: 4.5,
    distance: '3.4km',
    specialty: '凯里酸汤鱼、糯米饭',
    address: '南山区科技南路99号',
  },
]

export const MOCK_ITINERARY: TravelItinerary = {
  destination: '贵州凯里',
  transport: {
    from: '深圳',
    to: '凯里南',
    duration: '深圳北 → 贵阳北（高铁4.5h）→ 凯里南（高铁40min）',
    tip: '推荐动卧夜行，省一晚酒店钱',
    departures: [
      { train: 'G2065', depart: '08:06', arrive: '12:30', duration: '4h24m' },
      { train: 'G2075', depart: '10:35', arrive: '15:08', duration: '4h33m' },
      { train: 'G2077', depart: '15:30', arrive: '19:58', duration: '4h28m' },
    ],
  },
  days: [
    {
      day: 'D1',
      schedule: [
        { time: '午', activity: '西江千户苗寨（凯里周边90min车程）' },
        { time: '傍晚', activity: '苗寨夜景 + 风雨桥打卡' },
        { time: '晚', activity: '苗族酸汤鱼宴，当地人推荐的小馆子' },
      ],
    },
    {
      day: 'D2',
      schedule: [
        { time: '晨', activity: '郎德上寨 + 银饰体验（可定制）' },
        { time: '午', activity: '返程，带走凯里酸汤包' },
      ],
    },
  ],
  mustSee: ['西江千户苗寨', '郎德上寨', '季刀苗寨'],
  mustEat: ['凯里酸汤鱼', '糯米饭', '苗家腊肉', '折耳根'],
}
