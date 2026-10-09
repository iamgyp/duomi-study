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
    padding: 30,
    fontFamily: 'Noto Sans SC',
    fontSize: 10,
    color: '#1A202C',
    backgroundColor: '#FFFFFF',
  },
  // ── 页眉 ─────────────────────────────────────────
  header: {
    borderBottomWidth: 3,
    borderBottomColor: '#2B6CB0',
    paddingBottom: 8,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2B6CB0',
  },
  subtitle: {
    fontSize: 9,
    color: '#4A5568',
    marginTop: 2,
  },
  meta: {
    fontSize: 9,
    color: '#718096',
    textAlign: 'right',
  },

  // ── 法宝提示条 ───────────────────────────────────
  ruleBanner: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1.5,
    borderColor: '#3182CE',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ruleText: {
    fontSize: 9.5,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2B6CB0',
  },

  // ── 分类标题 ─────────────────────────────────────
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2D3748',
    backgroundColor: '#EDF2F7',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 8,
    marginTop: 4,
  },

  // ── 快捷键网格 ───────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  card: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 6,
    padding: 6,
    backgroundColor: '#F7FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyBadge: {
    width: 48,
    height: 38,
    backgroundColor: '#2B6CB0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Noto Sans SC Bold',
  },
  keySubText: {
    color: '#BEE3F8',
    fontSize: 6.5,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2D3748',
  },
  cardTip: {
    fontSize: 7.5,
    color: '#718096',
    marginTop: 2,
  },

  // ── 页脚 ─────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#A0AEC0',
  },

  // ── 连线练习页样式 ───────────────────────────────
  worksheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#3182CE',
    paddingBottom: 8,
  },
  studentInfo: {
    flexDirection: 'row',
    gap: 20,
    fontSize: 10,
    marginTop: 4,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  matchKey: {
    width: 60,
    height: 30,
    borderWidth: 1.5,
    borderColor: '#3182CE',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchText: {
    fontSize: 11,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2B6CB0',
  },
  matchDesc: {
    fontSize: 10,
    color: '#4A5568',
  },
  matchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#718096',
  },
});

export function CadCheatSheetPdfDocument() {
  const drawCommands = CAD_COMMANDS.filter((c) => c.category === 'draw');
  const modifyCommands = CAD_COMMANDS.filter((c) => c.category === 'modify');
  const controlCommands = CAD_COMMANDS.filter((c) => c.category === 'control');

  return (
    <Document>
      {/* ── 第 1 页：桌面速查手卡 ─────────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>AutoCAD 小小建筑师 · 常用快捷键速查卡</Text>
            <Text style={styles.subtitle}>
              多米习题站 (DUOMI Study) · 一年级专属桌面速查指南
            </Text>
          </View>
          <View>
            <Text style={styles.meta}>贴在电脑旁随时看</Text>
            <Text style={styles.meta}>培养标准肌肉记忆</Text>
          </View>
        </View>

        {/* 核心操作法宝 */}
        <View style={styles.ruleBanner}>
          <Text style={styles.ruleText}>
            ★ 核心法宝：敲完字母，左手大拇指轻拍【空格键】执行！
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

        {/* 必备控制键 */}
        <Text style={styles.sectionTitle}>三、 必备控制键 (Control Keys)</Text>
        <View style={styles.grid}>
          {controlCommands.map((c) => (
            <View key={c.key} style={styles.card}>
              <View style={{ ...styles.keyBadge, backgroundColor: '#DD6B20' }}>
                <Text style={styles.keyText}>{c.key}</Text>
                <Text style={styles.keySubText}>直接按</Text>
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
          <Text>第 1 页 / 共 2 页</Text>
        </View>
      </Page>

      {/* ── 第 2 页：连线闯关练习纸 ───────────────────────── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.worksheetHeader}>
          <View>
            <Text style={styles.title}>CAD 快捷键大挑战 · 趣味连线纸</Text>
            <Text style={styles.subtitle}>拿起铅笔，把快捷键和它们神奇的功能连起来吧！</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text>姓名: _________</Text>
            <Text>日期: _________</Text>
            <Text>得分: _____ / 100</Text>
          </View>
        </View>

        {/* 连线题列表 */}
        {[
          { key: 'L', target: 'Line · 直线', tip: '像铅笔直直拉出一条直线' },
          { key: 'C', target: 'Circle · 圆', tip: '画出一个圆滚滚的轮子或窗户' },
          { key: 'REC', target: 'Rectangle · 矩形', tip: '拼出长方形大积木地基' },
          { key: 'E', target: 'Erase · 删除/橡皮', tip: '像橡皮擦一样擦掉画错的线条' },
          { key: 'CO', target: 'Copy · 复制', tip: '一秒变出两个一模一样的窗户' },
          { key: 'TR', target: 'Trim · 修剪', tip: '拿小剪刀咔嚓剪掉交叉的多余线' },
          { key: 'RO', target: 'Rotate · 旋转', tip: '像大风车一样转动角度' },
          { key: 'Space', target: '空格键 · 执行', tip: '敲完命令按它立刻生效' },
        ].map((item, idx) => (
          <View key={idx} style={styles.matchRow}>
            {/* 左边：快捷键 */}
            <View style={styles.matchKey}>
              <Text style={styles.matchText}>{item.key}</Text>
            </View>
            <View style={styles.matchDot} />

            {/* 中间留白给孩子连线 */}
            <View style={{ flex: 1, marginHorizontal: 20 }} />

            {/* 右边：目标说明 */}
            <View style={styles.matchDot} />
            <View style={{ width: 180 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Noto Sans SC Bold', color: '#2D3748' }}>
                {item.target}
              </Text>
              <Text style={{ fontSize: 8, color: '#718096' }}>{item.tip}</Text>
            </View>
          </View>
        ))}

        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#F7FAFC', borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ fontSize: 9, fontFamily: 'Noto Sans SC Bold', color: '#4A5568', marginBottom: 4 }}>
            ★ 小小挑战：请在电脑打开 AutoCAD 实际试一试！
          </Text>
          <Text style={{ fontSize: 8, color: '#718096', lineHeight: 1.4 }}>
            请在 AutoCAD 屏幕上依次敲入：REC 空格（画个方块），然后敲 C 空格（画个圆）。看看是不是真的成功了！
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>多米习题站 DUOMI Study · 打造最棒的儿童学习体验</Text>
          <Text>第 2 页 / 共 2 页</Text>
        </View>
      </Page>
    </Document>
  );
}
