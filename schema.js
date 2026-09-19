/**
 * Yeb Sewing Companion — local schema (V0.3–V0.7)
 * Keys live in localStorage only. No login / AI.
 */
(function (global) {
  'use strict';

  var KEYS = {
    projects: 'yeb.projects.v1',
    body: 'yeb.body.v1',
    patterns: 'yeb.patterns.v1',
    fabricCalc: 'yeb.fabricCalc.v1',
    builds: 'yeb.builds.v1',
    skills: 'yeb.skills.v1',
    repairs: 'yeb.repairs.v1'
  };

  function uid(prefix) {
    return (
      (prefix || 'id') +
      '-' +
      Date.now().toString(36) +
      '-' +
      Math.floor(Math.random() * 1e5).toString(36)
    );
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /* —— Projects (V0.1) —— */

  function listProjects() {
    var list = readJson(KEYS.projects, []);
    return Array.isArray(list) ? list : [];
  }

  function saveProjects(list) {
    writeJson(KEYS.projects, list || []);
  }

  function getProject(id) {
    var list = listProjects();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function upsertProject(partial) {
    var list = listProjects();
    var now = new Date().toISOString();
    var id = partial.id || uid('proj');
    var existing = null;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        existing = list[i];
        idx = i;
        break;
      }
    }
    var row = {
      id: id,
      title: String(partial.title || '').trim() || 'งานไม่มีชื่อ',
      photoDataUrl:
        partial.photoDataUrl != null
          ? partial.photoDataUrl
          : (existing && existing.photoDataUrl) || null,
      fabric: String(
        partial.fabric != null ? partial.fabric : (existing && existing.fabric) || ''
      ).trim(),
      how: String(
        partial.how != null ? partial.how : (existing && existing.how) || ''
      ).trim(),
      mistake: String(
        partial.mistake != null ? partial.mistake : (existing && existing.mistake) || ''
      ).trim(),
      nextTime: String(
        partial.nextTime != null ? partial.nextTime : (existing && existing.nextTime) || ''
      ).trim(),
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      updatedAt: now
    };
    if (idx >= 0) list[idx] = row;
    else list.unshift(row);
    saveProjects(list);
    return row;
  }

  function deleteProject(id) {
    saveProjects(
      listProjects().filter(function (p) {
        return p.id !== id;
      })
    );
  }

  /* —— Body (V0.1) —— */

  function getBody() {
    return (
      readJson(KEYS.body, null) || {
        bust: '',
        waist: '',
        hip: '',
        height: '',
        notes: '',
        updatedAt: null
      }
    );
  }

  function saveBody(partial) {
    var cur = getBody();
    var row = {
      bust: partial.bust != null ? String(partial.bust) : cur.bust,
      waist: partial.waist != null ? String(partial.waist) : cur.waist,
      hip: partial.hip != null ? String(partial.hip) : cur.hip,
      height: partial.height != null ? String(partial.height) : cur.height,
      notes: partial.notes != null ? String(partial.notes) : cur.notes,
      updatedAt: new Date().toISOString()
    };
    writeJson(KEYS.body, row);
    return row;
  }

  /* —— Patterns (V0.3) —— */

  function listPatterns() {
    var list = readJson(KEYS.patterns, []);
    return Array.isArray(list) ? list : [];
  }

  function savePatterns(list) {
    writeJson(KEYS.patterns, list || []);
  }

  function getPattern(id) {
    var list = listPatterns();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function upsertPattern(partial) {
    var list = listPatterns();
    var now = new Date().toISOString();
    var id = partial.id || uid('pat');
    var existing = null;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        existing = list[i];
        idx = i;
        break;
      }
    }
    var row = {
      id: id,
      name: String(partial.name || '').trim() || 'แพทเทิร์นไม่มีชื่อ',
      note: String(
        partial.note != null ? partial.note : (existing && existing.note) || ''
      ).trim(),
      linkOrNotes: String(
        partial.linkOrNotes != null
          ? partial.linkOrNotes
          : (existing && existing.linkOrNotes) || ''
      ).trim(),
      bodyRef: String(
        partial.bodyRef != null ? partial.bodyRef : (existing && existing.bodyRef) || ''
      ).trim(),
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      updatedAt: now
    };
    if (idx >= 0) list[idx] = row;
    else list.unshift(row);
    savePatterns(list);
    return row;
  }

  function deletePattern(id) {
    savePatterns(
      listPatterns().filter(function (p) {
        return p.id !== id;
      })
    );
  }

  /* —— Fabric calculator (V0.4) —— */

  function getFabricCalc() {
    return (
      readJson(KEYS.fabricCalc, null) || {
        workType: 'bag',
        sizeHint: '',
        fabricWidth: '110',
        seamAllowance: '1.5',
        lengthCm: '',
        widthCm: '',
        updatedAt: null
      }
    );
  }

  function saveFabricCalc(partial) {
    var cur = getFabricCalc();
    var row = {
      workType: partial.workType != null ? String(partial.workType) : cur.workType,
      sizeHint: partial.sizeHint != null ? String(partial.sizeHint) : cur.sizeHint,
      fabricWidth:
        partial.fabricWidth != null ? String(partial.fabricWidth) : cur.fabricWidth,
      seamAllowance:
        partial.seamAllowance != null
          ? String(partial.seamAllowance)
          : cur.seamAllowance,
      lengthCm: partial.lengthCm != null ? String(partial.lengthCm) : cur.lengthCm,
      widthCm: partial.widthCm != null ? String(partial.widthCm) : cur.widthCm,
      updatedAt: new Date().toISOString()
    };
    writeJson(KEYS.fabricCalc, row);
    return row;
  }

  /* —— Builds progress (V0.5) —— */

  function getBuilds() {
    var data = readJson(KEYS.builds, null);
    if (!data || typeof data !== 'object') {
      return { progress: {}, updatedAt: null };
    }
    if (!data.progress || typeof data.progress !== 'object') data.progress = {};
    return data;
  }

  function saveBuilds(data) {
    data.updatedAt = new Date().toISOString();
    writeJson(KEYS.builds, data);
    return data;
  }

  function getBuildProgress(projectId) {
    var data = getBuilds();
    return data.progress[projectId] || { doneSteps: [], completedAt: null };
  }

  function setBuildStepDone(projectId, stepIndex, done) {
    var data = getBuilds();
    var prog = data.progress[projectId] || { doneSteps: [], completedAt: null };
    var set = {};
    for (var i = 0; i < (prog.doneSteps || []).length; i++) {
      set[prog.doneSteps[i]] = true;
    }
    if (done) set[stepIndex] = true;
    else delete set[stepIndex];
    var doneSteps = Object.keys(set)
      .map(Number)
      .filter(function (n) {
        return !isNaN(n);
      })
      .sort(function (a, b) {
        return a - b;
      });
    prog.doneSteps = doneSteps;
    data.progress[projectId] = prog;
    return saveBuilds(data);
  }

  function markBuildComplete(projectId, totalSteps) {
    var data = getBuilds();
    var prog = data.progress[projectId] || { doneSteps: [], completedAt: null };
    var all = [];
    for (var i = 0; i < totalSteps; i++) all.push(i);
    prog.doneSteps = all;
    prog.completedAt = new Date().toISOString();
    data.progress[projectId] = prog;
    return saveBuilds(data);
  }

  /* —— Skills (V0.7) —— */

  var DEFAULT_SKILLS = {
    cut: 0,
    straightSeam: 0,
    finishEdge: 0,
    press: 0,
    zipper: 0,
    hem: 0,
    gather: 0,
    sleeve: 0,
    neckline: 0,
    projectsDone: 0,
    zipperChallenge: 0
  };

  function getSkills() {
    var s = readJson(KEYS.skills, null) || {};
    var out = {};
    for (var k in DEFAULT_SKILLS) {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_SKILLS, k)) {
        out[k] = typeof s[k] === 'number' ? s[k] : DEFAULT_SKILLS[k];
      }
    }
    return out;
  }

  function saveSkills(partial) {
    var cur = getSkills();
    for (var k in partial) {
      if (Object.prototype.hasOwnProperty.call(partial, k) && k in DEFAULT_SKILLS) {
        cur[k] = Math.max(0, Number(partial[k]) || 0);
      }
    }
    writeJson(KEYS.skills, cur);
    return cur;
  }

  function bumpSkill(key, amount) {
    var cur = getSkills();
    if (!(key in DEFAULT_SKILLS)) return cur;
    cur[key] = (cur[key] || 0) + (amount || 1);
    writeJson(KEYS.skills, cur);
    return cur;
  }

  function bumpSkills(map) {
    var cur = getSkills();
    for (var k in map) {
      if (Object.prototype.hasOwnProperty.call(map, k) && k in DEFAULT_SKILLS) {
        cur[k] = (cur[k] || 0) + (Number(map[k]) || 0);
      }
    }
    writeJson(KEYS.skills, cur);
    return cur;
  }


  /* —— Home repairs (V0.3) —— */

  function listRepairs() {
    var list = readJson(KEYS.repairs, []);
    return Array.isArray(list) ? list : [];
  }

  function saveRepairs(list) {
    writeJson(KEYS.repairs, list || []);
  }

  function getRepair(id) {
    var list = listRepairs();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function upsertRepair(partial) {
    var list = listRepairs();
    var now = new Date().toISOString();
    var id = partial.id || uid('repair');
    var existing = null;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        existing = list[i];
        idx = i;
        break;
      }
    }
    var row = {
      id: id,
      categoryId: String(partial.categoryId || (existing && existing.categoryId) || ''),
      problemId: String(partial.problemId || (existing && existing.problemId) || ''),
      wizardId: String(partial.wizardId || (existing && existing.wizardId) || ''),
      title: String(partial.title || (existing && existing.title) || 'งานซ่อม'),
      answers: partial.answers != null ? partial.answers : (existing && existing.answers) || {},
      stepIndex: partial.stepIndex != null ? Number(partial.stepIndex) : (existing && existing.stepIndex) || 0,
      doneSteps: partial.doneSteps != null ? partial.doneSteps : (existing && existing.doneSteps) || [],
      photoBefore: partial.photoBefore !== undefined ? partial.photoBefore : (existing && existing.photoBefore) || null,
      photoAfter: partial.photoAfter !== undefined ? partial.photoAfter : (existing && existing.photoAfter) || null,
      tipNext: String(partial.tipNext != null ? partial.tipNext : (existing && existing.tipNext) || ''),
      methodSummary: String(partial.methodSummary != null ? partial.methodSummary : (existing && existing.methodSummary) || ''),
      diagnosis: partial.diagnosis != null ? partial.diagnosis : (existing && existing.diagnosis) || {},
      completedAt: partial.completedAt !== undefined ? partial.completedAt : (existing && existing.completedAt) || null,
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      updatedAt: now
    };
    if (idx >= 0) list[idx] = row;
    else list.unshift(row);
    saveRepairs(list);
    return row;
  }

  function deleteRepair(id) {
    saveRepairs(
      listRepairs().filter(function (r) {
        return r.id !== id;
      })
    );
  }

  global.YebStore = {
    KEYS: KEYS,
    uid: uid,
    listProjects: listProjects,
    getProject: getProject,
    upsertProject: upsertProject,
    deleteProject: deleteProject,
    getBody: getBody,
    saveBody: saveBody,
    listPatterns: listPatterns,
    getPattern: getPattern,
    upsertPattern: upsertPattern,
    deletePattern: deletePattern,
    getFabricCalc: getFabricCalc,
    saveFabricCalc: saveFabricCalc,
    getBuilds: getBuilds,
    getBuildProgress: getBuildProgress,
    setBuildStepDone: setBuildStepDone,
    markBuildComplete: markBuildComplete,
    getSkills: getSkills,
    saveSkills: saveSkills,
    bumpSkill: bumpSkill,
    bumpSkills: bumpSkills,
    DEFAULT_SKILLS: DEFAULT_SKILLS,
    listRepairs: listRepairs,
    getRepair: getRepair,
    upsertRepair: upsertRepair,
    deleteRepair: deleteRepair
  };
})(typeof window !== 'undefined' ? window : globalThis);
