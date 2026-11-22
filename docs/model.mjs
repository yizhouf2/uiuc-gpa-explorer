export const grades=['A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F','W'];
export const weights=[4,4,3.67,3.33,3,2.67,2.33,2,1.67,1.33,1,.67,0];
export function gpa(row){const counts=grades.slice(0,-1).map(g=>row[g]);if(counts.some(n=>n===null))return null;const n=counts.reduce((a,b)=>a+b,0);return n?counts.reduce((a,b,i)=>a+b*weights[i],0)/n:null;}
export function summarize(rows){const counts=Object.fromEntries(grades.map(g=>[g,rows.some(r=>r[g]===null)?null:rows.reduce((s,r)=>s+r[g],0)]));return {counts,gpa:gpa(counts),enrollments:grades.slice(0,-1).reduce((s,g)=>s+(counts[g]??0),0)};}
