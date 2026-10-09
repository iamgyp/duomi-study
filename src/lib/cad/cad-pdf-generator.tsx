import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { CAD_COMMANDS } from './cad-data';

// 注册思源黑体中文字体
Font.register({
  family: 'Noto Sans SC',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.0/files/noto-sans-sc-chinese-simplified-400-normal.woff',
});

Font.register({
  family: 'Noto Sans SC Bold',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.0/files/noto-sans-sc-chinese-simplified-700-normal.woff',
});

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Noto Sans SC',
    fontSize: 9.5,
    color: '#1A202C',
    backgroundColor: '#FFFFFF',
  },
  header: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#2B6CB0',
    paddingBottom: 6,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2B6CB0',
  },
  subtitle: {
    fontSize: 8.5,
    color: '#4A5568',
    marginTop: 2,
  },
  meta: {
    fontSize: 8,
    color: '#718096',
    textAlign: 'right',
  },
  ruleBanner: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1.2,
    borderColor: '#3182CE',
    borderRadius: 5,
    padding: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ruleText: {
    fontSize: 8.5,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2B6CB0',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2D3748',
    backgroundColor: '#EDF2F7',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 6,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  card: {
    width: '49%',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 5,
    padding: 5,
    backgroundColor: '#F7FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyBadge: {
    width: 44,
    height: 32,
    backgroundColor: '#2B6CB0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Noto Sans SC Bold',
  },
  keySubText: {
    color: '#BEE3F8',
    fontSize: 6,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 9,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2D3748',
  },
  cardTip: {
    fontSize: 7,
    color: '#718096',
    marginTop: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 24,
    right: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#A0AEC0',
  },
  worksheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#3182CE',
    paddingBottom: 6,
  },
  studentInfo: {
    flexDirection: 'row',
    gap: 16,
    fontSize: 9,
    marginTop: 3,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  matchKey: {
    width: 55,
    height: 26,
    borderWidth: 1.5,
    borderColor: '#3182CE',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchText: {
    fontSize: 10,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2B6CB0',
  },
  matchDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: '#718096',
  },
  coloringCard: {
    width: '31%',
    borderWidth: 1.5,
    borderColor: '#4A5568',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  bigOutlineLetter: {
    fontSize: 26,
    fontFamily: 'Noto Sans SC Bold',
    color: '#3182CE',
    marginBottom: 2,
  },
});

export function CadCheatSheetPdfDocument() {
  const drawCommands = CAD_COMMANDS.filter((c) => c.category === 'draw');
  const modifyCommands = CAD_COMMANDS.filter((c) => c.category === 'modify');
  const controlAndDim = CAD_COMMANDS.filter(
    (c) => c.category === 'control' || c.category === 'dimension',
  );

  return (
    <Document>
      {/* ── 第 1 页：桌面速查手卡 (20 核心快捷键大字号版) ─── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>AutoCAD 小小建筑师 · 常用快捷键速查卡</Text>
            <Text style={styles.subtitle}>
              多米习题站 (DUOMI Study) · 一年级专属 20 大核心实战命令速查指南
            </Text>
          </View>
          <View>
            <Text style={styles.meta}>贴在电脑屏幕旁</Text>
            <Text style={styles.meta}>掌握地道 CAD 姿势</Text>
          </View>
        </View>

        <View style={styles.ruleBanner}>
          <Text style={styles.ruleText}>
            ★ 核心法宝：左手键盘敲字母，大拇指轻拍【空格键】执行！
          </Text>
          <Text style={styles.ruleText}>
            ★ 救命键：敲错了按【ESC】随时取消重新来！
          </Text>
        </View>

        {/* 绘图命令 */}
        <Text style={styles.sectionTitle}>一、 绘图命令 (Draw Commands)</Text>
        <View style={styles.grid}>
          {drawCommands.map((c) => (
            <View key={c.key} style={styles.card}>
              <View style={styles.keyBadge}>
                <Text style={styles.keyText}>{c.key}</Text>
                <Text style={styles.keySubText}>+ 空格</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  {c.name} ({c.chinese})
                </Text>
                <Text style={styles.cardTip}>{c.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 修改命令 */}
        <Text style={styles.sectionTitle}>二、 修改命令 (Modify Commands)</Text>
        <View style={styles.grid}>
          {modifyCommands.map((c) => (
            <View key={c.key} style={styles.card}>
              <View style={{ ...styles.keyBadge, backgroundColor: '#2C7A7B' }}>
                <Text style={styles.keyText}>{c.key}</Text>
                <Text style={styles.keySubText}>+ 空格</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  {c.name} ({c.chinese})
                </Text>
                <Text style={styles.cardTip}>{c.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 测量与控制 */}
        <Text style={styles.sectionTitle}>三、 尺寸标注与核心控制 (Dimension & Control)</Text>
        <View style={styles.grid}>
          {controlAndDim.map((c) => (
            <View key={c.key} style={styles.card}>
              <View
                style={{
                  ...styles.keyBadge,
                  backgroundColor: c.category === 'control' ? '#DD6B20' : '#805AD5',
                }}
              >
                <Text style={styles.keyText}>{c.key}</Text>
                <Text style={styles.keySubText}>
                  {c.category === 'control' ? '直接按' : '+ 空格'}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  {c.name} ({c.chinese})
                </Text>
                <Text style={styles.cardTip}>{c.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>多米习题站 DUOMI Study · 打造最棒的儿童学习体验</Text>
          <Text>第 1 页 / 共 4 页</Text>
        </View>
      </Page>

      {/* ── 第 2 页：连线闯关纸 (第一弹：基础几何与控制) ─── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.worksheetHeader}>
          <View>
            <Text style={styles.title}>CAD 快捷键大挑战 · 趣味连线纸 (第一弹)</Text>
            <Text style={styles.subtitle}>基础几何与控制篇：拿起铅笔，把字母和神奇功能连起来！</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text>姓名: _________</Text>
            <Text>日期: _________</Text>
            <Text>得分: _____ / 100</Text>
          </View>
        </View>

        {[
          { key: 'L', target: 'Line · 直线', tip: '像铅笔直直拉出一条直线' },
          { key: 'C', target: 'Circle · 圆', tip: '画出一个圆滚滚的轮子或圆形观星窗' },
          { key: 'REC', target: 'Rectangle · 矩形', tip: '拼出长方形大积木地基或大门' },
          { key: 'PL', target: 'Polyline · 多段线', tip: '一笔连到底，拐弯也不会断开的线' },
          { key: 'A', target: 'Arc · 圆弧', tip: '画弯弯的彩虹、小拱桥和鼓起的帆' },
          { key: 'EL', target: 'Ellipse · 椭圆', tip: '像压扁的鸡蛋和飞碟一样' },
          { key: 'Space', target: '空格键 · 执行', tip: '敲完命令按它立刻生效' },
          { key: 'ESC', target: 'Escape · 取消', tip: '按错了敲它一键撤销重来' },
        ].map((item, idx) => (
          <View key={idx} style={styles.matchRow}>
            <View style={styles.matchKey}>
              <Text style={styles.matchText}>{item.key}</Text>
            </View>
            <View style={styles.matchDot} />
            <View style={{ flex: 1, marginHorizontal: 16 }} />
            <View style={styles.matchDot} />
            <View style={{ width: 190 }}>
              <Text style={{ fontSize: 9.5, fontFamily: 'Noto Sans SC Bold', color: '#2D3748' }}>
                {item.target}
              </Text>
              <Text style={{ fontSize: 7.5, color: '#718096' }}>{item.tip}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text>多米习题站 DUOMI Study · 打造最棒的儿童学习体验</Text>
          <Text>第 2 页 / 共 4 页</Text>
        </View>
      </Page>

      {/* ── 第 3 页：连线闯关纸 (第二弹：修改魔法与高级造型) ─ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.worksheetHeader}>
          <View>
            <Text style={styles.title}>CAD 快捷键大挑战 · 趣味连线纸 (第二弹)</Text>
            <Text style={styles.subtitle}>修改魔法篇：照镜子、小剪刀、搬家大师与橡皮擦！</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text>姓名: _________</Text>
            <Text>日期: _________</Text>
            <Text>得分: _____ / 100</Text>
          </View>
        </View>

        {[
          { key: 'MI', target: 'Mirror · 镜像/照镜子', tip: '照镜子魔法！右边对称自动变出来' },
          { key: 'TR', target: 'Trim · 修剪', tip: '拿小剪刀咔嚓剪掉交叉的多余线' },
          { key: 'CO', target: 'Copy · 复制', tip: '一秒变出两个一模一样的双胞胎窗户' },
          { key: 'M', target: 'Move · 移动', tip: '搬家大师，把图形搬到新的位置' },
          { key: 'RO', target: 'Rotate · 旋转', tip: '像大风车和摩天轮一样转动角度' },
          { key: 'O', target: 'Offset · 偏移', tip: '同心向外扩散一圈做双层防护墙' },
          { key: 'F', target: 'Fillet · 倒圆角', tip: '把尖锐扎手的直角磨成安全圆角' },
          { key: 'DLI', target: 'Dimension · 尺寸标注', tip: '掏出精密的工程直尺量一量长度' },
        ].map((item, idx) => (
          <View key={idx} style={styles.matchRow}>
            <View style={{ ...styles.matchKey, borderColor: '#2C7A7B' }}>
              <Text style={{ ...styles.matchText, color: '#2C7A7B' }}>{item.key}</Text>
            </View>
            <View style={styles.matchDot} />
            <View style={{ flex: 1, marginHorizontal: 16 }} />
            <View style={styles.matchDot} />
            <View style={{ width: 190 }}>
              <Text style={{ fontSize: 9.5, fontFamily: 'Noto Sans SC Bold', color: '#2D3748' }}>
                {item.target}
              </Text>
              <Text style={{ fontSize: 7.5, color: '#718096' }}>{item.tip}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text>多米习题站 DUOMI Study · 打造最棒的儿童学习体验</Text>
          <Text>第 3 页 / 共 4 页</Text>
        </View>
      </Page>

      {/* ── 第 4 页：大字母指法涂色与记忆卡 ───────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.worksheetHeader}>
          <View>
            <Text style={styles.title}>小小工程师 · CAD 快捷键大字母涂色卡</Text>
            <Text style={styles.subtitle}>拿起你的彩色画笔，给喜欢的快捷键涂上炫彩颜色吧！</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text>姓名: _________</Text>
            <Text>班级: 一年级</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
          {[
            { key: 'L', word: 'Line', meaning: '直线', desc: '直直的铅笔' },
            { key: 'C', word: 'Circle', meaning: '圆形', desc: '圆滚滚的车轮' },
            { key: 'REC', word: 'Rectangle', meaning: '长方形', desc: '大积木盒子' },
            { key: 'MI', word: 'Mirror', meaning: '镜像', desc: '照镜子对称' },
            { key: 'TR', word: 'Trim', meaning: '修剪', desc: '小剪刀咔嚓' },
            { key: 'CO', word: 'Copy', meaning: '复制', desc: '双胞胎变身' },
            { key: 'RO', word: 'Rotate', meaning: '旋转', desc: '大风车转转' },
            { key: 'O', word: 'Offset', meaning: '偏移', desc: '双层保护圈' },
            { key: 'E', word: 'Erase', meaning: '删除', desc: '橡皮擦擦掉' },
          ].map((item, idx) => (
            <View key={idx} style={styles.coloringCard}>
              <Text style={styles.bigOutlineLetter}>{item.key}</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Noto Sans SC Bold', color: '#1A202C' }}>
                {item.word}
              </Text>
              <Text style={{ fontSize: 8, color: '#3182CE' }}>{item.meaning}</Text>
              <Text style={{ fontSize: 7, color: '#718096', marginTop: 2 }}>
                {item.desc}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 10,
            padding: 8,
            backgroundColor: '#F7FAFC',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#CBD5E0',
          }}
        >
          <Text style={{ fontSize: 8.5, fontFamily: 'Noto Sans SC Bold', color: '#2B6CB0' }}>
            ★ 小工程师实战秘诀：
          </Text>
          <Text style={{ fontSize: 7.5, color: '#4A5568', marginTop: 2, lineHeight: 1.4 }}>
            在真正的 AutoCAD 软件中，左手放在键盘左侧（食指在 F 键，大拇指常驻空格键），右手拿着鼠标。听到老师或图纸需求，左手轻敲字母再拍空格，你就是班里最酷的电脑小达人！
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>多米习题站 DUOMI Study · 打造最棒的儿童学习体验</Text>
          <Text>第 4 页 / 共 4 页</Text>
        </View>
      </Page>
    </Document>
  );
}
