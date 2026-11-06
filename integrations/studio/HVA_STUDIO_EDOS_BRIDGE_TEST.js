/**
 * HVA EDOS -> Learning Studio: parent-window bridge, TEST ONLY.
 * Not loaded by index.html. Never sends EDOS sessionToken to Studio.
 * Caller must supply an authorizedSend(task) implementation bound to the
 * authenticated EDOS context / TEST backend. No default endpoint.
 */
(function (root) {
  'use strict';
  const STUDIO_URL = 'https://nvthahv03-cell.github.io/HVA-LEARNING-STUDIO/';
  const STUDIO_ORIGIN = 'https://nvthahv03-cell.github.io';
  const STUDIO_PATH = '/HVA-LEARNING-STUDIO/';
  const PROTOCOL = 'hva-studio-test-1';
  const VALID_ACTION = 'hva_studio_ai_generate';
  const MAX_PENDING = 1;
  function open({ authorizedSend, targetUrl = STUDIO_URL } = {}) {
    if (typeof authorizedSend !== 'function') throw new Error('Chưa có cầu nối Backend được xác thực.');
    const u = new URL(targetUrl, root.location.href);
    if (u.origin !== STUDIO_ORIGIN || !u.pathname.startsWith(STUDIO_PATH) || u.search || u.hash) {
      throw new Error('Đường dẫn Studio không được phép.');
    }
    const studioWindow = root.open(u.href, 'hvaLearningStudioTest');
    if (!studioWindow) throw new Error('Trình duyệt đã chặn cửa sổ Studio.');
    const channel = root.crypto.randomUUID();
    let closed = false;
    let pending = 0;
    const started = Date.now();
    function isRightWindow(event) {
      if (closed || event.origin !== STUDIO_ORIGIN || event.source !== studioWindow) return false;
      try { return studioWindow.location.origin === STUDIO_ORIGIN && studioWindow.location.pathname.startsWith(STUDIO_PATH); }
      catch (_) { return false; }
    }
    function send(type, value) {
      if (!closed && !studioWindow.closed) studioWindow.postMessage({ protocol: PROTOCOL, channel, type, ...value }, STUDIO_ORIGIN);
    }
    async function receive(event) {
      if (!isRightWindow(event)) return;
      const msg = event.data;
      if (!msg || msg.protocol !== PROTOCOL || typeof msg.type !== 'string') return;
      if (msg.type === 'HELLO') {
        if (Date.now() - started > 30 * 60 * 1000) return;
        send('READY', { ready: true });
        return;
      }
      if (msg.type !== 'GENERATE' || msg.channel !== channel) return;
      if (pending >= MAX_PENDING) { send('RESULT', { id: msg.id, result: { success: false, message: 'Đang xử lý yêu cầu trước đó.' } }); return; }
      if (typeof msg.id !== 'string' || !/^studio-[A-Za-z0-9-]{12,96}$/.test(msg.id) ||
          !msg.task || typeof msg.task !== 'object' || Array.isArray(msg.task) ||
          msg.task.action !== VALID_ACTION) return;
      pending++;
      try {
        // Clone only approved task fields. Never pass role/model/keys from Studio.
        const t = msg.task;
        const request = {
          action: VALID_ACTION, requestId: msg.id,
          taskType: t.taskType, program: t.program, subject: t.subject,
          grade: t.grade, topic: t.topic, input: t.input, outputFormat: t.outputFormat
        };
        const response = await authorizedSend(request);
        send('RESULT', { id: msg.id, result: response });
      } catch (_) {
        send('RESULT', { id: msg.id, result: { success: false, message: 'Không thể kết nối Backend thử nghiệm.' } });
      } finally { pending--; }
    }
    root.addEventListener('message', receive);
    return {
      window: studioWindow,
      close() {
        if (closed) return;
        closed = true;
        root.removeEventListener('message', receive);
        // Do not forcibly close a user-owned Studio tab.
      }
    };
  }
  root.HVA_STUDIO_EDOS_BRIDGE_TEST = Object.freeze({ open });
})(window);
