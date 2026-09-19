/**
 * Static Home-Repair catalog + wizards (Thai, plain language).
 * One page = one step. No AI.
 */
(function (global) {
  'use strict';

  var CATEGORIES = [
    { id: 'clothes', emoji: '👕', label: 'เสื้อผ้า' },
    { id: 'pants', emoji: '👖', label: 'กางเกง' },
    { id: 'zipper', emoji: '🤐', label: 'ซิป' },
    { id: 'button', emoji: '🔘', label: 'กระดุม' },
    { id: 'bedding', emoji: '🛏️', label: 'เครื่องนอน' },
    { id: 'curtain', emoji: '🪟', label: 'ผ้าม่าน' },
    { id: 'bag', emoji: '👜', label: 'ของใช้ผ้า' }
  ];

  /** problems per category */
  var PROBLEMS = {
    clothes: [
      { id: 'seam-open', label: 'ตะเข็บปริ / หลุด', wizard: 'seam-open', level: 'green' },
      { id: 'small-hole', label: 'เป็นรูเล็ก', wizard: 'small-hole', level: 'yellow' },
      { id: 'hem-loose', label: 'ชายหลุด', wizard: 'hem-loose', level: 'green' }
    ],
    pants: [
      { id: 'too-long', label: 'ขายาวเกินไป', wizard: 'pants-shorten', level: 'green' },
      { id: 'elastic', label: 'เปลี่ยนยางยืดเอว', wizard: 'elastic-waist', level: 'yellow' },
      { id: 'seam-open', label: 'ตะเข็บปริ', wizard: 'seam-open', level: 'green' }
    ],
    zipper: [
      { id: 'zipper-off', label: 'ซิปหลุดจากฟัน', wizard: 'zipper-slider', level: 'yellow' },
      { id: 'zipper-replace', label: 'เปลี่ยนซิปใหม่', wizard: 'zipper-replace', level: 'red' }
    ],
    button: [
      { id: 'button-sew', label: 'กระดุมหลุด — เย็บใหม่', wizard: 'button-sew', level: 'green' }
    ],
    bedding: [
      { id: 'pillow-seam', label: 'ปลอกหมอนตะเข็บหลุด', wizard: 'seam-open', level: 'green' },
      { id: 'sheet-tear', label: 'ผ้าปูฉีกเล็กน้อย', wizard: 'small-hole', level: 'yellow' }
    ],
    curtain: [
      { id: 'curtain-hem', label: 'เก็บชายม่าน / สั้น-ยาว', wizard: 'curtain-hem', level: 'green' },
      { id: 'curtain-loop', label: 'หูม่านหลุด', wizard: 'seam-open', level: 'green' }
    ],
    bag: [
      { id: 'bag-strap', label: 'สายกระเป๋าหลุด', wizard: 'bag-strap', level: 'yellow' },
      { id: 'bag-seam', label: 'ตะเข็บถุงผ้าปริ', wizard: 'seam-open', level: 'green' }
    ]
  };

  var LEVEL = {
    green: { label: 'ทำง่ายเองได้', emoji: '🟢' },
    yellow: { label: 'ต้องระวัง', emoji: '🟡' },
    red: { label: 'ค่อนข้างยาก — ฝึกก่อน', emoji: '🔴' }
  };

  /** wizardId -> steps[{ title, body, tip? }] */
  var WIZARDS = {
    'pants-shorten': [
      { title: 'ใส่กางเกงแล้ววัด', body: 'ใส่รองเท้าที่ใช้จริง · ให้ช่วยจับส่วนเกิน · วัดว่าอยากสั้นลงกี่ ซม. จดตัวเลขไว้' },
      { title: 'ถอดกางเกง · ทำเครื่องหมาย', body: 'พับชายขึ้นตามที่วัด · ใช้ชอล์ก/เข็มหมุดทำเส้นรอบขาให้เท่ากันสองข้าง' },
      { title: 'ตัดหรือไม่ตัด?', body: 'ถ้าส่วนเกินน้อย (≤3 ซม.) มักพับสองทบได้โดยไม่ตัด · ถ้ายาวมาก ค่อยตัดเหลือเผื่อพับประมาณ 3–4 ซม.' },
      { title: 'พับชาย', body: 'พับขอบดิบเข้า 1 ซม. แล้วพับอีกครั้งตามเส้นที่ทำไว้ · รีดให้เรียบ · หมุดยึด' },
      { title: 'ตั้งจักร', body: 'ฝีเข็มปานกลาง · ด้ายสีใกล้กางเกง · ทดลองบนเศษผ้าก่อน' },
      { title: 'เย็บ', body: 'เย็บใกล้ขอบพับ · ถอยเข็มหัว–ท้าย · ทำทั้งสองขาให้ระยะจากพื้นเท่ากัน' },
      { title: 'ตรวจงาน', body: 'ใส่ลองยืน · ดูความยาวสองข้าง · ตัดด้ายเกิน · รีดชายอีกครั้ง' }
    ],
    'seam-open': [
      { title: 'ดูตำแหน่งที่ปริ', body: 'ดูว่าเส้นด้ายขาดตรงไหน · ดึงผ้าเบา ๆ ให้เห็นช่อง' },
      { title: 'เตรียมด้ายและเข็ม', body: 'เลือกด้ายสีใกล้ผ้า · ใช้เข็มจักรหรือเข็มมือก็ได้ถ้าช่วงสั้นมาก' },
      { title: 'เย็บทับแนวเดิม', body: 'เริ่มเย็บก่อนจุดขาดเล็กน้อย · เย็บทับแนวเดิม · เลยจุดขาดไปอีกนิด · ถอยเข็มหัวท้าย' },
      { title: 'ตรวจความแข็งแรง', body: 'ดึงเบา ๆ · ถ้าระวังจุดเดิมยังบาง ให้เย็บซ้ำอีกครั้งขนานกัน' }
    ],
    'hem-loose': [
      { title: 'ถอดด้ายเก่าที่หลุด', body: 'ดึงด้ายหลุดออกให้สุดแนว · รีดชายให้เรียบ' },
      { title: 'พับใหม่', body: 'พับตามรอยเดิม · หมุดยึด' },
      { title: 'เย็บเก็บชาย', body: 'เย็บใกล้ขอบ · หรือใช้ฝีเข็มซิกแซกถ้าขอบดิบง่ายลุ่ย' },
      { title: 'ตรวจ', body: 'ดูความเท่ากัน · รีดอีกครั้ง' }
    ],
    'small-hole': [
      { title: 'ดูขนาดรู', body: 'ถ้ารูเล็กมาก อาจเย็บดึงขอบชิด · ถ้ารูใหญ่ควรปะผ้าด้านใน' },
      { title: 'เลือกวิธี', body: 'รูเล็ก: เย็บมือเก็บ · รูใหญ่: ตัดผ้าปะด้านในแล้วเย็บรอบ' },
      { title: 'เย็บซ่อม', body: 'เริ่มจากด้านที่มองไม่ค่อยเห็น · ฝีเข็มถี่ ๆ รอบรู' },
      { title: 'ตรวจ', body: 'ดึงเบา ๆ · ตัดด้าย · รีดแผ่ว ๆ' }
    ],
    'elastic-waist': [
      { title: 'เปิดช่องเอว', body: 'แกะตะเข็บช่องเล็ก ๆ ด้านในเอวเพื่อดึงยางเก่า' },
      { title: 'วัดยางใหม่', body: 'วัดรอบเอวคนใส่ ลบเล็กน้อยให้ตึงพอดี · ตัดยาง' },
      { title: 'ร้อยยาง', body: 'ใช้เข็มซ่อนหรือคลิปร้อยยางเข้าช่อง · เย็บปลายยางชนกัน' },
      { title: 'ปิดช่อง', body: 'เย็บปิดช่องที่เปิด · ลองใส่ตรวจความตึง' }
    ],
    'button-sew': [
      { title: 'จัดตำแหน่ง', body: 'วางกระดุมตรงรังเดิม · ถ้าไม่มีรัง ให้ทำเครื่องหมายให้ตรงกับฝั่งตรงข้าม' },
      { title: 'เย็บติด', body: 'เย็บผ่านรูกระดุมหลายรอบ · ทำก้านเล็กน้อยถ้าผ้าหนา' },
      { title: 'พันก้านและผูก', body: 'พันด้ายรอบก้านใต้กระดุม · ผูกปมด้านใน · ตัดด้าย' },
      { title: 'ตรวจ', body: 'ลองติด-แกะ · ดูว่าแน่นและตรงรัง' }
    ],
    'curtain-hem': [
      { title: 'แขวนวัดความยาว', body: 'แขวนม่านจริง · ทำเครื่องหมายความยาวที่ต้องการทั้งผืน' },
      { title: 'พับชาย', body: 'พับตามเส้น · รีด · หมุด' },
      { title: 'เย็บ', body: 'เย็บตรงยาว ๆ · คงระยะจากขอบให้สม่ำเสมอ' },
      { title: 'แขวนตรวจ', body: 'แขวนใหม่ · ดูชายขนานพื้น' }
    ],
    'bag-strap': [
      { title: 'ดูจุดหลุด', body: 'สายขาดจากตัวถุง หรือตะเข็บหลุด?' },
      { title: 'เย็บเสริม', body: 'เย็บทับแรง ๆ เป็นสี่เหลี่ยมหรือ X · ถอยเข็มหลายรอบ' },
      { title: 'ตรวจรับน้ำหนัก', body: 'ยกของเบา ๆ ทดสอบก่อนใส่ของหนัก' }
    ],
    'zipper-slider': [
      { title: 'ดูว่าหัวซิปหลุดจากฟันไหม', body: 'ถ้าฟันยังดี มักใส่หัวกลับได้' },
      { title: 'ใส่หัวกลับ', body: 'ใช้คีมค่อย ๆ เปิดปากหัวซิป · เสียบฟันสองข้าง · คีบปากหัวให้พอดี' },
      { title: 'ทดลองรูด', body: 'รูดขึ้นลงช้า ๆ · ถ้ารูดติด อาจต้องเปลี่ยนซิปทั้งเส้น' }
    ],
    'zipper-replace': [
      { title: 'ถ่ายรูปซิปเดิม', body: 'จดความยาวและชนิด (ลอย/ซ่อน) ก่อนรื้อ' },
      { title: 'รื้อซิปเก่า', body: 'ใช้ที่เลาะตะเข็บ · เก็บแนวเดิมไว้เป็นตัวนำ' },
      { title: 'เย็บซิปใหม่', body: 'หมุดให้ตรง · เย็บช้า ๆ ใกล้ฟัน · สองด้านให้เท่ากัน', tip: 'งานนี้ระดับยาก — ลองบนเศษผ้าก่อนได้' },
      { title: 'ตรวจรูด', body: 'รูดเต็มช่วง · ดูผ้าไม่หนีบ' }
    ]
  };


  /**
   * Short diagnosis: category -> questions -> maps to problem id
   * clothes: where? + look? → problem
   */
  /** Short job cards — tap → wizard (minutes estimate) */
  var QUICK_JOBS = [
    { id: 'q-seam', emoji: '🧵', title: 'เย็บตะเข็บเปิด', minutes: 5, level: 'green', categoryId: 'clothes', problemId: 'seam-open', hint: 'ด้ายขาดตามตะเข็บ' },
    { id: 'q-button', emoji: '🔘', title: 'ติดกระดุมใหม่', minutes: 8, level: 'green', categoryId: 'button', problemId: 'button-sew', hint: 'กระดุมหลุดหรือหาย' },
    { id: 'q-hem', emoji: '📏', title: 'เก็บชายหลุด', minutes: 10, level: 'green', categoryId: 'clothes', problemId: 'hem-loose', hint: 'ชายเสื้อ/กางเกงหลุด' },
    { id: 'q-pants', emoji: '👖', title: 'ขาสั้นลง', minutes: 25, level: 'yellow', categoryId: 'pants', problemId: 'too-long', hint: 'กางเกงยาวเกิน' },
    { id: 'q-hole', emoji: '🩹', title: 'ปะรูเล็ก', minutes: 15, level: 'yellow', categoryId: 'clothes', problemId: 'small-hole', hint: 'รูเล็กกลางผ้า' },
    { id: 'q-zipper', emoji: '🤐', title: 'ใส่หัวซิปกลับ', minutes: 12, level: 'yellow', categoryId: 'zipper', problemId: 'zipper-off', hint: 'หัวซิปหลุดจากฟัน' },
    { id: 'q-elastic', emoji: '🪢', title: 'เปลี่ยนยางเอว', minutes: 20, level: 'yellow', categoryId: 'pants', problemId: 'elastic', hint: 'เอวยางยืดหลวม' },
    { id: 'q-curtain', emoji: '🪟', title: 'เก็บชายม่าน', minutes: 30, level: 'green', categoryId: 'curtain', problemId: 'curtain-hem', hint: 'ม่านยาวหรือชายหลุด' },
    { id: 'q-zipper-new', emoji: '🔧', title: 'เปลี่ยนซิปใหม่', minutes: 45, level: 'red', categoryId: 'zipper', problemId: 'zipper-replace', hint: 'ฟันพังหรือหัวเสีย' },
    { id: 'q-strap', emoji: '👜', title: 'เย็บสายกระเป๋า', minutes: 20, level: 'yellow', categoryId: 'bag', problemId: 'bag-strap', hint: 'สายหลุดจากตัวถุง' }
  ];


  var DIAGNOSIS = {
    clothes: {
      title: 'เช็กก่อนซ่อมเสื้อ',
      questions: [
        {
          id: 'where',
          text: 'ขาดตรงไหน?',
          options: [
            { id: 'seam', label: 'ตะเข็บ' },
            { id: 'middle', label: 'กลางผ้า' },
            { id: 'armpit', label: 'รักแร้' },
            { id: 'sleeve', label: 'แขน' },
            { id: 'hem', label: 'ชาย' }
          ]
        },
        {
          id: 'look',
          text: 'หน้าตาเป็นยังไง?',
          options: [
            { id: 'thread-out', label: 'ตะเข็บหลุด / ด้ายขาด' },
            { id: 'hole', label: 'เป็นรู' },
            { id: 'tear', label: 'ผ้าฉีก' },
            { id: 'thin', label: 'ผ้าบางจนขาด' }
          ]
        }
      ],
      /** key = where|look → problemId */
      map: {
        'seam|thread-out': 'seam-open',
        'seam|hole': 'seam-open',
        'seam|tear': 'seam-open',
        'seam|thin': 'small-hole',
        'middle|hole': 'small-hole',
        'middle|tear': 'small-hole',
        'middle|thin': 'small-hole',
        'middle|thread-out': 'small-hole',
        'armpit|thread-out': 'seam-open',
        'armpit|hole': 'small-hole',
        'armpit|tear': 'small-hole',
        'armpit|thin': 'small-hole',
        'sleeve|thread-out': 'seam-open',
        'sleeve|hole': 'small-hole',
        'sleeve|tear': 'small-hole',
        'sleeve|thin': 'small-hole',
        'hem|thread-out': 'hem-loose',
        'hem|hole': 'hem-loose',
        'hem|tear': 'hem-loose',
        'hem|thin': 'hem-loose'
      }
    },
    pants: {
      title: 'เช็กก่อนซ่อมกางเกง',
      questions: [
        {
          id: 'kind',
          text: 'อยากแก้อะไร?',
          options: [
            { id: 'long', label: 'ขายาวเกินไป' },
            { id: 'waist', label: 'เอวยางยืดหลวม/ขาด' },
            { id: 'seam', label: 'ตะเข็บปริ' }
          ]
        }
      ],
      map: {
        'long': 'too-long',
        'waist': 'elastic',
        'seam': 'seam-open'
      }
    },
    button: {
      title: 'เช็กก่อนติดกระดุม',
      questions: [
        {
          id: 'kind',
          text: 'กระดุมเป็นยังไง?',
          options: [
            { id: 'gone', label: 'หลุด / หาย' },
            { id: 'loose', label: 'ยังติดแต่โยก' },
            { id: 'wrong', label: 'ติดผิดตำแหน่ง' }
          ]
        }
      ],
      map: {
        'gone': 'button-sew',
        'loose': 'button-sew',
        'wrong': 'button-sew'
      }
    },
    zipper: {
      title: 'เช็กก่อนซ่อมซิป',
      questions: [
        {
          id: 'where',
          text: 'เสียตรงไหน?',
          options: [
            { id: 'slider', label: 'หัวซิปหลุดจากฟัน' },
            { id: 'teeth', label: 'ฟันหัก / บิด' },
            { id: 'stuck', label: 'รูดไม่ขึ้น' },
            { id: 'tape', label: 'แถบซิปขาดจากผ้า' }
          ]
        },
        {
          id: 'look',
          text: 'หน้าตาเป็นยังไง?',
          options: [
            { id: 'slider-ok', label: 'หัวยังดี แค่หลุด' },
            { id: 'broken', label: 'หัวหรือฟันพัง' },
            { id: 'fabric', label: 'ผ้าแยกจากซิป' }
          ]
        }
      ],
      map: {
        'slider|slider-ok': 'zipper-off',
        'slider|broken': 'zipper-replace',
        'slider|fabric': 'zipper-off',
        'teeth|slider-ok': 'zipper-replace',
        'teeth|broken': 'zipper-replace',
        'teeth|fabric': 'zipper-replace',
        'stuck|slider-ok': 'zipper-off',
        'stuck|broken': 'zipper-replace',
        'stuck|fabric': 'zipper-replace',
        'tape|slider-ok': 'zipper-replace',
        'tape|broken': 'zipper-replace',
        'tape|fabric': 'zipper-replace'
      }
    },
    bedding: {
      title: 'เช็กก่อนซ่อมเครื่องนอน',
      questions: [
        {
          id: 'item',
          text: 'ของชิ้นไหน?',
          options: [
            { id: 'pillow', label: 'ปลอกหมอน' },
            { id: 'sheet', label: 'ผ้าปู / ปลอกผ้านวม' }
          ]
        },
        {
          id: 'look',
          text: 'เสียแบบไหน?',
          options: [
            { id: 'seam', label: 'ตะเข็บหลุด' },
            { id: 'hole', label: 'ฉีก / เป็นรู' },
            { id: 'thin', label: 'ผ้าบางจนขาด' }
          ]
        }
      ],
      map: {
        'pillow|seam': 'pillow-seam',
        'pillow|hole': 'sheet-tear',
        'pillow|thin': 'sheet-tear',
        'sheet|seam': 'pillow-seam',
        'sheet|hole': 'sheet-tear',
        'sheet|thin': 'sheet-tear'
      }
    },
    curtain: {
      title: 'เช็กก่อนซ่อมม่าน',
      questions: [
        {
          id: 'where',
          text: 'ตรงไหน?',
          options: [
            { id: 'hem', label: 'ชายม่าน' },
            { id: 'loop', label: 'หู / ห่วงแขวน' },
            { id: 'side', label: 'ตะเข็บข้าง' }
          ]
        },
        {
          id: 'look',
          text: 'อยากได้อะไร?',
          options: [
            { id: 'shorten', label: 'สั้นลง / ยาวขึ้น' },
            { id: 'fix', label: 'เย็บจุดที่หลุด' },
            { id: 'tear', label: 'ผ้าฉีกเล็กน้อย' }
          ]
        }
      ],
      map: {
        'hem|shorten': 'curtain-hem',
        'hem|fix': 'curtain-hem',
        'hem|tear': 'curtain-hem',
        'loop|shorten': 'curtain-loop',
        'loop|fix': 'curtain-loop',
        'loop|tear': 'curtain-loop',
        'side|shorten': 'curtain-hem',
        'side|fix': 'curtain-loop',
        'side|tear': 'curtain-loop'
      }
    }

  };

  global.YebRepairsData = {
    CATEGORIES: CATEGORIES,
    PROBLEMS: PROBLEMS,
    LEVEL: LEVEL,
    WIZARDS: WIZARDS,
    DIAGNOSIS: DIAGNOSIS,
    QUICK_JOBS: QUICK_JOBS
  };
})(typeof window !== 'undefined' ? window : globalThis);
