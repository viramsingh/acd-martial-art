export interface BatchItem {
  id: string;
  name: string;
  time: string;
  location: string;
}

export interface BatchGroup {
  location: string;
  batches: BatchItem[];
}

export const BATCH_GROUPS: BatchGroup[] = [
  {
    location: 'Meghdoot Nagar',
    batches: [
      {
        id: 'Meghdoot Nagar - 1st Batch 5:00 - 6:00 PM',
        name: '1st Batch 5:00 - 6:00 PM',
        time: '5:00 - 6:00 PM',
        location: 'Meghdoot Nagar',
      },
      {
        id: 'Meghdoot Nagar - 2nd Batch 6:30 - 7:30 PM',
        name: '2nd 6:30 - 7:30 PM',
        time: '6:30 - 7:30 PM',
        location: 'Meghdoot Nagar',
      },
    ],
  },
  {
    location: 'Abhinadan',
    batches: [
      {
        id: 'Abhinadan - 3rd Batch 6:30 - 7:30 PM',
        name: '3rd 6:30 - 7:30 PM',
        time: '6:30 - 7:30 PM',
        location: 'Abhinadan',
      },
      {
        id: 'Abhinadan - 4th Batch 8:00 - 9:00 PM',
        name: '4th 8:00 - 9:00 PM',
        time: '8:00 - 9:00 PM',
        location: 'Abhinadan',
      },
    ],
  },
];

export const ALL_BATCH_IDS: string[] = BATCH_GROUPS.flatMap((g) => g.batches.map((b) => b.id));

export const DEFAULT_BATCH = BATCH_GROUPS[0].batches[0].id;

export function matchesBatchSelection(studentBatch: string | undefined | null, selectedBatch: string): boolean {
  if (!selectedBatch || selectedBatch === 'ALL') return true;
  if (!studentBatch) return false;
  if (studentBatch === selectedBatch) return true;

  const s = studentBatch.toLowerCase().trim();
  const b = selectedBatch.toLowerCase().trim();

  if (s.includes(b) || b.includes(s)) return true;

  // Flexible match for backward compatibility with older batch names
  if (b.includes('5:00') && s.includes('5:00')) return true;
  if (b.includes('8:00') && s.includes('8:00')) return true;
  if (b.includes('6:30') && s.includes('6:30')) {
    if (b.includes('meghdoot') && s.includes('abhinad')) return false;
    if (b.includes('abhinad') && s.includes('meghdoot')) return false;
    return true;
  }

  return false;
}
