/* Home-repair UI V0.4 — diagnose + before/after + deep history */
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

  function compressImage(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, 960 / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.72));
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

  var state = {
    categoryId: null,
    problem: null,
    repairId: null,
    stepIndex: 0,
    photoBefore: null,
    photoAfter: null,
    skippedBefore: false,
    skippedAfter: false,
    diagAnswers: {},
    diagQ: 0,
    methodTitle: ''
  };

  function levelBadge(level) {
    var L = (YebRepairsData.LEVEL && YebRepairsData.LEVEL[level]) || {
      emoji: '🟢',
      label: 'ทำเองได้'
    };
    return L.emoji + ' ' + L.label;
  }

  function stepsFor() {
    if (!state.problem) return [];
    return YebRepairsData.WIZARDS[state.problem.wizard] || [];
  }

  function methodSummary() {
    var steps = stepsFor();
    var titles = [];
    for (var i = 0; i < steps.length; i++) titles.push(i + 1 + '. ' + steps[i].title);
    return titles.join(' → ');
  }

  function setPreview(imgId, url) {
    var img = $(imgId);
    if (!img) return;
    if (url) {
      img.src = url;
      img.hidden = false;
    } else {
      img.removeAttribute('src');
      img.hidden = true;
    }
  }

  function findProblem(catId, problemId) {
    var probs = YebRepairsData.PROBLEMS[catId] || [];
    for (var i = 0; i < probs.length; i++) {
      if (probs[i].id === problemId) return probs[i];
    }
    return null;
  }

  
  function renderQuickJobs() {
    var box = $('repair-quick-list');
    if (!box) return;
    var jobs = YebRepairsData.QUICK_JOBS || [];
    var html = '';
    for (var i = 0; i < jobs.length; i++) {
      var j = jobs[i];
      var L = (YebRepairsData.LEVEL && YebRepairsData.LEVEL[j.level]) || { emoji: '🟢', label: '' };
      html +=
        '<button type="button" class="quick-card level-' +
        j.level +
        '" data-quick-job="' +
        j.id +
        '"><span class="quick-emoji">' +
        j.emoji +
        '</span><span class="quick-title">' +
        escapeHtml(j.title) +
        '</span><span class="quick-meta">' +
        L.emoji +
        ' · ≈' +
        j.minutes +
        ' นาที</span><span class="quick-hint">' +
        escapeHtml(j.hint || '') +
        '</span></button>';
    }
    box.innerHTML = html;
  }

  function startQuickJob(jobId) {
    var jobs = YebRepairsData.QUICK_JOBS || [];
    var job = null;
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id === jobId) job = jobs[i];
    }
    if (!job) return;
    state.categoryId = job.categoryId;
    state.diagAnswers = { source: 'quick', quickId: job.id };
    startWizard(job.problemId, state.diagAnswers);
  }

  function renderCategories() {
    var box = $('repair-categories');
    if (!box) return;
    var html = '';
    var cats = YebRepairsData.CATEGORIES;
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      var hasDiag = !!(YebRepairsData.DIAGNOSIS && YebRepairsData.DIAGNOSIS[c.id]);
      html +=
        '<button type="button" class="big-btn" data-repair-cat="' +
        c.id +
        '"><span class="big-btn-emoji">' +
        c.emoji +
        '</span><span class="big-btn-label">' +
        escapeHtml(c.label) +
        '</span><span class="big-btn-hint">' +
        (hasDiag ? 'เช็กสั้น ๆ ก่อนซ่อม' : 'เลือกปัญหาเลย') +
        '</span></button>';
    }
    box.innerHTML = html;
  }

  function openCategory(catId) {
    state.categoryId = catId;
    state.diagAnswers = {};
    state.diagQ = 0;
    if (YebRepairsData.DIAGNOSIS && YebRepairsData.DIAGNOSIS[catId]) {
      renderDiagnose();
      showScreen('repair-diagnose');
    } else {
      openProblems(catId);
    }
  }

  function renderDiagnose() {
    var diag = YebRepairsData.DIAGNOSIS[state.categoryId];
    if (!diag) return;
    var q = diag.questions[state.diagQ];
    $('repair-diag-title').textContent = diag.title || 'เช็กก่อนซ่อม';
    $('repair-diag-q').textContent = q.text;
    var box = $('repair-diag-options');
    var html = '';
    for (var i = 0; i < q.options.length; i++) {
      var o = q.options[i];
      html +=
        '<button type="button" class="big-btn" data-diag-opt="' +
        o.id +
        '"><span class="big-btn-label">' +
        escapeHtml(o.label) +
        '</span></button>';
    }
    box.innerHTML = html;
    $('repair-diag-hint').textContent =
      'คำถาม ' + (state.diagQ + 1) + ' / ' + diag.questions.length;
  }

  function onDiagnoseOption(optId) {
    var diag = YebRepairsData.DIAGNOSIS[state.categoryId];
    var q = diag.questions[state.diagQ];
    state.diagAnswers[q.id] = optId;
    if (state.diagQ < diag.questions.length - 1) {
      state.diagQ += 1;
      renderDiagnose();
      return;
    }
    // resolve problem
    var key;
    if (diag.questions.length === 1) {
      key = state.diagAnswers[diag.questions[0].id];
    } else {
      key =
        state.diagAnswers[diag.questions[0].id] +
        '|' +
        state.diagAnswers[diag.questions[1].id];
    }
    var problemId = diag.map[key];
    if (!problemId) {
      openProblems(state.categoryId);
      $('repair-problems-title').textContent += ' (เลือกเองได้)';
      return;
    }
    var problem = findProblem(state.categoryId, problemId);
    if (!problem) {
      openProblems(state.categoryId);
      return;
    }
    startWizard(problem.id, state.diagAnswers);
  }

  function openProblems(catId) {
    state.categoryId = catId;
    var cat = null;
    for (var i = 0; i < YebRepairsData.CATEGORIES.length; i++) {
      if (YebRepairsData.CATEGORIES[i].id === catId) cat = YebRepairsData.CATEGORIES[i];
    }
    $('repair-problems-title').textContent =
      (cat ? cat.emoji + ' ' + cat.label : '') + ' — เสียแบบไหน?';
    var probs = YebRepairsData.PROBLEMS[catId] || [];
    var box = $('repair-problems');
    var html = '';
    for (var j = 0; j < probs.length; j++) {
      var p = probs[j];
      html +=
        '<button type="button" class="big-btn" data-repair-problem="' +
        p.id +
        '"><span class="big-btn-label">' +
        escapeHtml(p.label) +
        '</span><span class="big-btn-hint">' +
        levelBadge(p.level) +
        '</span></button>';
    }
    box.innerHTML = html || '<p class="empty-card">ยังไม่มีรายการ</p>';
    showScreen('repair-problems');
  }

  function startWizard(problemId, diagnosis) {
    var problem = findProblem(state.categoryId, problemId);
    if (!problem) return;
    state.problem = problem;
    state.stepIndex = 0;
    state.photoBefore = null;
    state.photoAfter = null;
    state.skippedBefore = false;
    state.skippedAfter = false;
    state.methodTitle = problem.label;
    setPreview('repair-photo-before-preview', null);
    setPreview('repair-photo-after-preview', null);
    if ($('repair-photo-before')) $('repair-photo-before').value = '';
    if ($('repair-photo-after')) $('repair-photo-after').value = '';
    if ($('repair-tip-next')) $('repair-tip-next').value = '';
    if ($('repair-before-status')) $('repair-before-status').textContent = '';
    if ($('repair-after-status')) $('repair-after-status').textContent = '';

    var steps = YebRepairsData.WIZARDS[problem.wizard] || [];
    var row = YebStore.upsertRepair({
      categoryId: state.categoryId,
      problemId: problem.id,
      wizardId: problem.wizard,
      title: problem.label,
      methodSummary: steps
        .map(function (s, idx) {
          return idx + 1 + '. ' + s.title;
        })
        .join(' → '),
      diagnosis: diagnosis || {},
      stepIndex: 0,
      doneSteps: [],
      completedAt: null,
      photoBefore: null,
      photoAfter: null,
      tipNext: ''
    });
    state.repairId = row.id;
    renderWizardStep();
    showScreen('repair-wizard');
  }

  function renderWizardStep() {
    var list = stepsFor();
    var i = state.stepIndex;
    var step = list[i];
    if (!step) return;
    var last = i >= list.length - 1;
    var first = i === 0;
    $('repair-wiz-heading').textContent = 'ขั้น ' + (i + 1) + ' / ' + list.length;
    $('repair-wiz-level').textContent = levelBadge(state.problem.level);
    $('repair-wiz-title').textContent = step.title;
    $('repair-wiz-body').textContent =
      step.body + (step.tip ? '\n\nหมายเหตุ: ' + step.tip : '');
    var repair = YebStore.getRepair(state.repairId);
    var done = repair && (repair.doneSteps || []).indexOf(i) !== -1;
    $('repair-wiz-done').checked = !!done;
    $('btn-repair-prev').disabled = first;
    $('btn-repair-next').hidden = last;
    $('btn-repair-finish').hidden = !last;
    // before photo: emphasize on first step, keep available
    if ($('repair-before-wrap')) {
      $('repair-before-wrap').hidden = false;
      $('repair-before-wrap').classList.toggle('photo-emphasis', first && !state.photoBefore && !state.skippedBefore);
    }
    if ($('repair-after-wrap')) $('repair-after-wrap').hidden = !last;
    if ($('repair-tip-wrap')) $('repair-tip-wrap').hidden = !last;
    $('repair-wiz-msg').textContent = '';
  }

  function persistStep(markDone) {
    var repair = YebStore.getRepair(state.repairId);
    if (!repair) return;
    var doneSteps = (repair.doneSteps || []).slice();
    var idx = doneSteps.indexOf(state.stepIndex);
    if (markDone && idx === -1) doneSteps.push(state.stepIndex);
    if (!markDone && idx !== -1) doneSteps.splice(idx, 1);
    YebStore.upsertRepair({
      id: state.repairId,
      stepIndex: state.stepIndex,
      doneSteps: doneSteps,
      photoBefore: state.photoBefore,
      photoAfter: state.photoAfter,
      tipNext: ($('repair-tip-next') && $('repair-tip-next').value) || '',
      methodSummary: methodSummary(),
      diagnosis: state.diagAnswers || repair.diagnosis || {}
    });
  }

  function renderHistory() {
    var box = $('repair-history-list');
    if (!box) return;
    var list = YebStore.listRepairs();
    if (!list.length) {
      box.innerHTML = '<p class="empty-card">ยังไม่มีประวัติซ่อม</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      html +=
        '<button type="button" class="project-card" data-repair-detail="' +
        escapeHtml(r.id) +
        '">' +
        (r.photoAfter || r.photoBefore
          ? '<img class="project-thumb" src="' +
            (r.photoAfter || r.photoBefore) +
            '" alt="" />'
          : '<div class="project-thumb placeholder">ไม่มีรูป</div>') +
        '<div class="project-card-body"><strong>' +
        escapeHtml(r.title) +
        '</strong><span class="project-next">' +
        (r.completedAt
          ? 'เสร็จแล้ว'
          : 'ยังไม่จบ · ขั้น ' + ((r.stepIndex || 0) + 1)) +
        '</span>' +
        (r.tipNext
          ? '<span class="project-miss">จำไว้: ' + escapeHtml(r.tipNext) + '</span>'
          : '') +
        '</div></button>';
    }
    box.innerHTML = html;
  }

  function openDetail(id) {
    var r = YebStore.getRepair(id);
    if (!r) return;
    var box = $('repair-detail-body');
    if (!box) return;
    var diagText = '';
    if (r.diagnosis) {
      var parts = [];
      for (var k in r.diagnosis) {
        if (Object.prototype.hasOwnProperty.call(r.diagnosis, k)) {
          parts.push(k + '=' + r.diagnosis[k]);
        }
      }
      if (parts.length) diagText = '<p class="muted">วินิจฉัย: ' + escapeHtml(parts.join(', ')) + '</p>';
    }
    box.innerHTML =
      '<h3>' +
      escapeHtml(r.title) +
      '</h3>' +
      '<p>' +
      (r.completedAt ? '✅ เสร็จแล้ว' : '⏳ ยังไม่จบ') +
      '</p>' +
      diagText +
      '<p><strong>วิธีที่ใช้</strong><br />' +
      escapeHtml(r.methodSummary || '—') +
      '</p>' +
      (r.tipNext
        ? '<p><strong>จำไว้รอบหน้า</strong><br />' + escapeHtml(r.tipNext) + '</p>'
        : '') +
      '<div class="photo-compare">' +
      (r.photoBefore
        ? '<figure><img src="' +
          r.photoBefore +
          '" alt="ก่อน" /><figcaption>ก่อน</figcaption></figure>'
        : '<p class="muted">ไม่มีรูปก่อน</p>') +
      (r.photoAfter
        ? '<figure><img src="' +
          r.photoAfter +
          '" alt="หลัง" /><figcaption>หลัง</figcaption></figure>'
        : '<p class="muted">ไม่มีรูปหลัง</p>') +
      '</div>';
    showScreen('repair-detail');
  }

  function wirePhoto(inputId, previewId, which) {
    var input = $(inputId);
    if (!input) return;
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      compressImage(file, function (url) {
        if (!url) return;
        if (which === 'before') {
          state.photoBefore = url;
          state.skippedBefore = false;
          if ($('repair-before-status')) $('repair-before-status').textContent = 'มีรูปก่อนแล้ว';
        } else {
          state.photoAfter = url;
          state.skippedAfter = false;
          if ($('repair-after-status')) $('repair-after-status').textContent = 'มีรูปหลังแล้ว';
        }
        setPreview(previewId, url);
        persistStep($('repair-wiz-done') && $('repair-wiz-done').checked);
      });
    });
  }

  function bindRepair() {
    if (!window.YebRepairsData || !window.YebStore || !YebStore.upsertRepair) {
      console.warn('repair deps missing');
      return;
    }
    renderQuickJobs();
    renderCategories();

    document.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-go="repair"]')) {
        renderQuickJobs();
        renderCategories();
        showScreen('repair');
        return;
      }
      if (ev.target.closest('[data-go="repair-history"]')) {
        renderHistory();
        showScreen('repair-history');
        return;
      }
      var qj = ev.target.closest('[data-quick-job]');
      if (qj) {
        startQuickJob(qj.getAttribute('data-quick-job'));
        return;
      }
      var cat = ev.target.closest('[data-repair-cat]');
      if (cat) {
        openCategory(cat.getAttribute('data-repair-cat'));
        return;
      }
      var diag = ev.target.closest('[data-diag-opt]');
      if (diag) {
        onDiagnoseOption(diag.getAttribute('data-diag-opt'));
        return;
      }
      var prob = ev.target.closest('[data-repair-problem]');
      if (prob) {
        startWizard(prob.getAttribute('data-repair-problem'), state.diagAnswers);
        return;
      }
      var detail = ev.target.closest('[data-repair-detail]');
      if (detail) {
        openDetail(detail.getAttribute('data-repair-detail'));
      }
    });

    if ($('btn-repair-diag-back')) {
      $('btn-repair-diag-back').addEventListener('click', function () {
        showScreen('repair');
      });
    }
    if ($('btn-repair-back-cat')) {
      $('btn-repair-back-cat').addEventListener('click', function () {
        showScreen('repair');
      });
    }
    if ($('btn-repair-wiz-back')) {
      $('btn-repair-wiz-back').addEventListener('click', function () {
        if (YebRepairsData.DIAGNOSIS && YebRepairsData.DIAGNOSIS[state.categoryId]) {
          state.diagQ = 0;
          state.diagAnswers = {};
          renderDiagnose();
          showScreen('repair-diagnose');
        } else {
          showScreen('repair-problems');
        }
      });
    }

    if ($('repair-wiz-done')) {
      $('repair-wiz-done').addEventListener('change', function () {
        persistStep($('repair-wiz-done').checked);
      });
    }
    if ($('btn-repair-prev')) {
      $('btn-repair-prev').addEventListener('click', function () {
        persistStep($('repair-wiz-done').checked);
        if (state.stepIndex > 0) {
          state.stepIndex -= 1;
          renderWizardStep();
        }
      });
    }
    if ($('btn-repair-next')) {
      $('btn-repair-next').addEventListener('click', function () {
        persistStep(true);
        $('repair-wiz-done').checked = true;
        if (state.stepIndex < stepsFor().length - 1) {
          state.stepIndex += 1;
          YebStore.upsertRepair({ id: state.repairId, stepIndex: state.stepIndex });
          renderWizardStep();
        }
      });
    }
    if ($('btn-repair-finish')) {
      $('btn-repair-finish').addEventListener('click', function () {
        persistStep(true);
        var all = [];
        for (var i = 0; i < stepsFor().length; i++) all.push(i);
        YebStore.upsertRepair({
          id: state.repairId,
          doneSteps: all,
          stepIndex: stepsFor().length - 1,
          photoBefore: state.photoBefore,
          photoAfter: state.photoAfter,
          tipNext: ($('repair-tip-next') && $('repair-tip-next').value) || '',
          methodSummary: methodSummary(),
          diagnosis: state.diagAnswers || {},
          completedAt: new Date().toISOString()
        });
        $('repair-wiz-msg').textContent = 'บันทึกงานซ่อมแล้ว ✓ — ดูได้ที่ประวัติ';
      });
    }

    if ($('btn-skip-before')) {
      $('btn-skip-before').addEventListener('click', function () {
        state.skippedBefore = true;
        state.photoBefore = null;
        setPreview('repair-photo-before-preview', null);
        if ($('repair-before-status')) $('repair-before-status').textContent = 'ข้ามรูปก่อนแล้ว';
        persistStep($('repair-wiz-done') && $('repair-wiz-done').checked);
      });
    }
    if ($('btn-skip-after')) {
      $('btn-skip-after').addEventListener('click', function () {
        state.skippedAfter = true;
        state.photoAfter = null;
        setPreview('repair-photo-after-preview', null);
        if ($('repair-after-status')) $('repair-after-status').textContent = 'ข้ามรูปหลังแล้ว';
        persistStep($('repair-wiz-done') && $('repair-wiz-done').checked);
      });
    }

    wirePhoto('repair-photo-before', 'repair-photo-before-preview', 'before');
    wirePhoto('repair-photo-after', 'repair-photo-after-preview', 'after');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindRepair);
  } else {
    bindRepair();
  }
})();
