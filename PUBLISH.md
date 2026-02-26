# Publish to GitHub

Your code is committed locally. To publish it as the **Car Discovery Platform** project:

## 1. Create the new repository on GitHub

1. Go to [github.com/new](https://github.com/new).
2. Set **Repository name** to: `car-discovery-platform`
3. Set **Description** (optional): `Car discovery platform with dealer and admin dashboards`
4. Choose **Public** (or Private).
5. **Do not** add a README, .gitignore, or license (this project already has them).
6. Click **Create repository**.

## 2. Push your code

From the project root (`car-discovery`):

```bash
git push -u origin main
```

If GitHub prompts for authentication, use a [Personal Access Token](https://github.com/settings/tokens) (recommended) or SSH by changing the remote:

```bash
git remote set-url origin git@github.com:abhishek2996/car-discovery-platform.git
git push -u origin main
```

Your project will be live at: **https://github.com/abhishek2996/car-discovery-platform**
