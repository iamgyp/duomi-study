import { Document, Page, Text, View, StyleSheet, Font, Svg, Line, Path } from '@react-pdf/renderer';

// Register standard fonts
// We need a font that supports Chinese. 
// Ideally we bundle a font. Since we can't easily upload one, let's try to use a standard one if the system has it,
// or use a Google Font URL.
// Noto Serif SC is good.

// Font.register({
//   family: 'Noto Serif SC',
//   src: 'https://fonts.gstatic.com/s/notoserifsc/v12/H4ckBXKAlMnTn0CskyY6wr-dq0tbJisiEWd3.ttf'
// });

// Fallback: Use standard font (Helvetica) which doesn't support Chinese characters (will show empty squares),
// BUT it won't crash.
// To fix Chinese characters, we really need a local font file in public/ folder.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica', 
    fontSize: 12,
    color: '#333',
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
    marginLeft: 10,
    color: '#000',
    fontWeight: 'bold', // Font might not support bold
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 0, 
  },
  charBoxContainer: {
    width: 65, // slightly more than 60 for spacing
    height: 85, 
    marginBottom: 10,
    alignItems: 'center',
    // border: '1px solid blue', // debug
  },
  pinyinText: {
    height: 15,
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Helvetica', // Pinyin is usually english letters + tones, Helvetica is safer
  },
  gridBox: {
    width: 60,
    height: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  charText: {
    fontSize: 42, // Large enough to fill the box
    marginTop: -4, // Optical adjustment
    textAlign: 'center',
    width: 60,
    height: 60,
    lineHeight: 60, // Ensure vertical center roughly
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

// Steve Avatar (Reused)
const SteveAvatar = () => (
  <Svg width="50" height="50" viewBox="0 0 8 8">
     <Path d="M0 0h8v8H0z" fill="#F0A57C" />
     <Path d="M0 0h8v2H0z" fill="#4A3020" />
     <Path d="M0 2h1v1H0zM7 2h1v1H7z" fill="#4A3020" />
     <Path d="M1 3h2v1H1zM5 3h2v1H5z" fill="#FFFFFF" />
     <Path d="M2 3h1v1H2zM6 3h1v1H6z" fill="#3B82F6" />
     <Path d="M3 4h2v1H3z" fill="#B87850" /> 
     <Path d="M2 6h4v1H2z" fill="#8B4513" />
  </Svg>
);

// Grass Block (Reused)
const GrassBlock = () => (
  <Svg width="20" height="20" viewBox="0 0 16 16">
    <Path d="M0 0h16v16H0z" fill="#795548" /> 
    <Path d="M0 0h16v4H0z" fill="#4CAF50" />   
    <Path d="M0 4h2v2H0zM3 4h2v3H3zM6 4h2v1H6zM9 4h2v2H9zM12 4h2v3H12zM15 4h1v1H15z" fill="#4CAF50" /> 
  </Svg>
);

// Grids
const TianGridSvg = () => (
  <Svg width="60" height="60" style={{ position: 'absolute', top: 0, left: 0 }}>
     <Line x1="0" y1="0" x2="60" y2="0" stroke="#e11d48" strokeWidth={1} />
     <Line x1="60" y1="0" x2="60" y2="60" stroke="#e11d48" strokeWidth={1} />
     <Line x1="60" y1="60" x2="0" y2="60" stroke="#e11d48" strokeWidth={1} />
     <Line x1="0" y1="60" x2="0" y2="0" stroke="#e11d48" strokeWidth={1} />
     <Line x1="0" y1="30" x2="60" y2="30" stroke="#fda4af" strokeWidth={0.5} strokeDasharray="2 2" />
     <Line x1="30" y1="0" x2="30" y2="60" stroke="#fda4af" strokeWidth={0.5} strokeDasharray="2 2" />
  </Svg>
);

const MiGridSvg = () => (
  <Svg width="60" height="60" style={{ position: 'absolute', top: 0, left: 0 }}>
     <Line x1="0" y1="0" x2="60" y2="0" stroke="#e11d48" strokeWidth={1} />
     <Line x1="60" y1="0" x2="60" y2="60" stroke="#e11d48" strokeWidth={1} />
     <Line x1="60" y1="60" x2="0" y2="60" stroke="#e11d48" strokeWidth={1} />
     <Line x1="0" y1="60" x2="0" y2="0" stroke="#e11d48" strokeWidth={1} />
     <Line x1="0" y1="30" x2="60" y2="30" stroke="#fda4af" strokeWidth={0.5} strokeDasharray="2 2" />
     <Line x1="30" y1="0" x2="30" y2="60" stroke="#fda4af" strokeWidth={0.5} strokeDasharray="2 2" />
     <Line x1="0" y1="0" x2="60" y2="60" stroke="#fda4af" strokeWidth={0.5} strokeDasharray="2 2" />
     <Line x1="60" y1="0" x2="0" y2="60" stroke="#fda4af" strokeWidth={0.5} strokeDasharray="2 2" />
  </Svg>
);

interface ChinesePdfProps {
  chars: { char: string; pinyin: string }[];
  config: { gridType: string; showPinyin: boolean; mode: string; color: string };
  title?: string;
}

export const ChinesePdfDocument = ({ chars, config, title = 'Chinese Writing' }: ChinesePdfProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
           <View style={styles.headerLeft}>
              <SteveAvatar />
              <View>
                  <Text style={styles.title}>DUOMI CHINESE</Text>
                  <Text style={{ fontSize: 10, color: '#666', marginLeft: 10, marginTop: 4 }}>Writing Practice</Text>
              </View>
           </View>
           <View style={styles.metaContainer}>
              <Text style={styles.metaText}>Name: ______________________</Text>
              <Text style={styles.metaText}>Date: ______________________</Text>
           </View>
        </View>

        {/* Grid Content */}
        <View style={styles.row}>
            {chars.map((c, i) => (
                <View key={i} style={styles.charBoxContainer}>
                    {/* Pinyin */}
                    {config.showPinyin && (
                        <Text style={styles.pinyinText}>{c.pinyin}</Text>
                    )}
                    
                    {/* Box */}
                    <View style={styles.gridBox}>
                        {config.gridType === 'mi' ? <MiGridSvg /> : <TianGridSvg />}
                        <Text style={[styles.charText, { color: config.color }]}>
                            {c.char}
                        </Text>
                    </View>
                </View>
            ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <GrassBlock />
              <Text style={[styles.footerText, { marginLeft: 5 }]}>Duomi Study - Craft Your Words!</Text>
           </View>
           <Text style={styles.pageNumber}>Page 1</Text>
        </View>

      </Page>
    </Document>
  );
};
