/* Yeb Sewing Companion V0.1 — projects notebook + body measurements */
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
          ? '<img class="project-thumb" src="' +
            p.photoDataUrl +
            '" alt="" />'
          : '<div class="project-thumb placeholder">ไม่มีรูป</div>') +
        '<div class="project-card-body">' +
        '<strong>' +
        escapeHtml(p.title) +
        '</strong>' +
        (p.nextTime
          ? '<span class="project-next">ครั้งหน้า: ' +
            escapeHtml(p.nextTime) +
            '</span>'
          : '') +
        (p.mistake
          ? '<span class="project-miss">พลาด: ' +
            escapeHtml(p.mistake) +
            '</span>'
          : '') +
        '</div></button>';
    }
    box.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
        if (name === 'home') {
          showScreen('home');
          return;
        }
      }
      var edit = ev.target.closest('[data-edit]');
      if (edit) {
        openEditProject(edit.getAttribute('data-edit'));
      }
    });

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

    showScreen('home');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
