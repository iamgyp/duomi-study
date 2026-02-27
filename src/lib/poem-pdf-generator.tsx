import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { PoemExercise } from './poem-generator';

// Register Chinese font
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
    padding: 40,
    fontFamily: 'Noto Sans SC',
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
  // Poem Container
  poemContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  poemTitle: {
    fontSize: 14,
    fontFamily: 'Noto Sans SC Bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  poemAuthor: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  poemLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    fontSize: 13,
    lineHeight: 1.8,
  },
  textChar: {
    fontSize: 13,
    fontFamily: 'Noto Sans SC',
  },
  blankBox: {
    width: 20,
    height: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginHorizontal: 1,
  },
  answerChar: {
    fontSize: 13,
    fontFamily: 'Noto Sans SC Bold',
    color: '#d00',
    textDecoration: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
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
  // Answer Key Page
  answerKeyContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  answerKeyTitle: {
    fontSize: 12,
    fontFamily: 'Noto Sans SC Bold',
    marginBottom: 8,
  },
  answerKeyLine: {
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 1.6,
  },
});

// Steve Avatar SVG Component for PDF
const SteveAvatar = () => (
  <svg width="40" height="40" viewBox="0 0 8 8">
    <path d="M0 0h8v8H0z" fill="#F0A57C" />
    <path d="M0 0h8v2H0z" fill="#4A3020" />
    <path d="M0 2h1v1H0zM7 2h1v1H7z" fill="#4A3020" />
    <path d="M1 3h2v1H1zM5 3h2v1H5z" fill="#FFFFFF" />
    <path d="M2 3h1v1H2zM6 3h1v1H6z" fill="#3B82F6" />
    <path d="M3 4h2v1H3z" fill="#B87850" />
    <path d="M2 6h4v1H2z" fill="#8B4513" />
  </svg>
);

export const PoemPdfDocument = ({
  exercises,
  title = '古诗填空',
  difficulty = 1,
  showAnswers = false,
}: {
  exercises: PoemExercise[];
  title?: string;
  difficulty?: number;
  showAnswers?: boolean;
}) => {
  const difficultyLabel =
    difficulty === 1 ? '⭐ Basic' : difficulty === 2 ? '⭐⭐ Intermediate' : '⭐⭐⭐ Advanced';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <SteveAvatar />
            <View>
              <Text style={styles.title}>DUOMI CHINESE - POEMS</Text>
              <Text style={styles.subtitle}>
                {difficultyLabel} · {exercises.length} Poems
              </Text>
            </View>
          </View>
          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>Name: ______________________</Text>
            <Text style={styles.metaText}>Score: _________ / {exercises.length}</Text>
          </View>
        </View>

        {/* Poems */}
        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.poemContainer} wrap={false}>
            <Text style={styles.poemTitle}>{exercise.poem.title}</Text>
            <Text style={styles.poemAuthor}>
              【{exercise.poem.dynasty}】{exercise.poem.author}
            </Text>
            
            {exercise.poem.lines.map((line, lineIndex) => (
              <View key={lineIndex} style={styles.poemLine} wrap={false}>
                {line.text.split('').map((char, charIndex) => {
                  const isBlank = line.blanks.includes(charIndex);
                  if (isBlank && exercise.showAnswers) {
                    return (
                      <Text key={charIndex} style={styles.answerChar}>
                        {char}
                      </Text>
                    );
                  } else if (isBlank) {
                    return <View key={charIndex} style={styles.blankBox} />;
                  } else {
                    return (
                      <Text key={charIndex} style={styles.textChar}>
                        {char}
                      </Text>
                    );
                  }
                })}
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.footerText, { marginLeft: 5 }]}>
              Duomi Study - Classical Poetry Practice
            </Text>
          </View>
          <Text style={styles.pageNumber}>Page 1</Text>
        </View>
      </Page>

      {/* Answer Key Page (if answers are enabled) */}
      {showAnswers && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SteveAvatar />
              <Text style={styles.title}>ANSWER KEY</Text>
            </View>
            <Text style={{ fontSize: 10, color: '#999' }}>For {title}</Text>
          </View>

          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.answerKeyContainer} wrap={false}>
              <Text style={styles.answerKeyTitle}>
                {index + 1}. {exercise.poem.title} - 【{exercise.poem.dynasty}】{exercise.poem.author}
              </Text>
              {exercise.poem.lines.map((line, lineIndex) => (
                <Text key={lineIndex} style={styles.answerKeyLine}>
                  {line.text}
                </Text>
              ))}
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Answer Key for Classical Poetry</Text>
            <Text style={styles.pageNumber}>Page 2</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};
