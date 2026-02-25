import { Document, Page, Text, View, StyleSheet, Svg, Line, Path } from '@react-pdf/renderer';
import { MathQuestion } from './math-generator';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: '#333',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
    height: 80,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000',
    // fontFamily: 'PixelFont', // Ideally
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginLeft: 10,
    marginTop: 4,
  },
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    paddingLeft: 15,
  },
  metaText: {
    fontSize: 10,
    marginBottom: 6,
    color: '#444',
  },
  
  // Grid Layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  questionBlock: {
    width: '48%', 
    height: 60,   
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fafafa', // Slight background to mimic paper/block
    borderRadius: 4,
    padding: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  index: {
    width: 25,
    paddingTop: 4,
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  expressionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  
  // Numbers
  numContainer: {
    width: 35,
    alignItems: 'center',
    position: 'relative',
    height: 48,
  },
  numText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  operator: {
    fontSize: 18,
    width: 20,
    textAlign: 'center',
    paddingTop: 0,
    color: '#555',
  },
  equals: {
    fontSize: 18,
    width: 20,
    textAlign: 'center',
    paddingTop: 0,
    color: '#555',
  },
  answerLine: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    height: 18, 
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  answerText: {
    color: '#d00', 
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },

  // Decomposition Visuals
  decompSvg: {
    position: 'absolute',
    top: 20, 
    left: -2, 
    width: 40, 
    height: 25,
  },
  decompNumLeft: {
    position: 'absolute',
    top: 36,
    left: -2,
    width: 15,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  decompNumRight: {
    position: 'absolute',
    top: 36,
    right: -2,
    width: 15,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#888',
  },
  pageNumber: {
    fontSize: 9,
    color: '#000',
    fontWeight: 'bold',
  }
});

// Steve Avatar SVG Component for PDF
const SteveAvatar = () => (
  <Svg width="50" height="50" viewBox="0 0 8 8">
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
const GrassBlock = () => (
  <Svg width="20" height="20" viewBox="0 0 16 16">
    <Path d="M0 0h16v16H0z" fill="#795548" /> {/* Dirt */}
    <Path d="M0 0h16v4H0z" fill="#4CAF50" />   {/* Grass Top */}
    <Path d="M0 4h2v2H0zM3 4h2v3H3zM6 4h2v1H6zM9 4h2v2H9zM12 4h2v3H12zM15 4h1v1H15z" fill="#4CAF50" /> {/* Grass dripping */}
  </Svg>
);

export const MathPdfDocument = ({ questions, title = 'Math Worksheet', withAnswers = false }: { questions: MathQuestion[], title?: string, withAnswers?: boolean }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header with Avatar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
           <SteveAvatar />
           <View>
              <Text style={styles.title}>DUOMI STUDY</Text>
              <Text style={styles.subtitle}>{title}</Text>
           </View>
        </View>
        
        <View style={styles.metaContainer}>
           <Text style={styles.metaText}>Name: ______________________</Text>
           <Text style={styles.metaText}>Date: ______________________</Text>
           <Text style={styles.metaText}>Score: _________ / {questions.length}</Text>
        </View>
      </View>

      {/* Questions Grid */}
      <View style={styles.grid}>
        {questions.map((q, i) => (
          <View key={q.id} style={styles.questionBlock} wrap={false}>
            <Text style={styles.index}>{i + 1}.</Text>
            
            <View style={styles.expressionRow}>
              {/* Number 1 */}
              <View style={styles.numContainer}>
                <Text style={styles.numText}>{q.num1}</Text>
                {/* Take-Ten: Split Num1 */}
                {q.decomposition && q.operator === '-' && (
                  <View style={{ position: 'absolute', top: 0, left: 0, width: 35, height: 60 }}>
                    <Svg style={styles.decompSvg}>
                      <Line x1="18" y1="0" x2="6" y2="20" stroke="#999" strokeWidth={1} />
                      <Line x1="18" y1="0" x2="30" y2="20" stroke="#999" strokeWidth={1} />
                    </Svg>
                    <Text style={styles.decompNumLeft}>{q.decomposition.part1}</Text>
                    <Text style={styles.decompNumRight}>{q.decomposition.part2}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.operator}>{q.operator}</Text>

              {/* Number 2 */}
              <View style={styles.numContainer}>
                <Text style={styles.numText}>{q.num2}</Text>
                {/* Make-Ten: Split Num2 */}
                {q.decomposition && q.operator === '+' && (
                  <View style={{ position: 'absolute', top: 0, left: 0, width: 35, height: 60 }}>
                    <Svg style={styles.decompSvg}>
                      <Line x1="18" y1="0" x2="6" y2="20" stroke="#999" strokeWidth={1} />
                      <Line x1="18" y1="0" x2="30" y2="20" stroke="#999" strokeWidth={1} />
                    </Svg>
                    <Text style={styles.decompNumLeft}>{q.decomposition.part1}</Text>
                    <Text style={styles.decompNumRight}>{q.decomposition.part2}</Text>
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
            <GrassBlock />
            <Text style={[styles.footerText, { marginLeft: 5 }]}>Duomi Study - Level Up Your Brain!</Text>
         </View>
         <Text style={styles.pageNumber}>Page 1</Text>
      </View>
    </Page>

    {/* Answer Key Page */}
    {withAnswers && (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
             <SteveAvatar />
             <Text style={styles.title}>ANSWER KEY</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#999' }}>For {title}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {questions.map((q, i) => (
            <View key={q.id} style={{ width: '20%', marginBottom: 15 }}>
              <Text style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>{i+1}.</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{q.answer}</Text>
            </View>
          ))}
        </View>
      </Page>
    )}
  </Document>
);
