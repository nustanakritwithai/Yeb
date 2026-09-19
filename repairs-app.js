/* Home-repair UI — YebStore + YebRepairsData */
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
    photoAfter: null
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

  function renderCategories() {
    var box = $('repair-categories');
    if (!box) return;
    var html = '';
    var cats = YebRepairsData.CATEGORIES;
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      html +=
        '<button type="button" class="big-btn" data-repair-cat="' +
        c.id +
        '"><span class="big-btn-emoji">' +
        c.emoji +
        '</span><span class="big-btn-label">' +
        escapeHtml(c.label) +
        '</span></button>';
    }
    box.innerHTML = html;
  }

  function openProblems(catId) {
    state.categoryId = catId;
    var cat = null;
    for (var i = 0; i < YebRepairsData.CATEGORIES.length; i++) {
      if (YebRepairsData.CATEGORIES[i].id === catId) cat = YebRepairsData.CATEGORIES[i];
    }
    var title = $('repair-problems-title');
    if (title) title.textContent = (cat ? cat.emoji + ' ' + cat.label : '') + ' — เสียแบบไหน?';
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

  function startWizard(problemId) {
    var probs = YebRepairsData.PROBLEMS[state.categoryId] || [];
    var problem = null;
    for (var i = 0; i < probs.length; i++) {
      if (probs[i].id === problemId) problem = probs[i];
    }
    if (!problem) return;
    state.problem = problem;
    state.stepIndex = 0;
    state.photoBefore = null;
    state.photoAfter = null;
    setPreview('repair-photo-before-preview', null);
    setPreview('repair-photo-after-preview', null);
    if ($('repair-photo-before')) $('repair-photo-before').value = '';
    if ($('repair-photo-after')) $('repair-photo-after').value = '';
    if ($('repair-tip-next')) $('repair-tip-next').value = '';

    var row = YebStore.upsertRepair({
      categoryId: state.categoryId,
      problemId: problem.id,
      wizardId: problem.wizard,
      title: problem.label,
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
    $('repair-wiz-heading').textContent = 'ขั้น ' + (i + 1) + ' / ' + list.length;
    $('repair-wiz-level').textContent = levelBadge(state.problem.level);
    $('repair-wiz-title').textContent = step.title;
    $('repair-wiz-body').textContent =
      step.body + (step.tip ? '\n\nหมายเหตุ: ' + step.tip : '');
    var repair = YebStore.getRepair(state.repairId);
    var done = repair && (repair.doneSteps || []).indexOf(i) !== -1;
    $('repair-wiz-done').checked = !!done;
    $('btn-repair-prev').disabled = i === 0;
    $('btn-repair-next').hidden = last;
    $('btn-repair-finish').hidden = !last;
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
      tipNext: ($('repair-tip-next') && $('repair-tip-next').value) || ''
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
        '<div class="project-card"><div class="project-card-body"><strong>' +
        escapeHtml(r.title) +
        '</strong><span class="project-next">' +
        (r.completedAt
          ? 'เสร็จแล้ว'
          : 'ยังไม่จบ · ขั้น ' + ((r.stepIndex || 0) + 1)) +
        '</span>' +
        (r.tipNext
          ? '<span class="project-miss">ครั้งหน้า: ' +
            escapeHtml(r.tipNext) +
            '</span>'
          : '') +
        '</div></div>';
    }
    box.innerHTML = html;
  }

  function wirePhoto(inputId, previewId, which) {
    var input = $(inputId);
    if (!input) return;
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      if (!file) return;
      compressImage(file, function (url) {
        if (!url) return;
        if (which === 'before') state.photoBefore = url;
        else state.photoAfter = url;
        setPreview(previewId, url);
        persistStep($('repair-wiz-done').checked);
      });
    });
  }

  function bindRepair() {
    if (!window.YebRepairsData || !window.YebStore || !YebStore.upsertRepair) {
      console.warn('repair deps missing');
      return;
    }
    renderCategories();

    document.addEventListener('click', function (ev) {
      var goRepair = ev.target.closest('[data-go="repair"]');
      if (goRepair) {
        renderCategories();
        showScreen('repair');
        return;
      }
      if (ev.target.closest('[data-go="repair-history"]')) {
        renderHistory();
        showScreen('repair-history');
        return;
      }
      var cat = ev.target.closest('[data-repair-cat]');
      if (cat) {
        openProblems(cat.getAttribute('data-repair-cat'));
        return;
      }
      var prob = ev.target.closest('[data-repair-problem]');
      if (prob) startWizard(prob.getAttribute('data-repair-problem'));
    });

    var backCat = $('btn-repair-back-cat');
    if (backCat) {
      backCat.addEventListener('click', function () {
        showScreen('repair');
      });
    }
    var wizBack = $('btn-repair-wiz-back');
    if (wizBack) {
      wizBack.addEventListener('click', function () {
        showScreen('repair-problems');
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
          completedAt: new Date().toISOString()
        });
        $('repair-wiz-msg').textContent = 'บันทึกงานซ่อมแล้ว ✓';
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
