export const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W'];
export const weights = [4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, .67, 0];

export function gpa(row) {
  const counts = grades.slice(0, -1).map(grade => row[grade]);
  if (counts.some(count => count == null)) return null;
  const total = counts.reduce((sum, count) => sum + count, 0);
  return total ? counts.reduce((sum, count, index) => sum + count * weights[index], 0) / total : null;
}

export function summarize(rows) {
  const counts = Object.fromEntries(grades.map(grade => [
    grade,
    rows.some(row => row[grade] == null) ? null : rows.reduce((sum, row) => sum + row[grade], 0)
  ]));
  const hasMissingGrades = rows.some(row => grades.slice(0, -1).some(grade => row[grade] == null));
  const years = rows.map(row => row.Year).filter(Number.isInteger);
  const termOrder = {Winter: 0, Spring: 1, Summer: 2, Fall: 3};
  const terms = [...new Map(rows.filter(row => Number.isInteger(row.Year) && row.Term)
    .map(row => [JSON.stringify([row.Year, row.Term]), {year: row.Year, term: row.Term}])).values()]
    .sort((a, b) => a.year - b.year || (termOrder[a.term] ?? 4) - (termOrder[b.term] ?? 4) || a.term.localeCompare(b.term));
  return {
    counts,
    gpa: gpa(counts),
    enrollments: !rows.length || hasMissingGrades ? null : grades.slice(0, -1).reduce((sum, grade) => sum + counts[grade], 0),
    hasMissingGrades,
    terms,
    firstYear: years.length ? Math.min(...years) : null,
    lastYear: years.length ? Math.max(...years) : null
  };
}
