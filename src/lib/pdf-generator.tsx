/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Svg, Line, Path, Image, Font } from '@react-pdf/renderer';
import { MathQuestion } from './math-generator';
import { AlgebraQuestion, McItem, getItemDisplayName, getCurrencySymbol } from './algebra-generator';

// Register Chinese font (Noto Sans SC)
Font.register({
  family: 'Noto Sans SC',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.0/files/noto-sans-sc-chinese-simplified-400-normal.woff',
});

// Register bold Chinese font as separate family
Font.register({
  family: 'Noto Sans SC Bold',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.0/files/noto-sans-sc-chinese-simplified-700-normal.woff',
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 24,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#222',
    paddingBottom: 6,
    height: 44,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginLeft: 8,
    color: '#000',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 8,
    color: '#666',
    marginLeft: 8,
    marginTop: 2,
  },
  metaContainer: {
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    paddingLeft: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  metaText: {
    fontSize: 8,
    color: '#444',
    marginLeft: 10,
  },
  
  // 50 Questions Grid Layout (5 columns x 10 rows)
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  questionBlock: {
    width: '19.2%', 
    height: 56,   
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fafafa',
    borderRadius: 3,
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 4,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  index: {
    width: 15,
    paddingTop: 1,
    color: '#888',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  expressionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  
  // Numbers & Operators
  numContainer: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
    height: 44,
  },
  numText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111',
  },
  operator: {
    fontSize: 11,
    width: 9,
    textAlign: 'center',
    paddingTop: 0,
    color: '#444',
  },
  equals: {
    fontSize: 11,
    width: 8,
    textAlign: 'center',
    paddingTop: 0,
    color: '#444',
  },
  answerLine: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    height: 14, 
    marginLeft: 3,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  answerText: {
    color: '#d00', 
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1,
  },

  // Decomposition Visuals
  decompContainer: {
    position: 'absolute',
    top: 13,
    left: -2,
    width: 24,
    alignItems: 'center',
  },
  decompSvg: {
    width: 24,
    height: 12,
  },
  decompNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 24,
    marginTop: 1,
  },
  decompNumLeft: {
    fontSize: 6.5,
    color: '#555',
    textAlign: 'center',
    width: 11,
  },
  decompNumRight: {
    fontSize: 6.5,
    color: '#555',
    textAlign: 'center',
    width: 11,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#888',
  },
  pageNumber: {
    fontSize: 8,
    color: '#222',
    fontFamily: 'Helvetica-Bold',
  },

  // Answer Key Page Styles
  answerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  answerBlock: {
    width: '19.2%',
    height: 24,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 2,
    paddingHorizontal: 4,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  answerIndex: {
    fontSize: 7.5,
    color: '#64748b',
    width: 16,
    fontFamily: 'Helvetica-Bold',
  },
  answerEquation: {
    fontSize: 8.5,
    color: '#334155',
    marginRight: 2,
  },
  answerValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
    marginLeft: 'auto',
  },
});

// Steve Avatar SVG Component for PDF
const SteveAvatar = ({ size = 34 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 8 8">
     {/* Face Background */}
     <Path d="M0 0h8v8H0z" fill="#F0A57C" />
     {/* Hair */}
     <Path d="M0 0h8v2H0z" fill="#4A3020" />
     <Path d="M0 2h1v1H0zM7 2h1v1H7z" fill="#4A3020" />
     {/* Eyes */}
     <Path d="M1 3h2v1H1zM5 3h2v1H5z" fill="#FFFFFF" />
     <Path d="M2 3h1v1H2zM6 3h1v1H6z" fill="#3B82F6" />
     {/* Mouth/Nose Area */}
     <Path d="M3 4h2v1H3z" fill="#B87850" /> 
     <Path d="M2 6h4v1H2z" fill="#8B4513" />
  </Svg>
);

// Grass Block SVG for Footer
const GrassBlock = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path d="M0 0h16v16H0z" fill="#795548" /> {/* Dirt */}
    <Path d="M0 0h16v4H0z" fill="#4CAF50" />   {/* Grass Top */}
    <Path d="M0 4h2v2H0zM3 4h2v3H3zM6 4h2v1H6zM9 4h2v2H9zM12 4h2v3H12zM15 4h1v1H15z" fill="#4CAF50" /> {/* Grass dripping */}
  </Svg>
);

const QUESTIONS_PER_PAGE = 50;

function chunkQuestions<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks.length > 0 ? chunks : [[]];
}

export const MathPdfDocument = ({ questions, title = 'Math Worksheet', withAnswers = false }: { questions: MathQuestion[], title?: string, withAnswers?: boolean }) => {
  const questionPages = chunkQuestions(questions, QUESTIONS_PER_PAGE);
  const totalQuestionPages = questionPages.length;

  return (
    <Document>
      {questionPages.map((pageQuestions, pageIdx) => {
        const startNumber = pageIdx * QUESTIONS_PER_PAGE;
        return (
          <Page key={pageIdx} size="A4" style={styles.page}>
            {/* Header with Avatar */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <SteveAvatar size={34} />
                <View>
                  <Text style={styles.title}>DUOMI STUDY</Text>
                  <Text style={styles.subtitle}>{title}</Text>
                </View>
              </View>

              <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Name: ________________</Text>
                  <Text style={styles.metaText}>Date: ________________</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Time: ________________</Text>
                  <Text style={styles.metaText}>Score: ________ / {pageQuestions.length}</Text>
                </View>
              </View>
            </View>

            {/* Questions Grid */}
            <View style={styles.grid}>
              {pageQuestions.map((q, i) => (
                <View key={q.id} style={styles.questionBlock} wrap={false}>
                  <Text style={styles.index}>{startNumber + i + 1}.</Text>

                  <View style={styles.expressionRow}>
                    {/* Number 1 */}
                    <View style={styles.numContainer}>
                      <Text style={styles.numText}>{q.num1}</Text>
                      {/* Take-Ten: Split Num1 */}
                      {q.decomposition && q.operator === '-' && (
                        <View style={styles.decompContainer}>
                          <Svg style={styles.decompSvg} viewBox="0 0 24 12">
                            <Line x1="12" y1="0" x2="4" y2="11" stroke="#888" strokeWidth={1} />
                            <Line x1="12" y1="0" x2="20" y2="11" stroke="#888" strokeWidth={1} />
                          </Svg>
                          <View style={styles.decompNumbers}>
                            <Text style={styles.decompNumLeft}>{q.decomposition.part1}</Text>
                            <Text style={styles.decompNumRight}>{q.decomposition.part2}</Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <Text style={styles.operator}>{q.operator}</Text>

                    {/* Number 2 */}
                    <View style={styles.numContainer}>
                      <Text style={styles.numText}>{q.num2}</Text>
                      {/* Make-Ten: Split Num2 */}
                      {q.decomposition && q.operator === '+' && (
                        <View style={styles.decompContainer}>
                          <Svg style={styles.decompSvg} viewBox="0 0 24 12">
                            <Line x1="12" y1="0" x2="4" y2="11" stroke="#888" strokeWidth={1} />
                            <Line x1="12" y1="0" x2="20" y2="11" stroke="#888" strokeWidth={1} />
                          </Svg>
                          <View style={styles.decompNumbers}>
                            <Text style={styles.decompNumLeft}>{q.decomposition.part1}</Text>
                            <Text style={styles.decompNumRight}>{q.decomposition.part2}</Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <Text style={styles.equals}>=</Text>

                    {/* Answer Area */}
                    <View style={styles.answerLine}>
                      {withAnswers ? (
                        <Text style={styles.answerText}>{q.answer}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <GrassBlock size={14} />
                <Text style={[styles.footerText, { marginLeft: 5 }]}>Duomi Study - Level Up Your Brain!</Text>
              </View>
              <Text style={styles.pageNumber}>Page {pageIdx + 1} / {totalQuestionPages}</Text>
            </View>
          </Page>
        );
      })}

      {/* Answer Key Page */}
      {withAnswers && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SteveAvatar size={34} />
              <View>
                <Text style={styles.title}>ANSWER KEY</Text>
                <Text style={styles.subtitle}>Reference Answers · {title}</Text>
              </View>
            </View>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>Total Questions: {questions.length}</Text>
            </View>
          </View>

          <View style={styles.answerGrid}>
            {questions.map((q, i) => (
              <View key={q.id} style={styles.answerBlock} wrap={false}>
                <Text style={styles.answerIndex}>{i + 1}.</Text>
                <Text style={styles.answerEquation}>{q.num1} {q.operator} {q.num2} =</Text>
                <Text style={styles.answerValue}>{q.answer}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <GrassBlock size={14} />
              <Text style={[styles.footerText, { marginLeft: 5 }]}>Duomi Study - Level Up Your Brain!</Text>
            </View>
            <Text style={styles.pageNumber}>Answer Key</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

// Algebra PDF Styles
const algebraStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Noto Sans SC',
    fontSize: 11,
    color: '#333',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
    height: 70,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Noto Sans SC Bold',
    marginLeft: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 9,
    color: '#666',
    marginLeft: 10,
    marginTop: 3,
  },
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    paddingLeft: 15,
  },
  metaText: {
    fontSize: 9,
    marginBottom: 4,
    color: '#444',
  },
  // Item Price List
  priceListContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap', // 强制不换行
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  priceListLabel: {
    fontSize: 7,
    fontFamily: 'Noto Sans SC Bold',
    color: '#666',
    marginRight: 4,
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 3,
  },
  priceItemEmoji: {
    width: 10,
    height: 10,
    marginRight: 2,
  },
  priceItemName: {
    fontSize: 6,
    fontFamily: 'Noto Sans SC Bold',
    color: '#333',
    marginRight: 2,
  },
  priceItemEquals: {
    fontSize: 6,
    color: '#666',
    marginRight: 2,
  },
  priceItemPrice: {
    fontSize: 7,
    fontFamily: 'Noto Sans SC Bold',
    color: '#2e7d32',
  },
  // Question Set Container
  questionSet: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fafafa',
    marginBottom: 12,
  },
  // Question Row
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  questionIndex: {
    width: 20,
    fontSize: 10,
    color: '#888',
    fontFamily: 'Noto Sans SC Bold',
  },
  questionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  itemGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemEmoji: {
    width: 16,
    height: 16,
    marginRight: 3,
  },
  itemMultiplier: {
    fontSize: 9,
    color: '#666',
    marginRight: 6,
  },
  operator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 3,
  },
  equals: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 3,
  },
  answerBox: {
    width: 50,
    height: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f9f9f9',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#999',
  },
  pageNumber: {
    fontSize: 8,
    color: '#666',
    fontWeight: 'bold',
  },
});

// Item icon path helper - uses absolute path for PDF generation
const getItemIconPath = (iconFilename: string) => {
  // For PDF generation, we need absolute paths or data URLs
  // This assumes icons are in public/items/ folder
  const iconPath = `/items/${iconFilename}`;
  return iconPath;
};

export const AlgebraPdfDocument = ({
  questions,
  itemSets,
  difficulty = 2,
  language = 'zh',
}: {
  questions: AlgebraQuestion[];
  itemSets: McItem[][];
  title?: string;
  difficulty?: number;
  language?: 'zh' | 'en';
}) => {
  const difficultyLabel =
    difficulty === 1 ? '⭐ Basic' : difficulty === 2 ? '⭐⭐ Intermediate' : '⭐⭐⭐ Advanced';
  const priceListLabel = language === 'zh' ? '💰 价格表：' : '💰 Price List:';
  const currency = getCurrencySymbol(language);
  
  return (
    <Document>
      <Page size="A4" style={algebraStyles.page}>
        {/* Header */}
        <View style={algebraStyles.header}>
          <View style={algebraStyles.headerLeft}>
            <SteveAvatar />
            <View>
              <Text style={algebraStyles.title}>DUOMI ALGEBRA</Text>
              <Text style={algebraStyles.subtitle}>
                {difficultyLabel} · {questions.length} Questions
              </Text>
            </View>
          </View>
          <View style={algebraStyles.metaContainer}>
            <Text style={algebraStyles.metaText}>Name: ______________________</Text>
            <Text style={algebraStyles.metaText}>Score: _________ / {questions.length}</Text>
          </View>
        </View>

        {/* Questions by Set */}
        {itemSets.map((itemSet, setIndex) => {
          const setQuestions = questions.slice(setIndex * 5, (setIndex + 1) * 5);
          if (setQuestions.length === 0) return null;

          return (
            <View key={setIndex} style={algebraStyles.questionSet} wrap={false}>
              {/* Price List for this set */}
              <View style={algebraStyles.priceListContainer}>
                <Text style={algebraStyles.priceListLabel}>{priceListLabel}</Text>
                {itemSet.map((item) => {
                  const displayName = getItemDisplayName(item, language);
                  // 使用简短名称（英文时去掉材质前缀）
                  const shortName = language === 'en' 
                    ? displayName.replace('Iron ', '').replace('Wood ', '').replace('Stone ', '').replace('Gold ', '').replace('Diamond ', '').replace('Cooked ', '')
                    : displayName;
                  
                  return (
                    <View key={item.id} style={algebraStyles.priceItem}>
                      <Image
                        style={algebraStyles.priceItemEmoji}
                        src={getItemIconPath(item.icon)}
                      />
                      <Text style={algebraStyles.priceItemName}>{shortName}</Text>
                      <Text style={algebraStyles.priceItemEquals}>=</Text>
                      <Text style={algebraStyles.priceItemPrice}>{item.price}{currency}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Questions Grid (2 columns) */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {setQuestions.map((q, i) => {
                  const globalIndex = setIndex * 5 + i;
                  return (
                    <View
                      key={q.id}
                      style={{
                        width: '48%',
                        ...algebraStyles.questionRow,
                      }}
                      wrap={false}
                    >
                      <Text style={algebraStyles.questionIndex}>{globalIndex + 1}.</Text>
                      <View style={algebraStyles.questionContent}>
                        {q.items.map((itemData, idx) => (
                          <View key={itemData.item.id} style={algebraStyles.itemGroup}>
                            <Image
                              style={algebraStyles.itemEmoji}
                              src={getItemIconPath(itemData.item.icon)}
                            />
                            <Text style={algebraStyles.itemMultiplier}>× {itemData.quantity}</Text>
                            {idx < q.items.length - 1 && (
                              <Text style={algebraStyles.operator}>+</Text>
                            )}
                          </View>
                        ))}
                        <Text style={algebraStyles.equals}>=</Text>
                        <View style={algebraStyles.answerBox} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={algebraStyles.footer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GrassBlock />
            <Text style={[algebraStyles.footerText, { marginLeft: 5 }]}>
              Duomi Study - Shop Smart!
            </Text>
          </View>
          <Text style={algebraStyles.pageNumber}>Page 1</Text>
        </View>
      </Page>
    </Document>
  );
};
