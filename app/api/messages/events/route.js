import { actor, signal } from "../../../../modules/messaging/messaging.service";
import { endpoint } from "../../../../modules/messaging/messaging-http";

export const maxDuration = 30;
export const GET = endpoint(async (request) => {
  const user = await actor();
  let stopped = false;
  let timer;
  let finish;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(timer);
    request.signal.removeEventListener("abort", stop);
    finish?.();
  };
  const stream = new ReadableStream({
    start(controller) {
      finish = () => controller.close();
      request.signal.addEventListener("abort", stop, { once: true });
      if (request.signal.aborted) { stop(); return; }
      const encoder = new TextEncoder();
      const deadline = Date.now() + 22000;
      let previous;
      const tick = async () => {
        if (stopped) return;
        try {
          const state = JSON.stringify(await signal(user));
          if (stopped) return;
          controller.enqueue(encoder.encode(state === previous ? ": keep-alive\n\n" : "data: " + state + "\n\n"));
          previous = state;
          if (Date.now() < deadline) timer = setTimeout(tick, 3000);
          else stop();
        } catch { if (!stopped) stop(); }
      };
      controller.enqueue(encoder.encode("retry: 2500\n\n"));
      void tick();
    },
    cancel() { finish = null; stop(); },
  });
  return new Response(stream, { headers: {
    "Content-Type": "text/event-stream", "Cache-Control": "private, no-store, no-transform", "X-Accel-Buffering": "no",
  } });
});

