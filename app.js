/* Yeb Sewing Companion V0.7 — projects, patterns, fabric, builds, help, skills */
(function () {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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

  function compressImage(file, maxW, quality, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var w = img.width;
        var h = img.height;
        var scale = Math.min(1, (maxW || 960) / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
        cb(canvas.toDataURL('image/jpeg', quality || 0.7));
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
    if (!box || !window.YebStore) return;
    var list = YebStore.listProjects();
    if (!list.length) {
      box.innerHTML =
        '<p class="empty-card">ยังไม่มีงาน<br />กด “บันทึกงานใหม่” หลังเย็บเสร็จชิ้นแรก</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      html +=
        '<button type="button" class="project-card" data-edit="' +
        p.id +
        '">' +
        (p.photoDataUrl
          ? '<img class="project-thumb" src="' + p.photoDataUrl + '" alt="" />'
          : '<div class="project-thumb placeholder">ไม่มีรูป</div>') +
        '<div class="project-card-body">' +
        '<strong>' +
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
    var file = $('project-photo');
    if (file) file.value = '';
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

  function fillBodyForm() {
    var b = YebStore.getBody();
    $('body-bust').value = b.bust || '';
    $('body-waist').value = b.waist || '';
    $('body-hip').value = b.hip || '';
    $('body-height').value = b.height || '';
    $('body-notes').value = b.notes || '';
    $('body-msg').textContent = '';
    var u = $('body-updated');
    if (u) {
      u.textContent = b.updatedAt
        ? 'บันทึกล่าสุด: ' + new Date(b.updatedAt).toLocaleString('th-TH')
        : '';
    }
  }

  /* —— Patterns V0.3 —— */
  var BODY_REF_LABELS = {
    bust: 'รอบอก',
    waist: 'รอบเอว',
    hip: 'รอบสะโพก',
    height: 'ส่วนสูง',
    custom: 'โน้ตขนาดตัว'
  };

  function bodyRefHint(ref) {
    var b = YebStore.getBody();
    if (!ref) return '';
    if (ref === 'bust') return b.bust ? 'ขนาดตัวตอนนี้: รอบอก ' + b.bust + ' ซม.' : 'ยังไม่ได้จดรอบอก — ไปหน้าขนาดตัวได้';
    if (ref === 'waist') return b.waist ? 'ขนาดตัวตอนนี้: รอบเอว ' + b.waist + ' ซม.' : 'ยังไม่ได้จดรอบเอว — ไปหน้าขนาดตัวได้';
    if (ref === 'hip') return b.hip ? 'ขนาดตัวตอนนี้: รอบสะโพก ' + b.hip + ' ซม.' : 'ยังไม่ได้จดรอบสะโพก — ไปหน้าขนาดตัวได้';
    if (ref === 'height') return b.height ? 'ขนาดตัวตอนนี้: ส่วนสูง ' + b.height + ' ซม.' : 'ยังไม่ได้จดส่วนสูง — ไปหน้าขนาดตัวได้';
    if (ref === 'custom') return b.notes ? 'โน้ตขนาดตัว: ' + b.notes : 'ยังไม่มีโน้ตขนาดตัว';
    return '';
  }

  function updatePatternBodyHint() {
    var ref = $('pattern-body-ref').value;
    var box = $('pattern-body-hint');
    var text = bodyRefHint(ref);
    if (text) {
      box.textContent = text;
      box.hidden = false;
    } else {
      box.textContent = '';
      box.hidden = true;
    }
  }

  function renderPatternList() {
    var box = $('pattern-list');
    if (!box) return;
    var list = YebStore.listPatterns();
    if (!list.length) {
      box.innerHTML =
        '<p class="empty-card">ยังไม่มีแพทเทิร์น<br />กด “เพิ่มแพทเทิร์น” เพื่อเก็บลิงก์หรือโน้ต</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      var refLabel = p.bodyRef ? BODY_REF_LABELS[p.bodyRef] || p.bodyRef : '';
      html +=
        '<button type="button" class="info-card" data-pattern="' +
        p.id +
        '">' +
        '<strong>' +
        escapeHtml(p.name) +
        '</strong>' +
        (p.note ? '<span class="card-sub">' + escapeHtml(p.note) + '</span>' : '') +
        (refLabel ? '<span class="card-tag">ผูก: ' + escapeHtml(refLabel) + '</span>' : '') +
        '</button>';
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
    updatePatternBodyHint();
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
    updatePatternBodyHint();
    showScreen('pattern-form');
  }

  /* —— Fabric V0.4 —— */
  function fillFabricForm() {
    var f = YebStore.getFabricCalc();
    $('fabric-work-type').value = f.workType || 'bag';
    $('fabric-size-hint').value = f.sizeHint || '';
    $('fabric-length').value = f.lengthCm || '';
    $('fabric-width-piece').value = f.widthCm || '';
    $('fabric-bolt-width').value = f.fabricWidth || '110';
    $('fabric-seam').value = f.seamAllowance || '1.5';
    $('fabric-result').hidden = true;
  }

  function runFabricCalc() {
    var input = {
      workType: $('fabric-work-type').value,
      sizeHint: $('fabric-size-hint').value,
      lengthCm: $('fabric-length').value,
      widthCm: $('fabric-width-piece').value,
      fabricWidth: $('fabric-bolt-width').value,
      seamAllowance: $('fabric-seam').value
    };
    YebStore.saveFabricCalc(input);
    var result = YebCatalog.estimateFabric(input);
    $('fabric-meters').textContent = result.meters.toFixed(2).replace(/\.00$/, '') + ' เมตร';
    $('fabric-formula').textContent = result.formulaTh;
    $('fabric-result').hidden = false;
  }

  /* —— Builds V0.5 —— */
  var currentBuildId = null;
  var currentStepIndex = 0;
  var awardedBuilds = {};

  function renderBuildCatalog() {
    var box = $('build-catalog');
    if (!box) return;
    var html = '';
    var builds = YebCatalog.BUILDS;
    for (var i = 0; i < builds.length; i++) {
      var b = builds[i];
      var prog = YebStore.getBuildProgress(b.id);
      var done = (prog.doneSteps || []).length;
      var total = b.steps.length;
      var pct = total ? Math.round((done / total) * 100) : 0;
      var status = prog.completedAt
        ? 'ทำครบแล้ว ✓'
        : done
          ? 'ทำแล้ว ' + done + '/' + total + ' ขั้น'
          : 'ยังไม่เริ่ม';
      html +=
        '<button type="button" class="info-card" data-build="' +
        b.id +
        '">' +
        '<span class="card-emoji">' +
        b.emoji +
        '</span>' +
        '<strong>' +
        escapeHtml(b.name) +
        '</strong>' +
        '<span class="card-sub">ระดับ: ' +
        escapeHtml(b.difficulty) +
        '</span>' +
        '<span class="card-tag">' +
        escapeHtml(status) +
        (pct && !prog.completedAt ? ' · ' + pct + '%' : '') +
        '</span>' +
        '</button>';
    }
    box.innerHTML = html;
  }

  function openBuildDetail(id) {
    var b = YebCatalog.getBuild(id);
    if (!b) return;
    currentBuildId = id;
    $('build-detail-title').textContent = b.emoji + ' ' + b.name;
    var prog = YebStore.getBuildProgress(id);
    var mats =
      '<ul class="plain-list">' +
      b.materials
        .map(function (m) {
          return '<li>' + escapeHtml(m) + '</li>';
        })
        .join('') +
      '</ul>';
    var skillNames = (b.skills || [])
      .map(function (s) {
        return YebCatalog.SKILL_LABELS[s] || s;
      })
      .join(' · ');
    var done = (prog.doneSteps || []).length;
    $('build-detail-body').innerHTML =
      '<p><strong>ระดับ:</strong> ' +
      escapeHtml(b.difficulty) +
      '</p>' +
      '<p><strong>ของที่ใช้:</strong></p>' +
      mats +
      '<p><strong>ทักษะที่ได้ฝึก:</strong> ' +
      escapeHtml(skillNames) +
      '</p>' +
      '<p class="muted">ทั้งหมด ' +
      b.steps.length +
      ' ขั้น' +
      (done ? ' · ทำไปแล้ว ' + done + ' ขั้น' : '') +
      (prog.completedAt ? ' · ทำครบแล้ว' : '') +
      '</p>';
    $('btn-start-steps').textContent = done ? 'ทำต่อทีละขั้น' : 'เริ่มทำทีละขั้น';
    $('btn-reset-build').hidden = !done;
    showScreen('build-detail');
  }

  function firstIncompleteStep(buildId) {
    var b = YebCatalog.getBuild(buildId);
    var prog = YebStore.getBuildProgress(buildId);
    var doneSet = {};
    for (var i = 0; i < (prog.doneSteps || []).length; i++) {
      doneSet[prog.doneSteps[i]] = true;
    }
    for (var s = 0; s < b.steps.length; s++) {
      if (!doneSet[s]) return s;
    }
    return 0;
  }

  function openBuildStep(buildId, index) {
    var b = YebCatalog.getBuild(buildId);
    if (!b) return;
    currentBuildId = buildId;
    if (index < 0) index = 0;
    if (index >= b.steps.length) index = b.steps.length - 1;
    currentStepIndex = index;
    var step = b.steps[index];
    var prog = YebStore.getBuildProgress(buildId);
    var doneSet = {};
    for (var i = 0; i < (prog.doneSteps || []).length; i++) {
      doneSet[prog.doneSteps[i]] = true;
    }
    $('step-project-name').textContent = b.name;
    $('step-progress').textContent =
      'ขั้นที่ ' + (index + 1) + ' จาก ' + b.steps.length +
      (doneSet[index] ? ' · ทำแล้ว ✓' : '');
    $('step-number').textContent = 'ขั้น ' + (index + 1);
    $('step-title').textContent = step.title;
    $('step-body').textContent = step.body;
    var tip = $('step-tip');
    if (step.tip) {
      tip.textContent = 'เคล็ดลับ: ' + step.tip;
      tip.hidden = false;
    } else {
      tip.hidden = true;
    }
    $('btn-step-done').textContent = doneSet[index]
      ? '✓ ทำเสร็จแล้ว (กดอีกครั้งได้)'
      : '✓ ทำเสร็จแล้ว';
    $('btn-step-prev').disabled = index === 0;
    $('btn-step-next').disabled = index >= b.steps.length - 1;
    showScreen('build-step');
  }

  function markStepDone() {
    var b = YebCatalog.getBuild(currentBuildId);
    if (!b) return;
    var step = b.steps[currentStepIndex];
    var progBefore = YebStore.getBuildProgress(currentBuildId);
    var wasDone = (progBefore.doneSteps || []).indexOf(currentStepIndex) >= 0;

    YebStore.setBuildStepDone(currentBuildId, currentStepIndex, true);

    if (!wasDone && step.skill) {
      YebStore.bumpSkill(step.skill, 1);
    }

    var prog = YebStore.getBuildProgress(currentBuildId);
    var allDone = (prog.doneSteps || []).length >= b.steps.length;
    if (allDone && !prog.completedAt) {
      YebStore.markBuildComplete(currentBuildId, b.steps.length);
      if (!awardedBuilds[currentBuildId]) {
        YebStore.bumpSkill('projectsDone', 1);
        awardedBuilds[currentBuildId] = true;
      }
    }

    if (allDone) {
      $('step-progress').textContent =
        'ขั้นที่ ' + (currentStepIndex + 1) + ' จาก ' + b.steps.length + ' · ทำครบทุกขั้นแล้ว 🎉';
      $('btn-step-done').textContent = '✓ ทำครบแล้ว — กลับรายละเอียด';
      $('btn-step-done').dataset.allDone = '1';
    } else {
      openBuildStep(currentBuildId, currentStepIndex);
      if (currentStepIndex < b.steps.length - 1) {
        setTimeout(function () {
          openBuildStep(currentBuildId, currentStepIndex + 1);
        }, 350);
      }
    }
  }

  /* —— Help V0.6 —— */
  var helpTopicId = null;
  var helpNodeId = null;

  function renderHelpTopics() {
    var box = $('help-topics');
    if (!box) return;
    var html = '';
    var topics = YebCatalog.HELP_TOPICS;
    for (var i = 0; i < topics.length; i++) {
      var t = topics[i];
      html +=
        '<button type="button" class="info-card" data-help="' +
        t.id +
        '">' +
        '<span class="card-emoji">' +
        t.emoji +
        '</span>' +
        '<strong>' +
        escapeHtml(t.name) +
        '</strong>' +
        '</button>';
    }
    box.innerHTML = html;
  }

  function openHelpTopic(id) {
    var t = YebCatalog.getHelpTopic(id);
    if (!t) return;
    helpTopicId = id;
    helpNodeId = t.start;
    $('help-tree-title').textContent = t.emoji + ' ' + t.name;
    $('btn-help-restart').hidden = true;
    renderHelpNode();
    showScreen('help-tree');
  }

  function renderHelpNode() {
    var t = YebCatalog.getHelpTopic(helpTopicId);
    if (!t) return;
    var node = t.nodes[helpNodeId];
    if (!node) return;
    var qEl = $('help-question');
    var aEl = $('help-answers');
    var sEl = $('help-solution');

    if (node.solution) {
      qEl.textContent = 'คำแนะนำ';
      aEl.innerHTML = '';
      sEl.hidden = false;
      sEl.innerHTML = '<p>' + escapeHtml(node.solution) + '</p>';
      $('btn-help-restart').hidden = false;
      return;
    }

    qEl.textContent = node.q;
    sEl.hidden = true;
    sEl.innerHTML = '';
    $('btn-help-restart').hidden = false;
    var html = '';
    for (var i = 0; i < node.answers.length; i++) {
      var a = node.answers[i];
      html +=
        '<button type="button" class="btn-answer" data-next="' +
        escapeHtml(a.next) +
        '">' +
        escapeHtml(a.label) +
        '</button>';
    }
    aEl.innerHTML = html;
  }

  /* —— Skills V0.7 —— */
  function skillMarks(n) {
    if (n <= 0) return 'ยังไม่ฝึก';
    if (n === 1) return '✓';
    if (n === 2) return '✓✓';
    if (n <= 5) return '✓✓ · ' + n + ' ครั้ง';
    return '✓✓ · คล่องแล้ว (' + n + ')';
  }

  function renderSkills() {
    var box = $('skills-list');
    if (!box) return;
    var skills = YebStore.getSkills();
    var order = [
      'cut',
      'straightSeam',
      'finishEdge',
      'press',
      'hem',
      'gather',
      'zipper',
      'sleeve',
      'neckline',
      'projectsDone'
    ];
    var html = '';
    for (var i = 0; i < order.length; i++) {
      var key = order[i];
      var n = skills[key] || 0;
      html +=
        '<div class="skill-row">' +
        '<span class="skill-name">' +
        escapeHtml(YebCatalog.SKILL_LABELS[key] || key) +
        '</span>' +
        '<span class="skill-marks">' +
        escapeHtml(skillMarks(n)) +
        '</span>' +
        '</div>';
    }
    box.innerHTML = html;
    $('zipper-count').textContent = String(skills.zipperChallenge || 0);
  }

  /* —— Navigation & bind —— */
  function bind() {
    document.addEventListener('click', function (ev) {
      var go = ev.target.closest('[data-go]');
      if (go && !go.disabled) {
        var name = go.getAttribute('data-go');
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
          renderBuildCatalog();
          showScreen('builds');
          return;
        }
        if (name === 'help') {
          renderHelpTopics();
          showScreen('help');
          return;
        }
        if (name === 'skills') {
          renderSkills();
          showScreen('skills');
          return;
        }
        if (name === 'home') {
          showScreen('home');
          return;
        }
      }

      var edit = ev.target.closest('[data-edit]');
      if (edit) {
        openEditProject(edit.getAttribute('data-edit'));
        return;
      }

      var pat = ev.target.closest('[data-pattern]');
      if (pat) {
        openEditPattern(pat.getAttribute('data-pattern'));
        return;
      }

      var build = ev.target.closest('[data-build]');
      if (build) {
        openBuildDetail(build.getAttribute('data-build'));
        return;
      }

      var help = ev.target.closest('[data-help]');
      if (help) {
        openHelpTopic(help.getAttribute('data-help'));
        return;
      }

      var next = ev.target.closest('[data-next]');
      if (next && $('help-answers') && $('help-answers').contains(next)) {
        helpNodeId = next.getAttribute('data-next');
        renderHelpNode();
      }
    });

    /* projects */
    var newBtn = $('btn-new-project');
    if (newBtn) newBtn.addEventListener('click', openNewProject);

    var backForm = $('btn-form-back');
    if (backForm) {
      backForm.addEventListener('click', function () {
        renderProjectList();
        showScreen('projects');
      });
    }

    var photoInput = $('project-photo');
    if (photoInput) {
      photoInput.addEventListener('change', function () {
        var file = photoInput.files && photoInput.files[0];
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
    }
    var clearPhoto = $('btn-clear-photo');
    if (clearPhoto) {
      clearPhoto.addEventListener('click', function () {
        setPhotoPreview(null);
        if (photoInput) photoInput.value = '';
      });
    }

    var form = $('form-project');
    if (form) {
      form.addEventListener('submit', function (e) {
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
        renderProjectList();
      });
    }

    var del = $('btn-delete-project');
    if (del) {
      del.addEventListener('click', function () {
        var id = $('project-id').value;
        if (!id) return;
        if (!confirm('ลบงานนี้จากสมุด?')) return;
        YebStore.deleteProject(id);
        renderProjectList();
        showScreen('projects');
      });
    }

    var bodyForm = $('form-body');
    if (bodyForm) {
      bodyForm.addEventListener('submit', function (e) {
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
    }

    /* patterns */
    var newPat = $('btn-new-pattern');
    if (newPat) newPat.addEventListener('click', openNewPattern);

    var patBack = $('btn-pattern-back');
    if (patBack) {
      patBack.addEventListener('click', function () {
        renderPatternList();
        showScreen('patterns');
      });
    }

    var patRef = $('pattern-body-ref');
    if (patRef) patRef.addEventListener('change', updatePatternBodyHint);

    var patForm = $('form-pattern');
    if (patForm) {
      patForm.addEventListener('submit', function (e) {
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
        $('pattern-form-title').textContent = 'แก้แพทเทิร์น';
      });
    }

    var delPat = $('btn-delete-pattern');
    if (delPat) {
      delPat.addEventListener('click', function () {
        var id = $('pattern-id').value;
        if (!id) return;
        if (!confirm('ลบแพทเทิร์นนี้?')) return;
        YebStore.deletePattern(id);
        renderPatternList();
        showScreen('patterns');
      });
    }

    /* fabric */
    var fabForm = $('form-fabric');
    if (fabForm) {
      fabForm.addEventListener('submit', function (e) {
        e.preventDefault();
        runFabricCalc();
      });
    }

    /* builds */
    var detailBack = $('btn-build-detail-back');
    if (detailBack) {
      detailBack.addEventListener('click', function () {
        renderBuildCatalog();
        showScreen('builds');
      });
    }

    var startSteps = $('btn-start-steps');
    if (startSteps) {
      startSteps.addEventListener('click', function () {
        openBuildStep(currentBuildId, firstIncompleteStep(currentBuildId));
      });
    }

    var resetBuild = $('btn-reset-build');
    if (resetBuild) {
      resetBuild.addEventListener('click', function () {
        if (!confirm('ล้างความคืบหน้าชิ้นนี้ แล้วเริ่มใหม่?')) return;
        var data = YebStore.getBuilds();
        data.progress[currentBuildId] = { doneSteps: [], completedAt: null };
        localStorage.setItem(YebStore.KEYS.builds, JSON.stringify(data));
        awardedBuilds[currentBuildId] = false;
        openBuildDetail(currentBuildId);
      });
    }

    var stepBack = $('btn-step-back');
    if (stepBack) {
      stepBack.addEventListener('click', function () {
        openBuildDetail(currentBuildId);
      });
    }

    var stepDone = $('btn-step-done');
    if (stepDone) {
      stepDone.addEventListener('click', function () {
        if (stepDone.dataset.allDone === '1') {
          stepDone.dataset.allDone = '';
          openBuildDetail(currentBuildId);
          return;
        }
        markStepDone();
      });
    }

    var stepPrev = $('btn-step-prev');
    if (stepPrev) {
      stepPrev.addEventListener('click', function () {
        openBuildStep(currentBuildId, currentStepIndex - 1);
      });
    }

    var stepNext = $('btn-step-next');
    if (stepNext) {
      stepNext.addEventListener('click', function () {
        openBuildStep(currentBuildId, currentStepIndex + 1);
      });
    }

    /* help */
    var helpBack = $('btn-help-tree-back');
    if (helpBack) {
      helpBack.addEventListener('click', function () {
        renderHelpTopics();
        showScreen('help');
      });
    }

    var helpRestart = $('btn-help-restart');
    if (helpRestart) {
      helpRestart.addEventListener('click', function () {
        var t = YebCatalog.getHelpTopic(helpTopicId);
        if (!t) return;
        helpNodeId = t.start;
        renderHelpNode();
      });
    }

    /* skills */
    var zipPlus = $('btn-zipper-plus');
    if (zipPlus) {
      zipPlus.addEventListener('click', function () {
        YebStore.bumpSkill('zipperChallenge', 1);
        YebStore.bumpSkill('zipper', 1);
        renderSkills();
      });
    }

    showScreen('home');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
