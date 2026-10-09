/**
 * Data and schema for the Explorer's Log (探险家日志) high-transfer cognitive memory module.
 *
 * Cognitive Pipeline:
 * [场景/故事展示] → [要素分类/时序重构/细节填空] → [语义提取与逻辑验证]
 */

export interface ExplorerTimelineEvent {
  id: string;
  order: number; // 1-based chronological order
  text: string;
  icon: string;
}

export interface ExplorerCategoryItem {
  id: string;
  name: string;
  icon: string;
  correctBucketId: 'A' | 'B';
}

export interface ExplorerQuestion {
  id: string;
  type: 'math' | 'detail' | 'causal';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  cognitionTag: string;
}

export interface ExplorerLesson {
  id: string;
  chapterId: 'forest' | 'village' | 'detective';
  chapterTitle: string;
  title: string;
  icon: string;
  themeColor: string;
  description: string;
  badge: string;
  story: {
    title: string;
    text: string;
    pinyin: string;
    focusWords: string[];
    bgGradient: string;
  };
  timelineEvents: ExplorerTimelineEvent[];
  categoryTask?: {
    bucketAName: string;
    bucketBName: string;
    items: ExplorerCategoryItem[];
  };
  questions: ExplorerQuestion[];
}

export const EXPLORER_CHAPTERS = [
  { id: 'forest', title: '🌲 森林探险日志', desc: '方位、路线与先后时序推理' },
  { id: 'village', title: '🍎 村庄物资管理员', desc: '数量增减、买卖换算与分类归纳' },
  { id: 'detective', title: '🐉 守卫传奇小侦探', desc: '因果逻辑、细节求证与反事实假设' },
];

export const EXPLORER_LESSONS: ExplorerLesson[] = [
  // ── 篇章一：森林探险 ──────────────────────────────────────────
  {
    id: 'forest-steve-morning',
    chapterId: 'forest',
    chapterTitle: '🌲 森林探险日志',
    title: '史蒂夫的早晨寻宝',
    icon: '🧭',
    themeColor: '#059669',
    description: '早晨出发寻宝的旅途，观察沿途所见与收获归位',
    badge: '时序与数量',
    story: {
      title: '史蒂夫的一天',
      text: '清晨，史蒂夫背上背包，带了【1把铁镐】和【3个红苹果】出发。路上，他遇到了一只【白色小羊】，顺手在湖边插了【2支火把】。傍晚回家时，他把挖到的【5颗绿宝石】锁进了【地下室大宝箱】。',
      pinyin: 'qīng chén, shǐ dì fū bēi shàng bēi bāo, dài le yī bǎ tiě gǎo hé sān gè hóng píng guǒ chū fā. lù shang, tā yù dào le yī zhī bái sè xiǎo yáng, shùn shǒu zài hú biān chā le liǎng zhī huǒ bǎ. bàng wǎn huí jiā shí, tā bǎ wā dào de wǔ kē lǜ bǎo shí suǒ jìn le dì xià shì dà bǎo xiāng.',
      focusWords: ['1把铁镐', '3个红苹果', '白色小羊', '2支火把', '5颗绿宝石', '地下室大宝箱'],
      bgGradient: 'from-emerald-900/60 to-emerald-950/90',
    },
    timelineEvents: [
      { id: 't1', order: 1, text: '背上背包，带铁镐与苹果出发', icon: '🎒' },
      { id: 't2', order: 2, text: '路上偶遇一只温顺的白色小羊', icon: '🐑' },
      { id: 't3', order: 3, text: '在清澈湖边插上2支照亮火把', icon: '🔥' },
      { id: 't4', order: 4, text: '将挖到的5颗绿宝石锁进宝箱', icon: '💎' },
    ],
    categoryTask: {
      bucketAName: '🎒 出发前背包带的物品',
      bucketBName: '🗺️ 旅途中遇到的事物',
      items: [
        { id: 'c1', name: '铁镐', icon: '⛏️', correctBucketId: 'A' },
        { id: 'c2', name: '红苹果', icon: '🍎', correctBucketId: 'A' },
        { id: 'c3', name: '白色小羊', icon: '🐑', correctBucketId: 'B' },
        { id: 'c4', name: '插在湖边的火把', icon: '🔥', correctBucketId: 'B' },
      ],
    },
    questions: [
      {
        id: 'q1',
        type: 'math',
        question: '如果史蒂夫在路上肚子饿了，吃掉了 1 个红苹果，他的背包里现在还剩几个红苹果？',
        options: ['1 个', '2 个', '3 个'],
        correctIndex: 1,
        explanation: '史蒂夫出发时带了 3 个苹果，吃掉 1 个：3 - 1 = 2 个。',
        cognitionTag: '数学应用建模',
      },
      {
        id: 'q2',
        type: 'detail',
        question: '关于史蒂夫的这一天，下列哪一句话是完全正确的？',
        options: ['史蒂夫是在深夜出发的', '湖边一共插了 2 支火把', '绿宝石被送给了白色小羊'],
        correctIndex: 1,
        explanation: '文中明确提到：“顺手在湖边插了 2 支火把”。',
        cognitionTag: '细节阅读求证',
      },
      {
        id: 'q3',
        type: 'causal',
        question: '如果史蒂夫出门时忘记带铁镐，他可能做不到什么事情？',
        options: ['在路上遇到小羊', '吃掉红苹果', '挖掘开采绿宝石'],
        correctIndex: 2,
        explanation: '铁镐是挖掘矿石宝石的必备工具，没有铁镐无法开采坚硬的绿宝石。',
        cognitionTag: '因果与反事实推理',
      },
    ],
  },
  {
    id: 'forest-cat-adventure',
    chapterId: 'forest',
    chapterTitle: '🌲 森林探险日志',
    title: '小猫米罗的森林探险',
    icon: '🐱',
    themeColor: '#10B981',
    description: '跟着好奇的小猫米罗，按顺序穿过神秘橡树林',
    badge: '空间与时序',
    story: {
      title: '小猫米罗的旅行',
      text: '阳光明媚的上午，小猫米罗跳过【2块青苔石】，来到【东边的大橡树】下。它捉住了【1只彩色蝴蝶】，然后在湖边喝了【清澈的泉水】。天黑前，它叼着【1片金色落叶】跑回了【暖和的小木屋】。',
      pinyin: 'yáng guāng míng mèi de shàng wǔ, xiǎo māo mǐ luó tiào guò liǎng kuài qīng tái shí, lái dào dōng biān de dà xiàng shù xià. tā zhuō zhù le yī zhī cǎi sè hú dié, rán hòu zài hú biān hē le qīng chè de quán shuǐ. tiān hēi qián, tā diāo zhe yī piàn jīn sè luò yè pǎo huí le nuǎn huo de xiǎo mù wū.',
      focusWords: ['2块青苔石', '东边的大橡树', '1只彩色蝴蝶', '清澈的泉水', '1片金色落叶', '暖和的小木屋'],
      bgGradient: 'from-teal-900/60 to-emerald-950/90',
    },
    timelineEvents: [
      { id: 't1', order: 1, text: '跳过青苔石，来到东边的大橡树', icon: '🌲' },
      { id: 't2', order: 2, text: '欢快地捉住了一只彩色蝴蝶', icon: '🦋' },
      { id: 't3', order: 3, text: '在湖边喝甘甜清澈的泉水解渴', icon: '💧' },
      { id: 't4', order: 4, text: '叼着金色落叶跑回暖和小木屋', icon: '🏡' },
    ],
    categoryTask: {
      bucketAName: '🐾 米罗到达的地点',
      bucketBName: '🍂 米罗接触的事物',
      items: [
        { id: 'c1', name: '东边的大橡树', icon: '🌳', correctBucketId: 'A' },
        { id: 'c2', name: '暖和的小木屋', icon: '🏡', correctBucketId: 'A' },
        { id: 'c3', name: '彩色蝴蝶', icon: '🦋', correctBucketId: 'B' },
        { id: 'c4', name: '金色落叶', icon: '🍂', correctBucketId: 'B' },
      ],
    },
    questions: [
      {
        id: 'q1',
        type: 'detail',
        question: '大橡树在森林的哪一个方位？',
        options: ['东边', '西边', '北边'],
        correctIndex: 0,
        explanation: '文中明确提到：“来到东边的大橡树下”。',
        cognitionTag: '空间方位感知',
      },
      {
        id: 'q2',
        type: 'causal',
        question: '米罗捉到彩色蝴蝶，是在喝清澈泉水之前还是之后？',
        options: ['喝泉水之前', '喝泉水之后', '同一时间'],
        correctIndex: 0,
        explanation: '故事顺序为：捉住彩色蝴蝶 ➔ 然后在湖边喝清澈泉水。所以是在喝水之前。',
        cognitionTag: '先后时序判断',
      },
      {
        id: 'q3',
        type: 'detail',
        question: '米罗返回小木屋时，外面的天色大概如何？',
        options: ['刚清晨天刚亮', '正午大太阳', '天快黑了'],
        correctIndex: 2,
        explanation: '文中写到：“天黑前，它跑回了暖和的小木屋”。',
        cognitionTag: '时间细节感知',
      },
    ],
  },

  // ── 篇章二：村庄物资 ──────────────────────────────────────────
  {
    id: 'village-blacksmith-inventory',
    chapterId: 'village',
    chapterTitle: '🍎 村庄物资管理员',
    title: '铁匠大叔的货架盘点',
    icon: '⚒️',
    themeColor: '#D97706',
    description: '管理铁匠铺货架买卖，理清数量增减与物品分类',
    badge: '分类与减法',
    story: {
      title: '铁匠铺开工啦',
      text: '今天一早，铁匠铺货架上整齐地摆着【4把铁剑】和【6个面包】。上午，一位冒险家买走了【2把铁剑】。中午，隔壁农夫送来了【3个新鲜南瓜】。傍晚打烊时，铁匠大叔把剩下的铁剑擦拭干净，锁进了【墙角的武器柜】。',
      pinyin: 'jīn tiān yī zǎo, tiě jiang pù huò jià shàng zhěng qí de bǎi zhe sì bǎ tiě jiàn hé liù gè miàn bāo. shàng wǔ, yī wèi mào xiǎn jiā mǎi zǒu le liǎng bǎ tiě jiàn. zhōng wǔ, gé bì nóng fū sòng lái le sān gè xīn xiān nán guā. bàng wǎn dǎ yàng shí, tiě jiang dà shū bǎ shèng xià de tiě jiàn cā shì gān jìng, suǒ jìn le qiáng jiǎo de wǔ qì guì.',
      focusWords: ['4把铁剑', '6个面包', '买走2把铁剑', '送来3个新鲜南瓜', '墙角的武器柜'],
      bgGradient: 'from-amber-900/60 to-orange-950/90',
    },
    timelineEvents: [
      { id: 't1', order: 1, text: '货架摆放着4把铁剑和6个面包', icon: '🏪' },
      { id: 't2', order: 2, text: '冒险家进店买走了2把锋利铁剑', icon: '⚔️' },
      { id: 't3', order: 3, text: '好客的农夫送来了3个新鲜南瓜', icon: '🎃' },
      { id: 't4', order: 4, text: '铁剑擦拭干净，锁入墙角武器柜', icon: '🔒' },
    ],
    categoryTask: {
      bucketAName: '⚔️ 工具与武器类',
      bucketBName: '🍞 美味食物类',
      items: [
        { id: 'c1', name: '铁剑', icon: '⚔️', correctBucketId: 'A' },
        { id: 'c2', name: '面包', icon: '🍞', correctBucketId: 'B' },
        { id: 'c3', name: '南瓜', icon: '🎃', correctBucketId: 'B' },
      ],
    },
    questions: [
      {
        id: 'q1',
        type: 'math',
        question: '铁匠大叔的货架上，最后还剩下几把铁剑？',
        options: ['1 把', '2 把', '4 把'],
        correctIndex: 1,
        explanation: '原本有 4 把铁剑，被买走 2 把：4 - 2 = 2 把。',
        cognitionTag: '减法数学建模',
      },
      {
        id: 'q2',
        type: 'detail',
        question: '农夫送来 3 个新鲜南瓜是在什么时候？',
        options: ['上午', '中午', '夜晚'],
        correctIndex: 1,
        explanation: '故事中明确记载：“中午，隔壁农夫送来了 3 个新鲜南瓜”。',
        cognitionTag: '时间细节回溯',
      },
      {
        id: 'q3',
        type: 'causal',
        question: '如果铁匠大叔想把食物集中收纳进冰箱，他应该把哪两样放一起？',
        options: ['铁剑 和 面包', '面包 和 南瓜', '铁剑 和 南瓜'],
        correctIndex: 1,
        explanation: '面包和南瓜都是可以食用的粮食蔬果，属于食物类。',
        cognitionTag: '概念属性归纳',
      },
    ],
  },
  {
    id: 'village-library-day',
    chapterId: 'village',
    chapterTitle: '🍎 村庄物资管理员',
    title: '图书馆的借阅日记',
    icon: '📚',
    themeColor: '#EA580C',
    description: '图书借还数量统计与古代藏宝图妥善保管',
    badge: '数量统计',
    story: {
      title: '图书馆的故事',
      text: '村庄图书馆的一楼书架上，整齐放着【8本附魔书】。上午，戴眼镜的小男孩借走了【3本书】。下午，村长送来了【2张古代藏宝图】。闭馆前，小艾管理员把剩下的附魔书锁进了【二楼的保险箱】。',
      pinyin: 'cūn zhuāng tú shū guǎn de yī lóu shū jià shàng, zhěng qí fàng zhe bā běn fù mó shū. shàng wǔ, dài yǎn jìng de xiǎo nán hái jiè zǒu le sān běn shū. xià wǔ, cūn zhǎng sòng lái le liǎng zhāng gǔ dài cáng bǎo tú. bì guǎn qián, xiǎo ài guǎn lǐ yuán bǎ shèng xià de fù mó shū suǒ jìn le èr lóu de bǎo xiǎn xiāng.',
      focusWords: ['8本附魔书', '借走3本书', '2张古代藏宝图', '二楼的保险箱'],
      bgGradient: 'from-amber-900/60 to-red-950/90',
    },
    timelineEvents: [
      { id: 't1', order: 1, text: '书架上原本整齐摆着8本附魔书', icon: '📖' },
      { id: 't2', order: 2, text: '戴眼镜男孩开心地借走3本书', icon: '👦' },
      { id: 't3', order: 3, text: '村长送来2张珍贵的古代藏宝图', icon: '🗺️' },
      { id: 't4', order: 4, text: '把剩下的书安全锁进二楼保险箱', icon: '🔐' },
    ],
    categoryTask: {
      bucketAName: '📖 可以阅读的书籍',
      bucketBName: '🗺️ 寻找宝物的地图',
      items: [
        { id: 'c1', name: '附魔书', icon: '📖', correctBucketId: 'A' },
        { id: 'c2', name: '古代藏宝图', icon: '🗺️', correctBucketId: 'B' },
      ],
    },
    questions: [
      {
        id: 'q1',
        type: 'math',
        question: '闭馆时，书架上还剩下几本附魔书？',
        options: ['3 本', '5 本', '8 本'],
        correctIndex: 1,
        explanation: '原本有 8 本，借走 3 本：8 - 3 = 5 本。',
        cognitionTag: '应用题减法运算',
      },
      {
        id: 'q2',
        type: 'detail',
        question: '村长送来的古代藏宝图一共有几张？',
        options: ['1 张', '2 张', '3 张'],
        correctIndex: 1,
        explanation: '故事中写到：“村长送来了 2 张古代藏宝图”。',
        cognitionTag: '数量细节捕捉',
      },
      {
        id: 'q3',
        type: 'detail',
        question: '剩下的附魔书最终被锁在了哪里？',
        options: ['一楼大厅书架', '二楼的保险箱', '地下室地窖'],
        correctIndex: 1,
        explanation: '文中明确提到：“把剩下的附魔书锁进了二楼的保险箱”。',
        cognitionTag: '空间位置记忆',
      },
    ],
  },

  // ── 篇章三：守卫传奇小侦探 ──────────────────────────────────────
  {
    id: 'detective-castle-alarm',
    chapterId: 'detective',
    chapterTitle: '🐉 守卫传奇小侦探',
    title: '城堡警报解除案',
    icon: '🕵️',
    themeColor: '#7C3AED',
    description: '通过蛛丝马迹还原真相，破译夜间神秘警报事件',
    badge: '因果与真相',
    story: {
      title: '夜半惊魂小乌龙',
      text: '深夜12点，城堡警报突然响了！守卫队长发现【西门外的火把灭了】，雪地上留下一串【绿色的大脚印】。队长带上【1把附魔弓】前去查看，在南边树丛里发现原来是一只【戴着南瓜头的小猪】在散步。队长笑着解除警报，并在日志上盖上了【安全合格章】。',
      pinyin: 'shēn yè shí èr diǎn, chéng bǎo jǐng bào tū rán xiǎng le! shǒu wèi duì zhǎng fā xiàn xī mén wài de huǒ bǎ miè le, xuě dì shàng liú xià yī chuàn lǜ sè de dà jiǎo yìn. duì zhǎng dài shàng yī bǎ fù mó gōng qián qù chá kàn, zài nán biān shù cóng lǐ fā xiàn yuán lái shì yī zhī dài zhe nán guā tóu de xiǎo zhū zài sàn bù. duì zhǎng xiào zhe jiě chú jǐng bào, bìng zài rì zhì shàng gài shàng le ān quán hé gé zhāng.',
      focusWords: ['西门外的火把灭了', '绿色的大脚印', '1把附魔弓', '戴着南瓜头的小猪', '安全合格章'],
      bgGradient: 'from-purple-900/60 to-indigo-950/90',
    },
    timelineEvents: [
      { id: 't1', order: 1, text: '火把熄灭，城堡响起紧急警报', icon: '🚨' },
      { id: 't2', order: 2, text: '雪地发现了一串诡异的绿色大脚印', icon: '🐾' },
      { id: 't3', order: 3, text: '队长手持附魔弓警惕地深入树丛', icon: '🏹' },
      { id: 't4', order: 4, text: '发现戴南瓜头的小猪，盖上安全章', icon: '🐷' },
    ],
    categoryTask: {
      bucketAName: '🔍 案发现场的线索',
      bucketBName: '🐷 事件背后的真相',
      items: [
        { id: 'c1', name: '熄灭的火把', icon: '🕯️', correctBucketId: 'A' },
        { id: 'c2', name: '雪地大脚印', icon: '🐾', correctBucketId: 'A' },
        { id: 'c3', name: '戴南瓜头的小猪', icon: '🐷', correctBucketId: 'B' },
      ],
    },
    questions: [
      {
        id: 'q1',
        type: 'causal',
        question: '半夜警报突然响起，最直接的原因是什么？',
        options: ['队长想吃夜宵', '西门外火把熄灭且有可疑大脚印', '小猪在城堡里大叫'],
        correctIndex: 1,
        explanation: '因西门火把熄灭并留下绿色大脚印，守卫系统触发了安全警报。',
        cognitionTag: '起因因果推导',
      },
      {
        id: 'q2',
        type: 'detail',
        question: '城堡最终是否真正遭遇了可怕怪物的入侵？',
        options: ['真的有苦力怕入侵了', '没有，其实是戴着南瓜头的小猪在散步', '城堡失守被占领了'],
        correctIndex: 1,
        explanation: '最后查明只是一只贪玩戴着南瓜头的小猪，是一场虚惊乌龙。',
        cognitionTag: '真相事实提取',
      },
      {
        id: 'q3',
        type: 'detail',
        question: '队长外出调查巡逻时，手里携带的武器是？',
        options: ['1 把铁剑', '1 把附魔弓', '1 把钻石镐'],
        correctIndex: 1,
        explanation: '文中明确提到：“队长带上 1 把附魔弓前去查看”。',
        cognitionTag: '道具细节记忆',
      },
    ],
  },
  {
    id: 'detective-potion-recipe',
    chapterId: 'detective',
    chapterTitle: '🐉 守卫传奇小侦探',
    title: '神秘女巫的夜视秘方',
    icon: '🧪',
    themeColor: '#8B5CF6',
    description: '严格按步骤炼制神圣夜视药水，验证配方与成分',
    badge: '顺序与配方',
    story: {
      title: '炼药锅的秘密',
      text: '女巫小屋的桌上放着一份珍贵的夜视药水秘方。第一步加入【3滴纯净泉水】，第二步放入【1颗金胡萝卜】煮沸，第三步加入【2片发光地衣】搅拌均匀。最后，药水变成了【漂亮的明黄色】，小心装进了【玻璃药水瓶】。',
      pinyin: 'nǚ wū xiǎo wū de zhuō shàng fàng zhe yī fèn zhēn guì de yè shì yào shuǐ mì fāng. dì yī bù jiā rù sān dī chún jìng quán shuǐ, dì èr bù fàng rù yī kē jīn hú luó bo zhǔ fèi, dì sān bù jiā rù liǎng piàn fā guāng dì yī jiǎn bàn jūn yún. zuì hòu, yào shuǐ biàn chéng le piào liang de míng huáng sè, xiǎo xīn zhuāng jìn le bō lí yào shuǐ píng.',
      focusWords: ['3滴纯净泉水', '1颗金胡萝卜', '2片发光地衣', '漂亮的明黄色', '玻璃药水瓶'],
      bgGradient: 'from-violet-900/60 to-purple-950/90',
    },
    timelineEvents: [
      { id: 't1', order: 1, text: '第一步：锅中加入3滴纯净泉水', icon: '💧' },
      { id: 't2', order: 2, text: '第二步：投入1颗金胡萝卜煮沸', icon: '🥕' },
      { id: 't3', order: 3, text: '第三步：加入2片发光地衣搅拌', icon: '🌿' },
      { id: 't4', order: 4, text: '变明黄色，小心装进玻璃药水瓶', icon: '🧪' },
    ],
    categoryTask: {
      bucketAName: '🥕 投入锅里的炼药材料',
      bucketBName: '🧪 最终成品的容器与状态',
      items: [
        { id: 'c1', name: '纯净泉水', icon: '💧', correctBucketId: 'A' },
        { id: 'c2', name: '金胡萝卜', icon: '🥕', correctBucketId: 'A' },
        { id: 'c3', name: '发光地衣', icon: '🌿', correctBucketId: 'A' },
        { id: 'c4', name: '玻璃药水瓶', icon: '🧪', correctBucketId: 'B' },
      ],
    },
    questions: [
      {
        id: 'q1',
        type: 'detail',
        question: '配方中第二步放进去煮沸的材料是什么？',
        options: ['纯净泉水', '金胡萝卜', '发光地衣'],
        correctIndex: 1,
        explanation: '第一步是纯净泉水，第二步是放入 1 颗金胡萝卜煮沸。',
        cognitionTag: '步骤时序提取',
      },
      {
        id: 'q2',
        type: 'math',
        question: '配方里金胡萝卜（1颗）和发光地衣（2片）一共放了几份固体材料？',
        options: ['2 份', '3 份', '4 份'],
        correctIndex: 1,
        explanation: '1 颗金胡萝卜 + 2 片发光地衣：1 + 2 = 3 份。',
        cognitionTag: '情境加法运算',
      },
      {
        id: 'q3',
        type: 'detail',
        question: '夜视药水成功炼成后，呈现的是什么颜色？',
        options: ['黑色', '明黄色', '暗紫色'],
        correctIndex: 1,
        explanation: '文中写到：“最后，药水变成了漂亮的明黄色”。',
        cognitionTag: '属性特征记忆',
      },
    ],
  },
];

export function getExplorerLesson(id: string): ExplorerLesson {
  return EXPLORER_LESSONS.find((l) => l.id === id) || EXPLORER_LESSONS[0];
}
