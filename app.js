/* Yeb Sewing Companion — core (projects, body, patterns, fabric, builds, help, skills) */
(function () {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  function showScreen(name) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      var s = screens[i];
      var on = s.getAttribute('data-screen') === name;
      if (on) {
        s.classList.add('is-active');
        s.removeAttribute('hidden');
      } else {
        s.classList.remove('is-active');
        s.setAttribute('hidden', '');
      }
    }
    window.scrollTo(0, 0);
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function compressImage(file, maxW, quality, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, (maxW || 960) / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', quality || 0.7));
      };
      img.onerror = function () {
        cb(null);
      };
      img.src = reader.result;
    };
    reader.onerror = function () {
      cb(null);
    };
    reader.readAsDataURL(file);
  }

  /* —— Projects —— */
  var photoDataUrl = null;

  function setPhotoPreview(url) {
    photoDataUrl = url || null;
    var img = $('project-photo-preview');
    var clearBtn = $('btn-clear-photo');
    if (!img) return;
    if (photoDataUrl) {
      img.src = photoDataUrl;
      img.hidden = false;
      if (clearBtn) clearBtn.hidden = false;
    } else {
      img.removeAttribute('src');
      img.hidden = true;
      if (clearBtn) clearBtn.hidden = true;
    }
  }

  function renderProjectList() {
    var box = $('project-list');
    if (!box) return;
    var list = YebStore.listProjects();
    if (!list.length) {
      box.innerHTML =
        '<p class="empty-card">ยังไม่มีงาน<br />กด “บันทึกงานใหม่” หลังเย็บเสร็จ</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      html +=
        '<button type="button" class="project-card" data-edit-project="' +
        escapeHtml(p.id) +
        '">' +
        (p.photoDataUrl
          ? '<img class="project-thumb" src="' + p.photoDataUrl + '" alt="" />'
          : '<div class="project-thumb placeholder">ไม่มีรูป</div>') +
        '<div class="project-card-body"><strong>' +
        escapeHtml(p.title) +
        '</strong>' +
        (p.nextTime
          ? '<span class="project-next">ครั้งหน้า: ' + escapeHtml(p.nextTime) + '</span>'
          : '') +
        (p.mistake
          ? '<span class="project-miss">พลาด: ' + escapeHtml(p.mistake) + '</span>'
          : '') +
        '</div></button>';
    }
    box.innerHTML = html;
  }

  function openNewProject() {
    $('project-id').value = '';
    $('project-title').value = '';
    $('project-fabric').value = '';
    $('project-how').value = '';
    $('project-mistake').value = '';
    $('project-next').value = '';
    $('form-title').textContent = 'บันทึกงานใหม่';
    $('btn-delete-project').hidden = true;
    $('form-msg').textContent = '';
    setPhotoPreview(null);
    var f = $('project-photo');
    if (f) f.value = '';
    showScreen('project-form');
  }

  function openEditProject(id) {
    var p = YebStore.getProject(id);
    if (!p) return;
    $('project-id').value = p.id;
    $('project-title').value = p.title || '';
    $('project-fabric').value = p.fabric || '';
    $('project-how').value = p.how || '';
    $('project-mistake').value = p.mistake || '';
    $('project-next').value = p.nextTime || '';
    $('form-title').textContent = 'แก้บันทึกงาน';
    $('btn-delete-project').hidden = false;
    $('form-msg').textContent = '';
    setPhotoPreview(p.photoDataUrl || null);
    showScreen('project-form');
  }

  /* —— Body —— */
  function fillBodyForm() {
    var b = YebStore.getBody();
    $('body-bust').value = b.bust || '';
    $('body-waist').value = b.waist || '';
    $('body-hip').value = b.hip || '';
    $('body-height').value = b.height || '';
    $('body-notes').value = b.notes || '';
    $('body-msg').textContent = '';
    $('body-updated').textContent = b.updatedAt
      ? 'บันทึกล่าสุด: ' + new Date(b.updatedAt).toLocaleString('th-TH')
      : '';
  }

  /* —— Patterns —— */
  function renderPatternList() {
    var box = $('pattern-list');
    var list = YebStore.listPatterns();
    if (!list.length) {
      box.innerHTML = '<p class="empty-card">ยังไม่มีแพทเทิร์น<br />เพิ่มแบบที่ใช้บ่อยไว้ที่นี่</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      html +=
        '<button type="button" class="project-card" data-edit-pattern="' +
        escapeHtml(p.id) +
        '"><div class="project-card-body"><strong>' +
        escapeHtml(p.name) +
        '</strong>' +
        (p.note ? '<span class="project-next">' + escapeHtml(p.note) + '</span>' : '') +
        '</div></button>';
    }
    box.innerHTML = html;
  }

  function openNewPattern() {
    $('pattern-id').value = '';
    $('pattern-name').value = '';
    $('pattern-note').value = '';
    $('pattern-link').value = '';
    $('pattern-body-ref').value = '';
    $('pattern-form-title').textContent = 'เพิ่มแพทเทิร์น';
    $('btn-delete-pattern').hidden = true;
    $('pattern-msg').textContent = '';
    showScreen('pattern-form');
  }

  function openEditPattern(id) {
    var p = YebStore.getPattern(id);
    if (!p) return;
    $('pattern-id').value = p.id;
    $('pattern-name').value = p.name || '';
    $('pattern-note').value = p.note || '';
    $('pattern-link').value = p.linkOrNotes || '';
    $('pattern-body-ref').value = p.bodyRef || '';
    $('pattern-form-title').textContent = 'แก้แพทเทิร์น';
    $('btn-delete-pattern').hidden = false;
    $('pattern-msg').textContent = '';
    showScreen('pattern-form');
  }

  /* —— Fabric calc —— */
  function presetPieces(type) {
    // returns {L, W, panels, label}
    if (type === 'bag') return { L: 40, W: 35, panels: 2, label: 'ถุงผ้า/โท้ท (ประมาณ)' };
    if (type === 'pillow') return { L: 50, W: 50, panels: 2, label: 'ปลอกหมอน (ประมาณ)' };
    if (type === 'skirt') return { L: 70, W: 60, panels: 2, label: 'กระโปรงง่าย (ประมาณ)' };
    return null;
  }

  function calcFabricMeters(L, W, panels, fabricWidth, seam) {
    var l = Number(L) + 2 * Number(seam);
    var w = Number(W) + 2 * Number(seam);
    if (!(l > 0) || !(w > 0) || !(fabricWidth > 0) || !(panels > 0)) return null;
    var area = l * w * panels * 1.1; // +10% waste
    var meters = area / Number(fabricWidth) / 100;
    return Math.ceil(meters * 100) / 100;
  }

  function fillFabricForm() {
    var c = YebStore.getFabricCalc();
    $('fabric-type').value = c.workType || 'bag';
    $('fabric-size-hint').value = c.sizeHint || '';
    $('fabric-width').value = c.fabricWidth || '110';
    $('fabric-seam').value = c.seamAllowance || '1.5';
    $('fabric-length').value = c.lengthCm || '';
    $('fabric-piece-width').value = c.widthCm || '';
    $('fabric-result').hidden = true;
  }

  /* —— Builds: tote bag —— */
  var BAG_ID = 'build-bag-simple';
  var BAG_STEPS = [
    { emoji: '📏', title: 'เตรียมขนาด', body: 'ตัดสินใจขนาดถุง เช่น 35×40 ซม. จดไว้ในสมุดงานได้' },
    { emoji: '✂️', title: 'ตัดผ้า 2 ชิ้น', body: 'ตัดผ้าหน้า–หลัง ตามขนาด + เผื่อตะเข็บประมาณ 1.5 ซม. ทุกด้าน' },
    { emoji: '📌', title: 'ซ้อนผ้าหน้าถูกต้อง', body: 'เอาหน้าผ้าชนกัน (ด้านสวยเข้าด้านใน) จัดขอบให้ตรง' },
    { emoji: '🧵', title: 'เย็บด้านข้างและก้น', body: 'เย็บสองด้านข้างและก้น เว้นปากถุง · ถอยเข็มหัว–ท้าย' },
    { emoji: '📐', title: 'ทำมุมก้น (ถ้าต้องการ)', body: 'พับมุมก้นให้เป็นกล่อง เย็บขวาง เพื่อให้ก้นถุงตั้งได้' },
    { emoji: '🔁', title: 'พลิกด้านถูก', body: 'พลิกถุงออกด้านสวย รีดตะเข็บให้เรียบ' },
    { emoji: '🔼', title: 'พับปากถุง', body: 'พับปากถุงลง 1–2 ซม. สองครั้ง แล้วเย็บรอบปาก' },
    { emoji: '🎀', title: 'หูหิ้ว (ถ้าต้องการ)', body: 'ตัดผ้าเป็นสาย 2 เส้น เย็บติดปากถุงสองข้าง ให้แน่น' }
  ];
  var buildStepIndex = 0;

  function openBuildStep(i) {
    buildStepIndex = Math.max(0, Math.min(i, BAG_STEPS.length - 1));
    var step = BAG_STEPS[buildStepIndex];
    var prog = YebStore.getBuildProgress(BAG_ID);
    $('build-step-heading').textContent =
      'ขั้น ' + (buildStepIndex + 1) + ' / ' + BAG_STEPS.length;
    $('build-step-emoji').textContent = step.emoji;
    $('build-step-title').textContent = step.title;
    $('build-step-body').textContent = step.body;
    $('build-step-done').checked = (prog.doneSteps || []).indexOf(buildStepIndex) !== -1;
    $('btn-build-prev').disabled = buildStepIndex === 0;
    var last = buildStepIndex === BAG_STEPS.length - 1;
    $('btn-build-next').hidden = last;
    $('btn-build-finish').hidden = !last;
    $('build-msg').textContent = '';
    showScreen('build-step');
  }

  /* —— Help trees —— */
  var HELP = [
    {
      id: 'thread-tangle',
      label: 'ด้ายพัน / ด้ายยุ่งด้านล่าง',
      start: 'q1',
      nodes: {
        q1: {
          text: 'ด้ายพันอยู่ด้านล่างผ้าใช่ไหม?',
          choices: [
            { label: 'ใช่', next: 'a-bobbin' },
            { label: 'ไม่ใช่ / ด้านบน', next: 'a-top' },
            { label: 'ไม่แน่ใจ', next: 'a-check' }
          ]
        },
        'a-bobbin': {
          text: 'ลอง: 1) เอาผ้าออก 2) ตัดด้ายที่พัน 3) ใส่ไส้กระสวยใหม่ให้ถูกทาง 4) ดึงด้ายล่างขึ้นมาคู่กับด้ายบน แล้วลองเย็บบนเศษผ้า',
          choices: []
        },
        'a-top': {
          text: 'ลอง: ตรวจว่าด้ายบนเข้าตึงด้ายครบร่อง · ฝาครอบด้ายปิดสนิท · เข็มไม่หัก/ไม่คดงอ',
          choices: []
        },
        'a-check': {
          text: 'พลิกผ้าดูด้านล่างก่อน · ถ้าเป็นเส้นยุ่งเป็นก้อนมักมาจากไส้กระสวย · ถ้าเป็นห่วงด้านบนมักมาจากด้ายบน',
          choices: [
            { label: 'ด้านล่างยุ่ง', next: 'a-bobbin' },
            { label: 'ด้านบนมีปัญหา', next: 'a-top' }
          ]
        }
      }
    },
    {
      id: 'pucker',
      label: 'ตะเข็บย่น',
      start: 'q1',
      nodes: {
        q1: {
          text: 'ผ้าบางหรือยืดง่ายไหม?',
          choices: [
            { label: 'ใช่ ผ้าบาง/ยืด', next: 'a-thin' },
            { label: 'ผ้าหนาปกติดี', next: 'a-tension' }
          ]
        },
        'a-thin': {
          text: 'ลอง: ลดแรงกดตีนผี · ใช้เข็มเล็กกว่า · อย่าดึงผ้าเอง ให้จักรป้อน · วางกระดาษรองชั่วคราวได้',
          choices: []
        },
        'a-tension': {
          text: 'ลอง: ปรับความตึงด้ายทีละนิด · ตรวจความยาวฝีเข็ม · รีดตะเข็บตามทางผ้า',
          choices: []
        }
      }
    },
    {
      id: 'machine-stop',
      label: 'จักรไม่เดิน / ผ้าไม่เดิน',
      start: 'q1',
      nodes: {
        q1: {
          text: 'เข็มยังขึ้นลงอยู่ไหมเวลาเหยียบ?',
          choices: [
            { label: 'เข็มขยับ แต่ผ้าไม่เดิน', next: 'a-feed' },
            { label: 'ไม่ขยับเลย', next: 'a-power' }
          ]
        },
        'a-feed': {
          text: 'ตรวจตีนผีว่าลงแล้ว · ฟันเลื่อนผ้าไม่ถูกกดต่ำโหมดปัก · อย่าดึงผ้าแรงเกิน',
          choices: []
        },
        'a-power': {
          text: 'ตรวจปลั๊ก/สวิตช์ · คันเหยียบเสียบแน่น · ถ้ายังไม่เดิน ให้ช่างตรวจ — อย่าฝืน',
          choices: []
        }
      }
    },
    {
      id: 'uneven',
      label: 'ฝีเข็มไม่สม่ำเสมอ / หลวม',
      start: 'q1',
      nodes: {
        q1: {
          text: 'ด้ายล่างโผล่เป็นห่วงด้านบน หรือด้ายบนโผล่ด้านล่าง?',
          choices: [
            { label: 'ห่วงด้านบน (มักด้ายล่าง)', next: 'a-bobbin' },
            { label: 'ห่วงด้านล่าง (มักด้ายบน)', next: 'a-top' },
            { label: 'ไม่แน่ใจ', next: 'a-both' }
          ]
        },
        'a-bobbin': {
          text: 'ใส่ไส้กระสวยใหม่ · ตรวจทิศม้วนด้าย · ความตึงกระสวย',
          choices: []
        },
        'a-top': {
          text: 'ร้อยด้ายบนใหม่ทั้งเส้น · ตรวจตึงด้าย · เปลี่ยนเข็ม',
          choices: []
        },
        'a-both': {
          text: 'ร้อยด้ายบน–ล่างใหม่ทั้งคู่บนเศษผ้า · ปรับทีละอย่างแล้วทดลอง',
          choices: []
        }
      }
    }
  ];

  var helpTopic = null;
  var helpNodeId = null;

  function renderHelpMenu() {
    var box = $('help-menu');
    var html = '';
    for (var i = 0; i < HELP.length; i++) {
      html +=
        '<button type="button" class="project-card" data-help="' +
        HELP[i].id +
        '"><div class="project-card-body"><strong>' +
        escapeHtml(HELP[i].label) +
        '</strong></div></button>';
    }
    box.innerHTML = html;
    $('help-flow').hidden = true;
    box.hidden = false;
  }

  function renderHelpNode() {
    var topic = null;
    for (var i = 0; i < HELP.length; i++) {
      if (HELP[i].id === helpTopic) topic = HELP[i];
    }
    if (!topic) return;
    var node = topic.nodes[helpNodeId];
    if (!node) return;
    $('help-menu').hidden = true;
    $('help-flow').hidden = false;
    $('help-q').textContent = node.text;
    var actions = $('help-actions');
    actions.innerHTML = '';
    if (!node.choices.length) {
      var done = document.createElement('button');
      done.type = 'button';
      done.className = 'btn-primary-block';
      done.textContent = 'เข้าใจแล้ว';
      done.addEventListener('click', renderHelpMenu);
      actions.appendChild(done);
      return;
    }
    for (var c = 0; c < node.choices.length; c++) {
      (function (ch) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn-secondary-block';
        b.textContent = ch.label;
        b.addEventListener('click', function () {
          helpNodeId = ch.next;
          renderHelpNode();
        });
        actions.appendChild(b);
      })(node.choices[c]);
    }
  }

  /* —— Skills —— */
  var SKILL_LABELS = {
    cut: 'ตัดผ้า',
    straightSeam: 'เย็บตรง',
    finishEdge: 'เก็บขอบ',
    press: 'รีดตะเข็บ',
    zipper: 'ติดซิป',
    hem: 'พับขอบ',
    gather: 'จีบ/ย่น',
    sleeve: 'แขนเสื้อ',
    neckline: 'คอเสื้อ',
    projectsDone: 'ชิ้นงานที่ทำเสร็จ',
    zipperChallenge: 'ฝึกซิป (ชาเลนจ์)'
  };

  function renderSkills() {
    var s = YebStore.getSkills();
    var box = $('skills-list');
    var html = '';
    for (var k in SKILL_LABELS) {
      if (!Object.prototype.hasOwnProperty.call(SKILL_LABELS, k)) continue;
      if (k === 'zipperChallenge') continue;
      html +=
        '<div class="skill-row"><span>' +
        escapeHtml(SKILL_LABELS[k]) +
        '</span><strong>' +
        (s[k] || 0) +
        '</strong></div>';
    }
    box.innerHTML = html;
    var z = s.zipperChallenge || 0;
    $('zipper-progress').textContent = 'ทำแล้ว ' + z + ' / 5';
  }

  /* —— Navigation helpers —— */
  function go(name) {
    if (name === 'projects') {
      renderProjectList();
      showScreen('projects');
      return;
    }
    if (name === 'body') {
      fillBodyForm();
      showScreen('body');
      return;
    }
    if (name === 'patterns') {
      renderPatternList();
      showScreen('patterns');
      return;
    }
    if (name === 'fabric') {
      fillFabricForm();
      showScreen('fabric');
      return;
    }
    if (name === 'builds') {
      showScreen('builds');
      return;
    }
    if (name === 'help') {
      renderHelpMenu();
      showScreen('help');
      return;
    }
    if (name === 'skills') {
      renderSkills();
      showScreen('skills');
      return;
    }
    showScreen(name);
  }

  function bind() {
    document.addEventListener('click', function (ev) {
      var goBtn = ev.target.closest('[data-go]');
      if (goBtn && !goBtn.disabled) {
        go(goBtn.getAttribute('data-go'));
        return;
      }
      var ep = ev.target.closest('[data-edit-project]');
      if (ep) {
        openEditProject(ep.getAttribute('data-edit-project'));
        return;
      }
      var epat = ev.target.closest('[data-edit-pattern]');
      if (epat) {
        openEditPattern(epat.getAttribute('data-edit-pattern'));
        return;
      }
      var help = ev.target.closest('[data-help]');
      if (help) {
        helpTopic = help.getAttribute('data-help');
        var topic = null;
        for (var i = 0; i < HELP.length; i++) {
          if (HELP[i].id === helpTopic) topic = HELP[i];
        }
        if (topic) {
          helpNodeId = topic.start;
          renderHelpNode();
        }
      }
    });

    $('btn-new-project').addEventListener('click', openNewProject);
    $('btn-form-back').addEventListener('click', function () {
      renderProjectList();
      showScreen('projects');
    });

    $('project-photo').addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file) return;
      compressImage(file, 960, 0.7, function (url) {
        if (!url) {
          $('form-msg').textContent = 'อ่านรูปไม่สำเร็จ';
          return;
        }
        setPhotoPreview(url);
        $('form-msg').textContent = 'แนบรูปแล้ว';
      });
    });
    $('btn-clear-photo').addEventListener('click', function () {
      setPhotoPreview(null);
      $('project-photo').value = '';
    });

    $('form-project').addEventListener('submit', function (e) {
      e.preventDefault();
      var row = YebStore.upsertProject({
        id: $('project-id').value || undefined,
        title: $('project-title').value,
        fabric: $('project-fabric').value,
        how: $('project-how').value,
        mistake: $('project-mistake').value,
        nextTime: $('project-next').value,
        photoDataUrl: photoDataUrl
      });
      $('project-id').value = row.id;
      $('form-msg').textContent = 'บันทึกแล้ว ✓';
      $('btn-delete-project').hidden = false;
      YebStore.bumpSkill('projectsDone', 0); // ensure key exists
      renderProjectList();
    });
    $('btn-delete-project').addEventListener('click', function () {
      var id = $('project-id').value;
      if (!id || !confirm('ลบงานนี้?')) return;
      YebStore.deleteProject(id);
      renderProjectList();
      showScreen('projects');
    });

    $('form-body').addEventListener('submit', function (e) {
      e.preventDefault();
      YebStore.saveBody({
        bust: $('body-bust').value,
        waist: $('body-waist').value,
        hip: $('body-hip').value,
        height: $('body-height').value,
        notes: $('body-notes').value
      });
      $('body-msg').textContent = 'บันทึกขนาดตัวแล้ว ✓';
      fillBodyForm();
    });

    $('btn-new-pattern').addEventListener('click', openNewPattern);
    $('btn-pattern-back').addEventListener('click', function () {
      renderPatternList();
      showScreen('patterns');
    });
    $('form-pattern').addEventListener('submit', function (e) {
      e.preventDefault();
      var row = YebStore.upsertPattern({
        id: $('pattern-id').value || undefined,
        name: $('pattern-name').value,
        note: $('pattern-note').value,
        linkOrNotes: $('pattern-link').value,
        bodyRef: $('pattern-body-ref').value
      });
      $('pattern-id').value = row.id;
      $('pattern-msg').textContent = 'บันทึกแล้ว ✓';
      $('btn-delete-pattern').hidden = false;
    });
    $('btn-delete-pattern').addEventListener('click', function () {
      var id = $('pattern-id').value;
      if (!id || !confirm('ลบแพทเทิร์นนี้?')) return;
      YebStore.deletePattern(id);
      renderPatternList();
      showScreen('patterns');
    });

    $('form-fabric').addEventListener('submit', function (e) {
      e.preventDefault();
      var type = $('fabric-type').value;
      var seam = Number($('fabric-seam').value) || 1.5;
      var fw = Number($('fabric-width').value) || 110;
      var preset = presetPieces(type);
      var L;
      var W;
      var panels;
      var label;
      if (preset && type !== 'custom') {
        L = preset.L;
        W = preset.W;
        panels = preset.panels;
        label = preset.label;
      } else {
        L = Number($('fabric-length').value);
        W = Number($('fabric-piece-width').value);
        panels = 2;
        label = 'กำหนดเอง';
      }
      YebStore.saveFabricCalc({
        workType: type,
        sizeHint: $('fabric-size-hint').value,
        fabricWidth: String(fw),
        seamAllowance: String(seam),
        lengthCm: String(L || ''),
        widthCm: String(W || '')
      });
      var meters = calcFabricMeters(L, W, panels, fw, seam);
      var out = $('fabric-result');
      if (meters == null) {
        out.hidden = false;
        out.innerHTML = '<strong>ใส่ตัวเลขให้ครบก่อนนะ</strong>';
        return;
      }
      out.hidden = false;
      out.innerHTML =
        '<strong>ประมาณ ' +
        meters +
        ' เมตร</strong>' +
        '<p class="muted">' +
        escapeHtml(label) +
        ' · หน้ากว้าง ' +
        fw +
        ' ซม. · เผื่อตะเข็บ ' +
        seam +
        ' ซม. · ของเสีย ~10%</p>';
    });

    $('btn-start-bag').addEventListener('click', function () {
      openBuildStep(0);
    });
    $('btn-build-back').addEventListener('click', function () {
      showScreen('builds');
    });
    $('build-step-done').addEventListener('change', function () {
      YebStore.setBuildStepDone(BAG_ID, buildStepIndex, $('build-step-done').checked);
      if ($('build-step-done').checked) {
        YebStore.bumpSkill('straightSeam', 0);
      }
    });
    $('btn-build-prev').addEventListener('click', function () {
      openBuildStep(buildStepIndex - 1);
    });
    $('btn-build-next').addEventListener('click', function () {
      if ($('build-step-done').checked) {
        YebStore.setBuildStepDone(BAG_ID, buildStepIndex, true);
      }
      openBuildStep(buildStepIndex + 1);
    });
    $('btn-build-finish').addEventListener('click', function () {
      YebStore.setBuildStepDone(BAG_ID, buildStepIndex, true);
      YebStore.markBuildComplete(BAG_ID, BAG_STEPS.length);
      YebStore.bumpSkills({ projectsDone: 1, cut: 1, straightSeam: 1, hem: 1 });
      $('build-msg').textContent = 'เยี่ยม! บันทึกว่าทำถุงผ้าครบแล้ว — ไปจดในสมุดงานได้นะ';
    });

    $('btn-help-restart').addEventListener('click', renderHelpMenu);

    $('btn-zipper-bump').addEventListener('click', function () {
      var s = YebStore.bumpSkill('zipperChallenge', 1);
      YebStore.bumpSkill('zipper', 1);
      renderSkills();
      if ((s.zipperChallenge || 0) >= 5) {
        alert('ครบ 5 ครั้งแล้ว — เก่งขึ้นแน่นอน!');
      }
    });

    showScreen('home');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
