/**
 * Yeb Sewing Companion — local schema (V0.1)
 * Keys live in localStorage only. Ai CPU WEB may extend; keep these fields stable.
 */
(function (global) {
  'use strict';

  var KEYS = {
    projects: 'yeb.projects.v1',
    body: 'yeb.body.v1'
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

  /** @typedef {{ id:string, title:string, photoDataUrl:?string, fabric:string, how:string, mistake:string, nextTime:string, createdAt:string, updatedAt:string }} Project */

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
      photoDataUrl: partial.photoDataUrl != null ? partial.photoDataUrl : existing && existing.photoDataUrl || null,
      fabric: String(partial.fabric != null ? partial.fabric : (existing && existing.fabric) || '').trim(),
      how: String(partial.how != null ? partial.how : (existing && existing.how) || '').trim(),
      mistake: String(partial.mistake != null ? partial.mistake : (existing && existing.mistake) || '').trim(),
      nextTime: String(partial.nextTime != null ? partial.nextTime : (existing && existing.nextTime) || '').trim(),
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      updatedAt: now
    };
    if (idx >= 0) list[idx] = row;
    else list.unshift(row);
    saveProjects(list);
    return row;
  }

  function deleteProject(id) {
    var list = listProjects().filter(function (p) {
      return p.id !== id;
    });
    saveProjects(list);
  }

  /**
   * Body measurements in cm.
   * { bust, waist, hip, height, notes, updatedAt }
   */
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

  global.YebStore = {
    KEYS: KEYS,
    listProjects: listProjects,
    getProject: getProject,
    upsertProject: upsertProject,
    deleteProject: deleteProject,
    getBody: getBody,
    saveBody: saveBody
  };
})(typeof window !== 'undefined' ? window : globalThis);
