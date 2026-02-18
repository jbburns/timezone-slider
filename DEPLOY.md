# Deployment Guide

Follow these steps to deploy the Timezone Slider to GitHub Pages:

## 1. Initial Setup
1. Ensure your repository is named `timezone-slider`.
2. Push the latest changes (including the new `.github/workflows/deploy.yml`) to the `main` branch.

## 2. Trigger Deployment
1. Go to your GitHub repository.
2. Click on the **Actions** tab.
3. You should see a workflow named "Deploy to GitHub Pages" running.
4. Once it finishes, a new branch `gh-pages` will be created automatically.

## 3. GitHub Pages Settings
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, ensure it is set to "Deploy from a branch".
3. Under **Branch**, select `gh-pages` and folder `/ (root)`.
4. Click **Save**.

## 4. Verify PWA Offline Support
1. Visit `https://jbburns.github.io/timezone-slider/`.
2. **First Load**: Ensure you are online. Confirm the app loads.
3. **SW Activation**: Wait a few seconds for the Service Worker to register (you should see "App ready to work offline" in the console).
4. **Go Offline**: Enable Airplane Mode on your device.
5. **Reload**: Reload the page. It should now load instantly from the cache!

> [!NOTE]
> Since GitHub Pages provides HTTPS by default, the Service Worker will register without any issues on your iPhone.
