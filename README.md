# Layo

Layo is a phone-first prototype for trying out a room layout before you move a thing. Scan your room, move things around, and see what each choice gives and takes.

**Open it on your phone:** https://puruvats1.github.io/layo-final-version/

## Put it on your home screen

- **Android (Chrome):** open the link, then the menu, then **Install app** (or **Add to Home screen**).
- **iPhone (Safari):** open the link, tap **Share**, then **Add to Home Screen**.

## Permissions

The app asks only when you use the feature, and only over HTTPS (the link above is).

- **Motion sensor (look around by moving your phone):** on iPhone, tap the orbit button in the editor, or **Got it** on the scan page, and allow **Motion & Orientation**. On Android it works without a prompt.
- **Microphone (the mic in the prompt bar):** tap it and allow the microphone. It uses your browser's speech recognition, so it needs a connection. On iPhone it works in Safari; it isn't available once the app is on the home screen.
- **Camera (the scan page's camera option):** tap the camera button and allow the camera.

## Run it yourself

```
npm install
npm run dev       # http://localhost:3000
npm run build     # the built app is in dist/
```

The published app runs on scripted answers. To use a local model, run Ollama on the same machine and open the app with `?llm=on`.

The spec for the prototype is in `spec/`, and the source documents are in `docs/`.
