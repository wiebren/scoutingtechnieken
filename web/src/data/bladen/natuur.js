// Natuur: notities/technieken/touw-kamp-natuur.md §6. We leren herkennen; met de camera herkennen doen
// ObsIdentify en Seek al.

export default [
  { id: 'zomereik', naam: 'Zomereik', en: 'pedunculate oak', groep: 'bomen', bron: 'TKN §6',
    uitleg: 'De eikels hangen aan een lange steel, de bladeren hebben juist bijna geen steel en twee kleine oortjes aan de voet.',
    naar: [{ blad: 'wintereik' }] },
  { id: 'wintereik', naam: 'Wintereik', en: 'sessile oak', groep: 'bomen', bron: 'TKN §6',
    uitleg: 'Andersom dan de zomereik: de bladeren hebben een duidelijke steel, de eikels zitten zonder steel op de tak.',
    naar: [{ blad: 'zomereik' }] },
];
