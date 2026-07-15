# How to Upload Media Files into a Specific Directory

This guide shows you how to add images, videos, and other media files to your
project so the website can use them.

## Where media files belong

| Directory | Purpose | How the website reaches it |
|---|---|---|
| `public/assets/ctbc/` | Public website media (logos, campus photos, banners) | `https://your-site/assets/ctbc/your-file.png` |
| `CTBC document/` | Source documents only (PDFs, flyers, spreadsheets) | Not shown on the website — reference material only |
| `attached_assets/` | Files you drop into the chat with the Agent | Used by the Agent when building for you |

For anything you want visitors to see, use **`public/assets/ctbc/`**.
(Example already there: `public/assets/ctbc/ctbc-logo.png`.)

## Step-by-step: Upload a media file

**Step 1 — Open the file panel.**
In your Replit workspace, click the **Files** icon (page icon) in the left
sidebar so you can see the project's folders.

**Step 2 — Find the target folder.**
Expand the folders in this order: `public` → `assets` → `ctbc`.

**Step 3 — Upload your file.**
Click the **three-dot menu (⋮)** next to the `ctbc` folder and choose
**Upload file** (or **Upload folder** for many files at once). You can also
simply **drag and drop** the file from your computer straight onto the
`ctbc` folder.

**Step 4 — Rename the file (recommended).**
Use short, lowercase names with hyphens and no spaces or special characters:
- Good: `campus-main.jpg`, `dormitory-room.png`, `student-life-01.jpg`
- Avoid: `WhatsApp Image 2026-06-28 at 15.03.50.jpeg`

To rename: click the three-dot menu next to the file → **Rename**.

**Step 5 — Confirm the file is in the right place.**
The file should now appear as, for example:
`public/assets/ctbc/campus-main.jpg`

**Step 6 — Check it loads in the browser.**
Open your website preview and add the path to the end of the address:
`/assets/ctbc/campus-main.jpg`
If the image appears, the upload worked.

**Step 7 — Tell the Agent to use it (optional).**
If you want the image placed on a page, just say for example:
"Use `/assets/ctbc/campus-main.jpg` as the campus photo on the programs page."

## Tips

- **Supported formats:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg` for images;
  `.mp4`, `.webm` for video; `.pdf` for downloadable documents.
- **Keep files small:** aim for under 1 MB per photo (use JPG or WebP for
  photos, PNG or SVG for logos). Large files make pages load slowly.
- **Grouping:** you can create subfolders, e.g. `public/assets/ctbc/campus/`
  → served at `/assets/ctbc/campus/...`.
- **Replacing a file:** upload a new file with the same name — it overwrites
  the old one and the website updates automatically.
- **After publishing:** the same paths work on your live site; just publish
  again after adding new files so they are included.
