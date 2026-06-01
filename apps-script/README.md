# RelinkDamage Google Drive Presets

1. Open Google Apps Script and create a new project.
2. Paste `relink-damage-presets.gs` into `Code.gs`.
3. Run `setupRelinkPresetStore` once and approve Google Drive permissions.
4. Open **Executions** or **Logs** and copy:
   - `Relink preset secret`
   - `RelinkDamagePresets folder`
5. Deploy as **Web app**:
   - Execute as: Me
   - Who has access: Anyone
6. Copy the Web App URL.
7. Open the RelinkDamage calculator, press **雲端配置 > 設定**, paste the Web App URL and secret, then press **測試連線**.

The public website never stores the secret in GitHub. It is saved only in the browser localStorage of each device.
