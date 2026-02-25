import { Document, Page, Text, View, StyleSheet, Font, Svg, Line, Path } from '@react-pdf/renderer';

// Register standard fonts
// We need a font that looks handwritten or rounded for kids.
// Helvetica is the standard sans-serif. 
// Ideally we would use "Comic Sans" or "Schoolbell" but we are limited.
// Helvetica is fine for now.

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
    fontWeight: 'bold', 
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
  
  // Content
  contentContainer: {
    flexDirection: 'column',
    gap: 10, // Space between rows
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
    // height: 60, // Avoid fixed height to let content flow
  },
  index: {
    width: 30,
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginRight: 10,
  },
  writingArea: {
    flex: 1,
    height: 60, // Fixed height for grid
    position: 'relative',
    // border: '1px solid #eee', // debug
  },
  
  // Text Overlay
  textLayer: {
    position: 'absolute',
    top: 6, // Adjust based on font metrics vs grid lines
    left: 10,
    fontSize: 34,
    // color: '#ccc', // Trace color via props
    letterSpacing: 5,
    fontFamily: 'Helvetica', // Standard font
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

// Four-Line Grid SVG
// Height 60. 
// Top: 0, Middle-Top: 20, Middle-Bottom: 40, Bottom: 60
// Typically:
// Ascender Line (Top) - often red or black - 0
// Mid Line (Waist) - dashed - 20
// Base Line (Base) - often red or black - 40
// Descender Line (Bottom) - dashed - 60
// But fonts sit on Baseline. 
// Let's adjust for 34px font size.
// Ascender: 10
// Waist: 24
// Base: 46
// Descender: 60
const FourLineGrid = () => (
  <Svg height="60" width="500" style={{ position: 'absolute', top: 0, left: 0 }}>
     {/* Ascender Line (Top) */}
     <Line x1="0" y1="10" x2="500" y2="10" stroke="#fca5a5" strokeWidth={1} />
     
     {/* Waist Line (Mid) - Dashed */}
     <Line x1="0" y1="24" x2="500" y2="24" stroke="#93c5fd" strokeWidth={1} strokeDasharray="3 3" />
     
     {/* Base Line (Main) - Solid */}
     <Line x1="0" y1="46" x2="500" y2="46" stroke="#fca5a5" strokeWidth={1} />
     
     {/* Descender Line (Bottom) - Dashed */}
     <Line x1="0" y1="60" x2="500" y2="60" stroke="#93c5fd" strokeWidth={1} strokeDasharray="3 3" />
  </Svg>
);

interface EnglishPdfProps {
  text: string;
  config: { mode: string; caseType: string; traceColor: string };
  title?: string;
}

export const EnglishPdfDocument = ({ text, config, title = 'English Writing' }: EnglishPdfProps) => {
  // Split text into words.
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  // Rows: 10 per page roughly
  const rowsPerPage = 10;
  
  // Manual text splitting for "Sentence" mode?
  // For now just list words one by one.

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
           <View style={styles.headerLeft}>
              <SteveAvatar />
              <View>
                  <Text style={styles.title}>DUOMI ENGLISH</Text>
                  <Text style={{ fontSize: 10, color: '#666', marginLeft: 10, marginTop: 4 }}>Writing Practice</Text>
              </View>
           </View>
           <View style={styles.metaContainer}>
              <Text style={styles.metaText}>Name: ______________________</Text>
              <Text style={styles.metaText}>Date: ______________________</Text>
           </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
           {words.map((word, i) => (
               <View key={i} style={styles.row} wrap={false}>
                   <Text style={styles.index}>{i + 1}.</Text>
                   <View style={styles.writingArea}>
                       <FourLineGrid />
                       <Text style={[styles.textLayer, { color: config.traceColor }]}>
                           {word}
                       </Text>
                   </View>
               </View>
           ))}
           
           {/* Empty rows for practice if few words */}
           {words.length < 8 && Array.from({ length: 8 - words.length }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.row} wrap={false}>
                   <Text style={styles.index}></Text>
                   <View style={styles.writingArea}>
                       <FourLineGrid />
                   </View>
               </View>
           ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <GrassBlock />
              <Text style={[styles.footerText, { marginLeft: 5 }]}>Duomi Study - Build Your Vocabulary!</Text>
           </View>
           <Text style={styles.pageNumber}>Page 1</Text>
        </View>

      </Page>
    </Document>
  );
};
