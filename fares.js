/*
 * ข้อมูลและตรรกะคำนวณค่าโดยสาร BTS สายหลัก และ MRT สายสีน้ำเงิน
 * ต้องการแก้ราคา ให้แก้ที่ BTS_FARES และ MRT_BLUE_FARES ด้านล่างเท่านั้น
 *
 * MRT สายสีน้ำเงิน: ตามข้อบังคับ รฟม. มีผล 3 ก.ค. 2569 (17-44 บาท) ตรวจกับข่าวราชกิจจานุเบกษาแล้ว
 * BTS สายหลัก: ช่วงราคา 17-47 บาท ยืนยันจากข่าว BTS แต่ราคารายจำนวนสถานี
 *   ยังไม่ได้ตรวจกับตารางทางการ (BTS_FARES_VERIFIED = false) ให้เทียบกับป้ายราคาที่สถานีก่อนใช้จริง
 */
(function (root) {
  // ราคาตามจำนวนสถานีที่เดินทาง: index 0 = 1 สถานี ตัวสุดท้ายคือราคาของ "จำนวนนั้นขึ้นไป"
  const BTS_FARES = [17, 25, 28, 32, 35, 39, 42, 47];
  const BTS_FARES_VERIFIED = false;
  const MRT_BLUE_FARES = [17, 20, 22, 25, 27, 29, 32, 34, 37, 39, 42, 44];

  // [รหัส, ชื่อไทย, ชื่ออังกฤษ, เป็นสถานีที่ยังไม่สร้างหรือไม่]
  // BTS นับ "เสนาร่วม" (N6) และ "ศึกษาวิทยา" เป็น 1 สถานีในการคิดค่าโดยสารมาตั้งแต่เปิดบริการ
  // ศึกษาวิทยา (S4) เปิดแล้ว ส่วนเสนาร่วมยังไม่สร้าง จึงต้องนับเป็นสถานีสมมติ
  const SUKHUMVIT = [
    ['N8', 'หมอชิต', 'Mo Chit'],
    ['N7', 'สะพานควาย', 'Saphan Khwai'],
    ['N6', 'เสนาร่วม (สถานีที่ยังไม่สร้าง)', 'Sena Ruam', true],
    ['N5', 'อารีย์', 'Ari'],
    ['N4', 'สนามเป้า', 'Sanam Pao'],
    ['N3', 'อนุสาวรีย์ชัยสมรภูมิ', 'Victory Monument'],
    ['N2', 'พญาไท', 'Phaya Thai'],
    ['N1', 'ราชเทวี', 'Ratchathewi'],
    ['CEN', 'สยาม', 'Siam'],
    ['E1', 'ชิดลม', 'Chit Lom'],
    ['E2', 'เพลินจิต', 'Phloen Chit'],
    ['E3', 'นานา', 'Nana'],
    ['E4', 'อโศก', 'Asok'],
    ['E5', 'พร้อมพงษ์', 'Phrom Phong'],
    ['E6', 'ทองหล่อ', 'Thong Lo'],
    ['E7', 'เอกมัย', 'Ekkamai'],
    ['E8', 'พระโขนง', 'Phra Khanong'],
    ['E9', 'อ่อนนุช', 'On Nut'],
  ];
  const SILOM = [
    ['W1', 'สนามกีฬาแห่งชาติ', 'National Stadium'],
    ['CEN', 'สยาม', 'Siam'],
    ['S1', 'ราชดำริ', 'Ratchadamri'],
    ['S2', 'ศาลาแดง', 'Sala Daeng'],
    ['S3', 'ช่องนนทรี', 'Chong Nonsi'],
    ['S4', 'เซนต์หลุยส์', 'Saint Louis'],
    ['S5', 'สุรศักดิ์', 'Surasak'],
    ['S6', 'สะพานตากสิน', 'Saphan Taksin'],
    ['S7', 'กรุงธนบุรี', 'Krung Thon Buri'],
    ['S8', 'วงเวียนใหญ่', 'Wongwian Yai'],
  ];

  // MRT สายสีน้ำเงิน 38 สถานี: วงกลม BL01-BL32 (ท่าพระ → ... → หัวลำโพง → ... → อิสรภาพ → ท่าพระ)
  // และทางแยกจากท่าพระไปหลักสอง BL33-BL38
  const BLUE_LOOP = [
    ['BL01', 'ท่าพระ', 'Tha Phra'],
    ['BL02', 'จรัญฯ 13', 'Charan 13'],
    ['BL03', 'ไฟฉาย', 'Fai Chai'],
    ['BL04', 'บางขุนนนท์', 'Bang Khun Non'],
    ['BL05', 'บางยี่ขัน', 'Bang Yi Khan'],
    ['BL06', 'สิรินธร', 'Sirindhorn'],
    ['BL07', 'บางพลัด', 'Bang Phlat'],
    ['BL08', 'บางอ้อ', 'Bang O'],
    ['BL09', 'บางโพ', 'Bang Pho'],
    ['BL10', 'เตาปูน', 'Tao Poon'],
    ['BL11', 'บางซื่อ', 'Bang Sue'],
    ['BL12', 'กำแพงเพชร', 'Kamphaeng Phet'],
    ['BL13', 'สวนจตุจักร', 'Chatuchak Park'],
    ['BL14', 'พหลโยธิน', 'Phahon Yothin'],
    ['BL15', 'ลาดพร้าว', 'Lat Phrao'],
    ['BL16', 'รัชดาภิเษก', 'Ratchadaphisek'],
    ['BL17', 'สุทธิสาร', 'Sutthisan'],
    ['BL18', 'ห้วยขวาง', 'Huai Khwang'],
    ['BL19', 'ศูนย์วัฒนธรรมแห่งประเทศไทย', 'Thailand Cultural Centre'],
    ['BL20', 'พระราม 9', 'Phra Ram 9'],
    ['BL21', 'เพชรบุรี', 'Phetchaburi'],
    ['BL22', 'สุขุมวิท', 'Sukhumvit'],
    ['BL23', 'ศูนย์การประชุมแห่งชาติสิริกิติ์', 'Queen Sirikit National Convention Centre'],
    ['BL24', 'คลองเตย', 'Khlong Toei'],
    ['BL25', 'ลุมพินี', 'Lumphini'],
    ['BL26', 'สีลม', 'Si Lom'],
    ['BL27', 'สามย่าน', 'Sam Yan'],
    ['BL28', 'หัวลำโพง', 'Hua Lamphong'],
    ['BL29', 'วัดมังกร', 'Wat Mangkon'],
    ['BL30', 'สามยอด', 'Sam Yot'],
    ['BL31', 'สนามไชย', 'Sanam Chai'],
    ['BL32', 'อิสรภาพ', 'Itsaraphap'],
  ];
  const BLUE_BRANCH = [
    ['BL33', 'บางไผ่', 'Bang Phai'],
    ['BL34', 'บางหว้า', 'Bang Wa'],
    ['BL35', 'เพชรเกษม 48', 'Phetkasem 48'],
    ['BL36', 'ภาษีเจริญ', 'Phasi Charoen'],
    ['BL37', 'บางแค', 'Bang Khae'],
    ['BL38', 'หลักสอง', 'Lak Song'],
  ];

  function toStation(row) {
    return { id: row[0], th: row[1], en: row[2], ghost: !!row[3] };
  }

  function buildGraph(chains, extraEdges) {
    const adj = {};
    const add = (a, b) => {
      (adj[a] = adj[a] || new Set()).add(b);
      (adj[b] = adj[b] || new Set()).add(a);
    };
    chains.forEach((chain) => {
      for (let i = 0; i < chain.length - 1; i++) add(chain[i][0], chain[i + 1][0]);
    });
    (extraEdges || []).forEach((e) => add(e[0], e[1]));
    return adj;
  }

  // จำนวนสถานีที่เดินทาง = จำนวนช่วงบนเส้นทางที่สั้นที่สุด (BFS)
  function hops(adj, from, to) {
    if (from === to) return 0;
    const dist = {};
    dist[from] = 0;
    const queue = [from];
    while (queue.length) {
      const cur = queue.shift();
      for (const nxt of adj[cur] || []) {
        if (dist[nxt] === undefined) {
          dist[nxt] = dist[cur] + 1;
          if (nxt === to) return dist[nxt];
          queue.push(nxt);
        }
      }
    }
    return null;
  }

  const btsAdj = buildGraph([SUKHUMVIT, SILOM]);
  // ปิดวง อิสรภาพ–ท่าพระ และต่อทางแยก ท่าพระ–บางไผ่
  const blueAdj = buildGraph([BLUE_LOOP, BLUE_BRANCH], [
    ['BL32', 'BL01'],
    ['BL01', 'BL33'],
  ]);

  function btsStations() {
    const seen = new Set();
    const out = [];
    SUKHUMVIT.concat(SILOM).forEach((r) => {
      if (!seen.has(r[0]) && !r[3]) {
        seen.add(r[0]);
        out.push(toStation(r));
      }
    });
    return out;
  }

  const SYSTEMS = {
    bts: {
      key: 'bts',
      name: 'BTS สายสุขุมวิท/สีลม (ช่วงหลัก)',
      stations: btsStations(),
      adj: btsAdj,
      fares: BTS_FARES,
    },
    mrt: {
      key: 'mrt',
      name: 'MRT สายสีน้ำเงิน',
      stations: BLUE_LOOP.concat(BLUE_BRANCH).map(toStation),
      adj: blueAdj,
      fares: MRT_BLUE_FARES,
    },
  };

  // ผู้สูงอายุ 60 ปีขึ้นไป ลด 50% ทั้งสองระบบ (ปัดเศษขึ้น)
  function applyRider(full, rider) {
    if (rider === 'elderly') return Math.ceil(full / 2);
    if (rider === 'free') return 0;
    return full;
  }

  /**
   * คำนวณค่าโดยสารเที่ยวเดียว
   * @param {'bts'|'mrt'} system
   * @param {string} from รหัสสถานีต้นทาง
   * @param {string} to รหัสสถานีปลายทาง
   * @param {'adult'|'elderly'|'free'} rider
   */
  function calcFare(system, from, to, rider) {
    const sys = SYSTEMS[system];
    if (!sys || !from || !to || from === to) return null;
    const n = hops(sys.adj, from, to);
    if (!n) return null;
    const full = sys.fares[Math.min(n, sys.fares.length) - 1];
    return { stations: n, full: full, fare: applyRider(full, rider || 'adult') };
  }

  const api = {
    SYSTEMS: SYSTEMS,
    BTS_FARES: BTS_FARES,
    BTS_FARES_VERIFIED: BTS_FARES_VERIFIED,
    MRT_BLUE_FARES: MRT_BLUE_FARES,
    calcFare: calcFare,
    hops: hops,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TransitFares = api;
})(typeof window !== 'undefined' ? window : globalThis);
