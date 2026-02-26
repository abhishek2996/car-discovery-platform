# Git: Fresh login & push (car-discovery-platform)

Your **cached GitHub account has been removed** from this machine. Follow these steps to sign in with the correct account and push.

---

## 1. Set your Git identity (optional but recommended)

Use the name and email of the GitHub account you want to push with (e.g. **abhishek2996**):

```bash
cd "/Volumes/docker/Cursor Projects/Project 2 - Car discovery/car-discovery"

# Replace with your name and the email linked to abhishek2996
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

This only affects this repo. To set it for all repos, add `--global`:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

---

## 2. Push — Git will ask you to sign in

```bash
cd "/Volumes/docker/Cursor Projects/Project 2 - Car discovery/car-discovery"
git push -u origin main
```

- A browser or login window may open, or Git may ask for **username** and **password** in the terminal.
- **Username:** `abhishek2996`
- **Password:** use a **Personal Access Token (PAT)**, not your GitHub password.  
  Create one: [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) (classic, with `repo` scope).

After you sign in successfully, your credentials are saved again and future pushes won’t ask until you clear them.

---

## 3. If Cursor still uses an old account

- Sign out of GitHub in Cursor: **Cursor Settings → Account** (or **Code → Preferences → Settings**) and sign out of GitHub if listed.
- Or run the push from the **Terminal** (inside Cursor or macOS Terminal) so Git uses the account you just logged in with.

---

## Remote

- **origin:** `https://github.com/abhishek2996/car-discovery-platform.git`
- **Repo:** https://github.com/abhishek2996/car-discovery-platform
